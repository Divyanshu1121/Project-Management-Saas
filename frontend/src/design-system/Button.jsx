import React, { useState } from 'react';

const VARIANTS = {
    primary: {
        bg: 'linear-gradient(135deg,#6366f1,#4f46e5)',
        color: '#fff', border: 'none',
        shadow: '0 2px 8px rgba(99,102,241,0.3)',
        hoverShadow: '0 4px 16px rgba(99,102,241,0.4)',
    },
    secondary: {
        bg: '#fff', color: 'var(--clr-slate-700)',
        border: '1.5px solid var(--surface-border)',
        shadow: 'var(--sh-xs)', hoverBg: 'var(--surface-1)',
    },
    ghost: {
        bg: 'transparent', color: 'var(--clr-slate-600)',
        border: 'none', shadow: 'none', hoverBg: 'var(--surface-2)',
    },
    danger: {
        bg: 'var(--clr-danger-50)', color: 'var(--clr-danger-500)',
        border: '1.5px solid #fecaca', shadow: 'none',
    },
    success: {
        bg: 'var(--clr-success-50)', color: 'var(--clr-success-600)',
        border: '1.5px solid #a7f3d0', shadow: 'none',
    },
    dark: {
        bg: 'var(--clr-slate-800)', color: '#fff',
        border: 'none', shadow: 'var(--sh-sm)',
        hoverShadow: 'var(--sh-md)',
    },
};

const SIZES = {
    xs: { p: '0.25rem 0.6rem', fs: 'var(--text-xs)', h: 26, gap: '0.3rem', ico: 12 },
    sm: { p: '0.4rem 0.8rem', fs: 'var(--text-sm)', h: 32, gap: '0.35rem', ico: 14 },
    md: { p: '0.55rem 1.1rem', fs: 'var(--text-base)', h: 38, gap: '0.45rem', ico: 15 },
    lg: { p: '0.7rem 1.4rem', fs: 'var(--text-md)', h: 44, gap: '0.5rem', ico: 17 },
    xl: { p: '0.875rem 1.75rem', fs: 'var(--text-lg)', h: 52, gap: '0.6rem', ico: 19 },
};

const Button = ({
    children, variant = 'primary', size = 'md',
    icon: Icon, iconRight: IconR,
    loading = false, disabled = false,
    onClick, style = {}, full = false, ...rest
}) => {
    const [hov, setHov] = useState(false);
    const v = VARIANTS[variant] || VARIANTS.primary;
    const s = SIZES[size] || SIZES.md;

    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                gap: s.gap, padding: s.p, height: s.h, fontSize: s.fs,
                fontWeight: 600, fontFamily: 'var(--font-sans)',
                borderRadius: 'var(--r-md)',
                border: v.border || 'none',
                background: hov && v.hoverBg ? v.hoverBg : v.bg,
                color: v.color,
                boxShadow: hov && v.hoverShadow ? v.hoverShadow : (v.shadow || 'none'),
                cursor: disabled || loading ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.55 : 1,
                transform: hov && !disabled && !loading && variant !== 'ghost' ? 'translateY(-1px)' : 'none',
                transition: 'all var(--t-base)',
                whiteSpace: 'nowrap', outline: 'none',
                letterSpacing: '-0.005em',
                width: full ? '100%' : undefined,
                ...style,
            }}
            {...rest}
        >
            {loading
                ? <span style={{ width: s.ico, height: s.ico, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'ds-spin 0.8s linear infinite' }} />
                : Icon && <Icon size={s.ico} style={{ flexShrink: 0 }} />
            }
            {children}
            {!loading && IconR && <IconR size={s.ico} style={{ flexShrink: 0 }} />}
        </button>
    );
};

export default Button;
