import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * RightPanel — context-aware slide-in panel from the right
 *
 * Props:
 *   open     bool        controls visibility
 *   onClose  fn          called when backdrop or X is clicked
 *   title    string      panel header title
 *   subtitle string      optional subtitle
 *   width    number      panel width in px (default 480)
 *   footer   ReactNode   optional sticky footer inside the panel
 *   children ReactNode   scrollable body content
 */
const RightPanel = ({ open, onClose, title, subtitle, width = 480, children, footer }) => {
    /* Close on Escape */
    useEffect(() => {
        if (!open) return;
        const h = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [open, onClose]);

    /* Lock body scroll while open */
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    if (!open) return null;

    const panelW = Math.min(width, window.innerWidth - 48);

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.3)', backdropFilter: 'blur(2px)', zIndex: 690, animation: 'ds-fade-in 200ms ease' }}
            />

            {/* Panel */}
            <div style={{
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width: panelW, background: 'white',
                boxShadow: '-6px 0 40px rgba(0,0,0,0.12)',
                zIndex: 700, display: 'flex', flexDirection: 'column',
                animation: 'ds-slide-in-right 260ms cubic-bezier(0.16,1,0.3,1)',
                borderLeft: '1px solid var(--surface-border)',
            }}>
                {/* Header */}
                <div style={{ padding: '1.125rem 1.5rem', borderBottom: '1px solid var(--surface-subtle)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexShrink: 0 }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--clr-slate-800)', letterSpacing: '-0.01em' }}>
                            {title}
                        </h2>
                        {subtitle && <p style={{ margin: '0.2rem 0 0', fontSize: 'var(--text-sm)', color: 'var(--clr-slate-400)' }}>{subtitle}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        style={{ width: 32, height: 32, borderRadius: 'var(--r-md)', border: '1px solid var(--surface-border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--clr-slate-400)', flexShrink: 0, transition: 'all var(--t-fast)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--clr-slate-700)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--clr-slate-400)'; }}
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Scrollable body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
                    {children}
                </div>

                {/* Optional footer */}
                {footer && (
                    <div style={{ padding: '0.875rem 1.5rem', borderTop: '1px solid var(--surface-subtle)', background: 'var(--surface-1)', flexShrink: 0 }}>
                        {footer}
                    </div>
                )}
            </div>
        </>
    );
};

export default RightPanel;
