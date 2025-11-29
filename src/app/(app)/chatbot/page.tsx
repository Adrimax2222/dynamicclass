
"use client";

import { useState, useRef, useEffect } from "react";
import {
  Loader2,
  Send,
  Sparkles,
  MessageSquarePlus,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ChatMessage, Chat } from "@/lib/types";
import { aiChatbotAssistance } from "@/ai/flows/ai-chatbot-assistance";
import { useApp } from "@/lib/hooks/use-app";
import { Logo } from "@/components/icons";
import { MarkdownRenderer } from "@/components/chatbot/markdown-renderer";
import {
  useFirestore,
  useCollection,
  useMemoFirebase,
} from "@/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
  doc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


export default function ChatbotPage() {
  const { user, activeChatId, setActiveChatId, chats, isChatsLoading } = useApp();
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const firestore = useFirestore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Memoize the query for messages of the active chat
  const messagesCollection = useMemoFirebase(() => {
    if (!firestore || !user || !activeChatId) return null;
    return query(
      collection(firestore, `users/${user.uid}/chats/${activeChatId}/messages`),
      orderBy("timestamp", "asc")
    );
  }, [firestore, user, activeChatId]);

  const { data: messages = [], isLoading: isMessagesLoading } = useCollection<ChatMessage>(messagesCollection);

  // Auto-scroll to bottom
  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages]);

  const createNewChat = async () => {
    if (!firestore || !user) return;
    
    const newChatRef = await addDoc(collection(firestore, `users/${user.uid}/chats`), {
        userId: user.uid,
        title: "Nuevo Chat",
        createdAt: serverTimestamp(),
    });
    setActiveChatId(newChatRef.id);
  }

  const deleteChat = async (chatId: string) => {
    if (!firestore || !user) return;

    // First, delete all messages in the chat
    const messagesQuery = query(collection(firestore, `users/${user.uid}/chats/${chatId}/messages`));
    const batch = writeBatch(firestore);
    // In a real app, you might want to fetch docs in batches for very large collections
    const messagesSnapshot = await getDocs(messagesQuery);
    messagesSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Then, delete the chat document itself
    const chatDocRef = doc(firestore, `users/${user.uid}/chats`, chatId);
    await deleteDoc(chatDocRef);
    
    // If the deleted chat was the active one, switch to another chat or set to null
    if (activeChatId === chatId) {
        const remainingChats = chats.filter(c => c.id !== chatId);
        setActiveChatId(remainingChats.length > 0 ? remainingChats[0].id : null);
    }
  }


  const handleSend = async () => {
    if (!input.trim() || !user || !firestore) return;

    let currentChatId = activeChatId;

    // If there's no active chat, create one first
    if (!currentChatId) {
        const newChatRef = await addDoc(collection(firestore, `users/${user.uid}/chats`), {
            userId: user.uid,
            title: input.substring(0, 25), // Use first few words as title
            createdAt: serverTimestamp(),
        });
        currentChatId = newChatRef.id;
        setActiveChatId(currentChatId);
    }
    
    const userMessage: Omit<ChatMessage, 'id'> = {
      role: "user",
      content: input,
      timestamp: Timestamp.now(),
    };
    
    const currentInput = input;
    setInput("");
    setIsSending(true);

    try {
      const messagesRef = collection(firestore, `users/${user.uid}/chats/${currentChatId}/messages`);
      await addDoc(messagesRef, userMessage);
      
      const result = await aiChatbotAssistance({ query: currentInput });
      
      const assistantMessage: Omit<ChatMessage, 'id'> = {
        role: "assistant",
        content: result.response,
        timestamp: Timestamp.now(),
      };
      await addDoc(messagesRef, assistantMessage);

    } catch (error: any) {
      console.error("AI Error:", error);
      const errorMessage: Omit<ChatMessage, 'id'> = {
        role: "system",
        content: `Lo siento, he encontrado un problema: ${error.message || 'Error desconocido'}. Por favor, inténtalo de nuevo.`,
        timestamp: Timestamp.now(),
      };
       if (currentChatId) {
            const messagesRef = collection(firestore, `users/${user.uid}/chats/${currentChatId}/messages`);
            await addDoc(messagesRef, errorMessage);
       }
    } finally {
      setIsSending(false);
    }
  };
  
  const formatTimestamp = (timestamp: Timestamp | null) => {
    if (!timestamp) return "";
    return new Date(timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const placeholderText = "Pregúntame sobre cualquier tema...";

  return (
    <div className="flex h-[calc(100vh-4rem)]">
        <aside className={cn("flex flex-col border-r bg-muted/30 transition-all duration-300", isSidebarOpen ? "w-64" : "w-0 overflow-hidden")}>
            <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold tracking-tight">Historial</h2>
                <Button variant="ghost" size="icon" onClick={createNewChat}>
                    <MessageSquarePlus className="h-5 w-5" />
                </Button>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {isChatsLoading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">Cargando...</div>
                    ) : chats.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">No hay chats.</div>
                    ) : (
                        chats.map((chat) => (
                           <div key={chat.id} className="relative group">
                             <Button
                                variant={activeChatId === chat.id ? "secondary" : "ghost"}
                                className="w-full justify-start truncate"
                                onClick={() => setActiveChatId(chat.id)}
                            >
                                {chat.title}
                            </Button>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>¿Eliminar este chat?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta acción es permanente y no se puede deshacer.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => deleteChat(chat.id)} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                           </div>
                        ))
                    )}
                </div>
            </ScrollArea>
            <div className="p-4 border-t text-xs text-muted-foreground">
                <p>{format(new Date(), "d 'de' MMMM, yyyy", { locale: es })}</p>
            </div>
        </aside>

        <div className="flex flex-1 flex-col relative">
             <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 left-2 z-10"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             >
                {isSidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
            </Button>
             <header className="border-b p-4 text-center">
                <h1 className="text-xl font-bold font-headline tracking-tighter flex items-center justify-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary" /> ADRIMAX AI
                </h1>
                <p className="text-sm text-muted-foreground">Tu entusiasta compañero creativo y educativo.</p>
             </header>

            <ScrollArea className="flex-1" ref={scrollAreaRef}>
                <div className="space-y-6 p-4">
                {(isMessagesLoading || (!activeChatId && !isChatsLoading)) && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 mt-16">
                        <Sparkles className="h-12 w-12 mb-4" />
                        <p className="text-lg font-semibold">{isMessagesLoading ? "Cargando chat..." : "Comienza una conversación"}</p>
                        <p>{isMessagesLoading ? "Espera un momento." : placeholderText}</p>
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
                        <Avatar className="h-8 w-8 bg-primary text-primary-foreground flex items-center justify-center">
                            <Logo className="h-5 w-5" />
                        </Avatar>
                    )}
                    <div
                        className={cn(
                        "max-w-[80%] rounded-lg p-3",
                        message.role === "user" && "bg-primary text-primary-foreground",
                        message.role === "assistant" && "bg-muted",
                        message.role === 'system' && "bg-destructive text-destructive-foreground"
                        )}
                    >
                        {message.role === 'assistant' ? (
                            <MarkdownRenderer content={message.content} />
                        ) : (
                            <div className="whitespace-pre-wrap break-words">{message.content}</div>
                        )}
                        <p className="mt-1 pb-1 text-right text-xs opacity-60">{formatTimestamp(message.timestamp)}</p>
                    </div>
                    {message.role === "user" && user && (
                        <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    )}
                    </div>
                ))}
                {isSending && (
                    <div className="flex items-end gap-3 justify-start">
                    <Avatar className="h-8 w-8 bg-primary text-primary-foreground flex items-center justify-center">
                        <Logo className="h-5 w-5" />
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
                    className="pr-12"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                    }
                    }}
                    disabled={isMessagesLoading}
                />
                <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-1">
                    <Button size="icon" onClick={handleSend} disabled={isSending || !input.trim()}>
                    <Send className="h-5 w-5" />
                    </Button>
                </div>
                </div>
            </div>
        </div>
    </div>
  );
}
