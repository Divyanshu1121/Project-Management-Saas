import React from 'react';
import ProfileView from '../../components/common/ProfileView';

const SettingsPage = () => {
    return (
        <div className="settings-page-container">
            <ProfileView />
            <style>{`
                .settings-page-container { padding: 2rem; }
                @media (max-width: 640px) { .settings-page-container { padding: 1rem 0.5rem; } }
            `}</style>
        </div>
    );
};


export default SettingsPage;
