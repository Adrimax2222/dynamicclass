
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
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";

// UI Components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

// Custom Components & Hooks
import type { ChatMessage, Chat } from "@/lib/types";
// import { aiChatbotAssistance } from "@/ai/flows/ai-chatbot-assistance"; - DEACTIVATED
import { useApp } from "@/lib/hooks/use-app";
import { Logo } from "@/components/icons";
import { MarkdownRenderer } from "@/components/chatbot/markdown-renderer";
import { WipDialog } from "@/components/layout/wip-dialog";

// Firebase
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
  onSnapshot,
} from "firebase/firestore";

// Utils
import { format } from "date-fns";
import { es } from "date-fns/locale";

// ============= INTERFACES =============

interface ChatHistorySheetProps {
  chats: Chat[];
  isChatsLoading: boolean;
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  deleteChat: (id: string) => Promise<void>;
  createNewChat: () => Promise<void>;
}

interface ErrorState {
  hasError: boolean;
  message: string;
  canRetry: boolean;
}

// ============= MAIN COMPONENT =============

export default function ChatbotPage() {
  const { user, activeChatId, setActiveChatId, chats, isChatsLoading } = useApp();
  
  // States
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<ErrorState>({ hasError: false, message: '', canRetry: false });
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  // Focus textarea on mount and when error is cleared
  useEffect(() => {
    if (!error.hasError && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [error.hasError]);

  // ============= HANDLERS =============

  const createNewChat = async () => {
    if (!firestore || !user) return;
    
    try {
      const newChatRef = await addDoc(collection(firestore, `users/${user.uid}/chats`), {
        userId: user.uid,
        title: `Nuevo Chat ${chats.length + 1}`,
        createdAt: serverTimestamp(),
      });
      setActiveChatId(newChatRef.id);
      setError({ hasError: false, message: '', canRetry: false });
    } catch (err) {
      console.error('Error creating new chat:', err);
      setError({
        hasError: true,
        message: 'No se pudo crear un nuevo chat. Verifica tu conexión.',
        canRetry: false,
      });
    }
  };

  const deleteChat = async (chatId: string) => {
    if (!firestore || !user) return;
    
    try {
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
    } catch (err) {
      console.error('Error deleting chat:', err);
      setError({
        hasError: true,
        message: 'No se pudo eliminar el chat. Intenta de nuevo.',
        canRetry: false,
      });
    }
  };

  const handleSend = async () => {
    const messageToSend = input.trim();
    if (!messageToSend || !user || !firestore || isSending) {
        if (!user) {
            setError({ hasError: true, message: 'Debes iniciar sesión para usar el chatbot.', canRetry: false });
        }
        return;
    }

    setIsSending(true);
    setError({ hasError: false, message: '', canRetry: false });

    let currentChatId = activeChatId;

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
        
        setInput("");
        
        const aiPromptsRef = collection(firestore, `users/${user.uid}/ai_prompts`);
        const newPromptDocRef = await addDoc(aiPromptsRef, {
            prompt: messageToSend,
            createdAt: serverTimestamp(),
        });

        const unsubscribe = onSnapshot(newPromptDocRef, async (snapshot) => {
            const data = snapshot.data();
            if (!data) return;

            if (data.response || data.error) {
                unsubscribe();
                
                if(data.response) {
                    const assistantMessage: Omit<ChatMessage, 'uid'> = {
                        role: "assistant",
                        content: data.response,
                        timestamp: Timestamp.now(),
                    };
                    await addDoc(messagesRef, assistantMessage);
                } else {
                     setError({ hasError: true, message: `Error de la IA: ${data.error}`, canRetry: false });
                }

                setIsSending(false);
            }
        });

    } catch (error: any) {
        console.error("❌ Error en handleSend:", error);
        let errorMessage = 'No se pudo enviar tu mensaje. Inténtalo de nuevo.';
        if (error.code === 'permission-denied') {
            errorMessage = 'Error de permisos. Es posible que tu sesión haya expirado. Por favor, recarga la página.';
        }
        setError({ hasError: true, message: errorMessage, canRetry: false });
        setIsSending(false);
    }
  };


  const formatTimestamp = (timestamp: any): string => {
    if (!timestamp) return "";
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const showWelcomeScreen = !isChatsLoading && (!activeChatId || (activeChatId && messages.length === 0 && !isMessagesLoading));
  const isInputDisabled = isMessagesLoading || isSending || !user;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <header className="border-b p-4 flex items-center justify-between relative bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <ChatHistorySheet
          chats={chats}
          isChatsLoading={isChatsLoading}
          activeChatId={activeChatId}
          setActiveChatId={setActiveChatId}
          deleteChat={deleteChat}
          createNewChat={createNewChat}
        />
        
        <div className="flex flex-1 items-center justify-center gap-2">
          <div className="relative">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse"></div>
          </div>
          <h1 className="text-xl font-bold font-headline tracking-tighter bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            ADRIMAX AI
          </h1>
          <Badge variant="outline" className="text-xs">Beta</Badge>
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
            </div>
          ) : isMessagesLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 mt-16 text-muted-foreground">
              <Loader2 className="h-12 w-12 mb-4 animate-spin" />
              <p className="text-lg font-semibold">Cargando chat...</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.uid}
                className={cn(
                  "flex items-end gap-3 message-enter",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role !== "user" && (
                  <Avatar className="h-8 w-8 bg-primary text-primary-foreground flex items-center justify-center ring-2 ring-primary/20">
                    <Logo className="h-5 w-5" />
                  </Avatar>
                )}
                
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg p-3 shadow-sm transition-all hover:shadow-md group relative",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : message.role === "assistant"
                      ? "bg-muted border border-border/50"
                      : "bg-destructive/10 text-destructive border border-destructive/20"
                  )}
                >
                  {message.role === 'assistant' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -top-2 -right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-background shadow-md hover:bg-accent"
                      onClick={() => copyToClipboard(message.content, message.uid)}
                    >
                      {copiedMessageId === message.uid ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  )}

                  {message.role === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <MarkdownRenderer content={message.content} />
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap break-words">{message.content}</div>
                  )}
                  <p className="mt-2 text-right text-[10px] opacity-60 flex items-center justify-end gap-1">
                    {message.role === "assistant" && (
                      <Sparkles className="h-3 w-3" />
                    )}
                    {formatTimestamp(message.timestamp)}
                  </p>
                </div>
                
                {message.role === "user" && user && (
                  <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {user.name?.charAt(0)}
                    </AvatarFallback>
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
              <div className="max-w-md rounded-lg p-3 bg-muted space-y-2">
                <div className="space-y-2">
                  <div className="h-4 bg-gradient-to-r from-muted-foreground/20 via-muted-foreground/40 to-muted-foreground/20 rounded animate-shimmer bg-[length:200%_100%]" style={{ width: '90%' }}></div>
                  <div className="h-4 bg-gradient-to-r from-muted-foreground/20 via-muted-foreground/40 to-muted-foreground/20 rounded animate-shimmer bg-[length:200%_100%]" style={{ width: '75%', animationDelay: '0.1s' }}></div>
                  <div className="h-4 bg-gradient-to-r from-muted-foreground/20 via-muted-foreground/40 to-muted-foreground/20 rounded animate-shimmer bg-[length:200%_100%]" style={{ width: '85%', animationDelay: '0.2s' }}></div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="animate-pulse">Pensando...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {error.hasError && (
        <div className="px-4 py-2">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error.message}</span>
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="mt-auto border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 space-y-2">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            placeholder={
              !user
                ? "Debes iniciar sesión..."
                : isInputDisabled
                ? "Esperando respuesta..."
                : "Escribe tu duda aquí... (Shift+Enter para nueva línea)"
            }
            className="pr-12 min-h-[80px] resize-none transition-all focus:ring-2 focus:ring-primary/20"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isInputDisabled}
            maxLength={4000}
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-2">
            {input.length > 3500 && (
              <Badge variant="secondary" className="text-xs">
                {input.length}/4000
              </Badge>
            )}
            <Button
              size="icon"
              onClick={() => handleSend()}
              disabled={isSending || !input.trim() || !user}
              className="transition-all hover:scale-105"
            >
              {isSending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatHistorySheet({
  chats,
  isChatsLoading,
  activeChatId,
  setActiveChatId,
  deleteChat,
  createNewChat,
}: ChatHistorySheetProps) {
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
              <div className="p-4 text-center text-sm text-muted-foreground">
                <Loader2 className="h-5 w-5 mx-auto mb-2 animate-spin" />
                Cargando...
              </div>
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 absolute right-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar chat?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción es permanente y no se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteChat(chat.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Sí, eliminar
                        </AlertDialogAction>
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
    {
      id: 'flashcards',
      title: "Flashcards",
      icon: BrainCircuit,
      functional: true,
      href: `/chatbot/flashcards/${activeChatId}`,
    },
    {
      id: 'quiz',
      title: "Quiz",
      icon: BrainCircuit,
      functional: false,
      href: '#',
    },
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
                <Card
                  className={cn(
                    "hover:bg-accent transition-colors cursor-pointer",
                    !isClickable && "opacity-40 cursor-not-allowed"
                  )}
                >
                  <CardHeader className="p-3">
                    <Icon
                      className={cn(
                        "h-5 w-5 mb-1",
                        module.functional ? "text-primary" : "text-muted-foreground"
                      )}
                    />
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
  );
}
