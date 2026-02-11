import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TimetableGrid from '../components/TimetableGrid';

const Student = () => {
    const navigate = useNavigate();
    const [submitted, setSubmitted] = useState(false);

    const branches = ["CS", "CY", "CI", "CD", "IS", "AS", "BT", "CH", "CV", "EC", "EE", "EI", "ET", "IM", "ME"];
    const [formData, setFormData] = useState({ branch: 'CS', cycle: 'Odd', semester: '1', section: 'Section_A' });

    const semesterOptions = formData.cycle === 'Odd' ? [1, 3, 5, 7] : [2, 4, 6, 8];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            if (name === 'cycle') {
                newData.semester = value === 'Odd' ? '1' : '2';
            }
            return newData;
        });
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
        marginTop: 'clamp(20px, 3vw, 40px)'
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
        background: 'linear-gradient(to right, #f59e0b, #fbbf24)',
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
        fontSize: 'clamp(0.9rem, 1.5vw, 1.5rem)',
        borderRadius: 'clamp(12px, 2vw, 20px)',
        border: 'none',
        cursor: 'pointer',
        fontWeight: '600',
        background: 'rgba(255,255,255,0.1)',
        color: '#cbd5f5'
    };

    // --- RENDER TIMETABLE VIEW ---
    if (submitted) {
        return (
            <div style={pageStyle}>
                <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1800px', marginBottom: 'clamp(15px, 2vw, 30px)' }}>
                    <h1 style={headerTitleStyle}>Student Portal</h1>
                    <div className="btn-group" style={{ display: 'flex', gap: '15px' }}>
                        <button style={homeBtnStyle} onClick={() => navigate('/')}>🏠 Home</button>
                        <button style={{ ...homeBtnStyle, border: '1px solid rgba(255,255,255,0.2)' }} onClick={() => setSubmitted(false)}>← Back</button>
                    </div>
                </div>

                <div className="glass-container" style={fullScreenGlassStyle}>
                    <div style={{
                        minHeight: '60vh',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        width: '100%'
                    }}>
                        <div style={{ marginBottom: 'clamp(15px, 2vw, 30px)' }}>
                            <span style={{ fontSize: 'clamp(1.2rem, 2.5vw, 2.2rem)', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>{formData.branch} • Semester {formData.semester}</span>
                            <h3 style={{ fontSize: 'clamp(2rem, 4.5vw, 4.5rem)', color: '#f59e0b', margin: 0 }}>Section {formData.section.split('_')[1]}</h3>
                        </div>
                        <div style={{ width: '100%', overflowX: 'auto' }}>
                            <TimetableGrid
                                role="STUDENT"
                                branch={formData.branch}
                                semester={formData.semester}
                                section={formData.section}
                                onBack={() => setSubmitted(false)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER FORM VIEW ---
    return (
        <div style={pageStyle}>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1800px' }}>
                <h1 style={headerTitleStyle}>Student Portal</h1>
                <button style={homeBtnStyle} onClick={() => navigate('/')}>🏠 Home</button>
            </div>

            <div className="glass-container" style={{ ...glassContainerStyle, overflow: 'hidden' }}>
                <div style={{ height: '100%', overflowY: 'auto', paddingRight: '10px' }}>
                    <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 3rem)', textAlign: 'center', marginBottom: 'clamp(25px, 4vw, 50px)', color: 'white' }}>Select Your Class</h2>

                    <div style={{ display: 'grid', gap: 'clamp(20px, 3vw, 40px)' }}>
                        <div>
                            <label style={bigLabelStyle}>Branch</label>
                            <select name="branch" value={formData.branch} onChange={handleChange} style={bigInputStyle}>
                                {branches.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>

                        <div className="form-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(20px, 3vw, 40px)' }}>
                            <div>
                                <label style={bigLabelStyle}>Cycle</label>
                                <select name="cycle" value={formData.cycle} onChange={handleChange} style={bigInputStyle}>
                                    <option value="Odd">Odd Cycle</option>
                                    <option value="Even">Even Cycle</option>
                                </select>
                            </div>
                            <div>
                                <label style={bigLabelStyle}>Semester</label>
                                <select name="semester" value={formData.semester} onChange={handleChange} style={bigInputStyle}>
                                    {semesterOptions.map(s => <option key={s} value={s}>Semester {s}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={bigLabelStyle}>Section</label>
                            <select name="section" value={formData.section} onChange={handleChange} style={bigInputStyle}>
                                {["Section_A", "Section_B", "Section_C", "Section_D", "Section_E", "Section_F"].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                            </select>
                        </div>

                        <button style={{ ...largeBtnStyle, background: '#f59e0b', color: 'white', marginTop: '20px', boxShadow: '0 20px 40px rgba(245, 158, 11, 0.3)' }} onClick={() => setSubmitted(true)}>
                            View Timetable
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Student;