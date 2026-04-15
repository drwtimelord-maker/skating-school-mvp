import React, { useEffect, useState } from 'react';
import { Plus, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { supabase } from '../supabase';

export default function SkillsManager() {
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedLevel, setExpandedLevel] = useState(null);

    // New level form
    const [showNewLevel, setShowNewLevel] = useState(false);
    const [newLevelName, setNewLevelName] = useState('');
    const [savingLevel, setSavingLevel] = useState(false);

    // New skill form (per level)
    const [addingSkillTo, setAddingSkillTo] = useState(null);
    const [newSkillName, setNewSkillName] = useState('');
    const [savingSkill, setSavingSkill] = useState(false);

    useEffect(() => {
        loadLevels();
    }, []);

    async function loadLevels() {
        const { data } = await supabase
            .from('levels')
            .select('id, name, skills (id, name)')
            .order('name');
        if (data) {
            setLevels(data);
            // Auto-expand first level
            if (data.length > 0 && expandedLevel === null) {
                setExpandedLevel(data[0].id);
            }
        }
        setLoading(false);
    }

    async function handleAddLevel(e) {
        e.preventDefault();
        if (!newLevelName.trim()) return;
        setSavingLevel(true);
        const { error } = await supabase
            .from('levels')
            .insert({ name: newLevelName.trim() });
        if (error) {
            alert('Error adding level: ' + error.message);
        } else {
            setNewLevelName('');
            setShowNewLevel(false);
            await loadLevels();
        }
        setSavingLevel(false);
    }

    async function handleAddSkill(e, levelId) {
        e.preventDefault();
        if (!newSkillName.trim()) return;
        setSavingSkill(true);
        const { error } = await supabase
            .from('skills')
            .insert({ level_id: levelId, name: newSkillName.trim() });
        if (error) {
            alert('Error adding skill: ' + error.message);
        } else {
            setNewSkillName('');
            setAddingSkillTo(null);
            await loadLevels();
        }
        setSavingSkill(false);
    }

    async function handleDeleteSkill(skillId) {
        if (!confirm('Remove this skill? This cannot be undone.')) return;
        const { error } = await supabase
            .from('skills')
            .delete()
            .eq('id', skillId);
        if (error) {
            alert('Error deleting skill: ' + error.message);
        } else {
            await loadLevels();
        }
    }

    async function handleDeleteLevel(levelId) {
        const level = levels.find(l => l.id === levelId);
        const skillCount = level?.skills?.length || 0;
        if (!confirm(`Delete "${level?.name}" and its ${skillCount} skill(s)? This cannot be undone.`)) return;
        const { error } = await supabase
            .from('levels')
            .delete()
            .eq('id', levelId);
        if (error) {
            alert('Error deleting level: ' + error.message);
        } else {
            await loadLevels();
        }
    }

    return (
        <div>
            <div className="page-header">
                <div className="page-header-row">
                    <div>
                        <h1 className="page-title">Skills & Levels</h1>
                        <p className="page-subtitle">Manage skating levels and their skill checklists</p>
                    </div>
                    <button
                        className="btn"
                        onClick={() => { setShowNewLevel(true); setNewLevelName(''); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                    >
                        <Plus size={16} />
                        Add Level
                    </button>
                </div>
            </div>

            {/* New Level Form */}
            {showNewLevel && (
                <div className="card" style={{ marginBottom: '1.25rem', borderLeft: '4px solid var(--primary)' }}>
                    <div className="card-body">
                        <form onSubmit={handleAddLevel} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                            <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                                <label className="input-label">New Level Name</label>
                                <input
                                    className="input-field"
                                    type="text"
                                    placeholder="e.g. Basic Skills 3"
                                    value={newLevelName}
                                    onChange={(e) => setNewLevelName(e.target.value)}
                                    autoFocus
                                    required
                                />
                            </div>
                            <button className="btn" type="submit" disabled={savingLevel}>
                                {savingLevel ? 'Saving...' : 'Save Level'}
                            </button>
                            <button
                                className="btn btn-secondary"
                                type="button"
                                onClick={() => setShowNewLevel(false)}
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="loading-state">Loading skills...</div>
            ) : levels.length === 0 ? (
                <div className="card">
                    <div className="card-body">
                        <div className="empty-state">
                            <div className="empty-state-title">No levels yet</div>
                            <p>Click "Add Level" to create your first skating level.</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {levels.map(level => {
                        const isExpanded = expandedLevel === level.id;
                        const skills = level.skills || [];
                        return (
                            <div className="card" key={level.id} style={{ borderLeft: '4px solid var(--primary)' }}>
                                <div className="card-body" style={{ padding: 0 }}>
                                    {/* Level header */}
                                    <div
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '1rem 1.25rem', cursor: 'pointer',
                                            borderBottom: isExpanded ? '1px solid var(--border)' : 'none'
                                        }}
                                        onClick={() => setExpandedLevel(isExpanded ? null : level.id)}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                            <span style={{ fontWeight: 600, fontSize: '1.0625rem' }}>{level.name}</span>
                                            <span className="badge" style={{ background: 'var(--bg-main)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                                {skills.length} skill{skills.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            style={{ color: '#dc2626', borderColor: '#fecaca' }}
                                            onClick={(e) => { e.stopPropagation(); handleDeleteLevel(level.id); }}
                                            title="Delete this level"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>

                                    {/* Expanded skill list */}
                                    {isExpanded && (
                                        <div style={{ padding: '0.75rem 1.25rem 1rem' }}>
                                            {skills.length === 0 ? (
                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                                                    No skills added yet for this level.
                                                </p>
                                            ) : (
                                                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 0.75rem 0' }}>
                                                    {skills.map(skill => (
                                                        <li
                                                            key={skill.id}
                                                            style={{
                                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                                padding: '0.5rem 0.75rem', borderRadius: '6px',
                                                                fontSize: '0.9375rem',
                                                                transition: 'background 0.15s'
                                                            }}
                                                            className="skill-row"
                                                        >
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <span style={{
                                                                    width: '6px', height: '6px', borderRadius: '50%',
                                                                    background: 'var(--primary)', display: 'inline-block', flexShrink: 0
                                                                }} />
                                                                {skill.name}
                                                            </span>
                                                            <button
                                                                onClick={() => handleDeleteSkill(skill.id)}
                                                                style={{
                                                                    background: 'none', border: 'none', cursor: 'pointer',
                                                                    color: 'var(--text-muted)', padding: '4px',
                                                                    borderRadius: '4px', display: 'flex'
                                                                }}
                                                                title="Remove skill"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}

                                            {/* Add skill form or button */}
                                            {addingSkillTo === level.id ? (
                                                <form
                                                    onSubmit={(e) => handleAddSkill(e, level.id)}
                                                    style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                                                >
                                                    <input
                                                        className="input-field"
                                                        type="text"
                                                        placeholder="e.g. Backward crossovers"
                                                        value={newSkillName}
                                                        onChange={(e) => setNewSkillName(e.target.value)}
                                                        autoFocus
                                                        required
                                                        style={{ flex: 1, marginBottom: 0 }}
                                                    />
                                                    <button className="btn btn-sm" type="submit" disabled={savingSkill}>
                                                        {savingSkill ? '...' : 'Add'}
                                                    </button>
                                                    <button
                                                        className="btn btn-secondary btn-sm"
                                                        type="button"
                                                        onClick={() => { setAddingSkillTo(null); setNewSkillName(''); }}
                                                    >
                                                        Cancel
                                                    </button>
                                                </form>
                                            ) : (
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => { setAddingSkillTo(level.id); setNewSkillName(''); }}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                                                >
                                                    <Plus size={14} />
                                                    Add Skill
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
