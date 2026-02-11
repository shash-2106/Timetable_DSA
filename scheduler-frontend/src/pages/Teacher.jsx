import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TimetableGrid from '../components/TimetableGrid';

const Teacher = () => {
  const navigate = useNavigate();

  // FORM STATE
  const [submitted, setSubmitted] = useState(false);
  const [branch, setBranch] = useState('CS');
  const [teacherName, setTeacherName] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const branches = ["CS", "CY", "CI", "CD", "IS", "AS", "BT", "CH", "CV", "EC", "EE", "EI", "ET", "IM", "ME"];

  const handleSubmit = () => {
    if (!teacherName) return alert("Please enter your name");
    setSubmitted(true);
  };

  // --- STYLES (Responsive) ---
  const pageStyle = {
    minHeight: '100vh',
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #020617 0%, #0f172a 60%, #1e293b 100%)',
    color: 'white',
    overflowX: 'hidden',
    overflowY: 'auto',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    padding: 'clamp(15px, 3vw, 30px)'
  };

  const glassContainerStyle = {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    backdropFilter: 'blur(25px)',
    borderRadius: 'clamp(20px, 3vw, 40px)',
    padding: 'clamp(25px, 5vw, 60px) clamp(20px, 5vw, 80px)',
    boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '900px',
    width: '100%',
    animation: 'fadeIn 0.6s ease-out',
    marginTop: 'clamp(20px, 4vw, 60px)'
  };

  const fullScreenGlassStyle = {
    ...glassContainerStyle,
    maxWidth: '1800px',
    flex: 1,
    marginTop: 0,
    padding: 'clamp(15px, 3vw, 40px) clamp(15px, 4vw, 60px)',
    overflow: 'hidden'
  };

  const headerTitleStyle = {
    fontSize: 'clamp(1.8rem, 5vw, 5rem)',
    fontWeight: '900',
    margin: 0,
    background: 'linear-gradient(to right, #10b981, #34d399)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-1px'
  };

  const bigLabelStyle = {
    fontSize: 'clamp(1rem, 2vw, 1.8rem)',
    color: '#cbd5f5',
    marginBottom: '10px',
    display: 'block',
    fontWeight: '500'
  };

  const bigInputStyle = {
    width: '100%',
    padding: 'clamp(12px, 2vw, 25px) clamp(15px, 2vw, 30px)',
    fontSize: 'clamp(1rem, 1.8vw, 1.6rem)',
    background: '#1e293b',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    borderRadius: 'clamp(12px, 2vw, 20px)',
    color: 'white',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
    cursor: 'pointer',
    boxSizing: 'border-box'
  };

  const largeBtnStyle = {
    padding: 'clamp(14px, 2.5vw, 25px) clamp(25px, 4vw, 50px)',
    fontSize: 'clamp(1rem, 2vw, 1.8rem)',
    borderRadius: 'clamp(12px, 2vw, 20px)',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '700',
    transition: 'all 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px'
  };

  const homeBtnStyle = {
    padding: 'clamp(8px, 1.5vw, 15px) clamp(18px, 2.5vw, 35px)',
    fontSize: 'clamp(0.85rem, 1.5vw, 1.5rem)',
    borderRadius: 'clamp(12px, 2vw, 20px)',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    background: 'rgba(255,255,255,0.1)',
    color: '#cbd5f5'
  };

  // Modal input style (smaller for modals)
  const modalInputStyle = {
    ...bigInputStyle,
    padding: 'clamp(8px, 1.5vw, 15px) clamp(10px, 1.5vw, 20px)',
    fontSize: 'clamp(0.85rem, 1.5vw, 1.2rem)',
    borderRadius: 'clamp(8px, 1.5vw, 14px)'
  };

  // --- BOOKING STATE ---
  const [showBooking, setShowBooking] = useState(false);
  const [bookBranch, setBookBranch] = useState('CS');
  const [bookSem, setBookSem] = useState('1');
  const [bookSec, setBookSec] = useState('Sec_A');
  const [bookDate, setBookDate] = useState('');
  const [bookSlot, setBookSlot] = useState('0');
  const [bookSub, setBookSub] = useState('');
  const [bookType, setBookType] = useState('Lecture');

  // --- SWAP STATE ---
  const [showSwap, setShowSwap] = useState(false);
  const [swapDate, setSwapDate] = useState('');
  const [mySlot, setMySlot] = useState('0');
  const [mySub, setMySub] = useState('');
  const [targetTeacher, setTargetTeacher] = useState('');
  const [targetSlot, setTargetSlot] = useState('0');
  const [targetSub, setTargetSub] = useState('');

  const handleBookSlot = async () => {
    if (!bookSub) return alert("Enter Subject Name");
    if (!bookDate) return alert("Select a Date");

    try {
      const payload = {
        date: bookDate,
        branch: bookBranch,
        sem: `Semester_${bookSem}`,
        section: bookSec,
        slot: parseInt(bookSlot),
        subject: bookSub,
        type: bookType,
        teacher: teacherName,
        requester: teacherName
      };

      const res = await fetch('/api/book-extra-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ Extra Slot Booked!");
        setShowBooking(false);
      } else {
        alert("❌ Booking Failed: " + data.error);
      }
    } catch (err) {
      alert("Connection Error");
      console.error(err);
    }
  };

  const handleSwapSlot = async () => {
    if (!swapDate || !targetTeacher) return alert("Fill all fields");

    try {
      const payload = {
        date: swapDate,
        branch: bookBranch,
        sem: `Semester_${bookSem}`,
        section: bookSec,
        slotA: parseInt(mySlot),
        teacherA: teacherName,
        subjectA: mySub,
        slotB: parseInt(targetSlot),
        teacherB: targetTeacher,
        subjectB: targetSub,
        requester: teacherName
      };

      const res = await fetch('/api/swap-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) alert("✅ Swap Successful!");
      else alert("❌ Swap Failed: " + data.error);

      if (data.success) setShowSwap(false);

    } catch (e) { alert("Connection Error"); }
  };

  if (submitted) {
    return (
      <div style={pageStyle}>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1800px', marginBottom: 'clamp(15px, 2vw, 30px)' }}>
          <h1 style={headerTitleStyle}>Faculty Portal</h1>
          <div className="btn-group" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button style={homeBtnStyle} onClick={() => navigate('/')}>🏠 Home</button>
            <button style={{ ...homeBtnStyle, border: '1px solid rgba(255,255,255,0.2)' }} onClick={() => setSubmitted(false)}>← New Search</button>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              style={{ ...homeBtnStyle, background: '#1e293b', border: '1px solid white', color: 'white', maxWidth: '180px' }}
            />
          </div>
        </div>

        <div className="glass-container" style={fullScreenGlassStyle}>
          <div style={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            position: 'relative'
          }}>
            {/* TIMETABLE GRID */}
            <div style={{ flex: 1, width: '100%', overflowX: 'auto' }}>
              <TimetableGrid
                role="TEACHER"
                teacherQuery={teacherName}
                onBack={() => setSubmitted(false)}
                date={selectedDate}
                key={selectedDate + Date.now()}
              />
            </div>

            {/* BOOKING FLOATING ACTION BUTTON */}
            <button
              onClick={() => setShowBooking(!showBooking)}
              style={{
                position: 'fixed', bottom: 'clamp(15px, 3vw, 30px)', right: 'clamp(15px, 3vw, 30px)',
                background: '#3b82f6', color: 'white', border: 'none',
                borderRadius: '50px', padding: 'clamp(12px, 2vw, 20px) clamp(20px, 3vw, 40px)', fontSize: 'clamp(0.9rem, 1.5vw, 1.5rem)',
                fontWeight: 'bold', boxShadow: '0 10px 30px rgba(59, 130, 246, 0.5)',
                cursor: 'pointer', zIndex: 10
              }}
            >
              {showBooking ? "Close" : "+ Book Slot"}
            </button>

            {/* BOOKING MODAL */}
            {showBooking && (
              <div style={{
                position: 'fixed', bottom: 'clamp(70px, 8vw, 100px)', right: 'clamp(15px, 3vw, 30px)',
                background: '#1e293b', padding: 'clamp(15px, 2vw, 30px)', borderRadius: 'clamp(12px, 2vw, 20px)',
                border: '1px solid rgba(255,255,255,0.1)', width: 'min(90vw, 400px)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)', zIndex: 10,
                maxHeight: '70vh', overflowY: 'auto'
              }}>
                <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: 'clamp(1.1rem, 2vw, 1.8rem)' }}>Book Extra Slot</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <select style={modalInputStyle} value={bookBranch} onChange={e => setBookBranch(e.target.value)}>
                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select style={{ ...modalInputStyle, flex: 1 }} value={bookSem} onChange={e => setBookSem(e.target.value)}>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                    </select>
                    <select style={{ ...modalInputStyle, flex: 1 }} value={bookSec} onChange={e => setBookSec(e.target.value)}>
                      {["Sec_A", "Sec_B", "Sec_C"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="date" value={bookDate} onChange={e => setBookDate(e.target.value)} style={modalInputStyle} />
                    <select style={modalInputStyle} value={bookSlot} onChange={e => setBookSlot(e.target.value)}>
                      {[0, 1, 2, 3, 4, 5, 6, 7].map(s => <option key={s} value={s}>Slot {s + 1}</option>)}
                    </select>
                  </div>

                  <input style={modalInputStyle} placeholder="Subject" value={bookSub} onChange={e => setBookSub(e.target.value)} />

                  <select style={modalInputStyle} value={bookType} onChange={e => setBookType(e.target.value)}>
                    <option value="Lecture">Lecture</option>
                    <option value="Lab">Lab</option>
                  </select>

                  <button onClick={handleBookSlot} style={{ ...largeBtnStyle, width: '100%', marginTop: '5px', background: '#10b981', fontSize: 'clamp(0.9rem, 1.5vw, 1.4rem)' }}>
                    Confirm Booking
                  </button>
                </div>
              </div>
            )}

            {/* SWAP BUTTON */}
            <button
              onClick={() => setShowSwap(!showSwap)}
              style={{
                position: 'fixed', bottom: 'clamp(15px, 3vw, 30px)', left: 'clamp(15px, 3vw, 30px)',
                background: '#f59e0b', color: 'white', border: 'none',
                borderRadius: '50px', padding: 'clamp(12px, 2vw, 20px) clamp(20px, 3vw, 40px)', fontSize: 'clamp(0.9rem, 1.5vw, 1.5rem)',
                fontWeight: 'bold', boxShadow: '0 10px 30px rgba(245, 158, 11, 0.5)',
                cursor: 'pointer', zIndex: 10
              }}
            >
              {showSwap ? "Cancel" : "🔄 Swap"}
            </button>

            {/* SWAP MODAL */}
            {showSwap && (
              <div style={{
                position: 'fixed', bottom: 'clamp(70px, 8vw, 100px)', left: 'clamp(15px, 3vw, 30px)',
                background: '#1e293b', padding: 'clamp(15px, 2vw, 30px)', borderRadius: 'clamp(12px, 2vw, 20px)',
                border: '1px solid rgba(255,255,255,0.1)', width: 'min(90vw, 500px)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)', zIndex: 10,
                maxHeight: '70vh', overflowY: 'auto'
              }}>
                <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: 'clamp(1.1rem, 2vw, 1.8rem)' }}>Proposal for Swap</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="date" value={swapDate} onChange={e => setSwapDate(e.target.value)} style={modalInputStyle} />
                    <select style={modalInputStyle} value={bookBranch} onChange={e => setBookBranch(e.target.value)}>{branches.map(b => <option key={b} value={b}>{b}</option>)}</select>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select style={{ ...modalInputStyle }} value={bookSem} onChange={e => setBookSem(e.target.value)}>{[1, 3, 5, 7].map(s => <option key={s} value={s}>Sem {s}</option>)}</select>
                    <select style={{ ...modalInputStyle }} value={bookSec} onChange={e => setBookSec(e.target.value)}>{["Sec_A", "Sec_B", "Sec_C"].map(s => <option key={s} value={s}>{s}</option>)}</select>
                  </div>

                  <div style={{ borderTop: '1px solid #334155', margin: '5px 0' }}></div>
                  <label style={{ color: '#94a3b8', fontSize: 'clamp(0.8rem, 1.3vw, 1rem)' }}>MY Slot (to give away)</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select style={modalInputStyle} value={mySlot} onChange={e => setMySlot(e.target.value)}>{[0, 1, 2, 3, 4, 5, 6, 7].map(s => <option key={s} value={s}>Slot {s + 1}</option>)}</select>
                    <input placeholder="My Subject" value={mySub} onChange={e => setMySub(e.target.value)} style={modalInputStyle} />
                  </div>

                  <div style={{ borderTop: '1px solid #334155', margin: '5px 0' }}></div>
                  <label style={{ color: '#94a3b8', fontSize: 'clamp(0.8rem, 1.3vw, 1rem)' }}>TARGET Slot (to take)</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input placeholder="Target Teacher" value={targetTeacher} onChange={e => setTargetTeacher(e.target.value)} style={modalInputStyle} />
                    <select style={modalInputStyle} value={targetSlot} onChange={e => setTargetSlot(e.target.value)}>{[0, 1, 2, 3, 4, 5, 6, 7].map(s => <option key={s} value={s}>Slot {s + 1}</option>)}</select>
                    <input placeholder="Their Subject" value={targetSub} onChange={e => setTargetSub(e.target.value)} style={modalInputStyle} />
                  </div>

                  <button onClick={handleSwapSlot} style={{ ...largeBtnStyle, width: '100%', marginTop: '10px', background: '#f59e0b', fontSize: 'clamp(0.9rem, 1.5vw, 1.4rem)' }}>Confirm Swap</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div >
    );
  } else {
    return (
      <div style={pageStyle}>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1800px' }}>
          <h1 style={headerTitleStyle}>Faculty Portal</h1>
          <button style={homeBtnStyle} onClick={() => navigate('/')}>🏠 Home</button>
        </div>

        <div className="glass-container" style={{ ...glassContainerStyle, overflow: 'hidden' }}>
          <div style={{ height: '100%', overflowY: 'auto', paddingRight: '10px' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 3rem)', textAlign: 'center', marginBottom: 'clamp(25px, 4vw, 50px)', color: 'white' }}>View Workload</h2>

            <div style={{ display: 'grid', gap: 'clamp(20px, 3vw, 40px)' }}>
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

              <button style={{ ...largeBtnStyle, background: '#10b981', color: 'white', marginTop: '20px', boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)' }} onClick={handleSubmit}>
                Search Schedule
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default Teacher;