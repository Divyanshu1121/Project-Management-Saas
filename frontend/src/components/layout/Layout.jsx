import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import NotificationCenter from './NotificationCenter';
import CommandPalette from '../common/CommandPalette';
import ThemeSwitcher from '../common/ThemeSwitcher';
import { useAuth } from '../../context/AuthContext';
import { Command, Menu, X } from 'lucide-react';
import './layout.css';

/* ── Breadcrumb from URL path ─────────────────────────────── */
const ROUTE_LABELS = {
    manager: 'Dashboard', projects: 'Projects', tasks: 'Tasks',
    kanban: 'Kanban', team: 'Team', workload: 'Workload',
    reports: 'Reports', 'timeline-calendar': 'Calendar',
    chat: 'Chat', settings: 'Settings',
    employee: 'Dashboard', 'time-logs': 'Time Logs',
    leave: 'My Leave', admin: 'Admin', users: 'Users',
};

const useBreadcrumb = () => {
    const { pathname } = useLocation();
    return pathname.split('/').filter(Boolean)
        .map(s => ROUTE_LABELS[s] || (s.length === 24 ? null : s))
        .filter(Boolean);
};

/* ── Layout ───────────────────────────────────────────────── */
const Layout = () => {
    const { user } = useAuth();
    const crumbs = useBreadcrumb();
    const [cmdOpen, setCmdOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);       // mobile drawer
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        return localStorage.getItem('pm-sidebar-collapsed') === 'true';
    }); // desktop collapse
    const location = useLocation();

    /* Persist collapsed state */
    useEffect(() => {
        localStorage.setItem('pm-sidebar-collapsed', sidebarCollapsed);
    }, [sidebarCollapsed]);

    /* Global Ctrl+K shortcut */
    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setCmdOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    /* Close sidebar on desktop resize */
    useEffect(() => {
        const handleResize = () => { if (window.innerWidth > 1024) setSidebarOpen(false); };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    /* Hide sidebar on route change (mobile) */
    useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

    return (
        <div className="layout-container">
            {/* Mobile backdrop */}
            {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                isCollapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
            />

            <div className="main-content">
                {/* ── Top Bar ── */}
                {user && (
                    <div className="topbar">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {/* Mobile hamburger */}
                            <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>

                            {/* Breadcrumb */}
                            <div className="topbar-breadcrumb">
                                {crumbs.map((crumb, i) => (
                                    <React.Fragment key={i}>
                                        {i > 0 && <span className="crumb-sep">/</span>}
                                        <span className={i === crumbs.length - 1 ? 'crumb-active' : 'crumb-inactive'}>
                                            {crumb}
                                        </span>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        {/* Right side */}
                        <div className="topbar-right">
                            {/* Ctrl+K search trigger */}
                            <button
                                className="topbar-search-btn"
                                onClick={() => setCmdOpen(true)}
                                id="cmd-palette-trigger"
                            >
                                <Command size={12} />
                                <span className="topbar-search-text">Search</span>
                                <kbd className="topbar-search-kbd">⌘K</kbd>
                            </button>

                            {/* Theme Switcher */}
                            <ThemeSwitcher />

                            {/* User greeting */}
                            <span className="topbar-greeting">
                                Hi, <strong>{user.name?.split(' ')[0]}</strong>
                            </span>

                            <NotificationCenter />
                        </div>
                    </div>
                )}

                {/* ── Page Content ── */}
                <div className="page-content">
                    <Outlet />
                </div>
            </div>

            {/* ── Command Palette (global) ── */}
            <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
        </div>
    );
};


export default Layout;
