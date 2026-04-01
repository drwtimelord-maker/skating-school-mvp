import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, CheckCircle, Circle, Printer, FileText } from 'lucide-react';
import { supabase } from '../supabase';

export default function PrintableReport() {
    const { reportId } = useParams();
    const [report, setReport] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadReport() {
            if (!reportId) return;

            const { data: rep } = await supabase
                .from('feedback_reports')
                .select(`
          *,
          students (name),
          profiles:instructor_id (full_name),
          classes (name, levels(name))
        `)
                .eq('id', reportId)
                .single();

            setReport(rep);

            const { data: res } = await supabase
                .from('feedback_skill_results')
                .select(`
          id,
          pass_status,
          skills (name)
        `)
                .eq('report_id', reportId);

            setResults(res || []);
            setLoading(false);
        }
        loadReport();
    }, [reportId]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading Printable Report...</div>;
    if (!report) return <div style={{ padding: '2rem' }}>Report not found.</div>;

    return (
        <div style={{ padding: '0 2rem' }}>
            <div className="dev-nav" style={{ padding: '1rem 0', margin: 0, border: 'none', display: 'flex', justifyContent: 'space-between' }}>
                <Link to={`/roster/${report.class_id}`} style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--text-muted)', textDecoration: 'none' }}>
                    <ChevronLeft size={16} /> Back to Roster
                </Link>
                <button onClick={handlePrint} className="btn" style={{ padding: '0.5rem 1rem' }}>
                    <Printer size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                    Print Report
                </button>
            </div>

            <div style={{ maxWidth: '800px', margin: '2rem auto', background: 'white', padding: '3rem', border: '1px solid var(--border)' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem', borderBottom: '2px solid var(--text-main)', paddingBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>SKATING SKILLS EVALUATION</h1>
                    <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', margin: 0 }}>{report.classes?.levels?.name}</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', fontWeight: 500, fontSize: '1.125rem' }}>
                    <div><strong>Student:</strong> {report.students?.name}</div>
                    <div><strong>Date:</strong> {report.session_date}</div>
                    <div><strong>Instructor:</strong> {report.profiles?.full_name}</div>
                </div>

                <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Skills Mastery</h2>

                <div style={{ marginBottom: '3rem', fontSize: '1.125rem' }}>
                    {results.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>No specific skills evaluated.</p>
                    ) : (
                        results.map(res => (
                            <div key={res.id} style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px dashed var(--border)' }}>
                                {res.pass_status === 'pass' ? (
                                    <CheckCircle size={24} color="var(--success)" style={{ marginRight: '1rem' }} />
                                ) : (
                                    <Circle size={24} color="var(--warning)" style={{ marginRight: '1rem' }} />
                                )}
                                <span>
                                    {res.skills?.name} {res.pass_status === 'not_yet' && <span style={{ color: 'var(--text-muted)', fontSize: '0.875em' }}>(Needs Work)</span>}
                                </span>
                            </div>
                        ))
                    )}
                </div>

                <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Instructor Notes</h2>
                <div style={{ padding: '1.5rem', background: 'var(--bg)', borderRadius: 'var(--radius)', minHeight: '150px', fontSize: '1.125rem' }}>
                    {report.comments || <span style={{ color: 'var(--text-muted)' }}>No additional comments provided.</span>}
                </div>
            </div>
        </div>
    );
}
