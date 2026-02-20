import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Briefcase, CheckSquare, Clock } from 'lucide-react';

const ManagerDashboard = () => {
    const [projects, setProjects] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await api.get('/projects');
                setProjects(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchProjects();
    }, []);

    const activeCount = projects.filter(p => p.status === 'Active').length;
    const planningCount = projects.filter(p => p.status === 'Planning').length;

    const statusColors = {
        Active: { bg: '#dcfce7', color: '#166534' },
        Planning: { bg: '#fef9c3', color: '#854d0e' },
        Completed: { bg: '#dbeafe', color: '#1e40af' },
        'On Hold': { bg: '#fee2e2', color: '#991b1b' },
    };

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.25rem 0' }}>
                    Manager Dashboard
                </h1>
                <p style={{ color: '#64748b', margin: 0 }}>Welcome back! Here's a quick overview of your projects.</p>
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Total Projects', value: projects.length, Icon: Briefcase, color: '#2563eb', bg: '#eff6ff' },
                    { label: 'Active', value: activeCount, Icon: CheckSquare, color: '#16a34a', bg: '#dcfce7' },
                    { label: 'Planning', value: planningCount, Icon: Clock, color: '#d97706', bg: '#fef9c3' },
                ].map(({ label, value, Icon, color, bg }) => (
                    <div key={label} style={{
                        background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.875rem',
                        padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                    }}>
                        <div style={{ width: 44, height: 44, borderRadius: '0.625rem', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon size={22} style={{ color }} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>{label}</p>
                            <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent projects */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#1e293b' }}>Recent Projects</h3>
                    <button
                        onClick={() => navigate('/manager/projects')}
                        style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}
                    >
                        View all →
                    </button>
                </div>
                {projects.length === 0 ? (
                    <div style={{ padding: '2.5rem', background: 'white', border: '1px dashed #e2e8f0', borderRadius: '0.875rem', textAlign: 'center', color: '#94a3b8' }}>
                        <Briefcase size={28} style={{ marginBottom: '0.75rem', color: '#cbd5e1', display: 'block', margin: '0 auto 0.75rem' }} />
                        <p style={{ margin: 0 }}>
                            No projects yet.{' '}
                            <button onClick={() => navigate('/manager/projects')} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 500 }}>
                                Create one →
                            </button>
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                        {projects.slice(0, 5).map(project => (
                            <div
                                key={project._id}
                                onClick={() => navigate('/manager/projects')}
                                style={{
                                    background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.75rem',
                                    padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between',
                                    alignItems: 'center', cursor: 'pointer', transition: 'box-shadow 0.15s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                            >
                                <div style={{ minWidth: 0 }}>
                                    <p style={{ margin: 0, fontWeight: 600, color: '#1e293b', fontSize: '0.925rem' }}>{project.name}</p>
                                    {project.description && (
                                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {project.description}
                                        </p>
                                    )}
                                </div>
                                <span style={{
                                    padding: '0.2rem 0.65rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 600,
                                    background: statusColors[project.status]?.bg || '#f1f5f9',
                                    color: statusColors[project.status]?.color || '#475569',
                                    flexShrink: 0, marginLeft: '1rem'
                                }}>
                                    {project.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagerDashboard;
