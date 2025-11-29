
"use client";

import { useState, useRef, useEffect } from "react";
import {
  Loader2,
  Paperclip,
  Send,
  Sparkles,
  Image as ImageIcon,
  Type as TypeIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";
import { aiChatbotAssistance } from "@/ai/flows/ai-chatbot-assistance";
import { generateFalImage } from "@/ai/flows/fal-image-flow";
import { useApp } from "@/lib/hooks/use-app";
import { Badge } from "@/components/ui/badge";

type AIMode = "text" | "image";

export default function ChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useApp();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [aiMode, setAiMode] = useState<AIMode>("text");

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      if (aiMode === "text") {
        const result = await aiChatbotAssistance({ query: currentInput });
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: result.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else { // Image mode
        const result = await generateFalImage({ prompt: currentInput });
        const imageMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: result.imageUrl,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'image',
        };
        setMessages((prev) => [...prev, imageMessage]);
      }
    } catch (error: any) {
      console.error("AI Error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "system",
        content: `Lo siento, he encontrado un problema: ${error.message || 'Error desconocido'}. Por favor, inténtalo de nuevo.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const placeholderText = aiMode === "text"
    ? "Pregúntame sobre cualquier tema..."
    : "Describe la imagen que quieres crear...";

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <header className="border-b p-4">
        <div className="flex justify-between items-center">
            <div>
                 <h1 className="text-xl font-bold font-headline tracking-tighter flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary" /> ADRIMAX AI
                </h1>
                <p className="text-sm text-muted-foreground">Tu entusiasta compañero creativo y educativo.</p>
            </div>
            <div className="flex items-center gap-2 rounded-full border p-1">
                <Button size="sm" variant={aiMode === 'text' ? 'secondary' : 'ghost'} onClick={() => setAiMode('text')} className="rounded-full">
                    <TypeIcon className="h-4 w-4 mr-2" />
                    Texto
                </Button>
                <Button size="sm" variant={aiMode === 'image' ? 'secondary' : 'ghost'} onClick={() => setAiMode('image')} className="rounded-full">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Imagen
                </Button>
            </div>
        </div>
      </header>

      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="space-y-6 p-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 mt-16">
              <Sparkles className="h-12 w-12 mb-4" />
              <p className="text-lg font-semibold">¡Comienza una conversación!</p>
              <p>{placeholderText}</p>
              {aiMode === 'image' && <Badge variant="outline" className="mt-4">Powered by Fal AI</Badge>}
            </div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex items-end gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {(message.role === "assistant" || message.role === 'system') && (
                <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                  <AvatarFallback><Sparkles className="h-5 w-5" /></AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-lg",
                  message.role === "user" && "bg-primary text-primary-foreground",
                  message.role === "assistant" && "bg-muted",
                  message.role === 'system' && "bg-destructive text-destructive-foreground",
                  message.type !== 'image' && 'p-3'
                )}
              >
                {message.type === 'image' ? (
                  <div className="p-2">
                    <img src={message.content} alt="Generated image" className="rounded-lg" />
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
                <p className="mt-1 px-3 pb-1 text-right text-xs opacity-60">{message.timestamp}</p>
              </div>
              {message.role === "user" && user && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-end gap-3 justify-start">
              <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                <AvatarFallback><Sparkles className="h-5 w-5" /></AvatarFallback>
              </Avatar>
              <div className="max-w-md rounded-lg p-3 bg-muted flex items-center">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="mt-auto border-t bg-background p-4">
        <div className="relative">
          <Textarea
            placeholder={placeholderText}
            className="pr-28"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-1">
            <Button variant="ghost" size="icon" aria-label="Adjuntar archivo" disabled>
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()}>
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
