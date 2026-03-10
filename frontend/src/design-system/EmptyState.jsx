import React from 'react';

const EmptyState = ({
    icon: Icon,
    title = 'Nothing here yet',
    description,
    action,
    size = 'md',
}) => {
    const lg = size === 'lg';
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: lg ? '4rem 2rem' : '2.5rem 1.5rem' }}>
            {Icon && (
                <div style={{
                    width: lg ? 72 : 52, height: lg ? 72 : 52,
                    borderRadius: '50%',
                    background: 'var(--surface-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1rem',
                    animation: 'ds-bounce-in 0.4s cubic-bezier(0.16,1,0.3,1)',
                }}>
                    <Icon size={lg ? 30 : 22} color="var(--clr-slate-300)" strokeWidth={1.5} />
                </div>
            )}
            <h3 style={{ margin: '0 0 0.4rem', fontSize: lg ? 'var(--text-lg)' : 'var(--text-md)', fontWeight: 700, color: 'var(--clr-slate-500)' }}>
                {title}
            </h3>
            {description && (
                <p style={{ margin: '0 0 1.25rem', fontSize: 'var(--text-sm)', color: 'var(--clr-slate-400)', maxWidth: 320, lineHeight: 1.6 }}>
                    {description}
                </p>
            )}
            {action}
        </div>
    );
};

export default EmptyState;
