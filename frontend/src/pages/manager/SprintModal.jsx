import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { sprintApi } from '../../services/api';

const inputStyle = {
    padding: '0.6rem 0.875rem',
    border: '1.5px solid #e2e8f0',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
};

const SprintModal = ({ open, onClose, projectId, onSprintCreated }) => {
    const [form, setForm] = useState({
        name: '',
        goal: '',
        startDate: '',
        endDate: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            setForm({
                name: `Sprint ${new Date().toLocaleDateString()}`,
                goal: '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            });
            setError('');
        }
    }, [open]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) return setError('Sprint name is required');

        setLoading(true);
        try {
            const res = await sprintApi.create({ ...form, projectId });
            onSprintCreated(res.data);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create sprint');
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem' }} onClick={onClose}>
            <div style={{ background: 'white', borderRadius: '1rem', width: '100%', maxWidth: 450, boxShadow: '0 24px 70px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                    <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>Plan New Sprint</h2>
                    <button onClick={onClose} style={{ border: 'none', background: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                    {error && <div style={{ padding: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', color: '#dc2626', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</div>}

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Sprint Name</label>
                        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} placeholder="e.g. Sprint 1 - Core Features" />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Goal</label>
                        <textarea value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })} style={{ ...inputStyle, resize: 'vertical' }} rows={2} placeholder="What do we want to achieve?" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Start Date</label>
                            <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>End Date</label>
                            <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} style={inputStyle} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={onClose} style={{ padding: '0.6rem 1.25rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
                        <button type="submit" disabled={loading} style={{ padding: '0.6rem 1.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            {loading ? 'Planning...' : 'Create Sprint'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SprintModal;
