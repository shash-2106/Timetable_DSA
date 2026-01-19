import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TimetableGrid from '../components/TimetableGrid';

const Teacher = () => {
  const navigate = useNavigate();

  // FORM STATE
  const [submitted, setSubmitted] = useState(false);
  const [branch, setBranch] = useState('CS');
  const [teacherName, setTeacherName] = useState('');

  const branches = ["CS", "CY", "CI", "CD", "IS", "AS", "BT", "CH", "CV", "EC", "EE", "EI", "ET", "IM", "ME"];

  const handleSubmit = () => {
    if(!teacherName) return alert("Please enter your name");
    setSubmitted(true);
  };

  // --- STYLES ---
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
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    backdropFilter: 'blur(25px)',
    borderRadius: '40px',
    padding: '60px 80px',
    boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '900px',
    width: '100%',
    animation: 'fadeIn 0.6s ease-out',
    marginTop: '60px'
  };

  const fullScreenGlassStyle = {
      ...glassContainerStyle,
      maxWidth: '1800px',
      flex: 1,
      marginTop: 0,
      padding: '40px 60px',
      overflow: 'hidden'
  };

  const headerTitleStyle = {
    fontSize: '5rem',
    fontWeight: '900',
    margin: 0,
    background: 'linear-gradient(to right, #10b981, #34d399)', // Faculty Theme (Green)
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-2px'
  };

  const bigLabelStyle = {
    fontSize: '1.8rem',
    color: '#cbd5f5',
    marginBottom: '15px',
    display: 'block',
    fontWeight: '500'
  };

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
    padding: '25px 50px',
    fontSize: '1.8rem',
    borderRadius: '20px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '700',
    transition: 'all 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px'
  };

  const homeBtnStyle = {
      padding: '15px 35px',
      fontSize: '1.5rem',
      borderRadius: '20px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '600',
      background: 'rgba(255,255,255,0.1)', 
      color: '#cbd5f5'
  };

  if (submitted) {
    return (
        <div style={pageStyle}>
             <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%', maxWidth:'1800px', marginBottom:'30px'}}>
                 <h1 style={headerTitleStyle}>Faculty Portal</h1>
                 <div style={{display:'flex', gap:'20px'}}>
                     <button style={homeBtnStyle} onClick={() => navigate('/')}>🏠 Home</button>
                     <button style={{...homeBtnStyle, border:'1px solid rgba(255,255,255,0.2)'}} onClick={() => setSubmitted(false)}>← New Search</button>
                 </div>
             </div>

             <div style={fullScreenGlassStyle}>
                 <div style={{
                    height: '90vh',
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center',
                    width: '100%'
                 }}>
                     {/* ENLARGED TIMETABLE GRID */}
                     <div style={{width:'100%', overflowX:'auto', transform: 'scale(1.05)', transformOrigin: 'top left', width: '95%'}}>
                        <TimetableGrid 
                            role="TEACHER" 
                            teacherQuery={teacherName}
                            onBack={() => setSubmitted(false)}
                        />
                     </div>
                 </div>
             </div>
        </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%', maxWidth:'1800px'}}>
         <h1 style={headerTitleStyle}>Faculty Portal</h1>
         <button style={homeBtnStyle} onClick={() => navigate('/')}>🏠 Home</button>
      </div>

      <div style={glassContainerStyle}>
        <h2 style={{fontSize:'3rem', textAlign:'center', marginBottom:'50px', color:'white'}}>View Workload</h2>
        
        <div style={{display:'grid', gap:'40px'}}>
            <div>
                <label style={bigLabelStyle}>Department</label>
                <select value={branch} onChange={e => setBranch(e.target.value)} style={bigInputStyle}>
                    {branches.map(b => <option key={b} value={b}>{b} Engineering</option>)}
                </select>
            </div>

            <div>
                <label style={bigLabelStyle}>Faculty Name</label>
                <input 
                    placeholder="e.g. Prof_Smith" 
                    value={teacherName} 
                    onChange={e => setTeacherName(e.target.value)} 
                    style={{...bigInputStyle, cursor:'text'}}
                />
            </div>

            <button style={{...largeBtnStyle, background:'#10b981', color:'white', marginTop:'30px', boxShadow:'0 20px 40px rgba(16, 185, 129, 0.3)'}} onClick={handleSubmit}>
                Search Schedule
            </button>
        </div>
      </div>
    </div>
  );
};

export default Teacher;