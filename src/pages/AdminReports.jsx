import React, { useEffect, useState } from 'react';
import { Filter } from 'lucide-react';
import { supabase } from '../supabase';

export default function AdminReports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadAllReports() {
            // Query reports and join their related dimensional tables
            const { data } = await supabase
                .from('feedback_reports')
                .select(`
          id,
          session_date,
          students (name),
          classes (name),
          profiles:instructor_id (full_name)
        `)
                .order('session_date', { ascending: false });

            if (data) setReports(data);
            setLoading(false);
        }
        loadAllReports();
    }, []);

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
                        {loading ? (
                            <tr><td colSpan="5" style={{ padding: '2rem' }}>Loading reports...</td></tr>
                        ) : reports.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: '2rem' }}>No evaluations have been submitted yet.</td></tr>
                        ) : (
                            reports.map(report => (
                                <tr key={report.id}>
                                    <td style={{ color: 'var(--text-muted)' }}>{report.session_date}</td>
                                    <td style={{ fontWeight: 500 }}>{report.students?.name}</td>
                                    <td>{report.classes?.name}</td>
                                    <td>{report.profiles?.full_name}</td>
                                    <td>
                                        <a href={`/report/${report.id}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500, fontSize: '0.875rem' }}>View Report</a>
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
