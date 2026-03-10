import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import {
    PlusCircle, RefreshCw, CheckCircle2, XCircle,
    ArrowRightLeft, UserCheck, UserMinus, Calendar,
    Zap, Flag, Trash2, FolderOpen, FolderCheck,
    AlertCircle, Activity, ChevronDown, Edit3
} from 'lucide-react';

const ACTION_META = {
    TASK_CREATED: { icon: PlusCircle, color: '#6366f1', bg: '#eef2ff', label: 'Created task' },
    TASK_UPDATED: { icon: Edit3, color: '#f59e0b', bg: '#fffbeb', label: 'Updated task' },
    TASK_STATUS_CHANGED: { icon: ArrowRightLeft, color: '#0ea5e9', bg: '#f0f9ff', label: 'Status changed' },
    TASK_ASSIGNED: { icon: UserCheck, color: '#10b981', bg: '#ecfdf5', label: 'Assigned' },
    TASK_UNASSIGNED: { icon: UserMinus, color: '#94a3b8', bg: '#f8fafc', label: 'Unassigned' },
    TASK_DEADLINE_UPDATED: { icon: Calendar, color: '#f97316', bg: '#fff7ed', label: 'Deadline changed' },
    TASK_APPROVED: { icon: CheckCircle2, color: '#16a34a', bg: '#dcfce7', label: 'Approved' },
    TASK_REJECTED: { icon: XCircle, color: '#dc2626', bg: '#fef2f2', label: 'Rejected' },
    TASK_SUBMITTED: { icon: Zap, color: '#7c3aed', bg: '#f5f3ff', label: 'Submitted' },
    TASK_DELETED: { icon: Trash2, color: '#ef4444', bg: '#fef2f2', label: 'Deleted' },
    PROJECT_CREATED: { icon: FolderOpen, color: '#2563eb', bg: '#eff6ff', label: 'Project created' },
    PROJECT_UPDATED: { icon: Edit3, color: '#f59e0b', bg: '#fffbeb', label: 'Project updated' },
    PROJECT_COMPLETED: { icon: FolderCheck, color: '#16a34a', bg: '#dcfce7', label: 'Project completed' },
    PROJECT_DELETED: { icon: Trash2, color: '#ef4444', bg: '#fef2f2', label: 'Project deleted' },
    SPRINT_CREATED: { icon: Flag, color: '#8b5cf6', bg: '#f5f3ff', label: 'Sprint created' },
    SPRINT_STARTED: { icon: Zap, color: '#0ea5e9', bg: '#f0f9ff', label: 'Sprint started' },
    SPRINT_COMPLETED: { icon: CheckCircle2, color: '#16a34a', bg: '#dcfce7', label: 'Sprint done' },
    SPRINT_TASK_ASSIGNED: { icon: UserCheck, color: '#10b981', bg: '#ecfdf5', label: 'Sprint task' },
    SPRINT_TASK_REMOVED: { icon: UserMinus, color: '#94a3b8', bg: '#f8fafc', label: 'Sprint task' },
    GENERAL: { icon: AlertCircle, color: '#64748b', bg: '#f8fafc', label: 'Event' },
};
const DEFAULT_META = { icon: Activity, color: '#94a3b8', bg: '#f8fafc', label: 'Event' };

const relativeTime = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const s = Math.floor(diff / 1000);
    if (s < 60) return 'just now';
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d === 1) return 'yesterday';
    if (d < 7) return `${d} days ago`;
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const groupByDate = (logs) => {
    const groups = [];
    let lastDate = null;
    for (const log of logs) {
        const date = new Date(log.createdAt).toDateString();
        if (date !== lastDate) {
            groups.push({ type: 'date', date });
            lastDate = date;
        }
        groups.push({ type: 'log', log });
    }
    return groups;
};

