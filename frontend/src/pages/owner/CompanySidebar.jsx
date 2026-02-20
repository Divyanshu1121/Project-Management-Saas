import React from 'react';
import { LayoutDashboard, Users, Briefcase, BarChart, ListTodo, User, Settings, Layers, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CompanySidebar = ({ activeSection, setActiveSection }) => {
    const { user, logout } = useAuth();

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'c-executives', label: 'C-Executives', icon: Users },
        { id: 'projects', label: 'Projects', icon: Briefcase },
        { id: 'teams', label: 'Teams', icon: Layers },
        { id: 'tasks', label: 'Tasks', icon: ListTodo },
        { id: 'reports', label: 'Reports', icon: BarChart },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const roleLabelMap = {
        COMPANY_OWNER: 'Company Owner',
        CEO: 'CEO',
        CTO: 'CTO',
        CFO: 'CFO',
        COO: 'COO',
    };

    return (
        <div className="company-sidebar">
            <div className="sidebar-header">
                <div className="sidebar-brand">
                    <div className="brand-icon">
                        <LayoutDashboard size={24} color="white" />
                    </div>
                    <span className="brand-text">Company Panel</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            className={`sidebar-item ${activeSection === item.id ? 'active' : ''}`}
                            onClick={() => setActiveSection(item.id)}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <div
                    className="user-profile-preview"
                    onClick={() => setActiveSection('settings')}
                    style={{ cursor: 'pointer', borderRadius: '0.5rem', transition: 'background-color 0.15s ease' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <div className="user-avatar">
                        <User size={18} />
                    </div>
                    <div className="user-info">
                        <p className="user-name">{user?.name}</p>
                        <p className="user-role">{roleLabelMap[user?.role] || user?.role?.replace(/_/g, ' ')}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        marginTop: '0.75rem',
                        borderRadius: '0.5rem',
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <LogOut size={15} />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default CompanySidebar;
