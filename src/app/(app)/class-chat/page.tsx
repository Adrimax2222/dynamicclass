'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/hooks/use-app';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { ClassChatMessage } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Send, Loader2, Info, Smile, PlusCircle, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AvatarDisplay } from '@/components/profile/avatar-creator';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { WipDialog } from '@/components/layout/wip-dialog';

export default function ClassChatPage() {
    const { user } = useApp();
    const router = useRouter();
    const firestore = useFirestore();
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const chatPath = useMemo(() => {
        if (!user || !user.organizationId || user.center === 'personal' || !user.course || !user.className) return null;
        const className = `${user.course.replace('eso','ESO')}-${user.className}`;
        return `centers/${user.organizationId}/classes/${className}/messages`;
    }, [user]);

    const messagesQuery = useMemoFirebase(() => {
        if (!chatPath || !firestore) return null;
        return query(collection(firestore, chatPath), orderBy('timestamp', 'asc'));
    }, [chatPath, firestore]);

    const { data: messages = [], isLoading } = useCollection<ClassChatMessage>(messagesQuery);
    
    useEffect(() => {
      const scrollContainer = scrollAreaRef.current;
      if (scrollContainer) {
        setTimeout(() => {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }, 100);
      }
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!message.trim() || !user || !chatPath || !firestore) return;
        
        setIsSending(true);

        const newMessage: Omit<ClassChatMessage, 'id'> = {
            content: message,
            authorId: user.uid,
            authorName: user.name,
            authorAvatar: user.avatar,
            timestamp: serverTimestamp() as Timestamp,
        };

        try {
            await addDoc(collection(firestore, chatPath), newMessage);
            setMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
            // Optionally, show a toast notification
        } finally {
            setIsSending(false);
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    };

    if (!user || user.center === 'personal') {
        return (
            <div className="container mx-auto max-w-4xl p-4 sm:p-6 text-center">
                 <Alert variant="destructive">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Acceso Denegado</AlertTitle>
                    <AlertDescription>
                        El chat de clase es una función exclusiva para usuarios que pertenecen a un centro educativo.
                    </AlertDescription>
                </Alert>
                <Button onClick={() => router.back()} className="mt-4">
                    <ChevronLeft className="mr-2 h-4 w-4"/>
                    Volver
                </Button>
            </div>
        );
    }
    
    const getFormattedClassName = () => {
        if (!user || !user.course || !user.className) return '';
        const courseMap: Record<string, string> = {
            "1eso": "1º ESO", "2eso": "2º ESO", "3eso": "3º ESO", "4eso": "4º ESO",
            "1bach": "1º Bach.", "2bach": "2º Bach.",
        };
        const formattedCourse = courseMap[user.course] || user.course.toUpperCase();
        return `${formattedCourse} - ${user.className}`;
    };

    return (
        <div className="flex flex-col h-screen bg-muted/20">
            <header className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
                <Button variant="ghost" size="icon" onClick={() => router.push('/courses')}>
                    <ChevronLeft />
                </Button>
                <div className="text-center">
                    <h1 className="font-bold text-lg">{getFormattedClassName()}</h1>
                    <p className="text-xs text-muted-foreground">Chat de Clase</p>
                </div>
                <div className="w-9 h-9" /> {/* Placeholder for alignment */}
            </header>
            
            <div className="flex-1 overflow-y-auto" ref={scrollAreaRef}>
                <div className="p-4 space-y-6">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center text-muted-foreground py-16">
                            <p className="font-semibold">¡Sé el primero en hablar!</p>
                            <p className="text-sm">Aún no hay mensajes en este chat.</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id} className={cn("flex items-end gap-2", msg.authorId === user.uid ? "justify-end" : "justify-start")}>
                                {msg.authorId !== user.uid && (
                                    <AvatarDisplay user={{ name: msg.authorName, avatar: msg.authorAvatar }} className="h-8 w-8" />
                                )}
                                <div className={cn("max-w-[75%] p-3 rounded-xl shadow-sm", msg.authorId === user.uid ? "bg-primary text-primary-foreground rounded-br-none" : "bg-card rounded-bl-none")}>
                                     {msg.authorId !== user.uid && (
                                        <p className="text-xs font-bold mb-1 text-primary">{msg.authorName.split(' ')[0]}</p>
                                     )}
                                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                     <div className="flex items-center justify-end gap-1.5 text-xs opacity-70 mt-1.5">
                                        <span>
                                            {msg.timestamp ? format(msg.timestamp.toDate(), 'HH:mm') : ''}
                                        </span>
                                        {msg.authorId === user.uid && (
                                            <CheckCheck className="h-4 w-4 text-green-400" />
                                        )}
                                    </div>
                                </div>
                                {msg.authorId === user.uid && (
                                    <AvatarDisplay user={user} className="h-8 w-8" />
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
            
            <footer className="p-4 border-t bg-background">
                <div className="flex items-center gap-2 bg-muted p-2 rounded-xl">
                    <WipDialog>
                        <Button variant="ghost" size="icon" className="shrink-0">
                            <PlusCircle className="h-5 w-5 text-muted-foreground" />
                        </Button>
                    </WipDialog>
                    <Input 
                        placeholder="Escribe un mensaje..."
                        className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-10 px-2"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isSending}
                    />
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="shrink-0">
                                <Smile className="h-5 w-5 text-muted-foreground" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2 border-0 shadow-lg mb-2">
                            <div className="grid grid-cols-8 gap-1">
                                {'😀 😂 ❤️ 👍 🙏 🎉 😭 🤔 🤯 😊 🥺 🔥 ❄️'.split(' ').map(emoji => (
                                    <button
                                    key={emoji}
                                    onClick={() => setMessage(prev => prev + emoji)}
                                    className="text-2xl rounded-md p-1 hover:bg-accent transition-colors"
                                    >
                                    {emoji}
                                    </button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                    <Button 
                        size="icon" 
                        className="shrink-0"
                        onClick={handleSend}
                        disabled={isSending || !message.trim()}
                    >
                        {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </div>
            </footer>
        </div>
    );
}