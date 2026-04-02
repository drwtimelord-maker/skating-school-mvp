import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';
import { supabase } from '../supabase';

export default function Login() {
    const navigate = useNavigate();
    const [isSignUp, setIsSignUp] = useState(false);

    // Form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('instructor');

    // Feedback state
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Helper to ensure profile exists, check role, and navigate
    const ensureProfileAndRoute = async (user) => {
        // Check if the profile already exists in public.profiles
        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        let currentRole = profile?.role;

        // If profile doesn't exist yet (e.g. they confirmed email later), create it now
        if (!profile && user.user_metadata) {
            const { full_name, role: metaRole } = user.user_metadata;

            const { error: insertError } = await supabase.from('profiles').insert({
                id: user.id,
                full_name: full_name || 'New User',
                role: metaRole || 'instructor'
            });

            if (insertError) {
                setError('Login successful, but profile setup failed: ' + insertError.message);
                setLoading(false);
                return;
            }
            currentRole = metaRole;
        }

        // Route based on role
        if (currentRole === 'admin') {
            navigate('/admin/reports');
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
            // --- SIGN UP FLOW ---
            // We store the full_name and role inside options.data (user_metadata)
            // so it's safely kept by Auth even if email confirmation prevents immediate login.
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: role
                    }
                }
            });

            if (authError) {
                setError(authError.message);
                setLoading(false);
                return;
            }

            // Check if we got an immediate session
            if (authData?.session) {
                // User is fully authenticated immediately (Email confirmations are OFF)
                await ensureProfileAndRoute(authData.user);
            } else if (authData?.user) {
                // User is created but NOT authenticated yet (Email confirmations are ON)
                setSuccess('Account created! Please check your email to verify your account before logging in.');
                setLoading(false);
                // Switch them back to login view to await their eventual return
                setIsSignUp(false);
                setPassword('');
            }

        } else {
            // --- LOGIN FLOW ---
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                setError(authError.message);
                setLoading(false);
                return;
            }

            if (authData?.user) {
                // They are fully logged in. Ensure profile and route them!
                await ensureProfileAndRoute(authData.user);
            }
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '4rem auto' }}>
            <div className="card">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', background: 'var(--primary)', padding: '1rem', borderRadius: '50%', color: 'white', marginBottom: '1rem' }}>
                        {isSignUp ? <UserPlus size={24} /> : <LogIn size={24} />}
                    </div>
                    <h2 className="card-title" style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>
                        {isSignUp ? 'Create an Account' : 'Instructor Portal'}
                    </h2>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {isSignUp ? 'Sign up to evaluate students' : 'Sign in to manage classes & feedback'}
                    </p>
                </div>

                {error && (
                    <div style={{ background: 'var(--warning-bg)', color: 'var(--warning)', padding: '0.75rem', borderRadius: 'var(--radius)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                        {error}
                    </div>
                )}
                {success && (
                    <div style={{ background: 'var(--success-bg)', color: 'var(--success)', padding: '0.75rem', borderRadius: 'var(--radius)', marginBottom: '1rem', fontSize: '0.875rem' }}>
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
                                <label className="input-label" htmlFor="role">Role (MVP Demo)</label>
                                <select
                                    id="role"
                                    className="input-field"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    required
                                >
                                    <option value="instructor">Instructor</option>
                                    <option value="admin">Administrator</option>
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

                    <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                        {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {isSignUp ? (
                        <p>Already have an account? <button type="button" onClick={() => { setIsSignUp(false); setError(''); setSuccess(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 500, padding: 0 }}>Log in</button></p>
                    ) : (
                        <p>Need an account? <button type="button" onClick={() => { setIsSignUp(true); setError(''); setSuccess(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 500, padding: 0 }}>Sign up</button></p>
                    )}
                </div>
            </div>
        </div>
    );
}
