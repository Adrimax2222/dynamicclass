
"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Loader2,
  Send,
  MessageSquarePlus,
  Trash2,
  AlertTriangle,
} from "lucide-react";
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
  onSnapshot,
} from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { useApp } from "@/lib/hooks/use-app";
import type { ChatMessage, Chat } from "@/lib/types";
// import { aiChatbotAssistance } from "@/ai/flows/ai-chatbot-assistance"; - DEACTIVATED
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "@/lib/utils";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { Logo } from "../icons";
import { MarkdownRenderer } from "./markdown-renderer";
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
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";

export default function ChatDrawer() {
  const {
    user,
    isChatDrawerOpen,
    setChatDrawerOpen,
    chats,
    activeChatId,
    setActiveChatId,
    isChatsLoading,
  } = useApp();

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const firestore = useFirestore();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Memoize the query for messages of the active chat
  const messagesCollection = useMemoFirebase(() => {
    if (!firestore || !user || !activeChatId) return null;
    return query(
      collection(
        firestore,
        `users/${user.uid}/chats/${activeChatId}/messages`
      ),
      orderBy("timestamp", "asc")
    );
  }, [firestore, user, activeChatId]);

  const { data: messages = [], isLoading: isMessagesLoading } =
    useCollection<ChatMessage>(messagesCollection);

  // Auto-scroll to bottom
  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages, isSending]);

  const handleSend = async () => {
    if (!input.trim() || !user || !firestore || isSending) return;

    setIsSending(true);
    let currentChatId = activeChatId;
    const messageToSend = input;
    setInput("");

    try {
        if (!currentChatId) {
            const newChatRef = await addDoc(collection(firestore, `users/${user.uid}/chats`), {
                userId: user.uid,
                title: messageToSend.substring(0, 30) + (messageToSend.length > 30 ? '...' : ''),
                createdAt: serverTimestamp(),
            });
            currentChatId = newChatRef.id;
            setActiveChatId(currentChatId);
        }

        const messagesRef = collection(firestore, `users/${user.uid}/chats/${currentChatId}/messages`);

        const userMessage: Omit<ChatMessage, 'uid'> = {
            role: "user",
            content: messageToSend,
            timestamp: Timestamp.now(),
        };
        await addDoc(messagesRef, userMessage);

        const aiPromptsRef = collection(firestore, `users/${user.uid}/ai_prompts`);
        const newPromptDocRef = await addDoc(aiPromptsRef, {
            prompt: messageToSend,
            createdAt: serverTimestamp(),
        });

        const unsubscribe = onSnapshot(newPromptDocRef, async (snapshot) => {
            const data = snapshot.data();
            console.log('AI prompt document snapshot:', data); // User requested log

            if (!data) return;

            // Case 1: The extension reports an error in its status object.
            if (data.status && data.status.state === 'ERROR') {
              console.error('Firebase AI Extension Error:', data.status.error);
              const errorMessage = `⚠️ Error de la IA: ${data.status.error || 'Ocurrió un error desconocido.'}`;
              const systemErrorMessage: Omit<ChatMessage, 'uid'> = {
                  role: "system",
                  content: errorMessage,
                  timestamp: Timestamp.now(),
              };
              await addDoc(messagesRef, systemErrorMessage);
              unsubscribe();
              setIsSending(false);
              return;
            }

            // Case 2: The extension has finished, either with a response or an error string.
            // Check for property existence to handle empty strings as valid responses.
            if ('response' in data || 'error' in data) {
                unsubscribe();
                
                const messageContent = 'response' in data 
                    ? data.response 
                    : `⚠️ Error de la IA: ${data.error}`;
                
                const messageRole = 'response' in data ? 'assistant' : 'system';

                const responseMessage: Omit<ChatMessage, 'uid'> = {
                    role: messageRole,
                    content: messageContent,
                    timestamp: Timestamp.now(),
                };
                await addDoc(messagesRef, responseMessage);
                
                setIsSending(false);
            }
        });

    } catch (error: any) {
        console.error("Error sending message:", error);
        let errorMessage = "No se pudo enviar tu mensaje. Inténtalo de nuevo.";
        if (error.code === 'permission-denied') {
            errorMessage = 'Error de permisos. Tu sesión podría haber expirado.';
        }

        if (currentChatId) {
            const messagesRef = collection(firestore, `users/${user.uid}/chats/${currentChatId}/messages`);
            const systemErrorMessage: Omit<ChatMessage, 'uid'> = {
                role: "system",
                content: `Lo siento, he encontrado un problema: ${errorMessage}.`,
                timestamp: Timestamp.now(),
            };
            await addDoc(messagesRef, systemErrorMessage);
        }
        setIsSending(false);
    }
  };
  
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

    const messagesQuery = query(collection(firestore, `users/${user.uid}/chats/${chatId}/messages`));
    const batch = writeBatch(firestore);
    const messagesSnapshot = await getDocs(messagesQuery);
    messagesSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    const chatDocRef = doc(firestore, `users/${user.uid}/chats`, chatId);
    await deleteDoc(chatDocRef);
    
    if (activeChatId === chatId) {
        const remainingChats = chats.filter(c => c.id !== chatId);
        setActiveChatId(remainingChats.length > 0 ? remainingChats[0].id : null);
    }
  }

  const formatTimestamp = (timestamp: Timestamp | null) => {
    if (!timestamp) return "";
    return new Date(timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const placeholderText = "Pregúntame cualquier cosa...";

  return (
    <Sheet open={isChatDrawerOpen} onOpenChange={setChatDrawerOpen}>
      <SheetContent className="flex flex-col p-0 sm:max-w-lg">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2 font-headline">
            <Sparkles className="h-6 w-6 text-primary" />
            ADRIMAX AI
            <Badge variant="outline">Beta</Badge>
          </SheetTitle>
          <SheetDescription>
            Tu asistente educativo personal.
          </SheetDescription>
        </SheetHeader>
        
        <div className="p-2 border-b">
            <h3 className="text-sm font-semibold px-2 mb-1 text-muted-foreground">Historial</h3>
            <ScrollArea className="h-24">
                <div className="px-2 space-y-1">
                     {isChatsLoading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">Cargando...</div>
                    ) : chats.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">No hay chats.</div>
                    ) : (
                        chats.map((chat) => (
                           <div key={chat.id} className="relative group flex items-center">
                             <Button
                                variant={activeChatId === chat.id ? "secondary" : "ghost"}
                                className="w-full justify-start truncate h-8"
                                onClick={() => setActiveChatId(chat.id)}
                            >
                                {chat.title}
                            </Button>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>¿Eliminar este chat?</AlertDialogTitle>
                                        <AlertDialogDescription>Esta acción es permanente.</AlertDialogDescription>
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
        </div>


        <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
          <div className="space-y-4 py-4">
             {!activeChatId && !isChatsLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                     <div className="relative mb-4">
                        <Logo className="h-16 w-16 text-primary" />
                        <Sparkles className="h-6 w-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse-slow" />
                    </div>
                    <p className="font-semibold text-foreground">Tu Asistente Educativo</p>
                    <p className="mb-4 text-sm">{placeholderText}</p>
                    <Alert variant="destructive" className="max-w-sm text-xs">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            Esta es una función beta y puede tener errores.
                        </AlertDescription>
                    </Alert>
                </div>
            ) : isMessagesLoading ? (
                 <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                    <Loader2 className="h-10 w-10 mb-4 animate-spin" />
                    <p className="font-semibold">Cargando...</p>
                </div>
            ) : (
                messages.map((message) => (
                <div
                    key={message.uid}
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
        <SheetFooter className="p-4 border-t">
          <div className="space-y-2">
            <div className="relative w-full">
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
              <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center">
                <Button size="icon" onClick={handleSend} disabled={isSending || !input.trim()} aria-label="Enviar mensaje">
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={createNewChat}>
                <MessageSquarePlus className="mr-2 h-4 w-4" />
                Nuevo Chat
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

    
