import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const THEME_OPTIONS = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
];

const ThemeSwitcher = ({ compact = false }) => {
    const { theme, setTheme } = useTheme();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const current = THEME_OPTIONS.find(o => o.value === theme) || THEME_OPTIONS[2];
    const CurrentIcon = current.icon;

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                onClick={() => setOpen(o => !o)}
                className="theme-switcher-btn"
                title="Change theme"
                aria-label="Change theme"
            >
                <CurrentIcon size={16} />
                {!compact && <span className="theme-switcher-label">{current.label}</span>}
                {!compact && <ChevronDown size={12} style={{ opacity: 0.6, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />}
            </button>

            {open && (
                <div className="theme-dropdown" role="menu">
                    <div className="theme-dropdown-header">Appearance</div>
                    {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                        <button
                            key={value}
                            className={`theme-option${theme === value ? ' active' : ''}`}
                            onClick={() => { setTheme(value); setOpen(false); }}
                            role="menuitem"
                        >
                            <div className="theme-option-icon">
                                <Icon size={15} />
                            </div>
                            <span>{label}</span>
                            {theme === value && (
                                <div className="theme-option-check">
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                        <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ThemeSwitcher;
