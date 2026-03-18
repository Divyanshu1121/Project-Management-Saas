import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const THEME_OPTIONS = ['light', 'dark', 'system'];

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('pm-theme') || 'system';
    });

    const getAppliedTheme = (t) => {
        if (t === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return t;
    };

    const [appliedTheme, setAppliedTheme] = useState(() => getAppliedTheme(
        localStorage.getItem('pm-theme') || 'system'
    ));

    useEffect(() => {
        localStorage.setItem('pm-theme', theme);
        const resolved = getAppliedTheme(theme);
        setAppliedTheme(resolved);
        document.documentElement.setAttribute('data-theme', resolved);
    }, [theme]);

    useEffect(() => {
        if (theme !== 'system') return;
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e) => {
            const resolved = e.matches ? 'dark' : 'light';
            setAppliedTheme(resolved);
            document.documentElement.setAttribute('data-theme', resolved);
        };
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, [theme]);

    useEffect(() => {
        const resolved = getAppliedTheme(theme);
        document.documentElement.setAttribute('data-theme', resolved);
        setAppliedTheme(resolved);
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, appliedTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
    return ctx;
};
