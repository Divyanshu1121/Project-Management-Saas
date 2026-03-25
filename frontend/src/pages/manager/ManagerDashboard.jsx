import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Card, SectionHeader, Button, Badge, EmptyState, Skeleton } from '../../design-system';
import ActivityFeed from '../../components/common/ActivityFeed';
import {
    Briefcase, CheckCircle2, Clock, Calendar, AlertTriangle,
    Users, ArrowRight, Zap, Plus, FolderOpen, TrendingUp,
    PieChart as PieIcon, Loader2
} from 'lucide-react';
import CircularChart from '../../components/common/CircularChart';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—';

const responsiveSectionStyle = `
    .manager-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 300px;
        gap: var(--sp-5);
        margin-bottom: var(--sp-5);
    }
    @media (max-width: 1200px) {
        .manager-grid { grid-template-columns: minmax(0, 1fr) 300px; }
    }
    @media (max-width: 900px) {
        .manager-grid { grid-template-columns: 1fr; }
    }
`;


/* ── Project row ─────────────────────────────────────────── */
const ProjectRow = ({ project, onClick }) => {
    const [hov, setHov] = useState(false);
    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 0.875rem', borderRadius: 'var(--r-md)', cursor: 'pointer', background: hov ? 'var(--surface-1)' : 'var(--card-bg, white)', transition: 'background var(--t-fast)', marginBottom: '0.25rem' }}
        >
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 'var(--text-base)', color: 'var(--text-primary, var(--clr-slate-800))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.name}</p>
                {project.deadline && <p style={{ margin: '0.1rem 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-muted, var(--clr-slate-400))' }}>Due {fmt(project.deadline)}</p>}
            </div>
            {/* Progress bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                <div style={{ width: 60, height: 4, background: 'var(--surface-2)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${project.progress || 0}%`, height: '100%', background: project.progress === 100 ? 'var(--clr-success-500)' : 'var(--clr-primary-500)', borderRadius: 2, transition: 'width 0.6s ease' }} />
                </div>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--clr-slate-500)', minWidth: 28 }}>{project.progress || 0}%</span>
            </div>
            <Badge status={project.status} size="xs" />
            <ArrowRight size={13} color={hov ? 'var(--clr-primary-500)' : 'var(--clr-slate-300)'} style={{ transition: 'color var(--t-fast)', flexShrink: 0 }} />
        </div>
    );
};

/* ── Person row ──────────────────────────────────────────── */
const PersonRow = ({ leave, variant }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0', borderBottom: '1px solid var(--surface-subtle)' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', flex: 'none', background: variant === 'away' ? 'var(--clr-warning-50, #fef3c7)' : 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-sm)', fontWeight: 700, color: variant === 'away' ? 'var(--clr-warning-600, #d97706)' : 'var(--text-secondary, var(--clr-slate-500))' }}>
            {leave.userId?.name?.[0]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary, var(--clr-slate-800))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{leave.userId?.name}</p>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted, var(--clr-slate-400))' }}>{variant === 'away' ? `Back ${fmt(leave.endDate)}` : `Leaves ${fmt(leave.startDate)}`}</p>
        </div>
        <Badge label={variant === 'away' ? 'Away' : 'Soon'} bg={variant === 'away' ? 'var(--clr-warning-50, #fef3c7)' : 'var(--surface-2)'} color={variant === 'away' ? 'var(--clr-warning-600, #d97706)' : 'var(--text-secondary, var(--clr-slate-500))'} showDot={false} size="xs" />
    </div>
);

/* ── Main dashboard ──────────────────────────────────────── */
const ManagerDashboard = () => {

    const navigate = useNavigate();
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [awayEmployees, setAway] = useState([]);
    const [upcomingLeaves, setUpcoming] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const [p, a, u] = await Promise.allSettled([
                api.get('/projects'),
                api.get('/leaves/unavailable'),
                api.get('/leaves/upcoming'),
            ]);
            if (p.status === 'fulfilled') setProjects(p.value.data || []);
            if (a.status === 'fulfilled') setAway(a.value.data || []);
            if (u.status === 'fulfilled') setUpcoming(u.value.data || []);
            setLoading(false);
        })();
    }, []);

    const active = projects.filter(p => p.status === 'ACTIVE').length;
    const planning = projects.filter(p => p.status === 'PLANNING').length;
    const completed = projects.filter(p => p.status === 'COMPLETED').length;
    const onHold = projects.filter(p => p.status === 'ON_HOLD').length;
    const overdue = projects.filter(p => p.deadline && new Date() > new Date(p.deadline) && p.status !== 'COMPLETED').length;

    const projectChartData = [
        { name: 'Active', value: active, color: '#10b981' },
        { name: 'Planning', value: planning, color: '#f59e0b' },
        { name: 'Completed', value: completed, color: '#2563eb' },
        { name: 'On Hold', value: onHold, color: '#ef4444' },
    ].filter(d => d.value > 0);

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <div style={{ maxWidth: 1280, width: '100%' }}>
            <style>{responsiveSectionStyle}</style>

            {/* ── Header ── */}
            <SectionHeader
                title={`${greeting}, ${user?.name?.split(' ')[0] || ''} 👋`}
                subtitle="Here's everything happening across your projects today."
                size="lg"
                style={{ marginBottom: 'var(--sp-6)' }}
                actions={<>
                    <Button variant="secondary" size="sm" icon={FolderOpen} onClick={() => navigate('/manager/projects')}>All Projects</Button>
                    <Button size="sm" icon={Plus} onClick={() => navigate('/manager/projects')}>New Project</Button>
                </>}
            />

            {/* ── Stat cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
                {loading ? Array.from({ length: 5 }).map((_, i) => <Skeleton.Card key={i} />) : <>
                    <Card.Stat label="Total Projects" value={projects.length} icon={Briefcase} color="#6366f1" bg="#eef2ff" onClick={() => navigate('/manager/projects')} />
                    <Card.Stat label="Active" value={active} icon={Zap} color="#10b981" bg="#ecfdf5" onClick={() => navigate('/manager/projects')} />
                    <Card.Stat label="Planning" value={planning} icon={Clock} color="#f59e0b" bg="#fffbeb" onClick={() => navigate('/manager/projects')} />
                    <Card.Stat label="Completed" value={completed} icon={CheckCircle2} color="#2563eb" bg="#eff6ff" onClick={() => navigate('/manager/projects')} />
                    <Card.Stat label="Overdue" value={overdue} icon={AlertTriangle} color="#ef4444" bg="#fef2f2" onClick={() => navigate('/manager/projects')} />
                </>}
            </div>

            {/* ── Responsive grid for middle section ── */}
            <div className="manager-grid">


                {/* Recent Projects */}
                <Card.Section
                    title="Recent Projects"
                    subtitle={`${projects.length} project${projects.length !== 1 ? 's' : ''}`}
                    icon={TrendingUp} iconColor="#6366f1" iconBg="#eef2ff"
                    action={<button onClick={() => navigate('/manager/projects')} style={{ background: 'none', border: 'none', color: 'var(--clr-primary-500)', cursor: 'pointer', fontSize: 'var(--text-xs)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>View all <ArrowRight size={12} /></button>}
                >
                    {loading ? <Skeleton.Text lines={4} /> : projects.length === 0
                        ? <EmptyState icon={FolderOpen} title="No projects yet" description="Create your first project to get started." action={<Button size="sm" icon={Plus} onClick={() => navigate('/manager/projects')}>Create Project</Button>} />
                        : projects.slice(0, 5).map(p => <ProjectRow key={p._id} project={p} onClick={() => navigate(`/manager/projects/${p._id}`)} />)
                    }
                </Card.Section>

                {/* Reports / Insights Card */}
                <Card.Section 
                    title="Project Health" 
                    subtitle="Distribution overview" 
                    icon={PieIcon} 
                    iconColor="#2563eb" 
                    iconBg="#eff6ff"
                    action={<button onClick={() => navigate('/manager/reports')} style={{ background: 'none', border: 'none', color: 'var(--clr-primary-500)', cursor: 'pointer', fontSize: 'var(--text-xs)', fontWeight: 600 }}>Full Report →</button>}
                >
                    <div style={{ minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {loading ? <div style={{ width: '100%', height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" color="#cbd5e1" /></div> : (
                            <CircularChart data={projectChartData} width="100%" height={180} />
                        )}
                    </div>
                </Card.Section>

                {/* Team panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                    <Card.Section title="Away Today" subtitle={`${awayEmployees.length} employee${awayEmployees.length !== 1 ? 's' : ''}`} icon={Users} iconColor="#f59e0b" iconBg="#fffbeb">
                        {loading ? <Skeleton.Text lines={2} /> : awayEmployees.length === 0
                            ? <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--clr-slate-400)', textAlign: 'center', padding: '0.5rem' }}>✅ Everyone is available</p>
                            : awayEmployees.slice(0, 3).map(l => <PersonRow key={l._id} leave={l} variant="away" />)
                        }
                    </Card.Section>

                    <Card.Section
                        title="Upcoming Leaves"
                        subtitle="Next 7 days"
                        icon={Calendar} iconColor="#10b981" iconBg="#ecfdf5"
                        action={<button onClick={() => navigate('/manager/leave-calendar')} style={{ background: 'none', border: 'none', color: 'var(--clr-success-500)', cursor: 'pointer', fontSize: 'var(--text-xs)', fontWeight: 600 }}>Calendar →</button>}
                    >
                        {loading ? <Skeleton.Text lines={2} /> : upcomingLeaves.length === 0
                            ? <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--clr-slate-400)', textAlign: 'center', padding: '0.5rem' }}>No upcoming leaves</p>
                            : upcomingLeaves.slice(0, 3).map(l => <PersonRow key={l._id} leave={l} variant="upcoming" />)
                        }
                    </Card.Section>
                </div>
            </div>

            {/* ── Activity Feed ── */}
            <ActivityFeed mode="company" title="Recent Activity" limit={12} maxHeight="380px" />
        </div>
    );
};


export default ManagerDashboard;
