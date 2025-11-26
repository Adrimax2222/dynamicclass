"use client";

import { useApp } from "@/lib/hooks/use-app";
import BottomNav from "@/components/layout/bottom-nav";
import ChatBubble from "@/components/chatbot/chat-bubble";
import ChatDrawer from "@/components/chatbot/chat-drawer";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import LoadingScreen from "@/components/layout/loading-screen";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, theme, firebaseUser } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  
  // Handles theme changes
  useEffect(() => {
    const storedTheme = localStorage.getItem('classconnect-theme') || 'light';
    document.documentElement.classList.toggle('dark', storedTheme === 'dark');
  }, [theme]);
  
  // Auth status check
  useEffect(() => {
    // If firebaseUser is null after auth state has been checked, redirect to login
    // but give it a moment in case it's just initializing
    const timer = setTimeout(() => {
        if (firebaseUser === null) {
            if (pathname !== '/') {
                router.replace("/");
            }
        }
    }, 200); // 200ms delay to prevent flash on initial load

    return () => clearTimeout(timer);

  }, [firebaseUser, pathname, router]);
  
  // While user or firebaseUser is being determined, show a loader.
  // This covers the initial load time for auth state and Firestore doc fetch.
  // The !user check is crucial because it waits for the Firestore data,
  // which prevents premature redirects for newly registered (but not yet verified) users.
  if (!user || !firebaseUser?.emailVerified) {
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
      </div>
    </div>
  );
}
