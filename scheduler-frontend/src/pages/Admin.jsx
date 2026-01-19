import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateCInput } from '../utils/generateInputFile';
import TimetableGrid from '../components/TimetableGrid';

const Admin = () => {
  const navigate = useNavigate();

  // --- STATE & PERSISTENCE ---
  const [allSemesterData, setAllSemesterData] = useState(() => {
    const saved = localStorage.getItem('adminDraft');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [showSuccess, setShowSuccess] = useState(() => {
    return localStorage.getItem('adminSuccess') === 'true';
  });

  // LANDING LOGIC: Priority -> Success Page > Dashboard > Step 1
  const [step, setStep] = useState(() => {
    const success = localStorage.getItem('adminSuccess') === 'true';
    const saved = localStorage.getItem('adminDraft');
    const parsed = saved ? JSON.parse(saved) : [];
    
    if (success) return 3; 
    if (parsed.length > 0) return 3;
    return 1;
  });

  const [editIndex, setEditIndex] = useState(null);
  const [viewAllMode, setViewAllMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false); 

  // FORM INPUTS
  const branches = ["CS", "CY", "CI", "CD", "IS", "AS", "BT", "CH", "CV", "EC", "EE", "EI", "ET", "IM", "ME"];
  const [branch, setBranch] = useState('CS');
  const [cycle, setCycle] = useState('Odd');
  const semesterOptions = cycle === 'Odd' ? [1, 3, 5, 7] : [2, 4, 6, 8];
  const [currentSem, setCurrentSem] = useState(semesterOptions[0]);
  const [numSections, setNumSections] = useState(3);
  const [subjects, setSubjects] = useState([]);
  
  // TEMP SUBJECT INPUTS
  const [tempSubName, setTempSubName] = useState('');
  const [tempSubType, setTempSubType] = useState('Lecture');
  const [tempSubHours, setTempSubHours] = useState(4);

  // EFFECTS
  useEffect(() => { setCurrentSem(cycle === 'Odd' ? 1 : 2); }, [cycle]);
  
  useEffect(() => { 
      if (allSemesterData.length > 0) {
          localStorage.setItem('adminDraft', JSON.stringify(allSemesterData));
      }
  }, [allSemesterData]);

  // --- ENLARGED STYLES ---
  
  const pageStyle = {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #020617 0%, #0f172a 60%, #1e293b 100%)',
    color: 'white',
    overflow: 'hidden',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    padding: '30px' 
  };

  const glassContainerStyle = {
    flex: 1,
    width: '100%',
    maxWidth: '1800px', 
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    backdropFilter: 'blur(25px)',
    borderRadius: '40px',
    padding: '40px 60px',
    boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden', 
    animation: 'fadeIn 0.6s ease-out',
    position: 'relative'
  };

  const headerTitleStyle = {
    fontSize: '5rem',
    fontWeight: '900',
    margin: 0,
    background: 'linear-gradient(to right, #60a5fa, #c084fc)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-2px'
  };

  const sectionTitleStyle = {
    fontSize: '3rem',
    color: 'white',
    marginBottom: '40px',
    borderBottom: '2px solid rgba(255,255,255,0.1)',
    paddingBottom: '20px'
  };

  const bigLabelStyle = {
    fontSize: '1.8rem',
    color: '#cbd5f5',
    marginBottom: '15px',
    display: 'block',
    fontWeight: '500'
  };

  // DROPDOWN/INPUT STYLE (Dark BG for text visibility)
  const bigInputStyle = {
    width: '100%',
    padding: '25px 30px',
    fontSize: '1.6rem',
    background: '#1e293b', 
    border: '2px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '20px',
    color: 'white',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
    cursor: 'pointer'
  };

  const largeBtnStyle = {
    padding: '22px 50px',
    fontSize: '1.6rem',
    borderRadius: '20px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '700',
    transition: 'all 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '15px'
  };

  const homeBtnStyle = {
      ...largeBtnStyle, 
      background: 'rgba(255,255,255,0.1)', 
      color: '#cbd5f5', 
      fontSize: '1.5rem',
      padding: '15px 35px'
  };

  // --- LOGIC ---
  const handleCreateSubject = () => {
    if (!tempSubName) return alert("Enter Subject Name");
    setSubjects([...subjects, { id: Date.now(), name: tempSubName, type: tempSubType, hours: parseInt(tempSubHours), teachers: [] }]);
    setTempSubName('');
  };

  const handleAddTeacherToSubject = (idx) => {
    const val = document.getElementById(`t-input-${idx}`).value;
    if (!val) return;
    const upd = [...subjects]; upd[idx].teachers.push(val); setSubjects(upd);
    document.getElementById(`t-input-${idx}`).value = ''; 
  };

  const handleSaveSemester = () => {
    if (subjects.length === 0) return alert("Add at least one subject!");
    const invalid = subjects.find(s => s.teachers.length === 0);
    if (invalid) return alert(`Assign a teacher to ${invalid.name}`);

    const newSem = { branch, cycle, semester: currentSem, sections: numSections, courses: subjects };
    if (editIndex !== null) { const d = [...allSemesterData]; d[editIndex] = newSem; setAllSemesterData(d); setEditIndex(null); } 
    else { setAllSemesterData([...allSemesterData, newSem]); }
    setSubjects([]); setStep(3);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    const content = generateCInput(allSemesterData, branch);
    try {
        const response = await fetch('http://localhost:5000/api/run-engine', {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: content
        });
        const result = await response.json();
        
        if (result.success) {
            setShowSuccess(true);
            localStorage.setItem('adminSuccess', 'true');
        } else {
            alert("Error: " + result.error);
        }
    } catch (err) {
        console.error(err);
        alert("Connection Error: Make sure 'node server.js' is running.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleClearAll = () => {
      localStorage.removeItem('adminDraft');
      localStorage.removeItem('adminSuccess');
      setAllSemesterData([]);
      setShowSuccess(false);
      setStep(1);
  };

  const handleModifyConfig = () => {
      setShowSuccess(false);
      localStorage.removeItem('adminSuccess'); // Allow re-generation
  };

  // --- RENDERERS ---

  if (viewAllMode) {
      return (
          <div style={pageStyle}>
              {/* Header inside the page layout */}
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%', maxWidth:'1800px', marginBottom:'30px'}}>
                  <h1 style={headerTitleStyle}>Master Schedule</h1>
                  <div style={{display:'flex', gap:'20px'}}>
                      <button style={homeBtnStyle} onClick={() => navigate('/')}>🏠 Home</button>
                      <button style={{...largeBtnStyle, background:'rgba(255,255,255,0.1)', color:'white', border:'1px solid rgba(255,255,255,0.2)'}} onClick={() => setViewAllMode(false)}>← Back</button>
                  </div>
              </div>
              
              <div style={glassContainerStyle}>
                  <div style={{overflowY:'auto', height:'100%', paddingRight:'20px'}}>
                      {allSemesterData.map((sem, i) => (
                          <div key={i}>
                              {Array.from({length: sem.sections}).map((_, secIdx) => {
                                  const secLetter = String.fromCharCode(65 + secIdx);
                                  return (
                                      // ONE TIMETABLE PER SCREEN - ENLARGED
                                      <div key={secLetter} style={{
                                          height: '90vh', // Forces full screen height per table
                                          display: 'flex', 
                                          flexDirection: 'column', 
                                          justifyContent: 'center',
                                          borderBottom: '2px dashed rgba(255,255,255,0.1)',
                                          marginBottom: '80px',
                                          paddingBottom: '40px',
                                          width: '100%' 
                                      }}>
                                          <div style={{marginBottom:'30px'}}>
                                              <span style={{fontSize:'2.2rem', color:'#94a3b8', display:'block', marginBottom:'10px'}}>{sem.branch} • Semester {sem.semester}</span>
                                              <h3 style={{fontSize:'4.5rem', color:'#60a5fa', margin:0}}>Section {secLetter}</h3>
                                          </div>
                                          {/* SCALE TRANSFORM TO FILL SCREEN VISUALLY */}
                                          <div style={{width:'100%', overflowX:'auto', transform: 'scale(1.1)', transformOrigin: 'top left', width: '90%'}}>
                                              <TimetableGrid role="STUDENT" branch={sem.branch} semester={sem.semester} section={`Sec_${secLetter}`} key={Date.now()} />
                                          </div>
                                      </div>
                                  );
                              })}
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      );
  }

  // SUCCESS SCREEN (Step 3 + showSuccess)
  if (step === 3 && showSuccess) {
      return (
          <div style={pageStyle}>
              <div style={glassContainerStyle}>
                  {/* Top Bar inside Glass Container */}
                  <div style={{width:'100%', display:'flex', justifyContent:'flex-end', paddingBottom:'20px'}}>
                      <button style={homeBtnStyle} onClick={() => navigate('/')}>🏠 Home</button>
                  </div>

                  {/* Centered Success Content */}
                  <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center'}}>
                      <div style={{fontSize:'12rem', marginBottom:'40px', animation:'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'}}>🎉</div>
                      <h1 style={{fontSize:'6rem', fontWeight:'900', color:'#4ade80', marginBottom:'30px', textShadow:'0 10px 40px rgba(74, 222, 128, 0.4)'}}>Timetable Generated!</h1>
                      <p style={{fontSize:'2.2rem', color:'#cbd5f5', marginBottom:'80px', maxWidth:'800px', lineHeight:'1.5'}}>The engine has successfully optimized and processed your academy schedule.</p>
                      
                      <div style={{display:'flex', gap:'50px'}}>
                          <button style={{...largeBtnStyle, background:'#3b82f6', color:'white', padding:'30px 70px', fontSize:'2rem', boxShadow:'0 20px 40px rgba(59, 130, 246, 0.3)'}} onClick={() => setViewAllMode(true)}>
                              📅 View Timetables
                          </button>
                          <button style={{...largeBtnStyle, background:'transparent', border:'3px solid rgba(255,255,255,0.2)', color:'#cbd5f5', padding:'30px 70px', fontSize:'2rem'}} onClick={handleModifyConfig}>
                              ⚙️ Configure More
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // --- MAIN WIZARD LAYOUT ---
  return (
    <div style={pageStyle}>
      {/* HEADER */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%', maxWidth:'1800px', marginBottom:'30px'}}>
          <h1 style={headerTitleStyle}>Admin Portal</h1>
          <button style={homeBtnStyle} onClick={() => navigate('/')}>🏠 Home</button>
      </div>

      <div style={glassContainerStyle}>
          
          {/* STEP 1: CONFIG */}
          {step === 1 && (
             <div style={{height:'100%', display:'flex', flexDirection:'column'}}>
                <h2 style={sectionTitleStyle}>Step 1: Academy Configuration</h2>
                
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'60px', marginTop:'40px'}}>
                    <div><label style={bigLabelStyle}>Branch</label><select value={branch} onChange={e => setBranch(e.target.value)} style={bigInputStyle}>{branches.map(b=><option key={b} value={b}>{b}</option>)}</select></div>
                    <div><label style={bigLabelStyle}>Cycle</label><select value={cycle} onChange={e => setCycle(e.target.value)} style={bigInputStyle}><option value="Odd">Odd (Sem 1,3,5,7)</option><option value="Even">Even (Sem 2,4,6,8)</option></select></div>
                    <div><label style={bigLabelStyle}>Semester</label><select value={currentSem} onChange={e => setCurrentSem(parseInt(e.target.value))} style={bigInputStyle}>{semesterOptions.map(s=><option key={s} value={s}>Sem {s}</option>)}</select></div>
                    <div><label style={bigLabelStyle}>Sections</label><select value={numSections} onChange={e => setNumSections(parseInt(e.target.value))} style={bigInputStyle}>{[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n} Sections</option>)}</select></div>
                </div>

                <div style={{marginTop:'auto', display:'flex', justifyContent:'flex-end'}}>
                    <button style={{...largeBtnStyle, background:'#3b82f6', color:'white', boxShadow:'0 20px 40px rgba(59, 130, 246, 0.3)'}} onClick={() => setStep(2)}>Next Step →</button>
                </div>
             </div>
          )}

          {/* STEP 2: CURRICULUM */}
          {step === 2 && (
             <div style={{height:'100%', display:'flex', flexDirection:'column', overflow:'hidden'}}>
                <h2 style={{...sectionTitleStyle, marginBottom:'30px'}}>Step 2: Curriculum Setup (Sem {currentSem})</h2>
                
                {/* FIXED FORM */}
                <div style={{background:'rgba(0,0,0,0.2)', padding:'40px', borderRadius:'30px', marginBottom:'40px', border:'1px solid rgba(255,255,255,0.05)'}}>
                    <div style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr 200px', alignItems:'end', gap:'35px'}}>
                        <div><label style={bigLabelStyle}>Subject Name</label><input style={bigInputStyle} value={tempSubName} onChange={e => setTempSubName(e.target.value)} placeholder="e.g. Operating Systems"/></div>
                        <div><label style={bigLabelStyle}>Type</label><select style={bigInputStyle} value={tempSubType} onChange={e => setTempSubType(e.target.value)}><option value="Lecture">Lecture</option><option value="Lab">Lab</option></select></div>
                        <div><label style={bigLabelStyle}>Hours</label><input style={bigInputStyle} type="number" value={tempSubHours} onChange={e => setTempSubHours(e.target.value)}/></div>
                        <button style={{...largeBtnStyle, background:'#10b981', color:'white', height:'78px', width:'100%', justifyContent:'center', fontSize:'1.8rem'}} onClick={handleCreateSubject}>Add</button>
                    </div>
                </div>

                {/* SCROLLABLE LIST */}
                <div style={{flex:1, overflowY:'auto', paddingRight:'25px', display:'flex', flexDirection:'column', gap:'35px'}}>
                    {subjects.length === 0 && (
                        <div style={{textAlign:'center', padding:'80px', border:'4px dashed rgba(255,255,255,0.1)', borderRadius:'30px', fontSize:'2rem', color:'rgba(255,255,255,0.3)'}}>
                            No subjects added yet. Use the form above.
                        </div>
                    )}
                    {subjects.map((sub, idx) => (
                        <div key={idx} style={{background:'rgba(255,255,255,0.05)', padding:'40px', borderRadius:'30px', border:'1px solid rgba(255,255,255,0.08)'}}>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px'}}>
                                <div style={{display:'flex', alignItems:'center', gap:'30px'}}>
                                    <strong style={{fontSize:'2.5rem', color:'white'}}>{sub.name}</strong>
                                    <span style={{fontSize:'1.4rem', background:'rgba(59, 130, 246, 0.3)', padding:'10px 20px', borderRadius:'15px', color:'#93c5fd', border:'1px solid rgba(59, 130, 246, 0.4)'}}>{sub.type} • {sub.hours}h</span>
                                </div>
                                <button onClick={()=>{const u=subjects.filter((_,i)=>i!==idx);setSubjects(u)}} style={{...largeBtnStyle, background:'transparent', border:'3px solid #ef4444', color:'#ef4444', padding:'15px 35px', fontSize:'1.4rem'}}>🗑 Remove Subject</button>
                            </div>
                            
                            {/* TEACHERS */}
                            <div style={{display:'flex', flexWrap:'wrap', gap:'25px', marginBottom:'30px'}}>
                                {sub.teachers.map((t,i)=>(
                                    <div key={i} style={{background:'rgba(0,0,0,0.3)', padding:'15px 30px', borderRadius:'18px', fontSize:'1.6rem', color:'#e2e8f0', display:'flex', alignItems:'center', gap:'15px', border:'1px solid rgba(255,255,255,0.1)'}}>
                                        <span>👨‍🏫 {t}</span>
                                        <div onClick={() => {const newT=[...sub.teachers]; newT.splice(i,1); const newS=[...subjects]; newS[idx].teachers=newT; setSubjects(newS);}}
                                            style={{cursor:'pointer', color:'#ef4444', fontWeight:'900', fontSize:'2.2rem', lineHeight:'1', display:'flex', alignItems:'center', justifyContent:'center', width:'45px', height:'45px', borderRadius:'50%', background:'rgba(239,68,68,0.15)'}}>×</div>
                                    </div>
                                ))}
                            </div>
                            
                            <div style={{display:'flex', gap:'30px', maxWidth:'900px'}}>
                                <input id={`t-input-${idx}`} placeholder="New Teacher Name" style={{...bigInputStyle, padding:'18px', fontSize:'1.5rem'}} />
                                <button style={{...largeBtnStyle, background:'#3b82f6', color:'white', fontSize:'1.5rem', padding:'18px 40px'}} onClick={()=>handleAddTeacherToSubject(idx)}>+</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{marginTop:'50px', display:'flex', justifyContent:'space-between', borderTop:'1px solid rgba(255,255,255,0.1)', paddingTop:'40px'}}>
                    <button style={{...largeBtnStyle, background:'transparent', border:'3px solid rgba(255,255,255,0.2)', color:'#cbd5f5'}} onClick={() => setStep(1)}>Back</button>
                    {subjects.length > 0 && <button style={{...largeBtnStyle, background:'#3b82f6', color:'white', boxShadow:'0 20px 40px rgba(59, 130, 246, 0.3)'}} onClick={handleSaveSemester}>Save Semester</button>}
                </div>
             </div>
         )}

         {/* STEP 3: DASHBOARD */}
         {step === 3 && !showSuccess && (
             <div style={{height:'100%', display:'flex', flexDirection:'column'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'50px', borderBottom:'2px solid rgba(255,255,255,0.1)', paddingBottom:'30px'}}>
                    <h2 style={{fontSize:'3.2rem', margin:0, color:'white'}}>Configuration Dashboard</h2>
                    <button onClick={handleClearAll} style={{...largeBtnStyle, background:'#ef4444', color:'white', fontSize:'1.5rem', padding:'18px 40px'}}>Clear All Data</button>
                </div>
                
                <div style={{flex:1, overflowY:'auto', paddingRight:'25px', display:'flex', flexDirection:'column', gap:'40px'}}>
                    {allSemesterData.map((sem, idx) => (
                        <div key={idx} style={{background:'rgba(255,255,255,0.05)', padding:'45px', borderRadius:'30px', cursor:'pointer', border:'1px solid rgba(255,255,255,0.08)', transition:'all 0.2s', display:'flex', justifyContent:'space-between', alignItems:'center'}} 
                             onClick={() => { setEditIndex(idx); setBranch(sem.branch); setCurrentSem(sem.semester); setNumSections(sem.sections); setSubjects(sem.courses); setStep(2); }}>
                            <div>
                                <strong style={{fontSize:'2.8rem', display:'block', marginBottom:'20px', color:'white'}}>{sem.branch} - Sem {sem.semester}</strong>
                                <div style={{color:'#94a3b8', fontSize:'1.8rem'}}>{sem.sections} Sections • {sem.courses.length} Subjects</div>
                            </div>
                            <span style={{fontSize:'1.6rem', background:'rgba(255,255,255,0.1)', padding:'18px 40px', borderRadius:'50px', color:'#cbd5f5', border:'1px solid rgba(255,255,255,0.2)'}}>✎ Edit</span>
                        </div>
                    ))}
                </div>

                <div style={{marginTop:'50px', display:'flex', gap:'50px'}}>
                    <button style={{...largeBtnStyle, background:'transparent', border:'3px solid rgba(255,255,255,0.2)', color:'#cbd5f5'}} onClick={() => setStep(1)}>+ Add Another Semester</button>
                    <button style={{...largeBtnStyle, background:'#10b981', color:'white', flex:1, justifyContent:'center', fontSize:'2rem', boxShadow:'0 20px 40px rgba(16, 185, 129, 0.3)'}} onClick={handleGenerate} disabled={isGenerating}>
                        {isGenerating ? "Running Engine..." : "🚀 Generate Timetable"}
                    </button>
                </div>
             </div>
         )}
      </div>
    </div>
  );
};

export default Admin;