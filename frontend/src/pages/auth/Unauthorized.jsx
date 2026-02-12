import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Unauthorized = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
            <h1>Unauthorized Access</h1>
            <p>You do not have permission to view this page.</p>
            <div style={{ marginTop: '2rem' }}>
                <button onClick={handleLogout} className="btn btn-secondary" style={{ marginRight: '1rem', cursor: 'pointer' }}>
                    Logout & Retry
                </button>
                <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none' }}>Go Back Home</Link>
            </div>
        </div>
    );
};

export default Unauthorized;
