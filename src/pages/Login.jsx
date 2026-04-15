import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

export default function Login() {
    const navigate = useNavigate();
    const [isSignUp, setIsSignUp] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [signUpRole, setSignUpRole] = useState('instructor');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const ensureProfileAndRoute = async (user) => {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        let currentRole = profile?.role;

        if (!profile && user.user_metadata) {
            const { full_name, role: metaRole } = user.user_metadata;
            const { error: insertError } = await supabase.from('profiles').insert({
                id: user.id,
                email: user.email,
                full_name: full_name || 'New User',
                role: metaRole || signUpRole
            });
            if (insertError) {
                setError('Login successful, but profile setup failed: ' + insertError.message);
                setLoading(false);
                return;
            }
            currentRole = metaRole || 'instructor';
        }

        if (currentRole === 'admin') {
            navigate('/admin/reports');
        } else if (currentRole === 'parent') {
            navigate('/parent');
        } else {
            navigate('/instructor');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (isSignUp) {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { full_name: fullName, role: signUpRole } }
            });

            if (authError) { setError(authError.message); setLoading(false); return; }

            if (authData?.session) {
                await ensureProfileAndRoute(authData.user);
            } else if (authData?.user) {
                setSuccess('Account created! Check your email to verify your account before logging in.');
                setLoading(false);
                setIsSignUp(false);
                setPassword('');
            }
        } else {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
            if (authError) { setError(authError.message); setLoading(false); return; }
            if (authData?.user) await ensureProfileAndRoute(authData.user);
        }

        if (!isSignUp || error) setLoading(false);
    };

    return (
        <div style={{ width: '100%', maxWidth: '420px' }}>
            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '52px', height: '52px',
                    background: 'linear-gradient(135deg, #003FB1, #1A56DB)',
                    borderRadius: '14px', fontSize: '1.5rem', marginBottom: '1rem',
                    boxShadow: '0 8px 24px rgba(26,86,219,0.25)'
                }}>⛸</div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                    {isSignUp ? 'Create Account' : 'Welcome back'}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
                    {isSignUp ? 'Join SkateTrack to evaluate students' : 'Sign in to your instructor portal'}
                </p>
            </div>

            <div className="card">
                <div className="card-body">
                    {error && (
                        <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {isSignUp && (
                            <>
                                <div className="input-group">
                                    <label className="input-label" htmlFor="fullName">Full Name</label>
                                    <input
                                        id="fullName"
                                        type="text"
                                        className="input-field"
                                        placeholder="Jane Doe"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label" htmlFor="signUpRole">I am a...</label>
                                    <select
                                        id="signUpRole"
                                        className="input-field"
                                        value={signUpRole}
                                        onChange={(e) => setSignUpRole(e.target.value)}
                                    >
                                        <option value="instructor">Instructor</option>
                                        <option value="parent">Parent</option>
                                    </select>
                                </div>
                            </>
                        )}

                        <div className="input-group">
                            <label className="input-label" htmlFor="email">Email address</label>
                            <input
                                id="email"
                                type="email"
                                className="input-field"
                                placeholder="instructor@skate.school"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn"
                            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
                            disabled={loading || !!success}
                        >
                            {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
                        </button>
                    </form>

                    <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        {isSignUp ? (
                            <p>Already have an account?{' '}
                                <button type="button" onClick={() => { setIsSignUp(false); setError(''); setSuccess(''); }}
                                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, padding: 0, fontFamily: 'var(--font)', fontSize: 'inherit' }}>
                                    Sign in
                                </button>
                            </p>
                        ) : (
                            <p>Need an account?{' '}
                                <button type="button" onClick={() => { setIsSignUp(true); setError(''); setSuccess(''); }}
                                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, padding: 0, fontFamily: 'var(--font)', fontSize: 'inherit' }}>
                                    Sign up
                                </button>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
