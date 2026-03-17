import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Users, ChevronDown, ChevronRight, Building2, Mail, Shield, BarChart3, Settings as SettingsIcon } from 'lucide-react';
import CompanyTable from './CompanyTable';

const AdminDashboard = () => {
    const location = useLocation();
    const currentTab = location.pathname.split('/').pop() || 'admin';

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            <Routes>
                <Route path="/" element={
                    <>
                        <DashboardStatsView />
                        <div style={{ marginTop: '2.5rem' }}>
                            <CompaniesView />
                        </div>
                    </>
                } />
                <Route path="users" element={<UsersView />} />
                <Route path="settings" element={<SettingsView />} />
                <Route path="*" element={<Navigate to="/admin" />} />
            </Routes>
        </div>
    );
};


import CircularChart from '../../components/common/CircularChart';

const DashboardStatsView = () => {
    const [stats, setStats] = useState(null);
    useEffect(() => {
        api.get('/analytics').then(res => setStats(res.data.platformStats)).catch(console.error);
    }, []);

    const chartData = [
        { name: 'Active', value: stats?.activeCompanies || 0, color: '#16a34a' },
        { name: 'Paused', value: stats?.pausedCompanies || 0, color: '#ea580c' },
    ].filter(d => d.value > 0);

    return (
        <div>
            <h2 style={{ marginBottom: '2rem' }}>Dashboard Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '2rem', alignItems: 'start' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div className="card">
                        <h3>Total Companies</h3>
                        <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2563eb' }}>{stats?.totalCompanies || 0}</p>
                    </div>
                    <div className="card">
                        <h3>Total Users</h3>
                        <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#4b5563' }}>{stats?.totalPlatformUsers || 0}</p>
                    </div>
                    <div className="card" style={{ borderLeft: '4px solid #16a34a' }}>
                        <h3 style={{ color: '#166534' }}>Active Companies</h3>
                        <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#16a34a' }}>{stats?.activeCompanies || 0}</p>
                    </div>
                    <div className="card" style={{ borderLeft: '4px solid #ea580c' }}>
                        <h3 style={{ color: '#9a3412' }}>Paused Companies</h3>
                        <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ea580c' }}>{stats?.pausedCompanies || 0}</p>
                    </div>
                </div>

                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BarChart3 size={18} color="#2563eb" /> Company Status
                    </h3>
                    <div style={{ height: 200 }}>
                        <CircularChart data={chartData} height={200} donut />
                    </div>
                </div>
            </div>
        </div>
    );
};


