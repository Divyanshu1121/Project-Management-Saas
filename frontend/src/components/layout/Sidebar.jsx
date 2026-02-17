import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, Briefcase, ListTodo, Calendar, Clock, BarChart } from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuth();

    if (!user) return null;

    const role = user.role;

    const links = [
        { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} />, roles: ['SUPER_ADMIN'] },
        // { name: 'Companies', path: '/admin/companies', icon: <Briefcase size={20} />, roles: ['SUPER_ADMIN'] }, // Merged into Dashboard
        { name: 'Users', path: '/admin/users', icon: <Users size={20} />, roles: ['SUPER_ADMIN'] },
        { name: 'Settings', path: '/admin/settings', icon: <Calendar size={20} />, roles: ['SUPER_ADMIN'] },

        { name: 'Dashboard', path: '/owner', icon: <LayoutDashboard size={20} />, roles: ['COMPANY_OWNER'] },
        { name: 'Dashboard', path: '/manager', icon: <LayoutDashboard size={20} />, roles: ['PROJECT_MANAGER'] },
        { name: 'Dashboard', path: '/employee', icon: <LayoutDashboard size={20} />, roles: ['EMPLOYEE'] },
    ];

    if (role === 'Company Owner' || role === 'Project Manager') {
        links.push({ name: 'Projects', path: '/projects', icon: <Briefcase size={20} /> });
        links.push({ name: 'Tasks', path: '/tasks', icon: <ListTodo size={20} /> });
        links.push({ name: 'Team', path: '/team', icon: <Users size={20} /> });
        links.push({ name: 'Reports', path: '/reports', icon: <BarChart size={20} /> });
        links.push({ name: 'Settings', path: '/settings', icon: <Calendar size={20} /> }); // Using Calendar icon as placeholder or Change to Settings icon
    } else if (role === 'Employee') {
        links.push({ name: 'Settings', path: '/settings', icon: <Calendar size={20} /> });
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
                    {links.filter(link => link.roles && link.roles.includes(role)).map((link) => (
                        <li key={link.path}>
                            <NavLink
                                to={link.path}
                                end
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

                    {(role === 'COMPANY_OWNER' || role === 'PROJECT_MANAGER') && (
                        <>
                            <li><NavLink to="/projects" className="nav-link" style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem' }}><Briefcase size={20} /> Projects</NavLink></li>
                            <li><NavLink to="/tasks" className="nav-link" style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem' }}><ListTodo size={20} /> Tasks</NavLink></li>
                            <li><NavLink to="/team" className="nav-link" style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem' }}><Users size={20} /> Team</NavLink></li>
                            <li><NavLink to="/reports" className="nav-link" style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem' }}><BarChart size={20} /> Reports</NavLink></li>
                        </>
                    )}
                    {role === 'EMPLOYEE' && (
                        <>
                            <li><NavLink to="/tasks" className="nav-link" style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem' }}><ListTodo size={20} /> My Tasks</NavLink></li>
                            <li><NavLink to="/time-logs" className="nav-link" style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem' }}><Clock size={20} /> Time Logs</NavLink></li>
                        </>
                    )}
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
