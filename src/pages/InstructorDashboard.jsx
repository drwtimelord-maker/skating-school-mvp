import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Calendar } from 'lucide-react';
import { supabase } from '../supabase';

export default function InstructorDashboard() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadDashboard() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { navigate('/login'); return; }

            const { data: profileData } = await supabase
                .from('profiles').select('*').eq('id', user.id).single();
            setProfile(profileData);

            const { data: classLinks } = await supabase
                .from('class_instructors')
                .select(`class_id, classes (id, name, schedule_time, levels (name))`)
                .eq('instructor_id', user.id);

            if (classLinks) {
                setClasses(classLinks.map(link => link.classes).filter(Boolean));
            }
            setLoading(false);
        }
        loadDashboard();
    }, [navigate]);

    if (loading) {
        return <div className="loading-state">Loading dashboard...</div>;
    }

    const firstName = profile?.full_name?.split(' ')[0] || 'Instructor';

    return (
        <div>
            <div className="page-header">
                <div className="page-header-row">
                    <div>
                        <h1 className="page-title">Good day, {firstName} 👋</h1>
                        <p className="page-subtitle">
                            {classes.length === 0
                                ? 'No classes assigned yet'
                                : `You have ${classes.length} class${classes.length !== 1 ? 'es' : ''} assigned`}
                        </p>
                    </div>
                </div>
            </div>

            {classes.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon"><Calendar size={40} /></div>
                        <div className="empty-state-title">No classes assigned</div>
                        <p>Contact your administrator to be assigned to a class.</p>
                    </div>
                </div>
            ) : (
                <div className="class-grid">
                    {classes.map(cls => (
                        <div key={cls.id} className="class-card">
                            <div className="class-card-body">
                                <div style={{ marginBottom: '1rem' }}>
                                    <span className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>
                                        {cls.levels?.name || 'Unknown Level'}
                                    </span>
                                    <h2 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                                        {cls.name}
                                    </h2>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                        {cls.schedule_time}
                                    </p>
                                </div>
                                <Link to={`/roster/${cls.id}`} className="btn" style={{ width: '100%' }}>
                                    <Users size={16} />
                                    View Roster
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
