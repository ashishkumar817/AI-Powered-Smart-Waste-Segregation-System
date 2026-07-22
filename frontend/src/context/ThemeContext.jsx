import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState('system');

  // Derived active theme (resolves 'system' to 'dark' or 'light')
  const [activeTheme, setActiveTheme] = useState('dark');

  useEffect(() => {
    const applyTheme = (currentTheme) => {
      const root = window.document.documentElement;
      
      let resolvedTheme = currentTheme;
      if (currentTheme === 'system') {
        resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }

      root.classList.remove('light', 'dark');
      root.classList.add(resolvedTheme);
      setActiveTheme(resolvedTheme);
    };

    applyTheme(theme);

    // Listen for system changes if set to system
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const setTheme = (newTheme) => {
    localStorage.removeItem('theme'); // Clean up any existing local storage
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, activeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
