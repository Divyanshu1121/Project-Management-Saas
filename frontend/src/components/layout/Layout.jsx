import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './layout.css';

const Layout = () => {
    return (
        <div className="layout-container">
            <Sidebar />
            <div className="main-content">
                <div className="page-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Layout;
