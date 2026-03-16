import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import {
    ListTodo, Plus, Loader2, X, AlertTriangle, Trash2, Pencil,
    Calendar, CheckCircle2, Circle, Users, User, ChevronDown, ChevronRight, Folder, LayoutGrid, Filter
} from 'lucide-react';

import { PageHeader, SectionContainer, Button } from '../../design-system';
import TaskModal from './TaskModal';
import { PageSkeleton, ButtonLoader, InlineLoader } from '../../components/common/Loaders';

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
                    style={{ padding: '0.6rem 1.5rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {loading ? <ButtonLoader color="white" /> : null}
                    {loading ? 'Deleting...' : 'Yes, Delete'}
                </button>
            </div>
        </div>
    </div>
);

const TaskRow = ({ task, onEdit, onDelete, onToggleDone }) => {
    const isDone = task.status === 'APPROVED' || task.status === 'Done';
    const p = priorityColors[task.priority] || priorityColors.MEDIUM;
    const s = statusColors[task.status] || statusColors.TODO;
    const statusLabel = STATUS_LABEL[task.status] || task.status;
    const priorityLabel = PRIORITY_LABEL[task.priority] || task.priority;
    const isOverdue = task.deadline && new Date() > new Date(task.deadline) && !isDone;
    const isBlocked = task.dependencies?.some(dep => dep.status !== 'APPROVED');

    return (
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem', transition: 'box-shadow 0.15s', opacity: isDone ? 0.72 : 1 }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>

            <button onClick={() => onToggleDone(task)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: isDone ? '#22c55e' : '#cbd5e1', flexShrink: 0, display: 'flex', padding: 0 }}>
                {isDone ? <CheckCircle2 size={20} /> : <Circle size={20} />}
            </button>

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

            <span style={{ padding: '0.2rem 0.65rem', background: p.bg, color: p.color, borderRadius: '2rem', fontSize: '0.74rem', fontWeight: 700, flexShrink: 0 }}>
                {priorityLabel}
            </span>

            <span style={{ padding: '0.2rem 0.65rem', background: s.bg, color: s.color, borderRadius: '2rem', fontSize: '0.74rem', fontWeight: 700, flexShrink: 0 }}>
                {statusLabel}
            </span>

            {isBlocked && <span style={{ padding: '0.2rem 0.65rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '2rem', fontSize: '0.74rem', fontWeight: 700, flexShrink: 0 }}>Blocked</span>}

            {isOverdue && <span style={{ padding: '0.2rem 0.65rem', background: '#fef2f2', color: '#ef4444', borderRadius: '2rem', fontSize: '0.74rem', fontWeight: 700, flexShrink: 0 }}>Overdue</span>}

            {task.deadline && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.77rem', color: isOverdue ? '#ef4444' : '#64748b', flexShrink: 0, whiteSpace: 'nowrap' }}>
                    <Calendar size={11} /> {formatDate(task.deadline)}
                </span>
            )}

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

const ProjectGroup = ({ project, tasks, onEdit, onDelete, onToggleDone }) => {
    const [expanded, setExpanded] = useState(true);
    if (!tasks || tasks.length === 0) return null;
    return (
        <div style={{ background: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <div onClick={() => setExpanded(!expanded)} style={{ background: expanded ? '#f8fafc' : 'white', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', borderBottom: expanded ? '1px solid #e2e8f0' : 'none', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = expanded ? '#f8fafc' : 'white'}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div style={{ width: 38, height: 38, borderRadius: '0.6rem', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {project ? <LayoutGrid size={20} /> : <Folder size={20} />}
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 600 }}>{project ? project.name : 'Unassigned Project'}</h3>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} • {tasks.filter(t => t.status === 'APPROVED' || t.status === 'Done').length} completed</p>
                    </div>
                </div>
                <div style={{ color: '#94a3b8', background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.5rem', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </div>
            </div>
            {expanded && (
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#fcfcfd' }}>
                    {tasks.map(task => (
                        <TaskRow key={task._id} task={task} onEdit={onEdit} onDelete={onDelete} onToggleDone={onToggleDone} />
                    ))}
                </div>
            )}
        </div>
    );
};

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
    const [filterProject, setFilterProject] = useState('All');

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

    let filteredTasks = tasks;
    if (filterStatus !== 'All') {
        filteredTasks = filteredTasks.filter(t => t.status === filterStatus);
    }
    if (filterProject !== 'All') {
        filteredTasks = filteredTasks.filter(t => t.projectId?._id === filterProject);
    }

    const groupedTasks = filteredTasks.reduce((acc, task) => {
        const projId = task.projectId?._id || 'unassigned';
        if (!acc[projId]) {
            acc[projId] = {
                project: task.projectId,
                tasks: []
            };
        }
        acc[projId].tasks.push(task);
        return acc;
    }, {});

    const groupedList = Object.values(groupedTasks).sort((a, b) => {
        if (!a.project) return 1;
        if (!b.project) return -1;
        return a.project.name.localeCompare(b.project.name);
    });

    const doneCount = tasks.filter(t => t.status === 'APPROVED' || t.status === 'Done').length;
    const overdueCount = tasks.filter(t => t.deadline && new Date() > new Date(t.deadline) && t.status !== 'APPROVED').length;
    if (loading) return <PageSkeleton />;

    return (
        <SectionContainer>
            <PageHeader
                title="Tasks"
                subtitle={
                    <>
                        {tasks.length} total · {doneCount} approved
                        {overdueCount > 0 && <span style={{ color: 'var(--clr-danger-500)', marginLeft: '0.5rem' }}>· {overdueCount} overdue</span>}
                    </>
                }
                icon={ListTodo}
                actions={
                    <Button
                        icon={Plus}
                        onClick={() => { setEditingTask(null); setModalOpen(true); }}
                    >
                        New Task
                    </Button>
                }
            />

            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center', background: 'white', padding: '1rem 1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem', fontWeight: 600 }}>
                        <Filter size={16} /> Status
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {ALL_FILTER_OPTIONS.map(s => (
                            <button key={s} onClick={() => setFilterStatus(s)} style={{
                                padding: '0.35rem 0.85rem', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', border: 'none',
                                background: filterStatus === s ? '#2563eb' : '#f1f5f9',
                                color: filterStatus === s ? 'white' : '#475569',
                                transition: 'all 0.2s'
                            }}>
                                {s === 'All' ? 'All' : (STATUS_LABEL[s] || s)}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }} className="divider"></div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem', fontWeight: 600 }}>
                        <LayoutGrid size={16} /> Project
                    </div>
                    <select
                        value={filterProject}
                        onChange={(e) => setFilterProject(e.target.value)}
                        style={{ padding: '0.4rem 2rem 0.4rem 0.85rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#f8fafc', color: '#1e293b', outline: 'none', cursor: 'pointer', fontWeight: 500 }}
                    >
                        <option value="All">All Projects</option>
                        {projects.map(p => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {filteredTasks.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5rem 2rem', background: 'white', borderRadius: '1rem', border: '2px dashed #e2e8f0', textAlign: 'center' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: '#2563eb' }}><ListTodo size={28} /></div>
                    <h3 style={{ margin: '0 0 0.5rem', color: '#1e293b' }}>{filterStatus === 'All' && filterProject === 'All' ? 'No tasks yet' : `No tasks found for the selected filters`}</h3>
                    <p style={{ color: '#64748b', margin: '0 0 1.5rem' }}>{filterStatus === 'All' && filterProject === 'All' ? 'Create your first task to start tracking work' : 'Try adjusting your filters'}</p>
                    {filterStatus === 'All' && filterProject === 'All' && (
                        <button onClick={() => { setEditingTask(null); setModalOpen(true); }}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0.6rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
                            <Plus size={18} /> Create Task
                        </button>
                    )}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {groupedList.map(group => (
                        <ProjectGroup
                            key={group.project?._id || 'unassigned'}
                            project={group.project}
                            tasks={group.tasks}
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

        </SectionContainer>
    );
};

export default ManagerTasksPage;
