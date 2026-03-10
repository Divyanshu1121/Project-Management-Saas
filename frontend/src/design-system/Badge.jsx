import React from 'react';

export const STATUS_PRESETS = {
    TODO: { label: 'To Do', bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' },
    IN_PROGRESS: { label: 'In Progress', bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6' },
    SUBMITTED: { label: 'Submitted', bg: '#faf5ff', color: '#7e22ce', dot: '#a855f7' },
    APPROVED: { label: 'Approved', bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
    REJECTED: { label: 'Rejected', bg: '#fef2f2', color: '#991b1b', dot: '#ef4444' },
    ACTIVE: { label: 'Active', bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
    PLANNING: { label: 'Planning', bg: '#fef9c3', color: '#854d0e', dot: '#eab308' },
    COMPLETED: { label: 'Completed', bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
    ON_HOLD: { label: 'On Hold', bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
    LOW: { label: 'Low', bg: '#f0fdf4', color: '#166534', dot: '#22c55e' },
    MEDIUM: { label: 'Medium', bg: '#fffbeb', color: '#92400e', dot: '#f59e0b' },
    HIGH: { label: 'High', bg: '#fff7ed', color: '#9a3412', dot: '#f97316' },
    URGENT: { label: 'Urgent', bg: '#fef2f2', color: '#991b1b', dot: '#ef4444' },
};

const SIZES = {
    xs: { p: '0.12rem 0.4rem', fs: 'var(--text-2xs)', dotSize: 4 },
    sm: { p: '0.2rem 0.55rem', fs: 'var(--text-xs)', dotSize: 5 },
    md: { p: '0.28rem 0.7rem', fs: 'var(--text-sm)', dotSize: 6 },
};

const Badge = ({
    status, label, color, bg, dot,
    showDot = true, size = 'sm', style = {}
}) => {
    const preset = STATUS_PRESETS[status] || {};
    const _bg = bg || preset.bg || '#f1f5f9';
    const _color = color || preset.color || '#475569';
    const _dot = dot || preset.dot || '#94a3b8';
    const _label = label || preset.label || status || '—';
    const s = SIZES[size] || SIZES.sm;

    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
            padding: s.p, borderRadius: 'var(--r-full)',
            fontSize: s.fs, fontWeight: 700, letterSpacing: '0.02em',
            background: _bg, color: _color,
            whiteSpace: 'nowrap', flexShrink: 0,
            ...style,
        }}>
            {showDot && (
                <span style={{ width: s.dotSize, height: s.dotSize, borderRadius: '50%', background: _dot, flexShrink: 0 }} />
            )}
            {_label}
        </span>
    );
};

export default Badge;
