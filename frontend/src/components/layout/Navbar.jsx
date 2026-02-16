import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    return (
        <div className="navbar" style={{ position: 'relative', zIndex: 50 }}>
            <div className="navbar-left">
                <h3>{user.companyId?.name || 'Workspace'}</h3>
            </div>

            <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                    onClick={() => setShowDropdown(!showDropdown)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer',
                        padding: '0.25rem 0.5rem', borderRadius: '8px', transition: 'background 0.2s',
                        backgroundColor: showDropdown ? '#f3f4f6' : 'transparent'
                    }}
                >
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1f2937' }}>{user.name}</span>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'capitalize' }}>{user.role.replace('_', ' ').toLowerCase()}</span>
                    </div>
                    <div className="avatar" style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        backgroundColor: '#3b82f6', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', fontSize: '1.2rem'
                    }}>
                        {user.name?.charAt(0).toUpperCase()}
                    </div>
                </div>

                {showDropdown && (
                    <div ref={dropdownRef} style={{
                        position: 'absolute', top: '60px', right: '20px', width: '220px',
                        backgroundColor: 'white', borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        border: '1px solid #e5e7eb', overflow: 'hidden',
                        animation: 'fadeIn 0.2s ease-out'
                    }}>
                        <div style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6', backgroundColor: '#f9fafb' }}>
                            <p style={{ fontWeight: 'bold', color: '#111827', margin: 0 }}>{user.name}</p>
                            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.email}</p>
                        </div>
                        <ul style={{ listStyle: 'none', padding: '0.5rem 0', margin: 0 }}>
                            <li>
                                <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', color: '#374151', textDecoration: 'none', transition: 'bg 0.2s' }} className="dropdown-item">
                                    <User size={16} /> Profile
                                </Link>
                            </li>
                            <li>
                                <Link to="/settings" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', color: '#374151', textDecoration: 'none', transition: 'bg 0.2s' }} className="dropdown-item">
                                    <Settings size={16} /> Settings
                                </Link>
                            </li>
                            <li style={{ borderTop: '1px solid #f3f4f6', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                                <button onClick={logout} style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }} className="dropdown-item">
                                    <LogOut size={16} /> Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Navbar;
