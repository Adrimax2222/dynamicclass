"use client";

import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/hooks/use-app";
import { Bot, MessageCircle } from "lucide-react";

export default function ChatBubble() {
  const { isChatBubbleVisible, setChatDrawerOpen } = useApp();

  if (!isChatBubbleVisible) {
    return null;
  }

  return (
    <Button
      size="icon"
      className="fixed bottom-20 right-4 h-14 w-14 rounded-full bg-primary shadow-lg transition-transform hover:scale-110 active:scale-95"
      onClick={() => setChatDrawerOpen(true)}
      aria-label="Abrir Chat de IA"
    >
      <Bot className="h-7 w-7" />
    </Button>
  );
}
