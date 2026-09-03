import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
    isDark: false,
    toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(() => {
        // On first render (SSR-safe): read from localStorage, default to light
        if (typeof window === 'undefined') return false;
        const stored = localStorage.getItem('theme');
        if (stored) return stored === 'dark';
        // Respect OS preference only if no stored value
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    // Keep <html> class in sync whenever isDark changes
    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    const toggleTheme = () => setIsDark((prev) => !prev);

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
