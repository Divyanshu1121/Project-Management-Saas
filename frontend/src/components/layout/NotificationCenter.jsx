import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import {
    Bell, X, CheckCheck, Trash2, Check, ExternalLink,
    Briefcase, ListTodo, MessageSquare, Clock, Zap, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TYPE_META = {
    TASK_ASSIGNED: { icon: <ListTodo size={14} />, color: '#6366f1', bg: '#eef2ff' },
    TASK_UPDATED: { icon: <ListTodo size={14} />, color: '#f59e0b', bg: '#fffbeb' },
    TASK_APPROVED: { icon: <Check size={14} />, color: '#10b981', bg: '#ecfdf5' },
    TASK_REJECTED: { icon: <X size={14} />, color: '#ef4444', bg: '#fef2f2' },
    TASK_SUBMITTED: { icon: <ListTodo size={14} />, color: '#8b5cf6', bg: '#f5f3ff' },
    TASK_DEADLINE: { icon: <Clock size={14} />, color: '#f97316', bg: '#fff7ed' },
    SPRINT_STARTED: { icon: <Zap size={14} />, color: '#06b6d4', bg: '#ecfeff' },
    SPRINT_COMPLETED: { icon: <Zap size={14} />, color: '#10b981', bg: '#ecfdf5' },
    MENTION: { icon: <MessageSquare size={14} />, color: '#ec4899', bg: '#fdf2f8' },
    PROJECT_CREATED: { icon: <Briefcase size={14} />, color: '#2563eb', bg: '#eff6ff' },
    PROJECT_COMPLETED: { icon: <Briefcase size={14} />, color: '#10b981', bg: '#ecfdf5' },
    LEAVE_APPROVED: { icon: <Check size={14} />, color: '#10b981', bg: '#ecfdf5' },
    LEAVE_REJECTED: { icon: <X size={14} />, color: '#ef4444', bg: '#fef2f2' },
    GENERAL: { icon: <Info size={14} />, color: '#64748b', bg: '#f1f5f9' },
};

const DEFAULT_META = { icon: <Bell size={14} />, color: '#64748b', bg: '#f1f5f9' };

const relativeTime = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const NotifRow = ({ notif, onRead, onDelete, onNavigate }) => {
    const meta = TYPE_META[notif.type] || DEFAULT_META;
    const isUnread = !notif.isRead;

    return (
        <div
            style={{
                display: 'flex', gap: '0.75rem', padding: '0.75rem 1rem',
                background: isUnread ? '#fafbff' : 'white',
                borderBottom: '1px solid #f1f5f9',
                cursor: 'pointer',
                transition: 'background 0.15s',
                position: 'relative',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
            onMouseLeave={e => e.currentTarget.style.background = isUnread ? '#fafbff' : 'white'}
            onClick={() => {
                if (isUnread) onRead(notif._id);
                if (notif.link) onNavigate(notif.link);
            }}
        >
            {isUnread && (
                <div style={{
                    position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                    width: 6, height: 6, borderRadius: '50%', background: '#6366f1',
                }} />
            )}

            <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: meta.bg, color: meta.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginLeft: isUnread ? 8 : 0,
            }}>
                {meta.icon}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                    margin: '0 0 0.2rem', fontWeight: isUnread ? 600 : 500,
                    fontSize: '0.825rem', color: '#1e293b',
                    lineHeight: 1.35, wordBreak: 'break-word',
                }}>
                    {notif.title}
                </p>
                <p style={{
                    margin: '0 0 0.375rem', fontSize: '0.75rem',
                    color: '#64748b', lineHeight: 1.4, wordBreak: 'break-word',
                }}>
                    {notif.message}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        {relativeTime(notif.createdAt)}
                    </span>
                    {notif.link && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '0.7rem', color: '#6366f1' }}>
                            <ExternalLink size={9} /> View
                        </span>
                    )}
                </div>
            </div>

            <button
                onClick={(e) => { e.stopPropagation(); onDelete(notif._id); }}
                style={{
                    width: 24, height: 24, borderRadius: '50%', border: 'none',
                    background: 'transparent', cursor: 'pointer', color: '#cbd5e1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'color 0.15s, background 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.background = 'transparent'; }}
                title="Dismiss"
            >
                <X size={11} />
            </button>
        </div>
    );
};