const CompaniesView = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCompanyId, setCurrentCompanyId] = useState(null);
    const [search, setSearch] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [deleteModal, setDeleteModal] = useState({ show: false, companyId: null, password: '' });

    const [formData, setFormData] = useState({
        companyName: '', ownerName: 'CEO', ownerEmail: '', ownerPassword: '', plan: 'Free'
    });

    const fetchData = async () => {
        try {
            const res = await api.get('/admin/companies');
            setCompanies(res.data);
            setLoading(false);
        } catch (err) { console.error(err); setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const resetForm = () => { setFormData({ companyName: '', ownerName: 'CEO', ownerEmail: '', ownerPassword: '', plan: 'Free' }); setIsEditing(false); setCurrentCompanyId(null); };
    const handleOpenCreate = () => { resetForm(); setShowModal(true); };
    const handleOpenEdit = (company) => {
        setFormData({ companyName: company.name, ownerName: '', ownerEmail: '', ownerPassword: '', plan: company.plan });
        setCurrentCompanyId(company._id); setIsEditing(true); setShowModal(true);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/companies/${currentCompanyId}`, { name: formData.companyName, plan: formData.plan });
            } else {
                await api.post('/companies', formData);
            }
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving company');
        }
    };

    const handleDelete = (id) => { setDeleteModal({ show: true, companyId: id, password: '' }); };

    const confirmDelete = async (e) => {
        e.preventDefault();
        try {
            await api.delete(`/companies/${deleteModal.companyId}`, { data: { password: deleteModal.password } });
            setDeleteModal({ show: false, companyId: null, password: '' });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error deleting company');
        }
    };

    const handleToggleStatus = async (company) => {
        try {
            await api.put(`/companies/${company._id}`, { isActive: !company.isActive });
            fetchData();
        } catch (err) {
            alert('Error updating status');
        }
    };

    const filteredCompanies = companies.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.owner?.email?.toLowerCase().includes(search.toLowerCase());
        if (statusFilter === "ACTIVE") return matchesSearch && c.isActive;
        if (statusFilter === "PAUSED") return matchesSearch && !c.isActive;
        return matchesSearch;
    }).sort((a, b) => sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));

    if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading companies...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>Registered Companies</h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Overview of all tenants and their platform usage</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', background: 'white' }}>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '0.5rem 0.75rem', border: 'none', fontSize: '0.85rem', color: '#475569', outline: 'none' }}>
                            <option value="ALL">All Status</option>
                            <option value="ACTIVE">Active Only</option>
                            <option value="PAUSED">Paused Only</option>
                        </select>
                        <div style={{ width: '1px', background: '#e2e8f0' }} />
                        <button onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")} style={{ padding: '0.5rem 0.75rem', border: 'none', background: 'white', cursor: 'pointer', fontSize: '0.85rem', color: '#475569' }}>
                            Sort {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                        </button>
                    </div>
                    <input type="text" placeholder="Search companies..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', width: '280px', fontSize: '0.85rem', outline: 'none' }} />
                    <button className="btn btn-primary" onClick={handleOpenCreate} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building2 size={16} /> New Company
                    </button>
                </div>
            </div>

            <CompanyTable
                companies={filteredCompanies}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
            />

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3>{isEditing ? 'Edit Company' : 'Create New Company'}</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group"><label className="form-label">Company Name</label><input className="form-input" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} required /></div>
                            <div className="form-group"><label className="form-label">Plan</label><select className="form-input" value={formData.plan} onChange={(e) => setFormData({ ...formData, plan: e.target.value })}><option value="Free">Free</option><option value="Basic">Basic</option><option value="Pro">Pro</option><option value="Advanced">Advanced</option></select></div>
                            {!isEditing && (<><div style={{ margin: '1rem 0', borderTop: '1px solid #eee', paddingTop: '1rem' }}><h4>Owner Details</h4></div><div className="form-group"><label className="form-label">Owner Role</label><select className="form-input" value={formData.ownerName} onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })} required><option value="CEO">CEO</option><option value="CTO">CTO</option><option value="CFO">CFO</option></select></div><div className="form-group"><label className="form-label">Owner Email</label><input type="email" className="form-input" value={formData.ownerEmail} onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })} required /></div><div className="form-group"><label className="form-label">Owner Password</label><input type="password" className="form-input" value={formData.ownerPassword} onChange={(e) => setFormData({ ...formData, ownerPassword: e.target.value })} required /></div></>)}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}><button type="button" className="btn" onClick={() => setShowModal(false)} style={{ border: '1px solid #ddd' }}>Cancel</button><button type="submit" className="btn btn-primary">{isEditing ? 'Save Changes' : 'Create Company'}</button></div>
                        </form>
                    </div>
                </div>
            )}
            {deleteModal.show && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                        <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>Confirm Deletion</h3>
                        <p style={{ marginBottom: '1.5rem', color: '#4b5563' }}>Are you sure you want to delete this company? This action cannot be undone. Please enter your Admin Password to confirm.</p>
                        <form onSubmit={confirmDelete}>
                            <div className="form-group"><label className="form-label">Admin Password</label><input type="password" className="form-input" value={deleteModal.password} onChange={(e) => setDeleteModal({ ...deleteModal, password: e.target.value })} required autoFocus /></div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}><button type="button" className="btn" onClick={() => setDeleteModal({ show: false, companyId: null, password: '' })} style={{ border: '1px solid #ddd' }}>Cancel</button><button type="submit" className="btn" style={{ backgroundColor: '#dc2626', color: 'white' }}>Delete Company</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const UsersView = () => {
    const [users, setUsers] = useState([]);
    const [expanded, setExpanded] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/admin/users').then(res => {
            setUsers(res.data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    const toggle = (companyId) => {
        setExpanded(prev => ({ ...prev, [companyId]: !prev[companyId] }));
    };

    const grouped = React.useMemo(() => {
        return users.reduce((acc, u) => {
            const cid = u.companyId?._id || 'unassigned';
            if (!acc[cid]) {
                acc[cid] = {
                    name: u.companyId?.name || 'Unassigned / System Admins',
                    members: []
                };
            }
            acc[cid].members.push(u);
            return acc;
        }, {});
    }, [users]);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading platform users...</div>;

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                    <Users size={20} />
                </div>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Platform Administrators</h2>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Authorized company owners and system admins</p>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.entries(grouped).map(([cid, group]) => {
                    const isOpen = expanded[cid];
                    return (
                        <div key={cid} style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                            <div
                                onClick={() => toggle(cid)}
                                style={{
                                    padding: '1rem 1.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                    background: isOpen ? '#f8fafc' : 'white',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ color: '#94a3b8' }}>
                                        {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                    </div>
                                    <div style={{ width: 32, height: 32, borderRadius: '6px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                        <Building2 size={16} />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>{group.name}</h4>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{group.members.length} member{group.members.length !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                                <span style={{ padding: '0.25rem 0.75rem', borderRadius: '2rem', background: '#f1f5f9', color: '#475569', fontSize: '0.75rem', fontWeight: 600 }}>
                                    Details
                                </span>
                            </div>

                            {isOpen && (
                                <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid #f1f5f9' }}>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                                            <thead>
                                                <tr style={{ textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>
                                                    <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Member Name</th>
                                                    <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Email Address</th>
                                                    <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>System Role</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {group.members.map((user) => (
                                                    <tr key={user._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                                        <td style={{ padding: '1rem 0.5rem' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700 }}>
                                                                    {user.name.charAt(0)}
                                                                </div>
                                                                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1e293b' }}>{user.name}</span>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                                <Mail size={12} /> {user.email}
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '1rem 0.5rem' }}>
                                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.2rem 0.6rem', borderRadius: '4px', background: '#eff6ff', color: '#1e40af', fontSize: '0.75rem', fontWeight: 600 }}>
                                                                <Shield size={10} /> {user.role}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {users.length === 0 && !loading && (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                        No users found on the platform.
                    </div>
                )}
            </div>
        </div>
    );
};

import ProfileView from '../../components/common/ProfileView';


const SettingsView = () => (
    <div style={{ padding: '1rem' }}>
        <ProfileView />
    </div>
);

export default AdminDashboard;
