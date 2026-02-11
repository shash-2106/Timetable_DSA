import React, { useState, useEffect } from 'react';

const TimetableGrid = ({ role, branch, semester, section, teacherQuery, onBack, date }) => {
  const [timetableData, setTimetableData] = useState(null);
  const [overrides, setOverrides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teacherName, setTeacherName] = useState(teacherQuery || '');
  const [showSearch, setShowSearch] = useState(!teacherQuery);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Master Schedule
        const resMain = await fetch(`/data.json?t=${Date.now()}`);
        const dataMain = await resMain.json();

        // 2. Fetch Daily Overrides
        const resOver = await fetch('/api/daily-overrides');
        const dataOver = await resOver.json();

        setTimetableData(dataMain);
        setOverrides(dataOver);
        setLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '50px', color: 'white', fontSize: '1.2rem' }}>Loading Schedule...</div>;
  if (!timetableData) return <div className="error-banner" style={{ fontSize: '1.2rem' }}>Error: data.json not found. <br /><span style={{ fontSize: '0.9rem' }}>Please generate the timetable in Admin Panel first.</span></div>;

  const times = ["09:00", "10:00", "BREAK", "11:30", "12:30", "LUNCH", "02:30", "03:30"];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // HELPER: Check for Overrides
  const getOverride = (targetBranch, targetSem, targetSec, day, slot) => {
    if (!date) return null; // No date selected = No overrides shown
    return overrides.find(o =>
      o.date === date &&
      o.branch === targetBranch &&
      o.sem === targetSem &&
      o.section === targetSec &&
      o.day === day &&
      o.slot === slot
    );
  };

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

  const renderTable = (gridData, contextBranch, contextSem, contextSec) => (
    <div className="timetable-container" style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
        <thead>
          <tr>
            <th style={{ padding: '15px', background: '#334155', borderBottom: '2px solid #475569', color: '#cbd5e1' }}>Day</th>
            {times.map((t, i) => <th key={i} style={{ padding: '15px', background: '#334155', borderBottom: '2px solid #475569', color: '#cbd5e1' }}>{t}</th>)}
          </tr>
        </thead>
        <tbody>
          {gridData.map((row, dayIdx) => (
            <tr key={dayIdx}>
              <td className="day-col" style={{ padding: '15px', border: '1px solid #334155', background: '#1e293b', fontWeight: 'bold', color: '#60a5fa' }}>{days[dayIdx]}</td>
              {row.map((cellObj, slotIdx) => {
                let displayContent;
                let isFixed = false;

                if (typeof cellObj === 'object' && cellObj !== null) {
                  displayContent = cellObj.content;
                  isFixed = cellObj.isFixed;
                } else {
                  displayContent = cellObj;
                }

                let bgStyle = { padding: '15px', border: '1px solid #334155', textAlign: 'center', color: '#e2e8f0', minWidth: '100px', position: 'relative' };

                // --- OVERRIDE LOGIC ---
                // If we are in STUDENT mode, we know exact Branch/Sem/Sec
                if (role === 'STUDENT') {
                  const override = getOverride(contextBranch, contextSem, contextSec, dayIdx, slotIdx);
                  if (override) {
                    displayContent = `${override.subject} (${override.type})\n${override.teacher}`;
                    bgStyle.border = '2px solid #f59e0b'; // Highlight
                    bgStyle.background = 'rgba(245, 158, 11, 0.2)';
                  }
                }

                // If in TEACHER mode, 'cell' might already be modified by traverse check below 
                // but we also need to check if *this teacher* has an override elsewhere.
                // The Teacher View logic handles grid construction manually, so we inject overrides there.

                if (displayContent === "FREE") displayContent = "-";

                if (displayContent === "BREAK" || displayContent === "LUNCH") {
                  bgStyle.background = '#2d2d2d';
                  bgStyle.color = '#64748b';
                  bgStyle.fontStyle = 'italic';
                } else if (displayContent !== "-" && !displayContent.includes("BREAK")) {
                  if (!bgStyle.background) {
                    if (isFixed) {
                      bgStyle.background = 'rgba(16, 185, 129, 0.15)';
                      bgStyle.border = '1px solid #059669';
                      bgStyle.color = '#6ee7b7';
                    } else {
                      bgStyle.background = 'rgba(59, 130, 246, 0.15)';
                      bgStyle.color = '#93c5fd';
                    }
                    bgStyle.fontWeight = '500';
                  }
                }

                return <td key={slotIdx} style={bgStyle}>
                  {displayContent}
                  {isFixed && <span style={{ position: 'absolute', top: '2px', right: '2px', fontSize: '0.8rem' }}>🔒</span>}
                  {/* Badge for Override */}
                  {role === 'STUDENT' && getOverride(contextBranch, contextSem, contextSec, dayIdx, slotIdx) &&
                    <span style={{ position: 'absolute', top: '2px', right: '2px', fontSize: '0.7rem', background: '#f59e0b', color: 'black', padding: '2px 4px', borderRadius: '4px' }}>EXTRA</span>
                  }
                </td>;
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
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ color: '#60a5fa', margin: 0 }}>{branch} - {semName} - {secName}</h2>
          {date && <p style={{ color: '#94a3b8' }}>Viewing Schedule for: {date}</p>}
        </div>
        {renderTable(sectionNode.grid, branch, semName, secName)}
      </div>
    );
  };

  // --- TEACHER VIEW ---
  const renderTeacherView = () => {
    if (showSearch) {
      return (
        <div className="wizard-container" style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center', padding: '40px' }}>
          <h3 style={{ fontSize: '2rem', marginBottom: '20px' }}>Find Faculty Schedule</h3>
          <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
            <input className="large-input" placeholder="Enter Name" value={teacherName} onChange={e => setTeacherName(e.target.value)} style={{ padding: '15px', fontSize: '1.2rem', width: '100%', borderRadius: '8px', border: '2px solid #475569', background: '#0f172a', color: 'white' }} />
            <button className="btn-primary" onClick={() => setShowSearch(false)} style={{ padding: '15px 30px', fontSize: '1.2rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Search</button>
          </div>
        </div>
      );
    }

    let myGrid = Array(5).fill(null).map(() => Array(8).fill("-"));
    let found = false;
    const query = teacherName.trim().toLowerCase();

    // 1. INJECT OVERRIDES first (so they appear even if Master has nothing)
    if (date) {
      overrides.forEach(o => {
        if (o.date === date && o.teacher.toLowerCase() === query) {
          const shortSem = o.sem.replace('Semester_', 'Sem');
          const shortSec = o.section.replace('Sec_', '');
          myGrid[o.day][o.slot] = `${o.subject} (${o.type})\n(${shortSem}-${shortSec}) [EXTRA]`;
          found = true;
        }
      });
    }

    // 2. Traversal for Master Schedule
    const traverseAndSearch = (node, branchName = '', semName = '') => {
      if (!node) return;
      let currentBranch = branchName;
      let currentSem = semName;

      if (node.type === 1) currentBranch = node.name; // Branch Node
      if (node.type === 2) currentSem = node.name;    // Sem Node

      if (node.type === 3 && node.grid) {
        // Section Node
        node.grid.forEach((dayRow, dayIndex) => {
          dayRow.forEach((cell, slotIndex) => {
            let subject;
            if (typeof cell === 'object' && cell !== null) {
              subject = cell.content;
            } else {
              subject = cell;
            }

            if (subject && subject !== "FREE" && !subject.includes("BREAK") && !subject.includes("LUNCH")) {
              const parts = subject.split('\n');
              const assignedTeacher = parts.length > 1 ? parts[1] : "";

              if (assignedTeacher.trim().toLowerCase().includes(query)) {
                // MATCH in Master Schedule

                // CHECK FOR SWAP OUT:
                // Is there an override for THIS specific slot (Branch/Sem/Sec/Day/Slot)?
                const isSwappedOut = overrides.some(o =>
                  o.date === date &&
                  o.branch === currentBranch &&
                  o.sem === currentSem &&
                  o.section === node.name &&
                  o.day === dayIndex &&
                  o.slot === slotIndex
                  // If an override exists here, it means the text in this slot is CHANGED.
                  // Since we already matched "assignedTeacher" (Original), any override means 
                  // the Original teacher is NO LONGER teaching this.
                );

                if (!isSwappedOut && !myGrid[dayIndex][slotIndex].includes("[EXTRA]")) {
                  const cleanSub = subject.split('(')[0].trim();
                  const shortSem = currentSem.replace('Semester_', 'Sem');
                  const shortSec = node.name.replace('Sec_', '');
                  myGrid[dayIndex][slotIndex] = `${cleanSub} (Lecture)\n(${shortSem}-${shortSec})`;
                  found = true;
                }
              }
            }
            // Preserve Breaks
            if (subject === "BREAK" && !myGrid[dayIndex][slotIndex]) myGrid[dayIndex][slotIndex] = "BREAK";
            if (subject === "LUNCH" && !myGrid[dayIndex][slotIndex]) myGrid[dayIndex][slotIndex] = "LUNCH";
          });
        });
      }
      if (node.children) node.children.forEach(child => traverseAndSearch(child, currentBranch, currentSem));
    };

    traverseAndSearch(timetableData);

    return (
      <div className="fade-in">
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ color: '#facc15', fontSize: '2rem' }}>Schedule: {teacherName}</h2>
          {date && <p style={{ color: '#94a3b8' }}>Viewing Schedule for: {date}</p>}
        </div>
        {!found ? <div className="error-banner" style={{ fontSize: '1.5rem' }}>No classes found for "{teacherName}".</div> : renderTable(myGrid, null, null, null)}
      </div>
    );
  };

  return (
    <div>{role === 'STUDENT' ? renderStudentView() : renderTeacherView()}</div>
  );
};

export default TimetableGrid;