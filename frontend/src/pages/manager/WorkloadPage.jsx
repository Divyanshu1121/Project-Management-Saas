import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { Users, Activity, Clock, ListTodo, TrendingUp, Home, Calendar, MapPin, Building2 } from 'lucide-react';
import { PageSkeleton } from '../../components/common/Loaders';
import WFHLeaveCalendar from '../../components/common/WFHLeaveCalendar';
import { useAuth } from '../../context/AuthContext';

const STATUS_ICONS = {
    wfh: { icon: Home, label: 'Work From Home' },
    on_leave: { icon: Calendar, label: 'On Leave' },
    in_office: { icon: Building2, label: 'In Office' },
};

const LOCATION_LABELS = {
    home: 'Home', cafe: 'Cafe', library: 'Library',
    coworking: 'Co-working', travelling: 'Travelling', other: 'Custom Location'
};

const WorkloadPage = () => {
    const { user } = useAuth();
    const [view, setView] = useState('workload');
    const [scope, setScope] = useState('team'); // team | company
    const [workload, setWorkload] = useState([]);
    const [calendarData, setCalendarData] = useState({ wfhEvents: [], leaveEvents: [] });
    const [loading, setLoading] = useState(true);

    const fetchWorkload = useCallback(async () => {
        setLoading(true);
        try {
            if (view === 'workload') {
                const res = await api.get('/manager/workload');
                setWorkload(res.data || []);
            } else {
                const res = await api.get(`/wfh/calendar?scope=${scope}`);
                setCalendarData(res.data || { wfhEvents: [], leaveEvents: [] });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [view, scope]);

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

    if (loading && workload.length === 0 && calendarData.wfhEvents.length === 0) return <PageSkeleton />;

    return (
        <div>
            <div className="stack-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.25rem' }}>Team Workload & Schedule</h1>
                    <p style={{ color: '#64748b', margin: 0 }}>Monitor task load, logged hours, and availability across your team</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '0.4rem', borderRadius: '0.75rem' }}>
                        <button
                            onClick={() => setView('workload')}
                            style={{
                                padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600,
                                backgroundColor: view === 'workload' ? 'white' : 'transparent',
                                color: view === 'workload' ? '#2563eb' : '#64748b',
                                boxShadow: view === 'workload' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            Workload View
                        </button>
                        <button
                            onClick={() => setView('calendar')}
                            style={{
                                padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600,
                                backgroundColor: view === 'calendar' ? 'white' : 'transparent',
                                color: view === 'calendar' ? '#2563eb' : '#64748b',
                                boxShadow: view === 'calendar' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            Team Calendar
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => window.location.href = '/employee/wfh'}
                            style={{
                                padding: '0.6rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600,
                                backgroundColor: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem'
                            }}
                        >
                            <Home size={14} /> My WFH
                        </button>
                        <button
                            onClick={() => window.location.href = '/employee/leave'}
                            style={{
                                padding: '0.6rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600,
                                backgroundColor: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem'
                            }}
                        >
                            <Calendar size={14} /> My Leave
                        </button>
                    </div>
                </div>
            </div>

            {view === 'calendar' ? (
                <>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', backgroundColor: '#f1f5f9', padding: '0.3rem', borderRadius: '0.5rem', width: 'fit-content' }}>
                        {['team', 'company'].map(s => (
                            <button
                                key={s}
                                onClick={() => setScope(s)}
                                style={{
                                    padding: '0.4rem 1rem', borderRadius: '0.35rem', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                                    backgroundColor: scope === s ? 'white' : 'transparent',
                                    color: scope === s ? '#2563eb' : '#64748b',
                                    boxShadow: scope === s ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {s === 'team' ? 'My Team' : 'All Company'}
                            </button>
                        ))}
                    </div>
                    <WFHLeaveCalendar 
                        wfhEvents={calendarData.wfhEvents} 
                        leaveEvents={calendarData.leaveEvents} 
                        currentUserId={user?._id}
                        isAdmin={['HR', 'COMPANY_OWNER', 'owner', 'CEO', 'CTO', 'CFO', 'COO'].includes(user?.role)}
                    />
                </>
            ) : (
                <>
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

                    {workload.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5rem 2rem', background: 'white', borderRadius: '1rem', border: '2px dashed #e2e8f0', textAlign: 'center' }}>
                            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: '#2563eb' }}><Users size={28} /></div>
                            <h3 style={{ margin: '0 0 0.5rem', color: '#1e293b' }}>No employees found</h3>
                            <p style={{ color: '#64748b', margin: 0, maxWidth: 360 }}>Employees will appear here once they are added to your company. Ask your company owner to add employee accounts.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                            {workload.map(({ employee, activeTasks, totalLoggedHours, todayStatus }, i) => {
                                const level = getWorkloadLevel(activeTasks);
                                const barPct = maxTasks === 0 ? 0 : (activeTasks / maxTasks) * 100;
                                const statusDef = STATUS_ICONS[todayStatus?.status || 'in_office'];
                                const StatusIcon = statusDef.icon;
                                return (
                                    <div key={employee._id} style={{
                                        background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem',
                                        padding: '1.25rem 1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                        transition: 'box-shadow 0.2s'
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.07)'}
                                        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'}
                                    >
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
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                                                    <p style={{ margin: 0, fontWeight: 700, color: '#1e293b', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{employee.name}</p>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.3rem', fontSize: '0.78rem', color: '#64748b' }}>
                                                    <StatusIcon size={12} style={{
                                                        color: todayStatus?.status === 'on_leave' ? '#ef4444' :
                                                            todayStatus?.status === 'wfh' ? '#3b82f6' : '#64748b'
                                                    }} />
                                                    <span style={{
                                                        fontWeight: 600,
                                                        color: todayStatus?.status === 'on_leave' ? '#b91c1c' :
                                                            todayStatus?.status === 'wfh' ? '#1d4ed8' : '#64748b'
                                                    }}>
                                                        {statusDef.label}
                                                        {todayStatus?.status === 'wfh' && todayStatus?.workLocation &&
                                                            ` (${LOCATION_LABELS[todayStatus.workLocation] || todayStatus.workLocation})`}
                                                    </span>
                                                </div>
                                            </div>
                                            <span style={{ padding: '0.2rem 0.7rem', borderRadius: '2rem', fontSize: '0.72rem', fontWeight: 700, background: level.bg, color: level.color, flexShrink: 0, alignSelf: 'flex-start' }}>
                                                {level.label}
                                            </span>
                                        </div>

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
                </>
            )}

            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );
};

export default WorkloadPage;
