
"use client";

import { useApp } from "@/lib/hooks/use-app";
import BottomNav from "@/components/layout/bottom-nav";
import ChatBubble from "@/components/chatbot/chat-bubble";
import ClassChatBubble from "@/components/layout/class-chat-bubble";
import ChatDrawer from "@/components/chatbot/chat-drawer";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import LoadingScreen from "@/components/layout/loading-screen";
import { signOut } from "firebase/auth";
import { useFcmToken } from '@/lib/hooks/use-fcm-token';
import FloatingStudyTimer from "@/components/layout/floating-study-timer";
import { OnboardingTour } from "@/components/onboarding/onboarding-tour";
import { doc, updateDoc, increment } from "firebase/firestore";
import { useFirestore } from "@/firebase";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, theme, firebaseUser, auth, updateUser } = useApp();
  const router = useRouter();
  const firestore = useFirestore();
  const pathname = usePathname();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Hook to handle FCM token logic
  useFcmToken();

  // Handles theme changes
  useEffect(() => {
    const storedTheme = localStorage.getItem('classconnect-theme') || 'light';
    document.documentElement.classList.toggle('dark', storedTheme === 'dark');
  }, [theme]);
  
  // Auth status check & Onboarding logic
  useEffect(() => {
    if (firebaseUser === undefined) {
        return; // Still waiting for auth state
    }
    if (firebaseUser === null) {
      router.replace("/");
      return; // Not logged in, redirect
    }

    // We have a firebaseUser, now wait for the full user profile from Firestore
    if (user) {
        // User profile is loaded, now check onboarding status
        const shouldShow = (user.accessCount || 0) < 2;
        setShowOnboarding(shouldShow);
        setIsCheckingAuth(false);
    }
  }, [firebaseUser, user, router]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };
  
  const handleFinishOnboarding = async () => {
    if (firestore && user) {
        const userDocRef = doc(firestore, 'users', user.uid);
        await updateDoc(userDocRef, {
            accessCount: increment(1)
        });
        // The local user state will update automatically via the onSnapshot listener in AppProvider
    }
  };


  if (isCheckingAuth || !user) {
    return <LoadingScreen />;
  }
  
  if (showOnboarding) {
    return <OnboardingTour onComplete={handleOnboardingComplete} onFinishTour={handleFinishOnboarding} />;
  }

  return (
    <div className="flex justify-center bg-muted/20">
      <div className="relative flex min-h-screen w-full max-w-md flex-col border-x bg-background shadow-2xl">
        <main className="flex-1 pb-20">{children}</main>
        <div className="fixed bottom-0 left-0 right-0 z-10 mx-auto max-w-md">
            <BottomNav />
        </div>
        <ChatBubble />
        <ClassChatBubble />
        <ChatDrawer />
        <FloatingStudyTimer />
      </div>
    </div>
  );
}
