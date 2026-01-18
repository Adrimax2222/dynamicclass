
"use client";

import { useApp } from "@/lib/hooks/use-app";
import BottomNav from "@/components/layout/bottom-nav";
import ChatBubble from "@/components/chatbot/chat-bubble";
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
  
  // Hook to handle FCM token logic
  useFcmToken();

  // Handles theme changes
  useEffect(() => {
    const storedTheme = localStorage.getItem('classconnect-theme') || 'light';
    document.documentElement.classList.toggle('dark', storedTheme === 'dark');
  }, [theme]);
  
  // Auth status check
  useEffect(() => {
    if (firebaseUser !== undefined) {
      if (firebaseUser === null) {
        router.replace("/");
      } else {
        if (user) {
          // Temporarily set to true for testing purposes
          const shouldShow = true;
          setShowOnboarding(shouldShow);
          setIsCheckingAuth(false);
        }
      }
    }
  }, [firebaseUser, user, router, auth]);

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    if (user && firestore) {
        const userDocRef = doc(firestore, 'users', user.uid);
        try {
            await updateDoc(userDocRef, { hasSeenOnboarding: true });
            updateUser({ hasSeenOnboarding: true }); // Optimistically update local state
        } catch (error) {
            console.error("Failed to update onboarding status:", error);
        }
    }
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
        <ChatDrawer />
        <FloatingStudyTimer />
      </div>
    </div>
  );
}
