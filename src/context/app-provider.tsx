"use client";

import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '@/lib/types';

export type Theme = 'light' | 'dark';

export interface AppContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isChatBubbleVisible: boolean;
  toggleChatBubble: () => void;
  isChatDrawerOpen: boolean;
  setChatDrawerOpen: (isOpen: boolean) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setThemeState] = useState<Theme>('light');
  const [isChatBubbleVisible, setIsChatBubbleVisible] = useState(false);
  const [isChatDrawerOpen, setChatDrawerOpen] = useState(false);

  useEffect(() => {
    const storedTheme = (localStorage.getItem('classconnect-theme') as Theme) || 'light';
    setThemeState(storedTheme);

    const storedUser = localStorage.getItem('classconnect-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('classconnect-theme', newTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('classconnect-user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('classconnect-user');
  };

  const toggleChatBubble = () => {
    setIsChatBubbleVisible(prev => !prev);
  };

  const value: AppContextType = {
    user,
    login,
    logout,
    theme,
    setTheme,
    isChatBubbleVisible,
    toggleChatBubble,
    isChatDrawerOpen,
    setChatDrawerOpen,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
