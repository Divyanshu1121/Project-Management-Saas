import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
    Building, ShieldCheck, Calendar, Users, Briefcase, Layers,
    CheckSquare, UserPlus, Loader2, FolderOpen, ListTodo,
    BarChart2, TrendingUp, Clock, AlertTriangle, ChevronRight, CheckCircle
} from 'lucide-react';
import './CompanyDashboard.css';
import CompanyTeamTable from './CompanyTeamTable';
import CreateTeamMemberModal from './CreateTeamMemberModal';
import CompanySidebar from './CompanySidebar';
import ProfileView from '../../components/common/ProfileView';
import CompanyTeams from './CompanyTeams';

const fmt = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const STATUS_META = {
    TODO: { label: 'To Do', bg: '#f1f5f9', color: '#475569' },
    IN_PROGRESS: { label: 'In Progress', bg: '#eff6ff', color: '#1d4ed8' },
    SUBMITTED: { label: 'Submitted', bg: '#faf5ff', color: '#7e22ce' },
    APPROVED: { label: 'Approved', bg: '#dcfce7', color: '#166534' },
    REJECTED: { label: 'Rejected', bg: '#fef2f2', color: '#991b1b' },
    // Legacy status values
    'To Do': { label: 'To Do', bg: '#f1f5f9', color: '#475569' },
    'In Progress': { label: 'In Progress', bg: '#eff6ff', color: '#1d4ed8' },
    'Done': { label: 'Done', bg: '#dcfce7', color: '#166534' },
};

const PROJECT_STATUS_META = {
    PLANNING: { bg: '#fef9c3', color: '#854d0e' },
    ACTIVE: { bg: '#dcfce7', color: '#166534' },
    COMPLETED: { bg: '#dbeafe', color: '#1e40af' },
    ON_HOLD: { bg: '#fee2e2', color: '#991b1b' },
};

const PRIORITY_META = {
    LOW: { label: 'Low', bg: '#f0fdf4', color: '#166534' },
    MEDIUM: { label: 'Medium', bg: '#fffbeb', color: '#92400e' },
    HIGH: { label: 'High', bg: '#fff7ed', color: '#9a3412' },
    URGENT: { label: 'Urgent', bg: '#fef2f2', color: '#991b1b' },
};

const Badge = ({ bg, color, label }) => (
    <span style={{ padding: '0.18rem 0.6rem', borderRadius: '2rem', fontSize: '0.72rem', fontWeight: 700, background: bg, color, whiteSpace: 'nowrap' }}>
        {label}
    </span>
);

const SectionLoader = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem', color: '#64748b', flexDirection: 'column', gap: '1rem' }}>
        <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: '#2563eb' }} />
        <p style={{ margin: 0 }}>Loading...</p>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
);

