import React, { useState, useEffect } from 'react';

const TimetableGrid = ({ role, branch, semester, section, teacherQuery, onBack }) => { 
  const [timetableData, setTimetableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teacherName, setTeacherName] = useState(teacherQuery || '');
  const [showSearch, setShowSearch] = useState(!teacherQuery);

  useEffect(() => {
    // CACHE BUSTING: Add timestamp to force fresh fetch
    fetch(`/data.json?t=${Date.now()}`) 
      .then((res) => {
        if (!res.ok) throw new Error("File not found");
        return res.json();
      })
      .then((data) => {
        setTimetableData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch Error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{textAlign:'center', padding:'50px', color:'white', fontSize:'1.2rem'}}>Loading Schedule...</div>;
  if (!timetableData) return <div className="error-banner" style={{fontSize:'1.2rem'}}>Error: data.json not found. <br/><span style={{fontSize:'0.9rem'}}>Please generate the timetable in Admin Panel first.</span></div>;

  const times = ["09:00", "10:00", "BREAK", "11:30", "12:30", "LUNCH", "02:30", "03:30"];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // --- HELPER: TREE TRAVERSAL (Find specific section) ---
  const findSectionNode = (root, targetBranch, targetSem, targetSec) => {
      if (!root.children) return null;
      const branchNode = root.children.find(c => c.name === targetBranch);
      if (!branchNode || !branchNode.children) return null;

      const semNode = branchNode.children.find(c => c.name === targetSem);
      if (!semNode || !semNode.children) return null;

      const secNode = semNode.children.find(c => c.name === targetSec);
      return secNode; 
  };

  const renderTable = (gridData) => (
    <div className="timetable-container" style={{overflowX:'auto'}}>
      <table style={{width:'100%', borderCollapse:'collapse', minWidth:'800px'}}>
        <thead>
          <tr>
            <th style={{padding:'15px', background:'#334155', borderBottom:'2px solid #475569', color:'#cbd5e1'}}>Day</th>
            {times.map((t, i) => <th key={i} style={{padding:'15px', background:'#334155', borderBottom:'2px solid #475569', color:'#cbd5e1'}}>{t}</th>)}
          </tr>
        </thead>
        <tbody>
          {gridData.map((row, dayIdx) => (
            <tr key={dayIdx}>
              <td className="day-col" style={{padding:'15px', border:'1px solid #334155', background:'#1e293b', fontWeight:'bold', color:'#60a5fa'}}>{days[dayIdx]}</td>
              {row.map((cell, slotIdx) => {
                let style = { padding: '15px', border: '1px solid #334155', textAlign: 'center', color:'#e2e8f0', minWidth:'100px' };
                if (cell === "FREE") cell = "-";
                
                if (cell === "BREAK" || cell === "LUNCH") {
                    style.background = '#2d2d2d';
                    style.color = '#64748b';
                    style.fontStyle = 'italic';
                } else if (cell !== "-" && !cell.includes("BREAK")) {
                    style.background = 'rgba(59, 130, 246, 0.15)';
                    style.color = '#93c5fd';
                    style.fontWeight = '500';
                }
                
                return <td key={slotIdx} style={style}>{cell}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // --- STUDENT VIEW ---
  const renderStudentView = () => {
    const semName = `Semester_${semester}`;
    const secName = `Sec_${section.split('_')[1]}`; 
    
    const sectionNode = findSectionNode(timetableData, branch, semName, secName);

    if (!sectionNode || !sectionNode.grid) {
      return (
        <div className="error-banner">
            <h3>Timetable Not Found</h3>
            <p>Checked: {branch} &gt; {semName} &gt; {secName}</p>
            <button className="back-btn" onClick={onBack}>Try Different Class</button>
        </div>
      );
    }

    return (
      <div className="fade-in">
         <div style={{marginBottom:'20px'}}>
             <h2 style={{color:'#60a5fa', margin:0}}>{branch} - {semName} - {secName}</h2>
         </div>
         {renderTable(sectionNode.grid)}
      </div>
    );
  };

  // --- TEACHER VIEW (UPDATED LOGIC) ---
  const renderTeacherView = () => {
    if (showSearch) {
        return (
            <div className="wizard-container" style={{maxWidth:'600px', margin:'40px auto', textAlign:'center', padding:'40px'}}>
                <h3 style={{fontSize:'2rem', marginBottom:'20px'}}>Find Faculty Schedule</h3>
                <div style={{display:'flex', gap:'15px', marginTop:'20px'}}>
                    <input className="large-input" placeholder="Enter Name" value={teacherName} onChange={e => setTeacherName(e.target.value)} style={{padding:'15px', fontSize:'1.2rem', width:'100%', borderRadius:'8px', border:'2px solid #475569', background:'#0f172a', color:'white'}} />
                    <button className="btn-primary" onClick={() => setShowSearch(false)} style={{padding:'15px 30px', fontSize:'1.2rem', background:'#3b82f6', color:'white', border:'none', borderRadius:'8px', cursor:'pointer'}}>Search</button>
                </div>
            </div>
        );
    }

    let myGrid = Array(5).fill(null).map(() => Array(8).fill("-")); 
    let found = false;

    // UPDATED TRAVERSAL: Passes 'semName' down the tree
    const traverseAndSearch = (node, semName = '') => {
        if (!node) return;

        // 1. If this is a Semester Node, capture its name (e.g., "Semester_1")
        let currentSem = semName;
        if (node.type === 2) {
            currentSem = node.name;
        }

        // 2. If this is a Section Node, check the grid
        if (node.type === 3 && node.grid) {
            node.grid.forEach((dayRow, dayIndex) => {
                dayRow.forEach((subject, slotIndex) => {
                    if (subject && subject !== "FREE" && subject.toLowerCase().includes(teacherName.toLowerCase())) {
                        const existing = myGrid[dayIndex][slotIndex] === "-" ? "" : myGrid[dayIndex][slotIndex] + "\n";
                        const cleanSub = subject.split('(')[0].trim();
                        
                        // NEW FORMAT: Subject (Sem1-A)
                        const shortSem = currentSem.replace('Semester_', 'Sem'); // "Semester_1" -> "Sem1"
                        const shortSec = node.name.replace('Sec_', '');        // "Sec_A" -> "A"
                        
                        myGrid[dayIndex][slotIndex] = `${existing}${cleanSub} (${shortSem}-${shortSec})`;
                        found = true;
                    }
                    if(subject === "BREAK") myGrid[dayIndex][slotIndex] = "BREAK";
                    if(subject === "LUNCH") myGrid[dayIndex][slotIndex] = "LUNCH";
                });
            });
        }

        // 3. Recurse children
        if (node.children) {
            node.children.forEach(child => traverseAndSearch(child, currentSem));
        }
    };

    traverseAndSearch(timetableData);

    return (
      <div className="fade-in">
         <div style={{marginBottom:'20px'}}>
             <h2 style={{color:'#facc15', fontSize:'2rem'}}>Schedule: {teacherName}</h2>
         </div>
         {!found ? <div className="error-banner" style={{fontSize:'1.5rem'}}>No classes found for "{teacherName}".</div> : renderTable(myGrid)}
      </div>
    );
  };

  return (
    <div>{role === 'STUDENT' ? renderStudentView() : renderTeacherView()}</div>
  );
};

export default TimetableGrid;