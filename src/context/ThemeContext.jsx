// src/context/ThemeContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

const ThemeContext = createContext(null);
const THEME_KEY = 'flashcards-theme';

function applyThemeClass(theme) {
  const root = document.documentElement;
  if (!root) return;

  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  // On mount: read from localStorage or system preference
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(THEME_KEY);
      let initial = 'light';

      if (stored === 'light' || stored === 'dark') {
        initial = stored;
      } else if (
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        initial = 'dark';
      }

      setTheme(initial);
      applyThemeClass(initial);
    } catch (e) {
      // If localStorage is blocked, just default to light
      applyThemeClass('light');
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        window.localStorage.setItem(THEME_KEY, next);
      } catch (e) {
        // ignore
      }
      applyThemeClass(next);
      return next;
    });
  };

  const value = { theme, toggleTheme };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
