import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, setTheme, activeTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(activeTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors flex items-center justify-center text-gray-700 dark:text-gray-300 ${className}`}
    >
      {activeTheme === 'dark' ? (
        <Moon size={18} className="animate-in zoom-in duration-300" />
      ) : (
        <Sun size={18} className="animate-in zoom-in duration-300" />
      )}
    </button>
  );
};

export default ThemeToggle;
