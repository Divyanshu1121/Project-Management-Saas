import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
    Plus, Pencil, Trash2, X, Calendar,
    Users, AlertTriangle, Loader2, FolderOpen, Clock, User, Tag, ChevronRight
} from 'lucide-react';
import './ProjectsPage.css';

const STATUS_OPTIONS = ['PLANNING', 'ACTIVE', 'COMPLETED', 'ON_HOLD'];

const statusClass = (status) => ({
    'PLANNING': 'status-planning',
    'ACTIVE': 'status-active',
    'COMPLETED': 'status-completed',
    'ON_HOLD': 'status-on-hold',
}[status] || 'status-planning');

const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatDateTime = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// ── Project Detail Modal ─────────────────────────────────────────
const ProjectDetailModal = ({ project, onClose, onEdit, onDelete }) => {
    if (!project) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box detail-modal-box" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                            <h2 style={{ margin: 0, fontSize: '1.2rem', wordBreak: 'break-word' }}>{project.name}</h2>
                            <span className={`project-status-badge ${statusClass(project.status)}`} style={{ marginTop: '0.35rem', display: 'inline-flex', width: 'fit-content' }}>
                                {project.status}
                            </span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                        <button
                            className="btn-icon"
                            onClick={() => { onClose(); onEdit(project); }}
                            title="Edit project"
                            style={{ width: 36, height: 36 }}
                        >
                            <Pencil size={15} />
                        </button>
                        <button
                            className="btn-icon danger"
                            onClick={() => { onClose(); onDelete(project); }}
                            title="Delete project"
                            style={{ width: 36, height: 36 }}
                        >
                            <Trash2 size={15} />
                        </button>
                        <button className="modal-close-btn" onClick={onClose}><X size={16} /></button>
                    </div>
                </div>

                {/* Body */}
                <div className="modal-body" style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    {/* Description */}
                    <div className="detail-section">
                        <p className="detail-label">Description</p>
                        <p className="detail-value">
                            {project.description || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No description provided</span>}
                        </p>
                    </div>

                    <hr className="detail-divider" />

                    {/* Timeline */}
                    <div className="detail-grid-2">
                        <div className="detail-section">
                            <p className="detail-label">
                                <Calendar size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />
                                Start Date
                            </p>
                            <p className="detail-value">{formatDate(project.startDate)}</p>
                        </div>
                        <div className="detail-section">
                            <p className="detail-label">
                                <Calendar size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />
                                End Date
                            </p>
                            <p className="detail-value">{formatDate(project.deadline)}</p>
                        </div>
                    </div>

                    <hr className="detail-divider" />

                    {/* Teams */}
                    <div className="detail-section">
                        <p className="detail-label">
                            <Users size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />
                            Teams Assigned
                        </p>
                        {project.teamAssigned?.length > 0 ? (
                            <div className="project-teams-row" style={{ marginTop: '0.4rem' }}>
                                {project.teamAssigned.map(t => (
                                    <span key={t._id} className="team-badge">{t.name}</span>
                                ))}
                            </div>
                        ) : (
                            <p className="detail-value" style={{ color: '#94a3b8', fontStyle: 'italic' }}>No teams assigned</p>
                        )}
                    </div>

                    <hr className="detail-divider" />

                    {/* Meta */}
                    <div className="detail-grid-2">
                        <div className="detail-section">
                            <p className="detail-label">
                                <User size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />
                                Created By
                            </p>
                            <p className="detail-value">{project.createdBy?.name || '—'}</p>
                        </div>
                        <div className="detail-section">
                            <p className="detail-label">
                                <Tag size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />
                                Status
                            </p>
                            <span className={`project-status-badge ${statusClass(project.status)}`} style={{ marginTop: '0.4rem', display: 'inline-flex', width: 'fit-content' }}>
                                {project.status}
                            </span>
                        </div>
                    </div>

                    <hr className="detail-divider" />

                    {/* Timestamps */}
                    <div className="detail-grid-2">
                        <div className="detail-section">
                            <p className="detail-label">
                                <Clock size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />
                                Created At
                            </p>
                            <p className="detail-value" style={{ fontSize: '0.82rem' }}>{formatDateTime(project.createdAt)}</p>
                        </div>
                        <div className="detail-section">
                            <p className="detail-label">
                                <Clock size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />
                                Last Updated
                            </p>
                            <p className="detail-value" style={{ fontSize: '0.82rem' }}>{formatDateTime(project.updatedAt)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Project Form Modal ───────────────────────────────────────────
const ProjectModal = ({ open, onClose, onSubmit, initialData, teams, loading }) => {
    const isEdit = !!initialData;

    const emptyForm = {
        name: '',
        description: '',
        status: 'PLANNING',
        startDate: '',
        deadline: '',
        teamAssigned: [],
    };

    const [form, setForm] = useState(emptyForm);
    const [error, setError] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiGenerated, setAiGenerated] = useState(false);

    useEffect(() => {
        if (open) {
            if (isEdit && initialData) {
                setForm({
                    name: initialData.name || '',
                    description: initialData.description || '',
                    status: initialData.status || 'PLANNING',
                    startDate: initialData.startDate ? initialData.startDate.slice(0, 10) : '',
                    deadline: initialData.deadline ? initialData.deadline.slice(0, 10) : '',
                    teamAssigned: (initialData.teamAssigned || []).map(t => t._id || t),
                });
                setAiGenerated(!!initialData.description);
            } else {
                setForm(emptyForm);
                setAiGenerated(false);
            }
            setError('');
        }
    }, [open, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const toggleTeam = (id) => {
        setForm(prev => ({
            ...prev,
            teamAssigned: prev.teamAssigned.includes(id)
                ? prev.teamAssigned.filter(t => t !== id)
                : [...prev.teamAssigned, id],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) { setError('Project name is required.'); return; }
        setError('');
        await onSubmit(form);
    };

    const handleAiGenerate = async () => {
        if (!form.name.trim()) {
            alert('Please enter a project name first');
            return;
        }

        setAiLoading(true);
        try {
            const res = await api.post('/ai/generate-task-content', {
                title: form.name,
                projectName: form.name,
                type: 'project_description'
            });

            setForm(prev => ({ ...prev, description: res.data.project_description.replace(/\*/g, '') }));
            setAiGenerated(true);
        } catch (err) {
            console.error('AI Generation Error:', err);
            alert('Failed to generate content. Please try again or check your API key.');
        } finally {
            setAiLoading(false);
        }
    };

    const aiButtonStyle = {
        fontSize: '0.68rem',
        background: form.name.trim() && !aiLoading
            ? 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
            : '#f8fafc',
        color: form.name.trim() && !aiLoading
            ? '#0369a1'
            : '#94a3b8',
        border: `1px solid ${form.name.trim() && !aiLoading ? '#bae6fd' : '#e2e8f0'}`,
        borderRadius: '2rem',
        padding: '0.2rem 0.65rem',
        cursor: form.name.trim() && !aiLoading ? 'pointer' : 'not-allowed',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem',
        boxShadow: form.name.trim() && !aiLoading ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
        transition: 'all 0.2s ease',
        outline: 'none',
        letterSpacing: '0.01em'
    };

    if (!open) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isEdit ? 'Edit Project' : 'Create New Project'}</h2>
                    <button className="modal-close-btn" onClick={onClose}><X size={16} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && <div className="alert-error">{error}</div>}

                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label required">Project Name</label>
                                <input
                                    className="form-input"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Website Redesign"
                                    autoFocus
                                />
                            </div>

                            <div className="form-group">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label className="form-label">Description</label>
                                    <button
                                        type="button"
                                        onClick={handleAiGenerate}
                                        disabled={aiLoading || !form.name.trim()}
                                        style={aiButtonStyle}
                                    >
                                        {aiLoading ? <Loader2 size={10} style={{ animation: 'spin 1s linear infinite' }} /> : '✨'}
                                        {aiGenerated ? 'Regenerate' : 'Generate with AI'}
                                    </button>
                                </div>
                                <textarea
                                    className="form-textarea"
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Brief description of the project..."
                                    rows={3}
                                />
                            </div>

                            <div className="form-row-2">
                                <div className="form-group">
                                    <label className="form-label">Start Date</label>
                                    <input
                                        className="form-input"
                                        type="date"
                                        name="startDate"
                                        value={form.startDate}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">End Date</label>
                                    <input
                                        className="form-input"
                                        type="date"
                                        name="deadline"
                                        value={form.deadline}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select
                                    className="form-select"
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                >
                                    {STATUS_OPTIONS.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Team Assigned</label>
                                {teams.length === 0 ? (
                                    <p className="form-hint">No teams available. Create teams in the Company panel first.</p>
                                ) : (
                                    <div className="teams-multiselect">
                                        {teams.map(team => (
                                            <label key={team._id} className="team-option">
                                                <input
                                                    type="checkbox"
                                                    checked={form.teamAssigned.includes(team._id)}
                                                    onChange={() => toggleTeam(team._id)}
                                                />
                                                <span className="team-option-label">{team.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                                <span className="form-hint">Select one or more teams</span>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : (isEdit ? 'Save Changes' : 'Create Project')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ── Delete confirmation ──────────────────────────────────────────
const DeleteConfirm = ({ project, onCancel, onConfirm, loading }) => (
    <div className="confirm-overlay">
        <div className="confirm-box">
            <div className="confirm-icon"><AlertTriangle size={24} /></div>
            <h3>Delete Project?</h3>
            <p>
                <strong>"{project.name}"</strong> and all its associated tasks will be
                permanently deleted. This action cannot be undone.
            </p>
            <div className="confirm-actions">
                <button className="btn-cancel" onClick={onCancel}>Cancel</button>
                <button className="btn-delete-confirm" onClick={onConfirm} disabled={loading}>
                    {loading ? 'Deleting...' : 'Yes, Delete'}
                </button>
            </div>
        </div>
    </div>
);

// ── Project Card ─────────────────────────────────────────────────
const ProjectCard = ({ project, onView, onEdit, onDelete }) => (
    <div className="project-card" onClick={() => onView(project)} style={{ cursor: 'pointer' }}>
        <div className="project-card-header">
            <div className="project-card-title-row">
                <h3 className="project-card-name">{project.name}</h3>
                <span className={`project-status-badge ${statusClass(project.status)}`}>
                    {project.status}
                </span>
            </div>
            <div className="project-card-actions" onClick={e => e.stopPropagation()}>
                <button className="btn-icon" onClick={() => onEdit(project)} title="Edit">
                    <Pencil size={14} />
                </button>
                <button className="btn-icon danger" onClick={() => onDelete(project)} title="Delete">
                    <Trash2 size={14} />
                </button>
            </div>
        </div>

        {project.description && (
            <p className="project-description">{project.description}</p>
        )}

        <div className="project-meta">
            {(project.startDate || project.deadline) && (
                <div className="project-meta-row">
                    <Calendar size={13} />
                    <span>
                        {project.startDate ? formatDate(project.startDate) : 'No start'} → {project.deadline ? formatDate(project.deadline) : 'No end'}
                    </span>
                </div>
            )}
            {project.teamAssigned?.length > 0 && (
                <div className="project-meta-row">
                    <Users size={13} />
                    <div className="project-teams-row">
                        {project.teamAssigned.map(t => (
                            <span key={t._id} className="team-badge">{t.name}</span>
                        ))}
                    </div>
                </div>
            )}
            {project.createdBy && (
                <div className="project-meta-row">
                    <User size={13} />
                    <span>Created by {project.createdBy.name}</span>
                </div>
            )}
        </div>

        <p className="card-click-hint">Click to view full details</p>
    </div>
);

// ── Main Projects Page ───────────────────────────────────────────
const ProjectsPage = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [teams, setTeams] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [deletingProject, setDeletingProject] = useState(null);

    const fetchData = useCallback(async () => {
        setPageLoading(true);
        try {
            const [projRes, teamRes] = await Promise.all([
                api.get('/manager/projects'),
                api.get('/company/teams'),
            ]);
            setProjects(projRes.data);
            setTeams(teamRes.data || []);
        } catch (err) {
            console.error('Error fetching projects/teams:', err);
            setTeams([]);
        } finally {
            setPageLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleCreate = () => {
        setEditingProject(null);
        setModalOpen(true);
    };

    const handleEdit = (project) => {
        setEditingProject(project);
        setModalOpen(true);
    };

    const handleDeleteClick = (project) => {
        setDeletingProject(project);
    };

    const handleView = (project) => {
        navigate(`/manager/projects/${project._id}`);
    };

    const handleSubmit = async (formData) => {
        setSubmitting(true);
        try {
            if (editingProject) {
                const res = await api.put(`/manager/projects/${editingProject._id}`, formData);
                setProjects(prev => prev.map(p => p._id === res.data._id ? res.data : p));
            } else {
                const res = await api.post('/manager/projects', formData);
                setProjects(prev => [res.data, ...prev]);
            }
            setModalOpen(false);
        } catch (err) {
            console.error('Error saving project:', err);
            alert(err.response?.data?.message || 'Failed to save project');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deletingProject) return;
        setDeleting(true);
        try {
            await api.delete(`/manager/projects/${deletingProject._id}`);
            setProjects(prev => prev.filter(p => p._id !== deletingProject._id));
            setDeletingProject(null);
        } catch (err) {
            console.error('Error deleting project:', err);
            alert(err.response?.data?.message || 'Failed to delete project');
        } finally {
            setDeleting(false);
        }
    };

    const counts = {
        all: projects.length,
        active: projects.filter(p => p.status === 'ACTIVE').length,
        planning: projects.filter(p => p.status === 'PLANNING').length,
        completed: projects.filter(p => p.status === 'COMPLETED').length,
    };

    if (pageLoading) {
        return (
            <div className="projects-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: '#64748b' }}>
                    <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#2563eb' }} />
                    <p style={{ margin: 0 }}>Loading projects...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="projects-page">
            {/* Header */}
            <div className="projects-header">
                <div className="projects-header-left">
                    <h1>Projects</h1>
                    <p>Manage and track all your project work</p>
                </div>
                <button className="btn-create-project" onClick={handleCreate}>
                    <Plus size={18} />
                    New Project
                </button>
            </div>

            {/* Stats pills */}
            {projects.length > 0 && (
                <div className="projects-stats">
                    <div className="stat-pill">
                        <span className="stat-pill-dot" style={{ background: '#64748b' }} />
                        {counts.all} Total
                    </div>
                    <div className="stat-pill">
                        <span className="stat-pill-dot" style={{ background: '#22c55e' }} />
                        {counts.active} Active
                    </div>
                    <div className="stat-pill">
                        <span className="stat-pill-dot" style={{ background: '#eab308' }} />
                        {counts.planning} Planning
                    </div>
                    <div className="stat-pill">
                        <span className="stat-pill-dot" style={{ background: '#3b82f6' }} />
                        {counts.completed} Completed
                    </div>
                </div>
            )}

            {/* Empty state */}
            {projects.length === 0 ? (
                <div className="projects-empty">
                    <div className="projects-empty-icon">
                        <FolderOpen size={28} />
                    </div>
                    <h3>No projects yet</h3>
                    <p>Create your first project to get started managing your work</p>
                    <button className="btn-create-project" onClick={handleCreate}>
                        <Plus size={18} />
                        Create First Project
                    </button>
                </div>
            ) : (
                <div className="projects-grid">
                    {projects.map(project => (
                        <ProjectCard
                            key={project._id}
                            project={project}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDeleteClick}
                        />
                    ))}
                </div>
            )}

            {/* Detail Modal removed — card click now navigates to /manager/projects/:id */}

            {/* Create / Edit Modal */}
            <ProjectModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={editingProject}
                teams={teams}
                loading={submitting}
            />

            {/* Delete Confirm */}
            {deletingProject && (
                <DeleteConfirm
                    project={deletingProject}
                    onCancel={() => setDeletingProject(null)}
                    onConfirm={handleDeleteConfirm}
                    loading={deleting}
                />
            )}

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default ProjectsPage;
