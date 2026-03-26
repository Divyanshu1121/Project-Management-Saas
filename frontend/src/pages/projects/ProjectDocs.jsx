import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FileText, ArrowLeft, Loader2, Sparkles, AlertTriangle,
    ListChecks, Calendar, Target, Code, Users, Paperclip,
    Check, Save, X, Trash2, Eye, Edit3, UploadCloud, ChevronRight,
    BookOpen, Zap
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const SECTIONS = [
    { id: 'overview',        label: 'Project Overview',   icon: FileText,       color: '#3b82f6', aiActions: ['summarize', 'improve'] },
    { id: 'requirements',   label: 'Requirements',       icon: ListChecks,     color: '#8b5cf6', aiActions: ['generate_reqs', 'improve'] },
    { id: 'plan',           label: 'Project Plan',       icon: Calendar,       color: '#10b981', aiActions: ['summarize'] },
    { id: 'definitionOfDone', label: 'Definition of Done', icon: Target,       color: '#f59e0b', aiActions: ['improve'] },
    { id: 'technicalSpecs', label: 'Technical Specs',    icon: Code,           color: '#06b6d4', aiActions: ['summarize'] },
    { id: 'meetingNotes',   label: 'Meeting Notes',      icon: Users,          color: '#ec4899', aiActions: ['summarize_meeting'] },
    { id: 'risks',          label: 'Risks & Issues',     icon: AlertTriangle,  color: '#ef4444', aiActions: ['generate_risks'] },
];

const ACTION_LABELS = {
    summarize: 'Summarize',
    improve: 'Improve Writing',
    generate_reqs: 'Generate Requirements',
    generate_risks: 'Identify Risks',
    summarize_meeting: 'Extract Action Items',
};

const ACTION_DESCRIPTIONS = {
    summarize: 'Generate a concise summary of this section',
    improve: 'Refine grammar, clarity, and structure',
    generate_reqs: 'Draft requirements from the project overview',
    generate_risks: 'Identify potential risks from project context',
    summarize_meeting: 'Extract and list action items from notes',
};

