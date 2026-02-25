import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
    ArrowLeft, Plus, Loader2, Calendar, Users, CheckCircle2,
    Clock, AlertTriangle, Pencil, Trash2, X, Flag, BarChart2,
    User, ThumbsUp, ThumbsDown, RefreshCw, ChevronRight, TrendingUp,
    Search, Filter, Calendar as CalendarIcon, Hash, ChevronDown, ListTodo,
    ArrowRight, Info, History, ExternalLink, CheckSquare, Square, MessageSquare
} from 'lucide-react';
import TaskModal from './TaskModal';

// ── Helpers ──────────────────────────────────────────────────────
const fmt = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const isOverdue = (t) =>
    t.deadline && new Date() > new Date(t.deadline) && t.status !== 'APPROVED';

const STATUS_META = {
    TODO: { label: 'To Do', bg: '#f1f5f9', color: '#475569' },
    IN_PROGRESS: { label: 'In Progress', bg: '#eff6ff', color: '#1d4ed8' },
    SUBMITTED: { label: 'Submitted', bg: '#faf5ff', color: '#7e22ce' },
    APPROVED: { label: 'Approved', bg: '#dcfce7', color: '#166534' },
    REJECTED: { label: 'Rejected', bg: '#fef2f2', color: '#991b1b' },
};

const PRIORITY_META = {
    LOW: { label: 'Low', bg: '#f0fdf4', color: '#166534', dot: '#22c55e' },
    MEDIUM: { label: 'Medium', bg: '#fffbeb', color: '#92400e', dot: '#f59e0b' },
    HIGH: { label: 'High', bg: '#fff7ed', color: '#9a3412', dot: '#f97316' },
    URGENT: { label: 'Urgent', bg: '#fef2f2', color: '#991b1b', dot: '#ef4444' },
};

const PROJECT_STATUS_META = {
    PLANNING: { bg: '#fef9c3', color: '#854d0e', label: 'Planning' },
    ACTIVE: { bg: '#dcfce7', color: '#166534', label: 'Active' },
    COMPLETED: { bg: '#dbeafe', color: '#1e40af', label: 'Completed' },
    ON_HOLD: { bg: '#fee2e2', color: '#991b1b', label: 'On Hold' }
};

const Badge = ({ meta, label }) => (
    <span style={{ padding: '0.2rem 0.65rem', borderRadius: '2rem', fontSize: '0.72rem', fontWeight: 700, background: meta?.bg || '#f1f5f9', color: meta?.color || '#475569', whiteSpace: 'nowrap' }}>
        {label || meta?.label}
    </span>
);

// ── Delete Confirm ────────────────────────────────────────────────
const DeleteConfirm = ({ title, message, onCancel, onConfirm, loading }) => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}>
        <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: 400, textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fef2f2', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}><AlertTriangle size={24} /></div>
            <h3 style={{ margin: '0 0 0.5rem', color: '#1e293b' }}>{title}</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 1.5rem' }}>{message}</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button onClick={onCancel} style={{ padding: '0.6rem 1.25rem', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                <button onClick={onConfirm} disabled={loading} style={{ padding: '0.6rem 1.5rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' }}>
                    {loading ? 'Deleting...' : 'Delete'}
                </button>
            </div>
        </div>
    </div>
);

