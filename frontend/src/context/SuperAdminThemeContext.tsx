'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dark' | 'light';

interface SuperAdminThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const SuperAdminThemeContext = createContext<SuperAdminThemeContextType>({
  theme: 'dark',
  isDark: true,
  toggleTheme: () => {},
  setTheme: () => {},
});

export function SuperAdminThemeProvider({ children }: { children: React.ReactNode }) {
  // Default mode adalah mode gelap (dark) sesuai bawaan sistem
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('superadmin_theme') as Theme | null;
      if (saved === 'light' || saved === 'dark') {
        setThemeState(saved);
      }
    } catch {
      // LocalStorage fallback jika akses terblokir
    }
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem('superadmin_theme', t);
    } catch {}
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  return (
    <SuperAdminThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        toggleTheme,
        setTheme,
      }}
    >
      <div className={theme === 'dark' ? 'dark text-slate-100' : 'light text-slate-900'} data-superadmin-theme={theme}>
        {children}
      </div>
    </SuperAdminThemeContext.Provider>
  );
}

export function useSuperAdminTheme() {
  return useContext(SuperAdminThemeContext);
}
