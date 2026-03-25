import React from 'react';
import { Shield, Users, Briefcase, LayoutGrid, Calendar, MoreVertical, Edit, Trash2, StopCircle, PlayCircle, CheckCircle2, XCircle, Globe, Info } from 'lucide-react';

const CompanyTable = ({ companies, onEdit, onDelete, onToggleStatus }) => {
    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const isTrialExpired = (trialEndsAt) => {
        if (!trialEndsAt) return false;
        return new Date(trialEndsAt) < new Date();
    };

    return (
        <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <th style={thStyle}>Sr.</th>
                        <th style={thStyle}>Company Info</th>
                        <th style={thStyle}>Industry & Size</th>
                        <th style={thStyle}>Owner</th>
                        <th style={thStyle}>Stats</th>
                        <th style={thStyle}>Plan & Trial</th>
                        <th style={thStyle}>Verification</th>
                        <th style={thStyle}>Status</th>
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
                                    <span style={{ fontWeight: 600, color: '#1e293b' }}>{company.companyName || company.name}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>ID: {company.companyId || 'N/A'}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#94a3b8' }}>
                                        <Globe size={10} /> {company.country}, {company.city}
                                    </div>
                                </div>
                            </td>
                            <td style={tdStyle}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontSize: '0.85rem', color: '#475569' }}>{company.industry || 'N/A'}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Size: {company.companySize || 'N/A'}</span>
                                </div>
                            </td>
                            <td style={tdStyle}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: 500 }}>{company.owner?.name || 'N/A'}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{company.owner?.email || 'N/A'}</span>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                                        {company.owner?.roleTitle?.length > 0 ? (
                                            company.owner.roleTitle.map(r => (
                                                <span key={r} style={{ padding: '2px 6px', background: '#f1f5f9', color: '#475569', fontSize: '0.65rem', borderRadius: '4px', border: '1px solid #e2e8f0', fontWeight: 500 }}>
                                                    {r}
                                                </span>
                                            ))
                                        ) : company.owner?.empId ? (
                                            <span style={{ padding: '2px 6px', background: '#f1f5f9', color: '#475569', fontSize: '0.65rem', borderRadius: '4px', border: '1px solid #e2e8f0', fontWeight: 500 }}>
                                                {company.owner.empId}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            </td>
                            <td style={tdStyle}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#475569' }}>
                                        <Users size={12} /> {company.totalUsers ?? 0} Users
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#475569' }}>
                                        <Briefcase size={12} /> {company.totalProjects ?? 0} Projects
                                    </span>
                                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                        {company.totalEmployees ?? 0} emp · {company.totalProjectManagers ?? 0} PM
                                    </span>
                                </div>
                            </td>
                            <td style={tdStyle}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ alignSelf: 'flex-start', padding: '0.1rem 0.5rem', background: '#eff6ff', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, color: '#2563eb', textTransform: 'uppercase' }}>
                                        {company.plan}
                                    </span>
                                    {company.isTrialActive && (
                                        <div style={{ fontSize: '0.7rem', color: isTrialExpired(company.trialEndsAt) ? '#dc2626' : '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Info size={10} /> {isTrialExpired(company.trialEndsAt) ? 'Trial Expired' : `Trial ends ${formatDate(company.trialEndsAt)}`}
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td style={tdStyle}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: company.isEmailVerified ? '#16a34a' : '#ea580c' }}>
                                        {company.isEmailVerified ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                        {company.isEmailVerified ? 'Verified' : 'Unverified'}
                                    </div>
                                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Type: {company.signupType || 'manual'}</span>
                                </div>
                            </td>
                            <td style={tdStyle}>
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
                            </td>
                            <td style={{ ...tdStyle, textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                    <button onClick={() => onEdit(company)} style={actionBtnStyle} title="Edit Company/Plan">
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
            {companies.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontSize: '0.95rem' }}>
                    No companies found.
                </div>
            )}
        </div>
    );
};

const thStyle = {
    padding: '1rem',
    fontSize: '0.7rem',
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
};

const tdStyle = {
    padding: '1rem',
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
