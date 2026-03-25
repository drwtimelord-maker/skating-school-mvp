import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, ClipboardList } from 'lucide-react';

export default function InstructorDashboard() {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Dashboard</h1>
                <p style={{ color: 'var(--text-muted)' }}>Welcome, Instructor Sarah</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: 'var(--radius)', color: 'white' }}>
                            <Calendar size={24} />
                        </div>
                        <div>
                            <h2 className="card-title" style={{ margin: 0 }}>Basic Skills 1</h2>
                            <p style={{ color: 'var(--text-muted)' }}>Today at 4:00 PM</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Link to="/roster/1" className="btn" style={{ flex: 1 }}>
                            <Users size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                            View Roster
                        </Link>
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ background: 'var(--success)', padding: '0.75rem', borderRadius: 'var(--radius)', color: 'white' }}>
                            <ClipboardList size={24} />
                        </div>
                        <div>
                            <h2 className="card-title" style={{ margin: 0 }}>Recent Evaluations</h2>
                            <p style={{ color: 'var(--text-muted)' }}>2 completed this week</p>
                        </div>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        Remember to complete all mid-session evaluations by Friday.
                    </p>
                </div>
            </div>
        </div>
    );
}
