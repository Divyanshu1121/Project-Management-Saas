import React from 'react';

/* ── Shimmer base ─── */
const shimStyle = {
    background: 'linear-gradient(90deg,#f1f5f9 25%,#e8edf5 50%,#f1f5f9 75%)',
    backgroundSize: '200% 100%',
    animation: 'ds-shimmer 1.4s ease infinite',
    borderRadius: 'var(--r-sm)',
};

/* ── Single bar ──── */
const Skeleton = ({ w = '100%', h = 14, r = 'var(--r-sm)', style = {} }) => (
    <div style={{ width: w, height: h, borderRadius: r, ...shimStyle, ...style }} />
);

/* ── Stat card skeleton ─── */
Skeleton.Card = () => (
    <div style={{ background: 'white', border: '1px solid var(--surface-border)', borderRadius: 'var(--r-xl)', padding: '1.25rem 1.5rem', boxShadow: 'var(--sh-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
            <Skeleton w={100} h={11} />
            <Skeleton w={44} h={44} r="var(--r-lg)" />
        </div>
        <Skeleton w={70} h={30} style={{ marginBottom: '0.5rem' }} />
        <Skeleton w={90} h={10} />
    </div>
);

/* ── Table row skeleton ─── */
Skeleton.Row = ({ cols = 4 }) => (
    <div style={{ display: 'grid', gridTemplateColumns: `2fr ${Array(cols - 1).fill('1fr').join(' ')}`, gap: '1rem', padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--surface-subtle)', alignItems: 'center' }}>
        {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} h={13} w={i === 0 ? '70%' : `${50 + Math.floor(Math.random() * 30)}%`} />
        ))}
    </div>
);

/* ── Text block skeleton ─── */
Skeleton.Text = ({ lines = 3 }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {Array.from({ length: lines }).map((_, i) => (
            <Skeleton key={i} w={i === lines - 1 ? '60%' : '100%'} h={13} />
        ))}
    </div>
);

export default Skeleton;
