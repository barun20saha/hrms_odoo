import { create } from 'zustand'

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  initializeTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',
  toggleTheme: () => {
    const nextTheme = get().theme === 'light' ? 'dark' : 'light';
    const root = window.document.documentElement;
    if (nextTheme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('hrms_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('hrms_theme', 'light');
    }
    set({ theme: nextTheme });
  },
  initializeTheme: () => {
    const savedTheme = localStorage.getItem('hrms_theme') as 'light' | 'dark' | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const activeTheme = savedTheme || systemTheme;

    const root = window.document.documentElement;
    if (activeTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    set({ theme: activeTheme });
  },
}));
