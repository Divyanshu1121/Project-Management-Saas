import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
    Building, ShieldCheck, Calendar, Users, Briefcase, Layers,
    CheckSquare, UserPlus, Loader2, FolderOpen, ListTodo,
    BarChart2, TrendingUp, Clock, LayoutDashboard, CheckCircle
} from 'lucide-react';
import CompanyTeamTable from './CompanyTeamTable';
import CreateTeamMemberModal from './CreateTeamMemberModal';
import ProfileView from '../../components/common/ProfileView';
import CompanyTeams from './CompanyTeams';
import { PageHeader, PanelCard, SectionContainer, Button } from '../../design-system';

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
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8', background: 'white', borderRadius: '1rem', border: '2px dashed #e2e8f0' }}>
                    <FolderOpen size={32} style={{ marginBottom: '1rem' }} />
                    <p style={{ margin: 0 }}>{filter ? `No ${filter} projects` : 'No projects yet'}</p>
                </div>
            ) : (
                <div className="responsive-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))' }}>
                    {filtered.map(proj => {
                        const smeta = PROJECT_STATUS_META[proj.status] || { bg: '#f1f5f9', color: '#475569' };
                        return (
                            <div key={proj._id} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.875rem', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                    <h3 style={{ margin: 0, fontWeight: 700, color: '#1e293b', fontSize: '1rem' }}>{proj.name}</h3>
                                    <Badge bg={smeta.bg} color={smeta.color} label={proj.status} />
                                </div>
                                {proj.description && <p style={{ margin: '0 0 1rem', color: '#64748b', fontSize: '0.875rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{proj.description}</p>}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> {fmt(proj.startDate)}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {fmt(proj.deadline)}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4, gridColumn: 'span 2' }}><Users size={12} /> {proj.createdBy?.name || 'Unknown'}</span>
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
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8', background: 'white', borderRadius: '1rem', border: '2px dashed #e2e8f0' }}>
                    <ListTodo size={32} style={{ marginBottom: '1rem' }} />
                    <p style={{ margin: 0 }}>No tasks found</p>
                </div>
            ) : (
                <div style={{ width: '100%', overflowX: 'auto', background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <table style={{ minWidth: '800px', width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                {['Task', 'Project', 'Assigned', 'Status', 'Priority', 'Due'].map(h => (
                                    <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(task => {
                                const sm = STATUS_META[task.status] || { label: task.status, bg: '#f1f5f9', color: '#475569' };
                                const pm = PRIORITY_META[task.priority] || null;
                                const overdue = isOverdue(task);
                                return (
                                    <tr key={task._id} style={{ borderTop: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>{task.title}</td>
                                        <td style={{ padding: '0.875rem 1rem', fontSize: '0.82rem', color: '#64748b' }}>{task.projectId?.name || '—'}</td>
                                        <td style={{ padding: '0.875rem 1rem', fontSize: '0.82rem', color: '#64748b' }}>{task.assignedTo?.name || '—'}</td>
                                        <td style={{ padding: '0.875rem 1rem' }}>
                                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                                                <Badge bg={sm.bg} color={sm.color} label={sm.label} />
                                                {overdue && <Badge bg="#fef2f2" color="#ef4444" label="Overdue" />}
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.875rem 1rem' }}>
                                            {pm ? <Badge bg={pm.bg} color={pm.color} label={pm.label} /> : <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>—</span>}
                                        </td>
                                        <td style={{ padding: '0.875rem 1rem', fontSize: '0.82rem', color: overdue ? '#ef4444' : '#64748b', fontWeight: overdue ? 600 : 400 }}>{fmt(task.deadline)}</td>
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


import CircularChart from '../../components/common/CircularChart';

// ... (existing code)

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
        const map = { 'TODO': '#64748b', 'IN_PROGRESS': '#2563eb', 'SUBMITTED': '#7c3aed', 'APPROVED': '#16a34a', 'REJECTED': '#ef4444', 'To Do': '#64748b', 'In Progress': '#2563eb', 'Done': '#16a34a' };
        return map[id] || '#64748b';
    };

    const projectStatusCounts = {
        PLANNING: projects.filter(p => p.status === 'PLANNING').length,
        ACTIVE: projects.filter(p => p.status === 'ACTIVE').length,
        COMPLETED: projects.filter(p => p.status === 'COMPLETED').length,
        ON_HOLD: projects.filter(p => p.status === 'ON_HOLD').length,
    };

    const taskChartData = (data.tasksByStatus || []).map(t => ({
        name: t._id,
        value: t.count,
        color: statusColor(t._id)
    }));

    const projectChartData = Object.entries(projectStatusCounts).map(([name, value]) => ({
        name,
        value,
        color: PROJECT_STATUS_META[name]?.color || '#64748b'
    }));

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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
                {/* Task Status Chart */}
                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BarChart2 size={16} style={{ color: '#2563eb' }} /> Tasks by Status
                    </h3>
                    <CircularChart data={taskChartData} height={200} />
                    {taskChartData.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center', padding: '1rem' }}>No task data yet</p>}
                </div>

                {/* Project Status Chart */}
                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingUp size={16} style={{ color: '#16a34a' }} /> Projects by Status
                    </h3>
                    <CircularChart data={projectChartData} height={200} />
                    {projectChartData.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center', padding: '1rem' }}>No project data yet</p>}
                </div>

                {/* Task Bar Preview */}
                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>Status Detail</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {(data.tasksByStatus || []).map(({ _id, count }) => {
                            const pct = Math.round((count / max) * 100);
                            return (
                                <div key={_id}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>{_id}</span>
                                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: statusColor(_id) }}>{count}</span>
                                    </div>
                                    <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                                        <div style={{ width: `${pct}%`, height: '100%', background: statusColor(_id), transition: 'width 0.6s' }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};


// ── Main Dashboard ────────────────────────────────────────
const CompanyDashboard = ({ defaultSection = 'dashboard' }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--clr-slate-400)' }}>Loading dashboard...</div>;
    if (!dashboardData?.company) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--clr-slate-400)' }}>No company data available.</div>;

    const { company, stats } = dashboardData;

    const renderContent = () => {
        switch (defaultSection) {
            case 'c-executives':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
                        <PageHeader
                            title="Management Team"
                            subtitle="Manage your company's executive team and roles."
                            icon={ShieldCheck}
                            actions={
                                isCEO && (
                                    <Button icon={UserPlus} onClick={() => setIsModalOpen(true)}>
                                        Add Executive
                                    </Button>
                                )
                            }
                        />
                        <PanelCard>
                            <CompanyTeamTable users={teamMembers} onDelete={handleDeleteUser} currentUserRole={user?.role} />
                        </PanelCard>
                    </div>
                );

            case 'projects':
                return <ProjectsSection />;

            case 'teams':
                return <CompanyTeams />;

            case 'tasks':
                return <TasksSection />;

            case 'reports':
                return <ReportsSection />;

            case 'settings':
                return <div style={{ padding: '0 1rem' }}><ProfileView /></div>;

            case 'dashboard':
            default:
                return (
                    <>
                        <PageHeader
                            title="Company Overview"
                            subtitle={`Welcome back, ${user?.name}`}
                            icon={LayoutDashboard}
                        />

                        {/* Top stat metrics */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
                            <PanelCard variant="stat" label="Leadership" value={stats?.totalProjectManagers || 0} icon={Users} color="var(--clr-primary-500)" bg="var(--clr-primary-50)" onClick={() => navigate('/company/c-executives')} />
                            <PanelCard variant="stat" label="Total Employees" value={stats?.totalEmployees || 0} icon={Briefcase} color="var(--clr-success-500)" bg="var(--clr-success-50)" onClick={() => navigate('/company/teams')} />
                            <PanelCard variant="stat" label="Total Projects" value={stats?.totalProjects || 0} icon={Layers} color="var(--clr-indigo-500)" bg="var(--clr-indigo-50)" onClick={() => navigate('/company/projects')} />
                            <PanelCard variant="stat" label="Total Tasks" value={stats?.totalTasks || 0} icon={CheckSquare} color="var(--clr-orange-500)" bg="var(--clr-orange-50)" onClick={() => navigate('/company/tasks')} />
                        </div>

                        {/* Company Detail info */}
                        <PanelCard variant="section" title="Company Details" icon={Building}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', padding: '0.5rem 0' }}>
                                <div>
                                    <p style={{ margin: '0 0 0.5rem', fontSize: 'var(--text-xs)', color: 'var(--clr-slate-400)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Name</p>
                                    <p style={{ margin: 0, fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--clr-slate-800)' }}>{company.name}</p>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 0.5rem', fontSize: 'var(--text-xs)', color: 'var(--clr-slate-400)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Primary Subscription</p>
                                    <p style={{ margin: 0, fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--clr-slate-800)' }}>{company.plan || 'Free'}</p>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 0.5rem', fontSize: 'var(--text-xs)', color: 'var(--clr-slate-400)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Company ID</p>
                                    <p style={{ margin: 0, fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--clr-slate-800)' }}>{company._id}</p>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 0.5rem', fontSize: 'var(--text-xs)', color: 'var(--clr-slate-400)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Platform Genesis</p>
                                    <p style={{ margin: 0, fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--clr-slate-800)' }}>{new Date(company.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </PanelCard>
                    </>
                );
        }
    };

    return (
        <SectionContainer>
            {renderContent()}
            <CreateTeamMemberModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleCreateUser} />
        </SectionContainer>
    );
};

export default CompanyDashboard;
