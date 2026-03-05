import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import {
    ListTodo, Loader2, ChevronDown, ChevronUp, Clock,
    Calendar, FolderOpen, CheckCircle2, ArrowRight, Info,
    ExternalLink, CheckSquare, Square, Send
} from 'lucide-react';


// ── Constants ─────────────────────────────────────────────
const STATUS_LABEL = {
    TODO: 'To Do', IN_PROGRESS: 'In Progress', SUBMITTED: 'Submitted',
    APPROVED: 'Approved', REJECTED: 'Rejected',
};
const STATUS_COLOR = {
    TODO: { bg: '#f1f5f9', color: '#475569' },
    IN_PROGRESS: { bg: '#eff6ff', color: '#1d4ed8' },
    SUBMITTED: { bg: '#faf5ff', color: '#7e22ce' },
    APPROVED: { bg: '#dcfce7', color: '#166534' },
    REJECTED: { bg: '#fef2f2', color: '#991b1b' },
};
const PRIORITY_COLOR = {
    LOW: { bg: '#f0fdf4', color: '#166534' },
    MEDIUM: { bg: '#fffbeb', color: '#92400e' },
    HIGH: { bg: '#fff7ed', color: '#9a3412' },
    URGENT: { bg: '#fef2f2', color: '#991b1b' },
};

// What transitions an employee is allowed to make per current status
const ALLOWED_NEXT = {
    TODO: 'IN_PROGRESS',
    IN_PROGRESS: 'SUBMITTED',
};
const NEXT_LABEL = {
    IN_PROGRESS: 'Mark In Progress',
    SUBMITTED: 'Submit for Review',
};

const fmt = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const Badge = ({ bg, color, children }) => (
    <span style={{ padding: '0.2rem 0.65rem', borderRadius: '2rem', fontSize: '0.73rem', fontWeight: 700, background: bg, color, whiteSpace: 'nowrap' }}>
        {children}
    </span>
);

