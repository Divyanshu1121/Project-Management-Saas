import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ListTodo, Clock, CheckCircle2, AlertTriangle, Loader2, PieChart as PieIcon } from 'lucide-react';
import CircularChart from '../../components/common/CircularChart';

const STATUS_LABEL = {
    TODO: 'To Do', IN_PROGRESS: 'In Progress', SUBMITTED: 'Submitted',
    APPROVED: 'Approved', REJECTED: 'Rejected',
    'To Do': 'To Do', 'In Progress': 'In Progress', 'Done': 'Approved'
};

const STATUS_COLOR = {
    TODO: { bg: '#f1f5f9', color: '#475569' },
    IN_PROGRESS: { bg: '#eff6ff', color: '#1d4ed8' },
    SUBMITTED: { bg: '#faf5ff', color: '#7e22ce' },
    APPROVED: { bg: '#dcfce7', color: '#166534' },
    REJECTED: { bg: '#fef2f2', color: '#991b1b' },
    'To Do': { bg: '#f1f5f9', color: '#475569' },
    'In Progress': { bg: '#eff6ff', color: '#1d4ed8' },
    'Done': { bg: '#dcfce7', color: '#166534' },
};

const PRIORITY_COLOR = {
    LOW: { bg: '#f0fdf4', color: '#166534' },
    MEDIUM: { bg: '#fffbeb', color: '#92400e' },
    HIGH: { bg: '#fff7ed', color: '#9a3412' },
    URGENT: { bg: '#fef2f2', color: '#991b1b' },
};

const EmployeeDashboard = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [tRes, lRes] = await Promise.all([
                api.get('/employee/tasks'),
                api.get('/employee/time-logs'),
            ]);
            setTasks(tRes.data || []);
            setLogs(lRes.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem', color: '#64748b' }}>
            <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: '#2563eb' }} />
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    const pending = tasks.filter(t => t.status !== 'APPROVED' && t.status !== 'Done');
    const approved = tasks.filter(t => t.status === 'APPROVED' || t.status === 'Done');
    const overdue = tasks.filter(t => t.deadline && new Date() > new Date(t.deadline) && t.status !== 'APPROVED');
    const totalMins = logs.reduce((s, l) => s + (l.duration || 0), 0);
    const totalHrs = (totalMins / 60).toFixed(1);

    // Prepare chart data
    const taskStatusCounts = tasks.reduce((acc, t) => {
        const label = STATUS_LABEL[t.status] || t.status;
        acc[label] = (acc[label] || 0) + 1;
        return acc;
    }, {});

    const chartData = Object.entries(taskStatusCounts).map(([name, value]) => ({
        name,
        value,
        color: Object.values(STATUS_COLOR).find(c => STATUS_LABEL[Object.keys(STATUS_LABEL).find(k => STATUS_LABEL[k] === name)] === name || name === k)?.color || '#64748b'
    }));
    
    // Better color mapping for chart
    const getChartColor = (name) => {
        if (name === 'To Do') return '#64748b';
        if (name === 'In Progress') return '#2563eb';
        if (name === 'Submitted') return '#7e22ce';
        if (name === 'Approved') return '#16a34a';
        if (name === 'Rejected') return '#ef4444';
        return '#cbd5e1';
    };

    const finalChartData = chartData.map(d => ({ ...d, color: getChartColor(d.name) }));

    const card = (Icon, label, value, bg, color) => (
        <div style={{ background: bg, borderRadius: '1rem', padding: '1.25rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: '0.75rem', background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
                <Icon size={20} />
            </div>
            <div>
                <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</p>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', fontWeight: 600, color, opacity: 0.75 }}>{label}</p>
            </div>
        </div>
    );

    return (
        <div>
            <div className="employee-header" style={{ marginBottom: '1.75rem' }}>
                <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>Welcome back, {user?.name} 👋</h1>
                <p style={{ margin: 0, color: '#64748b' }}>Here's a quick look at your work today.</p>
            </div>


            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
                {card(ListTodo, 'Tasks', pending.length, '#eff6ff', '#2563eb')}
                {card(CheckCircle2, 'Approved', approved.length, '#dcfce7', '#16a34a')}
                {card(AlertTriangle, 'Overdue', overdue.length, '#fef2f2', '#ef4444')}
                {card(Clock, 'Hours', totalHrs, '#faf5ff', '#7e22ce')}
            </div>


            <div className="responsive-grid grid-sidebar-layout" style={{ alignItems: 'start' }}>

                <div>
                    <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>My Tasks ({tasks.length})</h2>
                    {tasks.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '1rem', border: '2px dashed #e2e8f0', color: '#94a3b8' }}>
                            <ListTodo size={28} style={{ marginBottom: '0.75rem' }} />
                            <p style={{ margin: 0 }}>No tasks assigned to you yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                            {tasks.slice(0, 8).map(task => {
                                const sc = STATUS_COLOR[task.status] || STATUS_COLOR.TODO;
                                const pc = PRIORITY_COLOR[task.priority] || PRIORITY_COLOR.MEDIUM;
                                const od = task.deadline && new Date() > new Date(task.deadline) && task.status !== 'APPROVED';
                                const isBlocked = task.dependencies?.some(dep => dep.status !== 'APPROVED');
                                return (
                                    <div key={task._id} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.875rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ margin: 0, fontWeight: 600, color: '#1e293b', fontSize: '0.92rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</p>
                                            {task.projectId?.name && <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>{task.projectId.name}</p>}
                                        </div>
                                        <span style={{ padding: '0.2rem 0.65rem', background: pc.bg, color: pc.color, borderRadius: '2rem', fontSize: '0.73rem', fontWeight: 700, flexShrink: 0 }}>{task.priority || 'MEDIUM'}</span>
                                        {isBlocked && <span style={{ padding: '0.2rem 0.65rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '2rem', fontSize: '0.73rem', fontWeight: 700, flexShrink: 0 }}>Blocked</span>}
                                        <span style={{ padding: '0.2rem 0.65rem', background: sc.bg, color: sc.color, borderRadius: '2rem', fontSize: '0.73rem', fontWeight: 700, flexShrink: 0 }}>{STATUS_LABEL[task.status] || task.status}</span>
                                        {od && <span style={{ padding: '0.2rem 0.65rem', background: '#fef2f2', color: '#ef4444', borderRadius: '2rem', fontSize: '0.73rem', fontWeight: 700, flexShrink: 0 }}>Overdue</span>}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.25rem' }}>
                    <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <PieIcon size={18} style={{ color: '#2563eb' }} /> My Work Stats
                    </h3>
                    <CircularChart data={finalChartData} height={200} />
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {finalChartData.map(d => (
                            <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                                    <span style={{ color: '#64748b' }}>{d.name}</span>
                                </div>
                                <span style={{ fontWeight: 700, color: '#1e293b' }}>{d.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );
};

export default EmployeeDashboard;

