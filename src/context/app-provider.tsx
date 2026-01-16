
"use client";

import { createContext, useState, useEffect, useCallback, type ReactNode, useMemo, useRef } from 'react';
import type { User, Chat, TimerMode, Phase, CustomMode } from '@/lib/types';
import { useAuth, useFirestore } from '@/firebase';
import { onAuthStateChanged, type User as FirebaseUser, deleteUser } from 'firebase/auth';
import { doc, onSnapshot, setDoc, deleteDoc, collection, query, orderBy, updateDoc, increment, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { format as formatDate, subDays, isSameDay } from 'date-fns';


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

  // Scanner settings
  saveScannedDocs: boolean;
  setSaveScannedDocs: (save: boolean) => void;

  // Global Study Timer State
  timerMode: TimerMode;
  setTimerMode: (mode: TimerMode) => void;
  phase: Phase;
  setPhase: (phase: Phase) => void;
  isActive: boolean;
  setIsActive: (isActive: boolean) => void;
  timeLeft: number;
  setTimeLeft: (time: number) => void;
  customMode: CustomMode;
  setCustomMode: (mode: CustomMode) => void;
  resetTimer: () => void;
  skipPhase: () => void;
}

const ADMIN_EMAILS = ['anavarrod@iestorredelpalau.cat', 'lrotav@iestorredelpalau.cat', 'adrimax.dev@gmail.com'];

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null | undefined>(undefined); // Start as undefined
  const [theme, setThemeState] = useState<Theme>('light');
  const [isChatBubbleVisible, setIsChatBubbleVisible] = useState(true);
  const [isChatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [saveScannedDocs, setSaveScannedDocsState] = useState(true);
  
  // Chat history state
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isChatsLoading, setIsChatsLoading] = useState(true);

  // Global Study Timer State
  const [timerMode, setTimerMode] = useState<TimerMode>("pomodoro");
  const [phase, setPhase] = useState<Phase>("focus");
  const [isActive, setIsActive] = useState(false);
  const [customMode, setCustomMode] = useState<CustomMode>({ focus: 45, break: 15 });

  const modes = useMemo(() => ({
    pomodoro: { focus: 25, break: 5 },
    long: { focus: 50, break: 10 },
    deep: { focus: 90, break: 20 },
    custom: { focus: customMode.focus, break: customMode.break }
  }), [customMode]);

  const getInitialTime = useCallback(() => {
    return modes[timerMode][phase] * 60;
  }, [timerMode, phase, modes]);
  
  const [timeLeft, setTimeLeft] = useState(getInitialTime());

  const lastLoggedMinuteRef = useRef<number | null>();
  const streakUpdatedTodayRef = useRef<boolean>(false);

  const auth = useAuth();
  const firestore = useFirestore();

  useEffect(() => {
    const storedTheme = (localStorage.getItem('classconnect-theme') as Theme) || 'light';
    setThemeState(storedTheme);
    document.documentElement.classList.add(storedTheme);
    
    const storedSaveDocs = localStorage.getItem('saveScannedDocs');
    if (storedSaveDocs !== null) {
      setSaveScannedDocsState(JSON.parse(storedSaveDocs));
    }
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

  const setSaveScannedDocs = useCallback((save: boolean) => {
      setSaveScannedDocsState(save);
      localStorage.setItem('saveScannedDocs', JSON.stringify(save));
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

  // ----- GLOBAL TIMER LOGIC -----

  useEffect(() => {
    // This effect resets the timer display ONLY when the user
    // changes the mode or the phase is manually skipped. It is designed
    // NOT to run when the timer is simply paused.
    if (!isActive) {
      setTimeLeft(getInitialTime());
    }
  }, [timerMode, phase, getInitialTime]);


  useEffect(() => {
    const handleVisibilityChange = () => {
      // Pausa el temporizador si la página se oculta y el temporizador está activo
      if (document.visibilityState === 'hidden' && isActive) {
        setIsActive(false);
        toast({
          title: "Estudio en pausa",
          description: "El temporizador se detuvo porque cambiaste de pestaña. Vuelve para continuar.",
          variant: "destructive",
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive, setIsActive, toast]);

  const handleStreak = useCallback(async () => {
    if (!firestore || !user || streakUpdatedTodayRef.current) return;
    
    const today = new Date();
    const todayStr = formatDate(today, 'yyyy-MM-dd');
    const lastStudyDay = user.lastStudyDay ? new Date(user.lastStudyDay) : null;

    if (lastStudyDay && isSameDay(today, lastStudyDay)) {
        streakUpdatedTodayRef.current = true;
        return;
    }

    const yesterday = subDays(today, 1);
    let newStreak = user.streak || 0;

    if (lastStudyDay && isSameDay(yesterday, lastStudyDay)) {
        newStreak++;
    } else {
        newStreak = 1;
    }
    
    const userDocRef = doc(firestore, 'users', user.uid);
    try {
        await updateDoc(userDocRef, {
            streak: newStreak,
            lastStudyDay: todayStr,
        });
        updateUser({ streak: newStreak, lastStudyDay: todayStr });
        streakUpdatedTodayRef.current = true;
    } catch (err) {
        console.error("Failed to update streak:", err);
    }
  }, [firestore, user, updateUser]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      const nextPhase = phase === "focus" ? "break" : "focus";
      const nextPhaseDuration = modes[timerMode][nextPhase];
      
      toast({
        title: `¡Tiempo de ${nextPhase === 'break' ? 'descanso' : 'enfoque'}!`,
        description: `Comienza tu bloque de ${nextPhaseDuration} minutos.`,
      });

      setPhase(nextPhase);
      setTimeLeft(modes[timerMode][nextPhase] * 60);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, timerMode, phase, toast, modes]);
  
  useEffect(() => {
    if (!firestore || !user || !isActive || phase !== 'focus') return;

    if (!streakUpdatedTodayRef.current) {
        handleStreak();
    }

    const totalDuration = modes[timerMode].focus * 60;
    const currentMinute = Math.floor((totalDuration - timeLeft) / 60);

    if (currentMinute > 0 && currentMinute !== lastLoggedMinuteRef.current) {
        lastLoggedMinuteRef.current = currentMinute;
        
        const userDocRef = doc(firestore, 'users', user.uid);
        updateDoc(userDocRef, {
            studyMinutes: increment(1)
        }).then(() => {
            updateUser({ studyMinutes: (user.studyMinutes || 0) + 1 });
        }).catch(err => {
            console.error("Failed to log study minute:", err);
        });
    }
  }, [timeLeft, isActive, phase, firestore, user, timerMode, updateUser, handleStreak, modes]);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setPhase("focus");
    setTimeLeft(getInitialTime());
    lastLoggedMinuteRef.current = null;
  }, [getInitialTime]);

  const skipPhase = useCallback(() => {
    setIsActive(false);
    const nextPhase = phase === "focus" ? "break" : "focus";
    setPhase(nextPhase);
    lastLoggedMinuteRef.current = null;
  }, [phase]);


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
    // Scanner settings
    saveScannedDocs,
    setSaveScannedDocs,
    // Global Timer
    timerMode,
    setTimerMode,
    phase,
    setPhase,
    isActive,
    setIsActive,
    timeLeft,
    setTimeLeft,
    customMode,
    setCustomMode,
    resetTimer,
    skipPhase,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
