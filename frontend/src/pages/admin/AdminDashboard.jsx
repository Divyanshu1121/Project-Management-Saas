import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCompanyId, setCurrentCompanyId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        companyName: '',
        ownerName: 'CEO', // Default to CEO
        ownerEmail: '',
        ownerPassword: '',
        plan: 'Free'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, companiesRes] = await Promise.all([
                api.get('/analytics'),
                api.get('/companies')
            ]);
            setStats(statsRes.data.platformStats);
            setCompanies(companiesRes.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ companyName: '', ownerName: 'CEO', ownerEmail: '', ownerPassword: '', plan: 'Free' });
        setIsEditing(false);
        setCurrentCompanyId(null);
    };

    const handleOpenCreate = () => {
        resetForm();
        setShowModal(true);
    };

    const handleOpenEdit = (company) => {
        setFormData({
            companyName: company.name,
            ownerName: '', // Not used in edit
            ownerEmail: '', // Not used in edit
            ownerPassword: '', // Not used in edit
            plan: company.plan
        });
        setCurrentCompanyId(company._id);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                // Update Company
                await api.put(`/companies/${currentCompanyId}`, {
                    name: formData.companyName,
                    plan: formData.plan
                });
            } else {
                // Create Company
                // Mapping 'ownerName' (Role) to be the User's name as per request
                await api.post('/companies', formData);
            }
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving company');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
            try {
                await api.delete(`/companies/${id}`);
                fetchData();
            } catch (err) {
                alert('Error deleting company');
            }
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

    if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Super Admin Dashboard</h2>
                <button
                    className="btn btn-primary"
                    onClick={handleOpenCreate}
                >
                    + Create Company
                </button>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="card">
                    <h3>Total Companies</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats?.totalCompanies || companies.length}</p>
                </div>
                <div className="card">
                    <h3>Total Users</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats?.totalPlatformUsers || 0}</p>
                </div>
            </div>

            {/* Companies Table */}
            <div className="card">
                <h3>Registered Companies</h3>
                <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                <th style={{ padding: '1rem' }}>Company</th>
                                <th style={{ padding: '1rem' }}>Owner</th>
                                <th style={{ padding: '1rem' }}>Plan</th>
                                <th style={{ padding: '1rem' }}>Status</th>
                                <th style={{ padding: '1rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {companies.map(company => (
                                <tr key={company._id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '1rem' }}>{company.name}</td>
                                    <td style={{ padding: '1rem' }}>
                                        {company.ownerId?.name}<br />
                                        <small style={{ color: '#666' }}>{company.ownerId?.email}</small>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {/* Static Plan Display */}
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            backgroundColor: '#f3f4f6',
                                            borderRadius: '4px',
                                            fontWeight: 500
                                        }}>
                                            {company.plan}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {/* Active/Pause Status Toggle */}
                                        <span
                                            style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '999px',
                                                fontSize: '0.875rem',
                                                backgroundColor: company.isActive ? '#dcfce7' : '#ffedd5',
                                                color: company.isActive ? '#166534' : '#9a3412',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => handleToggleStatus(company)}
                                        >
                                            {company.isActive ? 'Active' : 'Paused'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <button
                                            onClick={() => handleOpenEdit(company)}
                                            style={{
                                                marginRight: '0.5rem',
                                                backgroundColor: '#3b82f6',
                                                color: 'white',
                                                border: 'none',
                                                padding: '0.5rem',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(company._id)}
                                            style={{
                                                backgroundColor: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                padding: '0.5rem',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3>{isEditing ? 'Edit Company' : 'Create New Company'}</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Company Name</label>
                                <input
                                    className="form-input"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Plan</label>
                                {/* Plan Dropdown (Editable in Create and Edit) */}
                                <select
                                    className="form-input"
                                    value={formData.plan}
                                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                                >
                                    <option value="Free">Free</option>
                                    <option value="Basic">Basic</option>
                                    <option value="Pro">Pro</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>

                            {!isEditing && (
                                <>
                                    <div style={{ margin: '1rem 0', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                                        <h4>Owner Details</h4>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Owner Role</label>
                                        <select
                                            className="form-input"
                                            value={formData.ownerName}
                                            onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                            required
                                        >
                                            <option value="CEO">CEO</option>
                                            <option value="CTO">CTO</option>
                                            <option value="CFO">CFO</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Owner Email</label>
                                        <input
                                            type="email"
                                            className="form-input"
                                            value={formData.ownerEmail}
                                            onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Owner Password</label>
                                        <input
                                            type="password"
                                            className="form-input"
                                            value={formData.ownerPassword}
                                            onChange={(e) => setFormData({ ...formData, ownerPassword: e.target.value })}
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            {/* Edit Mode: Clean UI, no p tags about owner as requested */}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ border: '1px solid #ddd' }}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{isEditing ? 'Save Changes' : 'Create Company'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