// ── Projects Section ─────────────────────────────────────
const ProjectsSection = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    const fetch = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/projects');
            setProjects(res.data || []);
        } catch { setProjects([]); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetch(); }, [fetch]);

    const filtered = filter ? projects.filter(p => p.status === filter) : projects;

    const counts = {
        all: projects.length,
        ACTIVE: projects.filter(p => p.status === 'ACTIVE').length,
        PLANNING: projects.filter(p => p.status === 'PLANNING').length,
        COMPLETED: projects.filter(p => p.status === 'COMPLETED').length,
        ON_HOLD: projects.filter(p => p.status === 'ON_HOLD').length,
    };

    if (loading) return <SectionLoader />;

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>Projects</h2>
                <p style={{ margin: 0, color: '#64748b' }}>Overview of all company projects</p>
            </div>

            {/* Summary pills */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {[
                    { label: `All (${counts.all})`, value: '', color: '#475569', bg: '#f1f5f9' },
                    { label: `Active (${counts.ACTIVE})`, value: 'ACTIVE', color: '#166534', bg: '#dcfce7' },
                    { label: `Planning (${counts.PLANNING})`, value: 'PLANNING', color: '#854d0e', bg: '#fef9c3' },
                    { label: `Completed (${counts.COMPLETED})`, value: 'COMPLETED', color: '#1e40af', bg: '#dbeafe' },
                    { label: `On Hold (${counts.ON_HOLD})`, value: 'ON_HOLD', color: '#991b1b', bg: '#fee2e2' },
                ].map(({ label, value, color, bg }) => (
                    <button key={value} onClick={() => setFilter(value === filter ? '' : value)}
                        style={{ padding: '0.35rem 0.875rem', borderRadius: '2rem', fontSize: '0.82rem', fontWeight: 600, border: 'none', cursor: 'pointer', background: filter === value ? color : bg, color: filter === value ? 'white' : color, transition: 'all 0.15s' }}>
                        {label}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8', background: 'white', borderRadius: '1rem', border: '2px dashed #e2e8f0' }}>
                    <FolderOpen size={32} style={{ marginBottom: '1rem' }} />
                    <p style={{ margin: 0 }}>{filter ? `No ${filter} projects` : 'No projects yet'}</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {filtered.map(proj => {
                        const smeta = PROJECT_STATUS_META[proj.status] || { bg: '#f1f5f9', color: '#475569' };
                        return (
                            <div key={proj._id} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.875rem', padding: '1.25rem 1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                                            <h3 style={{ margin: 0, fontWeight: 700, color: '#1e293b', fontSize: '1rem' }}>{proj.name}</h3>
                                            <Badge bg={smeta.bg} color={smeta.color} label={proj.status} />
                                        </div>
                                        {proj.description && <p style={{ margin: '0 0 0.6rem', color: '#64748b', fontSize: '0.875rem' }}>{proj.description}</p>}
                                        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                                            {proj.startDate && <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> {fmt(proj.startDate)}</span>}
                                            {proj.deadline && <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {fmt(proj.deadline)}</span>}
                                            {proj.createdBy?.name && <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}><Users size={12} /> {proj.createdBy.name}</span>}
                                            {proj.teamAssigned?.length > 0 && <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}><Layers size={12} /> {proj.teamAssigned.map(t => t.name).join(', ')}</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// ── Tasks Section ─────────────────────────────────────────
const TasksSection = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');

    const fetch = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/tasks');
            setTasks(res.data || []);
        } catch { setTasks([]); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetch(); }, [fetch]);

    const filtered = filterStatus ? tasks.filter(t => t.status === filterStatus) : tasks;
    const isOverdue = (t) => t.deadline && new Date() > new Date(t.deadline) && t.status !== 'APPROVED' && t.status !== 'Done';

    const overdueCount = tasks.filter(isOverdue).length;

    if (loading) return <SectionLoader />;

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>Tasks</h2>
                <p style={{ margin: 0, color: '#64748b' }}>All tasks across all projects in your company</p>
            </div>

            {/* Summary row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.875rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total', value: tasks.length, bg: '#f1f5f9', color: '#475569' },
                    { label: 'In Progress', value: tasks.filter(t => ['IN_PROGRESS', 'In Progress'].includes(t.status)).length, bg: '#eff6ff', color: '#1d4ed8' },
                    { label: 'Approved', value: tasks.filter(t => ['APPROVED', 'Done'].includes(t.status)).length, bg: '#dcfce7', color: '#166534' },
                    { label: 'Overdue', value: overdueCount, bg: '#fef2f2', color: '#ef4444' },
                ].map(({ label, value, bg, color }) => (
                    <div key={label} style={{ background: bg, borderRadius: '0.75rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, color, opacity: 0.8 }}>{label}</p>
                    </div>
                ))}
            </div>

            {/* Status filter */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                <button onClick={() => setFilterStatus('')} style={{ padding: '0.3rem 0.875rem', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: 600, border: 'none', cursor: 'pointer', background: !filterStatus ? '#2563eb' : '#f1f5f9', color: !filterStatus ? 'white' : '#475569' }}>All</button>
                {Object.entries(STATUS_META).slice(0, 5).map(([k, v]) => (
                    <button key={k} onClick={() => setFilterStatus(k)} style={{ padding: '0.3rem 0.875rem', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: 600, border: 'none', cursor: 'pointer', background: filterStatus === k ? v.color : v.bg, color: filterStatus === k ? 'white' : v.color }}>
                        {v.label}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8', background: 'white', borderRadius: '1rem', border: '2px dashed #e2e8f0' }}>
                    <ListTodo size={32} style={{ marginBottom: '1rem' }} />
                    <p style={{ margin: 0 }}>No tasks found</p>
                </div>
            ) : (
                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                {['Task', 'Project', 'Assigned To', 'Status', 'Priority', 'Deadline'].map(h => (
                                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(task => {
                                const sm = STATUS_META[task.status] || { label: task.status, bg: '#f1f5f9', color: '#475569' };
                                const pm = PRIORITY_META[task.priority] || null;
                                const overdue = isOverdue(task);
                                return (
                                    <tr key={task._id} style={{ borderTop: '1px solid #f1f5f9' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#1e293b', fontSize: '0.875rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {task.title}
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.82rem', color: '#64748b' }}>{task.projectId?.name || '—'}</td>
                                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.82rem', color: '#64748b' }}>{task.assignedTo?.name || '—'}</td>
                                        <td style={{ padding: '0.75rem 1rem' }}>
                                            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                                                <Badge bg={sm.bg} color={sm.color} label={sm.label} />
                                                {overdue && <Badge bg="#fef2f2" color="#ef4444" label="Overdue" />}
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem' }}>
                                            {pm ? <Badge bg={pm.bg} color={pm.color} label={pm.label} /> : <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>—</span>}
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.82rem', color: overdue ? '#ef4444' : '#64748b', fontWeight: overdue ? 600 : 400 }}>{fmt(task.deadline)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// ── Reports Section ───────────────────────────────────────
const ReportsSection = () => {
    const [data, setData] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [analyticsRes, projRes] = await Promise.all([
                    api.get('/analytics'),
                    api.get('/projects'),
                ]);
                setData(analyticsRes.data);
                setProjects(projRes.data || []);
            } catch { }
            finally { setLoading(false); }
        };
        load();
    }, []);

    if (loading) return <SectionLoader />;
    if (!data) return <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Analytics data unavailable.</div>;

    const max = Math.max(...(data.tasksByStatus || []).map(s => s.count), 1);

    const statusColor = (id) => {
        const map = { 'TODO': '#2563eb', 'IN_PROGRESS': '#7c3aed', 'SUBMITTED': '#db2777', 'APPROVED': '#16a34a', 'REJECTED': '#ef4444', 'To Do': '#64748b', 'In Progress': '#2563eb', 'Done': '#16a34a' };
        return map[id] || '#64748b';
    };

    const projectStatusCounts = {
        PLANNING: projects.filter(p => p.status === 'PLANNING').length,
        ACTIVE: projects.filter(p => p.status === 'ACTIVE').length,
        COMPLETED: projects.filter(p => p.status === 'COMPLETED').length,
        ON_HOLD: projects.filter(p => p.status === 'ON_HOLD').length,
    };

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>Reports & Analytics</h2>
                <p style={{ margin: 0, color: '#64748b' }}>Company-wide performance overview</p>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
                {[
                    { label: 'Total Projects', value: data.totalProjects, Icon: Briefcase, bg: '#eff6ff', color: '#2563eb' },
                    { label: 'Total Tasks', value: data.totalTasks, Icon: ListTodo, bg: '#faf5ff', color: '#7e22ce' },
                    { label: 'Total Members', value: data.totalUsers, Icon: Users, bg: '#dcfce7', color: '#16a34a' },
                    { label: 'Completed Projects', value: projectStatusCounts.COMPLETED, Icon: CheckCircle, bg: '#dbeafe', color: '#1d4ed8' },
                ].map(({ label, value, Icon, bg, color }) => (
                    <div key={label} style={{ background: bg, borderRadius: '0.875rem', padding: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <Icon size={16} style={{ color }} />
                            <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                        </div>
                        <p style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color, lineHeight: 1 }}>{value ?? '—'}</p>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {/* Task Status Chart */}
                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BarChart2 size={16} style={{ color: '#2563eb' }} /> Tasks by Status
                    </h3>
                    {data.tasksByStatus?.length === 0 ? (
                        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem 0' }}>No task data yet</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                            {(data.tasksByStatus || []).map(({ _id, count }) => {
                                const sm = STATUS_META[_id] || { label: _id, color: '#64748b' };
                                const pct = Math.round((count / max) * 100);
                                return (
                                    <div key={_id}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>{sm.label || _id}</span>
                                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: statusColor(_id) }}>{count}</span>
                                        </div>
                                        <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                                            <div style={{ width: `${pct}%`, height: '100%', background: statusColor(_id), borderRadius: 4, transition: 'width 0.6s ease' }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Project Status Chart */}
                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingUp size={16} style={{ color: '#16a34a' }} /> Projects by Status
                    </h3>
                    {projects.length === 0 ? (
                        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem 0' }}>No project data yet</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                            {Object.entries(projectStatusCounts).map(([status, count]) => {
                                const smeta = PROJECT_STATUS_META[status] || { color: '#475569' };
                                const pct = Math.round((count / Math.max(...Object.values(projectStatusCounts), 1)) * 100);
                                return (
                                    <div key={status}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>{status}</span>
                                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: smeta.color }}>{count}</span>
                                        </div>
                                        <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                                            <div style={{ width: `${pct}%`, height: '100%', background: smeta.color, borderRadius: 4, transition: 'width 0.6s ease' }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Recent Projects list */}
                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Briefcase size={16} style={{ color: '#7e22ce' }} /> Recent Projects
                    </h3>
                    {projects.slice(0, 5).map(proj => {
                        const smeta = PROJECT_STATUS_META[proj.status] || { bg: '#f1f5f9', color: '#475569' };
                        return (
                            <div key={proj._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                <span style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>{proj.name}</span>
                                <Badge bg={smeta.bg} color={smeta.color} label={proj.status} />
                            </div>
                        );
                    })}
                    {projects.length === 0 && <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>No projects yet.</p>}
                </div>
            </div>
        </div>
    );
};

// ── Main Dashboard ────────────────────────────────────────
const CompanyDashboard = () => {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('dashboard');

    const isCEO = user?.role === 'CEO' || user?.role === 'COMPANY_OWNER';

    useEffect(() => {
        const loadAll = async () => {
            setLoading(true);
            try {
                const [dashRes, membersRes] = await Promise.all([
                    api.get('/company/dashboard'),
                    api.get('/company/users'),
                ]);
                setDashboardData(dashRes.data);
                setTeamMembers(membersRes.data || []);
            } catch (err) {
                console.error('Error loading dashboard:', err);
            } finally {
                setLoading(false);
            }
        };
        loadAll();
    }, []);

    const handleCreateUser = async (userData) => {
        if (!isCEO) return;
        try {
            const res = await api.post('/company/users', userData);
            setTeamMembers([res.data, ...teamMembers]);
            setIsModalOpen(false);
            const statsRes = await api.get('/company/dashboard');
            setDashboardData(statsRes.data);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create user');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!isCEO) return;
        if (!window.confirm('Are you sure you want to remove this user?')) return;
        try {
            await api.delete(`/company/users/${id}`);
            setTeamMembers(teamMembers.filter(u => u._id !== id));
            const statsRes = await api.get('/company/dashboard');
            setDashboardData(statsRes.data);
        } catch {
            alert('Failed to delete user');
        }
    };

    if (loading) return <div className="loading-container">Loading dashboard...</div>;
    if (!dashboardData?.company) return <div className="dashboard-container">No company data available.</div>;

    const { company, stats } = dashboardData;

    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard':
                return (
                    <>
                        <div className="dashboard-header">
                            <div>
                                <h1 className="dashboard-title">Company Overview</h1>
                                <p className="dashboard-subtitle">Welcome back, {user?.name}</p>
                            </div>
                        </div>

                        {/* Company info card */}
                        <div className="company-card">
                            <div className="company-card-content">
                                <div className="company-info-main">
                                    <div className="company-name-wrapper">
                                        <Building className="company-icon" />
                                        <h2 className="company-name">{company.name}</h2>
                                    </div>
                                    <span className="company-id">ID: {company._id}</span>
                                </div>
                                <div className="company-meta-grid">
                                    <div className="meta-item">
                                        <ShieldCheck className="meta-icon" />
                                        <div className="meta-content">
                                            <span className="meta-label">Plan</span>
                                            <span className="meta-value">{company.plan || 'Free'}</span>
                                        </div>
                                    </div>
                                    <div className="meta-item">
                                        <Calendar className="meta-icon" />
                                        <div className="meta-content">
                                            <span className="meta-label">Created</span>
                                            <span className="meta-value">{new Date(company.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="stats-grid">
                            <StatCard title="Leadership" value={stats?.totalProjectManagers || 0} icon={Users} colorClass="color-blue" />
                            <StatCard title="Total Employees" value={stats?.totalEmployees || 0} icon={Briefcase} colorClass="color-green" />
                            <StatCard title="Total Projects" value={stats?.totalProjects || 0} icon={Layers} colorClass="color-purple" />
                            <StatCard title="Total Tasks" value={stats?.totalTasks || 0} icon={CheckSquare} colorClass="color-orange" />
                        </div>
                    </>
                );

            case 'c-executives':
                return (
                    <>
                        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '0 2rem', marginTop: '2rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>Team Members</h3>
                                <p style={{ color: '#64748b', margin: 0 }}>Manage your company's team members and their roles.</p>
                            </div>
                            {isCEO && (
                                <button className="btn-primary" onClick={() => setIsModalOpen(true)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                                    <UserPlus size={20} />
                                    <span>Add Member</span>
                                </button>
                            )}
                        </div>
                        <CompanyTeamTable users={teamMembers} onDelete={handleDeleteUser} currentUserRole={user?.role} />
                    </>
                );

            case 'projects':
                return <div style={{ padding: '0 2rem', paddingTop: '2rem', paddingBottom: '2rem' }}><ProjectsSection /></div>;

            case 'teams':
                return <CompanyTeams />;

            case 'tasks':
                return <div style={{ padding: '0 2rem', paddingTop: '2rem', paddingBottom: '2rem' }}><TasksSection /></div>;

            case 'reports':
                return <div style={{ padding: '0 2rem', paddingTop: '2rem', paddingBottom: '2rem' }}><ReportsSection /></div>;

            case 'settings':
                return <div style={{ padding: '0 1rem' }}><ProfileView /></div>;

            default:
                return <div>Select a section</div>;
        }
    };

    return (
        <div className="company-panel-layout">
            <CompanySidebar activeSection={activeSection} setActiveSection={setActiveSection} />
            <div className="main-content-wrapper">
                <header className="company-header">
                    <h2 className="header-title">
                        {{ dashboard: 'Dashboard', 'c-executives': 'C-Executives', projects: 'Projects', teams: 'Teams', tasks: 'Tasks', reports: 'Reports', settings: 'Settings' }[activeSection] || activeSection}
                    </h2>
                </header>
                <div className="dashboard-container">
                    {renderContent()}
                    <CreateTeamMemberModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleCreateUser} />
                </div>
            </div>
        </div>
    );
};

// Stat Card sub-component
const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="stat-card">
        <div className={`stat-icon-wrapper ${colorClass}`}><Icon size={24} /></div>
        <div className="stat-content">
            <span className="stat-label">{title}</span>
            <span className="stat-value">{value}</span>
        </div>
    </div>
);

export default CompanyDashboard;
