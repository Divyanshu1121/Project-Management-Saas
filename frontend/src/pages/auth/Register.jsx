import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Mail, Lock, User, Building, ShieldCheck, ArrowRight, LayoutDashboard } from 'lucide-react';

const getRoleRedirect = (role) => {
    switch (role) {
        case 'SUPER_ADMIN': return '/admin';
        case 'COMPANY_OWNER':
        case 'CEO':
        case 'CTO':
        case 'CFO':
        case 'COO': return '/company';
        case 'HR': return '/hr';
        case 'PROJECT_MANAGER': return '/manager';
        case 'EMPLOYEE': return '/employee';
        default: return '/';
    }
};

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('EMPLOYEE');
    const [companyName, setCompanyName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { login, user, loading } = useAuth();

    // If already authenticated, redirect to the appropriate dashboard
    if (!loading && user) {
        return <Navigate to={getRoleRedirect(user.role)} replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const payload = {
                name,
                email,
                password,
                role
            };

            if (role === 'COMPANY_OWNER') {
                payload.companyName = companyName;
            }

            const res = await api.post('/auth/register', payload);
            login(res.data, res.data.token);
            navigate(getRoleRedirect(res.data.role));
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please check your details and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex', minHeight: '100vh',
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
            <div className="card" style={{
                width: '100%', maxWidth: '460px', padding: '2.5rem',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.5)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '56px', height: '56px', margin: '0 auto 1rem',
                        background: 'linear-gradient(135deg, var(--clr-primary-600), var(--clr-indigo-600))', borderRadius: '14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', boxShadow: '0 8px 16px -4px rgba(79, 70, 229, 0.4)'
                    }}>
                        <LayoutDashboard size={32} />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--clr-slate-800)', margin: '0 0 0.5rem', letterSpacing: '-0.025em' }}>
                        Create an Account
                    </h1>
                    <p style={{ color: 'var(--clr-slate-500)', fontSize: '0.95rem', margin: 0 }}>Join SaaS Project Manager to get started.</p>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: 'var(--clr-danger-50)', color: 'var(--clr-danger-600)', padding: '0.875rem',
                        borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 500,
                        textAlign: 'center', border: '1px solid var(--clr-danger-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                    }}>
                        <ShieldCheck size={18} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="form-label" style={{ marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-slate-400)' }}>
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Jane Doe"
                                    style={{ paddingLeft: '40px', fontSize: '0.95rem', height: '42px', backgroundColor: 'var(--clr-slate-50)', border: '1px solid var(--clr-slate-200)' }}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="form-label" style={{ marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-slate-400)' }}>
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="name@company.com"
                                    style={{ paddingLeft: '40px', fontSize: '0.95rem', height: '42px', backgroundColor: 'var(--clr-slate-50)', border: '1px solid var(--clr-slate-200)' }}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="form-label" style={{ marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Create Password</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-slate-400)' }}>
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="••••••••"
                                    style={{ paddingLeft: '40px', fontSize: '0.95rem', height: '42px', backgroundColor: 'var(--clr-slate-50)', border: '1px solid var(--clr-slate-200)' }}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="form-label" style={{ marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Account Type</label>
                            <select
                                className="form-input"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                style={{ fontSize: '0.95rem', height: '42px', backgroundColor: 'var(--clr-slate-50)', border: '1px solid var(--clr-slate-200)', cursor: 'pointer' }}
                            >
                                <option value="EMPLOYEE">Employee</option>
                                <option value="PROJECT_MANAGER">Project Manager</option>
                                <option value="COMPANY_OWNER">Company Owner</option>
                            </select>
                        </div>

                        {role === 'COMPANY_OWNER' && (
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label className="form-label" style={{ marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Company Name</label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-slate-400)' }}>
                                        <Building size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Acme Corp"
                                        style={{ paddingLeft: '40px', fontSize: '0.95rem', height: '42px', backgroundColor: 'var(--clr-slate-50)', border: '1px solid var(--clr-slate-200)' }}
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        required={role === 'COMPANY_OWNER'}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{
                            width: '100%', padding: '0.875rem', fontSize: '1rem', fontWeight: 600, marginTop: '1rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            background: 'linear-gradient(135deg, var(--clr-primary-500), var(--clr-indigo-500))', border: 'none',
                            opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                        {!isLoading && <ArrowRight size={18} />}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.95rem', color: 'var(--clr-slate-500)' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--clr-primary-600)', fontWeight: 600, textDecoration: 'none' }}>
                        Sign in here
                    </Link>
                </div>
            </div>

            <div style={{ position: 'absolute', bottom: '1.5rem', color: 'var(--clr-slate-400)', fontSize: '0.8rem', fontWeight: 500 }}>
                &copy; {new Date().getFullYear()} SaaS Project Manager. All rights reserved.
            </div>
        </div>
    );
};

export default Register;
