import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const Signup = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '', email: '', password: '', confirmPassword: '', phone: '',
        companyName: '', companySize: '1-10', industry: 'Technology',
        website: '', country: '', city: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = () => {
        if (!formData.name || !formData.email || !formData.password || !formData.phone) {
            setError('Please fill in all required personal information.');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setError('');
        setStep(2);
    };

    const prevStep = () => {
        setStep(1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.companyName || !formData.country || !formData.city) {
            setError('Please fill in all required company information.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/auth/signup', formData);
            if (response.data.skipVerification) {
                alert('Signup successful! (Dev Bypass: No verification needed)');
                navigate('/login');
            } else {
                setSuccess(true);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating account');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-container">
                <div className="auth-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                    <h2 style={{ color: '#16a34a', marginBottom: '1rem' }}>Check your email</h2>
                    <p style={{ color: '#4b5563', marginBottom: '2rem' }}>
                        We've sent a verification link to <strong>{formData.email}</strong>.<br/>
                        Please verify your email to continue.
                    </p>
                    <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary, #f8fafc)', padding: '2rem' }}>
            <div className="auth-card" style={{ width: '100%', maxWidth: '550px', background: 'var(--card-bg, white)', borderRadius: '16px', padding: '2.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--text-primary, #0f172a)' }}>Create your account</h1>
                    <p style={{ color: 'var(--text-secondary, #64748b)', margin: 0 }}>Step {step} of 2 - {step === 1 ? 'Personal Info' : 'Company Info'}</p>
                </div>

                {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    {step === 1 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>Full Name *</label>
                                <input name="name" type="text" value={formData.name} onChange={handleChange} required style={inputStyle} placeholder="John Doe" />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>Work Email *</label>
                                <input name="email" type="email" value={formData.email} onChange={handleChange} required style={inputStyle} placeholder="john@company.com" />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>Phone Number *</label>
                                <input name="phone" type="tel" value={formData.phone} onChange={handleChange} required style={inputStyle} placeholder="+1234567890" />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>Password *</label>
                                <input name="password" type="password" value={formData.password} onChange={handleChange} required style={inputStyle} placeholder="Min 8 chars, 1 uppercase, 1 lowercase, 1 number" />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>Confirm Password *</label>
                                <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required style={inputStyle} />
                            </div>

                            <button type="button" onClick={nextStep} style={{ ...btnStyle, background: '#2563eb', color: 'white', marginTop: '1rem' }}>
                                Continue to Company Details
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>Company Name *</label>
                                <input name="companyName" type="text" value={formData.companyName} onChange={handleChange} required style={inputStyle} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>Company Size *</label>
                                    <select name="companySize" value={formData.companySize} onChange={handleChange} style={inputStyle}>
                                        <option value="1-10">1-10</option>
                                        <option value="11-50">11-50</option>
                                        <option value="51-200">51-200</option>
                                        <option value="201-500">201-500</option>
                                        <option value="500+">500+</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>Industry *</label>
                                    <select name="industry" value={formData.industry} onChange={handleChange} style={inputStyle}>
                                        <option value="Technology">Technology</option>
                                        <option value="Finance">Finance</option>
                                        <option value="Healthcare">Healthcare</option>
                                        <option value="Education">Education</option>
                                        <option value="Retail">Retail</option>
                                        <option value="Manufacturing">Manufacturing</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>Company Website</label>
                                <input name="website" type="url" value={formData.website} onChange={handleChange} style={inputStyle} placeholder="https://..." />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>Country *</label>
                                    <input name="country" type="text" value={formData.country} onChange={handleChange} required style={inputStyle} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>City *</label>
                                    <input name="city" type="text" value={formData.city} onChange={handleChange} required style={inputStyle} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={prevStep} style={{ ...btnStyle, flex: 1, background: '#f1f5f9', color: '#475569' }}>
                                    Back
                                </button>
                                <button type="submit" disabled={loading} style={{ ...btnStyle, flex: 2, background: '#2563eb', color: 'white' }}>
                                    {loading ? 'Submitting...' : 'Complete Signup'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>

                <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Already have an account? <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>Log in</Link>
                </div>
            </div>
        </div>
    );
};

const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #e2e8f0)',
    background: 'var(--input-bg, white)',
    color: 'var(--text-primary, #0f172a)',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box'
};

const btnStyle = {
    padding: '0.875rem',
    borderRadius: '8px',
    border: 'none',
    fontWeight: 600,
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
};

export default Signup;