const LogEntry = ({ log, isLast }) => {
    const meta = ACTION_META[log.actionType] || DEFAULT_META;
    const IconComp = meta.icon;

    return (
        <div style={{ display: 'flex', gap: '0.875rem', position: 'relative' }}>
            {/* Vertical line */}
            {!isLast && (
                <div style={{
                    position: 'absolute',
                    left: 15,
                    top: 32,
                    bottom: -20,
                    width: 1.5,
                    background: 'linear-gradient(to bottom, #e2e8f0, transparent)',
                }} />
            )}

            {/* Icon bubble */}
            <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                backgroundColor: meta.bg,
                border: `2px solid white`,
                boxShadow: `0 0 0 1.5px ${meta.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 1,
            }}>
                <IconComp size={14} color={meta.color} />
            </div>

            {/* Content card */}
            <div style={{
                flex: 1, marginBottom: '1.25rem',
                background: 'white',
                border: '1px solid #f1f5f9',
                borderLeft: `3px solid ${meta.color}`,
                borderRadius: '0.625rem',
                padding: '0.75rem 1rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'box-shadow 0.15s',
            }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'}
            >
                {/* Top row: label badge + time */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{
                        fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.06em', color: meta.color,
                        background: meta.bg, padding: '0.15rem 0.5rem',
                        borderRadius: '0.25rem',
                    }}>
                        {meta.label}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>
                        {relativeTime(log.createdAt)}
                    </span>
                </div>

                {/* Message */}
                <p style={{
                    margin: '0 0 0.3rem', fontSize: '0.855rem', color: '#1e293b',
                    lineHeight: 1.5, fontWeight: 500,
                }}>
                    {log.message}
                </p>

                {/* Actor */}
                {log.userId?.name && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{
                            width: 18, height: 18, borderRadius: '50%',
                            background: '#dbeafe', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: '0.6rem', fontWeight: 800, color: '#2563eb',
                            flexShrink: 0,
                        }}>
                            {log.userId.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                            {log.userId.name}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Date section divider ─────────────────────────────────────────────────────
const DateDivider = ({ date }) => {
    const label = date === new Date().toDateString() ? 'Today'
        : date === new Date(Date.now() - 86400000).toDateString() ? 'Yesterday' : date;
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            margin: '0.5rem 0 1rem 0',
        }}>
            <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
            <span style={{
                fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8',
                textTransform: 'uppercase', letterSpacing: '0.07em',
                background: 'white', padding: '0 0.25rem',
                whiteSpace: 'nowrap',
            }}>
                {label}
            </span>
            <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
        </div>
    );
};

// ─── Skeleton rows ────────────────────────────────────────────────────────────
const Skeleton = () => (
    <div style={{ display: 'flex', gap: '0.875rem', marginBottom: '1.25rem' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f1f5f9', flexShrink: 0 }} />
        <div style={{ flex: 1, background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '0.625rem', padding: '0.75rem 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ width: 70, height: 14, background: '#e2e8f0', borderRadius: 4 }} />
                <div style={{ width: 40, height: 12, background: '#e2e8f0', borderRadius: 4 }} />
            </div>
            <div style={{ height: 13, background: '#e2e8f0', borderRadius: 4, marginBottom: 6, width: '85%' }} />
            <div style={{ height: 12, background: '#e2e8f0', borderRadius: 4, width: '45%' }} />
        </div>
    </div>
);

// ─── Main ActivityFeed ────────────────────────────────────────────────────────
/**
 * Props:
 *   mode        — 'project' | 'task' | 'company'
 *   projectId   — required when mode === 'project'
 *   taskId      — required when mode === 'task'
 *   limit       — initial fetch limit (default 20)
 *   title       — panel header text
 *   maxHeight   — CSS max-height of the scrollable list
 *   compact     — if true, no outer card wrapper
 */
const ActivityFeed = ({
    mode = 'project',
    projectId,
    taskId,
    limit = 20,
    title = 'Activity',
    maxHeight = '420px',
    compact = false,
}) => {
    const [logs, setLogs] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [loadingMore, setLoadingMore] = useState(false);

    const fetchLogs = useCallback(async (skip = 0, append = false) => {
        try {
            append ? setLoadingMore(true) : setLoading(true);
            setError(null);

            let endpoint;
            if (mode === 'project') endpoint = `/activity/project/${projectId}?limit=${limit}&skip=${skip}`;
            else if (mode === 'task') endpoint = `/activity/task/${taskId}?limit=${limit}&skip=${skip}`;
            else endpoint = `/activity/company?limit=${limit}`;

            const res = await api.get(endpoint);
            const data = res.data;

            setLogs(prev => append ? [...prev, ...(data.logs || [])] : (data.logs || []));
            setTotal(data.total || data.logs?.length || 0);
        } catch {
            setError('Could not load activity.');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [mode, projectId, taskId, limit]);

    useEffect(() => {
        setLogs([]); setPage(0); fetchLogs(0, false);
    }, [fetchLogs]);

    const loadMore = async () => {
        const nextSkip = (page + 1) * limit;
        setPage(p => p + 1);
        await fetchLogs(nextSkip, true);
    };

    // ── Render content ──────────────────────────────────────────────────────
    const listContent = (
        <div style={{ overflowY: 'auto', maxHeight, padding: '1.25rem 1.25rem 0' }}>
            {loading ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)
            ) : error ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444', fontSize: '0.875rem' }}>
                    {error}
                </div>
            ) : logs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                        <Activity size={20} color="#cbd5e1" />
                    </div>
                    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8' }}>No activity yet</p>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: '#cbd5e1' }}>Actions will appear here as they happen</p>
                </div>
            ) : (
                <>
                    {groupByDate(logs).map((item, i) =>
                        item.type === 'date' ? (
                            <DateDivider key={`d-${i}`} date={item.date} />
                        ) : (
                            <LogEntry
                                key={item.log._id}
                                log={item.log}
                                isLast={i === groupByDate(logs).length - 1}
                            />
                        )
                    )}

                    {logs.length < total && (
                        <div style={{ textAlign: 'center', paddingBottom: '1rem' }}>
                            <button
                                onClick={loadMore}
                                disabled={loadingMore}
                                style={{
                                    padding: '0.45rem 1.25rem',
                                    fontSize: '0.8rem', fontWeight: 600,
                                    borderRadius: '2rem', cursor: loadingMore ? 'not-allowed' : 'pointer',
                                    border: '1.5px solid #e2e8f0',
                                    background: 'white', color: '#64748b',
                                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                    transition: 'all 0.15s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.color = '#2563eb'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}
                            >
                                <ChevronDown size={13} />
                                {loadingMore ? 'Loading…' : `Show ${total - logs.length} more`}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );

    if (compact) return listContent;

    return (
        <div style={{
            background: 'white', borderRadius: '1rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            overflow: 'hidden',
        }}>
            {/* ── Header ── */}
            <div style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'linear-gradient(135deg, #f8fafc 0%, white 100%)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: '0.625rem',
                        background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 1px 3px rgba(37,99,235,0.15)',
                    }}>
                        <Activity size={16} color="#2563eb" />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '0.925rem', fontWeight: 700, color: '#1e293b' }}>
                            {title}
                        </h3>
                        {!loading && (
                            <p style={{ margin: 0, fontSize: '0.68rem', color: '#94a3b8' }}>
                                {total} event{total !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => { setPage(0); fetchLogs(0, false); }}
                    title="Refresh"
                    style={{
                        width: 30, height: 30, borderRadius: '0.5rem',
                        border: '1px solid #e2e8f0', background: 'white',
                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: '#94a3b8',
                        transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.color = '#2563eb'; e.currentTarget.style.background = '#eff6ff'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'white'; }}
                >
                    <RefreshCw size={13} />
                </button>
            </div>

            {listContent}
        </div>
    );
};

export default ActivityFeed;
