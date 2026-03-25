import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Users, ChevronDown, ChevronRight, Building2, Mail, Shield, BarChart3, Settings as SettingsIcon, CheckCircle2, XCircle } from 'lucide-react';
import CompanyTable from './CompanyTable';

const AdminDashboard = () => {
    const location = useLocation();

    return (
        <div className="admin-dashboard-root" style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
            <style>{`
                @media (max-width: 640px) {
                    .admin-dashboard-root { padding: 1rem 0.75rem !important; }
                }
                .toggle-switch { position: relative; display: inline-block; width: 44px; height: 24px; }
                .toggle-switch input { opacity: 0; width: 0; height: 0; }
                .toggle-slider {
                    position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
                    background-color: #cbd5e1; transition: 0.3s; border-radius: 24px;
                }
                .toggle-slider:before {
                    position: absolute; content: ''; height: 18px; width: 18px;
                    left: 3px; bottom: 3px; background-color: white;
                    transition: 0.3s; border-radius: 50%;
                }
                input:checked + .toggle-slider { background-color: #2563eb; }
                input:checked + .toggle-slider:before { transform: translateX(20px); }
                .section-divider {
                    margin: 1.25rem 0 1rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid #e2e8f0;
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
            `}</style>

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
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 700 }}>Dashboard Overview</h2>
            <div className="responsive-grid grid-sidebar-layout" style={{ alignItems: 'start' }}>

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
                    <div className="card" style={{ borderLeft: '4px solid #ea580c', marginBottom: 0 }}>
                        <h3 style={{ color: '#9a3412' }}>Paused Companies</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ea580c' }}>{stats?.pausedCompanies || 0}</p>
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


// ─── Toggle Helper ──────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <label className="toggle-switch">
            <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
            <span className="toggle-slider" />
        </label>
        <span style={{ fontSize: '0.875rem', color: checked ? '#1d4ed8' : '#64748b', fontWeight: 500 }}>{label}</span>
    </div>
);

