import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import './layout.css'; // We will create this

const Layout = () => {
    return (
        <div className="layout-container">
            <Sidebar />
            <div className="main-content">
                <Navbar />
                <div className="page-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Layout;
