import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import NotificationCenter from './NotificationCenter';
import CommandPalette from '../common/CommandPalette';
import { useAuth } from '../../context/AuthContext';
import { Command } from 'lucide-react';
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

    return (
        <div className="layout-container">
            <Sidebar />

            <div className="main-content">
                {/* ── Top Bar ── */}
                {user && (
                    <div className="topbar">
                        {/* Breadcrumb */}
                        <div className="topbar-breadcrumb">
                            {crumbs.map((crumb, i) => (
                                <React.Fragment key={i}>
                                    {i > 0 && <span style={{ color: '#cbd5e1', fontSize: '0.72rem' }}>/</span>}
                                    <span style={{ color: i === crumbs.length - 1 ? '#1e293b' : '#94a3b8', fontWeight: i === crumbs.length - 1 ? 600 : 400, fontSize: '0.875rem', textTransform: 'capitalize' }}>
                                        {crumb}
                                    </span>
                                </React.Fragment>
                            ))}
                        </div>

                        {/* Right side */}
                        <div className="topbar-right">
                            {/* Ctrl+K trigger */}
                            <button
                                onClick={() => setCmdOpen(true)}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.875rem', borderRadius: '0.5rem', border: '1.5px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 500, color: '#94a3b8', transition: 'all 0.15s' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; e.currentTarget.style.background = '#eef2ff'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = '#f8fafc'; }}
                            >
                                <Command size={12} />
                                <span>Search</span>
                                <kbd style={{ padding: '0.1rem 0.35rem', borderRadius: '0.25rem', background: 'white', border: '1px solid #e2e8f0', fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8' }}>⌘K</kbd>
                            </button>

                            {/* User greeting */}
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>
                                Hi, <strong style={{ color: '#1e293b' }}>{user.name?.split(' ')[0]}</strong>
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
