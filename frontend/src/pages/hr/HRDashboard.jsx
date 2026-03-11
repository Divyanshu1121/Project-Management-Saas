import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
    Users, Briefcase, UserPlus, ShieldCheck, Calendar, LayoutDashboard
} from 'lucide-react';
import HREmployees from './HREmployees';
import CompanyTeamTable from '../owner/CompanyTeamTable';
import LeaveManagement from './LeaveManagement';
import { PageHeader, PanelCard, SectionContainer, Button } from '../../design-system';

const HRDashboard = ({ defaultSection = 'dashboard' }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [leadership, setLeadership] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const renderDashboard = () => (
        <>
            <PageHeader
                title="HR Overview"
                subtitle="Manage employees and track leadership roles."
                icon={LayoutDashboard}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
                <PanelCard
                    variant="stat"
                    label="Total Employees"
                    value={stats?.totalEmployees || 0}
                    icon={Users}
                    color="var(--clr-success-500)"
                    bg="var(--clr-success-50)"
                    onClick={() => navigate('/hr/employees')}
                />
                <PanelCard
                    variant="stat"
                    label="Leadership"
                    value={stats?.totalProjectManagers || 0}
                    icon={ShieldCheck}
                    color="var(--clr-primary-500)"
                    bg="var(--clr-primary-50)"
                    onClick={() => navigate('/hr/leadership')}
                />
            </div>

            <PanelCard variant="section" title="Quick Actions" icon={Briefcase}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <Button
                        icon={UserPlus}
                        onClick={() => navigate('/hr/employees')}
                        style={{ flex: 1, justifyContent: 'center' }}
                    >
                        Manage Employees
                    </Button>
                    <Button
                        icon={ShieldCheck}
                        variant="secondary"
                        onClick={() => navigate('/hr/leadership')}
                        style={{ flex: 1, justifyContent: 'center' }}
                    >
                        View Leadership
                    </Button>
                </div>
            </PanelCard>
        </>
    );

    const renderContent = () => {
        switch (defaultSection) {
            case 'employees':
                return <HREmployees />;
            case 'leadership':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
                        <PageHeader
                            title="Leadership Team"
                            subtitle="Viewing company executives and managers."
                            icon={ShieldCheck}
                        />
                        <PanelCard>
                            <CompanyTeamTable users={leadership} onDelete={() => { }} currentUserRole={user?.role} />
                        </PanelCard>
                    </div>
                );
            case 'leaves':
                return <LeaveManagement />;
            case 'dashboard':
            default:
                return renderDashboard();
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--clr-slate-500)' }}>Loading HR Dashboard...</div>;
    if (!stats) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--clr-slate-500)' }}>No stats available.</div>;

    return (
        <SectionContainer>
            {renderContent()}
        </SectionContainer>
    );
};

export default HRDashboard;
