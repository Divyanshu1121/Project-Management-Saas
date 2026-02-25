import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
    Users, Briefcase, UserPlus, ShieldCheck, Calendar
} from 'lucide-react';
import HRSidebar from './HRSidebar';
import HREmployees from './HREmployees';
import ProfileView from '../../components/common/ProfileView';
import CompanyTeamTable from '../owner/CompanyTeamTable';
import LeaveManagement from './LeaveManagement';
import '../owner/CompanyDashboard.css';

const StatCard = ({ title, value, icon: Icon, colorClass, onClick }) => (
    <div className={`stat-card ${onClick ? 'clickable' : ''}`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
        <div className={`stat-icon-wrapper ${colorClass}`}><Icon size={24} /></div>
        <div className="stat-content">
            <span className="stat-label">{title}</span>
            <span className="stat-value">{value}</span>
        </div>
    </div>
);

const renderStats = (stats, setActiveSection) => (
    <>
        <div className="dashboard-header">
            <div>
                <h1 className="dashboard-title">HR Overview</h1>
                <p className="dashboard-subtitle">Manage employees and track leadership roles.</p>
            </div>
        </div>

        {/* Company info card */}
        <div className="company-card">
            <div className="company-card-content">
                <div className="company-info-main">
                    <div className="company-name-wrapper">
                        <Briefcase className="company-icon" />
                        <h2 className="company-name">HR Management Portal</h2>
                    </div>
                </div>
                <div className="company-meta-grid">
                    <div className="meta-item">
                        <ShieldCheck className="meta-icon" />
                        <div className="meta-content">
                            <span className="meta-label">Access Level</span>
                            <span className="meta-value">HR Manager</span>
                        </div>
                    </div>
                    <div className="meta-item">
                        <Calendar className="meta-icon" />
                        <div className="meta-content">
                            <span className="meta-label">Date</span>
                            <span className="meta-value">{new Date().toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="stats-grid">
            <StatCard
                title="Total Employees"
                value={stats?.totalEmployees || 0}
                icon={Briefcase}
                colorClass="color-green"
                onClick={() => setActiveSection('employees')}
            />
            <StatCard
                title="Leadership"
                value={stats?.totalProjectManagers || 0}
                icon={Users}
                colorClass="color-blue"
                onClick={() => setActiveSection('leadership')}
            />
        </div>

        <div style={{ marginTop: '2rem', padding: '2rem', background: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Quick Actions</h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                    onClick={() => setActiveSection('employees')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        backgroundColor: '#ecfdf5',
                        color: '#059669',
                        border: '1px solid #d1fae5',
                        cursor: 'pointer',
                        fontWeight: 600,
                        flex: 1
                    }}
                >
                    <UserPlus size={20} />
                    <span>Manage Employees</span>
                </button>
                <button
                    onClick={() => setActiveSection('leadership')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #dbeafe',
                        cursor: 'pointer',
                        fontWeight: 600,
                        flex: 1
                    }}
                >
                    <ShieldCheck size={20} />
                    <span>View Leadership</span>
                </button>
            </div>
        </div>
    </>
);

const HRDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [leadership, setLeadership] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('dashboard');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [statsRes, leadershipRes] = await Promise.all([
                    api.get('/company/dashboard'),
                    api.get('/company/users')
                ]);
                setStats(statsRes.data.stats);
                setLeadership(leadershipRes.data || []);
            } catch (err) {
                console.error('Error fetching HR data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard':
                return renderStats(stats, setActiveSection);
            case 'employees':
                return <HREmployees />;
            case 'leadership':
                return (
                    <div style={{ padding: '0 2rem' }}>
                        <div style={{ marginBottom: '1.5rem', marginTop: '1rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Leadership Team</h2>
                            <p style={{ color: '#64748b', margin: '0.25rem 0 0' }}>Viewing company executives and managers.</p>
                        </div>
                        <CompanyTeamTable users={leadership} onDelete={() => { }} currentUserRole={user?.role} />
                    </div>
                );
            case 'leaves':
                return <LeaveManagement />;
            case 'settings':
                return <div style={{ padding: '0 1rem' }}><ProfileView /></div>;
            default:
                return <div>Select a section</div>;
        }
    };

    if (loading) return <div className="loading-container">Loading HR Dashboard...</div>;
    if (!stats) return <div className="dashboard-container">No stats available.</div>;

    return (
        <div className="company-panel-layout">
            <HRSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
            <div className="main-content-wrapper">
                <div className="dashboard-container">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default HRDashboard;
