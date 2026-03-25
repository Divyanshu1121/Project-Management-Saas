import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FileText, ArrowLeft, Loader2, Sparkles, AlertTriangle,
    ListChecks, Calendar, Target, Code, Users, Paperclip, Check, Save, X, Trash2
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const SECTIONS = [
    { id: 'overview', label: 'Project Overview', icon: FileText, aiActions: ['summarize', 'improve'] },
    { id: 'requirements', label: 'Requirements', icon: ListChecks, aiActions: ['generate_reqs', 'improve'] },
    { id: 'plan', label: 'Project Plan', icon: Calendar, aiActions: ['summarize'] },
    { id: 'definitionOfDone', label: 'Definition of Done', icon: Target, aiActions: ['improve'] },
    { id: 'technicalSpecs', label: 'Technical Specs', icon: Code, aiActions: ['summarize'] },
    { id: 'meetingNotes', label: 'Meeting Notes', icon: Users, aiActions: ['summarize_meeting'] },
    { id: 'risks', label: 'Risks & Issues', icon: AlertTriangle, aiActions: ['generate_risks'] }
];

const ACTION_LABELS = {
    summarize: 'Summarize',
    improve: 'Improve Writing',
    generate_reqs: 'Generate Requirements',
    generate_risks: 'Identify Risks',
    summarize_meeting: 'Extract Action Items'
};

