import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable,
} from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '../../services/api';
import {
    Kanban, Plus, Loader2, AlertTriangle, Calendar, User,
    GripVertical, Pencil, Trash2, CheckCircle2, Clock, X, RefreshCw
} from 'lucide-react';
import TaskModal from './TaskModal';

// ─── Constants ────────────────────────────────────────────────────────────────
const COLUMNS = [
    { id: 'TODO', label: 'To Do', color: '#6366f1', light: '#eef2ff', border: '#c7d2fe' },
    { id: 'IN_PROGRESS', label: 'In Progress', color: '#f59e0b', light: '#fffbeb', border: '#fde68a' },
    { id: 'SUBMITTED', label: 'Submitted', color: '#8b5cf6', light: '#f5f3ff', border: '#ddd6fe' },
    { id: 'APPROVED', label: 'Approved', color: '#10b981', light: '#ecfdf5', border: '#a7f3d0' },
    { id: 'REJECTED', label: 'Rejected', color: '#ef4444', light: '#fef2f2', border: '#fecaca' },
];

const PRIORITY_STYLES = {
    LOW: { color: '#16a34a', bg: '#f0fdf4', dot: '#22c55e' },
    MEDIUM: { color: '#d97706', bg: '#fffbeb', dot: '#f59e0b' },
    HIGH: { color: '#ea580c', bg: '#fff7ed', dot: '#f97316' },
    URGENT: { color: '#dc2626', bg: '#fef2f2', dot: '#ef4444' },
};

const fmt = (d) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

