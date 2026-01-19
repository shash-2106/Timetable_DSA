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
    overflow: 'hidden',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    animation: 'fadeIn 0.8s ease-out'
  };

  const titleStyle = {
    fontSize: '6.5rem',   // ⬅️ Enlarged
    fontWeight: '900',
    margin: 0,
    background: 'linear-gradient(to right, #60a5fa, #c084fc)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0 15px 60px rgba(96,165,250,0.35)',
    letterSpacing: '-3px',
    animation: 'slideDown 0.9s ease-out'
  };

  const subtitleStyle = {
    fontSize: '2.2rem',
    color: '#cbd5f5',
    marginTop: '24px',
    fontWeight: '400',
    letterSpacing: '1.2px',
    animation: 'fadeUp 1s ease-out'
  };

  const cardContainerStyle = {
    display: 'flex',
    gap: '70px',
    marginTop: '100px',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0 60px'
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    backdropFilter: 'blur(22px)',
    padding: '70px 45px',
    borderRadius: '32px',
    width: '480px',   // ⬅️ Slightly bigger
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

        <div style={cardContainerStyle}>
          
          {/* ADMIN */}
          <div
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
            <div style={{ fontSize: '6.5rem', marginBottom: '35px' }}>⚙️</div>
            <h2 style={{ fontSize: '2.7rem', margin: '0 0 18px 0' }}>Admin</h2>
            <p style={{ fontSize: '1.5rem', color: '#94a3b8' }}>Configuration & Setup</p>
          </div>

          {/* FACULTY */}
          <div
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
            <div style={{ fontSize: '6.5rem', marginBottom: '35px' }}>👨‍🏫</div>
            <h2 style={{ fontSize: '2.7rem', margin: '0 0 18px 0' }}>Faculty</h2>
            <p style={{ fontSize: '1.5rem', color: '#94a3b8' }}>View Workload</p>
          </div>

          {/* STUDENT */}
          <div
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
            <div style={{ fontSize: '6.5rem', marginBottom: '35px' }}>🎓</div>
            <h2 style={{ fontSize: '2.7rem', margin: '0 0 18px 0' }}>Student</h2>
            <p style={{ fontSize: '1.5rem', color: '#94a3b8' }}>Check Timetables</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
