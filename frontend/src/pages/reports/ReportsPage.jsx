import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BarChart2, Briefcase, ListTodo, Users, Loader2, TrendingUp, PieChart as PieIcon } from 'lucide-react';
import CircularChart from '../../components/common/CircularChart';

const statusColors = {
    'To Do': '#64748b',
    'In Progress': '#3b82f6',
    'In Review': '#a855f7',
    'Done': '#22c55e',
    'TODO': '#64748b',
    'IN_PROGRESS': '#3b82f6',
    'SUBMITTED': '#a855f7',
    'APPROVED': '#22c55e',
};

const Bar = ({ label, count, total, color }) => {
    const pct = total === 0 ? 0 : Math.round((count / total) * 100);
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <span style={{ width: 100, fontSize: '0.8rem', color: '#64748b', fontWeight: 500, flexShrink: 0, textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
            <div style={{ flex: 1, height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
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

    const chartData = tasksByStatus.map(t => ({
        name: t._id || 'Unknown',
        value: t.count,
        color: statusColors[t._id] || '#94a3b8'
    }));

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: 'min(7vw, 1.75rem)', fontWeight: 700, color: '#1e293b', margin: '0 0 0.25rem 0' }}>Reports & Analytics</h1>
                <p style={{ color: '#64748b', fontSize: 'min(4vw, 1rem)', margin: 0 }}>Overview of your projects and task metrics</p>
            </div>


            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(140px, 45%, 180px), 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <StatCard label="Total Projects" value={data.totalProjects ?? '—'} Icon={Briefcase} bg="#eff6ff" color="#2563eb" />
                <StatCard label="Total Tasks" value={data.totalTasks ?? '—'} Icon={ListTodo} bg="#dcfce7" color="#16a34a" />
                <StatCard label="Total Users" value={data.totalUsers ?? '—'} Icon={Users} bg="#faf5ff" color="#7e22ce" />
                <StatCard label="Completed Tasks" value={tasksByStatus.find(t => ['Done', 'APPROVED'].includes(t._id))?.count ?? 0} Icon={TrendingUp} bg="#fff9c3" color="#92400e" />
            </div>


            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
                {/* Task Status Distribution (Circular) */}
                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <PieIcon size={18} style={{ color: '#2563eb' }} /> Status Distribution
                        </h3>
                    </div>
                    {tasksByStatus.length === 0 ? (
                        <p style={{ color: '#94a3b8', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>No task data available.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <CircularChart data={chartData} height={200} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                {tasksByStatus.map(t => (
                                    <div key={t._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#64748b', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '0.5rem' }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColors[t._id] || statusColors.TODO }} />
                                        <div style={{ flex: 1, fontWeight: 500 }}>{t._id}</div>
                                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{t.count}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Progress Overview (Bars) */}
                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ margin: '0 0 1.5rem', fontSize: '1rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BarChart2 size={18} style={{ color: '#16a34a' }} /> Metric Bars
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {tasksByStatus.map(t => (
                            <Bar
                                key={t._id}
                                label={t._id || 'Unknown'}
                                count={t.count}
                                total={totalTasks}
                                color={statusColors[t._id] || statusColors.TODO}
                            />
                        ))}
                    </div>

                    <div style={{ marginTop: '2rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                        <h4 style={{ margin: '0 0 1rem', fontSize: '0.875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Summary Stats</h4>
                        {[
                            { label: 'Completion Rate', value: totalTasks > 0 ? `${Math.round(((tasksByStatus.find(t => ['Done', 'APPROVED'].includes(t._id))?.count ?? 0) / totalTasks) * 100)}%` : '0%', color: '#16a34a' },
                            { label: 'Active Tasks', value: totalTasks - (tasksByStatus.find(t => ['Done', 'APPROVED'].includes(t._id))?.count ?? 0), color: '#2563eb' },
                            { label: 'Critical Tasks', value: tasksByStatus.find(t => t._id === 'Urgent')?.count ?? 0, color: '#ef4444' },
                        ].map(({ label, value, color }) => (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0' }}>
                                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{label}</span>
                                <span style={{ fontWeight: 700, color, fontSize: '1rem' }}>{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;

