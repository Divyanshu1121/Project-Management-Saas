import React, { useState, useEffect, useMemo } from 'react';
import { Gantt, ViewMode } from 'gantt-task-react';
import "gantt-task-react/dist/index.css";
import { Loader2, Calendar, Layout, List, Layers, Info, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import TaskModal from './TaskModal';

const TimelineView = ({ projectId }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState(ViewMode.Week);
    const [selectedTask, setSelectedTask] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [projects, setProjects] = useState([]);
    const [teams, setTeams] = useState([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [tRes, pRes, teamRes] = await Promise.all([
                api.get(`/manager/tasks?projectId=${projectId}`),
                api.get('/manager/projects'),
                api.get('/company/teams')
            ]);
            setTasks(tRes.data || []);
            setProjects(pRes.data || []);
            setTeams(teamRes.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (projectId) fetchData();
    }, [projectId]);

    const ganttTasks = useMemo(() => {
        if (!tasks.length) return [];

        // Sort tasks by sprint and then by start date
        const sorted = [...tasks].sort((a, b) => {
            const sprintA = a.sprintId?.name || 'Backlog';
            const sprintB = b.sprintId?.name || 'Backlog';
            if (sprintA !== sprintB) return sprintA.localeCompare(sprintB);
            return new Date(a.startDate || a.createdAt) - new Date(b.startDate || b.createdAt);
        });

        const mapped = sorted.map(t => {
            const start = t.startDate ? new Date(t.startDate) : new Date(t.createdAt);
            const end = t.deadline ? new Date(t.deadline) : new Date(start.getTime() + 24 * 60 * 60 * 1000);

            // If it's a blocked task, we'll mark it visually via status colors
            const isBlocked = t.dependencies?.some(dep => dep.status !== 'APPROVED');

            return {
                start,
                end,
                name: t.title,
                id: t._id,
                type: 'task',
                progress: t.progress || 0,
                dependencies: t.dependencies?.map(d => typeof d === 'object' ? d._id : d) || [],
                isDisabled: t.status === 'APPROVED',
                styles: {
                    progressColor: t.status === 'APPROVED' ? '#22c55e' : (isBlocked ? '#fca5a5' : '#3b82f6'),
                    progressSelectedColor: '#2563eb',
                    backgroundColor: t.status === 'APPROVED' ? '#dcfce7' : (isBlocked ? '#fee2e2' : '#eff6ff'),
                    backgroundSelectedColor: '#dbeafe',
                },
                // Custom fields for tooltip
                original: t
            };
        });

        // Group by sprint if possible
        // The library doesn't strictly support groups easily without "project" type tasks,
        // so we'll just sort them as above for now.

        return mapped;
    }, [tasks]);

    const handleTaskChange = async (task) => {
        try {
            const res = await api.put(`/manager/tasks/${task.id}`, {
                startDate: task.start.toISOString(),
                deadline: task.end.toISOString()
            });
            setTasks(prev => prev.map(t => t._id === task.id ? res.data : t));
        } catch (e) {
            alert(e.response?.data?.message || 'Failed to update task dates');
            fetchData(); // Rollback local state
        }
    };

    const handleProgressChange = async (task) => {
        // We don't want managers to just drag progress usually, they should complete subtasks
        // but for Gantt we can allow it if needed.
    };

    const handleSelect = (task) => {
        const original = tasks.find(t => t._id === task.id);
        if (original) {
            setSelectedTask(original);
            setModalOpen(true);
        }
    };

    if (loading) return (
        <div style={{ padding: '4rem', textAlign: 'center' }}>
            <Loader2 className="animate-spin" size={32} color="#2563eb" />
            <p style={{ marginTop: '1rem', color: '#64748b' }}>Generating timeline...</p>
        </div>
    );

    return (
        <div style={{ background: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '0.75rem', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                        <Layers size={20} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>Project Timeline</h2>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Plan your schedule and manage dependencies</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', background: '#fff', padding: '0.25rem', borderRadius: '0.6rem', border: '1px solid #e2e8f0' }}>
                    <button onClick={() => setView(ViewMode.Month)} style={viewBtnStyle(view === ViewMode.Month)}>Month</button>
                    <button onClick={() => setView(ViewMode.Week)} style={viewBtnStyle(view === ViewMode.Week)}>Week</button>
                    <button onClick={() => setView(ViewMode.Day)} style={viewBtnStyle(view === ViewMode.Day)}>Day</button>
                </div>
            </div>

            <div style={{ flex: 1, overflow: 'auto' }}>
                {ganttTasks.length > 0 ? (
                    <Gantt
                        tasks={ganttTasks}
                        viewMode={view}
                        onDateChange={handleTaskChange}
                        onProgressChange={handleProgressChange}
                        onSelect={handleSelect}
                        listCellWidth="200px"
                        columnWidth={view === ViewMode.Month ? 200 : 70}
                        fontSize="12px"
                        barCornerRadius={4}
                        barFill={60}
                        projectBackgroundColor="#f1f5f9"
                        projectProgressColor="#3b82f6"
                        projectProgressSelectedColor="#2563eb"
                        arrowColor="#cbd5e1"
                        arrowIndent={20}
                        todayColor="rgba(37, 99, 235, 0.05)"
                        TooltipContent={CustomTooltip}
                    />
                ) : (
                    <div style={{ padding: '5rem', textAlign: 'center', color: '#94a3b8' }}>
                        <Calendar size={48} style={{ marginBottom: '1.5rem', opacity: 0.2 }} />
                        <h3>No Tasks Scheduled</h3>
                        <p>Assign start dates and deadlines to tasks to see them on the timeline.</p>
                    </div>
                )}
            </div>

            <div style={{ padding: '0.75rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '1.5rem', fontSize: '0.75rem' }}>
                <Legend color="#3b82f6" label="In Progress" />
                <Legend color="#22c55e" label="Completed" />
                <Legend color="#ef4444" label="Blocked" dash />
                <Legend color="#cbd5e1" label="Dependency" arrow />
            </div>

            {modalOpen && (
                <TaskModal
                    open={modalOpen}
                    onClose={() => { setModalOpen(false); setSelectedTask(null); }}
                    onSubmit={async (form) => {
                        try {
                            const res = await api.put(`/manager/tasks/${selectedTask._id}`, form);
                            setTasks(prev => prev.map(t => t._id === res.data._id ? res.data : t));
                            setModalOpen(false);
                            setSelectedTask(null);
                        } catch (e) { alert(e.response?.data?.message || 'Error saving'); }
                    }}
                    initialData={selectedTask}
                    projects={projects}
                    teams={teams}
                    tasks={tasks}
                    loading={false}
                />
            )}
        </div>
    );
};

const viewBtnStyle = (active) => ({
    padding: '0.4rem 0.8rem',
    borderRadius: '0.4rem',
    border: 'none',
    background: active ? '#2563eb' : 'transparent',
    color: active ? 'white' : '#64748b',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s'
});

const Legend = ({ color, label, dash, arrow }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontWeight: 500 }}>
        {arrow ? (
            <div style={{ width: 15, height: 2, background: color, position: 'relative' }}>
                <div style={{ position: 'absolute', right: -2, top: -2, width: 0, height: 0, borderTop: '3px solid transparent', borderBottom: '3px solid transparent', borderLeft: `5px solid ${color}` }} />
            </div>
        ) : (
            <div style={{ width: 12, height: 12, borderRadius: 3, background: color, border: dash ? '1px dashed #ef4444' : 'none' }} />
        )}
        {label}
    </div>
);

const CustomTooltip = ({ task, fontSize, fontFamily }) => {
    const t = task.original;
    const start = task.start.toLocaleDateString();
    const end = task.end.toLocaleDateString();
    const isBlocked = t.dependencies?.some(dep => dep.status !== 'APPROVED');

    return (
        <div style={{ background: 'white', padding: '0.75rem', borderRadius: '0.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', fontSize }}>
            <p style={{ margin: '0 0 0.4rem', fontWeight: 800, color: '#1e293b' }}>{task.name}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', color: '#64748b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                    <span>Period:</span>
                    <span style={{ fontWeight: 600 }}>{start} - {end}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                    <span>Status:</span>
                    <span style={{ fontWeight: 700, color: t.status === 'APPROVED' ? '#16a34a' : (isBlocked ? '#dc2626' : '#2563eb') }}>{t.status}</span>
                </div>
                {isBlocked && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#dc2626', marginTop: '0.25rem', fontWeight: 700 }}>
                        <AlertCircle size={12} /> BLOCKED
                    </div>
                )}
            </div>
        </div>
    );
};

export default TimelineView;