// ─── Task Card (Sortable) ─────────────────────────────────────────────────────
const TaskCard = ({ task, onEdit, onDelete, isDragging }) => {
    const {
        attributes, listeners, setNodeRef,
        transform, transition, isDragging: isSortableDragging,
    } = useSortable({ id: task._id });

    const p = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.MEDIUM;
    const isOverdue = task.deadline && new Date() > new Date(task.deadline) && task.status !== 'APPROVED';
    const completedSubs = task.subtasks?.filter(s => s.isCompleted).length || 0;
    const totalSubs = task.subtasks?.length || 0;

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isSortableDragging ? 0.4 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="kanban-card"
        >
            {/* Drag Handle + Priority Dot */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div
                    {...attributes}
                    {...listeners}
                    style={{ cursor: 'grab', color: '#cbd5e1', flexShrink: 0, marginTop: 2, touchAction: 'none' }}
                    title="Drag to move"
                >
                    <GripVertical size={14} />
                </div>
                <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: p.dot, flexShrink: 0, marginTop: 6,
                }} />
                <p style={{
                    margin: 0, fontWeight: 600, fontSize: '0.875rem',
                    color: '#1e293b', lineHeight: 1.4, flex: 1,
                }}>
                    {task.title}
                </p>
            </div>

            {/* Project name */}
            {task.projectId?.name && (
                <p style={{ margin: '0 0 0.4rem 1.375rem', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>
                    {task.projectId.name}
                </p>
            )}

            {/* Priority badge */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginLeft: '1.375rem', marginBottom: '0.5rem' }}>
                <span style={{
                    padding: '0.15rem 0.5rem', borderRadius: '2rem',
                    fontSize: '0.69rem', fontWeight: 700,
                    background: p.bg, color: p.color,
                }}>
                    {task.priority}
                </span>
                {isOverdue && (
                    <span style={{
                        padding: '0.15rem 0.5rem', borderRadius: '2rem',
                        fontSize: '0.69rem', fontWeight: 700,
                        background: '#fef2f2', color: '#dc2626',
                    }}>
                        OVERDUE
                    </span>
                )}
                {totalSubs > 0 && (
                    <span style={{
                        padding: '0.15rem 0.5rem', borderRadius: '2rem',
                        fontSize: '0.69rem', fontWeight: 600,
                        background: '#f1f5f9', color: '#64748b',
                    }}>
                        {completedSubs}/{totalSubs} subtasks
                    </span>
                )}
            </div>

            {/* Footer: assignee, deadline, actions */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    {task.assignedTo?.name && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <div style={{
                                width: 22, height: 22, borderRadius: '50%',
                                background: '#dbeafe', color: '#2563eb',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.65rem', fontWeight: 700,
                            }}>
                                {task.assignedTo.name.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontSize: '0.72rem', color: '#64748b', maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {task.assignedTo.name.split(' ')[0]}
                            </span>
                        </div>
                    )}
                    {task.deadline && (
                        <span style={{
                            display: 'flex', alignItems: 'center', gap: 2,
                            fontSize: '0.71rem', color: isOverdue ? '#ef4444' : '#94a3b8',
                        }}>
                            <Calendar size={10} />
                            {fmt(task.deadline)}
                        </span>
                    )}
                </div>

                <div style={{ display: 'flex', gap: 2 }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                        style={{
                            width: 24, height: 24, border: 'none', background: 'transparent',
                            cursor: 'pointer', color: '#94a3b8', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', borderRadius: 4,
                            transition: 'color 0.15s, background 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#2563eb'; e.currentTarget.style.background = '#eff6ff'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; }}
                        title="Edit task"
                    >
                        <Pencil size={12} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(task); }}
                        style={{
                            width: 24, height: 24, border: 'none', background: 'transparent',
                            cursor: 'pointer', color: '#94a3b8', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', borderRadius: 4,
                            transition: 'color 0.15s, background 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; }}
                        title="Delete task"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Overlay Card (shown while dragging) ─────────────────────────────────────
const OverlayCard = ({ task }) => {
    const p = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.MEDIUM;
    return (
        <div className="kanban-card" style={{
            boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
            transform: 'rotate(2deg) scale(1.02)',
            cursor: 'grabbing',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                <GripVertical size={14} style={{ color: '#94a3b8' }} />
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.dot, flexShrink: 0 }} />
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: '#1e293b' }}>{task.title}</p>
            </div>
            {task.projectId?.name && (
                <p style={{ margin: '0 0 0.4rem 1.375rem', fontSize: '0.72rem', color: '#94a3b8' }}>
                    {task.projectId.name}
                </p>
            )}
            <div style={{ marginLeft: '1.375rem' }}>
                <span style={{ padding: '0.15rem 0.5rem', borderRadius: '2rem', fontSize: '0.69rem', fontWeight: 700, background: p.bg, color: p.color }}>
                    {task.priority}
                </span>
            </div>
        </div>
    );
};

// ─── Kanban Column ────────────────────────────────────────────────────────────
const KanbanColumn = ({ col, tasks, onEdit, onDelete, isOver }) => {
    const { setNodeRef } = useDroppable({ id: col.id });

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', flex: '0 0 280px',
            minWidth: 260, maxWidth: 300,
        }}>
            {/* Column header */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                background: col.light,
                border: `1.5px solid ${isOver ? col.color : col.border}`,
                borderBottom: 'none',
                borderRadius: '0.75rem 0.75rem 0 0',
                transition: 'border-color 0.2s',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: col.color }} />
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1e293b' }}>{col.label}</span>
                </div>
                <span style={{
                    background: col.color, color: 'white',
                    borderRadius: '2rem', padding: '0.1rem 0.6rem',
                    fontSize: '0.75rem', fontWeight: 700, minWidth: 24, textAlign: 'center',
                }}>
                    {tasks.length}
                </span>
            </div>

            {/* Drop zone */}
            <div
                ref={setNodeRef}
                style={{
                    flex: 1, minHeight: 120,
                    background: isOver ? `${col.light}` : '#f8fafc',
                    border: `1.5px solid ${isOver ? col.color : col.border}`,
                    borderTop: 'none',
                    borderRadius: '0 0 0.75rem 0.75rem',
                    padding: '0.75rem',
                    display: 'flex', flexDirection: 'column', gap: '0.625rem',
                    transition: 'background 0.2s, border-color 0.2s',
                    boxShadow: isOver ? `inset 0 0 0 2px ${col.color}30` : 'none',
                }}
            >
                <SortableContext
                    items={tasks.map(t => t._id)}
                    strategy={verticalListSortingStrategy}
                >
                    {tasks.map(task => (
                        <TaskCard
                            key={task._id}
                            task={task}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </SortableContext>

                {tasks.length === 0 && (
                    <div style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#cbd5e1', fontSize: '0.8rem', fontStyle: 'italic',
                        border: `2px dashed ${isOver ? col.color : '#e2e8f0'}`,
                        borderRadius: '0.5rem', padding: '1.5rem',
                        transition: 'border-color 0.2s, color 0.2s',
                        color: isOver ? col.color : '#cbd5e1',
                    }}>
                        {isOver ? '⬇ Drop here' : 'No tasks'}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
const DeleteConfirm = ({ task, onCancel, onConfirm, loading }) => (
    <div style={{
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)',
        backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 2000, padding: '1rem',
    }}>
        <div style={{
            background: 'white', borderRadius: '1rem', padding: '2rem',
            width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            textAlign: 'center',
        }}>
            <div style={{
                width: 52, height: 52, borderRadius: '50%', background: '#fef2f2',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem', color: '#ef4444',
            }}>
                <AlertTriangle size={24} />
            </div>
            <h3 style={{ margin: '0 0 0.5rem', color: '#1e293b' }}>Delete Task?</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 1.5rem' }}>
                <strong>"{task.title}"</strong> will be permanently deleted.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button onClick={onCancel} style={{
                    padding: '0.6rem 1.25rem', background: 'white',
                    border: '1.5px solid #e2e8f0', borderRadius: '0.5rem',
                    fontSize: '0.9rem', cursor: 'pointer',
                }}>Cancel</button>
                <button onClick={onConfirm} disabled={loading} style={{
                    padding: '0.6rem 1.5rem', background: '#ef4444', color: 'white',
                    border: 'none', borderRadius: '0.5rem', fontSize: '0.9rem',
                    fontWeight: 600, cursor: 'pointer',
                }}>
                    {loading ? 'Deleting...' : 'Yes, Delete'}
                </button>
            </div>
        </div>
    </div>
);

// ─── Main Kanban Board Page ───────────────────────────────────────────────────
const KanbanBoard = () => {
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTask, setActiveTask] = useState(null);
    const [overColumn, setOverColumn] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [deletingTask, setDeletingTask] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [filterProject, setFilterProject] = useState('all');
    const [toastMsg, setToastMsg] = useState(null);
    const toastTimeout = useRef(null);

    const showToast = (msg, type = 'success') => {
        setToastMsg({ msg, type });
        clearTimeout(toastTimeout.current);
        toastTimeout.current = setTimeout(() => setToastMsg(null), 2500);
    };

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
    );

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

    // ── Drag handlers ──────────────────────────────────────────
    const handleDragStart = ({ active }) => {
        const task = tasks.find(t => t._id === active.id);
        setActiveTask(task || null);
    };

    const handleDragOver = ({ over }) => {
        if (!over) { setOverColumn(null); return; }
        const colId = COLUMNS.find(c => c.id === over.id)?.id;
        setOverColumn(colId || null);
    };

    const handleDragEnd = async ({ active, over }) => {
        setActiveTask(null);
        setOverColumn(null);

        if (!over || !active) return;

        const task = tasks.find(t => t._id === active.id);
        if (!task) return;

        // Determine the target column ID  
        // over.id can be a column ID or another task's ID (dropped onto a task card)
        let targetColumnId = COLUMNS.find(c => c.id === over.id)?.id;
        if (!targetColumnId) {
            // over is a task card — find what column that task is in
            const overTask = tasks.find(t => t._id === over.id);
            if (overTask) targetColumnId = overTask.status;
        }

        if (!targetColumnId || task.status === targetColumnId) return;

        // Optimistically update UI
        setTasks(prev => prev.map(t =>
            t._id === task._id ? { ...t, status: targetColumnId } : t
        ));

        try {
            await api.put(`/manager/tasks/${task._id}`, { status: targetColumnId });
            showToast(`"${task.title}" moved to ${COLUMNS.find(c => c.id === targetColumnId)?.label}`);
        } catch (err) {
            console.error(err);
            // Revert
            setTasks(prev => prev.map(t =>
                t._id === task._id ? { ...t, status: task.status } : t
            ));
            showToast('Failed to update task status', 'error');
        }
    };

    // ── Task CRUD ─────────────────────────────────────────────
    const handleSubmit = async (form) => {
        setSubmitting(true);
        try {
            if (editingTask) {
                const res = await api.put(`/manager/tasks/${editingTask._id}`, form);
                setTasks(prev => prev.map(t => t._id === res.data._id ? res.data : t));
                showToast('Task updated');
            } else {
                const res = await api.post('/manager/tasks', form);
                setTasks(prev => [res.data, ...prev]);
                showToast('Task created');
            }
            setModalOpen(false);
            setEditingTask(null);
        } catch (err) {
            console.error(err);
            showToast(err.response?.data?.message || 'Failed to save task', 'error');
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
            showToast('Task deleted');
        } catch (err) {
            console.error(err);
            showToast('Failed to delete task', 'error');
        } finally {
            setDeleting(false);
        }
    };

    // ── Filtered tasks ─────────────────────────────────────────
    const filteredTasks = filterProject === 'all'
        ? tasks
        : tasks.filter(t => t.projectId?._id === filterProject || t.projectId === filterProject);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem', color: '#64748b' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#6366f1' }} />
            <p style={{ margin: 0, fontWeight: 500 }}>Loading Kanban Board...</p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
            {/* ── Styles ── */}
            <style>{`
                .kanban-card {
                    background: white;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 0.625rem;
                    padding: 0.75rem;
                    cursor: default;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
                    transition: box-shadow 0.18s, border-color 0.18s, transform 0.15s;
                    user-select: none;
                }
                .kanban-card:hover {
                    box-shadow: 0 6px 20px rgba(0,0,0,0.1);
                    border-color: #c7d2fe;
                }
                .kanban-board-scroll::-webkit-scrollbar {
                    height: 7px;
                }
                .kanban-board-scroll::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }
                .kanban-col-scroll::-webkit-scrollbar {
                    width: 4px;
                }
                .kanban-col-scroll::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 4px;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes toast-in {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {/* ── Header ── */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap',
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.2rem' }}>
                        <div style={{
                            width: 38, height: 38, borderRadius: '0.625rem',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', flexShrink: 0,
                        }}>
                            <Kanban size={20} />
                        </div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                            Kanban Board
                        </h1>
                    </div>
                    <p style={{ color: '#64748b', margin: '0 0 0 3.25rem', fontSize: '0.875rem' }}>
                        {filteredTasks.length} tasks across {COLUMNS.length} columns · Drag cards to update status
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Project filter */}
                    <select
                        value={filterProject}
                        onChange={e => setFilterProject(e.target.value)}
                        style={{
                            padding: '0.5rem 0.875rem', borderRadius: '0.5rem',
                            border: '1.5px solid #e2e8f0', fontSize: '0.875rem',
                            color: '#374151', background: 'white', cursor: 'pointer',
                            outline: 'none', fontFamily: 'inherit',
                        }}
                    >
                        <option value="all">All Projects</option>
                        {projects.map(p => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                    </select>

                    {/* Refresh */}
                    <button
                        onClick={fetchData}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.5rem 0.875rem', borderRadius: '0.5rem',
                            border: '1.5px solid #e2e8f0', background: 'white',
                            fontSize: '0.875rem', color: '#64748b', cursor: 'pointer',
                            transition: 'background 0.15s, color 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#1e293b'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#64748b'; }}
                        title="Refresh board"
                    >
                        <RefreshCw size={15} />
                        Refresh
                    </button>

                    {/* New Task */}
                    <button
                        onClick={() => { setEditingTask(null); setModalOpen(true); }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.55rem 1.1rem',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: 'white', border: 'none', borderRadius: '0.5rem',
                            fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
                            transition: 'box-shadow 0.15s, opacity 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.5)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(99,102,241,0.35)'}
                    >
                        <Plus size={17} />
                        New Task
                    </button>
                </div>
            </div>

            {/* ── Legend ── */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {COLUMNS.map(col => (
                    <div key={col.id} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                        <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>
                            {col.label}: {filteredTasks.filter(t => t.status === col.id).length}
                        </span>
                    </div>
                ))}
            </div>

            {/* ── DnD Context + Board ── */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div
                    className="kanban-board-scroll"
                    style={{
                        display: 'flex', gap: '1rem', overflowX: 'auto',
                        paddingBottom: '1rem', flex: 1, alignItems: 'flex-start',
                    }}
                >
                    {COLUMNS.map(col => {
                        const colTasks = filteredTasks.filter(t => t.status === col.id);
                        return (
                            <KanbanColumn
                                key={col.id}
                                col={col}
                                tasks={colTasks}
                                onEdit={t => { setEditingTask(t); setModalOpen(true); }}
                                onDelete={t => setDeletingTask(t)}
                                isOver={overColumn === col.id}
                            />
                        );
                    })}
                </div>

                {/* Drag Overlay */}
                <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18,0.67,0.6,1.22)' }}>
                    {activeTask ? <OverlayCard task={activeTask} /> : null}
                </DragOverlay>
            </DndContext>

            {/* ── Modals ── */}
            <TaskModal
                open={modalOpen}
                onClose={() => { setModalOpen(false); setEditingTask(null); }}
                onSubmit={handleSubmit}
                initialData={editingTask}
                projects={projects}
                teams={teams}
                tasks={tasks}
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

            {/* ── Toast ── */}
            {toastMsg && (
                <div style={{
                    position: 'fixed', bottom: '1.5rem', left: '50%',
                    transform: 'translateX(-50%)',
                    background: toastMsg.type === 'error' ? '#ef4444' : '#10b981',
                    color: 'white', padding: '0.65rem 1.5rem',
                    borderRadius: '2rem', fontSize: '0.875rem', fontWeight: 600,
                    zIndex: 9999, boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    animation: 'toast-in 0.25s ease',
                    whiteSpace: 'nowrap',
                }}>
                    {toastMsg.type === 'error' ? '⚠ ' : '✓ '}{toastMsg.msg}
                </div>
            )}
        </div>
    );
};

export default KanbanBoard;
