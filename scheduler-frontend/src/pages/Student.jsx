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

    // --- STYLES (Matching Admin Page) ---
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
        maxWidth: '900px', // Constrained width for form
        width: '100%',
        animation: 'fadeIn 0.6s ease-out',
        marginTop: '40px'
    };

    // Full Screen Glass for Timetable View
    const fullScreenGlassStyle = {
        ...glassContainerStyle,
        maxWidth: '1800px',
        flex: 1,
        marginTop: 0,
        padding: '40px 60px',
        overflow: 'hidden' // Internal scroll
    };

    const headerTitleStyle = {
        fontSize: '5rem',
        fontWeight: '900',
        margin: 0,
        background: 'linear-gradient(to right, #f59e0b, #fbbf24)', // Student Theme (Gold/Orange)
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

    // --- RENDER TIMETABLE VIEW ---
    if (submitted) {
        return (
            <div style={pageStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1800px', marginBottom: '30px' }}>
                    <h1 style={headerTitleStyle}>Student Portal</h1>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <button style={homeBtnStyle} onClick={() => navigate('/')}>🏠 Home</button>
                        <button style={{ ...homeBtnStyle, border: '1px solid rgba(255,255,255,0.2)' }} onClick={() => setSubmitted(false)}>← Back</button>
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
                        <div style={{ marginBottom: '30px' }}>
                            <span style={{ fontSize: '2.2rem', color: '#94a3b8', display: 'block', marginBottom: '10px' }}>{formData.branch} • Semester {formData.semester}</span>
                            <h3 style={{ fontSize: '4.5rem', color: '#f59e0b', margin: 0 }}>Section {formData.section.split('_')[1]}</h3>
                        </div>
                        {/* ENLARGED TIMETABLE GRID */}
                        <div style={{ width: '100%', overflowX: 'auto', transform: 'scale(1.05)', transformOrigin: 'top left', width: '95%' }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1800px' }}>
                <h1 style={headerTitleStyle}>Student Portal</h1>
                <button style={homeBtnStyle} onClick={() => navigate('/')}>🏠 Home</button>
            </div>

            <div style={{ ...glassContainerStyle, overflow: 'hidden' }}>
                <div style={{ height: '100%', overflowY: 'auto', paddingRight: '10px' }}>
                    <h2 style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '50px', color: 'white' }}>Select Your Class</h2>

                    <div style={{ display: 'grid', gap: '40px' }}>
                        <div>
                            <label style={bigLabelStyle}>Branch</label>
                            <select name="branch" value={formData.branch} onChange={handleChange} style={bigInputStyle}>
                                {branches.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
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

                        <button style={{ ...largeBtnStyle, background: '#f59e0b', color: 'white', marginTop: '30px', boxShadow: '0 20px 40px rgba(245, 158, 11, 0.3)' }} onClick={() => setSubmitted(true)}>
                            View Timetable
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Student;