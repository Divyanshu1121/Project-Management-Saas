import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Trash2, Users, UserPlus, X } from 'lucide-react';

const CompanyTeams = () => {
    const [teams, setTeams] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [showCreateEmployeeModal, setShowCreateEmployeeModal] = useState(false);
    const [selectedTeamId, setSelectedTeamId] = useState(null);
    const [newTeamName, setNewTeamName] = useState('');
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [newEmployeeData, setNewEmployeeData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTeams();
        fetchEmployees();
    }, []);

    const fetchTeams = async () => {
        try {
            const res = await api.get('/company/teams');
            setTeams(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Failed to load teams');
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/company/users');
            setEmployees(res.data);
        } catch (err) {
            console.error("Error fetching employees:", err);
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

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!selectedTeamId || !selectedEmployeeId) return;

        try {
            await api.post(`/company/teams/${selectedTeamId}/members`, { userId: selectedEmployeeId });
            setShowAddMemberModal(false);
            setSelectedEmployeeId('');
            fetchTeams();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to add member');
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
                teamId: selectedTeamId
            });
            setShowCreateEmployeeModal(false);
            setNewEmployeeData({ name: '', email: '', password: '' });
            fetchTeams();
            fetchEmployees();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to create employee');
        }
    };

    const openAddMemberModal = (teamId) => {
        setSelectedTeamId(teamId);
        setShowAddMemberModal(true);
    };

    const openCreateEmployeeModal = (teamId) => {
        setSelectedTeamId(teamId);
        setShowCreateEmployeeModal(true);
    };

    if (loading) return <div>Loading teams...</div>;

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>Teams</h2>
                    <p style={{ color: '#64748b' }}>Manage employee teams and assignments.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        backgroundColor: '#2563eb', color: 'white', border: 'none',
                        padding: '0.75rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer',
                        fontWeight: 600
                    }}
                >
                    <Plus size={20} /> Create Team
                </button>
            </div>

            {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {teams.map(team => (
                    <div key={team._id} style={{
                        backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                        border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#0f172a' }}>{team.name}</h3>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>{team.members?.length || 0} members</p>
                            </div>
                            <button
                                onClick={() => handleDeleteTeam(team._id)}
                                style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                title="Delete Team"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <div style={{ marginTop: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Members</span>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => openAddMemberModal(team._id)}
                                        style={{ fontSize: '0.75rem', color: '#64748b', background: 'none', border: '1px solid #e2e8f0', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                    >
                                        <Plus size={14} /> Existing
                                    </button>
                                    <button
                                        onClick={() => openCreateEmployeeModal(team._id)}
                                        style={{ fontSize: '0.75rem', color: '#2563eb', background: '#eff6ff', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                    >
                                        <UserPlus size={14} /> New
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto' }}>
                                {team.members && team.members.map(member => (
                                    <div key={member._id} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: '0.375rem'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#334155', fontWeight: 600 }}>
                                                {member.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1 }}>{member.name}</span>
                                                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{member.empId || 'No ID'}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveMember(team._id, member._id)}
                                            style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                {(!team.members || team.members.length === 0) && (
                                    <p style={{ fontSize: '0.875rem', color: '#94a3b8', fontStyle: 'italic' }}>No members yet</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showCreateModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 100
                }}>
                    <div style={{
                        backgroundColor: 'white', padding: '2rem', borderRadius: '1rem',
                        width: '100%', maxWidth: '400px'
                    }}>
                        <h3 style={{ marginTop: 0 }}>Create New Team</h3>
                        <form onSubmit={handleCreateTeam}>
                            <input
                                type="text"
                                value={newTeamName}
                                onChange={(e) => setNewTeamName(e.target.value)}
                                placeholder="Team Name"
                                required
                                style={{
                                    width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
                                    border: '1px solid #cbd5e1', marginBottom: '1rem'
                                }}
                            />
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button type="submit" style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none' }}>Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showAddMemberModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 100
                }}>
                    <div style={{
                        backgroundColor: 'white', padding: '2rem', borderRadius: '1rem',
                        width: '100%', maxWidth: '400px'
                    }}>
                        <h3 style={{ marginTop: 0 }}>Add Existing Member</h3>
                        <form onSubmit={handleAddMember}>
                            <select
                                value={selectedEmployeeId}
                                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                required
                                style={{
                                    width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
                                    border: '1px solid #cbd5e1', marginBottom: '1rem'
                                }}
                            >
                                <option value="">Select Employee</option>
                                {employees.map(emp => (
                                    <option key={emp._id} value={emp._id}>{emp.name} ({emp.role})</option>
                                ))}
                            </select>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowAddMemberModal(false)}>Cancel</button>
                                <button type="submit" style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none' }}>Add</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showCreateEmployeeModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 100
                }}>
                    <div style={{
                        backgroundColor: 'white', padding: '2rem', borderRadius: '1rem',
                        width: '100%', maxWidth: '400px'
                    }}>
                        <h3 style={{ marginTop: 0 }}>Create New Employee</h3>
                        <form onSubmit={handleCreateEmployee}>
                            <input
                                type="text"
                                value={newEmployeeData.name}
                                onChange={(e) => setNewEmployeeData({ ...newEmployeeData, name: e.target.value })}
                                placeholder="Full Name"
                                required
                                style={{
                                    width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
                                    border: '1px solid #cbd5e1', marginBottom: '1rem'
                                }}
                            />
                            <input
                                type="email"
                                value={newEmployeeData.email}
                                onChange={(e) => setNewEmployeeData({ ...newEmployeeData, email: e.target.value })}
                                placeholder="Email Address"
                                required
                                style={{
                                    width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
                                    border: '1px solid #cbd5e1', marginBottom: '1rem'
                                }}
                            />
                            <input
                                type="password"
                                value={newEmployeeData.password}
                                onChange={(e) => setNewEmployeeData({ ...newEmployeeData, password: e.target.value })}
                                placeholder="Password"
                                required
                                style={{
                                    width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
                                    border: '1px solid #cbd5e1', marginBottom: '1rem'
                                }}
                            />
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateEmployeeModal(false)}
                                    style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', backgroundColor: 'white', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button type="submit" style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>Create Employee</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyTeams;
