import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BarChart2, Briefcase, ListTodo, Users, Loader2, TrendingUp } from 'lucide-react';

const statusColors = {
    'To Do': '#94a3b8',
    'In Progress': '#3b82f6',
    'In Review': '#a855f7',
    'Done': '#22c55e',
};

const priorityColors = {
    Low: '#22c55e',
    Medium: '#f59e0b',
    High: '#f97316',
    Urgent: '#ef4444',
};

const Bar = ({ label, count, total, color }) => {
    const pct = total === 0 ? 0 : Math.round((count / total) * 100);
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <span style={{ width: 80, fontSize: '0.8rem', color: '#64748b', fontWeight: 500, flexShrink: 0, textAlign: 'right' }}>{label}</span>
            <div style={{ flex: 1, height: 10, background: '#f1f5f9', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 5, transition: 'width 0.6s ease' }} />
            </div>
            <span style={{ width: 28, fontSize: '0.8rem', color: '#1e293b', fontWeight: 600 }}>{count}</span>
        </div>
    );
};

const StatCard = ({ label, value, Icon, bg, color }) => (
    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.875rem', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ width: 44, height: 44, borderRadius: '0.625rem', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={22} style={{ color }} />
        </div>
        <div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>{label}</p>
            <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>{value}</p>
        </div>
    </div>
);

const ReportsPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/analytics');
                setData(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem', color: '#64748b' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#2563eb' }} />
            <p style={{ margin: 0 }}>Loading analytics...</p>
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    if (!data) return (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', color: '#64748b' }}>
            <BarChart2 size={36} style={{ marginBottom: '1rem', color: '#cbd5e1' }} />
            <p>Unable to load analytics. Make sure the analytics API is available.</p>
        </div>
    );

    const tasksByStatus = data.tasksByStatus || [];
    const totalTasks = tasksByStatus.reduce((s, t) => s + (t.count || 0), 0);

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.25rem 0' }}>Reports & Analytics</h1>
                <p style={{ color: '#64748b', margin: 0 }}>Overview of your projects and task metrics</p>
            </div>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <StatCard label="Total Projects" value={data.totalProjects ?? '—'} Icon={Briefcase} bg="#eff6ff" color="#2563eb" />
                <StatCard label="Total Tasks" value={data.totalTasks ?? '—'} Icon={ListTodo} bg="#dcfce7" color="#16a34a" />
                <StatCard label="Total Users" value={data.totalUsers ?? '—'} Icon={Users} bg="#faf5ff" color="#7e22ce" />
                <StatCard label="Completed Tasks" value={tasksByStatus.find(t => t._id === 'Done')?.count ?? 0} Icon={TrendingUp} bg="#fff9c3" color="#92400e" />
            </div>

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
                {/* Task Status Distribution */}
                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>Task Status Distribution</h3>
                    {tasksByStatus.length === 0 ? (
                        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No task data available.</p>
                    ) : (
                        tasksByStatus.map(t => (
                            <Bar
                                key={t._id}
                                label={t._id || 'Unknown'}
                                count={t.count}
                                total={totalTasks}
                                color={statusColors[t._id] || '#94a3b8'}
                            />
                        ))
                    )}
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {tasksByStatus.map(t => (
                            <div key={t._id} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#64748b' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColors[t._id] || '#94a3b8' }} />
                                {t._id}: {t.count}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Summary box */}
                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>Project Summary</h3>
                    {[
                        { label: 'Active Projects', value: data.totalProjects ?? 0, color: '#2563eb' },
                        { label: 'Total Tasks', value: data.totalTasks ?? 0, color: '#16a34a' },
                        { label: 'Team Members', value: data.totalUsers ?? 0, color: '#7e22ce' },
                        { label: 'Completion Rate', value: totalTasks > 0 ? `${Math.round(((tasksByStatus.find(t => t._id === 'Done')?.count ?? 0) / totalTasks) * 100)}%` : '0%', color: '#f97316' },
                    ].map(({ label, value, color }) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f8fafc' }}>
                            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{label}</span>
                            <span style={{ fontWeight: 700, color, fontSize: '1.1rem' }}>{value}</span>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );
};

export default ReportsPage;
