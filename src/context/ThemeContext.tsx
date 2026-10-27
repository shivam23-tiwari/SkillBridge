import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'warm' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'skillbridge_theme_mode';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to minimalist 'light' background as requested by user
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode;
      if (saved && (saved === 'light' || saved === 'warm' || saved === 'dark')) {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'light';
  });

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore
    }

    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-warm', 'theme-dark');
    root.classList.add(`theme-${theme}`);
    root.setAttribute('data-theme', theme);

    if (theme === 'light') {
      document.body.style.backgroundColor = '#F8F9FA';
      document.body.style.color = '#111827';
    } else if (theme === 'warm') {
      document.body.style.backgroundColor = '#FAF9F6';
      document.body.style.color = '#1C1917';
    } else {
      document.body.style.backgroundColor = '#0A0A0A';
      document.body.style.color = '#F3F4F6';
    }
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(prev => {
      if (prev === 'light') return 'warm';
      if (prev === 'warm') return 'dark';
      return 'light';
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
