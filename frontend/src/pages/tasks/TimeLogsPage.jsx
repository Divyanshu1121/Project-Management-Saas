import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Clock, Loader2, Plus, Calendar, User, ListTodo } from 'lucide-react';
import TimeLogForm from '../../components/task/TimeLogForm';

const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const TimeLogsPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const fetchLogs = async () => {
        try {
            const res = await api.get('/time-logs');
            setLogs(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLogs(); }, []);

    const totalMinutes = logs.reduce((sum, l) => sum + (l.duration || 0), 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem', color: '#64748b' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#2563eb' }} />
            <p style={{ margin: 0 }}>Loading time logs...</p>
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.25rem 0' }}>Time Logs</h1>
                    <p style={{ color: '#64748b', margin: 0 }}>Track time spent on tasks</p>
                </div>
                <button
                    onClick={() => setShowForm(v => !v)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0.6rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                    <Plus size={18} /> {showForm ? 'Hide Form' : 'Log Time'}
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Total Logs', value: logs.length, bg: '#eff6ff', color: '#2563eb' },
                    { label: 'Total Hours', value: `${totalHours}h`, bg: '#dcfce7', color: '#16a34a' },
                    { label: 'Avg (min)', value: logs.length ? Math.round(totalMinutes / logs.length) : 0, bg: '#faf5ff', color: '#7e22ce' },
                ].map(({ label, value, bg, color }) => (
                    <div key={label} style={{ background: bg, borderRadius: '0.875rem', padding: '1.25rem 1.5rem' }}>
                        <p style={{ margin: 0, fontSize: '0.8rem', color, fontWeight: 600, opacity: 0.8 }}>{label}</p>
                        <p style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color, lineHeight: 1.2 }}>{value}</p>
                    </div>
                ))}
            </div>

            {/* Log Form */}
            {showForm && (
                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>Log Time Entry</h3>
                    <TimeLogForm onSuccess={() => { setShowForm(false); fetchLogs(); }} />
                </div>
            )}

            {/* Logs Table */}
            {logs.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5rem 2rem', background: 'white', borderRadius: '1rem', border: '2px dashed #e2e8f0', textAlign: 'center' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: '#2563eb' }}><Clock size={28} /></div>
                    <h3 style={{ margin: '0 0 0.5rem', color: '#1e293b' }}>No time logs yet</h3>
                    <p style={{ color: '#64748b', margin: '0 0 1.5rem' }}>Start logging time to track your productivity</p>
                    <button onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0.6rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
                        <Plus size={18} /> Log First Entry
                    </button>
                </div>
            ) : (
                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                    {['Date', 'User', 'Task', 'Duration (min)'].map(h => (
                                        <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log, i) => (
                                    <tr key={log._id} style={{ borderBottom: i < logs.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 0.1s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.875rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={13} />{formatDate(log.date)}</div>
                                        </td>
                                        <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.875rem', color: '#1e293b', fontWeight: 500 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><User size={13} style={{ color: '#94a3b8' }} />{log.userId?.name || '—'}</div>
                                        </td>
                                        <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.875rem', color: '#475569' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ListTodo size={13} style={{ color: '#94a3b8' }} />{log.taskId?.title || '—'}</div>
                                        </td>
                                        <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.875rem', color: '#1e293b', fontWeight: 600 }}>
                                            {log.duration} min
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );
};

export default TimeLogsPage;
