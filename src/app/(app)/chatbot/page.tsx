
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
  History,
  AlertTriangle,
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
  getDocs,
  updateDoc,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";


export default function ChatbotPage() {
  const { user, activeChatId, setActiveChatId, chats, isChatsLoading } = useApp();
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const firestore = useFirestore();

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
  }, [messages, isSending]);

  const createNewChat = async () => {
    if (!firestore || !user) return;
    
    const newChatRef = await addDoc(collection(firestore, `users/${user.uid}/chats`), {
        userId: user.uid,
        title: `Chat ${chats.length + 1}`,
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
            title: `Chat ${chats.length + 1}`, // Use numeric title
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
    <div className="flex h-[calc(100vh-4rem)] flex-col">
        <header className="border-b p-4 text-center flex items-center justify-between relative">
            <ChatHistorySheet 
                chats={chats} 
                isChatsLoading={isChatsLoading} 
                activeChatId={activeChatId} 
                setActiveChatId={setActiveChatId} 
                deleteChat={deleteChat}
                createNewChat={createNewChat}
            />
            <div className="flex flex-1 items-center justify-center gap-2">
                 <Sparkles className="h-6 w-6 text-primary" />
                 <h1 className="text-xl font-bold font-headline tracking-tighter">
                    ADRIMAX AI
                 </h1>
                <Badge variant="outline">Beta</Badge>
            </div>
            <div className="w-10"></div>
        </header>

        <ScrollArea className="flex-1 bg-chat-pattern" ref={scrollAreaRef}>
            <div className="space-y-6 p-4">
            {!activeChatId && !isChatsLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 mt-16">
                    <div className="relative mb-4">
                        <Logo className="h-20 w-20 text-primary" />
                        <Sparkles className="h-8 w-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse-slow" />
                    </div>
                    <p className="text-lg font-semibold text-foreground">Tu Asistente Educativo Personal</p>
                    <p className="mb-6">{placeholderText}</p>
                    <Alert variant="destructive" className="max-w-sm text-xs">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            Esta es una función beta. Las respuestas pueden no ser siempre precisas.
                        </AlertDescription>
                    </Alert>
                </div>
            ) : isMessagesLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 mt-16">
                    <Loader2 className="h-12 w-12 mb-4 animate-spin" />
                    <p className="text-lg font-semibold">Cargando chat...</p>
                    <p>Espera un momento.</p>
                </div>
            ) : (
                messages.map((message) => (
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
                ))
            )}
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
  );
}

interface ChatHistorySheetProps {
    chats: Chat[];
    isChatsLoading: boolean;
    activeChatId: string | null;
    setActiveChatId: (id: string | null) => void;
    deleteChat: (id: string) => void;
    createNewChat: () => void;
}

function ChatHistorySheet({ chats, isChatsLoading, activeChatId, setActiveChatId, deleteChat, createNewChat }: ChatHistorySheetProps) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2">
                    <History className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-sm flex flex-col p-0">
                <SheetHeader className="p-4 border-b">
                    <SheetTitle>Historial de Chats</SheetTitle>
                </SheetHeader>
                <div className="p-4 flex-none">
                    <Button onClick={createNewChat} className="w-full">
                        <MessageSquarePlus className="mr-2 h-4 w-4" />
                        Nuevo Chat
                    </Button>
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-4 pt-0 space-y-1">
                        {isChatsLoading ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">Cargando...</div>
                        ) : chats.length === 0 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">No hay chats.</div>
                        ) : (
                            chats.map((chat) => (
                               <div key={chat.id} className="relative group flex items-center">
                                 <Button
                                    variant={activeChatId === chat.id ? "secondary" : "ghost"}
                                    className="w-full justify-start truncate"
                                    onClick={() => setActiveChatId(chat.id)}
                                >
                                    {chat.title}
                                </Button>
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
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
            </SheetContent>
        </Sheet>
    );
}
