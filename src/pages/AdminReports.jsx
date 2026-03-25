import React from 'react';
import { Filter } from 'lucide-react';

export default function AdminReports() {
    const mockReports = [
        { id: 1, student: 'Emma Watson', class: 'Basic Skills 1', instructor: 'Sarah', date: 'Oct 12, 2023' },
        { id: 2, student: 'Noah Smith', class: 'Basic Skills 2', instructor: 'Mike', date: 'Oct 11, 2023' },
        { id: 3, student: 'Olivia Jones', class: 'Basic Skills 1', instructor: 'Sarah', date: 'Oct 11, 2023' },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>All Evaluations</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Overview of completed school-wide feedback reports</p>
                </div>
                <button className="btn btn-secondary">
                    <Filter size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                    Filter Data
                </button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="data-table">
                    <thead style={{ background: 'var(--bg)' }}>
                        <tr>
                            <th>Date</th>
                            <th>Student Name</th>
                            <th>Class Level</th>
                            <th>Instructor</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockReports.map(report => (
                            <tr key={report.id}>
                                <td style={{ color: 'var(--text-muted)' }}>{report.date}</td>
                                <td style={{ fontWeight: 500 }}>{report.student}</td>
                                <td>{report.class}</td>
                                <td>{report.instructor}</td>
                                <td>
                                    <a href={`/report/${report.id}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500, fontSize: '0.875rem' }}>View Report</a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
