import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, Briefcase, ListTodo, Calendar, Clock, BarChart } from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuth();

    if (!user) return null;

    const role = user.role;

    const links = [
        { name: 'Dashboard', path: role === 'Platform Admin' ? '/admin' : role === 'Company Owner' ? '/owner' : role === 'Project Manager' ? '/manager' : '/employee', icon: <LayoutDashboard size={20} /> },
        // Role specific links will go here or be conditional
    ];

    if (role === 'Company Owner' || role === 'Project Manager') {
        links.push({ name: 'Projects', path: '/projects', icon: <Briefcase size={20} /> });
        links.push({ name: 'Tasks', path: '/tasks', icon: <ListTodo size={20} /> });
        links.push({ name: 'Team', path: '/team', icon: <Users size={20} /> });
        links.push({ name: 'Reports', path: '/reports', icon: <BarChart size={20} /> });
    }

    if (role === 'Employee') {
        links.push({ name: 'My Tasks', path: '/tasks', icon: <ListTodo size={20} /> });
        links.push({ name: 'Time Logs', path: '/time-logs', icon: <Clock size={20} /> });
    }

    return (
        <div className="sidebar">
            <div style={{ marginBottom: '2rem', fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                SaaS Project Manager
            </div>

            <nav>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {links.map((link) => (
                        <li key={link.path}>
                            <NavLink
                                to={link.path}
                                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                                style={({ isActive }) => ({
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem',
                                    borderRadius: '0.375rem',
                                    color: isActive ? 'var(--primary-color)' : 'var(--text-color)',
                                    backgroundColor: isActive ? '#eff6ff' : 'transparent',
                                    fontWeight: isActive ? 500 : 400
                                })}
                            >
                                {link.icon}
                                {link.name}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                <button onClick={logout} className="btn" style={{ width: '100%', textAlign: 'left', color: '#ef4444' }}>
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
