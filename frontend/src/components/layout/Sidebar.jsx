import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, Users, Briefcase, ListTodo,
    Clock, BarChart, Settings, LogOut, User, Activity, Calendar, MessageSquare
} from 'lucide-react';

const Sidebar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    if (!user) return null;

    const role = user.role;

    const getLinks = () => {
        switch (role) {
            case 'SUPER_ADMIN':
                return [
                    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
                    { name: 'Users', path: '/admin/users', icon: <Users size={20} /> },
                    { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
                ];
            case 'PROJECT_MANAGER':
                return [
                    { name: 'Dashboard', path: '/manager', icon: <LayoutDashboard size={20} /> },
                    { name: 'Projects', path: '/manager/projects', icon: <Briefcase size={20} /> },
                    { name: 'Tasks', path: '/manager/tasks', icon: <ListTodo size={20} /> },
                    { name: 'Team', path: '/manager/team', icon: <Users size={20} /> },
                    { name: 'Calendar', path: '/manager/timeline-calendar', icon: <Calendar size={20} /> },
                    { name: 'Workload', path: '/manager/workload', icon: <Activity size={20} /> },
                    { name: 'Reports', path: '/manager/reports', icon: <BarChart size={20} /> },
                    { name: 'Global Chat', path: '/chat', icon: <MessageSquare size={20} /> },
                    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
                ];
            case 'EMPLOYEE':
                return [
                    { name: 'Dashboard', path: '/employee', icon: <LayoutDashboard size={20} /> },
                    { name: 'My Tasks', path: '/employee/tasks', icon: <ListTodo size={20} /> },
                    { name: 'Time Logs', path: '/employee/time-logs', icon: <Clock size={20} /> },
                    { name: 'My Leave', path: '/employee/leave', icon: <Calendar size={20} /> },
                    { name: 'Global Chat', path: '/chat', icon: <MessageSquare size={20} /> },
                    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
                ];
            default:
                return [];
        }
    };


    const links = getLinks();

    const roleLabelMap = {
        SUPER_ADMIN: 'Super Admin',
        PROJECT_MANAGER: 'Project Manager',
        EMPLOYEE: 'Employee',
        COMPANY_OWNER: 'Company Owner',
        CEO: 'CEO',
        CTO: 'CTO',
        CFO: 'CFO',
        COO: 'COO',
    };

    return (
        <div className="sidebar">
            {/* Brand */}
            <div style={{
                padding: '1.5rem 1.25rem 1rem',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--primary-color, #2563eb)',
                borderBottom: '1px solid #e5e7eb',
                marginBottom: '0.5rem',
                letterSpacing: '-0.01em'
            }}>
                SaaS Project Manager
            </div>

            {/* Nav links */}
            <nav style={{ flex: 1, padding: '0.5rem 0.75rem', overflowY: 'auto' }}>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', listStyle: 'none', margin: 0, padding: 0 }}>
                    {links.map((link) => (
                        <li key={link.path}>
                            <NavLink
                                to={link.path}
                                end
                                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                                style={({ isActive }) => ({
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.65rem 0.75rem',
                                    borderRadius: '0.5rem',
                                    color: isActive ? '#2563eb' : '#374151',
                                    backgroundColor: isActive ? '#eff6ff' : 'transparent',
                                    fontWeight: isActive ? 600 : 400,
                                    fontSize: '0.925rem',
                                    textDecoration: 'none',
                                    transition: 'background-color 0.15s ease, color 0.15s ease',
                                })}
                            >
                                {link.icon}
                                {link.name}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Profile section at bottom */}
            <div style={{
                margin: '0.75rem',
                padding: '0.875rem 1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '0.75rem',
                border: '1px solid #e2e8f0',
            }}>
                <div
                    onClick={() => navigate(role === 'SUPER_ADMIN' ? '/admin/settings' : '/settings')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', cursor: 'pointer', borderRadius: '0.5rem', padding: '0.25rem', transition: 'background-color 0.15s ease' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    {/* Avatar */}
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: '#dbeafe',
                        color: '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <User size={18} />
                    </div>
                    {/* Name & Role */}
                    <div style={{ overflow: 'hidden' }}>
                        <p style={{
                            margin: 0,
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            color: '#1e293b',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {user.name}
                        </p>
                        <p style={{
                            margin: 0,
                            fontSize: '0.75rem',
                            color: '#64748b',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            textTransform: 'uppercase',
                            letterSpacing: '0.03em'
                        }}>
                            {roleLabelMap[role] || role}
                        </p>
                    </div>
                </div>

                {/* Logout button */}
                <button
                    onClick={logout}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.5rem',
                        backgroundColor: 'transparent',
                        border: '1px solid #e2e8f0',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <LogOut size={15} />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
