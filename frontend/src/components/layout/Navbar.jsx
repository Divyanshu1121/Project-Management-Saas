import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const { user } = useAuth();

    return (
        <div className="navbar">
            <div className="navbar-left">
                {/* Breadcrumbs or Title could go here */}
                <h3>Workspace</h3>
            </div>
            <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="user-info">
                    <span style={{ fontWeight: 500 }}>{user?.name}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--secondary-color)', display: 'block' }}>{user?.role}</span>
                </div>
                <div className="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {user?.name?.charAt(0)}
                </div>
            </div>
        </div>
    );
};

export default Navbar;
