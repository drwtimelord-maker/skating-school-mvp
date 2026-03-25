import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Check, X, Save } from 'lucide-react';

export default function StudentFeedback() {
    const { studentId } = useParams();

    // Basic Skills Level 1 Checklist
    const [skills, setSkills] = useState({
        sitAndStand: null,
        marchForward: null,
        twoFootGlide: null,
        dipInPlace: null
    });

    const [comments, setComments] = useState('');

    const handleSkillChange = (skillKey, value) => {
        setSkills(prev => ({ ...prev, [skillKey]: value }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        alert('Feedback saved to Supabase! (Mocked)');
    };

    const SkillRow = ({ label, skillKey }) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 500 }}>{label}</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                    type="button"
                    onClick={() => handleSkillChange(skillKey, 'pass')}
                    className="btn"
                    style={{
                        background: skills[skillKey] === 'pass' ? 'var(--success)' : 'var(--surface)',
                        color: skills[skillKey] === 'pass' ? 'white' : 'var(--text-muted)',
                        border: `1px solid ${skills[skillKey] === 'pass' ? 'var(--success)' : 'var(--border)'}`,
                        padding: '0.5rem 1rem'
                    }}
                >
                    <Check size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                    Pass
                </button>
                <button
                    type="button"
                    onClick={() => handleSkillChange(skillKey, 'needs_work')}
                    className="btn"
                    style={{
                        background: skills[skillKey] === 'needs_work' ? 'var(--warning)' : 'var(--surface)',
                        color: skills[skillKey] === 'needs_work' ? 'white' : 'var(--text-muted)',
                        border: `1px solid ${skills[skillKey] === 'needs_work' ? 'var(--warning)' : 'var(--border)'}`,
                        padding: '0.5rem 1rem'
                    }}
                >
                    <X size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                    Not Yet
                </button>
            </div>
        </div>
    );

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <Link to="/roster/1" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1rem' }}>
                    <ChevronLeft size={16} /> Back to Roster
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Emma Watson</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Level: Basic Skills 1 | ID: {studentId}</p>
                    </div>
                    <Link to={`/report/${studentId}`} className="btn btn-secondary">
                        Preview Report
                    </Link>
                </div>
            </div>

            <form onSubmit={handleSave}>
                <div className="card" style={{ padding: 0, marginBottom: '2rem' }}>
                    <div style={{ background: 'var(--bg)', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>
                        Skills Checklist
                    </div>
                    <SkillRow label="Sit and stand up on ice" skillKey="sitAndStand" />
                    <SkillRow label="March forward across ice" skillKey="marchForward" />
                    <SkillRow label="Two-foot glide" skillKey="twoFootGlide" />
                    <SkillRow label="Dip in place" skillKey="dipInPlace" />
                </div>

                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h2 className="card-title">Instructor Comments</h2>
                    <textarea
                        className="input-field"
                        rows="4"
                        placeholder="Add specific observations, areas of improvement, and positive feedback..."
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                    ></textarea>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button type="submit" className="btn">
                        <Save size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                        Save Evaluation
                    </button>
                </div>
            </form>
        </div>
    );
}
