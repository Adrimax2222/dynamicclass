"use client";

import { useState } from "react";
import { Sparkles, Loader2, Paperclip, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useApp } from "@/lib/hooks/use-app";
import type { ChatMessage } from "@/lib/types";
import { aiChatbotAssistance } from "@/ai/flows/ai-chatbot-assistance";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { cn } from "@/lib/utils";

export default function ChatDrawer() {
  const { isChatDrawerOpen, setChatDrawerOpen } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const result = await aiChatbotAssistance({ query: input });
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.response,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "system",
        content: "Lo siento, he encontrado un problema. Por favor, inténtalo de nuevo.",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isChatDrawerOpen} onOpenChange={setChatDrawerOpen}>
      <SheetContent className="flex flex-col p-0">
        <SheetHeader className="p-6">
          <SheetTitle className="flex items-center gap-2 font-headline">
            <Sparkles className="h-6 w-6 text-primary" />
            ADRIMAX AI
          </SheetTitle>
          <SheetDescription>
            Tu asistente educativo personal.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                    <AvatarFallback>
                      <Sparkles className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-xs rounded-lg p-3 text-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted",
                    message.role === "system" && "mx-auto bg-destructive/20 text-destructive-foreground"
                  )}
                >
                  <p>{message.content}</p>
                  <p className="mt-1 text-xs opacity-50">{message.timestamp}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3 justify-start">
                <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                  <AvatarFallback>
                    <Sparkles className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="max-w-xs rounded-lg p-3 text-sm bg-muted flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="border-t p-4">
          <div className="relative">
            <Textarea
              placeholder="Pregúntame cualquier cosa..."
              className="pr-24"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
              <Button variant="ghost" size="icon" aria-label="Adjuntar archivo">
                <Paperclip className="h-5 w-5" />
              </Button>
              <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()} aria-label="Enviar mensaje">
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
