import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import NotificationCenter from './NotificationCenter';
import { useAuth } from '../../context/AuthContext';
import './layout.css';

const Layout = () => {
    const { user } = useAuth();

    return (
        <div className="layout-container">
            <Sidebar />
            <div className="main-content">
                {/* Top bar */}
                {user && (
                    <div style={{
                        height: 52, flexShrink: 0,
                        background: 'white',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'flex-end',
                        padding: '0 1.5rem', gap: '0.75rem',
                    }}>
                        <NotificationCenter />
                    </div>
                )}
                <div className="page-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Layout;

