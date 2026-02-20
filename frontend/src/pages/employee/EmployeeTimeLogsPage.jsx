import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { Clock, Plus, X, Loader2, Trash2, Calendar, AlertTriangle } from 'lucide-react';

const fmt = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

// ── Log Form ──────────────────────────────────────────────
const LogForm = ({ tasks, onAdd, onClose, submitting }) => {
    const [form, setForm] = useState({
        taskId: tasks[0]?._id || '',
        date: new Date().toISOString().slice(0, 10),
        duration: '',
        description: '',
    });
    const [error, setError] = useState('');

    const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.taskId) { setError('Please select a task.'); return; }
        if (!form.duration || isNaN(form.duration) || form.duration <= 0) { setError('Enter a valid duration in minutes.'); return; }
        setError('');
        await onAdd({ ...form, duration: Number(form.duration) });
    };

    const inp = { padding: '0.6rem 0.875rem', border: '1.5px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' };
    const lbl = { fontSize: '0.85rem', fontWeight: 600, color: '#374151' };

    return (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>Log Time</h3>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
            </div>
            {error && <div style={{ padding: '0.65rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', color: '#dc2626', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', gridColumn: '1/-1' }}>
                        <label style={lbl}>Task</label>
                        <select name="taskId" value={form.taskId} onChange={handleChange} style={{ ...inp, background: 'white' }}>
                            <option value="">Select task...</option>
                            {tasks.map(t => <option key={t._id} value={t._id}>{t.title}</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={lbl}>Date</label>
                        <input type="date" name="date" value={form.date} onChange={handleChange} style={inp} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={lbl}>Duration (minutes)</label>
                        <input type="number" name="duration" value={form.duration} onChange={handleChange} placeholder="e.g. 90" min="1" style={inp}
                            onFocus={e => e.target.style.borderColor = '#2563eb'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', gridColumn: '1/-1' }}>
                        <label style={lbl}>Notes (optional)</label>
                        <textarea name="description" value={form.description} onChange={handleChange} rows={2} placeholder="What did you work on?"
                            style={{ ...inp, resize: 'vertical' }}
                            onFocus={e => e.target.style.borderColor = '#2563eb'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={onClose} style={{ padding: '0.55rem 1.25rem', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.88rem', cursor: 'pointer' }}>Cancel</button>
                    <button type="submit" disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.25rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}>
                        {submitting && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                        Log Time
                    </button>
                </div>
            </form>
        </div>
    );
};

// ── Delete Confirm ────────────────────────────────────────
const DeleteConfirm = ({ onCancel, onConfirm, loading }) => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', maxWidth: 380, width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#ef4444' }}><AlertTriangle size={22} /></div>
            <h3 style={{ margin: '0 0 0.5rem', color: '#1e293b' }}>Delete Log?</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 1.5rem' }}>This time log will be permanently deleted.</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button onClick={onCancel} style={{ padding: '0.55rem 1.25rem', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer' }}>Cancel</button>
                <button onClick={onConfirm} disabled={loading} style={{ padding: '0.55rem 1.25rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' }}>
                    {loading ? 'Deleting…' : 'Delete'}
                </button>
            </div>
        </div>
    </div>
);

// ── Main Page ─────────────────────────────────────────────
const EmployeeTimeLogsPage = () => {
    const [logs, setLogs] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(null); // log id

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [lRes, tRes] = await Promise.all([
                api.get('/employee/time-logs'),
                api.get('/employee/tasks'),
            ]);
            setLogs(lRes.data || []);
            setTasks(tRes.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleAdd = async (form) => {
        setSubmitting(true);
        try {
            const res = await api.post('/employee/time-logs', form);
            setLogs(prev => [res.data, ...prev]);
            setShowForm(false);
        } catch (e) {
            alert(e.response?.data?.message || 'Failed to log time');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/employee/time-logs/${id}`);
            setLogs(prev => prev.filter(l => l._id !== id));
            setDeleting(null);
        } catch (e) {
            alert('Failed to delete log');
        }
    };

    const totalMins = logs.reduce((s, l) => s + (l.duration || 0), 0);
    const totalHrs = (totalMins / 60).toFixed(1);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem', color: '#64748b' }}>
            <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: '#2563eb' }} />
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', gap: '1rem' }}>
                <div>
                    <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.75rem', fontWeight: 700, color: '#1e293b' }}>My Time Logs</h1>
                    <p style={{ margin: 0, color: '#64748b' }}>{logs.length} entries · {totalHrs}h total logged</p>
                </div>
                <button onClick={() => setShowForm(s => !s)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', background: showForm ? '#64748b' : '#2563eb', color: 'white', border: 'none', borderRadius: '0.6rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {showForm ? <X size={16} /> : <Plus size={16} />}
                    {showForm ? 'Cancel' : 'Log Time'}
                </button>
            </div>

            {/* Summary stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
                {[
                    { label: 'Total Entries', value: logs.length, bg: '#eff6ff', color: '#2563eb', Icon: Clock },
                    { label: 'Hours Logged', value: totalHrs, bg: '#dcfce7', color: '#16a34a', Icon: Clock },
                    { label: 'Tasks Covered', value: new Set(logs.map(l => l.taskId?._id || l.taskId).filter(Boolean)).size, bg: '#faf5ff', color: '#7e22ce', Icon: Calendar },
                ].map(({ label, value, bg, color, Icon }) => (
                    <div key={label} style={{ background: bg, borderRadius: '0.875rem', padding: '1.1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                            <Icon size={14} style={{ color }} />
                            <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                        </div>
                        <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</p>
                    </div>
                ))}
            </div>

            {/* Log form */}
            {showForm && (
                <LogForm tasks={tasks} onAdd={handleAdd} onClose={() => setShowForm(false)} submitting={submitting} />
            )}

            {/* Logs table */}
            {logs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '1rem', border: '2px dashed #e2e8f0', color: '#94a3b8' }}>
                    <Clock size={28} style={{ marginBottom: '1rem' }} />
                    <p style={{ margin: '0 0 1rem' }}>No time logs yet.</p>
                    <button onClick={() => setShowForm(true)} style={{ padding: '0.6rem 1.25rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Plus size={15} /> Log your first entry
                    </button>
                </div>
            ) : (
                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                {['Date', 'Task', 'Duration', 'Notes', ''].map(h => (
                                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log._id} style={{ borderTop: '1px solid #f1f5f9' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '0.7rem 1rem', fontSize: '0.85rem', color: '#374151', whiteSpace: 'nowrap' }}>{fmt(log.date)}</td>
                                    <td style={{ padding: '0.7rem 1rem', fontSize: '0.85rem', color: '#1e293b', fontWeight: 500 }}>{log.taskId?.title || '—'}</td>
                                    <td style={{ padding: '0.7rem 1rem' }}>
                                        <span style={{ padding: '0.2rem 0.65rem', background: '#eff6ff', color: '#1d4ed8', borderRadius: '2rem', fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                            {log.duration >= 60 ? `${(log.duration / 60).toFixed(1)}h` : `${log.duration}m`}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.7rem 1rem', fontSize: '0.83rem', color: '#64748b', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.description || '—'}</td>
                                    <td style={{ padding: '0.7rem 1rem', textAlign: 'right' }}>
                                        <button onClick={() => setDeleting(log._id)}
                                            style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid #e2e8f0', borderRadius: '0.375rem', cursor: 'pointer', color: '#94a3b8', marginLeft: 'auto' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#fecaca'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
                                            <Trash2 size={12} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {deleting && (
                <DeleteConfirm
                    onCancel={() => setDeleting(null)}
                    onConfirm={() => handleDelete(deleting)}
                    loading={false}
                />
            )}
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );
};

export default EmployeeTimeLogsPage;