// ── Task Detail Modal ─────────────────────────────────────────────
const TaskDetailModal = ({ task, onClose, onApprove, onReject, onEdit, actionLoading }) => {
    const [timeLogs, setTimeLogs] = useState(null);
    const [tlLoading, setTlLoading] = useState(true);
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectNote, setRejectNote] = useState('');

    const overdue = isOverdue(task);
    const sm = STATUS_META[task.status] || STATUS_META.TODO;
    const pm = PRIORITY_META[task.priority] || PRIORITY_META.MEDIUM;

    const progress = task.progress || 0;

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get(`/manager/task/${task._id}/time-logs`);
                setTimeLogs(res.data);
            } catch { setTimeLogs(null); }
            finally { setTlLoading(false); }
        };
        load();
    }, [task._id]);

    const handleRejectSubmit = () => {
        if (!rejectNote.trim()) return;
        onReject(task._id, rejectNote);
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem' }} onClick={onClose}>
            <div style={{ background: 'white', borderRadius: '1rem', width: '100%', maxWidth: 720, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ padding: '1.5rem 1.75rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                            <Badge meta={sm} />
                            <Badge meta={pm} />
                            {overdue && <span style={{ padding: '0.2rem 0.65rem', borderRadius: '2rem', fontSize: '0.72rem', fontWeight: 700, background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}>⚠ OVERDUE</span>}
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', wordBreak: 'break-word' }}>{task.title}</h2>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                        <button onClick={() => { onClose(); onEdit(task); }} title="Edit" style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', borderRadius: '0.4rem', background: 'transparent', cursor: 'pointer', color: '#64748b' }}><Pencil size={14} /></button>
                        <button onClick={onClose} style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', border: 'none', borderRadius: '0.4rem', cursor: 'pointer', color: '#64748b' }}><X size={14} /></button>
                    </div>
                </div>

                <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Meta grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
                        {[
                            { label: 'Assigned To', value: task.assignedTo?.name || '—', icon: <User size={13} /> },
                            { label: 'Team', value: task.teamId?.name || '—', icon: <Users size={13} /> },
                            { label: 'Deadline', value: fmt(task.deadline), icon: <CalendarIcon size={13} />, highlight: overdue },
                            { label: 'Est. Hours', value: task.estimatedHours ? `${task.estimatedHours}h` : '—', icon: <Clock size={13} /> },
                            { label: 'Actual Hours', value: task._actualHours ? `${task._actualHours}h` : '0h', icon: <Clock size={13} />, highlight: task.estimatedHours > 0 && task._actualHours > task.estimatedHours },
                        ].map(({ label, value, icon, highlight }) => (
                            <div key={label} style={{ background: '#f8fafc', borderRadius: '0.625rem', padding: '0.875rem' }}>
                                <p style={{ margin: '0 0 0.3rem', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 4 }}>{icon}{label}</p>
                                <p style={{ margin: 0, fontWeight: 600, color: highlight ? '#ef4444' : '#1e293b', fontSize: '0.9rem' }}>{value}</p>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
                        <div>
                            {/* Description */}
                            {task.description && (
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <p style={{ margin: '0 0 0.4rem', fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</p>
                                    <p style={{ margin: 0, color: '#475569', lineHeight: 1.6, fontSize: '0.9rem' }}>{task.description}</p>
                                </div>
                            )}

                            {/* Definition of Done */}
                            {task.definitionOfDone && (
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <p style={{ margin: '0 0 0.4rem', fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Definition of Done</p>
                                    <div style={{ padding: '0.75rem 1rem', background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '0.5rem', color: '#1e40af', fontSize: '0.875rem' }}>{task.definitionOfDone}</div>
                                </div>
                            )}

                            {/* Submission Proof */}
                            {task.submission?.submittedAt && (
                                <div style={{ marginBottom: '1.25rem', padding: '1rem', background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '0.75rem' }}>
                                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.78rem', fontWeight: 700, color: '#7e22ce', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 5 }}><MessageSquare size={13} /> Submission Evidence</p>
                                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#581c87', fontWeight: 500 }}>{task.submission.comment}</p>
                                    {task.submission.attachmentUrl && (
                                        <a href={task.submission.attachmentUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#2563eb', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', fontWeight: 600 }}>
                                            <ExternalLink size={12} /> View Attachment
                                        </a>
                                    )}
                                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.7rem', color: '#a855f7' }}>Submitted on {fmt(task.submission.submittedAt)}</p>
                                </div>
                            )}

                            {/* Subtasks */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                    <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subtasks ({progress}%)</p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    {task.subtasks?.length > 0 ? (
                                        task.subtasks.map((st, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.4rem' }}>
                                                {st.isCompleted ? <CheckSquare size={15} color="#22c55e" /> : <Square size={15} color="#cbd5e1" />}
                                                <span style={{ fontSize: '0.825rem', color: st.isCompleted ? '#94a3b8' : '#1e293b', textDecoration: st.isCompleted ? 'line-through' : 'none' }}>{st.title}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>No subtasks.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            {/* Status History Timeline */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <p style={{ margin: '0 0 0.8rem', fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 5 }}><History size={13} /> Activity History</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderLeft: '2px solid #f1f5f9', paddingLeft: '1rem', marginLeft: '0.5rem' }}>
                                    {task.statusHistory?.slice().reverse().map((h, i) => (
                                        <div key={i} style={{ position: 'relative' }}>
                                            <div style={{ position: 'absolute', left: '-1.375rem', top: '0.2rem', width: 10, height: 10, borderRadius: '50%', background: i === 0 ? '#2563eb' : '#cbd5e1', border: '2px solid white' }} />
                                            <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>{STATUS_META[h.status]?.label || h.status}</p>
                                            <p style={{ margin: '0.1rem 0 0', fontSize: '0.72rem', color: '#64748b' }}>{h.note}</p>
                                            <p style={{ margin: '0.1rem 0 0', fontSize: '0.68rem', color: '#94a3b8' }}>{fmt(h.changedAt)}</p>
                                        </div>
                                    ))}
                                    {(!task.statusHistory || task.statusHistory.length === 0) && <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Created task</p>}
                                </div>
                            </div>

                            {/* Time Log Summary */}
                            <div>
                                <p style={{ margin: '0 0 0.8rem', fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 5 }}><Clock size={13} /> Time Performance</p>
                                {tlLoading ? (
                                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                ) : timeLogs && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                        {[
                                            { label: 'Estimated', value: `${timeLogs.summary.estimatedHours}h`, color: '#64748b' },
                                            { label: 'Logged', value: `${timeLogs.summary.totalLoggedHours}h`, color: '#1e293b' },
                                            {
                                                label: 'Balance',
                                                value: `${Math.abs(timeLogs.summary.delta)}h`,
                                                type: timeLogs.summary.status
                                            }
                                        ].map((it, idx) => (
                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.6rem 0.875rem', borderRadius: '0.5rem' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>{it.label}</span>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: it.type === 'OVERRUN' ? '#ef4444' : it.type === 'UNDERRUN' ? '#16a34a' : (it.color || '#1e293b') }}>
                                                    {it.type === 'OVERRUN' && '+'}
                                                    {it.type === 'UNDERRUN' && '-'}
                                                    {it.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* PM Actions */}
                    {task.status === 'SUBMITTED' && (
                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
                            {!showRejectForm ? (
                                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={() => setShowRejectForm(true)}
                                        disabled={actionLoading}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
                                    >
                                        <ThumbsDown size={15} /> Reject Task
                                    </button>
                                    <button
                                        onClick={() => onApprove(task._id)}
                                        disabled={actionLoading}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.5rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
                                    >
                                        <ThumbsUp size={15} /> Approve & Close
                                    </button>
                                </div>
                            ) : (
                                <div style={{ background: '#fff1f2', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #ffe4e6' }}>
                                    <p style={{ margin: '0 0 0.75rem', fontWeight: 700, color: '#991b1b', fontSize: '0.9rem' }}>Reason for Rejection</p>
                                    <textarea
                                        value={rejectNote}
                                        onChange={e => setRejectNote(e.target.value)}
                                        placeholder="e.g. Please update the documentation subtask..."
                                        rows={2}
                                        style={{ width: '100%', padding: '0.6rem 0.875rem', border: '1.5px solid #fecaca', borderRadius: '0.5rem', fontSize: '0.875rem', outline: 'none', marginBottom: '0.75rem' }}
                                    />
                                    <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
                                        <button onClick={() => setShowRejectForm(false)} style={{ padding: '0.45rem 1rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.4rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                                        <button
                                            onClick={handleRejectSubmit}
                                            disabled={!rejectNote.trim() || actionLoading}
                                            style={{ padding: '0.45rem 1.25rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.4rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', opacity: !rejectNote.trim() ? 0.6 : 1 }}
                                        >
                                            {actionLoading ? 'Rejecting...' : 'Submit Rejection'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


// ── Task Row (table) ──────────────────────────────────────────────
const TaskRow = ({ task, onView, onEdit, onDelete }) => {
    const overdue = isOverdue(task);
    const sm = STATUS_META[task.status] || STATUS_META.TODO;
    const pm = PRIORITY_META[task.priority] || PRIORITY_META.MEDIUM;

    return (
        <tr
            style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.1s' }}
            onClick={() => onView(task)}
            onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
            <td style={{ padding: '0.875rem 1.25rem', maxWidth: 240 }}>
                <div>
                    <p style={{ margin: 0, fontWeight: 600, color: '#1e293b', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</p>
                    {task.assignedTo && <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>{task.assignedTo.name}</p>}
                </div>
            </td>
            <td style={{ padding: '0.875rem 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <Badge meta={sm} />
                    {overdue && <span style={{ padding: '0.15rem 0.5rem', borderRadius: '2rem', fontSize: '0.68rem', fontWeight: 700, background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}>OVERDUE</span>}
                </div>
            </td>
            <td style={{ padding: '0.875rem 1rem' }}><Badge meta={pm} /></td>
            <td style={{ padding: '0.875rem 1rem', fontSize: '0.82rem', color: overdue ? '#ef4444' : '#64748b', fontWeight: overdue ? 600 : 400 }}>
                {fmt(task.deadline)}
            </td>
            <td style={{ padding: '0.875rem 1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', minWidth: 28 }}>{task.progress || 0}%</span>
                        <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden', minWidth: 60 }}>
                            <div style={{ width: `${task.progress || 0}%`, height: '100%', background: task.progress === 100 ? '#22c55e' : '#2563eb', borderRadius: 3 }} />
                        </div>
                    </div>
                    {task.subtasks?.length > 0 && (
                        <div style={{ fontSize: '0.68rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <ListTodo size={11} /> {task.subtasks.filter(s => s.isCompleted).length}/{task.subtasks.length} subtasks
                        </div>
                    )}
                </div>
            </td>
            <td style={{ padding: '0.875rem 1rem' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button onClick={() => onEdit(task)} style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', borderRadius: '0.375rem', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#1e293b'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}>
                        <Pencil size={13} />
                    </button>
                    <button onClick={() => onDelete(task)} style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', borderRadius: '0.375rem', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fecaca'; e.currentTarget.style.color = '#ef4444'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}>
                        <Trash2 size={13} />
                    </button>
                </div>
            </td>
        </tr>
    );
};

// ── Main ProjectView ──────────────────────────────────────────────
const ProjectView = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [completing, setCompleting] = useState(false);

    // Filters
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPriority, setFilterPriority] = useState('');
    const [filterOverdue, setFilterOverdue] = useState(false);

    // Modals
    const [taskModalOpen, setTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [viewingTask, setViewingTask] = useState(null);
    const [deletingTask, setDeletingTask] = useState(null);

    const fetchProject = useCallback(async () => {
        try {
            const res = await api.get('/manager/projects');
            const found = res.data.find(p => p._id === id);
            setProject(found || null);
        } catch (err) { console.error(err); }
    }, [id]);

    const fetchTasks = useCallback(async () => {
        try {
            const params = new URLSearchParams({ projectId: id });
            if (filterStatus) params.append('status', filterStatus);
            if (filterPriority) params.append('priority', filterPriority);
            if (filterOverdue) params.append('overdue', 'true');
            const res = await api.get(`/manager/tasks?${params}`);
            setTasks(res.data);
        } catch (err) { console.error(err); }
    }, [id, filterStatus, filterPriority, filterOverdue]);

    useEffect(() => {
        Promise.all([fetchProject(), fetchTasks()]).finally(() => setLoading(false));
    }, [fetchProject, fetchTasks]);

    const handleTaskSubmit = async (formData) => {
        setSubmitting(true);
        try {
            if (editingTask) {
                const res = await api.put(`/manager/tasks/${editingTask._id}`, formData);
                setTasks(prev => prev.map(t => t._id === res.data._id ? res.data : t));
                if (viewingTask?._id === res.data._id) setViewingTask(res.data);
            } else {
                const res = await api.post('/manager/tasks', { ...formData, projectId: id });
                setTasks(prev => [res.data, ...prev]);
            }
            fetchProject();
            setTaskModalOpen(false);
            setEditingTask(null);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save task');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteTask = async () => {
        setSubmitting(true);
        try {
            await api.delete(`/manager/tasks/${deletingTask._id}`);
            setTasks(prev => prev.filter(t => t._id !== deletingTask._id));
            setDeletingTask(null);
            fetchProject();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete task');
        } finally {
            setSubmitting(false);
        }
    };

    const handleApproveTask = async (taskId) => {
        setActionLoading(true);
        try {
            const res = await api.post(`/manager/tasks/${taskId}/approve`);
            setTasks(prev => prev.map(t => t._id === res.data._id ? res.data : t));
            setViewingTask(res.data);
            fetchProject();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to approve task');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectTask = async (taskId, note) => {
        setActionLoading(true);
        try {
            const res = await api.post(`/manager/tasks/${taskId}/reject`, { note });
            setTasks(prev => prev.map(t => t._id === res.data._id ? res.data : t));
            setViewingTask(res.data);
            fetchProject();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to reject task');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCompleteProject = async () => {
        if (!window.confirm('Are you sure you want to mark this project as COMPLETED? No further tasks can be added.')) return;
        setCompleting(true);
        try {
            const res = await api.put(`/manager/projects/${id}/complete`);
            setProject(res.data);
            alert('Project marked as completed successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to complete project');
        } finally {
            setCompleting(false);
        }
    };

    // Stats
    const total = tasks.length;
    const approved = tasks.filter(t => t.status === 'APPROVED').length;
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const overdueTasks = tasks.filter(t => isOverdue(t)).length;

    const isCompleted = project?.status === 'COMPLETED';
    const canComplete = approved === total && total > 0 && !isCompleted;

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem', color: '#64748b' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#2563eb' }} />
            <p style={{ margin: 0 }}>Loading project...</p>
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    if (!project) return (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', color: '#94a3b8' }}>
            <p>Project not found.</p>
            <button onClick={() => navigate('/manager/projects')} style={{ marginTop: '1rem', padding: '0.6rem 1.25rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Back to Projects</button>
        </div>
    );

    return (
        <div>
            {/* Back button + breadcrumb */}
            <button onClick={() => navigate('/manager/projects')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.875rem', marginBottom: '1.25rem', padding: 0 }}>
                <ArrowLeft size={16} /> Back to Projects
            </button>

            {/* Project Header */}
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.5rem 1.75rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 300 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>{project.name}</h1>
                            <span style={{ padding: '0.2rem 0.75rem', borderRadius: '2rem', fontSize: '0.78rem', fontWeight: 700, background: PROJECT_STATUS_META[project.status]?.bg || '#f1f5f9', color: PROJECT_STATUS_META[project.status]?.color || '#475569' }}>
                                {PROJECT_STATUS_META[project.status]?.label || project.status}
                            </span>
                        </div>
                        {project.description && <p style={{ margin: '0 0 1rem', color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>{project.description}</p>}

                        {/* Progress Section */}
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #f1f5f9', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}><TrendingUp size={14} /> Project Progress</span>
                                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: project.progress === 100 ? '#166534' : '#2563eb' }}>{project.progress || 0}%</span>
                            </div>
                            <div style={{ height: 10, background: '#e2e8f0', borderRadius: 5, overflow: 'hidden' }}>
                                <div style={{ width: `${project.progress || 0}%`, height: '100%', background: project.progress === 100 ? '#22c55e' : 'linear-gradient(90deg, #2563eb, #3b82f6)', transition: 'width 0.5s ease', borderRadius: 5 }} />
                            </div>
                            <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                                {approved} of {total} tasks approved
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                            {project.startDate && <span style={{ fontSize: '0.82rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={13} /> {fmt(project.startDate)}</span>}
                            {project.deadline && <span style={{ fontSize: '0.82rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={13} /> {fmt(project.deadline)}</span>}
                            {project.createdBy?.name && <span style={{ fontSize: '0.82rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}><User size={13} /> {project.createdBy.name}</span>}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            {[
                                { label: 'Total', value: total, bg: '#f1f5f9', color: '#475569' },
                                { label: 'Approved', value: approved, bg: '#dcfce7', color: '#166534' },
                                { label: 'Overdue', value: overdueTasks, bg: '#fef2f2', color: '#ef4444' },
                            ].map(({ label, value, bg, color }) => (
                                <div key={label} style={{ background: bg, borderRadius: '0.625rem', padding: '0.75rem 1rem', textAlign: 'center', minWidth: 75 }}>
                                    <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</p>
                                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.68rem', color, fontWeight: 700, opacity: 0.8, textTransform: 'uppercase' }}>{label}</p>
                                </div>
                            ))}
                        </div>

                        {!isCompleted && (
                            <button
                                onClick={handleCompleteProject}
                                disabled={!canComplete || completing}
                                title={!canComplete ? "All tasks must be APPROVED to complete project" : ""}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.75rem 1.5rem',
                                    background: canComplete ? '#1e293b' : '#f1f5f9',
                                    color: canComplete ? 'white' : '#94a3b8',
                                    border: 'none', borderRadius: '0.6rem',
                                    fontSize: '0.875rem', fontWeight: 700,
                                    cursor: canComplete ? 'pointer' : 'not-allowed',
                                    transition: 'all 0.2s',
                                    width: '100%', justifyContent: 'center'
                                }}
                            >
                                {completing ? <Loader2 size={16} style={{ animation: 'spin 1.2s linear infinite' }} /> : <CheckCircle2 size={16} />}
                                Mark as Completed
                            </button>
                        )}
                        {isCompleted && (
                            <div style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #dbeafe', padding: '0.75rem 1.25rem', borderRadius: '0.6rem', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <CheckCircle2 size={16} /> Finalized on {fmt(project.completedAt)}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tasks Section */}
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                {/* Toolbar */}
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>Tasks</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Filters */}
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '0.45rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.4rem', fontSize: '0.82rem', background: 'white', color: '#475569', outline: 'none' }}>
                            <option value="">All Status</option>
                            {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={{ padding: '0.45rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.4rem', fontSize: '0.82rem', background: 'white', color: '#475569', outline: 'none' }}>
                            <option value="">All Priority</option>
                            {Object.entries(PRIORITY_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: '#ef4444', fontWeight: 500, cursor: 'pointer' }}>
                            <input type="checkbox" checked={filterOverdue} onChange={e => setFilterOverdue(e.target.checked)} /> Overdue
                        </label>
                        {!isCompleted && (
                            <button onClick={() => { setEditingTask(null); setTaskModalOpen(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                <Plus size={16} /> New Task
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                {tasks.length === 0 ? (
                    <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
                        <CheckCircle2 size={32} style={{ marginBottom: '1rem', color: '#cbd5e1' }} />
                        <p style={{ margin: '0 0 1rem', fontSize: '0.95rem' }}>{filterStatus || filterPriority || filterOverdue ? 'No tasks match your filters' : 'No tasks yet for this project'}</p>
                        {!filterStatus && !filterPriority && !filterOverdue && !isCompleted && (
                            <button onClick={() => { setEditingTask(null); setTaskModalOpen(true); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' }}>
                                <Plus size={16} /> Create First Task
                            </button>
                        )}
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                    {['Task', 'Status', 'Priority', 'Deadline', 'Progress', ''].map(h => (
                                        <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map(task => (
                                    <TaskRow
                                        key={task._id}
                                        task={task}
                                        onView={t => setViewingTask(t)}
                                        onEdit={t => { setViewingTask(null); setEditingTask(t); setTaskModalOpen(true); }}
                                        onDelete={t => setDeletingTask(t)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Task Modal (create/edit) */}
            {taskModalOpen && (
                <TaskModal
                    open={taskModalOpen}
                    onClose={() => { setTaskModalOpen(false); setEditingTask(null); }}
                    onSubmit={handleTaskSubmit}
                    initialData={editingTask}
                    projectId={id}
                    loading={submitting}
                />
            )}

            {/* Task Detail Modal */}
            {viewingTask && (
                <TaskDetailModal
                    task={viewingTask}
                    onClose={() => setViewingTask(null)}
                    onEdit={t => { setViewingTask(null); setEditingTask(t); setTaskModalOpen(true); }}
                    onApprove={handleApproveTask}
                    onReject={handleRejectTask}
                    actionLoading={actionLoading}
                />
            )}

            {/* Delete Confirm */}
            {deletingTask && (
                <DeleteConfirm
                    title="Delete Task?"
                    message={`"${deletingTask.title}" will be permanently deleted.`}
                    onCancel={() => setDeletingTask(null)}
                    onConfirm={handleDeleteTask}
                    loading={submitting}
                />
            )}

            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );
};

export default ProjectView;
