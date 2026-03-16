import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Skeleton Loader - For page-level and block-level loading
 */
export const Skeleton = ({ width = '100%', height = '20px', borderRadius = '0.5rem', style = {} }) => {
    return (
        <div style={{
            width,
            height,
            borderRadius,
            background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
            backgroundSize: '200% 100%',
            animation: 'skeleton-loading 1.5s infinite',
            ...style
        }}>
            <style>{`
                @keyframes skeleton-loading {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    );
};

export const PageSkeleton = () => (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton width="250px" height="40px" />
            <Skeleton width="120px" height="40px" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '1rem' }}>
                    <Skeleton width="40%" height="15px" style={{ marginBottom: '1rem' }} />
                    <Skeleton width="100%" height="20px" style={{ marginBottom: '0.5rem' }} />
                    <Skeleton width="90%" height="20px" style={{ marginBottom: '1.5rem' }} />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Skeleton width="32px" height="32px" borderRadius="50%" />
                        <Skeleton width="32px" height="32px" borderRadius="50%" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

/**
 * Button Loader - For actions
 */
export const ButtonLoader = ({ color = 'currentColor', size = 16 }) => (
    <Loader2 size={size} color={color} style={{ animation: 'spin 1s linear infinite' }} />
);

/**
 * Typing Indicator - For Chat
 */
export const TypingIndicator = ({ users = [] }) => {
    if (users.length === 0) return null;
    
    const text = users.length === 1 
        ? `${users[0]} is typing...` 
        : users.length === 2 
            ? `${users[0]} and ${users[1]} are typing...` 
            : `${users[0]} and ${users.length - 1} others are typing...`;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.75rem', color: '#64748b' }}>
            <div style={{ display: 'flex', gap: '2px' }}>
                <div className="dot" style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#2563eb', animation: 'typing-pulse 1s infinite' }} />
                <div className="dot" style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#2563eb', animation: 'typing-pulse 1s infinite', animationDelay: '0.2s' }} />
                <div className="dot" style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#2563eb', animation: 'typing-pulse 1s infinite', animationDelay: '0.4s' }} />
            </div>
            <span>{text}</span>
            <style>{`
                @keyframes typing-pulse {
                    0%, 100% { opacity: 0.3; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1.1); }
                }
            `}</style>
        </div>
    );
};

/**
 * Progress Loader - For Uploads
 */
export const ProgressLoader = ({ progress, label = "Uploading..." }) => (
    <div style={{ width: '100%', padding: '0.5rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>{label}</span>
            <span style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 700 }}>{progress}%</span>
        </div>
        <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '1rem', overflow: 'hidden' }}>
            <div style={{ 
                width: `${progress}%`, 
                height: '100%', 
                backgroundColor: '#2563eb', 
                transition: 'width 0.3s ease-out' 
            }} />
        </div>
    </div>
);

/**
 * Inline Loader - For Lists
 */
export const InlineLoader = ({ message = "Loading items..." }) => (
    <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: '0.75rem', 
        padding: '2rem',
        color: '#94a3b8',
        fontSize: '0.875rem'
    }}>
        <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
        <span>{message}</span>
    </div>
);
