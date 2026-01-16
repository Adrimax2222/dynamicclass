
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

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, theme, firebaseUser, auth } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Hook to handle FCM token logic
  useFcmToken();

  // Handles theme changes
  useEffect(() => {
    const storedTheme = localStorage.getItem('classconnect-theme') || 'light';
    document.documentElement.classList.toggle('dark', storedTheme === 'dark');
  }, [theme]);
  
  // Auth status check
  useEffect(() => {
    // firebaseUser being undefined means auth state is still being checked.
    // We wait until it's either a user object or null.
    if (firebaseUser !== undefined) {
      if (firebaseUser === null) {
        // Not logged in, redirect to login page.
        router.replace("/");
      } else {
        // User is logged in. The logic to check for verification is handled
        // on the login page itself. Once they are past that, they are allowed in.
        // We just need to wait for the Firestore user data to be loaded.
        if (user) {
          setIsCheckingAuth(false);
        }
      }
    }
  }, [firebaseUser, user, router, auth]);

  // While auth state is being checked, or we're waiting for the Firestore user data, show loader.
  if (isCheckingAuth || !user) {
    return <LoadingScreen />;
  }

  // If we reach here, user is authenticated and user data is available
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
