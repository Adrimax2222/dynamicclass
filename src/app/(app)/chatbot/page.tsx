"use client";

import { useState, useRef, useEffect } from "react";
import Link from 'next/link';
import {
  Loader2,
  Send,
  Sparkles,
  MessageSquarePlus,
  Trash2,
  History,
  AlertTriangle,
  Grid,
  BrainCircuit,
} from "lucide-react";

// UI Components (using alias paths)
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
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
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";

// Custom Components & Hooks (using alias paths)
import type { ChatMessage, Chat, ResponseLength } from "@/lib/types";
import { aiChatbotAssistance } from "@/ai/flows/ai-chatbot-assistance";
import { useApp } from "@/lib/hooks/use-app";
import { Logo } from "@/components/icons";
import { MarkdownRenderer } from "@/components/chatbot/markdown-renderer";
import { WipDialog } from "@/components/layout/wip-dialog";

// Firebase (using alias paths)
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
} from "firebase/firestore";

// Utils
import { format } from "date-fns";
import { es } from "date-fns/locale";

// --- INTERFACES ---
interface ChatHistorySheetProps {
    chats: Chat[];
    isChatsLoading: boolean;
    activeChatId: string | null;
    setActiveChatId: (id: string | null) => void;
    deleteChat: (id: string) => Promise<void>;
    createNewChat: () => Promise<void>;
}

