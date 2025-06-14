// ThemeContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [contrast, setContrast] = useState(() => localStorage.getItem('contrast') || 'normal');

    // Apply theme to HTML
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Apply contrast to HTML
    useEffect(() => {
        document.documentElement.setAttribute('data-contrast', contrast);
        localStorage.setItem('contrast', contrast);
    }, [contrast]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    const toggleContrast = () => {
        setContrast(prev => (prev === 'normal' ? 'high' : 'normal'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, contrast, toggleContrast }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);