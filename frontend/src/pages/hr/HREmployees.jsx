import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, UserPlus, X, Search, Users, Hash, Pencil, Power, PowerOff } from 'lucide-react';
import EmployeeEditModal from '../owner/EmployeeEditModal';

const ROLE_COLORS = {
    EMPLOYEE: { bg: '#f1f5f9', color: '#475569' },
    PROJECT_MANAGER: { bg: '#eff6ff', color: '#2563eb' },
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

const HREmployees = () => {
    const [employees, setEmployees] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterTeam, setFilterTeam] = useState('all');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newEmployeeData, setNewEmployeeData] = useState({ name: '', email: '', password: '', teamId: '' });
    const [editTarget, setEditTarget] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [empRes, teamRes] = await Promise.all([
                api.get('/company/employees'),
                api.get('/company/teams')
            ]);
            setEmployees(empRes.data || []);
            setTeams(teamRes.data || []);
        } catch (err) {
            console.error(err);
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEmployee = async (e) => {
        e.preventDefault();
        try {
            await api.post('/company/employees', newEmployeeData);
            setShowCreateModal(false);
            setNewEmployeeData({ name: '', email: '', password: '', teamId: '' });
            fetchInitialData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create employee');
        }
    };

    const handleToggleStatus = async (employee) => {
        const newStatus = !employee.isActive;
        const action = newStatus ? 'activate' : 'deactivate';
        if (window.confirm(`Are you sure you want to ${action} this employee?`)) {
            try {
                const res = await api.put(`/company/employees/${employee._id}`, { isActive: newStatus });
                if (res.data.warning && !newStatus) {
                    alert(`Warning: ${res.data.warning}`);
                }
                fetchInitialData();
            } catch (err) {
                alert(`Failed to ${action} employee`);
            }
        }
    };

    const handleEditSave = async (employeeId, data) => {
        await api.put(`/company/employees/${employeeId}`, data);
        fetchInitialData();
    };

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch =
            emp.name?.toLowerCase().includes(search.toLowerCase()) ||
            emp.email?.toLowerCase().includes(search.toLowerCase()) ||
            emp.empId?.toLowerCase().includes(search.toLowerCase());

        const matchesTeam = filterTeam === 'all' || emp.teamId?._id === filterTeam;
        const matchesRole = filterRole === 'all' || emp.role === filterRole;
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' ? emp.isActive !== false : emp.isActive === false);

        return matchesSearch && matchesTeam && matchesRole && matchesStatus;
    });

    const btnPrimary = {
        backgroundColor: '#10b981', color: 'white', padding: '0.6rem 1.25rem',
        borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600,
        display: 'flex', alignItems: 'center', gap: '0.5rem'
    };

    const inputStyle = {
        width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
        border: '1px solid #cbd5e1', marginBottom: '1rem',
        fontSize: '0.9rem', boxSizing: 'border-box',
    };

    if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading employees...</div>;

    return (
        <div style={{ padding: 'min(5vw, 2rem)' }}>
            <div className="stack-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Employees</h2>
                    <p style={{ color: '#64748b', margin: '0.25rem 0 0' }}>Manage company employees and assignments.</p>
                </div>
                <button onClick={() => setShowCreateModal(true)} style={{ ...btnPrimary, width: '100%', maxWidth: 'fit-content' }}>
                    <UserPlus size={18} />
                    Add Employee
                </button>
            </div>

            <div className="stack-mobile" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: '1', minWidth: 'min(100%, 300px)' }}>
                    <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Search by name, email or ID..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ ...inputStyle, paddingLeft: '2.5rem', marginBottom: 0 }}
                    />
                </div>

                <div className="stack-mobile" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <select
                        value={filterTeam}
                        onChange={e => setFilterTeam(e.target.value)}
                        style={{ ...inputStyle, width: 'auto', marginBottom: 0 }}
                    >
                        <option value="all">All Teams</option>
                        {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>

                    <select
                        value={filterRole}
                        onChange={e => setFilterRole(e.target.value)}
                        style={{ ...inputStyle, width: 'auto', marginBottom: 0 }}
                    >
                        <option value="all">All Roles</option>
                        <option value="EMPLOYEE">Employees</option>
                        <option value="PROJECT_MANAGER">Managers</option>
                    </select>

                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        style={{ ...inputStyle, width: 'auto', marginBottom: 0 }}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflowX: 'auto' }}>
                <table style={{ minWidth: '850px', width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>


                    <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '1rem', color: '#64748b', fontWeight: 600 }}>Employee</th>
                            <th style={{ padding: '1rem', color: '#64748b', fontWeight: 600 }}>Role & Team</th>
                            <th style={{ padding: '1rem', color: '#64748b', fontWeight: 600 }}>Active Tasks</th>
                            <th style={{ padding: '1rem', color: '#64748b', fontWeight: 600 }}>Last Activity</th>
                            <th style={{ padding: '1rem', color: '#64748b', fontWeight: 600 }}>Status</th>
                            <th style={{ padding: '1rem', color: '#64748b', fontWeight: 600, textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No employees found.</td>
                            </tr>
                        ) : (
                            filteredEmployees.map(emp => (
                                <tr key={emp._id} style={{ borderBottom: '1px solid #f1f5f9', opacity: emp.isActive === false ? 0.6 : 1 }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{emp.name}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>{emp.empId || '—'}</span>
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>·</span>
                                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{emp.email}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                            <RoleBadge role={emp.role} />
                                            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>{emp.teamId?.name || 'Unassigned'}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem', borderRadius: '0.4rem',
                                            background: emp.activeTasksCount > 0 ? '#eff6ff' : '#f8fafc',
                                            color: emp.activeTasksCount > 0 ? '#2563eb' : '#94a3b8',
                                            fontWeight: 700, fontSize: '0.85rem'
                                        }}>
                                            {emp.activeTasksCount || 0}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>
                                        {emp.lastActivity ? new Date(emp.lastActivity).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            backgroundColor: emp.isActive !== false ? '#dcfce7' : '#fee2e2',
                                            color: emp.isActive !== false ? '#166534' : '#991b1b',
                                            padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700
                                        }}>
                                            {emp.isActive !== false ? 'ACTIVE' : 'DEACTIVATED'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => setEditTarget(emp)}
                                                style={{ border: 'none', background: 'none', color: '#2563eb', cursor: 'pointer', padding: '0.4rem', borderRadius: '0.4rem' }}
                                                title="Edit Employee"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(emp)}
                                                style={{
                                                    border: 'none', background: 'none',
                                                    color: emp.isActive !== false ? '#ef4444' : '#10b981',
                                                    cursor: 'pointer', padding: '0.4rem', borderRadius: '0.4rem'
                                                }}
                                                title={emp.isActive !== false ? 'Deactivate Employee' : 'Activate Employee'}
                                            >
                                                {emp.isActive !== false ? <PowerOff size={16} /> : <Power size={16} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showCreateModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '450px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Add New Employee</h3>
                            <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleCreateEmployee}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem', display: 'block' }}>Full Name</label>
                            <input type="text" required style={inputStyle} value={newEmployeeData.name} onChange={e => setNewEmployeeData({ ...newEmployeeData, name: e.target.value })} placeholder="Enter name" />

                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem', display: 'block' }}>Email Address</label>
                            <input type="email" required style={inputStyle} value={newEmployeeData.email} onChange={e => setNewEmployeeData({ ...newEmployeeData, email: e.target.value })} placeholder="Enter email" />

                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem', display: 'block' }}>Password</label>
                            <input type="password" required style={inputStyle} value={newEmployeeData.password} onChange={e => setNewEmployeeData({ ...newEmployeeData, password: e.target.value })} placeholder="Set password" minLength={6} />

                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem', display: 'block' }}>Assigned Team</label>
                            <select required style={inputStyle} value={newEmployeeData.teamId} onChange={e => setNewEmployeeData({ ...newEmployeeData, teamId: e.target.value })}>
                                <option value="">Select a team</option>
                                {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                            </select>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setShowCreateModal(false)} style={{ padding: '0.6rem 1.25rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', backgroundColor: 'white', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={btnPrimary}>Create Employee</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {editTarget && (
                <EmployeeEditModal
                    employee={editTarget}
                    teams={teams}
                    currentTeamId={editTarget.teamId?._id || editTarget.teamId}
                    onClose={() => setEditTarget(null)}
                    onSave={handleEditSave}
                />
            )}
        </div>
    );
};

export default HREmployees;
