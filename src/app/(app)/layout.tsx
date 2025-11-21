"use client";

import { useApp } from "@/lib/hooks/use-app";
import BottomNav from "@/components/layout/bottom-nav";
import ChatBubble from "@/components/chatbot/chat-bubble";
import ChatDrawer from "@/components/chatbot/chat-drawer";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, theme, setTheme } = useApp();
  const router = useRouter();

  useEffect(() => {
    const storedTheme = localStorage.getItem('classconnect-theme') || 'light';
    if (document.documentElement.classList.contains('dark') && storedTheme === 'light') {
        document.documentElement.classList.remove('dark');
    }
    if (!document.documentElement.classList.contains('dark') && storedTheme === 'dark') {
        document.documentElement.classList.add('dark');
    }
  }, [theme]);
  
  useEffect(() => {
    // If user data isn't loaded yet, we can't make a decision.
    // If there's no user, redirect to login.
    const storedUser = localStorage.getItem('classconnect-user');
    if (!storedUser) {
      router.replace("/");
    }
  }, [user, router]);
  
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
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
