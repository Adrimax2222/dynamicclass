"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Loader2,
  Paperclip,
  Send,
  Sparkles,
  Mic,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";
import { aiChatbotAssistance } from "@/ai/flows/ai-chatbot-assistance";
import { useApp } from "@/lib/hooks/use-app";

type ResponseLength = "short" | "medium" | "long";
type Subject = "general" | "mathematics" | "physics" | "chemistry" | "language" | "biology" | "music" | "programming" | "social_sciences" | "geography";

export default function ChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [responseLength, setResponseLength] = useState<ResponseLength>("medium");
  const [subject, setSubject] = useState<Subject>("general");
  const { isChatBubbleVisible, toggleChatBubble, user } = useApp();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        // This is a bit of a hack to get the viewport. 
        // Shadcn's ScrollArea doesn't expose the viewport ref directly.
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
      const result = await aiChatbotAssistance({
        query: currentInput,
        subject: subject === 'general' ? undefined : subject.replace('_', ' '),
        responseLength,
      });
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI Chatbot Error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "system",
        content: "Sorry, I ran into a problem. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex h-[calc(100vh-8rem)] max-w-4xl flex-col p-4 sm:p-6">
      <header className="mb-4">
        <h1 className="text-2xl font-bold font-headline tracking-tighter sm:text-3xl flex items-center gap-2">
          <Bot className="h-7 w-7 text-primary" /> ADRIMAX AI
        </h1>
        <p className="text-muted-foreground">Your enthusiastic educational partner.</p>
      </header>

      <div className="mb-4 grid grid-cols-1 gap-4 rounded-lg border bg-card p-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label>Response Length</Label>
          <Select value={responseLength} onValueChange={(v: ResponseLength) => setResponseLength(v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Short</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="long">Long</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Subject/Topic</Label>
          <Select value={subject} onValueChange={(v: Subject) => setSubject(v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="mathematics">Mathematics</SelectItem>
              <SelectItem value="physics">Physics</SelectItem>
              <SelectItem value="chemistry">Chemistry</SelectItem>
              <SelectItem value="language">Language</SelectItem>
              <SelectItem value="biology">Biology</SelectItem>
              <SelectItem value="music">Music</SelectItem>
              <SelectItem value="programming">Programming</SelectItem>
              <SelectItem value="social_sciences">Social Sciences</SelectItem>
              <SelectItem value="geography">Geography</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
            <div className="flex w-full items-center justify-between space-x-2 rounded-md border p-3">
                <div className="flex flex-col">
                    <Label htmlFor="chat-bubble-switch">Chat Bubble</Label>
                    <span className="text-xs text-muted-foreground">Access AI from anywhere</span>
                </div>
                <Switch id="chat-bubble-switch" checked={isChatBubbleVisible} onCheckedChange={toggleChatBubble} />
            </div>
        </div>
      </div>

      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="space-y-6 p-4">
            {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <Sparkles className="h-12 w-12 mb-4" />
                    <p className="text-lg font-semibold">Start a conversation!</p>
                    <p>Ask me about {subject === 'general' ? 'anything' : subject.replace('_', ' ')}, and I'll do my best to help.</p>
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
                  <AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "max-w-md rounded-lg p-3",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted",
                  message.role === 'system' && "bg-destructive text-destructive-foreground"
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className="mt-1 text-right text-xs opacity-60">{message.timestamp}</p>
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
                <AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback>
              </Avatar>
              <div className="max-w-md rounded-lg p-3 bg-muted flex items-center">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="mt-4 border-t pt-4">
        <div className="relative">
          <Textarea
            placeholder="Send a message..."
            className="pr-32"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
            <Button variant="ghost" size="icon" aria-label="Attach file">
              <Paperclip className="h-5 w-5" />
            </Button>
             <Button variant="ghost" size="icon" aria-label="Use microphone">
              <Mic className="h-5 w-5" />
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
