import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Mail, Lock, ArrowRight, LayoutDashboard } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    React.useEffect(() => {
        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            const res = await api.post('/auth/login', { email, password });
            login(res.data, res.data.token);

            switch (res.data.role) {
                case 'SUPER_ADMIN': navigate('/admin'); break;
                case 'COMPANY_OWNER':
                case 'CEO':
                case 'CTO':
                case 'CFO':
                case 'COO':
                    navigate('/company');
                    break;
                case 'PROJECT_MANAGER': navigate('/manager'); break;
                case 'EMPLOYEE': navigate('/employee'); break;
                default: navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
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
                width: '100%', maxWidth: '420px', padding: '2.5rem',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '56px', height: '56px', margin: '0 auto 1rem',
                        backgroundColor: 'var(--primary-color)', borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.5)'
                    }}>
                        <LayoutDashboard size={32} />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>
                        SaaS Project Manager
                    </h1>
                    <p style={{ color: '#64748b' }}>Welcome back! Please sign in to continue.</p>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem',
                        borderRadius: '0.375rem', marginBottom: '1.5rem', fontSize: '0.9rem',
                        textAlign: 'center', border: '1px solid #fecaca'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" style={{ marginBottom: '0.5rem' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                                color: '#94a3b8'
                            }}>
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="name@company.com"
                                style={{ paddingLeft: '40px' }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                            <button
                                type="button"
                                onClick={() => alert('Please contact your System Administrator to reset your password.')}
                                style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: 500, cursor: 'pointer' }}
                            >
                                Forgot password?
                            </button>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                                color: '#94a3b8'
                            }}>
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                style={{ paddingLeft: '40px' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <input
                            type="checkbox"
                            id="remember"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                        />
                        <label htmlFor="remember" style={{ fontSize: '0.9rem', color: '#64748b', cursor: 'pointer' }}>Remember me</label>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{
                            width: '100%', padding: '0.75rem', fontSize: '1rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer'
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                        {!isLoading && <ArrowRight size={18} />}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
                    Don't have an account?{' '}
                    <a href="mailto:admin@saasproject.com?subject=Account Access Request" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Contact Admin</a>
                </div>
            </div>

            <div style={{ position: 'absolute', bottom: '1rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                &copy; {new Date().getFullYear()} SaaS Project Manager. All rights reserved.
            </div>
        </div>
    );
};

export default Login;
