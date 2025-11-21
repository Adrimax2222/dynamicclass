"use client";

import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '@/lib/types';
import { useAuth, useFirestore } from '@/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

export type Theme = 'light' | 'dark';

export interface AppContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
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
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [theme, setThemeState] = useState<Theme>('light');
  const [isChatBubbleVisible, setIsChatBubbleVisible] = useState(false);
  const [isChatDrawerOpen, setChatDrawerOpen] = useState(false);
  
  const auth = useAuth();
  const firestore = useFirestore();

  useEffect(() => {
    const storedTheme = (localStorage.getItem('classconnect-theme') as Theme) || 'light';
    setThemeState(storedTheme);
    document.documentElement.classList.add(storedTheme);
  }, []);

  useEffect(() => {
    if (!auth || !firestore) return;

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        const userDocRef = doc(firestore, 'users', fbUser.uid);
        
        // Use onSnapshot to listen for real-time updates
        const unsubSnapshot = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data() as User;
            setUser(userData);
            localStorage.setItem('classconnect-user', JSON.stringify(userData));
          } else {
            console.log("No such user document!");
            setUser(null);
            localStorage.removeItem('classconnect-user');
          }
        });
        
        return () => unsubSnapshot(); // Cleanup snapshot listener

      } else {
        setFirebaseUser(null);
        setUser(null);
        localStorage.removeItem('classconnect-user');
      }
    });

    return () => unsubscribe();
  }, [auth, firestore]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('classconnect-theme', newTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
  }, []);

  // This login function is now primarily for the initial registration step
  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('classconnect-user', JSON.stringify(userData));
  };

  const logout = () => {
    // Firebase onAuthStateChanged will handle setting user to null
    localStorage.removeItem('classconnect-user');
    setUser(null);
    setFirebaseUser(null);
  };

  const toggleChatBubble = () => {
    setIsChatBubbleVisible(prev => !prev);
  };

  const value: AppContextType = {
    user,
    firebaseUser,
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
