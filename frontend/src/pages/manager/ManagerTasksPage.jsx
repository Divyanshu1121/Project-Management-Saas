import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import {
    ListTodo, Plus, Loader2, X, AlertTriangle, Trash2, Pencil,
    Calendar, CheckCircle2, Circle, Users, User
} from 'lucide-react';

import TaskModal from './TaskModal';

// Constants
const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const STATUS_OPTIONS = ['TODO', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REJECTED'];

const PRIORITY_LABEL = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', URGENT: 'Urgent' };
const STATUS_LABEL = { TODO: 'To Do', IN_PROGRESS: 'In Progress', SUBMITTED: 'Submitted', APPROVED: 'Approved', REJECTED: 'Rejected' };

const priorityColors = {
    LOW: { bg: '#f0fdf4', color: '#166534' },
    MEDIUM: { bg: '#fffbeb', color: '#92400e' },
    HIGH: { bg: '#fff7ed', color: '#9a3412' },
    URGENT: { bg: '#fef2f2', color: '#991b1b' },
};

const statusColors = {
    TODO: { bg: '#f1f5f9', color: '#475569' },
    IN_PROGRESS: { bg: '#eff6ff', color: '#1d4ed8' },
    SUBMITTED: { bg: '#faf5ff', color: '#7e22ce' },
    APPROVED: { bg: '#dcfce7', color: '#166534' },
    REJECTED: { bg: '#fef2f2', color: '#991b1b' },
};

const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

// ── Delete Confirm ───────────────────────────────────────
const DeleteConfirm = ({ task, onCancel, onConfirm, loading }) => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem' }}>
        <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#ef4444' }}><AlertTriangle size={24} /></div>
            <h3 style={{ margin: '0 0 0.5rem', color: '#1e293b' }}>Delete Task?</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 1.5rem' }}>
                <strong>"{task.title}"</strong> will be permanently deleted.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button onClick={onCancel} style={{ padding: '0.6rem 1.25rem', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>Cancel</button>
                <button onClick={onConfirm} disabled={loading}
                    style={{ padding: '0.6rem 1.5rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
                    {loading ? 'Deleting...' : 'Yes, Delete'}
                </button>
            </div>
        </div>
    </div>
);

// ── Task Row ─────────────────────────────────────────────
const TaskRow = ({ task, onEdit, onDelete, onToggleDone }) => {
    const isDone = task.status === 'APPROVED' || task.status === 'Done';
    const p = priorityColors[task.priority] || priorityColors.MEDIUM;
    const s = statusColors[task.status] || statusColors.TODO;
    const statusLabel = STATUS_LABEL[task.status] || task.status;
    const priorityLabel = PRIORITY_LABEL[task.priority] || task.priority;
    const isOverdue = task.deadline && new Date() > new Date(task.deadline) && !isDone;

    return (
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem', transition: 'box-shadow 0.15s', opacity: isDone ? 0.72 : 1 }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>

            {/* Toggle done */}
            <button onClick={() => onToggleDone(task)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: isDone ? '#22c55e' : '#cbd5e1', flexShrink: 0, display: 'flex', padding: 0 }}>
                {isDone ? <CheckCircle2 size={20} /> : <Circle size={20} />}
            </button>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 600, color: isDone ? '#94a3b8' : '#1e293b', fontSize: '0.92rem', textDecoration: isDone ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {task.title}
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                    {task.projectId?.name && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{task.projectId.name}</span>}
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{task.progress || 0}%</span>
                    {task.subtasks?.length > 0 && (
                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <ListTodo size={11} /> {task.subtasks.filter(s => s.isCompleted).length}/{task.subtasks.length}
                        </span>
                    )}
                    {task.assignedTo?.name && (
                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <User size={10} /> {task.assignedTo.name}{task.assignedTo.empId ? ` · ${task.assignedTo.empId}` : ''}
                        </span>
                    )}
                </div>
            </div>

            {/* Priority badge */}
            <span style={{ padding: '0.2rem 0.65rem', background: p.bg, color: p.color, borderRadius: '2rem', fontSize: '0.74rem', fontWeight: 700, flexShrink: 0 }}>
                {priorityLabel}
            </span>

            {/* Status badge */}
            <span style={{ padding: '0.2rem 0.65rem', background: s.bg, color: s.color, borderRadius: '2rem', fontSize: '0.74rem', fontWeight: 700, flexShrink: 0 }}>
                {statusLabel}
            </span>

            {/* Overdue badge */}
            {isOverdue && <span style={{ padding: '0.2rem 0.65rem', background: '#fef2f2', color: '#ef4444', borderRadius: '2rem', fontSize: '0.74rem', fontWeight: 700, flexShrink: 0 }}>Overdue</span>}

            {/* Deadline */}
            {task.deadline && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.77rem', color: isOverdue ? '#ef4444' : '#64748b', flexShrink: 0, whiteSpace: 'nowrap' }}>
                    <Calendar size={11} /> {formatDate(task.deadline)}
                </span>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                <button onClick={() => onEdit(task)}
                    style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', borderRadius: '0.375rem', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#1e293b'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}>
                    <Pencil size={13} />
                </button>
                <button onClick={() => onDelete(task)}
                    style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', borderRadius: '0.375rem', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fecaca'; e.currentTarget.style.color = '#ef4444'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}>
                    <Trash2 size={13} />
                </button>
            </div>
        </div>
    );
};

// ── Main Tasks Page ──────────────────────────────────────
const ManagerTasksPage = () => {
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [deletingTask, setDeletingTask] = useState(null);
    const [filterStatus, setFilterStatus] = useState('All');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [taskRes, projRes, teamRes] = await Promise.all([
                api.get('/manager/tasks'),
                api.get('/manager/projects'),
                api.get('/company/teams'),
            ]);
            setTasks(taskRes.data || []);
            setProjects(projRes.data || []);
            setTeams(teamRes.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (form) => {
        setSubmitting(true);
        try {
            if (editingTask) {
                const res = await api.put(`/manager/tasks/${editingTask._id}`, form);
                setTasks(prev => prev.map(t => t._id === res.data._id ? res.data : t));
            } else {
                const res = await api.post('/manager/tasks', form);
                setTasks(prev => [res.data, ...prev]);
            }
            setModalOpen(false);
            setEditingTask(null);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to save task');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        setDeleting(true);
        try {
            await api.delete(`/manager/tasks/${deletingTask._id}`);
            setTasks(prev => prev.filter(t => t._id !== deletingTask._id));
            setDeletingTask(null);
        } catch (err) {
            console.error(err);
            alert('Failed to delete task');
        } finally {
            setDeleting(false);
        }
    };

    const handleToggleDone = async (task) => {
        const newStatus = (task.status === 'APPROVED' || task.status === 'Done') ? 'TODO' : 'APPROVED';
        try {
            const res = await api.put(`/manager/tasks/${task._id}`, { status: newStatus });
            setTasks(prev => prev.map(t => t._id === res.data._id ? res.data : t));
        } catch (err) { console.error(err); }
    };

    const ALL_FILTER_OPTIONS = ['All', ...STATUS_OPTIONS];
    const filtered = filterStatus === 'All' ? tasks : tasks.filter(t => t.status === filterStatus);
    const doneCount = tasks.filter(t => t.status === 'APPROVED' || t.status === 'Done').length;
    const overdueCount = tasks.filter(t => t.deadline && new Date() > new Date(t.deadline) && t.status !== 'APPROVED').length;

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem', color: '#64748b' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#2563eb' }} />
            <p style={{ margin: 0 }}>Loading tasks...</p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.25rem 0' }}>Tasks</h1>
                    <p style={{ color: '#64748b', margin: 0 }}>
                        {tasks.length} total · {doneCount} approved
                        {overdueCount > 0 && <span style={{ color: '#ef4444', marginLeft: '0.5rem' }}>· {overdueCount} overdue</span>}
                    </p>
                </div>
                <button onClick={() => { setEditingTask(null); setModalOpen(true); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0.6rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    <Plus size={18} /> New Task
                </button>
            </div>

            {/* Status filter pills */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {ALL_FILTER_OPTIONS.map(s => (
                    <button key={s} onClick={() => setFilterStatus(s)} style={{
                        padding: '0.38rem 1rem', borderRadius: '2rem', fontSize: '0.83rem', fontWeight: 500, cursor: 'pointer', border: 'none',
                        background: filterStatus === s ? '#2563eb' : 'white',
                        color: filterStatus === s ? 'white' : '#475569',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    }}>
                        {s === 'All' ? 'All' : (STATUS_LABEL[s] || s)}
                    </button>
                ))}
            </div>

            {/* Empty state */}
            {filtered.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5rem 2rem', background: 'white', borderRadius: '1rem', border: '2px dashed #e2e8f0', textAlign: 'center' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: '#2563eb' }}><ListTodo size={28} /></div>
                    <h3 style={{ margin: '0 0 0.5rem', color: '#1e293b' }}>{filterStatus === 'All' ? 'No tasks yet' : `No "${STATUS_LABEL[filterStatus] || filterStatus}" tasks`}</h3>
                    <p style={{ color: '#64748b', margin: '0 0 1.5rem' }}>{filterStatus === 'All' ? 'Create your first task to start tracking work' : 'Try a different filter'}</p>
                    {filterStatus === 'All' && (
                        <button onClick={() => { setEditingTask(null); setModalOpen(true); }}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0.6rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
                            <Plus size={18} /> Create Task
                        </button>
                    )}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {filtered.map(task => (
                        <TaskRow key={task._id} task={task}
                            onEdit={t => { setEditingTask(t); setModalOpen(true); }}
                            onDelete={t => setDeletingTask(t)}
                            onToggleDone={handleToggleDone}
                        />
                    ))}
                </div>
            )}

            <TaskModal
                open={modalOpen}
                onClose={() => { setModalOpen(false); setEditingTask(null); }}
                onSubmit={handleSubmit}
                initialData={editingTask}
                projects={projects}
                teams={teams}
                loading={submitting}
            />

            {deletingTask && (
                <DeleteConfirm
                    task={deletingTask}
                    onCancel={() => setDeletingTask(null)}
                    onConfirm={handleDeleteConfirm}
                    loading={deleting}
                />
            )}

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default ManagerTasksPage;
