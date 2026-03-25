import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, CheckCircle, Circle, Printer } from 'lucide-react';

export default function PrintableReport() {
    const { studentId } = useParams();

    const handlePrint = () => {
        window.print();
    };

    return (
        <div style={{ padding: '0 2rem' }}>
            <div className="dev-nav" style={{ padding: '1rem 0', margin: 0, border: 'none', display: 'flex', justifyContent: 'space-between' }}>
                <Link to={`/feedback/${studentId}`} style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--text-muted)', textDecoration: 'none' }}>
                    <ChevronLeft size={16} /> Back to Form
                </Link>
                <button onClick={handlePrint} className="btn" style={{ padding: '0.5rem 1rem' }}>
                    <Printer size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                    Print Report
                </button>
            </div>

            <div style={{ maxWidth: '800px', margin: '2rem auto', background: 'white', padding: '3rem', border: '1px solid var(--border)' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem', borderBottom: '2px solid var(--text-main)', paddingBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>SKATING SKILLS EVALUATION</h1>
                    <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', margin: 0 }}>Basic Skills Level 1</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', fontWeight: 500, fontSize: '1.125rem' }}>
                    <div><strong>Student:</strong> Emma Watson</div>
                    <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
                    <div><strong>Instructor:</strong> Sarah</div>
                </div>

                <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Skills Mastery</h2>

                <div style={{ marginBottom: '3rem', fontSize: '1.125rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px dashed var(--border)' }}>
                        <CheckCircle size={24} color="var(--success)" style={{ marginRight: '1rem' }} />
                        Sit and stand up on ice
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px dashed var(--border)' }}>
                        <Circle size={24} color="var(--text-muted)" style={{ marginRight: '1rem' }} />
                        March forward across ice (Needs Work)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px dashed var(--border)' }}>
                        <CheckCircle size={24} color="var(--success)" style={{ marginRight: '1rem' }} />
                        Two-foot glide
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px dashed var(--border)' }}>
                        <CheckCircle size={24} color="var(--success)" style={{ marginRight: '1rem' }} />
                        Dip in place
                    </div>
                </div>

                <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Instructor Notes</h2>
                <div style={{ padding: '1.5rem', background: 'var(--bg)', borderRadius: 'var(--radius)', minHeight: '150px', fontSize: '1.125rem' }}>
                    Emma has done a fantastic job this session! Her two-foot glides are very stable. Let's work on pushing off stronger to get more distance in marches next class.
                </div>
            </div>
        </div>
    );
}
