import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calendar, Clock, User } from 'lucide-react';
import { supabase } from '../supabase';
import AIAssistant from '../components/AIAssistant';

export default function ParentDashboard() {
    const [kids, setKids] = useState([]);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchKids() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUserId(user.id);

            // Fetch students assigned to this parent, plus their classes and reports
            const { data, error } = await supabase
                .from('students')
                .select(`
                    id, 
                    name, 
                    age,
                    class_enrollments (
                        classes (
                            id, 
                            name, 
                            schedule_time,
                            levels (name)
                        )
                    ),
                    feedback_reports (
                        id, 
                        class_id, 
                        session_date
                    )
                `)
                .eq('parent_id', user.id);

            if (data) {
                setKids(data);
            }
            setLoading(false);
        }
        fetchKids();
    }, []);

    if (loading) return <div className="loading-state">Loading your skaters...</div>;

    return (
        <div>
            <div className="page-header">
                <div className="page-header-row">
                    <div>
                        <h1 className="page-title">My Skaters</h1>
                        <p className="page-subtitle">View schedules and latest progress reports</p>
                    </div>
                </div>
            </div>

            {kids.length === 0 ? (
                <div className="card">
                    <div className="card-body">
                        <div className="empty-state">
                            <div className="empty-state-title">No skaters assigned yet</div>
                            <p>Once the administrator links your child to this account, they will appear here.</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {kids.map(kid => (
                        <div className="card" key={kid.id} style={{ borderTop: '4px solid var(--primary)' }}>
                            <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.125rem' }}>
                                <User size={20} style={{ color: 'var(--primary)' }} />
                                {kid.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 400 }}>Age {kid.age}</span>
                            </div>
                            <div className="card-body" style={{ padding: 0 }}>
                                {kid.class_enrollments?.length === 0 ? (
                                    <div style={{ padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
                                        Not currently enrolled in any classes.
                                    </div>
                                ) : (
                                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                                        {kid.class_enrollments.map(enrollment => {
                                            const cls = enrollment.classes;
                                            if (!cls) return null;
                                            
                                            // Find the most recent report for this specific class
                                            const classReports = kid.feedback_reports?.filter(r => r.class_id === cls.id) || [];
                                            const latestReport = classReports.sort((a, b) => new Date(b.session_date) - new Date(a.session_date))[0];

                                            return (
                                                <li key={cls.id} style={{ 
                                                    padding: '1.25rem 1.5rem', 
                                                    borderBottom: '1px solid var(--surface-high)',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    flexWrap: 'wrap',
                                                    gap: '1rem'
                                                }}>
                                                    <div>
                                                        <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.375rem', fontSize: '1.0625rem' }}>
                                                            {cls.name}
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                                                                <Clock size={14} /> {cls.schedule_time}
                                                            </span>
                                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                                                                <Calendar size={14} /> {cls.levels?.name}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        {latestReport ? (
                                                            <Link to={`/report/${latestReport.id}`} className="btn btn-sm">
                                                                <FileText size={16} /> View Evaluation
                                                            </Link>
                                                        ) : (
                                                            <span className="badge" style={{ background: 'var(--surface-high)', color: 'var(--text-muted)' }}>
                                                                Evaluation Pending
                                                            </span>
                                                        )}
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* AI Progress Assistant — RAG feature powered by Groq */}
            {userId && <AIAssistant userId={userId} />}
        </div>
    );
}
