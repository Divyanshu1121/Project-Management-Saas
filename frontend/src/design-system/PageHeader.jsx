import React from 'react';

/**
 * PageHeader — unified top-of-page header used across every panel.
 *
 * Props:
 *  icon       — Lucide icon component (rendered in a gradient pill)
 *  iconColor  — icon fill color (default: primary indigo)
 *  iconBg     — icon container gradient (default: indigo gradient)
 *  title      — main h1 text
 *  subtitle   — secondary description line
 *  actions    — ReactNode rendered to the right (buttons, selects, etc.)
 *  style      — additional wrapper styles
 *  size       — 'sm' | 'md' (default) | 'lg'
 */
const PageHeader = ({
    icon: Icon,
    iconColor = 'white',
    iconBg = 'linear-gradient(135deg, var(--clr-primary-500), #818cf8)',
    title,
    subtitle,
    actions,
    style = {},
    size = 'md',
}) => {
    const sizes = {
        sm: { title: 'var(--text-xl)', sub: 'var(--text-sm)', iconSize: 32, padding: 8 },
        md: { title: 'var(--text-2xl)', sub: 'var(--text-base)', iconSize: 38, padding: 10 },
        lg: { title: 'var(--text-3xl)', sub: 'var(--text-md)', iconSize: 44, padding: 12 },
    };
    const s = sizes[size] || sizes.md;

    return (
        <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
            marginBottom: 'var(--sp-6)',
            ...style,
        }}>
            {/* Left: icon + text */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                {Icon && (
                    <div style={{
                        width: s.iconSize,
                        height: s.iconSize,
                        borderRadius: 'var(--r-lg)',
                        background: iconBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: 'var(--sh-primary)',
                    }}>
                        <Icon size={s.iconSize * 0.52} color={iconColor} strokeWidth={2} />
                    </div>
                )}
                <div>
                    <h1 style={{
                        margin: 0,
                        fontSize: s.title,
                        fontWeight: 800,
                        color: 'var(--text-primary, var(--clr-slate-800))',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.15,
                    }}>
                        {title}
                    </h1>
                    {subtitle && (
                        <p style={{
                            margin: '0.2rem 0 0',
                            fontSize: s.sub,
                            color: 'var(--clr-slate-400)',
                            fontWeight: 400,
                            lineHeight: 1.5,
                        }}>
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {/* Right: action buttons */}
            {actions && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    flexWrap: 'wrap',
                    flexShrink: 0,
                }}>
                    {actions}
                </div>
            )}
        </div>
    );
};

export default PageHeader;
