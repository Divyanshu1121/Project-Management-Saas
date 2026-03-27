import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, Users, Briefcase, ListTodo,
    Clock, BarChart2, Settings, LogOut, Activity,
    Calendar, MessageSquare, Kanban, ChevronRight, ShieldCheck, ChevronLeft, Home
} from 'lucide-react';
import './layout.css';

// ── Nav group config ────────────────────────────────────────────────────
const MANAGER_LINKS = [
    {
        group: 'Overview',
        items: [{ name: 'Dashboard', path: '/manager', icon: LayoutDashboard }]
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
            { name: 'My Leave', path: '/employee/leave', icon: Calendar },
            { name: 'Work From Home', path: '/employee/wfh', icon: Home },
            { name: 'Global Chat', path: '/chat', icon: MessageSquare },
            { name: 'Settings', path: '/settings', icon: Settings },
        ]
    },
];

const EMPLOYEE_LINKS = [
    {
        group: 'Overview',
        items: [{ name: 'Dashboard', path: '/employee', icon: LayoutDashboard }]
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
            { name: 'Work From Home', path: '/employee/wfh', icon: Home },
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
        items: [{ name: 'Dashboard', path: '/hr', icon: LayoutDashboard }]
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
            { name: 'Work From Home', path: '/hr/wfh', icon: Home }
        ]
    },
    {
        group: 'Other',
        items: [
            { name: 'My Leave', path: '/employee/leave', icon: Calendar },
            { name: 'Work From Home', path: '/employee/wfh', icon: Home },
            { name: 'Settings', path: '/settings', icon: Settings }
        ]
    },
];

const COMPANY_LINKS = [
    {
        group: 'Overview',
        items: [{ name: 'Dashboard', path: '/company', icon: LayoutDashboard }]
    },
    {
        group: 'Management',
        items: [
            { name: 'C-Executives', path: '/company/c-executives', icon: ShieldCheck },
            { name: 'Teams', path: '/company/teams', icon: Users },
            { name: 'Leave Management', path: '/hr/leaves', icon: Calendar },
            { name: 'WFH Management', path: '/hr/wfh', icon: Home },
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
            { name: 'My Leave', path: '/employee/leave', icon: Calendar },
            { name: 'Work From Home', path: '/employee/wfh', icon: Home },
            { name: 'Settings', path: '/company/settings', icon: Settings }
        ]
    },
];

const ROLE_LINKS = {
    PROJECT_MANAGER: MANAGER_LINKS,
    EMPLOYEE: EMPLOYEE_LINKS,
    SUPER_ADMIN: ADMIN_LINKS,
    HR: HR_LINKS,
    COMPANY_OWNER: COMPANY_LINKS,
    owner: COMPANY_LINKS,
    CEO: COMPANY_LINKS,
    CTO: COMPANY_LINKS,
    CFO: COMPANY_LINKS,
    COO: COMPANY_LINKS,
    superadmin: ADMIN_LINKS,
};

const ROLE_LABELS = {
    SUPER_ADMIN: 'Super Admin',
    superadmin: 'Super Admin',
    PROJECT_MANAGER: 'Project Manager',
    EMPLOYEE: 'Employee',
    COMPANY_OWNER: 'Company Owner',
    owner: 'Company Owner',
    HR: 'HR Manager',
};

// ── Sidebar component ───────────────────────────────────────────────────
const Sidebar = ({ isOpen, isCollapsed, onToggleCollapse }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    if (!user) return null;

    const role = user.role;
    const groups = ROLE_LINKS[role] || [];
    const isOwner = ['COMPANY_OWNER', 'owner', 'CEO', 'CTO', 'CFO', 'COO'].includes(role);
    const settingsPath = (role === 'SUPER_ADMIN' || role === 'superadmin') ? '/admin/settings' :
        isOwner ? '/company/settings' : '/settings';

    const sidebarClasses = [
        'sidebar',
        isOpen ? 'sidebar-open' : '',
        isCollapsed ? 'sidebar-collapsed' : '',
    ].filter(Boolean).join(' ');

    return (
        <div className={sidebarClasses}>

            {/* ── Brand ── */}
            <div className="sidebar-brand" style={{ position: 'relative' }}>
                <div className="sidebar-brand-logo">P</div>
                <div className="sidebar-brand-text">
                    <div className="sidebar-brand-name">ProManage</div>
                    <div className="sidebar-brand-sub">Project Suite</div>
                </div>

                {/* Desktop collapse toggle */}
                <button
                    className="sidebar-collapse-btn"
                    onClick={onToggleCollapse}
                    title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <ChevronLeft size={13} />
                </button>
            </div>

            {/* ── Nav ── */}
            <nav className="sidebar-nav">
                {groups.map(({ group, items }) => (
                    <div key={group}>
                        <div className="sidebar-section-label">{group}</div>
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                            {items.map(({ name, path, icon: Icon }) => (
                                <li key={path} className="nav-item">
                                    <NavLink
                                        to={path}
                                        end={['/manager', '/employee', '/admin', '/company', '/hr'].includes(path)}
                                        className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                                    >
                                        <Icon size={17} className="nav-icon" />
                                        <span className="nav-link-text">{name}</span>
                                        <span className="nav-link-tooltip">{name}</span>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* ── Profile footer ── */}
            <div className="sidebar-footer">
                {/* User card */}
                <div
                    className="sidebar-user-card"
                    onClick={() => navigate(settingsPath)}
                    title={isCollapsed ? user.name : undefined}
                >
                    <div className="sidebar-user-avatar">
                        {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="sidebar-user-info">
                        <p className="sidebar-user-name">{user.name}</p>
                        <p className="sidebar-user-role">{ROLE_LABELS[role] || role}</p>
                    </div>
                    <ChevronRight size={13} className="sidebar-user-chevron" />
                </div>

                {/* Logout */}
                <button
                    className="sidebar-logout-btn"
                    onClick={logout}
                    title={isCollapsed ? 'Sign out' : undefined}
                >
                    <LogOut size={14} className="sidebar-logout-icon" />
                    <span className="sidebar-logout-text">Sign out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
