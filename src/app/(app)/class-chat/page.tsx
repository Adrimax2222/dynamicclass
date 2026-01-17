
'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/hooks/use-app';
import { useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, Timestamp, doc, updateDoc, arrayUnion, deleteDoc } from 'firebase/firestore';
import type { ClassChatMessage, Center, User } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, Send, Loader2, Info, Smile, PlusCircle, CheckCheck, Pencil, MicOff, MoreHorizontal, Copy, Trash2, Pin, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AvatarDisplay } from '@/components/profile/avatar-creator';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { WipDialog } from '@/components/layout/wip-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

export default function ClassChatPage() {
    const { user } = useApp();
    const router = useRouter();
    const firestore = useFirestore();
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { toast } = useToast();

    const centerDocRef = useMemoFirebase(() => {
        if (!user || !user.organizationId) return null;
        return doc(firestore, 'centers', user.organizationId);
    }, [user, firestore]);
    const { data: centerData } = useDoc<Center>(centerDocRef);

    const { constructedClassName, classImageUrl, classDescription } = useMemo(() => {
        if (!user || !centerData) return { className: '', classImageUrl: '', classDescription: '' };
        const userClassName = `${user.course.replace('eso','ESO')}-${user.className}`;
        const classDef = centerData.classes.find(c => c.name === userClassName);
        return {
            constructedClassName: userClassName,
            classImageUrl: classDef?.imageUrl || '',
            classDescription: classDef?.description || 'Chat de Clase'
        };
    }, [user, centerData]);
    
    const chatPath = useMemo(() => {
        if (!user || !user.organizationId || user.center === 'personal' || !constructedClassName) return null;
        return `centers/${user.organizationId}/classes/${constructedClassName}/messages`;
    }, [user, constructedClassName]);

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

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto'; // Reset height
            const scrollHeight = textarea.scrollHeight;
            const maxHeight = 128; // max-h-32 (8rem)
            textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
        }
    }, [message]);

    const handleSend = async () => {
        if (!message.trim() || !user || !chatPath || !firestore) return;
        
        setIsSending(true);

        const newMessage: Omit<ClassChatMessage, 'id'> = {
            content: message,
            authorId: user.uid,
            authorName: user.name,
            authorAvatar: user.avatar,
            authorRole: user.role,
            timestamp: serverTimestamp() as Timestamp,
            viewedBy: [],
            isPinned: false
        };

        try {
            await addDoc(collection(firestore, chatPath), newMessage as any);
            setMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
            toast({ variant: "destructive", title: "Error", description: "No se pudo enviar el mensaje." });
        } finally {
            setIsSending(false);
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        if (!chatPath || !firestore) return;
        try {
            await deleteDoc(doc(firestore, chatPath, messageId));
            toast({ title: "Mensaje eliminado" });
        } catch (error) {
            console.error("Error deleting message:", error);
            toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el mensaje." });
        }
    }
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    
    const getFormattedClassName = () => {
        if (!constructedClassName) return '';
        const [course, classLetter] = constructedClassName.split('-');
        const courseMap: Record<string, string> = {
            "1ESO": "1º ESO", "2ESO": "2º ESO", "3ESO": "3º ESO", "4ESO": "4º ESO",
            "1BACH": "1º Bach.", "2BACH": "2º Bach.",
        };
        const formattedCourse = courseMap[course] || course.toUpperCase();
        return `${formattedCourse} - ${classLetter}`;
    };

    const isGlobalAdmin = user?.role === 'admin';
    const isCenterAdmin = user?.role === 'center-admin' && user?.organizationId === centerData?.uid;
    const isClassAdmin = user?.role.startsWith('admin-');
    const isClassAdminForThisClass = isClassAdmin && user.role.substring('admin-'.length) === constructedClassName;
    const canEdit = isGlobalAdmin || isCenterAdmin || isClassAdminForThisClass;

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
    
    return (
        <div className="flex flex-col h-screen bg-muted/20">
            <header className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
                <Button variant="ghost" size="icon" onClick={() => router.push('/courses')}>
                    <ChevronLeft />
                </Button>
                <div className="flex items-center gap-3 flex-1">
                    <AvatarDisplay user={{ avatar: classImageUrl, name: constructedClassName }} className="h-10 w-10 shrink-0" />
                    <div className="text-left">
                        <h1 className="font-bold text-lg">{getFormattedClassName()}</h1>
                        <p className="text-xs text-muted-foreground truncate">{classDescription}</p>
                    </div>
                </div>

                {canEdit && (
                    <Button asChild variant="ghost" size="icon">
                        <Link href={`/admin/groups/${user.organizationId}/${encodeURIComponent(constructedClassName)}/edit`}>
                            <Pencil className="h-5 w-5" />
                        </Link>
                    </Button>
                )}
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
                           <MessageItem
                                key={msg.id}
                                msg={msg}
                                user={user}
                                chatPath={chatPath || ''}
                                onDelete={handleDeleteMessage}
                           />
                        ))
                    )}
                </div>
            </div>
            
            <footer className="p-4 border-t bg-background">
                {user.isChatBanned ? (
                    <Alert variant="destructive" className="items-center">
                        <MicOff className="h-4 w-4" />
                        <AlertTitle>Has sido silenciado</AlertTitle>
                        <AlertDescription>
                            No puedes enviar mensajes en este chat.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <div className="flex items-end gap-2 bg-muted p-2 rounded-xl">
                        <WipDialog>
                            <Button variant="ghost" size="icon" className="shrink-0">
                                <PlusCircle className="h-5 w-5 text-muted-foreground" />
                            </Button>
                        </WipDialog>
                        <Textarea 
                            ref={textareaRef}
                            placeholder="Escribe un mensaje..."
                            className="min-h-0 flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-2 resize-none overflow-y-auto max-h-32"
                            rows={1}
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
                )}
            </footer>
        </div>
    );
}


