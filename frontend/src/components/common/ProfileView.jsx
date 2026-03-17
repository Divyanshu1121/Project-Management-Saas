import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Shield, Hash } from 'lucide-react';

const ProfileView = () => {
    const { user } = useAuth();

    if (!user) return <div>Loading profile...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 className="profile-title">My Profile</h2>

            <div className="profile-card">
                <div className="profile-header">
                    <div className="profile-avatar">
                        <span>{user.name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="profile-info">
                        <h3>{user.name}</h3>
                        <span className="profile-role-badge">{user.role}</span>
                    </div>
                </div>

                <div className="profile-grid">
                    <div className="profile-field">
                        <label>Full Name</label>
                        <div className="field-value">
                            <User size={18} color="#94a3b8" />
                            <span>{user.name}</span>
                        </div>
                    </div>

                    <div className="profile-field">
                        <label>Email Address</label>
                        <div className="field-value">
                            <Mail size={18} color="#94a3b8" />
                            <span>{user.email}</span>
                        </div>
                    </div>

                    <div className="profile-field">
                        <label>User Role</label>
                        <div className="field-value">
                            <Shield size={18} color="#94a3b8" />
                            <span>{user.role}</span>
                        </div>
                    </div>

                    <div className="profile-field">
                        <label>User ID</label>
                        <div className="field-value">
                            <Hash size={18} color="#94a3b8" />
                            <span style={{ fontFamily: 'monospace' }}>{user.id || user._id}</span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .profile-title { margin-bottom: 2rem; font-size: 1.5rem; font-weight: 700; color: #1e293b; }
                .profile-card {
                    background: white; border-radius: 1rem; padding: 2rem;
                    box-shadow: var(--shadow-sm); display: flex; flex-direction: column; gap: 2rem;
                    border: 1px solid #e2e8f0;
                }
                .profile-header {
                    display: flex; align-items: center; gap: 1.5rem;
                    padding-bottom: 2rem; border-bottom: 1px solid #f1f5f9;
                }
                .profile-avatar {
                    width: 100px; height: 100px; border-radius: 50%; background: #eff6ff;
                    display: flex; align-items: center; justify-content: center;
                    color: #2563eb; border: 4px solid white; box-shadow: 0 0 0 2px #dbeafe;
                    flex-shrink: 0;
                }
                .profile-avatar span { font-size: 2.5rem; font-weight: 600; }
                .profile-info h3 { margin: 0; font-size: 1.5rem; font-weight: 700; color: #0f172a; }
                .profile-role-badge {
                    display: inline-block; margin-top: 0.5rem; padding: 0.25rem 0.75rem;
                    background: #f1f5f9; color: #475569; border-radius: 999px;
                    font-size: 0.875rem; font-weight: 500;
                }
                .profile-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
                .profile-field label { display: block; font-size: 0.875rem; font-weight: 500; color: #64748b; margin-bottom: 0.5rem; }
                .field-value {
                    display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem;
                    background: #f8fafc; border-radius: 0.5rem; border: 1px solid #e2e8f0;
                }
                .field-value span { color: #334155; font-weight: 500; }

                @media (max-width: 640px) {
                    .profile-header { flex-direction: column; text-align: center; gap: 1rem; }
                    .profile-card { padding: 1.25rem; gap: 1.5rem; }
                    .profile-grid { grid-template-columns: 1fr; }
                    .profile-title { margin-bottom: 1.25rem; font-size: 1.25rem; text-align: center; }
                }
            `}</style>

        </div>
    );
};


export default ProfileView;
