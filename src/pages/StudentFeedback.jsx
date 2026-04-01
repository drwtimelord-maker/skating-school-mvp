import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, X, Save } from 'lucide-react';
import { supabase } from '../supabase';

export default function StudentFeedback() {
    const { studentId } = useParams();
    const [searchParams] = useSearchParams();
    const classId = searchParams.get('classId');
    const navigate = useNavigate();

    const [student, setStudent] = useState(null);
    const [classInfo, setClassInfo] = useState(null);
    const [skillList, setSkillList] = useState([]);
    const [skillsValues, setSkillsValues] = useState({});
    const [comments, setComments] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        async function fetchFormSetup() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }
            setUserProfile(user);

            if (!classId) return;

            const { data: stData } = await supabase.from('students').select('*').eq('id', studentId).single();
            setStudent(stData);

            const { data: cData } = await supabase.from('classes').select('*, levels(name)').eq('id', classId).single();
            setClassInfo(cData);

            if (cData) {
                const { data: skData } = await supabase.from('skills').select('*').eq('level_id', cData.level_id);
                setSkillList(skData || []);

                // Init empty values
                const initial = {};
                skData?.forEach(s => initial[s.id] = null);
                setSkillsValues(initial);
            }
            setLoading(false);
        }
        fetchFormSetup();
    }, [studentId, classId, navigate]);

    const handleSkillChange = (skillId, value) => {
        setSkillsValues(prev => ({ ...prev, [skillId]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);

        // 1. Create feedback_report
        const { data: reportData, error: reportErr } = await supabase.from('feedback_reports').insert({
            student_id: studentId,
            class_id: classId,
            instructor_id: userProfile.id,
            comments: comments,
            session_date: new Date().toISOString().split('T')[0]
        }).select().single();

        if (reportErr) {
            alert('Error creating report: ' + reportErr.message);
            setSaving(false);
            return;
        }

        // 2. Insert skill results
        const resultsPayload = skillList
            .filter(sk => skillsValues[sk.id]) // Only save those graded
            .map(sk => ({
                report_id: reportData.id,
                skill_id: sk.id,
                pass_status: skillsValues[sk.id]
            }));

        if (resultsPayload.length > 0) {
            await supabase.from('feedback_skill_results').insert(resultsPayload);
        }

        setSaving(false);
        navigate(`/report/${reportData.id}`);
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading Form...</div>;

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <Link to={`/roster/${classId}`} style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1rem' }}>
                    <ChevronLeft size={16} /> Back to Roster
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>{student?.name}</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Level: {classInfo?.levels?.name}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSave}>
                <div className="card" style={{ padding: 0, marginBottom: '2rem' }}>
                    <div style={{ background: 'var(--bg)', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>
                        Skills Checklist
                    </div>
                    {skillList.map(skill => (
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
                    ))}
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
