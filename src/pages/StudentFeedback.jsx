import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, X, Save, AlertCircle } from 'lucide-react';
import { supabase } from '../supabase';

export default function StudentFeedback() {
    const { studentId } = useParams();
    const [searchParams] = useSearchParams();
    const classId = searchParams.get('classId');
    const navigate = useNavigate();

    // Core Data
    const [student, setStudent] = useState(null);
    const [classInfo, setClassInfo] = useState(null);
    const [skillList, setSkillList] = useState([]);
    const [userProfile, setUserProfile] = useState(null);

    // Form State
    const [skillsValues, setSkillsValues] = useState({});
    const [comments, setComments] = useState('');

    // UI State
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchFormSetup() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    navigate('/login');
                    return;
                }
                setUserProfile(user);

                if (!classId) throw new Error("Missing class context in URL");

                // Fetch Student
                const { data: stData, error: stErr } = await supabase.from('students').select('*').eq('id', studentId).single();
                if (stErr) throw stErr;
                setStudent(stData);

                // Fetch Class and its linked Level
                const { data: cData, error: cErr } = await supabase.from('classes').select('*, levels(name)').eq('id', classId).single();
                if (cErr) throw cErr;
                setClassInfo(cData);

                // Fetch Skills associated with the class level
                if (cData?.level_id) {
                    const { data: skData, error: skErr } = await supabase.from('skills').select('*').eq('level_id', cData.level_id);
                    if (skErr) throw skErr;

                    setSkillList(skData || []);

                    // Initialize empty grading values for each skill
                    const initial = {};
                    skData?.forEach(s => initial[s.id] = null);
                    setSkillsValues(initial);
                }
            } catch (err) {
                console.error(err);
                setError(err.message || "Failed to load student tracking data.");
            } finally {
                setLoading(false);
            }
        }
        fetchFormSetup();
    }, [studentId, classId, navigate]);

    const handleSkillChange = (skillId, value) => {
        setSkillsValues(prev => ({ ...prev, [skillId]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            // 1. Create the parent feedback_report row
            const { data: reportData, error: reportErr } = await supabase.from('feedback_reports').insert({
                student_id: studentId,
                class_id: classId,
                instructor_id: userProfile.id,
                comments: comments,
                session_date: new Date().toISOString().split('T')[0]
            }).select().single();

            if (reportErr) throw reportErr;

            // 2. Insert corresponding skill results only if they were graded
            const resultsPayload = skillList
                .filter(sk => skillsValues[sk.id] !== null) // Filter graded
                .map(sk => ({
                    report_id: reportData.id,
                    skill_id: sk.id,
                    pass_status: skillsValues[sk.id]
                }));

            if (resultsPayload.length > 0) {
                const { error: skillErr } = await supabase.from('feedback_skill_results').insert(resultsPayload);
                if (skillErr) throw skillErr;
            }

            // Success! Route to print screen
            navigate(`/report/${reportData.id}`);
        } catch (err) {
            console.error(err);
            setError("Failed to save evaluation: " + (err.message || 'Unknown error'));
            setSaving(false);
        }
    };

    if (loading) {
        return <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading evaluation layout...</div>;
    }

    if (error && !student) {
        return (
            <div style={{ padding: '2rem' }}>
                <div style={{ background: 'var(--warning-bg)', color: 'var(--warning)', padding: '1rem', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
                <Link to="/instructor" className="btn btn-secondary" style={{ marginTop: '1rem', display: 'inline-block' }}>Return to Dashboard</Link>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <Link to={`/roster/${classId}`} style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1rem' }}>
                    <ChevronLeft size={16} /> Back to Roster
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Evaluating {student?.name}</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Level: {classInfo?.levels?.name}</p>
                    </div>
                </div>
            </div>

            {/* Inline Form Error Handler */}
            {error && (
                <div style={{ background: 'var(--warning-bg)', color: 'var(--warning)', padding: '1rem', borderRadius: 'var(--radius)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSave}>
                <div className="card" style={{ padding: 0, marginBottom: '2rem' }}>
                    <div style={{ background: 'var(--bg)', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>
                        Skills Checklist
                    </div>

                    {skillList.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No specific skills have been configured for this level yet!
                        </div>
                    ) : (
                        skillList.map(skill => (
                            <div key={skill.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--border)' }}>
                                <div style={{ fontWeight: 500 }}>{skill.name}</div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => handleSkillChange(skill.id, 'pass')}
                                        className="btn"
                                        style={{
                                            background: skillsValues[skill.id] === 'pass' ? 'var(--success)' : 'var(--surface)',
                                            color: skillsValues[skill.id] === 'pass' ? 'white' : 'var(--text-muted)',
                                            border: `1px solid ${skillsValues[skill.id] === 'pass' ? 'var(--success)' : 'var(--border)'}`,
                                            padding: '0.5rem 1rem'
                                        }}
                                    >
                                        <Check size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Pass
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSkillChange(skill.id, 'not_yet')}
                                        className="btn"
                                        style={{
                                            background: skillsValues[skill.id] === 'not_yet' ? 'var(--warning)' : 'var(--surface)',
                                            color: skillsValues[skill.id] === 'not_yet' ? 'white' : 'var(--text-muted)',
                                            border: `1px solid ${skillsValues[skill.id] === 'not_yet' ? 'var(--warning)' : 'var(--border)'}`,
                                            padding: '0.5rem 1rem'
                                        }}
                                    >
                                        <X size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Not Yet
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
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
                    <button type="submit" className="btn" disabled={saving}>
                        <Save size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                        {saving ? 'Saving...' : 'Save Evaluation'}
                    </button>
                </div>
            </form>
        </div>
    );
}
