import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  /* ---------- STYLES ---------- */

  const containerStyle = {
    minHeight: '100vh',
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #020617 0%, #0f172a 60%, #1e293b 100%)',
    color: 'white',
    overflowY: 'auto',
    overflowX: 'hidden',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    animation: 'fadeIn 0.8s ease-out',
    padding: '20px'
  };

  const titleStyle = {
    fontSize: 'clamp(2.2rem, 6vw, 6.5rem)',
    fontWeight: '900',
    margin: 0,
    background: 'linear-gradient(to right, #60a5fa, #c084fc)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0 15px 60px rgba(96,165,250,0.35)',
    letterSpacing: '-2px',
    animation: 'slideDown 0.9s ease-out'
  };

  const subtitleStyle = {
    fontSize: 'clamp(1rem, 2.5vw, 2.2rem)',
    color: '#cbd5f5',
    marginTop: '16px',
    fontWeight: '400',
    letterSpacing: '1px',
    animation: 'fadeUp 1s ease-out'
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    backdropFilter: 'blur(22px)',
    padding: 'clamp(35px, 5vw, 70px) clamp(25px, 3vw, 45px)',
    borderRadius: 'clamp(20px, 3vw, 32px)',
    width: 'clamp(260px, 70vw, 480px)',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    boxShadow: '0 25px 60px rgba(0,0,0,0.55)',
    position: 'relative',
    overflow: 'hidden',
    opacity: 0,
    transform: 'translateY(40px) scale(0.95)',
    animation: 'cardEnter 0.9s ease-out forwards'
  };

  return (
    <>
      {/* --- KEYFRAME ANIMATIONS (STYLING ONLY) --- */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0 }
            to { opacity: 1 }
          }

          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-40px) }
            to { opacity: 1; transform: translateY(0) }
          }

          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(30px) }
            to { opacity: 1; transform: translateY(0) }
          }

          @keyframes cardEnter {
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>

      <div style={containerStyle}>
        <div style={{ textAlign: 'center', zIndex: 10 }}>
          <h1 style={titleStyle}>Timetable Generator</h1>
          <p style={subtitleStyle}>Automated Scheduling for Universities</p>
        </div>

        <div className="card-container" style={{
          display: 'flex',
          gap: 'clamp(25px, 4vw, 70px)',
          marginTop: 'clamp(40px, 7vw, 100px)',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 20px',
          flexWrap: 'wrap'
        }}>

          {/* ADMIN */}
          <div
            className="role-card"
            style={{ ...cardStyle, animationDelay: '0.2s' }}
            onClick={() => navigate('/admin')}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-22px) scale(1.06)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.09)';
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.boxShadow = '0 35px 70px rgba(59,130,246,0.25)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
              e.currentTarget.style.boxShadow = '0 25px 60px rgba(0,0,0,0.55)';
            }}
          >
            <div style={{ fontSize: 'clamp(3rem, 5vw, 6.5rem)', marginBottom: 'clamp(15px, 2vw, 35px)' }}>⚙️</div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.7rem)', margin: '0 0 12px 0' }}>Admin</h2>
            <p style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.5rem)', color: '#94a3b8' }}>Configuration & Setup</p>
          </div>

          {/* FACULTY */}
          <div
            className="role-card"
            style={{ ...cardStyle, animationDelay: '0.35s' }}
            onClick={() => navigate('/teacher')}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-22px) scale(1.06)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.09)';
              e.currentTarget.style.borderColor = '#10b981';
              e.currentTarget.style.boxShadow = '0 35px 70px rgba(16,185,129,0.25)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
              e.currentTarget.style.boxShadow = '0 25px 60px rgba(0,0,0,0.55)';
            }}
          >
            <div style={{ fontSize: 'clamp(3rem, 5vw, 6.5rem)', marginBottom: 'clamp(15px, 2vw, 35px)' }}>👨‍🏫</div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.7rem)', margin: '0 0 12px 0' }}>Faculty</h2>
            <p style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.5rem)', color: '#94a3b8' }}>View Workload</p>
          </div>

          {/* STUDENT */}
          <div
            className="role-card"
            style={{ ...cardStyle, animationDelay: '0.5s' }}
            onClick={() => navigate('/student')}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-22px) scale(1.06)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.09)';
              e.currentTarget.style.borderColor = '#f59e0b';
              e.currentTarget.style.boxShadow = '0 35px 70px rgba(245,158,11,0.25)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
              e.currentTarget.style.boxShadow = '0 25px 60px rgba(0,0,0,0.55)';
            }}
          >
            <div style={{ fontSize: 'clamp(3rem, 5vw, 6.5rem)', marginBottom: 'clamp(15px, 2vw, 35px)' }}>🎓</div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.7rem)', margin: '0 0 12px 0' }}>Student</h2>
            <p style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.5rem)', color: '#94a3b8' }}>Check Timetables</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
