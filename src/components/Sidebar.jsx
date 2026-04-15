import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, LogOut, Layers } from 'lucide-react';
import { supabase } from '../supabase';

export default function Sidebar({ role }) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-name">⛸ SkateTrack</div>
                <div className="sidebar-logo-sub">Instructor Portal</div>
            </div>

            <nav className="sidebar-nav">
                {role === 'admin' ? (
                    <>
                        <Link
                            to="/admin/reports"
                            className={`sidebar-link ${isActive('/admin/reports') ? 'active' : ''}`}
                        >
                            <ClipboardList size={18} />
                            All Reports
                        </Link>
                        <Link
                            to="/admin/skills"
                            className={`sidebar-link ${isActive('/admin/skills') ? 'active' : ''}`}
                        >
                            <Layers size={18} />
                            Skills & Levels
                        </Link>
                    </>
                ) : (
                    <>
                        <Link
                            to="/instructor"
                            className={`sidebar-link ${isActive('/instructor') ? 'active' : ''}`}
                        >
                            <LayoutDashboard size={18} />
                            Dashboard
                        </Link>
                        <Link
                            to="/instructor"
                            className={`sidebar-link ${location.pathname.startsWith('/roster') ? 'active' : ''}`}
                        >
                            <ClipboardList size={18} />
                            My Classes
                        </Link>
                    </>
                )}
            </nav>

            <div className="sidebar-footer">
                <button className="sidebar-sign-out" onClick={handleSignOut}>
                    <LogOut size={16} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
