import React, { useState } from 'react';

const Card = ({ children, style = {}, hover = true, padding = '1.25rem 1.5rem', onClick, ...rest }) => {
    const [hov, setHov] = useState(false);
    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                background: 'var(--card-bg, white)',
                border: `1px solid ${hov && hover ? 'var(--clr-primary-200)' : 'var(--card-border, var(--surface-border))'}`,
                borderRadius: 'var(--r-xl)',
                boxShadow: hov && hover ? 'var(--sh-md)' : 'var(--card-shadow, var(--sh-sm))',
                padding,
                transform: hov && hover && onClick ? 'translateY(-2px)' : 'none',
                transition: 'all var(--t-base)',
                cursor: onClick ? 'pointer' : 'default',
                ...style,
            }}
            {...rest}
        >
            {children}
        </div>
    );
};

Card.Stat = ({
    label, value, icon: Icon,
    color = '#6366f1', bg = '#eef2ff',
    delta, deltaLabel, onClick, loading = false,
}) => {
    const [hov, setHov] = useState(false);

    if (loading) return (
        <div style={{ background: 'var(--card-bg, white)', border: '1px solid var(--card-border, var(--surface-border))', borderRadius: 'var(--r-xl)', padding: '1.25rem 1.5rem', boxShadow: 'var(--card-shadow, var(--sh-sm))' }}>
            <div className="ds-shimmer-el" style={{ width: '55%', height: 12, borderRadius: 'var(--r-sm)', marginBottom: 12 }} />
            <div className="ds-shimmer-el" style={{ width: '35%', height: 32, borderRadius: 'var(--r-sm)' }} />
        </div>
    );

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                background: 'var(--card-bg, white)',
                border: `1px solid ${hov ? color + '30' : 'var(--card-border, var(--surface-border))'}`,
                borderRadius: 'var(--r-xl)',
                padding: '1.25rem 1.5rem',
                boxShadow: hov ? `var(--sh-md), 0 0 0 3px ${color}15` : 'var(--card-shadow, var(--sh-sm))',
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem',
                cursor: onClick ? 'pointer' : 'default',
                transform: hov && onClick ? 'translateY(-2px)' : 'none',
                transition: 'all var(--t-base)',
            }}
        >
            <div>
                <p style={{ margin: '0 0 0.5rem', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted, var(--clr-slate-400))', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    {label}
                </p>
                <p style={{ margin: 0, fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--text-primary, var(--clr-slate-800))', lineHeight: 1, letterSpacing: '-0.02em' }}>
                    {value}
                </p>
                {delta != null && (
                    <p style={{ margin: '0.4rem 0 0', fontSize: 'var(--text-xs)', fontWeight: 600, color: delta > 0 ? 'var(--clr-success-500)' : delta < 0 ? 'var(--clr-danger-500)' : 'var(--clr-slate-400)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span>{delta > 0 ? '▲' : delta < 0 ? '▼' : '—'}</span>
                        <span>{deltaLabel || `${Math.abs(delta)} change`}</span>
                    </p>
                )}
            </div>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--r-lg)', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transform: hov ? 'scale(1.1) rotate(3deg)' : 'scale(1) rotate(0deg)', transition: 'transform var(--t-spring)' }}>
                {Icon && <Icon size={21} color={color} strokeWidth={2} />}
            </div>
        </div>
    );
};

Card.Section = ({ title, subtitle, icon: Icon, iconColor = '#6366f1', iconBg = '#eef2ff', action, children, noPadBody = false }) => (
    <div style={{ background: 'var(--card-bg, white)', border: '1px solid var(--card-border, var(--surface-border))', borderRadius: 'var(--r-xl)', overflow: 'hidden', boxShadow: 'var(--card-shadow, var(--sh-sm))' }}>
        <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--surface-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                {Icon && (
                    <div style={{ width: 32, height: 32, borderRadius: 'var(--r-md)', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={16} color={iconColor} strokeWidth={2} />
                    </div>
                )}
                <div>
                    <h3 style={{ margin: 0, fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-primary, var(--clr-slate-800))' }}>{title}</h3>
                    {subtitle && <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted, var(--clr-slate-400))' }}>{subtitle}</p>}
                </div>
            </div>
            {action}
        </div>
        <div style={noPadBody ? {} : { padding: '1rem 1.25rem' }}>{children}</div>
    </div>
);

export default Card;
