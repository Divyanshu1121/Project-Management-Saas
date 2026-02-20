import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { Users, Loader2, Activity, Clock, ListTodo, TrendingUp, TrendingDown } from 'lucide-react';

const WorkloadPage = () => {
    const [workload, setWorkload] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchWorkload = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/manager/workload');
            setWorkload(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchWorkload(); }, [fetchWorkload]);

    const totalActive = workload.reduce((s, w) => s + w.activeTasks, 0);
    const totalHours = workload.reduce((s, w) => s + w.totalLoggedHours, 0);
    const maxTasks = Math.max(...workload.map(w => w.activeTasks), 1);

    const getWorkloadLevel = (count) => {
        if (count === 0) return { label: 'Idle', bg: '#f1f5f9', color: '#94a3b8', bar: '#cbd5e1' };
        if (count <= 2) return { label: 'Light', bg: '#dcfce7', color: '#166534', bar: '#22c55e' };
        if (count <= 4) return { label: 'Moderate', bg: '#fef9c3', color: '#854d0e', bar: '#eab308' };
        return { label: 'Heavy', bg: '#fef2f2', color: '#991b1b', bar: '#ef4444' };
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem', color: '#64748b' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#2563eb' }} />
            <p style={{ margin: 0 }}>Loading workload data...</p>
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.25rem' }}>Workload Monitor</h1>
                <p style={{ color: '#64748b', margin: 0 }}>Employee task load and logged hours across your company</p>
            </div>

            {/* Summary stats */}
            {workload.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    {[
                        { label: 'Employees', value: workload.length, bg: '#eff6ff', color: '#2563eb', Icon: Users },
                        { label: 'Active Tasks', value: totalActive, bg: '#fef9c3', color: '#b45309', Icon: Activity },
                        { label: 'Total Hours Logged', value: `${totalHours.toFixed(1)}h`, bg: '#dcfce7', color: '#16a34a', Icon: Clock },
                        { label: 'Avg Tasks / Person', value: workload.length ? (totalActive / workload.length).toFixed(1) : 0, bg: '#faf5ff', color: '#7e22ce', Icon: TrendingUp },
                    ].map(({ label, value, bg, color, Icon }) => (
                        <div key={label} style={{ background: bg, borderRadius: '0.875rem', padding: '1.25rem 1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                                <Icon size={16} style={{ color }} />
                                <p style={{ margin: 0, fontSize: '0.78rem', color, fontWeight: 600, opacity: 0.85 }}>{label}</p>
                            </div>
                            <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color, lineHeight: 1.1 }}>{value}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Employee Cards */}
            {workload.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5rem 2rem', background: 'white', borderRadius: '1rem', border: '2px dashed #e2e8f0', textAlign: 'center' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: '#2563eb' }}><Users size={28} /></div>
                    <h3 style={{ margin: '0 0 0.5rem', color: '#1e293b' }}>No employees found</h3>
                    <p style={{ color: '#64748b', margin: 0, maxWidth: 360 }}>Employees will appear here once they are added to your company. Ask your company owner to add employee accounts.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                    {workload.map(({ employee, activeTasks, totalLoggedHours }, i) => {
                        const level = getWorkloadLevel(activeTasks);
                        const barPct = maxTasks === 0 ? 0 : (activeTasks / maxTasks) * 100;
                        return (
                            <div key={employee._id} style={{
                                background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem',
                                padding: '1.25rem 1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                transition: 'box-shadow 0.2s'
                            }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.07)'}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'}
                            >
                                {/* Employee info */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.125rem' }}>
                                    <div style={{
                                        width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                                        background: `hsl(${(i * 53) % 360},60%,90%)`,
                                        color: `hsl(${(i * 53) % 360},40%,30%)`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1rem', fontWeight: 700,
                                    }}>
                                        {employee.name?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ margin: 0, fontWeight: 700, color: '#1e293b', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{employee.name}</p>
                                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>{employee.empId || employee.email}</p>
                                    </div>
                                    <span style={{ padding: '0.2rem 0.7rem', borderRadius: '2rem', fontSize: '0.72rem', fontWeight: 700, background: level.bg, color: level.color, flexShrink: 0 }}>
                                        {level.label}
                                    </span>
                                </div>

                                {/* Stats */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <div style={{ background: '#f8fafc', borderRadius: '0.625rem', padding: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: '0.25rem' }}>
                                            <ListTodo size={13} style={{ color: '#64748b' }} />
                                            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Tasks</span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: level.color, lineHeight: 1 }}>{activeTasks}</p>
                                    </div>
                                    <div style={{ background: '#f8fafc', borderRadius: '0.625rem', padding: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: '0.25rem' }}>
                                            <Clock size={13} style={{ color: '#64748b' }} />
                                            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Logged Hours</span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#2563eb', lineHeight: 1 }}>{totalLoggedHours}h</p>
                                    </div>
                                </div>

                                {/* Workload bar */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Task Load</span>
                                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>{activeTasks} / {maxTasks} max</span>
                                    </div>
                                    <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                                        <div style={{ width: `${barPct}%`, height: '100%', background: level.bar, borderRadius: 3, transition: 'width 0.6s ease' }} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );
};

export default WorkloadPage;
