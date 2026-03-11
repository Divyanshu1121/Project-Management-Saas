import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, Users, Briefcase, ListTodo,
    Clock, BarChart2, Settings, LogOut, Activity,
    Calendar, MessageSquare, Kanban, ChevronRight, ShieldCheck, Layers
} from 'lucide-react';
import './layout.css';

// ── Nav group config ────────────────────────────────────────────────────
const MANAGER_LINKS = [
    {
        group: 'Overview',
        items: [
            { name: 'Dashboard', path: '/manager', icon: LayoutDashboard },
        ]
    },
    {
        group: 'Work',
        items: [
            { name: 'Projects', path: '/manager/projects', icon: Briefcase },
            { name: 'Tasks', path: '/manager/tasks', icon: ListTodo },
            { name: 'Kanban', path: '/manager/kanban', icon: Kanban },
        ]
    },
    {
        group: 'Insights',
        items: [
            { name: 'Team', path: '/manager/team', icon: Users },
            { name: 'Workload', path: '/manager/workload', icon: Activity },
            { name: 'Calendar', path: '/manager/timeline-calendar', icon: Calendar },
            { name: 'Reports', path: '/manager/reports', icon: BarChart2 },
        ]
    },
    {
        group: 'Other',
        items: [
            { name: 'Global Chat', path: '/chat', icon: MessageSquare },
            { name: 'Settings', path: '/settings', icon: Settings },
        ]
    },
];

const EMPLOYEE_LINKS = [
    {
        group: 'Overview',
        items: [
            { name: 'Dashboard', path: '/employee', icon: LayoutDashboard },
        ]
    },
    {
        group: 'Work',
        items: [
            { name: 'My Tasks', path: '/employee/tasks', icon: ListTodo },
            { name: 'Time Logs', path: '/employee/time-logs', icon: Clock },
        ]
    },
    {
        group: 'Other',
        items: [
            { name: 'My Leave', path: '/employee/leave', icon: Calendar },
            { name: 'Global Chat', path: '/chat', icon: MessageSquare },
            { name: 'Settings', path: '/settings', icon: Settings },
        ]
    },
];

const ADMIN_LINKS = [
    {
        group: 'Admin',
        items: [
            { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
            { name: 'Users', path: '/admin/users', icon: Users },
            { name: 'Settings', path: '/admin/settings', icon: Settings },
        ]
    },
];

const HR_LINKS = [
    {
        group: 'Overview',
        items: [
            { name: 'Dashboard', path: '/hr', icon: LayoutDashboard },
        ]
    },
    {
        group: 'People',
        items: [
            { name: 'Employees', path: '/hr/employees', icon: Users },
            { name: 'Leadership', path: '/hr/leadership', icon: ShieldCheck },
        ]
    },
    {
        group: 'Time Off',
        items: [
            { name: 'Leave Management', path: '/hr/leaves', icon: Calendar },
        ]
    },
    {
        group: 'Other',
        items: [
            { name: 'Settings', path: '/settings', icon: Settings },
        ]
    },
];

const COMPANY_LINKS = [
    {
        group: 'Overview',
        items: [
            { name: 'Dashboard', path: '/company', icon: LayoutDashboard },
        ]
    },
    {
        group: 'Management',
        items: [
            { name: 'C-Executives', path: '/company/c-executives', icon: ShieldCheck },
            { name: 'Teams', path: '/company/teams', icon: Users },
        ]
    },
    {
        group: 'Work',
        items: [
            { name: 'Projects', path: '/company/projects', icon: Briefcase },
            { name: 'Tasks', path: '/company/tasks', icon: ListTodo },
            { name: 'Reports', path: '/company/reports', icon: BarChart2 },
        ]
    },
    {
        group: 'Other',
        items: [
            { name: 'Settings', path: '/company/settings', icon: Settings },
        ]
    },
];

const ROLE_LINKS = {
    PROJECT_MANAGER: MANAGER_LINKS,
    EMPLOYEE: EMPLOYEE_LINKS,
    SUPER_ADMIN: ADMIN_LINKS,
    HR: HR_LINKS,
    COMPANY_OWNER: COMPANY_LINKS,
    CEO: COMPANY_LINKS,
    CTO: COMPANY_LINKS,
    CFO: COMPANY_LINKS,
    COO: COMPANY_LINKS,
};

const ROLE_LABELS = {
    SUPER_ADMIN: 'Super Admin',
    PROJECT_MANAGER: 'Project Manager',
    EMPLOYEE: 'Employee',
    COMPANY_OWNER: 'Company Owner',
    HR: 'HR Manager',
};

// ── Sidebar component ───────────────────────────────────────────────────
const Sidebar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    if (!user) return null;

    const role = user.role;
    const groups = ROLE_LINKS[role] || [];
    // HR has its own sub-routes but uses the shared layout
    const isHR = role === 'HR';
    const isOwner = ['COMPANY_OWNER', 'CEO', 'CTO', 'CFO', 'COO'].includes(role);
    const settingsPath = role === 'SUPER_ADMIN' ? '/admin/settings' :
        isOwner ? '/company/settings' : '/settings';

    return (
        <div className="sidebar">
            {/* Brand */}
            <div className="sidebar-brand">
                <div className="sidebar-brand-logo">P</div>
                <div>
                    <div className="sidebar-brand-name">ProManage</div>
                    <div className="sidebar-brand-sub">Project Suite</div>
                </div>
            </div>

            {/* Nav */}
            <nav className="sidebar-nav">
                {groups.map(({ group, items }) => (
                    <div key={group}>
                        <div className="sidebar-section-label">{group}</div>
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                            {items.map(({ name, path, icon: Icon }) => (
                                <li key={path}>
                                    <NavLink
                                        to={path}
                                        end={['/manager', '/employee', '/admin', '/company', '/hr'].includes(path)}
                                        className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                                    >
                                        <Icon size={17} style={{ flexShrink: 0 }} />
                                        {name}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* Profile footer */}
            <div style={{
                margin: '0.5rem 0.75rem 0.75rem',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                paddingTop: '0.75rem',
            }}>
                {/* User card */}
                <div
                    onClick={() => navigate(settingsPath)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.7rem',
                        padding: '0.6rem 0.75rem', borderRadius: '0.5rem',
                        cursor: 'pointer', transition: 'background 0.15s',
                        marginBottom: '0.5rem',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                    {/* Avatar */}
                    <div style={{
                        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.85rem', fontWeight: 700, color: 'white',
                        boxShadow: '0 2px 6px rgba(99,102,241,0.3)',
                    }}>
                        {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.845rem', color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user.name}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {ROLE_LABELS[role] || role}
                        </p>
                    </div>
                    <ChevronRight size={13} color="#475569" style={{ flexShrink: 0 }} />
                </div>

                {/* Logout */}
                <button
                    onClick={logout}
                    style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
                        color: '#f87171', cursor: 'pointer', fontSize: '0.845rem', fontWeight: 500,
                        transition: 'background 0.15s, border-color 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.16)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.15)'; }}
                >
                    <LogOut size={14} />
                    Sign out
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
