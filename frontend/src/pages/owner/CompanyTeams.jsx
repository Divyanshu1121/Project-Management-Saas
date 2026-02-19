import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Trash2, UserPlus, X, ChevronDown, ChevronUp, Search, Users, Hash, Pencil } from 'lucide-react';
import EmployeeEditModal from './EmployeeEditModal';

const ROLE_COLORS = {
    CEO: { bg: '#ede9fe', color: '#5b21b6' },
    CTO: { bg: '#e0e7ff', color: '#3730a3' },
    CFO: { bg: '#dcfce7', color: '#166534' },
    COO: { bg: '#fef3c7', color: '#92400e' },
    PROJECT_MANAGER: { bg: '#fce7f3', color: '#9d174d' },
    EMPLOYEE: { bg: '#f1f5f9', color: '#475569' },
};

const RoleBadge = ({ role }) => {
    const style = ROLE_COLORS[role] || ROLE_COLORS.EMPLOYEE;
    return (
        <span style={{
            backgroundColor: style.bg, color: style.color,
            padding: '0.2rem 0.6rem', borderRadius: '9999px',
            fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap',
            letterSpacing: '0.03em', textTransform: 'uppercase',
        }}>
            {role.replace(/_/g, ' ')}
        </span>
    );
};

const CompanyTeams = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedTeams, setExpandedTeams] = useState({});
    const [memberSearch, setMemberSearch] = useState({});
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showCreateEmployeeModal, setShowCreateEmployeeModal] = useState(false);
    const [selectedTeamId, setSelectedTeamId] = useState(null);
    const [newTeamName, setNewTeamName] = useState('');
    const [newEmployeeData, setNewEmployeeData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState(null);
    const [editTarget, setEditTarget] = useState(null);       // { member, teamId }
    const [editTeamTarget, setEditTeamTarget] = useState(null); // { _id, name }

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            const res = await api.get('/company/teams');
            setTeams(res.data);
            if (res.data.length > 0) {
                setExpandedTeams({ [res.data[0]._id]: true });
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Failed to load teams');
            setLoading(false);
        }
    };

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        try {
            await api.post('/company/teams', { name: newTeamName });
            setNewTeamName('');
            setShowCreateModal(false);
            fetchTeams();
        } catch (err) {
            console.error(err);
            setError('Failed to create team');
        }
    };

    const handleDeleteTeam = async (id) => {
        if (window.confirm('Are you sure you want to delete this team?')) {
            try {
                await api.delete(`/company/teams/${id}`);
                fetchTeams();
            } catch (err) {
                console.error(err);
                setError('Failed to delete team');
            }
        }
    };

    const handleRemoveMember = async (teamId, userId) => {
        if (window.confirm('Are you sure you want to permanently delete this employee? This action cannot be undone.')) {
            try {
                await api.delete(`/company/employees/${userId}`);
                fetchTeams();
                fetchEmployees();
            } catch (err) {
                console.error(err);
                alert('Failed to delete employee');
            }
        }
    };

    const handleCreateEmployee = async (e) => {
        e.preventDefault();
        try {
            await api.post('/company/employees', {
                name: newEmployeeData.name,
                email: newEmployeeData.email,
                password: newEmployeeData.password,
                teamId: selectedTeamId,
            });
            setShowCreateEmployeeModal(false);
            setNewEmployeeData({ name: '', email: '', password: '' });
            fetchTeams();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to create employee');
        }
    };

    const toggleTeam = (id) =>
        setExpandedTeams(prev => ({ ...prev, [id]: !prev[id] }));

    const handleEditSave = async (employeeId, data) => {
        const res = await api.put(`/company/teams/employee/${employeeId}`, data);
        if (!res.data) throw new Error('No response from server');
        await fetchTeams();
    };

    const handleEditTeamSave = async (e) => {
        e.preventDefault();
        if (!editTeamTarget?.name?.trim()) return;
        try {
            await api.put(`/company/teams/${editTeamTarget._id}`, { name: editTeamTarget.name.trim() });
            setEditTeamTarget(null);
            fetchTeams();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update team');
        }
    };

    const openCreateEmployeeModal = (teamId) => {
        setSelectedTeamId(teamId);
        setShowCreateEmployeeModal(true);
    };

    const filteredMembers = (team) => {
        const q = (memberSearch[team._id] || '').toLowerCase();
        if (!q) return team.members || [];
        return (team.members || []).filter(m =>
            m.name?.toLowerCase().includes(q) ||
            m.email?.toLowerCase().includes(q) ||
            m.empId?.toLowerCase().includes(q) ||
            m.role?.toLowerCase().includes(q)
        );
    };

    const overlayStyle = {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 100,
    };
    const modalStyle = {
        backgroundColor: 'white', padding: '2rem', borderRadius: '1rem',
        width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
    };
    const inputStyle = {
        width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
        border: '1px solid #cbd5e1', marginBottom: '1rem',
        fontSize: '0.9rem', boxSizing: 'border-box',
    };
    const btnPrimary = {
        backgroundColor: '#2563eb', color: 'white', padding: '0.6rem 1.25rem',
        borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600,
    };
    const btnSecondary = {
        padding: '0.6rem 1.25rem', borderRadius: '0.5rem',
        border: '1px solid #cbd5e1', backgroundColor: 'white', cursor: 'pointer',
    };

    if (loading) return (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            Loading teams…
        </div>
    );

    return (
        <div style={{ padding: '2rem' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Teams</h2>
                    <p style={{ color: '#64748b', margin: '0.25rem 0 0' }}>Manage employee teams and assignments.</p>
                </div>
                <button onClick={() => setShowCreateModal(true)} style={btnPrimary}>
                    <Plus size={16} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
                    Create Team
                </button>
            </div>

            {error && <div style={{ color: '#ef4444', marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fee2e2', borderRadius: '0.5rem' }}>{error}</div>}

            {teams.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8', border: '2px dashed #e2e8f0', borderRadius: '1rem' }}>
                    <Users size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <p style={{ fontSize: '1rem', margin: 0 }}>No teams yet. Create your first team!</p>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {teams.map(team => {
                    const isOpen = !!expandedTeams[team._id];
                    const members = filteredMembers(team);
                    const total = team.members?.length || 0;

                    return (
                        <div key={team._id} style={{
                            backgroundColor: 'white', borderRadius: '0.75rem',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                            overflow: 'hidden',
                        }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '1rem 1.25rem', cursor: 'pointer',
                                backgroundColor: isOpen ? '#f8fafc' : 'white',
                                borderBottom: isOpen ? '1px solid #e2e8f0' : 'none',
                                transition: 'background 0.15s',
                            }}
                                onClick={() => toggleTeam(team._id)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '0.5rem',
                                        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Users size={18} color="white" />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{team.name}</h3>
                                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                                            {total} {total === 1 ? 'member' : 'members'}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} onClick={e => e.stopPropagation()}>
                                    <button
                                        onClick={() => openCreateEmployeeModal(team._id)}
                                        title="Create New Employee"
                                        style={{ fontSize: '0.78rem', color: '#2563eb', background: '#eff6ff', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                    >
                                        <UserPlus size={13} /> New
                                    </button>
                                    <button
                                        onClick={() => setEditTeamTarget({ _id: team._id, name: team.name })}
                                        title="Edit Team Name"
                                        style={{ fontSize: '0.78rem', color: '#0369a1', background: '#e0f2fe', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                    >
                                        <Pencil size={13} /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTeam(team._id)}
                                        title="Delete Team"
                                        style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.35rem' }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => toggleTeam(team._id)}
                                        style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                                    >
                                        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </button>
                                </div>
                            </div>

                            {isOpen && (
                                <div style={{ padding: '1rem 1.25rem' }}>

                                    {total > 5 && (
                                        <div style={{ position: 'relative', marginBottom: '0.75rem', maxWidth: '320px' }}>
                                            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                            <input
                                                type="text"
                                                placeholder="Search by name, email, ID or role…"
                                                value={memberSearch[team._id] || ''}
                                                onChange={e => setMemberSearch(prev => ({ ...prev, [team._id]: e.target.value }))}
                                                style={{ ...inputStyle, paddingLeft: '2.25rem', marginBottom: 0, fontSize: '0.8rem' }}
                                            />
                                        </div>
                                    )}

                                    {members.length === 0 ? (
                                        <p style={{ color: '#94a3b8', fontStyle: 'italic', padding: '1rem 0', margin: 0 }}>
                                            {total === 0 ? 'No members yet. Add your first member above.' : 'No members match your search.'}
                                        </p>
                                    ) : (
                                        <div style={{ overflowX: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                                <thead>
                                                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                                        <th style={{ padding: '0.6rem 0.75rem', color: '#64748b', fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                                <Hash size={13} /> Emp ID
                                                            </div>
                                                        </th>
                                                        <th style={{ padding: '0.6rem 0.75rem', color: '#64748b', fontWeight: 600, textAlign: 'left' }}>Name</th>
                                                        <th style={{ padding: '0.6rem 0.75rem', color: '#64748b', fontWeight: 600, textAlign: 'left' }}>Email</th>
                                                        <th style={{ padding: '0.6rem 0.75rem', color: '#64748b', fontWeight: 600, textAlign: 'left' }}>Role</th>
                                                        <th style={{ padding: '0.6rem 0.75rem', color: '#64748b', fontWeight: 600, textAlign: 'center' }}>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {members.map((member, idx) => (
                                                        <tr key={member._id} style={{
                                                            borderBottom: idx < members.length - 1 ? '1px solid #f1f5f9' : 'none',
                                                            backgroundColor: idx % 2 === 0 ? 'white' : '#fafafa',
                                                            transition: 'background 0.1s',
                                                        }}
                                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? 'white' : '#fafafa'}
                                                        >
                                                            <td style={{ padding: '0.65rem 0.75rem', whiteSpace: 'nowrap' }}>
                                                                <span style={{
                                                                    backgroundColor: '#f1f5f9', color: '#334155',
                                                                    padding: '0.2rem 0.55rem', borderRadius: '0.375rem',
                                                                    fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 700,
                                                                }}>
                                                                    {member.empId || '—'}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '0.65rem 0.75rem' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                                    <div style={{
                                                                        width: '28px', height: '28px', borderRadius: '50%',
                                                                        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                        fontSize: '0.72rem', color: 'white', fontWeight: 700, flexShrink: 0,
                                                                    }}>
                                                                        {member.name?.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <span style={{ fontWeight: 500, color: '#0f172a' }}>{member.name}</span>
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '0.65rem 0.75rem', color: '#64748b' }}>{member.email}</td>
                                                            <td style={{ padding: '0.65rem 0.75rem' }}>
                                                                <RoleBadge role={member.role} />
                                                            </td>
                                                            <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem' }}>
                                                                    {/* Edit button */}
                                                                    <button
                                                                        onClick={() => setEditTarget({ member, teamId: team._id })}
                                                                        title="Edit employee"
                                                                        style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', padding: '0.3rem', borderRadius: '0.25rem' }}
                                                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#eff6ff'}
                                                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                                                    >
                                                                        <Pencil size={14} />
                                                                    </button>
                                                                    {/* Delete button */}
                                                                    <button
                                                                        onClick={() => handleRemoveMember(team._id, member._id)}
                                                                        title="Remove employee"
                                                                        style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.3rem', borderRadius: '0.25rem' }}
                                                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fee2e2'}
                                                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                                                    >
                                                                        <X size={15} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {(memberSearch[team._id] && total > 0) && (
                                        <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.5rem 0 0', textAlign: 'right' }}>
                                            Showing {members.length} of {total} members
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {showCreateModal && (
                <div style={overlayStyle}>
                    <div style={modalStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Create New Team</h3>
                            <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateTeam}>
                            <input
                                type="text"
                                value={newTeamName}
                                onChange={e => setNewTeamName(e.target.value)}
                                placeholder="Team name (e.g. Frontend, Design)"
                                required
                                style={inputStyle}
                            />
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowCreateModal(false)} style={btnSecondary}>Cancel</button>
                                <button type="submit" style={btnPrimary}>Create Team</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {showCreateEmployeeModal && (
                <div style={overlayStyle}>
                    <div style={modalStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Create New Employee</h3>
                            <button onClick={() => setShowCreateEmployeeModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateEmployee}>
                            <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>Full Name</label>
                            <input type="text" value={newEmployeeData.name} onChange={e => setNewEmployeeData({ ...newEmployeeData, name: e.target.value })} placeholder="John Doe" required style={{ ...inputStyle, marginTop: '0.4rem' }} />
                            <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>Email Address</label>
                            <input type="email" value={newEmployeeData.email} onChange={e => setNewEmployeeData({ ...newEmployeeData, email: e.target.value })} placeholder="john@company.com" required style={{ ...inputStyle, marginTop: '0.4rem' }} />
                            <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>Password</label>
                            <input type="password" value={newEmployeeData.password} onChange={e => setNewEmployeeData({ ...newEmployeeData, password: e.target.value })} placeholder="Set a secure password" required style={{ ...inputStyle, marginTop: '0.4rem' }} />
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '-0.5rem 0 1rem' }}>An Employee ID (EMP-XXX) will be auto-assigned.</p>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowCreateEmployeeModal(false)} style={btnSecondary}>Cancel</button>
                                <button type="submit" style={btnPrimary}>Create Employee</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Employee Edit Modal */}
            {editTarget && (
                <EmployeeEditModal
                    employee={editTarget.member}
                    teams={teams}
                    currentTeamId={editTarget.teamId}
                    onClose={() => setEditTarget(null)}
                    onSave={handleEditSave}
                />
            )}

            {/* Team Edit Modal */}
            {editTeamTarget && (
                <div style={overlayStyle}>
                    <div style={modalStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '0.4rem',
                                    background: 'linear-gradient(135deg,#0369a1,#2563eb)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Pencil size={15} color="white" />
                                </div>
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Edit Team</h3>
                            </div>
                            <button onClick={() => setEditTeamTarget(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleEditTeamSave}>
                            <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                                Team Name
                            </label>
                            <input
                                type="text"
                                value={editTeamTarget.name}
                                onChange={e => setEditTeamTarget(prev => ({ ...prev, name: e.target.value }))}
                                required
                                autoFocus
                                placeholder="Enter team name"
                                style={{ ...inputStyle }}
                            />
                            <p style={{ fontSize: '0.73rem', color: '#94a3b8', margin: '-0.5rem 0 1.25rem' }}>
                                Team members will remain unchanged.
                            </p>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setEditTeamTarget(null)} style={btnSecondary}>Cancel</button>
                                <button type="submit" style={btnPrimary}>Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyTeams;
