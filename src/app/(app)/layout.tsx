
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
import { doc, updateDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, theme, firebaseUser, auth, updateUser } = useApp();
  const router = useRouter();
  const firestore = useFirestore();
  const pathname = usePathname();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingCheckDone, setOnboardingCheckDone] = useState(false);
  
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
        return;
    }
    if (firebaseUser === null) {
      router.replace("/");
      return;
    }
    
    if (user && !onboardingCheckDone) {
        const shouldShow = (user.accessCount || 0) < 2;

        setShowOnboarding(shouldShow);
        setOnboardingCheckDone(true);
        setIsCheckingAuth(false);
    } else if (user) {
        setIsCheckingAuth(false);
    }
  }, [firebaseUser, user, router, onboardingCheckDone]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  if (isCheckingAuth || !user) {
    return <LoadingScreen />;
  }
  
  if (showOnboarding) {
    return <OnboardingTour onComplete={handleOnboardingComplete} />;
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
