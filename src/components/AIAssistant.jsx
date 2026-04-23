import React, { useState, useRef } from 'react';
import { Sparkles, Send, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../supabase';
import { askGroq } from '../utils/groq';

/**
 * AIAssistant — RAG-powered chat panel for parents
 *
 * RAG Steps performed here:
 *   1. RETRIEVAL: fetchContext() queries Supabase for all feedback reports
 *      for this parent's children, including skill results.
 *   2. AUGMENTATION + GENERATION: delegated to askGroq() in utils/groq.js
 *
 * @param {string} userId - The authenticated parent's user ID
 */
export default function AIAssistant({ userId }) {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [lastQuestion, setLastQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Cache the fetched context so we don't re-query on every question
    const contextCache = useRef(null);

    /**
     * RETRIEVAL step — fetch all feedback data for this parent's children
     * and format it as structured text to be injected into the LLM prompt.
     */
    async function fetchContext() {
        if (contextCache.current) return contextCache.current;

        // Get the parent's children
        const { data: students, error: sErr } = await supabase
            .from('students')
            .select('id, name, age')
            .eq('parent_id', userId);

        if (sErr) throw sErr;

        if (!students || students.length === 0) {
            const ctx = 'No students are linked to this parent account yet.';
            contextCache.current = ctx;
            return ctx;
        }

        const studentIds = students.map(s => s.id);

        // Get all feedback reports with nested skill results (the core retrieval)
        const { data: reports, error: rErr } = await supabase
            .from('feedback_reports')
            .select(`
                id,
                session_date,
                comments,
                student_id,
                students (name, age),
                classes (name, levels (name)),
                feedback_skill_results (
                    pass_status,
                    skills (name)
                )
            `)
            .in('student_id', studentIds)
            .order('session_date', { ascending: false });

        if (rErr) throw rErr;

        if (!reports || reports.length === 0) {
            const names = students.map(s => s.name).join(', ');
            const ctx = `Parent's child(ren): ${names}. No instructor feedback reports have been submitted yet.`;
            contextCache.current = ctx;
            return ctx;
        }

        // Format retrieved data as structured context for the LLM
        const formatted = reports.map(r => {
            const skillLines = (r.feedback_skill_results || []).map(fsr =>
                `  - ${fsr.skills?.name}: ${fsr.pass_status === 'pass' ? 'PASS ✓' : 'NOT YET'}`
            );
            return [
                `Student: ${r.students?.name}, Age ${r.students?.age}`,
                `Class: ${r.classes?.name} | Level: ${r.classes?.levels?.name}`,
                `Evaluation Date: ${r.session_date}`,
                skillLines.length > 0 ? `Skills:\n${skillLines.join('\n')}` : 'Skills: (none recorded)',
                r.comments ? `Instructor Notes: ${r.comments}` : 'Instructor Notes: (none)',
            ].join('\n');
        }).join('\n---\n');

        contextCache.current = formatted;
        return formatted;
    }

    const handleAsk = async (e) => {
        e.preventDefault();
        const q = question.trim();
        if (!q) return;

        setLoading(true);
        setError('');
        setAnswer('');
        setLastQuestion(q);

        try {
            const context = await fetchContext();   // RETRIEVAL
            const response = await askGroq(q, context); // AUGMENTATION + GENERATION
            setAnswer(response);
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSuggestion = (text) => {
        setQuestion(text);
    };

    const suggestions = [
        'How is my child doing overall?',
        'What skills should we practice at home?',
        'Is my child ready to advance to the next level?',
    ];

    return (
        <div className="card" style={{ marginTop: '2rem', borderTop: '4px solid #7C3AED' }}>
            {/* Header */}
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <Sparkles size={18} style={{ color: '#7C3AED' }} />
                    <span>AI Progress Assistant</span>
                </div>
                <span style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: '#7C3AED',
                    background: '#EDE9FE',
                    padding: '0.2rem 0.625rem',
                    borderRadius: '999px',
                    letterSpacing: '0.03em',
                }}>
                    Powered by Groq
                </span>
            </div>

            <div className="card-body">
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    Ask me anything about your child's skating progress — I'll use their instructor feedback to answer.
                </p>

                {/* Suggestion chips */}
                {!answer && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                        {suggestions.map(s => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => handleSuggestion(s)}
                                className="ai-suggestion-chip"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input form */}
                <form onSubmit={handleAsk} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                    <textarea
                        id="ai-question-input"
                        className="input-field"
                        rows={2}
                        placeholder="e.g. How is Emma doing? What should she practice at home?"
                        value={question}
                        onChange={e => setQuestion(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleAsk(e);
                            }
                        }}
                        style={{ minHeight: 'auto', resize: 'none', flex: 1 }}
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        className="btn"
                        id="ai-ask-button"
                        disabled={loading || !question.trim()}
                        style={{
                            background: 'linear-gradient(135deg, #5B21B6, #7C3AED)',
                            flexShrink: 0,
                            padding: '0.625rem 1rem',
                        }}
                    >
                        {loading
                            ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                            : <Send size={16} />
                        }
                    </button>
                </form>

                {/* Error state */}
                {error && (
                    <div className="alert alert-error" style={{ marginTop: '1rem' }}>
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                {/* Loading state */}
                {loading && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '1rem 1.25rem',
                        background: 'var(--surface-low)',
                        borderRadius: 'var(--radius)',
                        color: 'var(--text-muted)',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.625rem',
                    }}>
                        <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                        Retrieving feedback data and generating response...
                    </div>
                )}

                {/* AI Response */}
                {answer && (
                    <div style={{ marginTop: '1.25rem' }}>
                        {/* The question */}
                        <div style={{
                            fontSize: '0.8125rem',
                            color: 'var(--text-muted)',
                            marginBottom: '0.625rem',
                            fontStyle: 'italic',
                        }}>
                            You asked: "{lastQuestion}"
                        </div>

                        {/* The answer */}
                        <div style={{
                            padding: '1.25rem',
                            background: 'linear-gradient(135deg, #F5F3FF, #EDE9FE)',
                            borderRadius: 'var(--radius)',
                            borderLeft: '3px solid #7C3AED',
                            lineHeight: 1.75,
                            fontSize: '0.9375rem',
                            color: 'var(--text-main)',
                        }}>
                            <div style={{
                                fontSize: '0.6875rem',
                                fontWeight: 700,
                                color: '#7C3AED',
                                marginBottom: '0.5rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                            }}>
                                AI Response
                            </div>
                            {answer}
                        </div>

                        {/* Ask another */}
                        <button
                            type="button"
                            className="btn-ghost btn"
                            style={{ marginTop: '0.875rem', fontSize: '0.8125rem' }}
                            onClick={() => { setAnswer(''); setLastQuestion(''); setQuestion(''); }}
                        >
                            Ask another question
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
