import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

const AdminDashboard = () => {

    return (
        <div style={{ padding: '2rem' }}>
            <Routes>
                <Route path="/" element={
                    <>
                        <DashboardStatsView />
                        <div style={{ marginTop: '2rem' }}>
                            <CompaniesView />
                        </div>
                    </>
                } />
                {/* <Route path="companies" element={<CompaniesView />} />  Merged into main dashboard */}
                <Route path="users" element={<UsersView />} />
                <Route path="settings" element={<SettingsView />} />
                <Route path="*" element={<Navigate to="/admin" />} />
            </Routes>
        </div>
    );
};


const DashboardStatsView = () => {
    const [stats, setStats] = useState(null);
    useEffect(() => {
        api.get('/analytics').then(res => setStats(res.data.platformStats)).catch(console.error);
    }, []);

    return (
        <div>
            <h2 style={{ marginBottom: '2rem' }}>Dashboard Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <div className="card">
                    <h3>Total Companies</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2563eb' }}>{stats?.totalCompanies || 0}</p>
                </div>
                <div className="card">
                    <h3>Total Users</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#4b5563' }}>{stats?.totalPlatformUsers || 0}</p>
                </div>
                <div className="card">
                    <h3>Active Companies</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#16a34a' }}>{stats?.activeCompanies || 0}</p>
                </div>
                <div className="card">
                    <h3>Paused Companies</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ea580c' }}>{stats?.pausedCompanies || 0}</p>
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
            const res = await api.get('/companies');
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
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.ownerId?.email?.toLowerCase().includes(search.toLowerCase());
        if (statusFilter === "ACTIVE") return matchesSearch && c.isActive;
        if (statusFilter === "PAUSED") return matchesSearch && !c.isActive;
        return matchesSearch;
    }).sort((a, b) => sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));

    if (loading) return <div>Loading...</div>;

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>Registered Companies</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="PAUSED">Paused</option>
                    </select>
                    <button onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")} style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '4px', background: 'white', cursor: 'pointer' }}>
                        Sort {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                    </button>
                    <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', width: '250px' }} />
                    <button className="btn btn-primary" onClick={handleOpenCreate}>+ New Company</button>
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                            <th style={{ padding: '1rem' }}>Sr No.</th>
                            <th style={{ padding: '1rem' }}>ID</th>
                            <th style={{ padding: '1rem' }}>Company</th>
                            <th style={{ padding: '1rem' }}>Owner</th>
                            <th style={{ padding: '1rem' }}>Plan</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                            <th style={{ padding: '1rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCompanies.map((company, index) => (
                            <tr key={company._id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '1rem' }}>{index + 1}</td>
                                <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.9rem' }} title={company._id}>{company._id.substring(0, 6)}...{company._id.substring(company._id.length - 4)}</td>
                                <td style={{ padding: '1rem' }}>{company.name}</td>
                                <td style={{ padding: '1rem' }}>{company.ownerId?.name}<br /><small style={{ color: '#666' }}>{company.ownerId?.email}</small></td>
                                <td style={{ padding: '1rem' }}><span style={{ padding: '0.25rem 0.5rem', background: '#f3f4f6', borderRadius: '4px' }}>{company.plan}</span></td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.85rem', background: company.isActive ? '#dcfce7' : '#ffedd5', color: company.isActive ? '#166534' : '#9a3412', cursor: 'pointer' }} onClick={() => handleToggleStatus(company)}>
                                        {company.isActive ? 'Active' : 'Paused'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <button onClick={() => handleOpenEdit(company)} style={{ marginRight: '0.5rem', background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer' }}>Edit</button>
                                    <button onClick={() => handleDelete(company._id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

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
    useEffect(() => { api.get('/users').then(res => setUsers(res.data)).catch(console.error); }, []);
    return (
        <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Platform Users</h3>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}><th style={{ padding: '1rem' }}>Name</th><th style={{ padding: '1rem' }}>Email</th><th style={{ padding: '1rem' }}>Role</th><th style={{ padding: '1rem' }}>Company</th></tr></thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '1rem' }}>{user.name}</td>
                                <td style={{ padding: '1rem' }}>{user.email}</td>
                                <td style={{ padding: '1rem' }}><span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontSize: '0.85rem' }}>{user.role}</span></td>
                                <td style={{ padding: '1rem' }}>{user.companyId?.name || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

import ProfileView from '../../components/common/ProfileView';

// ... (existing imports and code)

const SettingsView = () => (
    <div style={{ padding: '1rem' }}>
        <ProfileView />
    </div>
);

export default AdminDashboard;
