"use client";

import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '@/lib/types';
import { useAuth, useFirestore } from '@/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
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
        
        // Use onSnapshot to listen for real-time updates from Firestore.
        // This is the single source of truth for user data.
        const unsubSnapshot = onSnapshot(userDocRef, async (docSnap) => {
          if (docSnap.exists()) {
            let userData = { uid: docSnap.id, ...docSnap.data() } as User;
            // Check if the logged-in user is an admin and override role if necessary
            if (fbUser.email && ADMIN_EMAILS.includes(fbUser.email)) {
                userData.role = 'admin';
            }
            setUser(userData);
          } else {
            // User is authenticated but doesn't have a Firestore document.
            // This can happen if registration was interrupted. Let's create it.
            console.warn("User document not found for authenticated user. Creating one now.");
            
            const isAdmin = fbUser.email && ADMIN_EMAILS.includes(fbUser.email);

            const newUser: Omit<User, 'uid'> = {
                name: fbUser.displayName || 'Usuario Anónimo',
                email: fbUser.email || 'no-email@example.com',
                avatar: fbUser.photoURL || PlaceHolderImages[0].imageUrl,
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
                // No need to call setUser here, onSnapshot will trigger again with the new data.
            } catch (error) {
                console.error("Failed to create fallback user document:", error);
                auth.signOut();
            }
          }
        });
        
        return () => unsubSnapshot(); // Cleanup snapshot listener

      } else {
        // User logged out
        setFirebaseUser(null);
        setUser(null);
      }
    });

    return () => unsubscribe(); // Cleanup auth state listener
  }, [auth, firestore]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('classconnect-theme', newTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
  }, []);

  // These functions can be simplified or removed if all updates happen via Firestore.
  // Kept for potential other uses, but our main flow is now Firestore-driven.
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
    // No need to clear localStorage, as we are no longer using it for user data.
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