// --- MAIN COMPONENT ---
export default function ChatbotPage() {
  const { user, activeChatId, setActiveChatId, chats, isChatsLoading } = useApp();
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [responseLength, setResponseLength] = useState<ResponseLength>('normal');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const firestore = useFirestore();

  // Query for messages of the active chat
  const messagesCollection = useMemoFirebase(() => {
    if (!firestore || !user || !activeChatId) return null;
    return query(
      collection(firestore, `users/${user.uid}/chats/${activeChatId}/messages`),
      orderBy("timestamp", "asc")
    );
  }, [firestore, user, activeChatId]);

  const { data: messages = [], isLoading: isMessagesLoading } = useCollection<ChatMessage>(messagesCollection);

  // Auto-scroll to the latest message
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
        title: `Nuevo Chat ${chats.length + 1}`,
        createdAt: serverTimestamp(),
    });
    setActiveChatId(newChatRef.id);
  }

  const deleteChat = async (chatId: string) => {
    if (!firestore || !user) return;
    const messagesQuery = query(collection(firestore, `users/${user.uid}/chats/${chatId}/messages`));
    const batch = writeBatch(firestore);
    const messagesSnapshot = await getDocs(messagesQuery);
    messagesSnapshot.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    await deleteDoc(doc(firestore, `users/${user.uid}/chats`, chatId));
    
    if (activeChatId === chatId) {
        const remainingChats = chats.filter(c => c.id !== chatId);
        setActiveChatId(remainingChats.length > 0 ? remainingChats[0].id : null);
    }
  }

  const handleSend = async () => {
    if (!input.trim() || !user || !firestore) return;
    setIsSending(true);
    let currentChatId = activeChatId;

    try {
      // Create a new chat if one doesn't exist
      if (!currentChatId) {
        const newChatRef = await addDoc(collection(firestore, `users/${user.uid}/chats`), {
          userId: user.uid,
          title: input.substring(0, 25), // Use first part of the message as title
          createdAt: serverTimestamp(),
        });
        currentChatId = newChatRef.id;
        setActiveChatId(currentChatId);
      }
      
      const messagesRef = collection(firestore, `users/${user.uid}/chats/${currentChatId}/messages`);
      
      // Save user message to Firestore
      const userMessage: Omit<ChatMessage, 'id'> = {
        role: "user",
        content: input,
        timestamp: Timestamp.now(),
      };
      await addDoc(messagesRef, userMessage);
      
      const currentInput = input;
      setInput(""); // Clear input immediately
      
      // Call the AI flow (Server Action)
      const result = await aiChatbotAssistance({ query: currentInput, responseLength });
      
      // Save assistant's response to Firestore
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
        content: `Lo siento, he encontrado un problema al procesar tu solicitud.`,
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
  
  const formatTimestamp = (timestamp: any): string => {
    if (!timestamp) return "";
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const showWelcomeScreen = !isChatsLoading && (!activeChatId || (activeChatId && messages.length === 0 && !isMessagesLoading));

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
        <header className="border-b p-4 flex items-center justify-between relative">
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
                 <h1 className="text-xl font-bold font-headline tracking-tighter">ADRIMAX AI</h1>
                <Badge variant="outline">Beta</Badge>
            </div>
            <AiModulesSheet />
        </header>

        <ScrollArea className="flex-1" ref={scrollAreaRef}>
            <div className="space-y-6 p-4">
            {showWelcomeScreen ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 mt-16">
                    <div className="relative mb-4">
                        <Logo className="h-20 w-20 text-primary" />
                        <Sparkles className="h-8 w-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
                    </div>
                    <p className="text-lg font-semibold text-foreground">Tu Asistente Educativo Personal</p>
                    <p className="mb-6">Pregúntame sobre cualquier tema...</p>
                    <Alert variant="destructive" className="max-w-sm text-xs">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>Beta: Las respuestas pueden variar en precisión.</AlertDescription>
                    </Alert>
                </div>
            ) : isMessagesLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 mt-16 text-muted-foreground">
                    <Loader2 className="h-12 w-12 mb-4 animate-spin" />
                    <p className="text-lg font-semibold">Cargando chat...</p>
                </div>
            ) : (
                messages.map((message) => (
                    <div key={message.id} className={cn("flex items-end gap-3", message.role === "user" ? "justify-end" : "justify-start")}>
                        {message.role !== "user" && (
                            <Avatar className="h-8 w-8 bg-primary text-primary-foreground flex items-center justify-center">
                                <Logo className="h-5 w-5" />
                            </Avatar>
                        )}
                        <div className={cn("max-w-[80%] rounded-lg p-3", 
                            message.role === "user" ? "bg-primary text-primary-foreground" : 
                            message.role === "assistant" ? "bg-muted" : "bg-destructive text-destructive-foreground")}>
                            {message.role === 'assistant' ? (
                                <MarkdownRenderer content={message.content} />
                            ) : (
                                <div className="whitespace-pre-wrap break-words">{message.content}</div>
                            )}
                            <p className="mt-1 text-right text-[10px] opacity-60">{formatTimestamp(message.timestamp)}</p>
                        </div>
                        {message.role === "user" && user && (
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
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
                    <div className="max-w-md rounded-lg p-3 bg-muted">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                </div>
            )}
            </div>
        </ScrollArea>

        <div className="mt-auto border-t bg-background p-4 space-y-2">
            <div className="relative">
                <Textarea
                    placeholder="Escribe tu duda aquí..."
                    className="pr-12 min-h-[80px]"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    disabled={isMessagesLoading || isSending}
                />
                <div className="absolute right-2 bottom-2">
                    <Button size="icon" onClick={handleSend} disabled={isSending || !input.trim()}>
                        {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                </div>
            </div>
            <Select onValueChange={(value: ResponseLength) => setResponseLength(value)} defaultValue={responseLength}>
                <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue placeholder="Longitud de respuesta" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="breve">Breve</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="detallada">Detallada</SelectItem>
                </SelectContent>
            </Select>
        </div>
    </div>
  );
}

// --- SUBCOMPONENTS ---

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
                        <MessageSquarePlus className="mr-2 h-4 w-4" /> Nuevo Chat
                    </Button>
                </div>
                <ScrollArea className="flex-1 px-4">
                    <div className="space-y-1">
                        {isChatsLoading ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">Cargando...</div>
                        ) : chats.length === 0 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">Sin chats previos.</div>
                        ) : (
                            chats.map((chat) => (
                               <div key={chat.id} className="relative group flex items-center gap-1">
                                 <SheetClose asChild>
                                    <Button
                                        variant={activeChatId === chat.id ? "secondary" : "ghost"}
                                        className="w-full justify-start truncate pr-8"
                                        onClick={() => setActiveChatId(chat.id)}
                                    >
                                        {chat.title}
                                    </Button>
                                 </SheetClose>
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 absolute right-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                                            <Trash2 className="h-4 w-4"/>
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Eliminar chat?</AlertDialogTitle>
                                            <AlertDialogDescription>Esta acción es permanente.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>No</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => deleteChat(chat.id)} className="bg-destructive hover:bg-destructive/90">Sí, eliminar</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                 </AlertDialog>
                               </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
                <div className="p-4 border-t text-[10px] text-muted-foreground text-center">
                    {format(new Date(), "d 'de' MMMM, yyyy", { locale: es })}
                </div>
            </SheetContent>
        </Sheet>
    );
}

function AiModulesSheet() {
    const { activeChatId } = useApp();

    const aiModules = [
        { id: 'flashcards', title: "Flashcards", icon: BrainCircuit, functional: true, href: `/chatbot/flashcards/${activeChatId}` },
        { id: 'quiz', title: "Quiz", icon: BrainCircuit, functional: false, href: '#' },
    ];

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Grid className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full max-w-sm flex flex-col p-0">
                <SheetHeader className="p-4 border-b">
                    <SheetTitle>Herramientas IA</SheetTitle>
                    <SheetDescription>Genera contenido a partir del chat actual.</SheetDescription>
                </SheetHeader>
                <ScrollArea className="flex-1 p-4">
                    <div className="grid grid-cols-2 gap-3">
                        {aiModules.map((module) => {
                            const Icon = module.icon;
                            const isClickable = module.functional && activeChatId;

                            const cardContent = (
                                <Card className={cn("hover:bg-accent transition-colors", !isClickable && "opacity-40 cursor-not-allowed")}>
                                    <CardHeader className="p-3">
                                        <Icon className={cn("h-5 w-5 mb-1", module.functional ? "text-primary" : "text-muted-foreground")} />
                                        <CardTitle className="text-xs">{module.title}</CardTitle>
                                    </CardHeader>
                                </Card>
                            );

                            if (isClickable) {
                                return (
                                    <SheetClose asChild key={module.id}>
                                        <Link href={module.href}>{cardContent}</Link>
                                    </SheetClose>
                                );
                            }
                            return <WipDialog key={module.id}>{cardContent}</WipDialog>;
                        })}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}