// ── Submission Modal ──────────────────────────────────────
const TaskSubmissionModal = ({ open, onClose, onSubmit, loading }) => {
    const [comment, setComment] = useState('');
    const [attachmentUrl, setAttachmentUrl] = useState('');

    if (!open) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem' }} onClick={onClose}>
            <div style={{ background: 'white', borderRadius: '1rem', width: '100%', maxWidth: 480, padding: '1.75rem', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
                <h3 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e293b' }}><Send size={20} color="#2563eb" /> Submit Task</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>Provide a comment and optional evidence link for the manager to review.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>Comment <span style={{ color: '#ef4444' }}>*</span></label>
                        <textarea
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="Describe what you accomplished..."
                            rows={3}
                            style={{ width: '100%', padding: '0.6rem 0.875rem', border: '1.5px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem', outline: 'none', resize: 'none' }}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>Attachment URL (Optional)</label>
                        <input
                            type="url"
                            value={attachmentUrl}
                            onChange={e => setAttachmentUrl(e.target.value)}
                            placeholder="https://github.com/..."
                            style={{ width: '100%', padding: '0.6rem 0.875rem', border: '1.5px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem', outline: 'none' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <button onClick={onClose} style={{ flex: 1, padding: '0.65rem', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        <button
                            onClick={() => onSubmit({ comment, attachmentUrl })}
                            disabled={!comment.trim() || loading}
                            style={{ flex: 2, padding: '0.65rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer', opacity: (!comment.trim() || loading) ? 0.6 : 1 }}
                        >
                            {loading ? 'Submitting...' : 'Submit Now'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// ── Task Card ─────────────────────────────────────────────
const TaskCard = ({ task, onStatusChange, onSubtaskToggle, updating }) => {
    const [expanded, setExpanded] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);

    const sc = STATUS_COLOR[task.status] || STATUS_COLOR.TODO;
    const pc = PRIORITY_COLOR[task.priority] || PRIORITY_COLOR.MEDIUM;
    const od = task.deadline && new Date() > new Date(task.deadline) && task.status !== 'APPROVED';
    const isBlocked = task.dependencies?.some(dep => dep.status !== 'APPROVED');
    const nextStatus = ALLOWED_NEXT[task.status];

    const progress = task.progress || 0;

    return (
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.875rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            {/* Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '1rem 1.25rem', cursor: 'pointer' }}
                onClick={() => setExpanded(e => !e)}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 600, color: '#1e293b', fontSize: '0.92rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 3 }}><FolderOpen size={11} />{task.projectId?.name || '—'}</p>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{progress}%</span>
                        {task.subtasks?.length > 0 && (
                            <span style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 3 }}>
                                <CheckSquare size={10} /> {task.subtasks.filter(s => s.isCompleted).length}/{task.subtasks.length}
                            </span>
                        )}
                    </div>
                </div>
                <Badge bg={pc.bg} color={pc.color}>{task.priority || 'MEDIUM'}</Badge>
                {isBlocked && <Badge bg="#fee2e2" color="#b91c1c">BLOCKED</Badge>}
                <Badge bg={sc.bg} color={sc.color}>{STATUS_LABEL[task.status] || task.status}</Badge>
                {od && <Badge bg="#fef2f2" color="#ef4444">Overdue</Badge>}
                {task.deadline && (
                    <span style={{ fontSize: '0.75rem', color: od ? '#ef4444' : '#94a3b8', display: 'flex', alignItems: 'center', gap: 3, whiteSpace: 'nowrap' }}>
                        <Calendar size={11} />{fmt(task.deadline)}
                    </span>
                )}
                {expanded ? <ChevronUp size={16} style={{ color: '#94a3b8', flexShrink: 0 }} /> : <ChevronDown size={16} style={{ color: '#94a3b8', flexShrink: 0 }} />}
            </div>

            {/* Expanded panel */}
            {expanded && (
                <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid #f1f5f9', background: '#fafbfc' }}>
                    {task.description && <p style={{ margin: '1rem 0 0.75rem', color: '#475569', fontSize: '0.875rem', fontStyle: 'italic' }}>{task.description}</p>}

                    {/* Definition of Done */}
                    {task.definitionOfDone && (
                        <div style={{ marginBottom: '1.25rem', background: '#eff6ff', padding: '0.875rem', borderRadius: '0.625rem', border: '1px solid #dbeafe' }}>
                            <p style={{ margin: '0 0 0.25rem', fontSize: '0.72rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Definition of Done</p>
                            <p style={{ margin: 0, color: '#1e3a8a', fontSize: '0.85rem', lineHeight: 1.5 }}>{task.definitionOfDone}</p>
                        </div>
                    )}

                    {/* Dependencies */}
                    {task.dependencies && task.dependencies.length > 0 && (
                        <div style={{ marginBottom: '1.25rem', padding: '1rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '0.75rem' }}>
                            <p style={{ margin: '0 0 0.5rem', fontSize: '0.78rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 5 }}>Dependencies</p>
                            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.875rem', color: '#b45309', fontWeight: 500 }}>
                                {task.dependencies.map((dep, idx) => (
                                    <li key={idx} style={{ marginBottom: '0.3rem' }}>
                                        {dep.title || `Task ${dep._id}`} - <span style={{ fontWeight: 700, color: dep.status === 'APPROVED' ? '#16a34a' : '#ef4444' }}>[{STATUS_LABEL[dep.status] || dep.status}]</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Subtasks checklist */}
                    <div style={{ marginBottom: '1.25rem' }}>
                        <p style={{ margin: '0 0 0.6rem', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subtasks — {progress}%</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {task.subtasks?.length > 0 ? (
                                task.subtasks.map((st, i) => {
                                    const canToggle = task.status !== 'APPROVED' && task.status !== 'SUBMITTED';
                                    return (
                                        <div key={st._id || i}
                                            onClick={() => canToggle && onSubtaskToggle(task._id, i)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 0.875rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.5rem', cursor: canToggle ? 'pointer' : 'default', transition: 'all 0.15s' }}>
                                            {st.isCompleted ? <CheckSquare size={17} color="#22c55e" /> : <Square size={17} color="#94a3b8" />}
                                            <span style={{ fontSize: '0.875rem', color: st.isCompleted ? '#94a3b8' : '#1e293b', textDecoration: st.isCompleted ? 'line-through' : 'none' }}>{st.title}</span>
                                        </div>
                                    );
                                })
                            ) : (
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>No subtasks defined for this task.</p>
                            )}
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, marginBottom: '1.25rem', overflow: 'hidden' }}>
                        <div style={{ width: `${progress}%`, height: '100%', background: progress === 100 ? '#22c55e' : '#2563eb', borderRadius: 3, transition: 'width 0.4s ease' }} />
                    </div>

                    {/* Status action button */}
                    {nextStatus && (
                        <button
                            onClick={() => {
                                if (isBlocked) {
                                    alert('Cannot update status until all dependencies are APPROVED.');
                                    return;
                                }
                                if (nextStatus === 'SUBMITTED') setShowSubmitModal(true);
                                else onStatusChange(task._id, nextStatus);
                            }}
                            disabled={updating === task._id || (nextStatus === 'SUBMITTED' && progress < 100) || isBlocked}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.4rem', background: ((nextStatus === 'SUBMITTED' && progress < 100) || isBlocked) ? '#cbd5e1' : '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: ((nextStatus === 'SUBMITTED' && progress < 100) || isBlocked) ? 'not-allowed' : 'pointer', transition: 'all 0.15s' }}>
                            {updating === task._id ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <ArrowRight size={16} />}
                            {isBlocked ? 'Blocked by Dependencies' : (nextStatus === 'SUBMITTED' && progress < 100 ? 'Finish subtasks to submit' : NEXT_LABEL[nextStatus])}
                        </button>
                    )}

                    {task.status === 'SUBMITTED' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: '#faf5ff', borderRadius: '0.625rem', color: '#7e22ce', fontSize: '0.85rem', fontWeight: 500, border: '1px solid #f3e8ff' }}>
                            <Info size={16} /> Submitted — waiting for manager approval.
                        </div>
                    )}
                    {task.status === 'APPROVED' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: '#dcfce7', borderRadius: '0.625rem', color: '#166534', fontSize: '0.85rem', fontWeight: 500, border: '1px solid #bbf7d0' }}>
                            <CheckCircle2 size={16} /> Task approved ✓
                        </div>
                    )}
                    {task.status === 'REJECTED' && (
                        <div style={{ padding: '0.75rem 1rem', background: '#fef2f2', borderRadius: '0.625rem', color: '#991b1b', fontSize: '0.85rem', fontWeight: 500, border: '1px solid #fecaca' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}><Info size={16} /> Rejected</div>
                            {task.statusHistory?.length > 0 && task.statusHistory[task.statusHistory.length - 1].status === 'REJECTED' && (
                                <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>Note: {task.statusHistory[task.statusHistory.length - 1].note}</p>
                            )}
                        </div>
                    )}

                    {task.estimatedHours > 0 && (
                        <p style={{ margin: '1rem 0 0', fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={11} /> Estimated: {task.estimatedHours}h
                        </p>
                    )}

                    {showSubmitModal && (
                        <TaskSubmissionModal
                            open={showSubmitModal}
                            onClose={() => setShowSubmitModal(false)}
                            loading={updating === task._id}
                            onSubmit={(data) => {
                                onStatusChange(task._id, 'SUBMITTED', data);
                                setShowSubmitModal(false);
                            }}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

// ── Filter pill ───────────────────────────────────────────
const Pill = ({ label, active, onClick }) => (
    <button onClick={onClick} style={{ padding: '0.35rem 1rem', borderRadius: '2rem', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', border: 'none', background: active ? '#2563eb' : 'white', color: active ? 'white' : '#475569', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', transition: 'all 0.15s' }}>
        {label}
    </button>
);

// ── Main Page ─────────────────────────────────────────────
const EmployeeTasksPage = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [updating, setUpdating] = useState(null); // taskId being updated

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/employee/tasks');
            setTasks(res.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleStatusChange = async (taskId, newStatus, submission = null) => {
        setUpdating(taskId);
        try {
            const body = { status: newStatus };
            if (submission) body.submission = submission;
            const res = await api.put(`/employee/tasks/${taskId}`, body);
            setTasks(prev => prev.map(t => t._id === res.data._id ? res.data : t));
        } catch (e) {
            alert(e.response?.data?.message || 'Failed to update status');
        } finally {
            setUpdating(null);
        }
    };

    const handleSubtaskToggle = async (taskId, subtaskIdx) => {
        const t = tasks.find(x => x._id === taskId);
        if (!t) return;

        const newSubtasks = [...t.subtasks];
        newSubtasks[subtaskIdx] = { ...newSubtasks[subtaskIdx], isCompleted: !newSubtasks[subtaskIdx].isCompleted };

        try {
            const res = await api.put(`/employee/tasks/${taskId}`, { subtasks: newSubtasks });
            setTasks(prev => prev.map(x => x._id === taskId ? res.data : x));
        } catch (e) {
            alert(e.response?.data?.message || 'Failed to update subtask');
        }
    };

    const FILTERS = ['All', 'TODO', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REJECTED'];
    const filtered = filter === 'All' ? tasks : tasks.filter(t => t.status === filter);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem', color: '#64748b' }}>
            <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: '#2563eb' }} />
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    return (
        <div>
            <div style={{ marginBottom: '1.75rem' }}>
                <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.75rem', fontWeight: 700, color: '#1e293b' }}>My Tasks</h1>
                <p style={{ margin: 0, color: '#64748b' }}>{tasks.length} tasks assigned to you</p>
            </div>

            {/* Filter pills */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {FILTERS.map(f => (
                    <Pill key={f} label={f === 'All' ? 'All' : STATUS_LABEL[f]} active={filter === f} onClick={() => setFilter(f)} />
                ))}
            </div>

            {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '1rem', border: '2px dashed #e2e8f0', color: '#94a3b8' }}>
                    <ListTodo size={28} style={{ marginBottom: '1rem' }} />
                    <p style={{ margin: 0 }}>{filter === 'All' ? 'No tasks assigned yet.' : `No ${STATUS_LABEL[filter]} tasks.`}</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {filtered.map(task => (
                        <TaskCard key={task._id} task={task}
                            onStatusChange={handleStatusChange}
                            onSubtaskToggle={handleSubtaskToggle}
                            updating={updating}
                        />
                    ))}
                </div>
            )}
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );
};

export default EmployeeTasksPage;