const ProjectDocs = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [doc, setDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState('overview');
    const [content, setContent] = useState({});
    const [aiLoading, setAiLoading] = useState(false);
    const [showAttachments, setShowAttachments] = useState(false);
    
    // Modal state
    const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null });
    const [alertModal, setAlertModal] = useState({ show: false, title: '', message: '' });

    // Reset attachments view when navigating sections
    useEffect(() => {
        setShowAttachments(false);
    }, [activeSection]);

    // PM or Owner can edit. Team views only.
    const canEdit = ['PROJECT_MANAGER', 'owner', 'COMPANY_OWNER', 'CEO', 'CTO', 'COO', 'admin', 'ADMIN'].includes(user?.role);

    const fetchDoc = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get(`/projects/${projectId}/docs`);
            setDoc(res.data);

            // Build local state for all section fields
            const initialContent = {};
            SECTIONS.forEach(s => {
                initialContent[s.id] = res.data[s.id] || '';
            });
            initialContent.attachments = res.data.attachments || [];
            setContent(initialContent);
        } catch (error) {
            console.error('Error fetching documentation:', error);
            alert('Failed to load documentation.');
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchDoc();
    }, [fetchDoc]);

    const handleSave = async () => {
        if (!canEdit) return;
        setSaving(true);
        try {
            await api.put(`/projects/${projectId}/docs`, content);
            // Show subtle success indicator if desired
        } catch (error) {
            console.error('Error saving docs:', error);
            alert('Failed to save changes.');
        } finally {
            setSaving(false);
        }
    };

    const handleAIAssist = async (action) => {
        if (!canEdit) return;

        // Some actions need context of the specific section, others might use generic project context from 'overview'
        const contextText = (action === 'generate_reqs' || action === 'generate_risks')
            ? content.overview
            : content[activeSection];

        if (!contextText.trim() && !['generate_reqs', 'generate_risks'].includes(action)) {
            setAlertModal({
                show: true,
                title: 'Context Required',
                message: 'Please write some context in the section before using AI assistance.'
            });
            return;
        }

        setAiLoading(action);
        try {
            const res = await api.post(`/projects/${projectId}/docs/ai`, {
                action,
                section: activeSection,
                contextText
            });

            setContent(prev => ({
                ...prev,
                [activeSection]: res.data.result
            }));

            // Auto-save after AI generation
            await api.put(`/projects/${projectId}/docs`, { ...content, [activeSection]: res.data.result });

        } catch (error) {
            console.error('AI Error:', error);
            setAlertModal({
                show: true,
                title: 'AI Generation Failed',
                message: 'Failed to generate AI content. Please try again later.'
            });
        } finally {
            setAiLoading(false);
        }
    };

    const [uploading, setUploading] = useState(false);
    const handleFileUpload = async (e) => {
        if (!e.target.files?.length) return;
        const file = e.target.files[0];
        setUploading(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('sectionId', activeSection);

        try {
            const res = await api.post(`/projects/${projectId}/docs/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Result gives { doc, fileUrl, fileName }
            setDoc(res.data.doc);
            setContent(prev => ({ ...prev, attachments: res.data.doc.attachments }));
        } catch (err) {
            console.error('Upload error:', err);
            setAlertModal({
                show: true,
                title: 'Upload Failed',
                message: 'Failed to upload file. Check size (<20MB) and format.'
            });
        } finally {
            setUploading(false);
            e.target.value = null; // reset input
        }
    };

    const handleDeleteAttachment = async (attachmentId) => {
        if (!attachmentId) return;

        setConfirmModal({
            show: true,
            title: 'Delete Attachment',
            message: 'Are you sure you want to permanently delete this attachment? This action cannot be undone.',
            onConfirm: async () => {
                try {
                    await api.delete(`/projects/${projectId}/docs/attachments/${attachmentId}`);
                    setContent(prev => ({
                        ...prev,
                        attachments: prev.attachments.filter(a => a._id !== attachmentId)
                    }));
                } catch (error) {
                    console.error('Delete error:', error);
                    setAlertModal({
                        show: true,
                        title: 'Delete Failed',
                        message: 'Failed to delete the attachment.'
                    });
                }
                setConfirmModal(prev => ({ ...prev, show: false }));
            }
        });
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                <Loader2 size={32} className="spin" color="#2563eb" />
                <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading project knowledge base...</p>
                <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const currentSectionConfig = SECTIONS.find(s => s.id === activeSection);

    return (
        <div className="docs-layout">
            {/* Header */}
            <header className="docs-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="btn-icon" onClick={() => navigate(-1)} title="Go Back">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '1.25rem', margin: 0, color: '#0f172a' }}>Project Knowledge Base</h1>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {canEdit ? 'Editing Mode' : 'View Mode (Read-Only)'}
                        </span>
                    </div>
                </div>
                {canEdit && (
                    <button className="btn-save" onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                        {saving ? 'Saving...' : 'Save Draft'}
                    </button>
                )}
            </header>

            <div className="docs-container">
                {/* Left Sidebar */}
                <aside className="docs-sidebar">
                    <div className="sidebar-title">DOCUMENT SECTIONS</div>
                    <nav className="section-nav">
                        {SECTIONS.map(section => {
                            const Icon = section.icon;
                            let hasContent = typeof content[section.id] === 'string' && content[section.id].trim().length > 0;
                            const sectionAttachmentsCount = content.attachments ? content.attachments.filter(a => a.section === section.id).length : 0;

                            return (
                                <button
                                    key={section.id}
                                    className={`section-btn ${activeSection === section.id ? 'active' : ''}`}
                                    onClick={() => setActiveSection(section.id)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Icon size={16} className={activeSection === section.id ? 'active-icon' : 'dim-icon'} />
                                        <span>{section.label}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {sectionAttachmentsCount > 0 && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#64748b', fontSize: '0.75rem' }}>
                                                <Paperclip size={12} /> {sectionAttachmentsCount}
                                            </div>
                                        )}
                                        {hasContent && <Check size={14} color="#10b981" />}
                                    </div>
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main Editor Area */}
                <main className="docs-main">
                    <div className="editor-wrapper">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <h2 className="editor-title" style={{ margin: 0 }}>{currentSectionConfig.label}</h2>
                            <button
                                onClick={() => setShowAttachments(!showAttachments)}
                                title="Toggle Attachments Panel"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.5rem 1rem', borderRadius: '20px',
                                    background: showAttachments ? '#e0f2fe' : '#f8fafc',
                                    color: showAttachments ? '#0369a1' : '#475569',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    if (!showAttachments) {
                                        e.currentTarget.style.background = '#f1f5f9';
                                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!showAttachments) {
                                        e.currentTarget.style.background = '#f8fafc';
                                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                                    }
                                }}
                            >
                                <Paperclip size={16} />
                                <span>Attachments</span>
                                {content.attachments && content.attachments.filter(a => a.section === activeSection).length > 0 && (
                                    <div style={{
                                        background: '#0ea5e9', color: 'white',
                                        fontSize: '0.7rem', fontWeight: 700,
                                        padding: '0.1rem 0.4rem', borderRadius: '10px'
                                    }}>
                                        {content.attachments.filter(a => a.section === activeSection).length}
                                    </div>
                                )}
                            </button>
                        </div>

                        {canEdit ? (
                            <textarea
                                className="docs-textarea"
                                placeholder={`Start writing ${currentSectionConfig.label.toLowerCase()}...`}
                                value={content[activeSection]}
                                onChange={(e) => setContent(prev => ({ ...prev, [activeSection]: e.target.value }))}
                                onBlur={handleSave}
                            />
                        ) : (
                            <div className="docs-readonly-content">
                                {content[activeSection] ? (
                                    <div style={{ whiteSpace: 'pre-wrap' }}>{content[activeSection]}</div>
                                ) : (
                                    <p className="docs-empty">No documentation provided for this section yet.</p>
                                )}
                            </div>
                        )}
                    </div>
                </main>

                {/* Right Panel (AI or Attachments) */}
                <aside className="docs-ai-panel">
                    {showAttachments ? (
                        <div className="ai-panel-card attachments-panel">
                            <div className="ai-header" style={{ justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Paperclip size={18} color="#0284c7" />
                                    <h3 style={{ color: '#0369a1' }}>Attachments</h3>
                                </div>
                                <button className="btn-icon" onClick={() => setShowAttachments(false)} style={{ padding: '0.2rem' }}>
                                    <X size={16} />
                                </button>
                            </div>

                            <p className="ai-instructions">Files attached to <strong>{currentSectionConfig.label}</strong></p>

                            <div className="attachments-list" style={{ flex: 1, overflowY: 'auto' }}>
                                {content.attachments && content.attachments.filter(a => a.section === activeSection).length > 0 ? (
                                    content.attachments.filter(a => a.section === activeSection).map((file, idx) => (
                                        <div key={file._id || idx} className="attachment-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.4rem', position: 'relative', paddingRight: '2rem' }}>
                                            <a href={`http://localhost:5000${file.url}`} target="_blank" rel="noopener noreferrer" className="attachment-link" style={{ wordBreak: 'break-all' }}>
                                                {file.name || 'document.pdf'}
                                            </a>
                                            {canEdit && (
                                                <button
                                                    className="btn-icon"
                                                    onClick={() => handleDeleteAttachment(file._id)}
                                                    style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', color: '#ef4444', padding: '0.2rem' }}
                                                    title="Delete Attachment"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="docs-empty" style={{ fontSize: '0.85rem' }}>No files attached yet.</p>
                                )}
                            </div>

                            {canEdit && (
                                <div className="upload-box" style={{ marginTop: '1.5rem', padding: '1rem' }}>
                                    <input type="file" id="file-upload" className="file-input-hidden" onChange={handleFileUpload} disabled={uploading} />
                                    <label htmlFor="file-upload" className="btn-upload" style={{ width: '100%', justifyContent: 'center' }}>
                                        {uploading ? <Loader2 size={16} className="spin" /> : <Paperclip size={16} />}
                                        {uploading ? 'Uploading...' : 'Upload File'}
                                    </label>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="ai-panel-card">
                            <div className="ai-header">
                                <Sparkles size={18} color="#8b5cf6" />
                                <h3>AI Assistant</h3>
                            </div>

                            {canEdit ? (
                                <div className="ai-actions">
                                    <p className="ai-instructions">Use AI to automatically draft, summarize, or refine your documentation.</p>

                                    {currentSectionConfig.aiActions.length === 0 ? (
                                        <p className="ai-empty">No AI actions available for this section.</p>
                                    ) : (
                                        <div className="ai-buttons-grid">
                                            {currentSectionConfig.aiActions.map(action => (
                                                <button
                                                    key={action}
                                                    className="btn-ai-action"
                                                    onClick={() => handleAIAssist(action)}
                                                    disabled={aiLoading}
                                                >
                                                    {aiLoading === action ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
                                                    {ACTION_LABELS[action] || action}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="ai-readonly">
                                    <p>AI Assistant is only available to Project Managers operating in Edit mode.</p>
                                </div>
                            )}
                        </div>
                    )}
                </aside>
            </div >

            <style>{`
                /* Basic Page Setup */
                .docs-layout { height: 100vh; display: flex; flex-direction: column; background: #fff; overflow: hidden; font-family: 'Inter', sans-serif; }
                
                /* Header */
                .docs-header { height: 60px; padding: 0 1.5rem; display: flex; alignItems: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; background: #fff; flex-shrink: 0; }
                .btn-icon { background: none; border: none; cursor: pointer; color: #475569; display: flex; padding: 0.5rem; border-radius: 6px; transition: background 0.2s; }
                .btn-icon:hover { background: #f1f5f9; color: #0f172a; }
                .btn-save { background: #0f172a; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 500; font-size: 0.85rem; display: flex; align-items: center; gap: 0.4rem; cursor: pointer; transition: background 0.2s; }
                .btn-save:hover { background: #1e293b; }
                .btn-save:disabled { opacity: 0.7; cursor: not-allowed; }

                /* Layout */
                .docs-container { display: flex; flex: 1; overflow: hidden; }

                /* Sidebar */
                .docs-sidebar { width: 260px; background: #f8fafc; border-right: 1px solid #e2e8f0; display: flex; flex-direction: column; padding: 1.5rem 1rem; overflow-y: auto; }
                .sidebar-title { font-size: 0.7rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.05em; margin-bottom: 1rem; padding-left: 0.5rem; }
                .section-nav { display: flex; flex-direction: column; gap: 0.2rem; }
                .section-btn { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 0.6rem 0.75rem; border: none; background: transparent; border-radius: 6px; cursor: pointer; font-size: 0.9rem; color: #475569; font-weight: 500; transition: all 0.2s; }
                .section-btn:hover { background: #f1f5f9; color: #0f172a; }
                .section-btn.active { background: #e0f2fe; color: #0369a1; }
                .dim-icon { color: #94a3b8; }
                .active-icon { color: #0284c7; }

                /* Main Editor */
                .docs-main { flex: 1; overflow-y: auto; padding: 3rem 4rem; display: flex; justify-content: center; }
                .editor-wrapper { max-width: 800px; width: 100%; display: flex; flex-direction: column; }
                .editor-title { font-size: 2rem; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 2rem; }
                
                .docs-textarea { flex: 1; min-height: 250px; width: 100%; resize: none; border: none; outline: none; font-size: 1rem; line-height: 1.7; color: #334155; font-family: inherit; background: transparent; padding-bottom: 1rem; }
                .docs-textarea::placeholder { color: #cbd5e1; }
                
                .docs-readonly-content { font-size: 1rem; line-height: 1.7; color: #334155; padding-bottom: 2rem; }
                .docs-empty { color: #94a3b8; font-style: italic; }

                /* Attachments */
                .attachments-section { display: flex; flex-direction: column; gap: 1rem; margin-top: 2rem; border-top: 1px solid #e2e8f0; padding-top: 1.5rem; padding-bottom: 4rem; }
                .section-subtitle { font-size: 1rem; font-weight: 600; color: #334155; margin: 0; display: flex; align-items: center; gap: 0.4rem; }
                .upload-box { border: 2px dashed #cbd5e1; border-radius: 8px; padding: 1.5rem; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f8fafc; text-align: center; }
                .file-input-hidden { display: none; }
                .btn-upload { background: #fff; border: 1px solid #cbd5e1; padding: 0.5rem 1rem; border-radius: 6px; color: #0f172a; font-weight: 600; font-size: 0.85rem; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem; transition: all 0.2s; cursor: pointer; }
                .btn-upload:hover { border-color: #94a3b8; background: #f1f5f9; }
                .upload-hint { font-size: 0.75rem; color: #64748b; margin-top: 0.5rem; }
                .attachments-list { display: flex; flex-direction: column; gap: 0.75rem; }
                .attachment-item { padding: 1rem; background: #f1f5f9; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
                .attachment-info { display: flex; align-items: center; gap: 0.75rem; }
                .attachment-link { color: #0284c7; font-weight: 500; text-decoration: none; word-break: break-all; }
                .attachment-link:hover { text-decoration: underline; }

                /* Right AI Panel */
                .docs-ai-panel { width: 320px; border-left: 1px solid #e2e8f0; background: #fff; padding: 1.5rem; display: flex; flex-direction: column; height: 100vh; position: sticky; top: 0; }
                .ai-panel-card { display: flex; flex-direction: column; height: 100%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; }
                .ai-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
                .ai-header h3 { font-size: 1rem; font-weight: 600; color: #4c1d95; margin: 0; }
                .ai-instructions { font-size: 0.85rem; color: #64748b; margin-bottom: 1.5rem; line-height: 1.5; }
                .ai-buttons-grid { display: flex; flex-direction: column; gap: 0.5rem; }
                .btn-ai-action { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; padding: 0.75rem 1rem; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; color: #4c1d95; font-weight: 500; cursor: pointer; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
                .btn-ai-action:hover:not(:disabled) { border-color: #ddd6fe; background: #f5f3ff; }
                .btn-ai-action:disabled { opacity: 0.6; cursor: not-allowed; }
                
                .ai-empty, .ai-readonly { font-size: 0.85rem; color: #94a3b8; font-style: italic; }

                /* Custom Modals */
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(4px); }
                .custom-modal { background: white; width: 400px; padding: 2rem; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); animation: modalIn 0.3s ease-out; }
                @keyframes modalIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .modal-title { font-size: 1.25rem; font-weight: 700; color: #0f172a; margin: 0 0 1rem 0; }
                .modal-message { font-size: 0.95rem; color: #475569; line-height: 1.6; margin-bottom: 2rem; }
                .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; }
                .btn-modal-cancel { padding: 0.6rem 1.2rem; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; color: #475569; font-weight: 600; cursor: pointer; transition: all 0.2s; }
                .btn-modal-cancel:hover { background: #f8fafc; }
                .btn-modal-confirm { padding: 0.6rem 1.2rem; border-radius: 8px; border: none; background: #ef4444; color: white; font-weight: 600; cursor: pointer; transition: all 0.2s; }
                .btn-modal-confirm:hover { background: #dc2626; }
                .btn-modal-ok { padding: 0.6rem 1.2rem; border-radius: 8px; border: none; background: #2563eb; color: white; font-weight: 600; cursor: pointer; transition: all 0.2s; }
                .btn-modal-ok:hover { background: #1d4ed8; }
            `}</style>

            {/* Confirm Modal */}
            {confirmModal.show && (
                <div className="modal-overlay">
                    <div className="custom-modal">
                        <h3 className="modal-title">{confirmModal.title}</h3>
                        <p className="modal-message">{confirmModal.message}</p>
                        <div className="modal-actions">
                            <button className="btn-modal-cancel" onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}>Cancel</button>
                            <button className="btn-modal-confirm" onClick={confirmModal.onConfirm}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Alert Modal */}
            {alertModal.show && (
                <div className="modal-overlay">
                    <div className="custom-modal">
                        <h3 className="modal-title">{alertModal.title}</h3>
                        <p className="modal-message">{alertModal.message}</p>
                        <div className="modal-actions">
                            <button className="btn-modal-ok" onClick={() => setAlertModal({ show: false, title: '', message: '' })}>OK</button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default ProjectDocs;
