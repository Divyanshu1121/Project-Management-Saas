import React from 'react';
import { Trash2, Shield, Briefcase, Code, TrendingUp } from 'lucide-react';
import './OwnerDashboard.css';

const CompanyTeamTable = ({ users, onDelete, currentUserRole }) => {

    const getRoleBadgeStyle = (role) => {
        switch (role) {
            case 'CTO': return { bg: '#e0e7ff', color: '#3730a3', icon: Code };
            case 'CFO': return { bg: '#dcfce7', color: '#166534', icon: TrendingUp };
            case 'COO': return { bg: '#fef3c7', color: '#92400e', icon: Briefcase };
            case 'PROJECT_MANAGER': return { bg: '#fce7f3', color: '#9d174d', icon: Shield };
            default: return { bg: '#f1f5f9', color: '#475569', icon: Briefcase };
        }
    };

    return (
        <div className="card" style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>Company Team</h3>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '0.75rem', color: '#64748b' }}>Name</th>
                            <th style={{ padding: '0.75rem', color: '#64748b' }}>Email</th>
                            <th style={{ padding: '0.75rem', color: '#64748b' }}>Role</th>
                            <th style={{ padding: '0.75rem', color: '#64748b' }}>Created Date</th>
                            {(currentUserRole === 'CEO' || currentUserRole === 'COMPANY_OWNER') && (
                                <th style={{ padding: '0.75rem', color: '#64748b' }}>Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={(currentUserRole === 'CEO' || currentUserRole === 'COMPANY_OWNER') ? "5" : "4"} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                                    No team members found.
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => {
                                const badge = getRoleBadgeStyle(user.role);
                                const Icon = badge.icon;
                                return (
                                    <tr key={user._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '0.75rem', fontWeight: 500 }}>{user.name}</td>
                                        <td style={{ padding: '0.75rem', color: '#64748b' }}>{user.email}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <span style={{
                                                backgroundColor: badge.bg,
                                                color: badge.color,
                                                padding: '0.25rem 0.6rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.25rem'
                                            }}>
                                                <Icon size={12} />
                                                {user.role.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem', color: '#64748b' }}>
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        {(currentUserRole === 'CEO' || currentUserRole === 'COMPANY_OWNER') && (
                                            <td style={{ padding: '0.75rem' }}>
                                                {user.role !== 'COMPANY_OWNER' && user.role !== 'CEO' && (
                                                    <button
                                                        onClick={() => onDelete(user._id)}
                                                        style={{
                                                            border: 'none',
                                                            background: 'transparent',
                                                            color: '#ef4444',
                                                            cursor: 'pointer',
                                                            padding: '0.25rem',
                                                            borderRadius: '0.25rem',
                                                            transition: 'background-color 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                        title="Remove User"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CompanyTeamTable;
