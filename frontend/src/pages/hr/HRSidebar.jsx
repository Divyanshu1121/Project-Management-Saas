import React from 'react';
import { LayoutDashboard, Users, User, Settings, LogOut, ShieldCheck, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const HRSidebar = ({ activeSection, setActiveSection }) => {
    const { user, logout } = useAuth();

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'employees', label: 'Employees', icon: Users },
        { id: 'leadership', label: 'Leadership', icon: ShieldCheck },
        { id: 'leaves', label: 'Leave management', icon: Calendar },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const roleLabelMap = {
        HR: 'HR Manager',
    };

    return (
        <div className="company-sidebar">
            <div className="sidebar-header">
                <div className="sidebar-brand">
                    <div className="brand-icon" style={{ backgroundColor: '#10b981' }}>
                        <Users size={24} color="white" />
                    </div>
                    <span className="brand-text">HR Panel</span>
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

export default HRSidebar;
