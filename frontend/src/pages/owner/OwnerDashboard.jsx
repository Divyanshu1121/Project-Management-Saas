import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    Building,
    ShieldCheck,
    Activity,
    Calendar,
    Users,
    Briefcase,
    Layers,
    CheckSquare,
    UserPlus
} from 'lucide-react';
import './OwnerDashboard.css';
import CompanyTeamTable from './CompanyTeamTable';
import CreateTeamMemberModal from './CreateTeamMemberModal';

const OwnerDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
        try {
            const res = await api.post('/company/users', userData);
            setTeamMembers([res.data, ...teamMembers]);
            setIsModalOpen(false);
            // Optionally refetch stats to update "Total Managers" count
            const statsRes = await api.get('/company/dashboard');
            setDashboardData(statsRes.data);
        } catch (error) {
            console.error("Error creating user", error);
            alert(error.response?.data?.message || "Failed to create user");
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to remove this user?")) return;
        try {
            await api.delete(`/company/users/${id}`);
            setTeamMembers(teamMembers.filter(user => user._id !== id));
            // Optionally refetch stats
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

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1 className="dashboard-title">Company Overview</h1>
                <p className="dashboard-subtitle">Welcome back, here's what's happening at {company.name}</p>
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
                            <Activity className="meta-icon" />
                            <div className="meta-content">
                                <span className="meta-label">Status</span>
                                <span className={`meta-value ${company.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                                    {company.status}
                                </span>
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
                    title="Total Managers"
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

            <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Company Team</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => setIsModalOpen(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <UserPlus size={18} />
                    Add Member
                </button>
            </div>

            <CompanyTeamTable users={teamMembers} onDelete={handleDeleteUser} />

            <CreateTeamMemberModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateUser}
            />

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

export default OwnerDashboard;
