import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

export default function AdminReports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        async function loadAllReports() {
            const { data } = await supabase
                .from('feedback_reports')
                .select(`id, session_date, students (name), classes (name), profiles:instructor_id (full_name)`)
                .order('session_date', { ascending: false });
            if (data) setReports(data);
            setLoading(false);
        }
        loadAllReports();
    }, []);

    const filtered = reports.filter(r =>
        !search ||
        r.students?.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.classes?.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.profiles?.full_name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="page-header">
                <div className="page-header-row">
                    <div>
                        <h1 className="page-title">Evaluation Reports</h1>
                        <p className="page-subtitle">All submitted evaluations across the school</p>
                    </div>
                </div>
            </div>

            {/* Search bar */}
            <div style={{ marginBottom: '1.25rem' }}>
                <input
                    type="search"
                    className="input-field"
                    style={{ maxWidth: '340px' }}
                    placeholder="Search by student, class, or instructor..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Student</th>
                            <th>Class</th>
                            <th>Instructor</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5">
                                    <div className="loading-state">Loading reports...</div>
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan="5">
                                    <div className="empty-state">
                                        <div className="empty-state-title">
                                            {search ? 'No results found' : 'No evaluations yet'}
                                        </div>
                                        <p>{search ? 'Try a different search term.' : 'Evaluations will appear here once instructors submit them.'}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filtered.map(report => (
                                <tr key={report.id}>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{report.session_date}</td>
                                    <td style={{ fontWeight: 500 }}>{report.students?.name}</td>
                                    <td>{report.classes?.name}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{report.profiles?.full_name}</td>
                                    <td>
                                        <a
                                            href={`/report/${report.id}`}
                                            className="btn btn-secondary btn-sm"
                                        >
                                            View Report
                                        </a>
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
