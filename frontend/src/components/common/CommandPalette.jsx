import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, Briefcase, ListTodo, Users, Kanban,
    Calendar, Activity, BarChart2, MessageSquare, Settings,
    Plus, Search, ArrowRight, Command, Flag, ShieldCheck, Clock
} from 'lucide-react';

/* ── Kbd chip ─────────────────────────────────────────────── */
const KbdChip = ({ k }) => (
    <kbd style={{
        padding: '0.12rem 0.4rem', borderRadius: 'var(--r-sm)',
        background: 'var(--surface-2)', border: '1px solid var(--surface-border)',
        fontSize: 'var(--text-2xs)', fontWeight: 700, color: 'var(--clr-slate-500)',
        fontFamily: 'var(--font-mono)',
    }}>{k}</kbd>
);

/* ── Main component ───────────────────────────────────────── */
const CommandPalette = ({ open, onClose }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [query, setQuery] = useState('');
    const [activeIdx, setActive] = useState(0);
    const inputRef = useRef(null);

    const commands = useMemo(() => {
        if (!user) return [];
        const role = user.role;
        const isOwner = ['COMPANY_OWNER', 'CEO', 'CTO', 'CFO', 'COO'].includes(role);

        let list = [];

        if (role === 'PROJECT_MANAGER') {
            list = [
                { id: 'g-dash', group: 'Go to', label: 'Dashboard', icon: LayoutDashboard, path: '/manager', kbd: 'G D' },
                { id: 'g-projects', group: 'Go to', label: 'Projects', icon: Briefcase, path: '/manager/projects', kbd: 'G P' },
                { id: 'g-tasks', group: 'Go to', label: 'Tasks', icon: ListTodo, path: '/manager/tasks', kbd: 'G T' },
                { id: 'g-kanban', group: 'Go to', label: 'Kanban Board', icon: Kanban, path: '/manager/kanban', kbd: 'G K' },
                { id: 'g-team', group: 'Go to', label: 'Team', icon: Users, path: '/manager/team' },
                { id: 'g-workload', group: 'Go to', label: 'Workload', icon: Activity, path: '/manager/workload' },
                { id: 'g-cal', group: 'Go to', label: 'Calendar / Timeline', icon: Calendar, path: '/manager/timeline-calendar', kbd: 'G C' },
                { id: 'g-reports', group: 'Go to', label: 'Reports', icon: BarChart2, path: '/manager/reports' },
                { id: 'c-project', group: 'Create', label: 'New Project', icon: Plus, path: '/manager/projects' },
                { id: 'c-task', group: 'Create', label: 'New Task', icon: Plus, path: '/manager/tasks' },
                { id: 'c-sprint', group: 'Create', label: 'New Sprint', icon: Flag, path: '/manager/projects' },
            ];
        } else if (isOwner) {
            list = [
                { id: 'g-dash', group: 'Go to', label: 'Dashboard', icon: LayoutDashboard, path: '/company', kbd: 'G D' },
                { id: 'g-execs', group: 'Go to', label: 'C-Executives', icon: ShieldCheck, path: '/company/c-executives' },
                { id: 'g-teams', group: 'Go to', label: 'Teams', icon: Users, path: '/company/teams', kbd: 'G T' },
                { id: 'g-projects', group: 'Go to', label: 'Projects', icon: Briefcase, path: '/company/projects', kbd: 'G P' },
                { id: 'g-tasks', group: 'Go to', label: 'Tasks', icon: ListTodo, path: '/company/tasks' },
                { id: 'g-reports', group: 'Go to', label: 'Reports', icon: BarChart2, path: '/company/reports' },
            ];
        } else if (role === 'HR') {
            list = [
                { id: 'g-dash', group: 'Go to', label: 'Dashboard', icon: LayoutDashboard, path: '/hr', kbd: 'G D' },
                { id: 'g-emps', group: 'Go to', label: 'Employees', icon: Users, path: '/hr/employees', kbd: 'G E' },
                { id: 'g-lead', group: 'Go to', label: 'Leadership', icon: ShieldCheck, path: '/hr/leadership' },
                { id: 'g-leaves', group: 'Go to', label: 'Leaves', icon: Calendar, path: '/hr/leaves', kbd: 'G L' },
            ];
        } else if (role === 'EMPLOYEE') {
            list = [
                { id: 'g-dash', group: 'Go to', label: 'Dashboard', icon: LayoutDashboard, path: '/employee', kbd: 'G D' },
                { id: 'g-time', group: 'Go to', label: 'Time Logs', icon: Clock, path: '/employee/time-logs', kbd: 'G T' },
                { id: 'g-leave', group: 'Go to', label: 'My Leave', icon: Calendar, path: '/employee/leave', kbd: 'G L' },
            ];
        } else if (role === 'SUPER_ADMIN') {
            list = [
                { id: 'g-dash', group: 'Go to', label: 'Dashboard', icon: LayoutDashboard, path: '/admin', kbd: 'G D' },
                { id: 'g-users', group: 'Go to', label: 'Users', icon: Users, path: '/admin/users', kbd: 'G U' },
            ];
        }

        // Common
        if (['PROJECT_MANAGER', 'EMPLOYEE', 'HR'].includes(role)) {
            list.push({ id: 'g-chat', group: 'Go to', label: 'Global Chat', icon: MessageSquare, path: '/chat' });
        }

        const settingsPath = role === 'SUPER_ADMIN' ? '/admin/settings' : isOwner ? '/company/settings' : '/settings';
        list.push({ id: 'g-settings', group: 'Go to', label: 'Settings', icon: Settings, path: settingsPath });

        return list;
    }, [user]);

    /* Filter + group */
    const q = query.trim().toLowerCase();
    const filtered = q
        ? commands.filter(c => c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q))
        : commands;
    const grouped = filtered.reduce((acc, cmd) => {
        (acc[cmd.group] = acc[cmd.group] || []).push(cmd);
        return acc;
    }, {});
    const flat = Object.values(grouped).flat();

    /* Reset on open */
    useEffect(() => {
        if (open) { setQuery(''); setActive(0); setTimeout(() => inputRef.current?.focus(), 40); }
    }, [open]);
    useEffect(() => setActive(0), [query]);

    const execute = useCallback((cmd) => {
        onClose();
        navigate(cmd.path);
    }, [navigate, onClose]);

    const handleKey = (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setActive(i => Math.min(i + 1, flat.length - 1)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(i => Math.max(i - 1, 0)); }
        else if (e.key === 'Enter' && flat[activeIdx]) execute(flat[activeIdx]);
        else if (e.key === 'Escape') onClose();
    };

    if (!open) return null;

    return (
        <>
            {/* Backdrop */}
            <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(6px)', zIndex: 990, animation: 'ds-fade-in 150ms ease' }} />

            {/* Panel */}
            <div style={{ position: 'fixed', top: '16vh', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 580, zIndex: 1000, animation: 'ds-scale-in 160ms cubic-bezier(0.16,1,0.3,1)', padding: '0 1rem' }} onKeyDown={handleKey}>
                <div style={{ background: 'var(--card-bg, white)', borderRadius: 'var(--r-xl)', boxShadow: '0 24px 80px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.10)', border: '1px solid var(--card-border, var(--surface-border))', overflow: 'hidden' }}>

                    {/* Input row */}
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0.875rem 1rem', borderBottom: '1px solid var(--surface-subtle)', gap: '0.65rem' }}>
                        <Search size={16} color="var(--clr-slate-400)" style={{ flexShrink: 0 }} />
                        <input
                            ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
                            placeholder="Search pages, create actions…"
                            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 'var(--text-md)', color: 'var(--text-primary, var(--clr-slate-800))', fontFamily: 'var(--font-sans)', fontWeight: 500 }}
                        />
                        <KbdChip k="ESC" />
                    </div>

                    {/* Results */}
                    <div style={{ maxHeight: 400, overflowY: 'auto', padding: '0.5rem' }}>
                        {flat.length === 0 ? (
                            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--clr-slate-400)' }}>
                                <Search size={20} style={{ margin: '0 auto 0.5rem', opacity: 0.35, display: 'block' }} />
                                <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>No results for "{query}"</p>
                            </div>
                        ) : Object.entries(grouped).map(([group, items]) => (
                            <div key={group}>
                                <div style={{ padding: '0.4rem 0.75rem 0.25rem', fontSize: 'var(--text-2xs)', fontWeight: 700, color: 'var(--clr-slate-400)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    {group}
                                </div>
                                {items.map(cmd => {
                                    const gi = flat.indexOf(cmd);
                                    const active = gi === activeIdx;
                                    const Icon = cmd.icon;
                                    return (
                                        <div
                                            key={cmd.id}
                                            onClick={() => execute(cmd)}
                                            onMouseEnter={() => setActive(gi)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                                padding: '0.6rem 0.875rem', borderRadius: 'var(--r-md)',
                                                cursor: 'pointer', marginBottom: '0.1rem',
                                                background: active ? 'var(--theme-option-active-bg, var(--clr-primary-50))' : 'transparent',
                                                color: active ? 'var(--theme-option-active-text, var(--clr-primary-600))' : 'var(--text-secondary, var(--clr-slate-700))',
                                                transition: 'background var(--t-fast)',
                                            }}
                                        >
                                            <div style={{ width: 30, height: 30, borderRadius: 'var(--r-sm)', background: active ? 'var(--card-bg, white)' : 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background var(--t-fast)', boxShadow: active ? 'var(--sh-xs)' : 'none' }}>
                                                <Icon size={14} />
                                            </div>
                                            <span style={{ flex: 1, fontSize: 'var(--text-base)', fontWeight: active ? 600 : 500 }}>{cmd.label}</span>
                                            {cmd.kbd && (
                                                <div style={{ display: 'flex', gap: '0.2rem' }}>
                                                    {cmd.kbd.split(' ').map((k, i) => <KbdChip key={i} k={k} />)}
                                                </div>
                                            )}
                                            <ArrowRight size={12} style={{ opacity: active ? 1 : 0, transition: 'opacity var(--t-fast)', flexShrink: 0 }} />
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {/* Footer hints */}
                    <div style={{ padding: '0.6rem 1rem', borderTop: '1px solid var(--surface-subtle)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        {[['↑ ↓', 'Navigate'], ['↵', 'Open'], ['Esc', 'Close']].map(([k, l]) => (
                            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: 'var(--text-xs)', color: 'var(--clr-slate-400)' }}>
                                <KbdChip k={k} /><span>{l}</span>
                            </div>
                        ))}
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: 'var(--text-xs)', color: 'var(--clr-slate-300)' }}>
                            <Command size={11} /><span>Command Center</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CommandPalette;