// Lightweight markdown-to-HTML renderer for read-only preview
function renderMarkdown(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/^---$/gm, '<hr/>')
        .replace(/^\s*[-*] (.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>(\n|$))+/g, m => `<ul>${m}</ul>`)
        .replace(/^\s*\d+\. (.+)$/gm, '<oli>$1</oli>')
        .replace(/(<oli>.*<\/oli>(\n|$))+/g, m => `<ol>${m.replace(/<\/?oli>/g, m2 => m2.replace('oli', 'li'))}</ol>`)
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br/>')
        .replace(/^(?!<[hupol])(.+)/, '<p>$1')
        .replace(/(.+)(?<![>])$/, '$1</p>');
}

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
    const [uploading, setUploading] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null });
    const [alertModal, setAlertModal] = useState({ show: false, title: '', message: '', type: 'info' });

    useEffect(() => { setShowAttachments(false); setPreviewMode(false); }, [activeSection]);

    const canEdit = ['PROJECT_MANAGER', 'owner', 'COMPANY_OWNER', 'CEO', 'CTO', 'COO', 'admin', 'ADMIN'].includes(user?.role);

    const fetchDoc = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get(`/projects/${projectId}/docs`);
            setDoc(res.data);
            const initialContent = {};
            SECTIONS.forEach(s => { initialContent[s.id] = res.data[s.id] || ''; });
            initialContent.attachments = res.data.attachments || [];
            setContent(initialContent);
        } catch (error) {
            console.error('Error fetching documentation:', error);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => { fetchDoc(); }, [fetchDoc]);

    const handleSave = async () => {
        if (!canEdit) return;
        setSaving(true);
        try {
            await api.put(`/projects/${projectId}/docs`, content);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
        } catch (error) {
            console.error('Error saving docs:', error);
            setAlertModal({ show: true, title: 'Save Failed', message: 'Failed to save changes. Please try again.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleAIAssist = async (action) => {
        if (!canEdit) return;
        const contextText = (action === 'generate_reqs' || action === 'generate_risks')
            ? content.overview
            : content[activeSection];

        if (!contextText?.trim() && !['generate_reqs', 'generate_risks'].includes(action)) {
            setAlertModal({ show: true, title: 'Context Required', message: 'Please write some content in this section before using AI assistance.', type: 'info' });
            return;
        }

        setAiLoading(action);
        try {
            const res = await api.post(`/projects/${projectId}/docs/ai`, { action, section: activeSection, contextText });
            const updated = { ...content, [activeSection]: res.data.result };
            setContent(updated);
            await api.put(`/projects/${projectId}/docs`, updated);
            setPreviewMode(true);
        } catch (error) {
            console.error('AI Error:', error);
            setAlertModal({ show: true, title: 'AI Generation Failed', message: 'Failed to generate AI content. Please try again later.', type: 'error' });
        } finally {
            setAiLoading(false);
        }
    };

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
            setDoc(res.data.doc);
            setContent(prev => ({ ...prev, attachments: res.data.doc.attachments }));
        } catch (err) {
            setAlertModal({ show: true, title: 'Upload Failed', message: 'Failed to upload file. Max size is 20MB.', type: 'error' });
        } finally {
            setUploading(false);
            e.target.value = null;
        }
    };

    const handleDeleteAttachment = async (attachmentId) => {
        if (!attachmentId) return;
        setConfirmModal({
            show: true,
            title: 'Delete Attachment',
            message: 'Are you sure you want to permanently delete this attachment? This cannot be undone.',
            onConfirm: async () => {
                try {
                    await api.delete(`/projects/${projectId}/docs/attachments/${attachmentId}`);
                    setContent(prev => ({ ...prev, attachments: prev.attachments.filter(a => a._id !== attachmentId) }));
                } catch (error) {
                    setAlertModal({ show: true, title: 'Delete Failed', message: 'Failed to delete the attachment.', type: 'error' });
                }
                setConfirmModal(prev => ({ ...prev, show: false }));
            }
        });
    };

    const wordCount = useMemo(() => {
        const text = content[activeSection] || '';
        return text.trim() ? text.trim().split(/\s+/).length : 0;
    }, [content, activeSection]);

    const currentSection = SECTIONS.find(s => s.id === activeSection);
    const sectionAttachments = content.attachments?.filter(a => a.section === activeSection) || [];
    const completedSections = SECTIONS.filter(s => content[s.id]?.trim()).length;

    if (loading) {
        return (
            <div className="docs-loading-screen">
                <div className="docs-loading-spinner">
                    <BookOpen size={36} color="#3b82f6" />
                </div>
                <p className="docs-loading-text">Loading Knowledge Base...</p>
                <style>{`.docs-loading-screen{height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(135deg,#f0f9ff 0%,#f8fafc 50%,#fdf4ff 100%);gap:1.25rem}.docs-loading-spinner{width:72px;height:72px;border-radius:20px;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(59,130,246,0.15);animation:pulse 1.5s ease-in-out infinite}@keyframes pulse{0%,100%{transform:scale(1);box-shadow:0 8px 24px rgba(59,130,246,0.15)}50%{transform:scale(1.04);box-shadow:0 12px 32px rgba(59,130,246,0.25)}}.docs-loading-text{font-family:'Inter',sans-serif;font-size:0.95rem;color:#64748b;font-weight:500;letter-spacing:0.02em}`}</style>
            </div>
        );
    }

    return (
        <div className="docs-root">

            {/* ── Top Header ── */}
            <header className="docs-header">
                <div className="docs-header-left">
                    <button className="btn-back" onClick={() => navigate(-1)} title="Go Back">
                        <ArrowLeft size={16} />
                    </button>
                    <div className="docs-header-info">
                        <div className="docs-header-title">
                            <BookOpen size={18} color="#3b82f6" />
                            <span>Project Knowledge Base</span>
                        </div>
                        <div className="docs-header-badge">
                            <span className={`mode-badge ${canEdit ? 'edit' : 'view'}`}>
                                {canEdit ? <Edit3 size={10} /> : <Eye size={10} />}
                                {canEdit ? 'Edit Mode' : 'Read Only'}
                            </span>
                            <span className="progress-badge">
                                <Check size={10} /> {completedSections}/{SECTIONS.length} sections
                            </span>
                        </div>
                    </div>
                </div>
                <div className="docs-header-right">
                    {saveSuccess && (
                        <span className="save-success-chip">
                            <Check size={13} /> Saved
                        </span>
                    )}
                    {canEdit && (
                        <button className="btn-save" onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 size={15} className="spin" /> : <Save size={15} />}
                            {saving ? 'Saving…' : 'Save Draft'}
                        </button>
                    )}
                </div>
            </header>

            <div className="docs-body">

                {/* ── Left Sidebar ── */}
                <aside className="docs-sidebar">
                    <div className="sidebar-sections-label">DOCUMENT SECTIONS</div>
                    <nav className="section-nav">
                        {SECTIONS.map(section => {
                            const Icon = section.icon;
                            const hasContent = content[section.id]?.trim().length > 0;
                            const attachCount = content.attachments?.filter(a => a.section === section.id).length || 0;
                            const isActive = activeSection === section.id;

                            return (
                                <button
                                    key={section.id}
                                    className={`section-btn ${isActive ? 'active' : ''}`}
                                    style={isActive ? { '--section-color': section.color } : {}}
                                    onClick={() => setActiveSection(section.id)}
                                >
                                    <div className="section-btn-left">
                                        <div className="section-icon-wrap" style={{ background: isActive ? `${section.color}18` : '#f1f5f9' }}>
                                            <Icon size={14} style={{ color: isActive ? section.color : '#94a3b8' }} />
                                        </div>
                                        <span className="section-btn-label">{section.label}</span>
                                    </div>
                                    <div className="section-btn-right">
                                        {attachCount > 0 && (
                                            <span className="attach-chip">
                                                <Paperclip size={9} /> {attachCount}
                                            </span>
                                        )}
                                        {hasContent && <Check size={12} color="#10b981" strokeWidth={2.5} />}
                                        {isActive && <ChevronRight size={12} style={{ color: section.color }} />}
                                    </div>
                                </button>
                            );
                        })}
                    </nav>

                    <div className="sidebar-footer">
                        <div className="sidebar-footer-stat">
                            <span className="stat-num">{completedSections}</span>
                            <span className="stat-label">of {SECTIONS.length} complete</span>
                        </div>
                        <div className="sidebar-progress-bar">
                            <div className="sidebar-progress-fill" style={{ width: `${(completedSections / SECTIONS.length) * 100}%` }} />
                        </div>
                    </div>
                </aside>

                {/* ── Main Editor ── */}
                <main className="docs-main">
                    <div className="editor-wrapper">

                        {/* Section Header */}
                        <div className="editor-section-header">
                            <div className="editor-section-title-row">
                                <div className="editor-section-icon" style={{ background: `${currentSection.color}18`, border: `1px solid ${currentSection.color}30` }}>
                                    {React.createElement(currentSection.icon, { size: 20, color: currentSection.color })}
                                </div>
                                <h2 className="editor-section-title">{currentSection.label}</h2>
                            </div>
                            <div className="editor-toolbar">
                                {canEdit && (
                                    <button
                                        className={`toolbar-btn ${previewMode ? 'active' : ''}`}
                                        onClick={() => setPreviewMode(!previewMode)}
                                        title={previewMode ? 'Switch to Edit' : 'Preview'}
                                    >
                                        {previewMode ? <Edit3 size={14} /> : <Eye size={14} />}
                                        {previewMode ? 'Edit' : 'Preview'}
                                    </button>
                                )}
                                <button
                                    className={`toolbar-btn ${showAttachments ? 'active-attach' : ''}`}
                                    onClick={() => setShowAttachments(!showAttachments)}
                                >
                                    <Paperclip size={14} />
                                    Files
                                    {sectionAttachments.length > 0 && (
                                        <span className="attach-count-badge">{sectionAttachments.length}</span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="editor-divider" style={{ '--div-color': currentSection.color }} />

                        {/* Editor / Preview Area */}
                        {canEdit && !previewMode ? (
                            <textarea
                                className="docs-textarea"
                                placeholder={`Start writing ${currentSection.label.toLowerCase()}…\n\nTips: Use **bold**, *italic*, # headings, - bullet lists, or let AI draft it for you.`}
                                value={content[activeSection]}
                                onChange={e => setContent(prev => ({ ...prev, [activeSection]: e.target.value }))}
                                onBlur={handleSave}
                            />
                        ) : (
                            <div className="docs-preview">
                                {content[activeSection]?.trim() ? (
                                    <div
                                        className="docs-preview-content"
                                        dangerouslySetInnerHTML={{ __html: renderMarkdown(content[activeSection]) }}
                                    />
                                ) : (
                                    <div className="docs-empty-state">
                                        {React.createElement(currentSection.icon, { size: 40, color: '#cbd5e1' })}
                                        <p className="docs-empty-title">No content yet</p>
                                        <p className="docs-empty-subtitle">
                                            {canEdit ? 'Start writing or use AI to draft this section.' : 'This section has not been filled in yet.'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Footer Word Count */}
                        {canEdit && (
                            <div className="editor-footer">
                                <span className="word-count">{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
                                {content[activeSection]?.trim() && (
                                    <span className="editor-footer-hint">Auto-saves on click-away</span>
                                )}
                            </div>
                        )}
                    </div>
                </main>

                {/* ── Right Panel ── */}
                <aside className="docs-right-panel">
                    {showAttachments ? (
                        <div className="panel-card">
                            <div className="panel-card-header">
                                <div className="panel-card-title">
                                    <Paperclip size={16} color="#0284c7" />
                                    <span>Attachments</span>
                                </div>
                                <button className="btn-icon-sm" onClick={() => setShowAttachments(false)}>
                                    <X size={14} />
                                </button>
                            </div>
                            <p className="panel-subtitle">Files for <strong>{currentSection.label}</strong></p>

                            <div className="attachments-list">
                                {sectionAttachments.length > 0 ? (
                                    sectionAttachments.map((file, idx) => (
                                        <div key={file._id || idx} className="attachment-item">
                                            <div className="attachment-icon">
                                                <FileText size={14} color="#0284c7" />
                                            </div>
                                            <a
                                                href={`http://localhost:5000${file.url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="attachment-name"
                                            >
                                                {file.name || 'document.pdf'}
                                            </a>
                                            {canEdit && (
                                                <button
                                                    className="btn-delete-attach"
                                                    onClick={() => handleDeleteAttachment(file._id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="panel-empty">
                                        <UploadCloud size={32} color="#cbd5e1" />
                                        <p>No files attached yet</p>
                                    </div>
                                )}
                            </div>

                            {canEdit && (
                                <div className="upload-area">
                                    <input type="file" id="file-upload" className="file-input-hidden" onChange={handleFileUpload} disabled={uploading} />
                                    <label htmlFor="file-upload" className="btn-upload">
                                        {uploading ? <Loader2 size={14} className="spin" /> : <UploadCloud size={14} />}
                                        {uploading ? 'Uploading…' : 'Upload File'}
                                    </label>
                                    <p className="upload-hint">PDF, DOCX, PNG · Max 20MB</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="panel-card ai-panel">
                            <div className="panel-card-header">
                                <div className="panel-card-title ai-title">
                                    <div className="ai-icon-wrap">
                                        <Sparkles size={14} color="#8b5cf6" />
                                    </div>
                                    <span>AI Assistant</span>
                                </div>
                                <span className="ai-beta-badge">Beta</span>
                            </div>

                            {canEdit ? (
                                <>
                                    <p className="panel-subtitle">Automatically draft, summarize, or improve this section.</p>
                                    <div className="ai-actions-list">
                                        {currentSection.aiActions.map(action => (
                                            <button
                                                key={action}
                                                className="btn-ai-action"
                                                onClick={() => handleAIAssist(action)}
                                                disabled={!!aiLoading}
                                            >
                                                <div className="ai-action-icon">
                                                    {aiLoading === action
                                                        ? <Loader2 size={14} className="spin" color="#8b5cf6" />
                                                        : <Zap size={14} color="#8b5cf6" />}
                                                </div>
                                                <div className="ai-action-text">
                                                    <span className="ai-action-label">{ACTION_LABELS[action]}</span>
                                                    <span className="ai-action-desc">{ACTION_DESCRIPTIONS[action]}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="ai-disclaimer">
                                        <Sparkles size={11} />
                                        AI may make mistakes. Always review generated content.
                                    </div>
                                </>
                            ) : (
                                <div className="panel-empty">
                                    <Sparkles size={32} color="#ddd6fe" />
                                    <p>AI Assistant is available to Project Managers in Edit mode.</p>
                                </div>
                            )}
                        </div>
                    )}
                </aside>
            </div>

            {/* ── CSS ── */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

                /* Override parent layout container so docs fills the full area */
                .page-content:has(.docs-root) {
                    padding: 0 !important;
                    overflow: hidden !important;
                }

                /* Root */
                .docs-root {
                    height: 100%; display: flex; flex-direction: column;
                    font-family: 'Inter', sans-serif;
                    background: #fff; overflow: hidden; color: #0f172a;
                }

                /* ── Header ── */
                .docs-header {
                    height: 58px; padding: 0 1.5rem;
                    display: flex; align-items: center; justify-content: space-between;
                    border-bottom: 1px solid #f1f5f9;
                    background: #fff; flex-shrink: 0;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
                    z-index: 10;
                }
                .docs-header-left { display: flex; align-items: center; gap: 0.875rem; }
                .docs-header-right { display: flex; align-items: center; gap: 0.75rem; }
                .docs-header-info { display: flex; flex-direction: column; gap: 0.2rem; }
                .docs-header-title {
                    display: flex; align-items: center; gap: 0.4rem;
                    font-size: 0.95rem; font-weight: 700; color: #0f172a;
                }
                .docs-header-badge { display: flex; align-items: center; gap: 0.5rem; }

                .mode-badge {
                    display: inline-flex; align-items: center; gap: 0.25rem;
                    font-size: 0.68rem; font-weight: 600; letter-spacing: 0.03em;
                    padding: 0.15rem 0.5rem; border-radius: 20px; text-transform: uppercase;
                }
                .mode-badge.edit { background: #eff6ff; color: #2563eb; }
                .mode-badge.view { background: #f0fdf4; color: #16a34a; }

                .progress-badge {
                    display: inline-flex; align-items: center; gap: 0.25rem;
                    font-size: 0.68rem; color: #64748b; font-weight: 500;
                }

                .btn-back {
                    background: #f8fafc; border: 1px solid #e2e8f0; color: #475569;
                    width: 34px; height: 34px; border-radius: 8px;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: all 0.15s;
                }
                .btn-back:hover { background: #f1f5f9; color: #0f172a; border-color: #cbd5e1; }

                .btn-save {
                    display: flex; align-items: center; gap: 0.4rem;
                    background: #0f172a; color: #fff; border: none;
                    padding: 0.5rem 1rem; border-radius: 8px;
                    font-size: 0.83rem; font-weight: 600; cursor: pointer;
                    transition: all 0.15s; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                .btn-save:hover:not(:disabled) { background: #1e293b; transform: translateY(-1px); box-shadow: 0 4px 8px rgba(0,0,0,0.12); }
                .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

                .save-success-chip {
                    display: inline-flex; align-items: center; gap: 0.3rem;
                    background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0;
                    padding: 0.3rem 0.7rem; border-radius: 20px; font-size: 0.78rem; font-weight: 600;
                    animation: fadeInOut 2s ease-in-out;
                }
                @keyframes fadeInOut { 0%,100%{opacity:0} 15%,85%{opacity:1} }

                /* ── Body Layout ── */
                .docs-body { display: flex; flex: 1; overflow: hidden; }

                /* ── Sidebar ── */
                .docs-sidebar {
                    width: 250px; background: #fafbfc; border-right: 1px solid #f1f5f9;
                    display: flex; flex-direction: column; padding: 1.25rem 0.75rem;
                    overflow-y: auto; flex-shrink: 0;
                }
                .sidebar-sections-label {
                    font-size: 0.65rem; font-weight: 700; color: #94a3b8;
                    letter-spacing: 0.08em; margin-bottom: 0.75rem; padding-left: 0.5rem;
                }
                .section-nav { display: flex; flex-direction: column; gap: 0.15rem; flex: 1; }

                .section-btn {
                    display: flex; align-items: center; justify-content: space-between;
                    width: 100%; padding: 0.55rem 0.6rem; border: none;
                    background: transparent; border-radius: 8px; cursor: pointer;
                    font-size: 0.84rem; color: #475569; font-weight: 500;
                    transition: all 0.15s; text-align: left;
                }
                .section-btn:hover { background: #f1f5f9; color: #0f172a; }
                .section-btn.active {
                    background: linear-gradient(135deg, color-mix(in srgb, var(--section-color) 12%, white), color-mix(in srgb, var(--section-color) 6%, white));
                    color: var(--section-color); font-weight: 600;
                    box-shadow: 0 1px 4px color-mix(in srgb, var(--section-color) 20%, transparent);
                }
                .section-btn-left { display: flex; align-items: center; gap: 0.55rem; min-width: 0; }
                .section-btn-right { display: flex; align-items: center; gap: 0.3rem; flex-shrink: 0; }
                .section-btn-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .section-icon-wrap {
                    width: 26px; height: 26px; border-radius: 6px; flex-shrink: 0;
                    display: flex; align-items: center; justify-content: center;
                    transition: background 0.2s;
                }
                .attach-chip {
                    display: inline-flex; align-items: center; gap: 2px;
                    font-size: 0.65rem; color: #64748b;
                    background: #f1f5f9; padding: 0.1rem 0.3rem; border-radius: 4px;
                }

                .sidebar-footer { margin-top: 1.5rem; padding: 0.75rem 0.5rem; border-top: 1px solid #f1f5f9; }
                .sidebar-footer-stat { display: flex; align-items: baseline; gap: 0.3rem; margin-bottom: 0.5rem; }
                .stat-num { font-size: 1.1rem; font-weight: 700; color: #0f172a; }
                .stat-label { font-size: 0.75rem; color: #94a3b8; }
                .sidebar-progress-bar { height: 4px; background: #f1f5f9; border-radius: 99px; overflow: hidden; }
                .sidebar-progress-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #8b5cf6); border-radius: 99px; transition: width 0.5s ease; }

                /* ── Main Editor ── */
                .docs-main { flex: 1; overflow-y: auto; padding: 2.5rem 3.5rem; display: flex; justify-content: center; }
                .editor-wrapper { max-width: 780px; width: 100%; display: flex; flex-direction: column; }

                .editor-section-header {
                    display: flex; align-items: center; justify-content: space-between;
                    margin-bottom: 1.25rem;
                }
                .editor-section-title-row { display: flex; align-items: center; gap: 0.75rem; }
                .editor-section-icon {
                    width: 42px; height: 42px; border-radius: 10px;
                    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
                }
                .editor-section-title {
                    font-size: 1.6rem; font-weight: 700; color: #0f172a; margin: 0;
                    letter-spacing: -0.02em;
                }

                .editor-toolbar { display: flex; align-items: center; gap: 0.4rem; }
                .toolbar-btn {
                    display: flex; align-items: center; gap: 0.35rem;
                    font-size: 0.8rem; font-weight: 600; color: #475569;
                    background: #f8fafc; border: 1px solid #e2e8f0;
                    padding: 0.4rem 0.75rem; border-radius: 7px; cursor: pointer;
                    transition: all 0.15s;
                }
                .toolbar-btn:hover { background: #f1f5f9; color: #0f172a; border-color: #cbd5e1; }
                .toolbar-btn.active { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }
                .toolbar-btn.active-attach { background: #e0f2fe; color: #0369a1; border-color: #bae6fd; }
                .attach-count-badge {
                    background: #0ea5e9; color: #fff; font-size: 0.65rem; font-weight: 700;
                    padding: 0.05rem 0.35rem; border-radius: 10px;
                }

                .editor-divider {
                    height: 2px; border-radius: 99px;
                    background: linear-gradient(90deg, var(--div-color), transparent);
                    margin-bottom: 1.75rem; opacity: 0.4;
                }

                .docs-textarea {
                    flex: 1; min-height: 420px; width: 100%; resize: none;
                    border: none; outline: none;
                    font-size: 1rem; line-height: 1.85; color: #334155;
                    font-family: 'Inter', sans-serif; background: transparent;
                }
                .docs-textarea::placeholder { color: #cbd5e1; }

                .docs-preview { min-height: 420px; }
                .docs-preview-content {
                    font-size: 1rem; line-height: 1.85; color: #334155;
                }
                .docs-preview-content h1 { font-size: 1.5rem; font-weight: 700; color: #0f172a; margin: 1.5rem 0 0.75rem; }
                .docs-preview-content h2 { font-size: 1.2rem; font-weight: 700; color: #1e293b; margin: 1.25rem 0 0.5rem; }
                .docs-preview-content h3 { font-size: 1rem; font-weight: 600; color: #334155; margin: 1rem 0 0.4rem; }
                .docs-preview-content p { margin: 0.5rem 0; }
                .docs-preview-content ul, .docs-preview-content ol { padding-left: 1.5rem; margin: 0.5rem 0; }
                .docs-preview-content li { margin: 0.2rem 0; }
                .docs-preview-content strong { font-weight: 700; color: #0f172a; }
                .docs-preview-content em { font-style: italic; color: #475569; }
                .docs-preview-content code { background: #f1f5f9; border-radius: 4px; padding: 0.1em 0.4em; font-size: 0.88em; color: #7c3aed; }
                .docs-preview-content hr { border: none; border-top: 1px solid #e2e8f0; margin: 1.5rem 0; }

                .docs-empty-state {
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    min-height: 320px; gap: 0.75rem; text-align: center; padding: 2rem;
                }
                .docs-empty-title { font-size: 1rem; font-weight: 600; color: #94a3b8; margin: 0; }
                .docs-empty-subtitle { font-size: 0.85rem; color: #cbd5e1; margin: 0; }

                .editor-footer {
                    display: flex; align-items: center; justify-content: space-between;
                    margin-top: 1.5rem; padding-top: 0.75rem;
                    border-top: 1px solid #f8fafc;
                }
                .word-count { font-size: 0.75rem; color: #94a3b8; }
                .editor-footer-hint { font-size: 0.72rem; color: #cbd5e1; }

                /* ── Right Panel ── */
                .docs-right-panel {
                    width: 300px; border-left: 1px solid #f1f5f9;
                    background: #fafbfc; padding: 1.25rem; display: flex;
                    flex-direction: column; overflow-y: auto; flex-shrink: 0;
                }
                .panel-card {
                    display: flex; flex-direction: column; height: 100%;
                    background: #fff; border: 1px solid #f1f5f9;
                    border-radius: 12px; padding: 1.25rem;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
                }
                .panel-card-header {
                    display: flex; align-items: center; justify-content: space-between;
                    margin-bottom: 0.5rem;
                }
                .panel-card-title {
                    display: flex; align-items: center; gap: 0.4rem;
                    font-size: 0.9rem; font-weight: 700; color: #0f172a;
                }
                .ai-title { color: #4c1d95; }
                .panel-subtitle { font-size: 0.78rem; color: #64748b; margin: 0 0 1.25rem; line-height: 1.5; }

                .btn-icon-sm {
                    background: none; border: none; cursor: pointer; color: #94a3b8;
                    display: flex; padding: 0.25rem; border-radius: 5px; transition: all 0.15s;
                }
                .btn-icon-sm:hover { background: #f1f5f9; color: #475569; }

                /* Attachments */
                .attachments-list { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
                .attachment-item {
                    display: flex; align-items: center; gap: 0.6rem;
                    padding: 0.6rem 0.75rem; background: #f8fafc; border-radius: 8px;
                    border: 1px solid #f1f5f9; transition: border-color 0.15s;
                }
                .attachment-item:hover { border-color: #e2e8f0; }
                .attachment-icon {
                    width: 28px; height: 28px; background: #eff6ff; border-radius: 6px;
                    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
                }
                .attachment-name {
                    font-size: 0.8rem; color: #0284c7; text-decoration: none; font-weight: 500;
                    flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
                }
                .attachment-name:hover { text-decoration: underline; }
                .btn-delete-attach {
                    background: none; border: none; cursor: pointer; color: #cbd5e1;
                    display: flex; padding: 0.2rem; border-radius: 4px; transition: all 0.15s; flex-shrink: 0;
                }
                .btn-delete-attach:hover { color: #ef4444; background: #fef2f2; }

                .upload-area { margin-top: 1rem; text-align: center; }
                .file-input-hidden { display: none; }
                .btn-upload {
                    display: inline-flex; align-items: center; gap: 0.4rem;
                    background: #fff; border: 1.5px dashed #cbd5e1;
                    padding: 0.6rem 1rem; border-radius: 8px;
                    color: #475569; font-size: 0.8rem; font-weight: 600;
                    cursor: pointer; transition: all 0.15s; width: 100%; justify-content: center;
                }
                .btn-upload:hover { border-color: #94a3b8; background: #f8fafc; color: #0f172a; }
                .upload-hint { font-size: 0.7rem; color: #94a3b8; margin-top: 0.4rem; }

                /* AI Panel */
                .ai-panel { }
                .ai-icon-wrap {
                    width: 28px; height: 28px;
                    background: linear-gradient(135deg, #f5f3ff, #ede9fe);
                    border-radius: 7px; display: flex; align-items: center; justify-content: center;
                }
                .ai-beta-badge {
                    font-size: 0.6rem; font-weight: 700; text-transform: uppercase;
                    background: #faf5ff; color: #7c3aed; border: 1px solid #ddd6fe;
                    padding: 0.1rem 0.4rem; border-radius: 4px; letter-spacing: 0.04em;
                }
                .ai-actions-list { display: flex; flex-direction: column; gap: 0.5rem; }
                .btn-ai-action {
                    display: flex; align-items: flex-start; gap: 0.65rem;
                    padding: 0.75rem; background: #fff; border: 1px solid #f1f5f9;
                    border-radius: 10px; cursor: pointer; text-align: left;
                    transition: all 0.15s; box-shadow: 0 1px 2px rgba(0,0,0,0.04);
                }
                .btn-ai-action:hover:not(:disabled) {
                    border-color: #ddd6fe; background: #faf5ff;
                    box-shadow: 0 2px 8px rgba(139,92,246,0.08); transform: translateY(-1px);
                }
                .btn-ai-action:disabled { opacity: 0.5; cursor: not-allowed; }
                .ai-action-icon {
                    width: 28px; height: 28px; background: #f5f3ff; border-radius: 7px;
                    display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px;
                }
                .ai-action-text { display: flex; flex-direction: column; gap: 0.15rem; }
                .ai-action-label { font-size: 0.82rem; font-weight: 600; color: #4c1d95; }
                .ai-action-desc { font-size: 0.72rem; color: #94a3b8; line-height: 1.4; }
                .ai-disclaimer {
                    display: flex; align-items: center; gap: 0.35rem;
                    font-size: 0.68rem; color: #94a3b8; margin-top: auto; padding-top: 1rem;
                    border-top: 1px solid #f8fafc; line-height: 1.4;
                }

                .panel-empty {
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    flex: 1; gap: 0.6rem; text-align: center; color: #94a3b8;
                    font-size: 0.8rem; padding: 1.5rem 0.5rem;
                }

                /* ── Modals ── */
                .modal-overlay {
                    position: fixed; inset: 0; background: rgba(15,23,42,0.4);
                    display: flex; align-items: center; justify-content: center; z-index: 2000;
                    backdrop-filter: blur(6px); animation: overlayIn 0.2s ease;
                }
                @keyframes overlayIn { from{opacity:0} to{opacity:1} }
                .custom-modal {
                    background: #fff; width: 420px; padding: 2rem;
                    border-radius: 16px; box-shadow: 0 24px 48px rgba(0,0,0,0.12);
                    animation: modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1);
                }
                @keyframes modalIn { from{opacity:0;transform:scale(0.93) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
                .modal-title { font-size: 1.1rem; font-weight: 700; color: #0f172a; margin: 0 0 0.6rem; }
                .modal-message { font-size: 0.9rem; color: #475569; line-height: 1.6; margin-bottom: 1.75rem; }
                .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; }
                .btn-modal-cancel {
                    padding: 0.55rem 1.1rem; border-radius: 8px; border: 1px solid #e2e8f0;
                    background: #fff; color: #475569; font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: all 0.15s;
                }
                .btn-modal-cancel:hover { background: #f8fafc; }
                .btn-modal-confirm {
                    padding: 0.55rem 1.1rem; border-radius: 8px; border: none;
                    background: #ef4444; color: #fff; font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: all 0.15s;
                }
                .btn-modal-confirm:hover { background: #dc2626; }
                .btn-modal-ok {
                    padding: 0.55rem 1.1rem; border-radius: 8px; border: none;
                    background: #2563eb; color: #fff; font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: all 0.15s;
                }
                .btn-modal-ok:hover { background: #1d4ed8; }

                /* Spinner */
                .spin { animation: spin 0.8s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>

            {/* ── Confirm Modal ── */}
            {confirmModal.show && (
                <div className="modal-overlay">
                    <div className="custom-modal">
                        <h3 className="modal-title">{confirmModal.title}</h3>
                        <p className="modal-message">{confirmModal.message}</p>
                        <div className="modal-actions">
                            <button className="btn-modal-cancel" onClick={() => setConfirmModal(p => ({ ...p, show: false }))}>Cancel</button>
                            <button className="btn-modal-confirm" onClick={confirmModal.onConfirm}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Alert Modal ── */}
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
        </div>
    );
};

export default ProjectDocs;
