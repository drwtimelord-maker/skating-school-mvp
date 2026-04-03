import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, FileSignature, AlertCircle } from 'lucide-react';
import { supabase } from '../supabase';

export default function ClassRoster() {
    const { classId } = useParams();
    const navigate = useNavigate();

    const [classInfo, setClassInfo] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchRoster() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) { navigate('/login'); return; }

                const { data: classData, error: classError } = await supabase
                    .from('classes').select('*, levels(name)').eq('id', classId).single();
                if (classError) throw classError;
                setClassInfo(classData);

                const { data: enrollments, error: enrollError } = await supabase
                    .from('class_enrollments')
                    .select('students (id, name, age)')
                    .eq('class_id', classId);
                if (enrollError) throw enrollError;

                if (enrollments && enrollments.length > 0) {
                    const studentIds = enrollments.map(e => e.students.id);
                    const { data: reports, error: repsError } = await supabase
                        .from('feedback_reports')
                        .select('id, student_id')
                        .eq('class_id', classId)
                        .in('student_id', studentIds);
                    if (repsError) throw repsError;

                    setStudents(enrollments.map(e => {
                        const student = e.students;
                        const report = reports?.find(r => r.student_id === student.id);
                        return { ...student, report_id: report?.id, status: report ? 'Completed' : 'Needs Evaluation' };
                    }));
                } else {
                    setStudents([]);
                }
            } catch (err) {
                setError(err.message || 'Failed to load class roster');
            } finally {
                setLoading(false);
            }
        }
        fetchRoster();
    }, [classId, navigate]);

    if (loading) return <div className="loading-state">Loading roster...</div>;

    if (error) {
        return (
            <div>
                <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                    <AlertCircle size={18} />
                    {error}
                </div>
                <Link to="/instructor" className="btn btn-secondary">Return to Dashboard</Link>
            </div>
        );
    }

    return (
        <div>
            <Link to="/instructor" className="back-link">
                <ChevronLeft size={16} /> Back to Dashboard
            </Link>

            <div className="page-header">
                <h1 className="page-title">{classInfo?.name}</h1>
                <p className="page-subtitle">Level: {classInfo?.levels?.name || 'Unknown Level'} · {students.length} student{students.length !== 1 ? 's' : ''}</p>
            </div>

            <div className="card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Age</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.length === 0 ? (
                            <tr>
                                <td colSpan="4">
                                    <div className="empty-state">
                                        <div className="empty-state-title">No students enrolled</div>
                                        <p>No students are currently enrolled in this class.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            students.map(student => (
                                <tr key={student.id}>
                                    <td style={{ fontWeight: 500 }}>{student.name}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{student.age}</td>
                                    <td>
                                        <span className={`badge ${student.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td>
                                        <Link
                                            to={student.report_id ? `/report/${student.report_id}` : `/feedback/${student.id}?classId=${classId}`}
                                            className="btn btn-secondary btn-sm"
                                        >
                                            <FileSignature size={14} />
                                            {student.status === 'Completed' ? 'View Report' : 'Evaluate'}
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