// ─── Form Field Helper ───────────────────────────────────────────────────────
const Field = ({ label, required, children }) => (
    <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem', display: 'block' }}>
            {label}{required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
        </label>
        {children}
    </div>
);

const inputSt = {
    width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #e2e8f0',
    borderRadius: '7px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
    background: 'white', color: '#1e293b'
};

// ─── Create / Edit Modal ─────────────────────────────────────────────────────
const EMPTY_FORM = {
    // Company
    companyName: '', companySize: '1-10', industry: 'Technology',
    website: '', country: '', city: '',
    plan: 'free', isTrialActive: false,
    // Owner
    ownerName: '', ownerEmail: '', ownerPhone: '', ownerPassword: '', ownerRole: ['CEO'],
    // Admin controls
    isEmailVerified: true, isActive: true,
};

const CompanyFormModal = ({ isEditing, formData, setFormData, onSubmit, onClose, submitting }) => {
    const set = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));
    const bind = (key) => ({ value: formData[key], onChange: e => set(key, e.target.value) });
    const [showPw, setShowPw] = useState(false);

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex',
            justifyContent: 'center', alignItems: 'center', zIndex: 1000,
            padding: '1rem'
        }}>
            <div style={{
                background: 'white', borderRadius: '16px', width: '100%', maxWidth: '620px',
                maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.18)'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0',
                    position: 'sticky', top: 0, background: 'white', zIndex: 1, borderRadius: '16px 16px 0 0'
                }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                            {isEditing ? '✏️ Edit Company' : '🏢 Create New Company'}
                        </h3>
                        <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                            {isEditing ? 'Update plan, trial, and status settings' : 'Manually onboard a new tenant company'}
                        </p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#64748b', padding: '0.25rem' }}>×</button>
                </div>

                <form onSubmit={onSubmit}>
                    <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>

                        {/* ── Section: Company Info ── */}
                        <div className="section-divider">🏢 Company Information</div>

                        <Field label="Company Name" required>
                            <input className="form-input" style={inputSt} {...bind('companyName')} required placeholder="Acme Corp" />
                        </Field>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <Field label="Company Size" required>
                                <select className="form-input" style={inputSt} {...bind('companySize')}>
                                    {['1-10', '11-50', '51-200', '201-500', '500+'].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </Field>
                            <Field label="Industry" required>
                                <select className="form-input" style={inputSt} {...bind('industry')}>
                                    {['Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 'Manufacturing', 'Marketing', 'Other'].map(i => <option key={i} value={i}>{i}</option>)}
                                </select>
                            </Field>
                        </div>

                        <Field label="Company Website">
                            <input className="form-input" style={inputSt} type="url" {...bind('website')} placeholder="https://example.com" />
                        </Field>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <Field label="Country" required>
                                <input className="form-input" style={inputSt} {...bind('country')} required placeholder="India" />
                            </Field>
                            <Field label="City" required>
                                <input className="form-input" style={inputSt} {...bind('city')} required placeholder="Mumbai" />
                            </Field>
                        </div>

                        {/* ── Section: Plan & Trial ── */}
                        <div className="section-divider">💳 Plan & Trial</div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', alignItems: 'center' }}>
                            <Field label="Subscription Plan" required>
                                <select className="form-input" style={inputSt} {...bind('plan')}>
                                    <option value="free">Free</option>
                                    <option value="basic">Basic</option>
                                    <option value="pro">Pro</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </Field>
                            <div style={{ paddingTop: '1.4rem' }}>
                                <Toggle
                                    checked={formData.isTrialActive}
                                    onChange={val => set('isTrialActive', val)}
                                    label={formData.isTrialActive ? 'Trial Active (7 days)' : 'No Trial'}
                                />
                            </div>
                        </div>

                        {/* ── Section: Owner Details (create only) ── */}
                        {!isEditing && (
                            <>
                                <div className="section-divider">👤 Owner Details</div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <Field label="Full Name" required>
                                        <input className="form-input" style={inputSt} {...bind('ownerName')} required placeholder="John Doe" />
                                    </Field>
                                    <Field label="Role Title (Multi-select)" required>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingTop: '4px' }}>
                                            {['CEO', 'CTO', 'COO', 'CFO', 'Founder', 'MD', 'Director', 'President', 'VP', 'Other'].map(r => {
                                                const isSelected = Array.isArray(formData.ownerRole) && formData.ownerRole.includes(r);
                                                return (
                                                    <div 
                                                        key={r}
                                                        onClick={() => {
                                                            let currentRoles = Array.isArray(formData.ownerRole) ? formData.ownerRole : [formData.ownerRole];
                                                            const newRoles = isSelected 
                                                                ? currentRoles.filter(x => x !== r)
                                                                : [...currentRoles, r];
                                                            if (newRoles.length > 0) set('ownerRole', newRoles);
                                                        }}
                                                        style={{
                                                            padding: '4px 10px',
                                                            borderRadius: '16px',
                                                            fontSize: '0.75rem',
                                                            cursor: 'pointer',
                                                            border: isSelected ? '1px solid #2563eb' : '1px solid #e2e8f0',
                                                            background: isSelected ? '#eff6ff' : '#f8fafc',
                                                            color: isSelected ? '#1d4ed8' : '#64748b',
                                                            fontWeight: isSelected ? 600 : 400,
                                                            transition: 'all 0.2s',
                                                            userSelect: 'none'
                                                        }}
                                                    >
                                                        {r}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </Field>
                                </div>

                                <Field label="Work Email" required>
                                    <input className="form-input" style={inputSt} type="email" {...bind('ownerEmail')} required placeholder="owner@company.com" />
                                </Field>

                                <Field label="Phone Number" required>
                                    <input className="form-input" style={inputSt} type="tel" {...bind('ownerPhone')} required placeholder="+91 9876543210" />
                                </Field>

                                <Field label="Password" required>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            className="form-input"
                                            style={{ ...inputSt, paddingRight: '3rem' }}
                                            type={showPw ? 'text' : 'password'}
                                            {...bind('ownerPassword')}
                                            required
                                            placeholder="Min 8 chars"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPw(p => !p)}
                                            style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '0.75rem' }}
                                        >
                                            {showPw ? 'Hide' : 'Show'}
                                        </button>
                                    </div>
                                </Field>
                            </>
                        )}

                        {/* ── Section: Admin Controls ── */}
                        <div className="section-divider">⚙️ Admin Controls</div>

                        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', padding: '0.5rem 0' }}>
                            <Toggle
                                checked={formData.isEmailVerified}
                                onChange={val => set('isEmailVerified', val)}
                                label={formData.isEmailVerified ? 'Email Verified' : 'Email Unverified'}
                            />
                            <Toggle
                                checked={formData.isActive}
                                onChange={val => set('isActive', val)}
                                label={formData.isActive ? 'Account Active' : 'Account Paused'}
                            />
                        </div>

                        {!isEditing && (
                            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.78rem', color: '#166534' }}>
                                💡 <strong>signupType</strong> will be set to <code>manual</code> automatically. Readable Company ID (COMP-YYYY-XXXXX) and User ID (USR-YYYY-XXXXX) are auto-generated.
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div style={{
                        display: 'flex', justifyContent: 'flex-end', gap: '0.75rem',
                        padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0',
                        position: 'sticky', bottom: 0, background: 'white', borderRadius: '0 0 16px 16px'
                    }}>
                        <button type="button" onClick={onClose} style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting} className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.875rem', opacity: submitting ? 0.7 : 1 }}>
                            {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Company'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Companies View ──────────────────────────────────────────────────────────
const CompaniesView = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCompanyId, setCurrentCompanyId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [deleteModal, setDeleteModal] = useState({ show: false, companyId: null, password: '' });

    const [formData, setFormData] = useState({ ...EMPTY_FORM });

    const fetchData = async () => {
        try {
            const res = await api.get('/admin/companies');
            setCompanies(res.data);
            setLoading(false);
        } catch (err) { console.error(err); setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const resetForm = () => { setFormData({ ...EMPTY_FORM }); setIsEditing(false); setCurrentCompanyId(null); };

    const handleOpenCreate = () => { resetForm(); setShowModal(true); };

    const handleOpenEdit = (company) => {
        setFormData({
            companyName: company.companyName || company.name || '',
            companySize: company.companySize || '1-10',
            industry: company.industry || 'Technology',
            website: company.website || '',
            country: company.country || '',
            city: company.city || '',
            plan: (company.plan || 'free').toLowerCase(),
            isTrialActive: !!company.isTrialActive,
            // Owner (not editable in edit mode, but keep in state)
            ownerName: '', ownerEmail: '', ownerPhone: '', ownerPassword: '', ownerRole: 'CEO',
            // Admin controls
            isEmailVerified: !!company.isEmailVerified,
            isActive: company.isActive !== false,
        });
        setCurrentCompanyId(company._id);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (isEditing) {
                await api.put(`/companies/${currentCompanyId}`, {
                    name: formData.companyName,
                    companyName: formData.companyName,
                    companySize: formData.companySize,
                    industry: formData.industry,
                    website: formData.website,
                    country: formData.country,
                    city: formData.city,
                    plan: formData.plan,
                    isTrialActive: formData.isTrialActive,
                    isEmailVerified: formData.isEmailVerified,
                    isActive: formData.isActive,
                });
            } else {
                await api.post('/companies', {
                    companyName: formData.companyName,
                    companySize: formData.companySize,
                    industry: formData.industry,
                    website: formData.website,
                    country: formData.country,
                    city: formData.city,
                    plan: formData.plan,
                    isTrialActive: formData.isTrialActive,
                    isEmailVerified: formData.isEmailVerified,
                    isActive: formData.isActive,
                    ownerName: formData.ownerName,
                    ownerEmail: formData.ownerEmail,
                    ownerPhone: formData.ownerPhone,
                    ownerPassword: formData.ownerPassword,
                    ownerRole: formData.ownerRole,
                });
            }
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving company');
        } finally {
            setSubmitting(false);
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
        const companyName = c.companyName || c.name || '';
        const ownerEmail = c.owner?.email || '';
        const matchesSearch = companyName.toLowerCase().includes(search.toLowerCase()) ||
            ownerEmail.toLowerCase().includes(search.toLowerCase()) ||
            (c.companyId && c.companyId.toLowerCase().includes(search.toLowerCase()));

        if (statusFilter === 'ACTIVE') return matchesSearch && c.isActive;
        if (statusFilter === 'PAUSED') return matchesSearch && !c.isActive;
        return matchesSearch;
    }).sort((a, b) => sortOrder === 'asc'
        ? (a.companyName || a.name || '').localeCompare(b.companyName || b.name || '')
        : (b.companyName || b.name || '').localeCompare(a.companyName || a.name || '')
    );

    if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading companies...</div>;

    return (
        <div>
            <div className="stack-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>Registered Companies</h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Overview of all tenants and their platform usage</p>
                </div>
                <div className="stack-mobile" style={{ display: 'flex', gap: '0.75rem', width: '100%', maxWidth: 'fit-content' }}>
                    <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', background: 'white' }}>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '0.5rem 0.75rem', border: 'none', fontSize: '0.85rem', color: '#475569', outline: 'none' }}>
                            <option value="ALL">All Status</option>
                            <option value="ACTIVE">Active Only</option>
                            <option value="PAUSED">Paused Only</option>
                        </select>
                        <div style={{ width: '1px', background: '#e2e8f0' }} />
                        <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} style={{ padding: '0.5rem 0.75rem', border: 'none', background: 'white', cursor: 'pointer', fontSize: '0.85rem', color: '#475569' }}>
                            {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                        </button>
                    </div>
                    <input type="text" placeholder="Search companies..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', minWidth: '200px', flex: 1, fontSize: '0.85rem', outline: 'none' }} />
                    <button className="btn btn-primary" onClick={handleOpenCreate} style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                        <Building2 size={16} /> New
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
                <CompanyFormModal
                    isEditing={isEditing}
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleSubmit}
                    onClose={() => { setShowModal(false); resetForm(); }}
                    submitting={submitting}
                />
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
            // Super Admins get their own group
            const isSuperAdmin = u.role === 'superadmin' || u.role === 'SUPER_ADMIN';
            if (isSuperAdmin) {
                if (!acc['__superadmins__']) {
                    acc['__superadmins__'] = { name: '🛡️ System Admins (Super Admin)', members: [], isSuperAdmin: true };
                }
                acc['__superadmins__'].members.push(u);
                return acc;
            }

            // Resolve company from either `company` or `companyId` (both are now populated)
            const companyObj = u.company || u.companyId;
            const cid = (companyObj && typeof companyObj === 'object' && companyObj._id)
                ? companyObj._id.toString()
                : null;

            if (!cid) {
                // No company assigned
                if (!acc['__unassigned__']) {
                    acc['__unassigned__'] = { name: '⚠️ Unassigned', members: [] };
                }
                acc['__unassigned__'].members.push(u);
                return acc;
            }

            if (!acc[cid]) {
                const displayName = companyObj.companyName || companyObj.name || `Company (${cid})`;
                acc[cid] = { name: displayName, members: [] };
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
                                                    <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>User Info</th>
                                                    <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Contact</th>
                                                    <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Role & Verification</th>
                                                    <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Last Login</th>
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
                                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1e293b' }}>{user.name}</span>
                                                                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontFamily: 'monospace' }}>{user.userId || 'N/A'}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '1rem 0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Mail size={12} /> {user.email}</div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>📞 {user.phone || 'N/A'}</div>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '1rem 0.5rem' }}>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: '#eff6ff', color: '#1e40af', fontSize: '0.7rem', fontWeight: 600 }}>
                                                                        <Shield size={10} /> {user.role}
                                                                    </div>
                                                                    {user.roleTitle?.length > 0 ? (
                                                                        user.roleTitle.map(r => (
                                                                            <div key={r} style={{ display: 'inline-flex', alignItems: 'center', padding: '0.15rem 0.5rem', borderRadius: '4px', background: '#f1f5f9', color: '#475569', fontSize: '0.7rem', fontWeight: 600, border: '1px solid #e2e8f0' }}>
                                                                                {r}
                                                                            </div>
                                                                        ))
                                                                    ) : user.empId ? (
                                                                        <div style={{ display: 'inline-flex', alignItems: 'center', padding: '0.15rem 0.5rem', borderRadius: '4px', background: '#f1f5f9', color: '#475569', fontSize: '0.7rem', fontWeight: 600, border: '1px solid #e2e8f0' }}>
                                                                            {user.empId}
                                                                        </div>
                                                                    ) : null}
                                                                </div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', color: user.isEmailVerified ? '#16a34a' : '#ea580c' }}>
                                                                    {user.isEmailVerified ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                                                                    {user.isEmailVerified ? 'Verified' : 'Unverified'}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '1rem 0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                                                            {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
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
