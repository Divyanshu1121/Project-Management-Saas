import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Employee'); // Default
    const [companyName, setCompanyName] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const payload = {
                name,
                email,
                password,
                role
            };

            if (role === 'Company Owner') {
                payload.companyName = companyName;
            }

            const res = await api.post('/auth/register', payload);
            login(res.data, res.data.token);

            // Redirect based on role
            switch (res.data.role) {
                case 'Platform Admin':
                    navigate('/admin');
                    break;
                case 'Company Owner':
                    navigate('/owner');
                    break;
                case 'Project Manager':
                    navigate('/manager');
                    break;
                case 'Employee':
                    navigate('/employee');
                    break;
                default:
                    navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f1f5f9' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Register</h2>
                {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            className="form-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Role</label>
                        <select className="form-input" value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="Employee">Employee</option>
                            <option value="Company Owner">Company Owner</option>
                            {/* Project Manager usually created by Owner, but maybe allowed here? */}
                            <option value="Project Manager">Project Manager</option>
                        </select>
                    </div>

                    {role === 'Company Owner' && (
                        <div className="form-group">
                            <label className="form-label">Company Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Register</button>
                </form>
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)' }}>Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
