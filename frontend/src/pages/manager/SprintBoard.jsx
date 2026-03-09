import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Plus, Play, CheckCircle2, MoreVertical, Calendar, Target, Layout as LayoutIcon, ArrowRightLeft, Info, Search, ListTodo } from 'lucide-react';
import { sprintApi } from '../../services/api';
import api from '../../services/api';
import SprintModal from './SprintModal';

const Column = ({ title, tasks, onAssign, onRemove }) => (
    <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '1rem', flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '0.75rem', border: '1.5px solid #f1f5f9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title} ({tasks.length})</h4>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
            {tasks.map(task => {
                const isBlocked = task.dependencies?.some(dep => dep.status !== 'APPROVED');
                return (
                    <div key={task._id} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.625rem', padding: '1rem', boxShadow: '0 1px 2px rgba(0,0,0,0.03)', transition: 'all 0.2s ease', cursor: 'grab' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', gap: '0.5rem' }}>
                            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', lineHeight: 1.4 }}>{task.title}</p>
                            <button onClick={() => onRemove(task._id)} style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }} title="Remove from sprint"><MoreVertical size={14} /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                            {isBlocked && (
                                <span style={{ padding: '0.15rem 0.4rem', borderRadius: '0.25rem', fontSize: '0.65rem', fontWeight: 700, background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', width: 'fit-content' }}>
                                    BLOCKED
                                </span>
                            )}
                            {task.assignedTo && <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: '#64748b' }}><div style={{ width: 14, height: 14, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{task.assignedTo.name?.[0]}</div>{task.assignedTo.name}</div>}
                        </div>
                    </div>
                );
            })}
            {tasks.length === 0 && <div style={{ border: '2px dashed #e2e8f0', padding: '1.5rem', borderRadius: '0.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>No tasks.</div>}
        </div>
    </div>
);

const SprintBoard = ({ projectId }) => {
    const [activeSprint, setActiveSprint] = useState(null);
    const [backlogTasks, setBacklogTasks] = useState([]);
    const [plannedSprints, setPlannedSprints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sprintModalOpen, setSprintModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState('board'); // 'board' or 'backlog'

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const [activeRes, allSprintsRes, allTasksRes] = await Promise.all([
                sprintApi.getActive(projectId),
                sprintApi.getAll(projectId),
                api.get(`/manager/tasks?projectId=${projectId}`)
            ]);

            setActiveSprint(activeRes.data);
            setPlannedSprints(allSprintsRes.data.filter(s => s.status === 'planned'));
            setBacklogTasks(allTasksRes.data.filter(t => !t.sprintId));
        } catch (err) {
            console.error('Failed to load sprint board', err);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const handleStartSprint = async (sprintId) => {
        if (!window.confirm('Start this sprint? No other sprint can be active.')) return;
        try {
            await sprintApi.start(sprintId);
            refresh();
        } catch (err) { alert(err.response?.data?.message || 'Failed to start sprint'); }
    };

    const handleCompleteSprint = async (sprintId) => {
        if (!window.confirm('Complete this sprint?')) return;
        try {
            await sprintApi.complete(sprintId);
            refresh();
        } catch (err) { alert(err.response?.data?.message || 'Failed to complete sprint'); }
    };

    const handleAssignToSprint = async (taskId, sprintId) => {
        try {
            await sprintApi.assignTask(taskId, sprintId);
            refresh();
        } catch (err) { alert(err.response?.data?.message || 'Failed to assign task'); }
    };

    const handleRemoveFromSprint = async (taskId) => {
        try {
            await sprintApi.removeTask(taskId);
            refresh();
        } catch (err) { alert(err.response?.data?.message || 'Failed to remove task'); }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <Loader2 className="animate-spin" size={32} color="#2563eb" />
        </div>
    );

    const inputStyle = {
        padding: '0.45rem 0.75rem',
        border: '1.5px solid #e2e8f0',
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
        color: '#1e293b',
        outline: 'none',
        fontFamily: 'inherit',
        background: 'white',
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>

            {/* Header / Tabs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <button onClick={() => setViewMode('board')} style={{ border: 'none', background: 'none', fontWeight: 700, fontSize: '0.9rem', color: viewMode === 'board' ? '#2563eb' : '#64748b', borderBottom: viewMode === 'board' ? '3px solid #2563eb' : '3px solid transparent', paddingBottom: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><LayoutIcon size={18} /> Active Sprint</button>
                    <button onClick={() => setViewMode('backlog')} style={{ border: 'none', background: 'none', fontWeight: 700, fontSize: '0.9rem', color: viewMode === 'backlog' ? '#2563eb' : '#64748b', borderBottom: viewMode === 'backlog' ? '3px solid #2563eb' : '3px solid transparent', paddingBottom: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ListTodo size={18} /> Backlog & Planning</button>
                </div>
                <button onClick={() => setSprintModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#2563eb', color: 'white', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}><Plus size={18} /> Plan Sprint</button>
            </div>

            {viewMode === 'board' ? (
                <>
                    {activeSprint ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ background: 'white', border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>{activeSprint.name}</h2>
                                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '2rem', background: '#dcfce7', color: '#166534', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ACTIVE</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>{activeSprint.goal}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#64748b' }}>
                                        <div style={{ fontWeight: 600, color: '#1e293b' }}><Calendar size={13} style={{ marginRight: 4 }} /> {new Date(activeSprint.endDate).toLocaleDateString()}</div>
                                        <div>Ends in {Math.ceil((new Date(activeSprint.endDate) - new Date()) / (1000 * 60 * 60 * 24))} days</div>
                                    </div>
                                    <button onClick={() => handleCompleteSprint(activeSprint._id)} style={{ padding: '0.65rem 1.25rem', background: '#1e293b', color: 'white', border: 'none', borderRadius: '0.6rem', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} /> Complete Sprint</button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                                <Column title="To Do" tasks={activeSprint.tasks?.filter(t => t.status === 'TODO') || []} onRemove={handleRemoveFromSprint} />
                                <Column title="In Progress" tasks={activeSprint.tasks?.filter(t => t.status === 'IN_PROGRESS') || []} onRemove={handleRemoveFromSprint} />
                                <Column title="Submitted" tasks={activeSprint.tasks?.filter(t => t.status === 'SUBMITTED') || []} onRemove={handleRemoveFromSprint} />
                                <Column title="Done" tasks={activeSprint.tasks?.filter(t => t.status === 'APPROVED') || []} onRemove={handleRemoveFromSprint} />
                            </div>
                        </div>
                    ) : (
                        <div style={{ padding: '5rem 2rem', textAlign: 'center', background: '#fff', border: '2px dashed #e2e8f0', borderRadius: '1rem', color: '#94a3b8' }}>
                            <LayoutIcon size={48} style={{ marginBottom: '1.5rem', opacity: 0.2 }} />
                            <h3>No Active Sprint</h3>
                            <p style={{ maxWidth: '400px', margin: '0.5rem auto 1.5rem' }}>You don't have an active sprint. Go to the backlog and start one of your planned sprints to see the board.</p>
                            <button onClick={() => setViewMode('backlog')} style={{ padding: '0.75rem 1.5rem', background: '#f1f5f9', color: '#1e293b', border: 'none', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer' }}>Go to BacklogView</button>
                        </div>
                    )}
                </>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>

                    {/* Backlog Tasks */}
                    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', overflow: 'hidden' }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Product Backlog ({backlogTasks.length})</h3>
                            <div style={{ position: 'relative' }}>
                                <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input placeholder="Search tasks..." style={{ ...inputStyle, paddingLeft: '2.25rem', width: '200px', height: '34px', fontSize: '0.8rem' }} />
                            </div>
                        </div>
                        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '600px', overflowY: 'auto' }}>
                            {backlogTasks.map(task => (
                                <div key={task._id} style={{ padding: '0.875rem 1.25rem', border: '1px solid #f1f5f9', borderRadius: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>{task.title}</p>
                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.2rem' }}>
                                            <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>#{task._id.slice(-4).toUpperCase()}</span>
                                            {task.priority && <span style={{ fontSize: '0.7rem', fontWeight: 800, color: task.priority === 'URGENT' ? '#ef4444' : '#64748b' }}>{task.priority}</span>}
                                        </div>
                                    </div>
                                    <select
                                        defaultValue=""
                                        onChange={(e) => handleAssignToSprint(task._id, e.target.value)}
                                        style={{ ...inputStyle, width: 'auto', minWidth: '130px', background: '#eff6ff', border: '1px solid #dbeafe', color: '#2563eb', fontWeight: 700, fontSize: '0.75rem' }}
                                    >
                                        <option value="" disabled>Move to Sprint...</option>
                                        {activeSprint && <option value={activeSprint._id}>ACTIVE: {activeSprint.name}</option>}
                                        {plannedSprints.map(s => <option key={s._id} value={s._id}>Planned: {s.name}</option>)}
                                    </select>
                                </div>
                            ))}
                            {backlogTasks.length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}><Info size={32} style={{ opacity: 0.1, marginBottom: '1rem' }} /><p>The backlog is empty.</p></div>}
                        </div>
                    </div>

                    {/* Planned Sprints */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Plans & Future Sprints</h3>
                        {plannedSprints.map(sprint => (
                            <div key={sprint._id} style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#92400e' }}>{sprint.name}</h4>
                                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#b45309', opacity: 0.8 }}>{sprint.goal}</p>
                                    </div>
                                    <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#d97706', padding: '0.2rem 0.5rem', background: 'white', borderRadius: '2rem', border: '1px solid #fde68a' }}>PLANNED</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: 600 }}><Calendar size={12} style={{ marginRight: 4 }} /> {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}</div>
                                    <button onClick={() => handleStartSprint(sprint._id)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: '#92400e', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}><Play size={12} fill="white" /> Start Sprint</button>
                                </div>
                            </div>
                        ))}
                        {plannedSprints.length === 0 && (
                            <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '1rem', textAlign: 'center', border: '1px dashed #e2e8f0' }}>
                                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>No future sprints planned.</p>
                                <button onClick={() => setSprintModalOpen(true)} style={{ marginTop: '0.75rem', background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>+ Plan a Sprint</button>
                            </div>
                        )}
                    </div>

                </div>
            )}

            <SprintModal
                open={sprintModalOpen}
                onClose={() => setSprintModalOpen(false)}
                projectId={projectId}
                onSprintCreated={refresh}
            />

            <style>{`
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default SprintBoard;
