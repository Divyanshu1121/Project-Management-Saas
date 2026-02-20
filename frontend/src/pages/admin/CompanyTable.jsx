import React from 'react';
import { Shield, Users, Briefcase, LayoutGrid, Calendar, MoreVertical, Edit, Trash2, StopCircle, PlayCircle, ExternalLink } from 'lucide-react';

const CompanyTable = ({ companies, onEdit, onDelete, onToggleStatus }) => {
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <th style={thStyle}>Sr.</th>
                        <th style={thStyle}>Company Details</th>
                        <th style={thStyle}>Owner</th>
                        <th style={thStyle}>Metrics</th>
                        <th style={thStyle}>Plan & Status</th>
                        <th style={thStyle}>Created</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {companies.map((company, index) => (
                        <tr key={company._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} className="hover-row">
                            <td style={tdStyle}>
                                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{index + 1}</span>
                            </td>
                            <td style={tdStyle}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontWeight: 600, color: '#1e293b' }}>{company.name}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>ID: {company._id}</span>
                                </div>
                            </td>
                            <td style={tdStyle}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontSize: '0.9rem', color: '#444' }}>{company.owner?.name || 'N/A'}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{company.owner?.email || 'N/A'}</span>
                                </div>
                            </td>
                            <td style={tdStyle}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', minWidth: '160px' }}>
                                    <MetricBadge icon={<Users size={12} />} label="Users" value={company.totalUsers} color="#2563eb" />
                                    <MetricBadge icon={<Shield size={12} />} label="PMs" value={company.totalProjectManagers} color="#7c3aed" />
                                    <MetricBadge icon={<Briefcase size={12} />} label="Emps" value={company.totalEmployees} color="#059669" />
                                    <MetricBadge icon={<LayoutGrid size={12} />} label="Projs" value={company.totalProjects} color="#ea580c" />
                                </div>
                            </td>
                            <td style={tdStyle}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <span style={{ alignSelf: 'flex-start', padding: '0.2rem 0.6rem', background: '#f1f5f9', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                                        {company.plan}
                                    </span>
                                    <div
                                        onClick={() => onToggleStatus(company)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            color: company.isActive ? '#166534' : '#9a3412',
                                            background: company.isActive ? '#dcfce7' : '#ffedd5',
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '20px',
                                            width: 'fit-content'
                                        }}
                                    >
                                        {company.isActive ? <PlayCircle size={12} /> : <StopCircle size={12} />}
                                        {company.isActive ? 'Active' : 'Paused'}
                                    </div>
                                </div>
                            </td>
                            <td style={tdStyle}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.85rem' }}>
                                    <Calendar size={13} />
                                    {formatDate(company.createdAt)}
                                </div>
                            </td>
                            <td style={{ ...tdStyle, textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                    <button onClick={() => onEdit(company)} style={actionBtnStyle} title="Edit Company">
                                        <Edit size={14} />
                                    </button>
                                    <button onClick={() => onDelete(company._id)} style={{ ...actionBtnStyle, color: '#dc2626' }} title="Delete Company">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const MetricBadge = ({ icon, label, value, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
        <div style={{ color }}>{icon}</div>
        <span style={{ fontSize: '0.75rem' }}>
            <strong style={{ color: '#1e293b' }}>{value}</strong> {label}
        </span>
    </div>
);

const thStyle = {
    padding: '1rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
};

const tdStyle = {
    padding: '1.25rem 1rem',
    verticalAlign: 'middle'
};

const actionBtnStyle = {
    padding: '6px',
    background: 'none',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    color: '#64748b',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
};

export default CompanyTable;
