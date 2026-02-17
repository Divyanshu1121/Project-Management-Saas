import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Shield, Hash } from 'lucide-react';

const ProfileView = () => {
    const { user } = useAuth();

    if (!user) return <div>Loading profile...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>
                My Profile
            </h2>

            <div style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem'
            }}>
                {/* Header Section with Avatar */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    paddingBottom: '2rem',
                    borderBottom: '1px solid #f1f5f9'
                }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        background: '#eff6ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2563eb',
                        border: '4px solid white',
                        boxShadow: '0 0 0 2px #dbeafe'
                    }}>
                        <span style={{ fontSize: '2.5rem', fontWeight: 600 }}>
                            {user.name?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
                            {user.name}
                        </h3>
                        <span style={{
                            display: 'inline-block',
                            marginTop: '0.5rem',
                            padding: '0.25rem 0.75rem',
                            background: '#f1f5f9',
                            color: '#475569',
                            borderRadius: '999px',
                            fontSize: '0.875rem',
                            fontWeight: 500
                        }}>
                            {user.role}
                        </span>
                    </div>
                </div>

                {/* Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <div className="profile-field">
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#64748b', marginBottom: '0.5rem' }}>
                            Full Name
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                            <User size={18} color="#94a3b8" />
                            <span style={{ color: '#334155', fontWeight: 500 }}>{user.name}</span>
                        </div>
                    </div>

                    <div className="profile-field">
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#64748b', marginBottom: '0.5rem' }}>
                            Email Address
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                            <Mail size={18} color="#94a3b8" />
                            <span style={{ color: '#334155', fontWeight: 500 }}>{user.email}</span>
                        </div>
                    </div>

                    <div className="profile-field">
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#64748b', marginBottom: '0.5rem' }}>
                            User Role
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                            <Shield size={18} color="#94a3b8" />
                            <span style={{ color: '#334155', fontWeight: 500 }}>{user.role}</span>
                        </div>
                    </div>

                    <div className="profile-field">
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#64748b', marginBottom: '0.5rem' }}>
                            User ID
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                            <Hash size={18} color="#94a3b8" />
                            <span style={{ color: '#334155', fontWeight: 500, fontFamily: 'monospace' }}>{user.id || user._id}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;
