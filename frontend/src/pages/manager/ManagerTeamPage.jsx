import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { Users, Loader2, UserCircle2, Mail, Shield, ChevronDown, ChevronUp } from 'lucide-react';

const roleColors = {
    PROJECT_MANAGER: { bg: '#eff6ff', color: '#1d4ed8', label: 'Project Manager' },
    EMPLOYEE: { bg: '#f0fdf4', color: '#166534', label: 'Employee' },
    COMPANY_OWNER: { bg: '#faf5ff', color: '#7e22ce', label: 'Owner' },
};

const getRoleStyle = (role) => roleColors[role] || { bg: '#f1f5f9', color: '#475569', label: role };

// ── Team Card ────────────────────────────────────────────────────
const TeamCard = ({ team }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div style={{
            background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem',
            overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            transition: 'box-shadow 0.2s'
        }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.07)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'}
        >
            {/* Card Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: expanded ? '1px solid #f1f5f9' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                        {/* Team Avatar */}
                        <div style={{
                            width: 44, height: 44, borderRadius: '0.625rem', background: '#eff6ff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#2563eb'
                        }}>
                            <Users size={22} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>{team.name}</h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                                {team.members?.length || 0} member{team.members?.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setExpanded(v => !v)}
                        style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.4rem 0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#475569', fontWeight: 500 }}
                    >
                        {expanded ? <><ChevronUp size={14} /> Hide</> : <><ChevronDown size={14} /> Members</>}
                    </button>
                </div>

                {/* Member Avatars Preview */}
                {!expanded && team.members?.length > 0 && (
                    <div style={{ display: 'flex', marginTop: '0.875rem', gap: '-8px' }}>
                        {team.members.slice(0, 6).map((m, i) => (
                            <div key={m._id || i} title={m.name} style={{
                                width: 30, height: 30, borderRadius: '50%', background: `hsl(${(i * 47) % 360}, 60%, 85%)`,
                                border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.7rem', fontWeight: 700, color: `hsl(${(i * 47) % 360}, 40%, 35%)`,
                                marginLeft: i === 0 ? 0 : -8, zIndex: team.members.length - i
                            }}>
                                {m.name ? m.name.charAt(0).toUpperCase() : '?'}
                            </div>
                        ))}
                        {team.members.length > 6 && (
                            <div style={{
                                width: 30, height: 30, borderRadius: '50%', background: '#e2e8f0',
                                border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.7rem', fontWeight: 700, color: '#64748b', marginLeft: -8
                            }}>
                                +{team.members.length - 6}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Members List */}
            {expanded && (
                <div style={{ padding: '0.5rem 0' }}>
                    {team.members?.length === 0 ? (
                        <p style={{ padding: '1rem 1.5rem', color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>No members in this team.</p>
                    ) : (
                        team.members.map((member, i) => {
                            const rs = getRoleStyle(member.role);
                            return (
                                <div key={member._id || i} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.875rem',
                                    padding: '0.75rem 1.5rem',
                                    borderBottom: i < team.members.length - 1 ? '1px solid #f8fafc' : 'none',
                                    transition: 'background 0.1s'
                                }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{
                                        width: 36, height: 36, borderRadius: '50%',
                                        background: `hsl(${(i * 47) % 360}, 60%, 90%)`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.85rem', fontWeight: 700,
                                        color: `hsl(${(i * 47) % 360}, 40%, 30%)`,
                                        flexShrink: 0
                                    }}>
                                        {member.name ? member.name.charAt(0).toUpperCase() : <UserCircle2 size={18} />}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {member.name}
                                        </p>
                                        {member.email && (
                                            <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <Mail size={11} /> {member.email}
                                            </p>
                                        )}
                                    </div>
                                    <span style={{ padding: '0.2rem 0.65rem', background: rs.bg, color: rs.color, borderRadius: '2rem', fontSize: '0.72rem', fontWeight: 600, flexShrink: 0 }}>
                                        {rs.label}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

// ── Main Team Page ───────────────────────────────────────────────
const ManagerTeamPage = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTeams = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/company/teams');
            setTeams(res.data || []);
        } catch (err) {
            console.error(err);
            setTeams([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchTeams(); }, [fetchTeams]);

    const totalMembers = teams.reduce((sum, t) => sum + (t.members?.length || 0), 0);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem', color: '#64748b' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#2563eb' }} />
            <p style={{ margin: 0 }}>Loading teams...</p>
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.25rem 0' }}>Team</h1>
                <p style={{ color: '#64748b', margin: 0 }}>
                    {teams.length} team{teams.length !== 1 ? 's' : ''} · {totalMembers} total member{totalMembers !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Stats row */}
            {teams.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    {[
                        { label: 'Teams', value: teams.length, bg: '#eff6ff', color: '#2563eb' },
                        { label: 'Total Members', value: totalMembers, bg: '#dcfce7', color: '#16a34a' },
                        { label: 'Avg Size', value: teams.length ? Math.round(totalMembers / teams.length) : 0, bg: '#faf5ff', color: '#7e22ce' },
                    ].map(({ label, value, bg, color }) => (
                        <div key={label} style={{ background: bg, borderRadius: '0.875rem', padding: '1.25rem 1.5rem' }}>
                            <p style={{ margin: 0, fontSize: '0.8rem', color, fontWeight: 600, opacity: 0.8 }}>{label}</p>
                            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color, lineHeight: 1.2 }}>{value}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Teams Grid */}
            {teams.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5rem 2rem', background: 'white', borderRadius: '1rem', border: '2px dashed #e2e8f0', textAlign: 'center' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: '#2563eb' }}>
                        <Users size={28} />
                    </div>
                    <h3 style={{ margin: '0 0 0.5rem', color: '#1e293b' }}>No teams found</h3>
                    <p style={{ color: '#64748b', margin: 0, maxWidth: 360 }}>
                        Teams are created and managed by your company owner in the Company panel. Once teams are assigned to your projects, they'll appear here.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
                    {teams.map(team => (
                        <TeamCard key={team._id} team={team} />
                    ))}
                </div>
            )}

            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );
};

export default ManagerTeamPage;
