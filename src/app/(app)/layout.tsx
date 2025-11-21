"use client";

import { useApp } from "@/lib/hooks/use-app";
import BottomNav from "@/components/layout/bottom-nav";
import ChatBubble from "@/components/chatbot/chat-bubble";
import ChatDrawer from "@/components/chatbot/chat-drawer";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, theme } = useApp();
  const router = useRouter();
  const auth = useAuth();
  const pathname = usePathname();
  const [authStatus, setAuthStatus] = useState<'loading' | 'authed' | 'unauthed'>('loading');

  useEffect(() => {
    const storedTheme = localStorage.getItem('classconnect-theme') || 'light';
    document.documentElement.classList.toggle('dark', storedTheme === 'dark');
  }, [theme]);
  
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setAuthStatus('authed');
      } else {
        setAuthStatus('unauthed');
        router.replace("/");
      }
    });
    return () => unsubscribe();
  }, [auth, router]);
  
  // Show a loading screen while checking auth status
  if (authStatus === 'loading' || (authStatus === 'authed' && !user)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If unauthenticated, we've already started the redirect, so we can render null
  // or a minimal layout to prevent flashing the main app layout.
  if (authStatus === 'unauthed') {
      return (
        <div className="flex h-screen items-center justify-center">
            <p>Redirigiendo...</p>
        </div>
      );
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
      </div>
    </div>
  );
}
