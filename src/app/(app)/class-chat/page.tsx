
      
'use client';

import * as React from 'react';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/hooks/use-app';
import { useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, Timestamp, doc, updateDoc, arrayUnion, deleteDoc, writeBatch } from 'firebase/firestore';
import type { ClassChatMessage, Center, User } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, Send, Loader2, Info, Smile, PlusCircle, CheckCheck, Pencil, MicOff, MoreHorizontal, Copy, Trash2, Pin, Eye, MessageSquareOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AvatarDisplay } from '@/components/profile/avatar-creator';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { WipDialog } from '@/components/layout/wip-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import LoadingScreen from '@/components/layout/loading-screen';

export default function ClassChatPage() {
    const { user } = useApp();
    const router = useRouter();
    const firestore = useFirestore();
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const messageRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { toast } = useToast();

    const centerDocRef = useMemoFirebase(() => {
        if (!user || !user.organizationId) return null;
        return doc(firestore, 'centers', user.organizationId);
    }, [user, firestore]);

    const { data: centerData, isLoading: isCenterLoading } = useDoc<Center>(centerDocRef);

    const { constructedClassName, classImageUrl, classDescription, isChatEnabled } = useMemo(() => {
        if (!user || !centerData) return { className: '', classImageUrl: '', classDescription: '', isChatEnabled: true };
        const userClassName = `${user.course.replace('eso','ESO')}-${user.className}`;
        const classDef = centerData.classes.find(c => c.name === userClassName);
        return {
            constructedClassName: userClassName,
            classImageUrl: classDef?.imageUrl || '',
            classDescription: classDef?.description || 'Chat de Clase',
            isChatEnabled: classDef?.isChatEnabled ?? true,
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

    const { data: messages = [], isLoading: areMessagesLoading } = useCollection<ClassChatMessage>(messagesQuery);
    const pinnedMessage = useMemo(() => messages.find(m => m.isPinned), [messages]);
    
    const isLoading = isCenterLoading || areMessagesLoading;

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
        if (!message.trim() || !user || !chatPath || !firestore) {
            return;
        }
        
        setIsSending(true);

        const newMessage: Omit<ClassChatMessage, 'uid' | 'editedAt'> = {
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
            console.table({
                userId: user.uid,
                chatPath: chatPath,
                messageData: newMessage,
            });
            await addDoc(collection(firestore, chatPath), newMessage as any);
            setMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
            toast({ variant: "destructive", title: "Error", description: "No se pudo enviar el mensaje." });
        } finally {
            setIsSending(false);
        }
    };

    const handleUpdateMessage = async (messageId: string, newContent: string) => {
        if (!chatPath || !firestore) return;
        const messageRef = doc(firestore, chatPath, messageId);
        try {
            await updateDoc(messageRef, {
                content: newContent,
                editedAt: serverTimestamp()
            });
            toast({ title: "Mensaje editado" });
        } catch (error) {
            console.error("Error updating message:", error);
            toast({ variant: "destructive", title: "Error", description: "No se pudo editar el mensaje." });
        }
    };
    
    const handlePinMessage = async (messageId: string, currentStatus: boolean) => {
        if (!chatPath || !firestore) return;
        const batch = writeBatch(firestore);
    
        // If a message is already pinned, unpin it first
        if (pinnedMessage && pinnedMessage.uid !== messageId) {
            const oldPinRef = doc(firestore, chatPath, pinnedMessage.uid);
            batch.update(oldPinRef, { isPinned: false });
        }
    
        // Pin/unpin the target message
        const newPinRef = doc(firestore, chatPath, messageId);
        batch.update(newPinRef, { isPinned: !currentStatus });
    
        try {
            await batch.commit();
            toast({ title: !currentStatus ? "Mensaje fijado" : "Mensaje desfijado" });
        } catch (error) {
            console.error("Error pinning message:", error);
            toast({ variant: "destructive", title: "Error", description: "No se pudo gestionar el mensaje fijado." });
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
            if (!isSending && user) {
                handleSend();
            }
        }
    };
    
    const scrollToMessage = (id: string) => {
        messageRefs.current.get(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    const canManage = isGlobalAdmin || isCenterAdmin || isClassAdminForThisClass;
    
    if (isLoading) {
        return <LoadingScreen />
    }

    if (!user || user.center === 'personal' || !isChatEnabled) {
        const message = !isChatEnabled 
            ? "Tu administrador ha desactivado el chat para esta clase."
            : "El chat de clase es una función exclusiva para usuarios que pertenecen a un centro educativo.";

        return (
            <div className="container mx-auto max-w-4xl p-4 sm:p-6 text-center h-screen flex flex-col items-center justify-center">
                 <Alert variant="destructive" className="items-center">
                    <MessageSquareOff className="h-5 w-5" />
                    <AlertTitle>Chat Desactivado</AlertTitle>
                    <AlertDescription>
                        {message}
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
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <AvatarDisplay user={{ avatar: classImageUrl, name: constructedClassName }} className="h-10 w-10 shrink-0" />
                    <div className="text-left truncate">
                        <h1 className="font-bold text-lg truncate">{getFormattedClassName()}</h1>
                        <p className="text-xs text-muted-foreground truncate">{classDescription}</p>
                    </div>
                </div>

                {canManage && (
                    <Button asChild variant="ghost" size="icon">
                        <Link href={`/admin/groups/${user.organizationId}/${encodeURIComponent(constructedClassName)}/edit`}>
                            <Pencil className="h-5 w-5" />
                        </Link>
                    </Button>
                )}
            </header>

            {pinnedMessage && (
                <div 
                    className="p-3 border-b bg-amber-500/10 text-amber-900 dark:text-amber-200 cursor-pointer hover:bg-amber-500/20 transition-colors flex items-start gap-3 sticky top-[73px] z-10"
                    onClick={() => scrollToMessage(pinnedMessage.uid)}
                >
                    <Pin className="h-5 w-5 shrink-0 mt-0.5"/>
                    <div className="flex-1 text-sm">
                        <p className="font-bold">Mensaje Fijado</p>
                        <p className="line-clamp-1">{pinnedMessage.content}</p>
                    </div>
                </div>
            )}
            
            <div className="flex-1 overflow-y-auto" ref={scrollAreaRef}>
                <div className="p-4 space-y-6">
                    {areMessagesLoading ? (
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
                                ref={el => messageRefs.current.set(msg.uid, el)}
                                key={msg.uid}
                                msg={msg}
                                user={user}
                                chatPath={chatPath || ''}
                                onDelete={handleDeleteMessage}
                                onUpdate={handleUpdateMessage}
                                onPin={handlePinMessage}
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
                            disabled={isSending || !user}
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
                            disabled={isSending || !message.trim() || !user}
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
    onUpdate: (messageId: string, newContent: string) => void;
    onPin: (messageId: string, currentStatus: boolean) => void;
}

const MessageItem = React.forwardRef<HTMLDivElement, MessageItemProps>(
  ({ msg, user, chatPath, onDelete, onUpdate, onPin }, ref) => {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(msg.content);

    const isCurrentUser = msg.authorId === user.uid;

    const centerDocRef = useMemoFirebase(() => {
        if (!firestore || !user.organizationId) return null;
        return doc(firestore, 'centers', user.organizationId);
    }, [firestore, user.organizationId]);
    const { data: centerData } = useDoc<Center>(centerDocRef);
    
    const canManage = useMemo(() => {
        if (user.role === 'admin') return true;
        if (user.role === 'center-admin' && user.organizationId === centerData?.uid) return true;
        const className = user.role.startsWith('admin-') ? user.role.substring('admin-'.length) : null;
        if (className) {
            const [course, classLetter] = className.split('-');
            if (user.course === course.toLowerCase() && user.className === classLetter) return true;
        }
        return false;
    }, [user, centerData]);
    
    const canDelete = isCurrentUser || canManage;
    const canEdit = isCurrentUser;
    const canPin = canManage;

    useEffect(() => {
        const observerRef = (ref as React.RefObject<HTMLDivElement>)?.current;
        if (!observerRef || !firestore || !user || !msg.uid || !chatPath) return;

        if (msg.viewedBy?.includes(user.uid)) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    const messageDocRef = doc(firestore, chatPath, msg.uid);
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
    }, [msg.uid, msg.viewedBy, firestore, user, chatPath, ref]);

    const formatRole = (role: string) => {
        if (!role) return 'Usuario';
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

    const handleSaveEdit = () => {
        if (editText.trim() && editText !== msg.content) {
            onUpdate(msg.uid, editText);
        }
        setIsEditing(false);
    };

    return (
        <div ref={ref} className={cn("flex items-end gap-2", isCurrentUser ? "justify-end" : "justify-start")}>
            {!isCurrentUser && (
                <AvatarDisplay user={{ name: msg.authorName, avatar: msg.authorAvatar }} className="h-8 w-8" />
            )}
            <div className={cn(
                "max-w-[75%] p-3 rounded-xl shadow-sm group",
                isCurrentUser ? "rounded-br-none" : "rounded-bl-none",
                msg.isPinned
                    ? "border-2 border-amber-500/50 bg-amber-500/5"
                    : isCurrentUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-card"
            )}>
                <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                        <p className="font-bold text-base">{msg.authorName}</p>
                        <p className={cn("text-xs opacity-70", isCurrentUser && !msg.isPinned ? "text-primary-foreground" : "text-muted-foreground")}>
                            - {formatRole(msg.authorRole)}
                        </p>
                    </div>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className={cn("h-6 w-6 opacity-0 group-hover:opacity-100", isCurrentUser && !msg.isPinned ? "text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/20" : "text-muted-foreground")}>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={handleCopy}><Copy className="mr-2 h-4 w-4"/>Copiar</DropdownMenuItem>
                            {canEdit && <DropdownMenuItem onSelect={() => setIsEditing(true)}><Pencil className="mr-2 h-4 w-4"/>Editar</DropdownMenuItem>}
                            {canPin && <DropdownMenuItem onSelect={() => onPin(msg.uid, !!msg.isPinned)}><Pin className="mr-2 h-4 w-4"/>{msg.isPinned ? "Desfijar" : "Fijar"}</DropdownMenuItem>}
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
                                                <AlertDialogAction onClick={() => onDelete(msg.uid)} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                {isEditing ? (
                    <div className="space-y-2 mt-2">
                        <Textarea 
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSaveEdit(); } }}
                            className="bg-background text-foreground"
                        />
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancelar</Button>
                            <Button size="sm" onClick={handleSaveEdit}>Guardar</Button>
                        </div>
                    </div>
                ) : (
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                )}
                <div className="flex items-center justify-end gap-3 text-xs opacity-70 mt-1.5">
                    {msg.editedAt && <span>(editado)</span>}
                    <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{msg.viewedBy?.length || 0}</span>
                    </div>
                    <span>{msg.timestamp ? formatDistanceToNow(msg.timestamp.toDate(), { locale: es, addSuffix: true }) : ''}</span>
                    {isCurrentUser && (
                        <CheckCheck className={cn("h-4 w-4", (msg.viewedBy?.length ?? 0) > 0 ? "text-sky-400" : "")} />
                    )}
                </div>
            </div>
            {isCurrentUser && (
                <AvatarDisplay user={user} className="h-8 w-8" />
            )}
        </div>
    );
});
MessageItem.displayName = "MessageItem";

    

    

    