import React, { useState, useEffect } from 'react';
import api, { sprintApi } from '../../services/api';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { Calendar } from 'lucide-react';

const STATUS_OPTIONS = [
    { value: 'TODO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'SUBMITTED', label: 'Submitted' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
];

const PRIORITY_OPTIONS = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
];

const Field = ({ label, required, children, action }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '1.2rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>
                {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            {action}
        </div>
        {children}
    </div>
);

const inputStyle = {
    padding: '0.6rem 0.875rem',
    border: '1.5px solid #e2e8f0',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    outline: 'none',
    fontFamily: 'inherit',
    background: 'white',
    color: '#1e293b',
    width: '100%',
    boxSizing: 'border-box',
};

const TaskModal = ({ open, onClose, onSubmit, initialData, projectId, projects = [], tasks = [], loading }) => {
    const isEdit = !!initialData;

    const [form, setForm] = useState({
        title: '',
        description: '',
        projectId: projectId || '',
        status: 'TODO',
        priority: 'MEDIUM',
        teamId: '',
        assignedTo: '',
        deadline: '',
        startDate: '',
        estimatedHours: '',
        definitionOfDone: '',
        subtasks: [],
        sprintId: '',
        dependencies: [],
    });
    const [error, setError] = useState('');
    const [teams, setTeams] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [empLoading, setEmpLoading] = useState(false);
    const [sprints, setSprints] = useState([]);
    const [sprintsLoading, setSprintsLoading] = useState(false);
    const [newSubtask, setNewSubtask] = useState('');
    const [aiLoading, setAiLoading] = useState({
        description: false,
        definition: false,
        subtasks: false
    });
    const [aiGenerated, setAiGenerated] = useState({
        description: false,
        definition: false,
        subtasks: false
    });

    useEffect(() => {
        if (!open) return;
        api.get('/company/teams').then(r => setTeams(r.data || [])).catch(() => setTeams([]));
    }, [open]);

    useEffect(() => {
        if (!open || !form.projectId) {
            setSprints([]);
            return;
        }
        setSprintsLoading(true);
        sprintApi.getAll(form.projectId)
            .then(r => setSprints(r.data || []))
            .catch(() => setSprints([]))
            .finally(() => setSprintsLoading(false));
    }, [open, form.projectId]);

    useEffect(() => {
        if (!open) return;
        if (isEdit && initialData) {
            setForm({
                title: initialData.title || '',
                description: initialData.description || '',
                status: initialData.status || 'TODO',
                priority: initialData.priority || 'MEDIUM',
                teamId: initialData.teamId?._id || initialData.teamId || '',
                assignedTo: initialData.assignedTo?._id || initialData.assignedTo || '',
                deadline: initialData.deadline ? initialData.deadline.slice(0, 10) : '',
                startDate: initialData.startDate ? initialData.startDate.slice(0, 10) : '',
                estimatedHours: initialData.estimatedHours || '',
                definitionOfDone: initialData.definitionOfDone || '',
                subtasks: initialData.subtasks || [],
                projectId: initialData.projectId?._id || initialData.projectId || '',
                sprintId: initialData.sprintId?._id || initialData.sprintId || '',
                dependencies: initialData.dependencies?.map(d => typeof d === 'object' ? d._id : d) || [],
            });
            setAiGenerated({
                description: !!initialData.description,
                definition: !!initialData.definitionOfDone,
                subtasks: (initialData.subtasks && initialData.subtasks.length > 0)
            });
        } else {
            setForm({ title: '', description: '', projectId: projectId || (projects.length > 0 ? projects[0]._id : ''), sprintId: '', status: 'TODO', priority: 'MEDIUM', teamId: '', assignedTo: '', startDate: '', deadline: '', estimatedHours: '', definitionOfDone: '', subtasks: [], dependencies: [] });
            setAiGenerated({ description: false, definition: false, subtasks: false });
        }
        setError('');
        setNewSubtask('');
    }, [open, initialData]);

    const [conflict, setConflict] = useState(null);

    useEffect(() => {
        if (!form.assignedTo || !form.deadline) {
            setConflict(null);
            return;
        }

        const checkLeave = async () => {
            try {
                const res = await api.get('/leaves/conflicts', {
                    params: {
                        userId: form.assignedTo,
                        startDate: form.deadline,
                        endDate: form.deadline
                    }
                });
                if (res.data.hasConflict) {
                    setConflict(res.data.conflicts[0]);
                } else {
                    setConflict(null);
                }
            } catch (err) {
                console.error('Error checking leave conflict:', err);
                setConflict(null);
            }
        };

        const timer = setTimeout(checkLeave, 500);
        return () => clearTimeout(timer);
    }, [form.assignedTo, form.deadline]);

    useEffect(() => {
        if (!form.teamId) { setEmployees([]); return; }
        setEmpLoading(true);
        api.get(`/manager/employees?teamId=${form.teamId}`)
            .then(r => setEmployees(r.data || []))
            .catch(() => setEmployees([]))
            .finally(() => setEmpLoading(false));
    }, [form.teamId]);

    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

    const addSubtask = () => {
        if (!newSubtask.trim()) return;
        set('subtasks', [...form.subtasks, { title: newSubtask.trim(), isCompleted: false }]);
        setNewSubtask('');
    };

    const removeSubtask = (idx) => {
        set('subtasks', form.subtasks.filter((_, i) => i !== idx));
    };

    const handleAiGenerate = async (type) => {
        if (!form.title.trim()) {
            alert('Please enter a task title first');
            return;
        }

        const project = projects.find(p => p._id === form.projectId);
        const projectName = project ? project.name : 'Unknown Project';

        setAiLoading(prev => ({ ...prev, [type]: true }));
        try {
            const res = await api.post('/ai/generate-task-content', {
                title: form.title,
                projectName,
                type
            });

            if (type === 'description') {
                set('description', res.data.description.replace(/\*/g, ''));
            } else if (type === 'definition') {
                set('definitionOfDone', res.data.definitionOfDone.replace(/\*/g, ''));
            } else if (type === 'subtasks') {
                const newSubtasks = res.data.subtasks.map(title => ({ title: title.replace(/\*/g, ''), isCompleted: false }));
                set('subtasks', newSubtasks);
            }
            setAiGenerated(prev => ({ ...prev, [type]: true }));
        } catch (err) {
            console.error('AI Generation Error:', err);
            alert('Failed to generate content. Please try again or check your API key.');
        } finally {
            setAiLoading(prev => ({ ...prev, [type]: false }));
        }
    };

    const aiButtonStyle = (type) => {
        const isEnabled = form.title.trim() && !aiLoading[type];
        return {
            fontSize: '0.68rem',
            background: isEnabled
                ? (type === 'subtasks' ? 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)' : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)')
                : '#f8fafc',
            color: isEnabled
                ? (type === 'subtasks' ? '#7c3aed' : '#0369a1')
                : '#94a3b8',
            border: `1px solid ${isEnabled ? (type === 'subtasks' ? '#ddd6fe' : '#bae6fd') : '#e2e8f0'}`,
            borderRadius: '2rem',
            padding: '0.2rem 0.65rem',
            cursor: isEnabled ? 'pointer' : 'not-allowed',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            boxShadow: isEnabled ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
            transition: 'all 0.2s ease',
            outline: 'none',
            letterSpacing: '0.01em'
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) { setError('Task title is required.'); return; }
        if (!form.projectId) { setError('Please select a project.'); return; }
        setError('');
        const payload = {
            ...form,
            estimatedHours: form.estimatedHours ? Number(form.estimatedHours) : 0,
        };
        await onSubmit(payload);
    };

    if (!open) return null;

    return (
        <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
            onClick={onClose}
        >
            <div
                style={{ background: 'white', borderRadius: '1rem', width: '100%', maxWidth: 560, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 70px rgba(0,0,0,0.25)' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.4rem 1.75rem 1.1rem', borderBottom: '1px solid #f1f5f9' }}>
                    <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>{isEdit ? 'Edit Task' : 'New Task'}</h2>
                    <button onClick={onClose} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', color: '#64748b' }}><X size={16} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                        {error && (
                            <div style={{ padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', color: '#dc2626', fontSize: '0.875rem' }}>{error}</div>
                        )}

                        {/* Title */}
                        <Field label="Task Title" required>
                            <input
                                value={form.title}
                                onChange={e => set('title', e.target.value)}
                                placeholder="e.g. Design landing page"
                                autoFocus
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = '#2563eb'}
                                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                            />
                            {!form.title.trim() && (
                                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.25rem 0 0' }}>
                                    Enter task title to generate AI content.
                                </p>
                            )}
                        </Field>

                        {/* Project selection */}
                        {projects.length > 0 && (
                            <Field label="Project" required>
                                <select value={form.projectId} onChange={e => set('projectId', e.target.value)} style={inputStyle}>
                                    <option value="">Select project...</option>
                                    {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                </select>
                            </Field>
                        )}

                        {/* Sprint Selection */}
                        <Field label="Sprint">
                            <select
                                value={form.sprintId}
                                onChange={e => set('sprintId', e.target.value)}
                                style={{ ...inputStyle, opacity: sprintsLoading ? 0.6 : 1 }}
                                disabled={sprintsLoading || !form.projectId}
                            >
                                <option value="">{sprintsLoading ? 'Loading sprints...' : 'None (Backlog)'}</option>
                                {sprints.map(s => (
                                    <option key={s._id} value={s._id}>
                                        {s.status === 'active' ? '🔄 ' : ''}
                                        {s.name} ({s.status})
                                    </option>
                                ))}
                            </select>
                        </Field>

                        {/* Description */}
                        <Field
                            label="Description"
                            action={
                                <button
                                    type="button"
                                    onClick={() => handleAiGenerate('description')}
                                    disabled={aiLoading.description || !form.title.trim()}
                                    style={aiButtonStyle('description')}
                                >
                                    {aiLoading.description ? <Loader2 size={10} style={{ animation: 'spin 1s linear infinite' }} /> : '✨'}
                                    {aiGenerated.description ? 'Regenerate' : 'Generate with AI'}
                                </button>
                            }
                        >
                            <textarea
                                value={form.description}
                                onChange={e => set('description', e.target.value)}
                                rows={2}
                                placeholder="Optional description..."
                                style={{ ...inputStyle, resize: 'vertical' }}
                                onFocus={e => e.target.style.borderColor = '#2563eb'}
                                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                            />
                        </Field>

                        {/* Priority + Status */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <Field label="Priority">
                                <select value={form.priority} onChange={e => set('priority', e.target.value)} style={inputStyle}>
                                    {PRIORITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </Field>
                            <Field label="Status">
                                <select value={form.status} onChange={e => set('status', e.target.value)} style={inputStyle}>
                                    {STATUS_OPTIONS.map(o => <option key={o.value} value={o.label}>{o.label}</option>)}
                                </select>
                            </Field>
                        </div>

                        {/* Team → Employee */}
                        <Field label="Assign Team">
                            <select value={form.teamId} onChange={e => { set('teamId', e.target.value); set('assignedTo', ''); }} style={inputStyle}>
                                <option value="">Select team...</option>
                                {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                            </select>
                        </Field>

                        <Field label="Assign Employee">
                            <select
                                value={form.assignedTo}
                                onChange={e => set('assignedTo', e.target.value)}
                                disabled={!form.teamId || empLoading}
                                style={{ ...inputStyle, opacity: (!form.teamId || empLoading) ? 0.6 : 1, cursor: (!form.teamId || empLoading) ? 'not-allowed' : 'pointer' }}
                            >
                                <option value="">{empLoading ? 'Loading...' : !form.teamId ? 'Select a team first' : 'Select employee...'}</option>
                                {employees.map(e => (
                                    <option key={e._id} value={e._id}>
                                        {e.name}{e.empId ? ` (${e.empId})` : ''}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        {/* Dates + Est. Hours */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <Field label="Start Date">
                                <input
                                    type="date"
                                    value={form.startDate}
                                    onChange={e => set('startDate', e.target.value)}
                                    style={inputStyle}
                                />
                            </Field>
                            <Field label="Deadline">
                                <input
                                    type="date"
                                    value={form.deadline}
                                    onChange={e => set('deadline', e.target.value)}
                                    style={{ ...inputStyle, borderColor: conflict ? '#f59e0b' : '#e2e8f0' }}
                                />
                                {conflict && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#d97706', fontSize: '0.75rem', marginTop: '0.25rem', fontWeight: 600 }}>
                                        <AlertCircle size={14} />
                                        Employee is on leave
                                    </div>
                                )}
                            </Field>
                            <Field label="Est. Hours">
                                <input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={form.estimatedHours}
                                    onChange={e => set('estimatedHours', e.target.value)}
                                    placeholder="e.g. 8"
                                    style={inputStyle}
                                />
                            </Field>
                        </div>

                        {/* Definition of Done */}
                        <Field
                            label="Definition of Done"
                            action={
                                <button
                                    type="button"
                                    onClick={() => handleAiGenerate('definition')}
                                    disabled={aiLoading.definition || !form.title.trim()}
                                    style={aiButtonStyle('definition')}
                                >
                                    {aiLoading.definition ? <Loader2 size={10} style={{ animation: 'spin 1s linear infinite' }} /> : '✨'}
                                    {aiGenerated.definition ? 'Regenerate' : 'Generate with AI'}
                                </button>
                            }
                        >
                            <textarea
                                value={form.definitionOfDone}
                                onChange={e => set('definitionOfDone', e.target.value)}
                                rows={2}
                                placeholder="What constitutes completion?"
                                style={{ ...inputStyle, resize: 'vertical' }}
                            />
                        </Field>

                        {/* Subtasks */}
                        <Field
                            label="Subtasks"
                            action={
                                <button
                                    type="button"
                                    onClick={() => handleAiGenerate('subtasks')}
                                    disabled={aiLoading.subtasks || !form.title.trim()}
                                    style={aiButtonStyle('subtasks')}
                                >
                                    {aiLoading.subtasks ? <Loader2 size={10} style={{ animation: 'spin 1s linear infinite' }} /> : '✨'}
                                    {aiGenerated.subtasks ? 'Regenerate' : 'Auto-generate List'}
                                </button>
                            }
                        >
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <input
                                    value={newSubtask}
                                    onChange={e => setNewSubtask(e.target.value)}
                                    placeholder="Add a subtask..."
                                    style={inputStyle}
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                                />
                                <button
                                    type="button"
                                    onClick={addSubtask}
                                    style={{ padding: '0 1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Add
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                {form.subtasks.map((st, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '0.4rem', border: '1px solid #e2e8f0' }}>
                                        <span style={{ fontSize: '0.85rem', color: '#1e293b' }}>{st.title}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeSubtask(i)}
                                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1 }}
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </Field>

                        {/* Dependencies */}
                        <Field label="Dependencies (Tasks that must be completed first)">
                            <select
                                multiple
                                value={form.dependencies}
                                onChange={e => {
                                    const options = Array.from(e.target.selectedOptions, option => option.value);
                                    set('dependencies', options);
                                }}
                                style={{ ...inputStyle, height: '100px', resize: 'vertical' }}
                            >
                                {tasks.filter(t => t._id !== initialData?._id).map(t => (
                                    <option key={t._id} value={t._id}>
                                        {t.title} ({t.status})
                                    </option>
                                ))}
                            </select>
                            <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>Hold Ctrl/Cmd to select multiple. Current task cannot be started until these are APPROVED.</p>
                        </Field>

                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', padding: '1.1rem 1.75rem', borderTop: '1px solid #f1f5f9', background: '#f8fafc', borderRadius: '0 0 1rem 1rem' }}>
                        <button type="button" onClick={onClose} style={{ padding: '0.6rem 1.25rem', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#374151', cursor: 'pointer' }}>Cancel</button>
                        <button type="submit" disabled={loading} style={{ padding: '0.6rem 1.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            {loading ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : (isEdit ? 'Save Changes' : 'Create Task')}
                        </button>
                    </div>
                </form>
                <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
            </div >
        </div >
    );
};

export default TaskModal;
