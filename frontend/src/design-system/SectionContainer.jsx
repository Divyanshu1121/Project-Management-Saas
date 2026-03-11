import React from 'react';

/**
 * SectionContainer — page-level layout wrapper.
 *
 * Provides consistent max-width, horizontal centering, and vertical
 * rhythm for any page's root element.
 *
 * Props:
 *  maxWidth  — CSS max-width value  (default: '1280px')
 *  gap       — flex gap between children (default: 'var(--sp-5)')
 *  style     — additional styles
 *  children  — page content
 */
const SectionContainer = ({
    children,
    maxWidth = '1280px',
    gap = 'var(--sp-5)',
    style = {},
}) => (
    <div style={{
        maxWidth,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap,
        ...style,
    }}>
        {children}
    </div>
);

export default SectionContainer;
