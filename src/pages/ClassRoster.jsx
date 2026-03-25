import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, FileSignature } from 'lucide-react';

export default function ClassRoster() {
    const { classId } = useParams();

    const mockStudents = [
        { id: 1, name: 'Emma Watson', age: 8, status: 'Needs Evaluation' },
        { id: 2, name: 'Noah Smith', age: 9, status: 'Completed' },
        { id: 3, name: 'Olivia Jones', age: 7, status: 'Needs Evaluation' },
    ];

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1rem' }}>
                    <ChevronLeft size={16} /> Back to Dashboard
                </Link>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Basic Skills 1 Roster</h1>
                <p style={{ color: 'var(--text-muted)' }}>Class ID: {classId}</p>
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
                        {mockStudents.map(student => (
                            <tr key={student.id}>
                                <td style={{ fontWeight: 500 }}>{student.name}</td>
                                <td>{student.age}</td>
                                <td>
                                    <span className={`badge ${student.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>
                                        {student.status}
                                    </span>
                                </td>
                                <td>
                                    <Link to={`/feedback/${student.id}`} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                                        <FileSignature size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                                        {student.status === 'Completed' ? 'Edit Evaluation' : 'Evaluate'}
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
