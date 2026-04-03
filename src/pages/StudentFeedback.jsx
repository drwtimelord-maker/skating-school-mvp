import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, X, Save, AlertCircle } from 'lucide-react';
import { supabase } from '../supabase';

export default function StudentFeedback() {
    const { studentId } = useParams();
    const [searchParams] = useSearchParams();
    const classId = searchParams.get('classId');
    const navigate = useNavigate();

    const [student, setStudent] = useState(null);
    const [classInfo, setClassInfo] = useState(null);
    const [skillList, setSkillList] = useState([]);
    const [userProfile, setUserProfile] = useState(null);

    const [skillsValues, setSkillsValues] = useState({});
    const [comments, setComments] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchFormSetup() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) { navigate('/login'); return; }
                setUserProfile(user);

                if (!classId) throw new Error('Missing class context in URL');

                const { data: stData, error: stErr } = await supabase.from('students').select('*').eq('id', studentId).single();
                if (stErr) throw stErr;
                setStudent(stData);

                const { data: cData, error: cErr } = await supabase.from('classes').select('*, levels(name)').eq('id', classId).single();
                if (cErr) throw cErr;
                setClassInfo(cData);

                if (cData?.level_id) {
                    const { data: skData, error: skErr } = await supabase.from('skills').select('*').eq('level_id', cData.level_id);
                    if (skErr) throw skErr;
                    setSkillList(skData || []);
                    const initial = {};
                    skData?.forEach(s => initial[s.id] = null);
                    setSkillsValues(initial);
                }
            } catch (err) {
                setError(err.message || 'Failed to load evaluation data.');
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
            const { data: reportData, error: reportErr } = await supabase
                .from('feedback_reports')
                .insert({
                    student_id: studentId,
                    class_id: classId,
                    instructor_id: userProfile.id,
                    comments,
                    session_date: new Date().toISOString().split('T')[0]
                })
                .select()
                .single();
            if (reportErr) throw reportErr;

            const resultsPayload = skillList
                .filter(sk => skillsValues[sk.id] !== null)
                .map(sk => ({ report_id: reportData.id, skill_id: sk.id, pass_status: skillsValues[sk.id] }));

            if (resultsPayload.length > 0) {
                const { error: skillErr } = await supabase.from('feedback_skill_results').insert(resultsPayload);
                if (skillErr) throw skillErr;
            }

            navigate(`/report/${reportData.id}`);
        } catch (err) {
            setError('Failed to save evaluation: ' + (err.message || 'Unknown error'));
            setSaving(false);
        }
    };

    if (loading) return <div className="loading-state">Loading evaluation form...</div>;

    if (error && !student) {
        return (
            <div>
                <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                    <AlertCircle size={18} /> {error}
                </div>
                <Link to="/instructor" className="btn btn-secondary">Return to Dashboard</Link>
            </div>
        );
    }

    return (
        <div>
            <Link to={`/roster/${classId}`} className="back-link">
                <ChevronLeft size={16} /> Back to Roster
            </Link>

            <div className="page-header">
                <h1 className="page-title">Evaluating {student?.name}</h1>
                <p className="page-subtitle">Level: {classInfo?.levels?.name}</p>
            </div>

            {error && (
                <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            <form onSubmit={handleSave}>
                {/* Skills Checklist */}
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <div className="card-header">Skills Checklist</div>
                    {skillList.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-title">No skills configured</div>
                            <p>No skills have been set up for this level yet.</p>
                        </div>
                    ) : (
                        skillList.map(skill => (
                            <div key={skill.id} className="skill-row">
                                <span className="skill-name">{skill.name}</span>
                                <div className="skill-toggles">
                                    <button
                                        type="button"
                                        className={`skill-btn skill-btn-pass ${skillsValues[skill.id] === 'pass' ? 'active' : ''}`}
                                        onClick={() => handleSkillChange(skill.id, 'pass')}
                                    >
                                        <Check size={13} /> Pass
                                    </button>
                                    <button
                                        type="button"
                                        className={`skill-btn skill-btn-notyet ${skillsValues[skill.id] === 'not_yet' ? 'active' : ''}`}
                                        onClick={() => handleSkillChange(skill.id, 'not_yet')}
                                    >
                                        <X size={13} /> Not Yet
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Comments */}
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <div className="card-header">Instructor Comments</div>
                    <div className="card-body">
                        <textarea
                            className="input-field"
                            rows="4"
                            placeholder="Add specific observations, areas of improvement, and positive feedback..."
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn" disabled={saving}>
                        <Save size={16} />
                        {saving ? 'Saving...' : 'Save Evaluation'}
                    </button>
                </div>
            </form>
        </div>
    );
}
