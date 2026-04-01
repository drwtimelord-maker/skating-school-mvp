import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import InstructorDashboard from './pages/InstructorDashboard';
import ClassRoster from './pages/ClassRoster';
import StudentFeedback from './pages/StudentFeedback';
import AdminReports from './pages/AdminReports';
import PrintableReport from './pages/PrintableReport';

function App() {
    return (
        <Router>
            <div className="app-container">
                {/* Simple navigation to make development/testing easier */}
                <nav className="dev-nav">
                    <ul style={{ margin: 0, padding: 0 }}>
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/dashboard">Dashboard</Link></li>
                        <li><Link to="/admin">Admin Reports</Link></li>
                    </ul>
                </nav>

                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Login />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/dashboard" element={<InstructorDashboard />} />
                        <Route path="/roster/:classId" element={<ClassRoster />} />
                        <Route path="/feedback/:studentId" element={<StudentFeedback />} />
                        <Route path="/admin" element={<AdminReports />} />
                        <Route path="/report/:reportId" element={<PrintableReport />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