const NotificationCenter = () => {
    const {
        notifications, unreadCount, loading,
        markAsRead, markAllAsRead, deleteNotification, clearAll, fetchNotifications,
    } = useNotifications();

    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState('all');
    const panelRef = useRef(null);
    const bellRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handler = (e) => {
            if (
                panelRef.current && !panelRef.current.contains(e.target) &&
                bellRef.current && !bellRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filtered = filter === 'unread'
        ? notifications.filter(n => !n.isRead)
        : notifications;

    const handleOpen = () => {
        const nextOpen = !open;
        setOpen(nextOpen);
        if (nextOpen) fetchNotifications();
    };

    return (
        <div style={{ position: 'relative' }}>
            <button
                ref={bellRef}
                onClick={handleOpen}
                style={{
                    position: 'relative', width: 38, height: 38,
                    border: open ? '1.5px solid #6366f1' : '1.5px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    background: open ? '#eef2ff' : 'white',
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center',
                    color: open ? '#6366f1' : '#64748b',
                    transition: 'all 0.15s',
                    boxShadow: open ? '0 2px 8px rgba(99,102,241,0.2)' : 'none',
                }}
                onMouseEnter={e => {
                    if (!open) {
                        e.currentTarget.style.borderColor = '#c7d2fe';
                        e.currentTarget.style.color = '#6366f1';
                        e.currentTarget.style.background = '#eef2ff';
                    }
                }}
                onMouseLeave={e => {
                    if (!open) {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.color = '#64748b';
                        e.currentTarget.style.background = 'white';
                    }
                }}
                title="Notifications"
                aria-label="Open notifications"
            >
                <Bell size={18} style={{ animation: unreadCount > 0 ? 'bell-shake 2s ease infinite' : 'none' }} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: -5, right: -5,
                        minWidth: 18, height: 18, borderRadius: '9px',
                        background: '#ef4444', color: 'white',
                        fontSize: '0.65rem', fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '0 4px', border: '2px solid white',
                        lineHeight: 1,
                    }}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div
                    ref={panelRef}
                    style={{
                        position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                        width: 380, maxHeight: 520,
                        background: 'white', borderRadius: '1rem',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                        border: '1.5px solid #e2e8f0',
                        display: 'flex', flexDirection: 'column',
                        overflow: 'hidden', zIndex: 9999,
                        animation: 'panel-in 0.18s ease',
                    }}
                >
                    <div style={{
                        padding: '1rem 1rem 0.75rem',
                        borderBottom: '1px solid #f1f5f9',
                        flexShrink: 0,
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{
                                    width: 28, height: 28, borderRadius: '0.5rem',
                                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white',
                                }}>
                                    <Bell size={14} />
                                </div>
                                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>
                                    Notifications
                                </span>
                                {unreadCount > 0 && (
                                    <span style={{
                                        background: '#6366f1', color: 'white',
                                        borderRadius: '2rem', padding: '0.1rem 0.5rem',
                                        fontSize: '0.7rem', fontWeight: 700,
                                    }}>{unreadCount} new</span>
                                )}
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                style={{
                                    width: 26, height: 26, border: 'none', background: 'transparent',
                                    cursor: 'pointer', color: '#94a3b8', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'background 0.15s, color 0.15s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#1e293b'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                            >
                                <X size={14} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.25rem', background: '#f1f5f9', borderRadius: '0.375rem', padding: '0.2rem' }}>
                                {['all', 'unread'].map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        style={{
                                            padding: '0.25rem 0.625rem', border: 'none', borderRadius: '0.25rem',
                                            fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                                            background: filter === f ? 'white' : 'transparent',
                                            color: filter === f ? '#1e293b' : '#64748b',
                                            boxShadow: filter === f ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                                            transition: 'all 0.15s', textTransform: 'capitalize',
                                        }}
                                    >
                                        {f === 'unread' ? `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}` : 'All'}
                                    </button>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        title="Mark all as read"
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.25rem',
                                            padding: '0.3rem 0.6rem', border: 'none',
                                            background: 'transparent', cursor: 'pointer',
                                            color: '#6366f1', fontSize: '0.75rem', fontWeight: 600,
                                            borderRadius: '0.375rem',
                                            transition: 'background 0.15s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#eef2ff'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <CheckCheck size={13} /> Mark all read
                                    </button>
                                )}
                                {notifications.length > 0 && (
                                    <button
                                        onClick={clearAll}
                                        title="Clear all notifications"
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.25rem',
                                            padding: '0.3rem 0.6rem', border: 'none',
                                            background: 'transparent', cursor: 'pointer',
                                            color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600,
                                            borderRadius: '0.375rem',
                                            transition: 'background 0.15s, color 0.15s',
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                                    >
                                        <Trash2 size={12} /> Clear all
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ overflowY: 'auto', flex: 1 }} className="notif-list">
                        {loading ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem', color: '#94a3b8', fontSize: '0.875rem', gap: '0.5rem' }}>
                                <div style={{ width: 16, height: 16, border: '2px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                Loading...
                            </div>
                        ) : filtered.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 1.5rem', textAlign: 'center' }}>
                                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: '#cbd5e1' }}>
                                    <Bell size={22} />
                                </div>
                                <p style={{ margin: 0, fontWeight: 600, color: '#64748b', fontSize: '0.9rem' }}>
                                    {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
                                </p>
                                <p style={{ margin: '0.375rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                                    {filter === 'unread' ? 'No unread notifications.' : "You'll see alerts here when something happens."}
                                </p>
                            </div>
                        ) : (
                            filtered.map(notif => (
                                <NotifRow
                                    key={notif._id}
                                    notif={notif}
                                    onRead={markAsRead}
                                    onDelete={deleteNotification}
                                    onNavigate={(link) => { navigate(link); setOpen(false); }}
                                />
                            ))
                        )}
                    </div>

                    {filtered.length > 0 && (
                        <div style={{
                            padding: '0.625rem 1rem', borderTop: '1px solid #f1f5f9',
                            textAlign: 'center', flexShrink: 0,
                            background: '#fafbff',
                        }}>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                {notifications.length} total notification{notifications.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    )}
                </div>
            )}

            <style>{`
                @keyframes bell-shake {
                    0%, 100% { transform: rotate(0deg); }
                    10%, 30%, 50%, 70% { transform: rotate(-8deg); }
                    20%, 40%, 60%, 80% { transform: rotate(8deg); }
                    90% { transform: rotate(-4deg); }
                }
                @keyframes panel-in {
                    from { opacity: 0; transform: translateY(-8px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .notif-list::-webkit-scrollbar { width: 5px; }
                .notif-list::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
                .notif-list:hover::-webkit-scrollbar-thumb { background: #cbd5e1; }
            `}</style>
        </div>
    );
};

export default NotificationCenter;
