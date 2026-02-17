import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import './layout.css';

const Layout = () => {
    const location = useLocation();
    const isCompanyPanel = location.pathname.startsWith('/company');

    return (
        <div className="layout-container">
            {!isCompanyPanel && <Sidebar />}
            <div className="main-content">
                {!isCompanyPanel && <Navbar />}
                <div className="page-content" style={isCompanyPanel ? { padding: 0 } : {}}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Layout;