interface MessageItemProps {
    msg: ClassChatMessage;
    user: User;
    chatPath: string;
    onDelete: (messageId: string) => void;
}

function MessageItem({ msg, user, chatPath, onDelete }: MessageItemProps) {
    const firestore = useFirestore();
    const msgRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const isCurrentUser = msg.authorId === user.uid;
    const { data: centerData } = useDoc<Center>(user.organizationId ? doc(firestore, 'centers', user.organizationId) : null);

    const canDelete = useMemo(() => {
        if (user.role === 'admin') return true;
        if (user.role === 'center-admin' && user.organizationId === centerData?.uid) return true;
        const className = user.role.startsWith('admin-') ? user.role.substring('admin-'.length) : null;
        if (className && user.course && user.className && `${user.course.toUpperCase()}-${user.className}` === className) return true;
        return isCurrentUser;
    }, [user, isCurrentUser, centerData]);


    useEffect(() => {
        const observerRef = msgRef.current;
        if (!observerRef || !firestore || !user || !msg.id || !chatPath) return;

        if (msg.viewedBy?.includes(user.uid)) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    const messageDocRef = doc(firestore, chatPath, msg.id);
                    updateDoc(messageDocRef, {
                        viewedBy: arrayUnion(user.uid)
                    }).catch(err => console.error("Failed to mark as seen:", err));
                    observer.disconnect();
                }
            },
            { threshold: 0.8 }
        );

        observer.observe(observerRef);

        return () => {
            if (observerRef) {
                observer.unobserve(observerRef);
            }
            observer.disconnect();
        };
    }, [msg.id, msg.viewedBy, firestore, user, chatPath]);

    const formatRole = (role: string) => {
        if (role === 'student') return 'Estudiante';
        if (role === 'admin') return 'Admin Global';
        if (role === 'center-admin') return 'Admin Centro';
        if (role.startsWith('admin-')) {
            const className = role.substring('admin-'.length);
            return `Admin ${className}`;
        }
        return 'Usuario';
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(msg.content);
        toast({ title: "Mensaje copiado" });
    }

    return (
        <div ref={msgRef} className={cn("flex items-end gap-2", isCurrentUser ? "justify-end" : "justify-start")}>
            {!isCurrentUser && (
                <AvatarDisplay user={{ name: msg.authorName, avatar: msg.authorAvatar }} className="h-8 w-8" />
            )}
            <div className={cn("max-w-[75%] p-3 rounded-xl shadow-sm group", isCurrentUser ? "bg-primary text-primary-foreground rounded-br-none" : "bg-card rounded-bl-none")}>
                <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                        <p className={cn("font-bold", isCurrentUser ? "text-primary-foreground" : "text-foreground")}>
                            {msg.authorName}
                        </p>
                        <p className={cn("text-xs opacity-70", isCurrentUser ? "text-primary-foreground" : "text-muted-foreground")}>
                            - {formatRole(msg.authorRole)}
                        </p>
                    </div>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className={cn("h-6 w-6 opacity-0 group-hover:opacity-100", isCurrentUser ? "text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/20" : "text-muted-foreground")}>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={handleCopy}><Copy className="mr-2 h-4 w-4"/>Copiar</DropdownMenuItem>
                            <WipDialog><DropdownMenuItem onSelect={(e) => e.preventDefault()}><Pencil className="mr-2 h-4 w-4"/>Editar</DropdownMenuItem></WipDialog>
                            <WipDialog><DropdownMenuItem onSelect={(e) => e.preventDefault()}><Pin className="mr-2 h-4 w-4"/>Fijar</DropdownMenuItem></WipDialog>
                            {canDelete && (
                                <>
                                    <DropdownMenuSeparator />
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={(e) => e.preventDefault()}>
                                                <Trash2 className="mr-2 h-4 w-4"/>Eliminar
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>¿Eliminar este mensaje?</AlertDialogTitle>
                                                <AlertDialogDescription>Esta acción no se puede deshacer y lo eliminará para todos.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => onDelete(msg.id)} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                <div className="flex items-center justify-end gap-3 text-xs opacity-70 mt-1.5">
                    <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{msg.viewedBy?.length || 0}</span>
                    </div>
                    <span>{msg.timestamp ? format(msg.timestamp.toDate(), 'HH:mm') : ''}</span>
                    {isCurrentUser && (
                        <CheckCheck className="h-4 w-4 text-sky-400" />
                    )}
                </div>
            </div>
            {isCurrentUser && (
                <AvatarDisplay user={user} className="h-8 w-8" />
            )}
        </div>
    );
}
