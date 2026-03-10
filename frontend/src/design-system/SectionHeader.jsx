import React from 'react';

/**
 * SectionHeader — consistent page / section headers
 *
 * Props:
 *   title       string   required
 *   subtitle    string   optional sub-line
 *   icon        Lucide   optional icon component
 *   iconColor   css      icon colour
 *   iconBg      css      icon bubble background
 *   actions     ReactNode  right-side action buttons
 *   divider     bool     show bottom border
 *   size        'sm'|'md'|'lg'
 */
const SectionHeader = ({
    title, subtitle,
    icon: Icon, iconColor = '#6366f1', iconBg = '#eef2ff',
    actions, divider = false, size = 'md', style = {},
}) => {
    const titleFs = size === 'lg' ? 'var(--text-2xl)' : size === 'sm' ? 'var(--text-md)' : 'var(--text-xl)';
    const iconSize = size === 'lg' ? 42 : size === 'sm' ? 28 : 36;
    const iconIco = size === 'lg' ? 20 : size === 'sm' ? 14 : 17;

    return (
        <div style={{ marginBottom: divider ? 0 : 'var(--sp-5)', ...style }}>
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: '1rem', flexWrap: 'wrap',
                paddingBottom: divider ? 'var(--sp-4)' : 0,
                borderBottom: divider ? '1px solid var(--surface-border)' : 'none',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {Icon && (
                        <div style={{ width: iconSize, height: iconSize, borderRadius: 'var(--r-md)', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--sh-xs)' }}>
                            <Icon size={iconIco} color={iconColor} strokeWidth={2} />
                        </div>
                    )}
                    <div>
                        <h2 style={{ margin: 0, fontSize: titleFs, fontWeight: 800, color: 'var(--clr-slate-800)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                            {title}
                        </h2>
                        {subtitle && (
                            <p style={{ margin: '0.2rem 0 0', fontSize: 'var(--text-sm)', color: 'var(--clr-slate-400)', fontWeight: 500 }}>
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
                {actions && (
                    <div style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'center', flexWrap: 'wrap' }}>
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SectionHeader;
