import React from 'react';
import { LayoutDashboard, Users, Briefcase, BarChart, ListTodo, User, Settings, Layers } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CompanySidebar = ({ activeSection, setActiveSection }) => {
    const { user } = useAuth();

    // Define menu items
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'c-executives', label: 'C-Executives', icon: Users },
        { id: 'projects', label: 'Projects', icon: Briefcase },
        { id: 'teams', label: 'Teams', icon: Layers },
        { id: 'tasks', label: 'Tasks', icon: ListTodo },
        { id: 'reports', label: 'Reports', icon: BarChart },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

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
                <div className="user-profile-preview">
                    <div className="user-avatar">
                        <User size={18} />
                    </div>
                    <div className="user-info">
                        <p className="user-name">{user?.name}</p>
                        <p className="user-role">{user?.role?.replace('_', ' ')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanySidebar;
