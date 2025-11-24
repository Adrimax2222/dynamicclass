"use client";

import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '@/lib/types';
import { useAuth, useFirestore } from '@/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export type Theme = 'light' | 'dark';

export interface AppContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
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
  const [isChatBubbleVisible, setIsChatBubbleVisible] = useState(true);
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
        const unsubSnapshot = onSnapshot(userDocRef, async (docSnap) => {
          if (docSnap.exists()) {
            const userData = { uid: docSnap.id, ...docSnap.data() } as User;
            setUser(userData);
            localStorage.setItem('classconnect-user', JSON.stringify(userData));
          } else {
            // User is authenticated but doesn't have a Firestore document.
            // This can happen if registration was interrupted. Let's create it.
            console.warn("User document not found for authenticated user. Creating one now.");
            const newUser: User = {
                uid: fbUser.uid,
                name: fbUser.displayName || 'Usuario Anónimo',
                email: fbUser.email || 'no-email@example.com',
                avatar: fbUser.photoURL || PlaceHolderImages[0].imageUrl,
                center: 'Centro no especificado',
                ageRange: 'No especificado',
                role: 'student',
                trophies: 0,
                tasks: 0,
                exams: 0,
                pending: 0,
                activities: 0,
            };
            try {
                await setDoc(userDocRef, newUser);
                setUser(newUser); // Set user in context after creation
                localStorage.setItem('classconnect-user', JSON.stringify(newUser));
            } catch (error) {
                console.error("Failed to create fallback user document:", error);
                // If we can't create the doc, log them out to prevent being stuck.
                auth.signOut();
            }
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

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('classconnect-user', JSON.stringify(userData));
  };
  
  const updateUser = (updatedData: Partial<User>) => {
    setUser(currentUser => {
      if (!currentUser) return null;
      const newUser = { ...currentUser, ...updatedData };
      localStorage.setItem('classconnect-user', JSON.stringify(newUser));
      return newUser;
    });
  };

  const logout = () => {
    if (auth) {
      auth.signOut();
    }
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
    updateUser,
    theme,
    setTheme,
    isChatBubbleVisible,
    toggleChatBubble,
    isChatDrawerOpen,
    setChatDrawerOpen,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
