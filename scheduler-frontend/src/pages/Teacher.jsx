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
    if (!teacherName) return alert("Please enter your name");
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

  // --- BOOKING STATE ---
  const [showBooking, setShowBooking] = useState(false);
  const [bookBranch, setBookBranch] = useState('CS');
  const [bookSem, setBookSem] = useState('1');
  const [bookSec, setBookSec] = useState('Sec_A');
  const [bookDay, setBookDay] = useState('0'); // 0-4
  const [bookSlot, setBookSlot] = useState('0'); // 0-7
  const [bookSub, setBookSub] = useState('');
  const [bookType, setBookType] = useState('Lecture');

  const handleBookSlot = async () => {
    // Validation
    if (!bookSub) return alert("Enter Subject Name");

    try {
      const payload = {
        branch: bookBranch,
        sem: `Semester_${bookSem}`,
        section: bookSec,
        day: parseInt(bookDay),
        slot: parseInt(bookSlot),
        subject: bookSub,
        type: bookType,
        teacher: teacherName
      };

      const res = await fetch('http://localhost:5000/api/book-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ Slot Booked Successfully!");
        setShowBooking(false);
        // Force re-render or reload would be ideal, but for now just alert.
      } else {
        alert("❌ Booking Failed: " + data.error);
      }
    } catch (err) {
      alert("Connection Error");
      console.error(err);
    }
  };

  if (submitted) {
    return (
      <div style={pageStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1800px', marginBottom: '30px' }}>
          <h1 style={headerTitleStyle}>Faculty Portal</h1>
          <div style={{ display: 'flex', gap: '20px' }}>
            <button style={homeBtnStyle} onClick={() => navigate('/')}>🏠 Home</button>
            <button style={{ ...homeBtnStyle, border: '1px solid rgba(255,255,255,0.2)' }} onClick={() => setSubmitted(false)}>← New Search</button>
          </div>
        </div>

        <div style={fullScreenGlassStyle}>
          <div style={{
            height: '90vh',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            position: 'relative'
          }}>
            {/* ENLARGED TIMETABLE GRID */}
            <div style={{ flex: 1, width: '100%', overflowX: 'auto', transform: 'scale(1.0)', transformOrigin: 'top left' }}>
              <TimetableGrid
                role="TEACHER"
                teacherQuery={teacherName}
                onBack={() => setSubmitted(false)}
                key={Date.now()} // Force refresh
              />
            </div>

            {/* BOOKING FLOATING ACTION BUTTON */}
            <button
              onClick={() => setShowBooking(!showBooking)}
              style={{
                position: 'absolute', bottom: '30px', right: '30px',
                background: '#3b82f6', color: 'white', border: 'none',
                borderRadius: '50px', padding: '20px 40px', fontSize: '1.5rem',
                fontWeight: 'bold', boxShadow: '0 10px 30px rgba(59, 130, 246, 0.5)',
                cursor: 'pointer', zIndex: 10
              }}
            >
              {showBooking ? "Close Booking" : "+ Book Extra Slot"}
            </button>

            {/* BOOKING MODAL */}
            {showBooking && (
              <div style={{
                position: 'absolute', bottom: '100px', right: '30px',
                background: '#1e293b', padding: '30px', borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.1)', width: '400px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)', zIndex: 10,
                animation: 'slideUp 0.3s ease-out'
              }}>
                <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.8rem' }}>Book Extra Slot</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <select style={bigInputStyle} value={bookBranch} onChange={e => setBookBranch(e.target.value)}>
                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <select style={{ ...bigInputStyle, flex: 1 }} value={bookSem} onChange={e => setBookSem(e.target.value)}>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                    </select>
                    <select style={{ ...bigInputStyle, flex: 1 }} value={bookSec} onChange={e => setBookSec(e.target.value)}>
                      {["Sec_A", "Sec_B", "Sec_C"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <select style={{ ...bigInputStyle, flex: 1 }} value={bookDay} onChange={e => setBookDay(e.target.value)}>
                      {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d, i) => <option key={i} value={i}>{d}</option>)}
                    </select>
                    <select style={{ ...bigInputStyle, flex: 1 }} value={bookSlot} onChange={e => setBookSlot(e.target.value)}>
                      {[0, 1, 2, 3, 4, 5, 6, 7].map(s => <option key={s} value={s}>Slot {s + 1}</option>)}
                    </select>
                  </div>

                  <input style={bigInputStyle} placeholder="Subject" value={bookSub} onChange={e => setBookSub(e.target.value)} />

                  <select style={bigInputStyle} value={bookType} onChange={e => setBookType(e.target.value)}>
                    <option value="Lecture">Lecture</option>
                    <option value="Lab">Lab</option>
                  </select>

                  <button onClick={handleBookSlot} style={{ ...largeBtnStyle, width: '100%', marginTop: '10px', background: '#10b981', fontSize: '1.4rem' }}>
                    Confirm Booking
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1800px' }}>
        <h1 style={headerTitleStyle}>Faculty Portal</h1>
        <button style={homeBtnStyle} onClick={() => navigate('/')}>🏠 Home</button>
      </div>

      <div style={glassContainerStyle}>
        <h2 style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '50px', color: 'white' }}>View Workload</h2>

        <div style={{ display: 'grid', gap: '40px' }}>
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
              style={{ ...bigInputStyle, cursor: 'text' }}
            />
          </div>

          <button style={{ ...largeBtnStyle, background: '#10b981', color: 'white', marginTop: '30px', boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)' }} onClick={handleSubmit}>
            Search Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default Teacher;