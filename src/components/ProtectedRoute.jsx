import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabase';

/**
 * ProtectedRoute — blocks unauthenticated users from accessing protected pages.
 * Optionally restricts access to a specific role (e.g., 'admin').
 *
 * Props:
 *  - children:      The page component to render if authorized
 *  - requiredRole:  (optional) 'admin' | 'instructor' — if set, only that role gets through
 */
export default function ProtectedRoute({ children, requiredRole }) {
    const [status, setStatus] = useState('loading'); // 'loading' | 'authorized' | 'unauthorized' | 'forbidden'

    useEffect(() => {
        async function checkAuth() {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setStatus('unauthorized');
                return;
            }

            if (requiredRole) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (profile?.role !== requiredRole) {
                    setStatus('forbidden');
                    return;
                }
            }

            setStatus('authorized');
        }
        checkAuth();
    }, [requiredRole]);

    if (status === 'loading') {
        return <div className="loading-state">Verifying access...</div>;
    }

    if (status === 'unauthorized') {
        return <Navigate to="/login" replace />;
    }

    if (status === 'forbidden') {
        return (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
                <div className="card" style={{ maxWidth: '440px', margin: '0 auto' }}>
                    <div className="card-body" style={{ padding: '2.5rem' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚫</div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                            Access Denied
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '1.5rem' }}>
                            You don't have the required <strong>{requiredRole}</strong> role to view this page.
                        </p>
                        <a href="/instructor" className="btn btn-secondary">Go to Dashboard</a>
                    </div>
                </div>
            </div>
        );
    }

    return children;
}
