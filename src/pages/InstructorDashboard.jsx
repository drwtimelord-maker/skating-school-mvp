import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Calendar, ClipboardList } from 'lucide-react';
import { supabase } from '../supabase';

export default function InstructorDashboard() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadDashboard() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }

            // Fetch profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            setProfile(profileData);

            // Fetch classes assigned to this instructor via foreign key joins
            const { data: classLinks } = await supabase
                .from('class_instructors')
                .select(`
          class_id,
          classes (
            id,
            name,
            schedule_time,
            levels (name)
          )
        `)
                .eq('instructor_id', user.id);

            if (classLinks) {
                setClasses(classLinks.map(link => link.classes));
            }
            setLoading(false);
        }
        loadDashboard();
    }, [navigate]);

    if (loading) return <div style={{ padding: '2rem' }}>Loading Dashboard...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Dashboard</h1>
                <p style={{ color: 'var(--text-muted)' }}>Welcome, {profile?.full_name || 'Instructor'}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

                {classes.length === 0 ? (
                    <div className="card">
                        <p style={{ color: 'var(--text-muted)' }}>No classes assigned right now.</p>
                    </div>
                ) : (
                    classes.map(cls => (
                        <div key={cls.id} className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: 'var(--radius)', color: 'white' }}>
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <h2 className="card-title" style={{ margin: 0 }}>{cls.name}</h2>
                                    <p style={{ color: 'var(--text-muted)' }}>{cls.schedule_time} | {cls.levels?.name}</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <Link to={`/roster/${cls.id}`} className="btn" style={{ flex: 1 }}>
                                    <Users size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                                    View Roster
                                </Link>
                            </div>
                        </div>
                    ))
                )}

            </div>
        </div>
    );
}
