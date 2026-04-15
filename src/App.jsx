import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import InstructorDashboard from './pages/InstructorDashboard';
import ClassRoster from './pages/ClassRoster';
import StudentFeedback from './pages/StudentFeedback';
import AdminReports from './pages/AdminReports';
import PrintableReport from './pages/PrintableReport';
import SkillsManager from './pages/SkillsManager';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import { supabase } from './supabase';

// Routes that should NOT show the sidebar
const NO_SIDEBAR_ROUTES = ['/', '/login'];

function AppShell() {
    const location = useLocation();
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    const showSidebar = !NO_SIDEBAR_ROUTES.includes(location.pathname);

    useEffect(() => {
        async function fetchRole() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                setRole(profile?.role || 'instructor');
            }
            setLoading(false);
        }
        fetchRole();

        const { data: listener } = supabase.auth.onAuthStateChange(() => {
            fetchRole();
        });
        return () => listener.subscription.unsubscribe();
    }, [location.pathname]);

    if (loading && showSidebar) return null;

    return (
        <>
            {showSidebar && <Sidebar role={role} />}
            <div className={showSidebar ? 'page-area' : 'auth-area'}>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/instructor" element={
                        <ProtectedRoute>
                            <InstructorDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/roster/:classId" element={
                        <ProtectedRoute>
                            <ClassRoster />
                        </ProtectedRoute>
                    } />
                    <Route path="/feedback/:studentId" element={
                        <ProtectedRoute>
                            <StudentFeedback />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/reports" element={
                        <ProtectedRoute requiredRole="admin">
                            <AdminReports />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/skills" element={
                        <ProtectedRoute requiredRole="admin">
                            <SkillsManager />
                        </ProtectedRoute>
                    } />
                    <Route path="/report/:reportId" element={
                        <ProtectedRoute>
                            <PrintableReport />
                        </ProtectedRoute>
                    } />
                </Routes>
            </div>
        </>
    );
}

function App() {
    return (
        <Router>
            <div className="app-shell">
                <AppShell />
            </div>
        </Router>
    );
}

export default App;
