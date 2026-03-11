import React, { useState } from 'react';

/**
 * PanelCard — white surface card used uniformly across all pages.
 *
 * Variants:
 *  default   — plain white card with border + shadow
 *  section   — card with a styled header row (icon, title, subtitle, action)
 *  stat      — compact metric card (mirrors design-system Card.Stat aesthetics)
 *
 * Props (all):
 *  variant      — 'default' | 'section' | 'stat'
 *  padding      — inner padding for body (default: '1.25rem 1.5rem')
 *  hover        — show hover lift effect (default: true)
 *  onClick      — click handler (enables pointer + lift)
 *  style        — extra wrapper styles
 *  className    — extra class
 *
 * Additional props for variant="section":
 *  title, subtitle, icon, iconColor, iconBg, action, noPadBody
 *
 * Additional props for variant="stat":
 *  label, value, icon, color, bg, delta, deltaLabel
 */

/* ── Default ──────────────────────────────────────── */
const PanelCard = ({
    children,
    variant = 'default',
    padding = '1.25rem 1.5rem',
    hover = true,
    onClick,
    style = {},
    className = '',
    // section props
    title,
    subtitle,
    icon: Icon,
    iconColor = 'var(--clr-primary-500)',
    iconBg = 'var(--clr-primary-50)',
    action,
    noPadBody = false,
    // stat props
    label,
    value,
    color = 'var(--clr-primary-500)',
    bg = 'var(--clr-primary-50)',
    delta,
    deltaLabel,
}) => {
    const [hov, setHov] = useState(false);

    const baseStyle = {
        background: 'var(--surface-0)',
        border: `1px solid ${hov && hover ? 'var(--clr-primary-200)' : 'var(--surface-border)'}`,
        borderRadius: 'var(--r-xl)',
        boxShadow: hov && hover ? 'var(--sh-md)' : 'var(--sh-sm)',
        transition: 'all var(--t-base)',
        cursor: onClick ? 'pointer' : 'default',
        transform: hov && hover && onClick ? 'translateY(-2px)' : 'none',
        overflow: 'hidden',
        ...style,
    };

    const handlers = {
        onMouseEnter: () => setHov(true),
        onMouseLeave: () => setHov(false),
        onClick,
    };

    /* ── Section variant ── */
    if (variant === 'section') {
        return (
            <div style={baseStyle} className={className} {...handlers}>
                {/* Header */}
                <div style={{
                    padding: '0.875rem 1.25rem',
                    borderBottom: '1px solid var(--surface-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        {Icon && (
                            <div style={{
                                width: 32,
                                height: 32,
                                borderRadius: 'var(--r-md)',
                                background: iconBg,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <Icon size={16} color={iconColor} strokeWidth={2} />
                            </div>
                        )}
                        <div>
                            {title && (
                                <h3 style={{
                                    margin: 0,
                                    fontSize: 'var(--text-md)',
                                    fontWeight: 700,
                                    color: 'var(--clr-slate-800)',
                                }}>
                                    {title}
                                </h3>
                            )}
                            {subtitle && (
                                <p style={{
                                    margin: 0,
                                    fontSize: 'var(--text-xs)',
                                    color: 'var(--clr-slate-400)',
                                }}>
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>
                    {action}
                </div>
                {/* Body */}
                <div style={noPadBody ? {} : { padding: '1rem 1.25rem' }}>
                    {children}
                </div>
            </div>
        );
    }

    /* ── Stat variant ── */
    if (variant === 'stat') {
        return (
            <div
                style={{
                    background: 'var(--surface-0)',
                    border: `1px solid ${hov ? color + '40' : 'var(--surface-border)'}`,
                    borderRadius: 'var(--r-xl)',
                    padding: '1.25rem 1.5rem',
                    boxShadow: hov ? `var(--sh-md), 0 0 0 3px ${color}18` : 'var(--sh-sm)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    cursor: onClick ? 'pointer' : 'default',
                    transform: hov && onClick ? 'translateY(-2px)' : 'none',
                    transition: 'all var(--t-base)',
                    ...style,
                }}
                className={className}
                {...handlers}
            >
                <div>
                    <p style={{
                        margin: '0 0 0.5rem',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 700,
                        color: 'var(--clr-slate-400)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.07em',
                    }}>
                        {label}
                    </p>
                    <p style={{
                        margin: 0,
                        fontSize: 'var(--text-3xl)',
                        fontWeight: 800,
                        color: 'var(--clr-slate-800)',
                        lineHeight: 1,
                        letterSpacing: '-0.02em',
                    }}>
                        {value}
                    </p>
                    {delta != null && (
                        <p style={{
                            margin: '0.4rem 0 0',
                            fontSize: 'var(--text-xs)',
                            fontWeight: 600,
                            color: delta > 0
                                ? 'var(--clr-success-500)'
                                : delta < 0
                                    ? 'var(--clr-danger-500)'
                                    : 'var(--clr-slate-400)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                        }}>
                            <span>{delta > 0 ? '▲' : delta < 0 ? '▼' : '—'}</span>
                            <span>{deltaLabel || `${Math.abs(delta)} change`}</span>
                        </p>
                    )}
                </div>
                {Icon && (
                    <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 'var(--r-lg)',
                        background: bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transform: hov ? 'scale(1.1) rotate(3deg)' : 'scale(1)',
                        transition: 'transform var(--t-spring)',
                    }}>
                        <Icon size={21} color={color} strokeWidth={2} />
                    </div>
                )}
            </div>
        );
    }

    /* ── Default variant ── */
    return (
        <div style={{ ...baseStyle, padding }} className={className} {...handlers}>
            {children}
        </div>
    );
};

export default PanelCard;
