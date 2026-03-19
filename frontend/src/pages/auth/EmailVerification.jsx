import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const EmailVerification = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('Verifying your email...');
    const [emailForResend, setEmailForResend] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link.');
            return;
        }

        const verifyToken = async () => {
            try {
                const res = await api.post(`/auth/verify-email?token=${token}`);
                setStatus('success');
                setMessage(res.data.message || 'Email verified successfully! Redirecting...');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Verification failed. The link may have expired.');
            }
        };

        verifyToken();
    }, [token, navigate]);

    const handleResend = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/resend-verification', { email: emailForResend });
            setStatus('success');
            setMessage('A new verification link has been sent to your email.');
        } catch (err) {
            setMessage(err.response?.data?.message || 'Error resending email.');
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '2rem' }}>
            <div style={{ width: '100%', maxWidth: '400px', background: 'white', borderRadius: '16px', padding: '2.5rem', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                
                {status === 'loading' && (
                    <div>
                        <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1.5rem' }}></div>
                        <h2 style={{ color: '#1e293b', margin: '0 0 0.5rem' }}>Verifying</h2>
                        <p style={{ color: '#64748b', margin: 0 }}>{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.5rem' }}>
                            ✓
                        </div>
                        <h2 style={{ color: '#16a34a', margin: '0 0 1rem' }}>Success!</h2>
                        <p style={{ color: '#4b5563', margin: '0 0 2rem' }}>{message}</p>
                        <Link to="/login" style={{ display: 'inline-block', padding: '0.75rem 2rem', background: '#2563eb', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 500 }}>
                            Go to Login
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.5rem' }}>
                            !
                        </div>
                        <h2 style={{ color: '#dc2626', margin: '0 0 1rem' }}>Verification Failed</h2>
                        <p style={{ color: '#4b5563', margin: '0 0 2rem' }}>{message}</p>
                        
                        <form onSubmit={handleResend} style={{ marginTop: '1.5rem', textAlign: 'left' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Need a new link?</label>
                            <input 
                                type="email" 
                                placeholder="Enter your email" 
                                required
                                value={emailForResend}
                                onChange={(e) => setEmailForResend(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1rem', outline: 'none' }}
                            />
                            <button type="submit" style={{ width: '100%', padding: '0.75rem', background: '#f1f5f9', color: '#334155', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                                Resend Verification Email
                            </button>
                        </form>
                    </div>
                )}

                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default EmailVerification;
