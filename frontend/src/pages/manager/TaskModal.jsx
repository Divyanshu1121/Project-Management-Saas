import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { X, Loader2 } from 'lucide-react';

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

const Field = ({ label, required, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>
            {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
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

const TaskModal = ({ open, onClose, onSubmit, initialData, projectId, projects = [], loading }) => {
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
        estimatedHours: '',
        definitionOfDone: '',
        subtasks: [],
    });
    const [error, setError] = useState('');
    const [teams, setTeams] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [empLoading, setEmpLoading] = useState(false);
    const [newSubtask, setNewSubtask] = useState('');

    useEffect(() => {
        if (!open) return;
        api.get('/company/teams').then(r => setTeams(r.data || [])).catch(() => setTeams([]));
    }, [open]);

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
                estimatedHours: initialData.estimatedHours || '',
                definitionOfDone: initialData.definitionOfDone || '',
                subtasks: initialData.subtasks || [],
                projectId: initialData.projectId?._id || initialData.projectId || '',
            });
        } else {
            setForm({ title: '', description: '', projectId: projectId || (projects.length > 0 ? projects[0]._id : ''), status: 'TODO', priority: 'MEDIUM', teamId: '', assignedTo: '', deadline: '', estimatedHours: '', definitionOfDone: '', subtasks: [] });
        }
        setError('');
        setNewSubtask('');
    }, [open, initialData]);

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
                        </Field>

                        {/* Project selection (if projects provided) */}
                        {projects.length > 0 && (
                            <Field label="Project" required>
                                <select value={form.projectId} onChange={e => set('projectId', e.target.value)} style={inputStyle}>
                                    <option value="">Select project...</option>
                                    {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                </select>
                            </Field>
                        )}

                        {/* Description */}
                        <Field label="Description">
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
                                    {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </Field>
                        </div>

                        {/* Team → Employee (cascading) */}
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

                        {/* Deadline + Est. Hours */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <Field label="Deadline">
                                <input
                                    type="date"
                                    value={form.deadline}
                                    onChange={e => set('deadline', e.target.value)}
                                    style={inputStyle}
                                />
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
                        <Field label="Definition of Done">
                            <textarea
                                value={form.definitionOfDone}
                                onChange={e => set('definitionOfDone', e.target.value)}
                                rows={2}
                                placeholder="What constitutes completion?"
                                style={{ ...inputStyle, resize: 'vertical' }}
                            />
                        </Field>

                        {/* Subtasks */}
                        <Field label="Subtasks">
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
            </div>
        </div>
    );
};

export default TaskModal;
