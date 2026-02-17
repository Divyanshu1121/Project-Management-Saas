import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
    Building,
    ShieldCheck,
    Activity,
    Calendar,
    Users,
    Briefcase,
    Layers,
    CheckSquare,
    UserPlus,
    User,
    LogOut,
    Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './CompanyDashboard.css';
import CompanyTeamTable from './CompanyTeamTable';
import CreateTeamMemberModal from './CreateTeamMemberModal';
import CompanySidebar from './CompanySidebar';
import ProfileView from '../../components/common/ProfileView';
import CompanyTeams from './CompanyTeams';

const CompanyDashboard = () => {
    const { user, logout } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("dashboard");
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileMenuRef = useRef(null);

    const isCEO = user?.role === 'CEO' || user?.role === 'COMPANY_OWNER';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await api.get('/company/dashboard');
                setDashboardData(res.data);
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
            }
        };

        const fetchTeamMembers = async () => {
            try {
                const res = await api.get('/company/users');
                setTeamMembers(res.data);
            } catch (err) {
                console.error("Error fetching team members:", err);
            }
        };

        const loadAll = async () => {
            setLoading(true);
            await Promise.all([fetchDashboardData(), fetchTeamMembers()]);
            setLoading(false);
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
            console.error("Error creating user", error);
            alert(error.response?.data?.message || "Failed to create user");
        }
    };

    const handleDeleteUser = async (id) => {
        if (!isCEO) return;
        if (!window.confirm("Are you sure you want to remove this user?")) return;
        try {
            await api.delete(`/company/users/${id}`);
            setTeamMembers(teamMembers.filter(user => user._id !== id));
            const statsRes = await api.get('/company/dashboard');
            setDashboardData(statsRes.data);
        } catch (error) {
            console.error("Error deleting user", error);
            alert("Failed to delete user");
        }
    };

    if (loading) {
        return <div className="loading-container">Loading dashboard...</div>;
    }

    if (!dashboardData || !dashboardData.company) {
        return <div className="dashboard-container">No company data available.</div>;
    }

    const { company, stats } = dashboardData;

    // Helper to render content based on active section
    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard':
                return (
                    <>
                        <div className="dashboard-header">
                            <div>
                                <h1 className="dashboard-title">Company Overview</h1>
                                <p className="dashboard-subtitle">Welcome back, {user?.name}</p>
                            </div>
                        </div>

                        {/* Company Info Section */}
                        <div className="company-card">
                            <div className="company-card-content">
                                <div className="company-info-main">
                                    <div className="company-name-wrapper">
                                        <Building className="company-icon" />
                                        <h2 className="company-name">{company.name}</h2>
                                    </div>
                                    <span className="company-id">ID: {company._id}</span>
                                </div>

                                <div className="company-meta-grid">
                                    <div className="meta-item">
                                        <ShieldCheck className="meta-icon" />
                                        <div className="meta-content">
                                            <span className="meta-label">Plan</span>
                                            <span className="meta-value">{company.plan || 'Free'}</span>
                                        </div>
                                    </div>
                                    <div className="meta-item">
                                        <Calendar className="meta-icon" />
                                        <div className="meta-content">
                                            <span className="meta-label">Created</span>
                                            <span className="meta-value">
                                                {new Date(company.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Cards Section */}
                        <div className="stats-grid">
                            <StatCard
                                title="Total Team"
                                value={stats?.totalProjectManagers || 0}
                                icon={Users}
                                colorClass="color-blue"
                            />
                            <StatCard
                                title="Total Employees"
                                value={stats?.totalEmployees || 0}
                                icon={Briefcase}
                                colorClass="color-green"
                            />
                            <StatCard
                                title="Total Projects"
                                value={stats?.totalProjects || 0}
                                icon={Layers}
                                colorClass="color-purple"
                            />
                            <StatCard
                                title="Total Tasks"
                                value={stats?.totalTasks || 0}
                                icon={CheckSquare}
                                colorClass="color-orange"
                            />
                        </div>
                    </>
                );
            case 'c-executives':
                return (
                    <>
                        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '0 2rem', marginTop: '2rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>Team Members</h3>
                                <p style={{ color: '#64748b' }}>Manage your company's team members and their roles.</p>
                            </div>
                            {isCEO && (
                                <button
                                    className="btn-primary"
                                    onClick={() => setIsModalOpen(true)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        padding: '0.75rem 1.5rem', borderRadius: '0.5rem',
                                        backgroundColor: '#2563eb', color: 'white', border: 'none',
                                        cursor: 'pointer', fontWeight: 600
                                    }}
                                >
                                    <UserPlus size={20} />
                                    <span>Add Member</span>
                                </button>
                            )}
                        </div>
                        <CompanyTeamTable users={teamMembers} onDelete={handleDeleteUser} currentUserRole={user?.role} />
                    </>
                );
            case 'projects':
                return <div className="placeholder-content"><h2>Projects</h2><p>Project management features coming soon.</p></div>;
            case 'teams':
                return <CompanyTeams />;
            case 'reports':
                return <div className="placeholder-content"><h2>Reports</h2><p>Reporting features coming soon.</p></div>;
            case 'tasks':
                return <div className="placeholder-content"><h2>Tasks</h2><p>Task management features coming soon.</p></div>;
            case 'settings':
                return (
                    <div style={{ padding: '0 1rem' }}>
                        <ProfileView />
                    </div>
                );
            default:
                return <div>Select a section</div>;
        }
    };

    return (
        <div className="company-panel-layout">
            <CompanySidebar activeSection={activeSection} setActiveSection={setActiveSection} />

            <div className="main-content-wrapper">
                <header className="company-header">
                    <h2 className="header-title">
                        {{
                            'dashboard': 'Dashboard',
                            'c-executives': 'C-Executives',
                            'projects': 'Projects',
                            'teams': 'Teams',
                            'tasks': 'Tasks',
                            'reports': 'Reports',
                            'settings': 'Settings'
                        }[activeSection] || activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                    </h2>

                    <div className="header-actions">
                        <div style={{ position: 'relative' }} ref={profileMenuRef}>
                            <button
                                className="user-menu-btn"
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                            >
                                <div className="user-avatar" style={{ width: 32, height: 32, fontSize: '0.9rem' }}>
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ textAlign: 'left', display: 'none', '@media (min-width: 768px)': { display: 'block' } }}>
                                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>{user?.name}</p>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{user?.role}</p>
                                </div>
                            </button>

                            {showProfileMenu && (
                                <div className="dropdown-menu" style={{
                                    position: 'absolute',
                                    top: '120%',
                                    right: 0,
                                    width: '200px',
                                    backgroundColor: 'white',
                                    borderRadius: '0.5rem',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                    border: '1px solid #e2e8f0',
                                    padding: '0.5rem',
                                    zIndex: 50
                                }}>
                                    <button
                                        onClick={() => { setActiveSection('settings'); setShowProfileMenu(false); }}
                                        className="dropdown-item"
                                        style={{
                                            width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.75rem',
                                            padding: '0.75rem', color: '#475569', background: 'none', border: 'none',
                                            cursor: 'pointer', borderRadius: '0.25rem'
                                        }}
                                    >
                                        <User size={16} /> Profile
                                    </button>
                                    <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '0.5rem 0' }}></div>
                                    <button
                                        onClick={logout}
                                        style={{
                                            width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.75rem',
                                            padding: '0.75rem', color: '#ef4444', background: 'none', border: 'none',
                                            cursor: 'pointer', borderRadius: '0.25rem'
                                        }}
                                    >
                                        <LogOut size={16} /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className="dashboard-container">
                    {renderContent()}

                    <CreateTeamMemberModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSubmit={handleCreateUser}
                    />
                </div>
            </div>
        </div>
    );
};

// Sub-component for individual stat cards
const StatCard = ({ title, value, icon: Icon, colorClass }) => {
    return (
        <div className="stat-card">
            <div className={`stat-icon-wrapper ${colorClass}`}>
                <Icon size={24} />
            </div>
            <div className="stat-content">
                <span className="stat-label">{title}</span>
                <span className="stat-value">{value}</span>
            </div>
        </div>
    );
};

export default CompanyDashboard;
