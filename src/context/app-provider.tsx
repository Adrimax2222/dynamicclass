
"use client";

import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, Chat } from '@/lib/types';
import { useAuth, useFirestore } from '@/firebase';
import { onAuthStateChanged, type User as FirebaseUser, deleteUser } from 'firebase/auth';
import { doc, onSnapshot, setDoc, deleteDoc, collection, query, orderBy, updateDoc } from 'firebase/firestore';

export type Theme = 'light' | 'dark';

export interface AppContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null | undefined; // Now can be undefined during initial check
  auth: ReturnType<typeof useAuth> | null;
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

  // Chat History State
  chats: Chat[];
  activeChatId: string | null;
  setActiveChatId: (chatId: string | null) => void;
  isChatsLoading: boolean;
}

const ADMIN_EMAILS = ['anavarrod@iestorredelpalau.cat', 'lrotav@iestorredelpalau.cat', 'adrimax.dev@gmail.com'];

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null | undefined>(undefined); // Start as undefined
  const [theme, setThemeState] = useState<Theme>('light');
  const [isChatBubbleVisible, setIsChatBubbleVisible] = useState(true);
  const [isChatDrawerOpen, setChatDrawerOpen] = useState(false);
  
  // Chat history state
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isChatsLoading, setIsChatsLoading] = useState(true);

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
      setFirebaseUser(fbUser); 
      if (fbUser) { 
        const isAdmin = fbUser.email && ADMIN_EMAILS.includes(fbUser.email);
        
        if (fbUser.emailVerified || isAdmin) {
            const userDocRef = doc(firestore, 'users', fbUser.uid);
            
            const unsubSnapshot = onSnapshot(userDocRef, async (docSnap) => {
              if (docSnap.exists()) {
                let userData = { uid: docSnap.id, ...docSnap.data() } as User;
                
                // Ensure streak and studyMinutes are numbers
                userData.streak = userData.streak || 0;
                userData.studyMinutes = userData.studyMinutes || 0;

                if (isAdmin && userData.role !== 'admin') {
                   await updateDoc(userDocRef, { role: 'admin' });
                   userData.role = 'admin';
                }

                if (isAdmin) {
                    await updateDoc(userDocRef, { trophies: 9999 });
                    userData.trophies = 9999;
                }

                setUser(userData);
              } else {
                console.warn("User document not found for authenticated user.");
              }
            });
            
            return () => unsubSnapshot();
        }
      } else {
        // User is not logged in, clear all user-specific state
        setUser(null);
        setChats([]);
        setActiveChatId(null);
        setIsChatsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, firestore]);
  
  // Effect to load chat history
  useEffect(() => {
    if (!firestore || !user) {
        setIsChatsLoading(false);
        return;
    }

    setIsChatsLoading(true);
    const chatsCollectionRef = collection(firestore, `users/${user.uid}/chats`);
    const q = query(chatsCollectionRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const userChats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat));
        setChats(userChats);
        
        // If there's no active chat, set it to the most recent one.
        if (activeChatId === null && userChats.length > 0) {
            setActiveChatId(userChats[0].id);
        } else if (userChats.length === 0) {
            // No chats exist
            setActiveChatId(null);
        }
        setIsChatsLoading(false);
    }, (error) => {
        console.error("Error fetching chat history:", error);
        setIsChatsLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, user, activeChatId]);


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
    
    const userDocRef = doc(firestore, 'users', currentUser.uid);
    await deleteDoc(userDocRef);

    await deleteUser(currentUser);
  };

  const toggleChatBubble = () => {
    setIsChatBubbleVisible(prev => !prev);
  };

  const value: AppContextType = {
    user,
    firebaseUser,
    auth,
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
    // Chat context values
    chats,
    activeChatId,
    setActiveChatId,
    isChatsLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
