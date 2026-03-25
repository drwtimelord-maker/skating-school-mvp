import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Bypass auth for MVP frontend
        navigate('/dashboard');
    };

    return (
        <div style={{ maxWidth: '400px', margin: '4rem auto' }}>
            <div className="card">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', background: 'var(--primary)', padding: '1rem', borderRadius: '50%', color: 'white', marginBottom: '1rem' }}>
                        <LogIn size={24} />
                    </div>
                    <h2 className="card-title" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Instructor Portal</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Sign in to manage classes & feedback</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label className="input-label" htmlFor="email">Email address</label>
                        <input
                            id="email"
                            type="email"
                            className="input-field"
                            placeholder="instructor@skate.school"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="input-field"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }}>
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}
