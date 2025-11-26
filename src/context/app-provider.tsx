"use client";

import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '@/lib/types';
import { useAuth, useFirestore } from '@/firebase';
import { onAuthStateChanged, type User as FirebaseUser, deleteUser } from 'firebase/auth';
import { doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';

export type Theme = 'light' | 'dark';

export interface AppContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
  deleteAccount: () => Promise<void>;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isChatBubbleVisible: boolean;
  toggleChatBubble: () => void;
  isChatDrawerOpen: boolean;
  setChatDrawerOpen: (isOpen: boolean) => void;
}

const ADMIN_EMAILS = ['anavarrod@iestorredelpalau.cat', 'lrotav@iestorredelpalau.cat'];

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
        
        const unsubSnapshot = onSnapshot(userDocRef, async (docSnap) => {
          if (docSnap.exists()) {
            let userData = { uid: docSnap.id, ...docSnap.data() } as User;
            if (fbUser.email && ADMIN_EMAILS.includes(fbUser.email)) {
                userData.role = 'admin';
            }
            setUser(userData);
          } else {
            console.warn("User document not found for authenticated user. Creating one now.");
            
            const isAdmin = fbUser.email && ADMIN_EMAILS.includes(fbUser.email);
            const firstInitial = fbUser.displayName?.charAt(0).toUpperCase() || 'A';
            const defaultAvatarUrl = `https://placehold.co/100x100/A78BFA/FFFFFF?text=${firstInitial}`;

            const newUser: Omit<User, 'uid'> = {
                name: fbUser.displayName || 'Usuario Anónimo',
                email: fbUser.email || 'no-email@example.com',
                avatar: fbUser.photoURL || defaultAvatarUrl,
                center: 'Centro no especificado',
                ageRange: 'No especificado',
                course: 'No especificado',
                className: 'A',
                role: isAdmin ? 'admin' : 'student',
                trophies: 0,
                tasks: 0,
                exams: 0,
                pending: 0,
                activities: 0,
            };
            try {
                await setDoc(userDocRef, newUser);
            } catch (error) {
                console.error("Failed to create fallback user document:", error);
                auth.signOut();
            }
          }
        });
        
        return () => unsubSnapshot();

      } else {
        setFirebaseUser(null);
        setUser(null);
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
  };
  
  const updateUser = (updatedData: Partial<User>) => {
    setUser(currentUser => {
      if (!currentUser) return null;
      const newUser = { ...currentUser, ...updatedData };
      return newUser;
    });
  };

  const logout = () => {
    if (auth) {
      auth.signOut();
    }
    setUser(null);
    setFirebaseUser(null);
  };

  const deleteAccount = async () => {
    if (!auth || !auth.currentUser || !firestore) {
        throw new Error("La autenticación no está lista. Inténtalo de nuevo.");
    }

    const currentUser = auth.currentUser;
    
    // 1. Delete Firestore document
    const userDocRef = doc(firestore, 'users', currentUser.uid);
    await deleteDoc(userDocRef);

    // 2. Delete Firebase Auth user
    // This is the sensitive part and might require recent re-authentication.
    await deleteUser(currentUser);
    
    // The onAuthStateChanged listener will handle setting user state to null.
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
    deleteAccount,
    theme,
    setTheme,
    isChatBubbleVisible,
    toggleChatBubble,
    isChatDrawerOpen,
    setChatDrawerOpen,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
