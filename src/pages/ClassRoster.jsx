import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, FileSignature } from 'lucide-react';
import { supabase } from '../supabase';

export default function ClassRoster() {
    const { classId } = useParams();
    const navigate = useNavigate();
    const [classInfo, setClassInfo] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRoster() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }

            // Fetch class basic info
            const { data: classData } = await supabase
                .from('classes')
                .select('*, levels(name)')
                .eq('id', classId)
                .single();
            setClassInfo(classData);

            // Fetch enrollments mapped to students
            const { data: enrollments } = await supabase
                .from('class_enrollments')
                .select(`
          students (id, name, age)
        `)
                .eq('class_id', classId);

            if (enrollments) {
                // Also fetch feedback reports to determine status
                const studentIds = enrollments.map(e => e.students.id);
                const { data: reports } = await supabase
                    .from('feedback_reports')
                    .select('id, student_id')
                    .eq('class_id', classId)
                    .in('student_id', studentIds);

                const mappedStudents = enrollments.map(e => {
                    const student = e.students;
                    const report = reports?.find(r => r.student_id === student.id);
                    return {
                        ...student,
                        report_id: report?.id,
                        status: report ? 'Completed' : 'Needs Evaluation'
                    };
                });

                setStudents(mappedStudents);
            }
            setLoading(false);
        }
        fetchRoster();
    }, [classId, navigate]);

    if (loading) return <div style={{ padding: '2rem' }}>Loading Roster...</div>;

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1rem' }}>
                    <ChevronLeft size={16} /> Back to Dashboard
                </Link>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>{classInfo?.name} Roster</h1>
                <p style={{ color: 'var(--text-muted)' }}>Level: {classInfo?.levels?.name}</p>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="data-table">
                    <thead style={{ background: 'var(--bg)' }}>
                        <tr>
                            <th>Student Name</th>
                            <th>Age</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.length === 0 ? (
                            <tr><td colSpan="4">No students enrolled.</td></tr>
                        ) : (
                            students.map(student => (
                                <tr key={student.id}>
                                    <td style={{ fontWeight: 500 }}>{student.name}</td>
                                    <td>{student.age}</td>
                                    <td>
                                        <span className={`badge ${student.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td>
                                        <Link to={student.report_id ? `/report/${student.report_id}` : `/feedback/${student.id}?classId=${classId}`} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                                            <FileSignature size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
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
