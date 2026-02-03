
"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/hooks/use-app';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, getDocs, doc, onSnapshot, addDoc, serverTimestamp, updateDoc, deleteDoc, writeBatch, Timestamp } from 'firebase/firestore';
import type { User, Note as GlobalNote, ClassChatMessage as GlobalChatMessage, Center } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from "date-fns/locale";
import Link from "next/link";
import {
  ChevronLeft,
  ShieldCheck,
  Package,
  Wrench,
  Users,
  MessageSquare,
  BookCopy,
  User as UserIcon,
  Search,
  Mail,
  Calendar,
  Clock,
  Loader2,
  PlusCircle,
  Edit,
  Trash2,
  Pin,
  Send,
  MoreHorizontal,
  Copy,
  Trophy,
  TreePine,
  Globe,
  FileText,
  Briefcase,
} from 'lucide-react';
import LoadingScreen from '@/components/layout/loading-screen';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { AvatarDisplay } from '@/components/profile/avatar-creator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const noteColors = ['#E2E8F0', '#FECACA', '#FDE68A', '#A7F3D0', '#BFDBFE', '#C7D2FE', '#E9D5FF'];

// Main Page Component
export default function DeveloperPortalPage() {
    const { user } = useApp();
    const router = useRouter();

    if (!user) {
        return <LoadingScreen />;
    }

    if (user.role !== 'admin') {
        router.replace('/home');
        return <LoadingScreen />;
    }

    return (
        <div className="container mx-auto max-w-4xl p-4 sm:p-6">
            <header className="mb-8 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push('/settings')}>
                    <ChevronLeft />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold font-headline tracking-tighter sm:text-3xl flex items-center gap-2">
                        <ShieldCheck className="text-purple-500"/>
                        Portal de Desarrollador
                    </h1>
                </div>
            </header>

            <Tabs defaultValue="dashboard" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="users">Usuarios</TabsTrigger>
                    <TabsTrigger value="notes">Notas</TabsTrigger>
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                </TabsList>
                <div className="py-6">
                    <TabsContent value="dashboard">
                        <DashboardTab />
                    </TabsContent>
                     <TabsContent value="users">
                        <UserExplorerTab />
                    </TabsContent>
                    <TabsContent value="notes">
                        <SharedNotesTab />
                    </TabsContent>
                    <TabsContent value="chat">
                        <GlobalChatTab />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}

// Dashboard Tab
function DashboardTab() {
    return (
        <div className="space-y-6">
            <GlobalAdminsPanel />
            <TeamPanel />
            <AppInfoPanel />
        </div>
    );
}

function GlobalAdminsPanel() {
    const firestore = useFirestore();
    const adminsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'), where('role', '==', 'admin'));
    }, [firestore]);
    const { data: admins, isLoading } = useCollection<User>(adminsQuery);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShieldCheck /> Administradores Globales</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? <Skeleton className="h-10 w-full" /> : (
                    <div className="space-y-2">
                        {admins.map(admin => (
                            <div key={admin.uid} className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={admin.avatar} alt={admin.name} />
                                    <AvatarFallback>{admin.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-sm">{admin.name}</p>
                                    <p className="text-xs text-muted-foreground">{admin.email}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function TeamPanel() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Briefcase /> Equipo de Desarrollo</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center space-y-4">
                <a href="https://proyectoadrimax.framer.website/" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-105">
                    <img
                        src="https://framerusercontent.com/images/wnf3W920QzNmsS575YQww1kIhLU.png"
                        alt="Logo de Proyecto Adrimax"
                        width={96}
                        height={96}
                        className="w-24 h-24 rounded-full mx-auto shadow-lg"
                    />
                </a>
                <div>
                    <h3 className="text-lg font-semibold">Adrià Navarro & Luc Rota</h3>
                    <a href="https://proyectoadrimax.framer.website/" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                        App impulsada por Proyecto Adrimax
                    </a>
                </div>
            </CardContent>
        </Card>
    )
}

function AppInfoPanel() {
    const appVersion = "V 3.5.2";
    const lastUpdate = "3 de febrero de 2026";
    const devTime = "5+ meses";
    const domain = "dynamicclass.app";

    const recentImprovements = [
        "Añadido filtro por rol al explorador de usuarios del portal de desarrollador.",
        "Mejorada la lógica de administradores de centro para mayor claridad.",
        "Refinado el sistema de recompensas del Modo Estudio (requisito de 5 min).",
        "Corregido error visual en mensajes anclados del chat de clase."
    ];

    const languages = ["TypeScript", "JavaScript", "Python", "HTML/CSS", "Firestore Rules"];
    const platforms = [
        "Firebase Studio", "Next.js", "React", "Genkit", "Google Cloud",
        "Google Gemini", "GitHub", "Vercel", "Visual Studio Code", "Android Studio", "Google AI Studio", "Google Colab"
    ];
    const tools = [
        "Google Workspace", "Trello", "Framer", "Jotform", "n8n", "Drive", "NotebookLM", "ChatGPT"
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Package />Información de la App</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 rounded-md bg-muted/50">
                        <p className="text-xs text-muted-foreground">Versión</p>
                        <p className="font-semibold">{appVersion}</p>
                    </div>
                    <div className="p-3 rounded-md bg-muted/50">
                        <p className="text-xs text-muted-foreground">Última Actualización</p>
                        <p className="font-semibold">{lastUpdate}</p>
                    </div>
                    <div className="p-3 rounded-md bg-muted/50">
                        <p className="text-xs text-muted-foreground">Tiempo de Desarrollo</p>
                        <p className="font-semibold">{devTime}</p>
                    </div>
                    <div className="p-3 rounded-md bg-muted/50">
                        <p className="text-xs text-muted-foreground">Dominio Oficial</p>
                        <a href="https://dynamicclass.app" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">{domain}</a>
                    </div>
                </div>

                <Separator />
                
                <div>
                    <h4 className="font-semibold text-sm mb-2">Mejoras Recientes</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {recentImprovements.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </div>
                
                <Separator />

                <div>
                    <h4 className="font-semibold text-sm mb-2">Stack Tecnológico</h4>
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1.5">Lenguajes de Programación</p>
                            <div className="flex flex-wrap gap-2">
                                {languages.map(lang => <Badge key={lang} variant="secondary">{lang}</Badge>)}
                            </div>
                        </div>
                         <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1.5">Plataformas y Frameworks</p>
                            <div className="flex flex-wrap gap-2">
                                {platforms.map(p => <Badge key={p} variant="secondary" className="bg-blue-500/10 text-blue-700">{p}</Badge>)}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1.5">Herramientas de Soporte y Gestión</p>
                            <div className="flex flex-wrap gap-2">
                                {tools.map(tool => <Badge key={tool} variant="outline">{tool}</Badge>)}
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />
                
                <div>
                    <h4 className="font-semibold text-sm mb-2">Soporte y Contacto</h4>
                    <div className="space-y-2 text-sm">
                        <a href="https://proyectoadrimax.framer.website/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary"><Globe className="h-4 w-4"/> Web Oficial</a>
                        <a href="https://form.jotform.com/230622014643040" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary"><FileText className="h-4 w-4"/> Formulario de Asistencia</a>
                        <p className="flex items-center gap-2"><Mail className="h-4 w-4"/> info.dynamicclass@gmail.com</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}


// User Explorer Tab
function UserExplorerTab() {
    const firestore = useFirestore();
    const usersQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'users'), orderBy('name')) : null, [firestore]);
    const { data: allUsers, isLoading } = useCollection<User>(usersQuery);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleUserSelect = (user: User) => {
        setSelectedUser(user);
        setIsDialogOpen(true);
    };

    const filteredUsers = useMemo(() => {
        if (!allUsers) return [];
        return allUsers.filter(u => {
            const searchMatch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                u.email.toLowerCase().includes(searchTerm.toLowerCase());
            
            if (!searchMatch) return false;

            if (roleFilter === 'all') return true;
            if (roleFilter === 'student') return u.role === 'student';
            if (roleFilter === 'class-admin') return u.role.startsWith('admin-') && u.role !== 'admin' && u.role !== 'center-admin';
            if (roleFilter === 'center-admin') return u.role === 'center-admin';
            if (roleFilter === 'admin') return u.role === 'admin';

            return true;
        });
    }, [allUsers, searchTerm, roleFilter]);
    
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users /> Explorador de Usuarios</CardTitle>
                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Buscar usuario por nombre o email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-full sm:w-[220px]">
                                <SelectValue placeholder="Filtrar por rol..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los roles</SelectItem>
                                <SelectItem value="student">Estudiantes</SelectItem>
                                <SelectItem value="class-admin">Admins de Clase</SelectItem>
                                <SelectItem value="center-admin">Admins de Centro</SelectItem>
                                <SelectItem value="admin">Admins Globales</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-2">
                    {isLoading ? <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div> : (
                        <ScrollArea className="h-[60vh]">
                            <div className="space-y-2 p-2">
                                {filteredUsers.map(u => (
                                    <button key={u.uid} onClick={() => handleUserSelect(u)} className="w-full flex items-center gap-3 p-3 rounded-lg border text-left hover:bg-muted/50 transition-colors">
                                        <AvatarDisplay user={u} className="h-10 w-10" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm truncate">{u.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                                        </div>
                                        <Badge variant={u.role === 'admin' ? 'destructive' : 'outline'} className="text-xs">{u.role}</Badge>
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    {selectedUser && (
                        <>
                            <DialogHeader className="items-center text-center">
                                <AvatarDisplay user={selectedUser} className="h-24 w-24 mb-2" />
                                <DialogTitle className="text-2xl">{selectedUser.name}</DialogTitle>
                                <DialogDescription>{selectedUser.email}</DialogDescription>
                                <Badge variant="secondary" className="w-fit">{selectedUser.role}</Badge>
                            </DialogHeader>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                                <InfoItem icon={Mail} label="Email" value={selectedUser.email} />
                                <InfoItem icon={Calendar} label="Rango de Edad" value={selectedUser.ageRange || "No especificado"} />
                                <InfoItem icon={Users} label="Centro" value={selectedUser.center || "No especificado"} />
                                <InfoItem icon={Users} label="Curso" value={selectedUser.course || "No especificado"} />
                                <InfoItem icon={Users} label="Clase" value={selectedUser.className || "No especificado"} />
                                <InfoItem icon={Clock} label="Minutos de Estudio" value={selectedUser.studyMinutes || 0} />
                                <InfoItem icon={Trophy} label="Trofeos" value={selectedUser.trophies || 0} />
                                <InfoItem icon={TreePine} label="Plantas" value={selectedUser.plantCount || 0} />
                                <InfoItem icon={Calendar} label="Miembro desde" value={selectedUser.createdAt ? format(selectedUser.createdAt.toDate(), "d MMM, yyyy", { locale: es }) : "Desconocido"} />
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number }) => (
    <div className="p-3 rounded-md bg-muted/50">
        <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Icon className="h-3 w-3"/>{label}</p>
        <p className="font-semibold truncate">{value}</p>
    </div>
);


// Shared Notes Tab
function SharedNotesTab() {
  const { user } = useApp();
  const firestore = useFirestore();
  const ref = useRef(null);

  const notesCollectionRef = useMemoFirebase(() => firestore ? collection(firestore, `globalNotes`) : null, [firestore]);
  const notesQuery = useMemoFirebase(() => notesCollectionRef ? query(notesCollectionRef, orderBy("createdAt", "desc")) : null, [notesCollectionRef]);

  const { data: notes = [], isLoading } = useCollection<GlobalNote>(notesQuery);

  const handleAddNote = async (title: string, content: string, color: string) => {
    if (!notesCollectionRef || !user) return;
    await addDoc(notesCollectionRef, { title, content, color, createdAt: serverTimestamp(), authorId: user.uid, authorName: user.name, updatedAt: serverTimestamp() });
  };
  
  const handleUpdateNote = async (id: string, title: string, content: string, color: string) => {
    if (!notesCollectionRef) return;
    const noteDocRef = doc(notesCollectionRef, id);
    await updateDoc(noteDocRef, { title, content, color, updatedAt: serverTimestamp() });
  };

  const handleDeleteNote = async (id: string) => {
    if (!notesCollectionRef) return;
    const noteDocRef = doc(notesCollectionRef, id);
    await deleteDoc(noteDocRef);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Notas</h2>
        <NoteDialog onSave={handleAddNote} />
      </div>
      {isLoading ? <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin" /> : notes.length === 0 ? (
         <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
          <p className="font-semibold">No hay notas compartidas.</p>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 gap-4 space-y-4">
          {notes.map((note) => (
            <Card key={note.uid} className="break-inside-avoid flex flex-col" style={{ borderTop: `6px solid ${note.color || 'hsl(var(--border))'}`}}>
              <CardHeader>
                <CardTitle className="text-base">{note.title}</CardTitle>
                <CardDescription>Por {note.authorName} - {note.createdAt ? formatDistanceToNow(note.createdAt.toDate(), { addSuffix: true, locale: es }) : ''}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{note.content}</p>
              </CardContent>
              <CardFooter className="pt-2 flex items-center justify-end">
                <NoteDialog note={note} onSave={handleUpdateNote}>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Edit className="h-4 w-4" /></Button>
                </NoteDialog>
                <Button variant="ghost" size="icon" className="text-destructive/60 hover:text-destructive h-8 w-8" onClick={() => handleDeleteNote(note.uid)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function NoteDialog({ children, note, onSave }: { children?: React.ReactNode, note?: GlobalNote, onSave: (idOrTitle: string, content: string, color: string, ...rest: any[]) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState("");
  const isEditing = !!note;

  useEffect(() => {
    if (isOpen) {
        setTitle(note?.title || "");
        setContent(note?.content || "");
        setColor(note?.color || noteColors[0]);
    }
  }, [isOpen, note]);

  const handleSave = () => {
    if (title) {
        if (isEditing && note) {
            (onSave as (id: string, title: string, content: string, color: string) => void)(note.uid, title, content, color);
        } else {
            (onSave as (title: string, content: string, color: string) => void)(title, content, color);
        }
        setIsOpen(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
            {children || <Button><PlusCircle className="mr-2 h-4 w-4" /> Nueva Nota</Button>}
        </DialogTrigger>
        <DialogContent style={{ borderTop: `4px solid ${color || 'hsl(var(--border))'}`}}>
            <DialogHeader>
                <DialogTitle>{isEditing ? 'Editar Nota' : 'Nueva Nota Global'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título de la nota" />
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Escribe algo..." rows={6} />
                <div className="flex flex-wrap gap-3">
                    {noteColors.map(c => (
                        <button key={c} type="button" onClick={() => setColor(c)} className={cn('h-8 w-8 rounded-full border-2 transition-transform hover:scale-110', color === c ? 'border-ring' : 'border-slate-300')} style={{backgroundColor: c}}/>
                    ))}
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                <Button onClick={handleSave}>Guardar</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}


// Global Chat Tab
function GlobalChatTab() {
    const { user } = useApp();
    const firestore = useFirestore();
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    const chatPath = 'globalChat';

    const messagesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, chatPath), orderBy('timestamp', 'asc'));
    }, [firestore]);

    const { data: messages = [], isLoading: areMessagesLoading } = useCollection<GlobalChatMessage>(messagesQuery);

    useEffect(() => {
      const scrollContainer = scrollAreaRef.current;
      if (scrollContainer) {
        setTimeout(() => { scrollContainer.scrollTop = scrollContainer.scrollHeight; }, 100);
      }
    }, [messages]);

    const handleSend = async () => {
        if (!message.trim() || !user || !firestore) return;
        setIsSending(true);

        const newMessage = {
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
            toast({ variant: "destructive", title: "Error", description: "No se pudo enviar el mensaje." });
        } finally {
            setIsSending(false);
        }
    };
    
    return (
        <Card className="h-[70vh] flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><MessageSquare /> Chat</CardTitle>
                <CardDescription>Un canal de comunicación privado para el equipo de desarrollo.</CardDescription>
            </CardHeader>
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollAreaRef}>
                {areMessagesLoading ? <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin" /> : messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-16">
                        <p className="font-semibold">Inicia la conversación.</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                       <ChatMessageItem key={msg.uid} msg={msg} currentUser={user!} />
                    ))
                )}
            </div>
            <CardFooter className="p-4 border-t">
                <div className="flex items-end gap-2 w-full">
                    <Textarea 
                        placeholder="Escribe un mensaje..."
                        className="flex-1 bg-muted/50 border-0 focus-visible:ring-1"
                        rows={1}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
                        disabled={isSending || !user}
                    />
                    <Button size="icon" onClick={handleSend} disabled={isSending || !message.trim() || !user}>
                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}

function ChatMessageItem({ msg, currentUser }: { msg: GlobalChatMessage, currentUser: User }) {
    const isSelf = msg.authorId === currentUser.uid;
    return (
        <div className={cn("flex items-end gap-2", isSelf ? "justify-end" : "justify-start")}>
            {!isSelf && <AvatarDisplay user={{ name: msg.authorName, avatar: msg.authorAvatar }} className="h-8 w-8" />}
            <div className={cn("max-w-[75%] p-3 rounded-xl shadow-sm", isSelf ? "bg-primary text-primary-foreground rounded-br-none" : "bg-card rounded-bl-none")}>
                {!isSelf && <p className="font-bold text-xs pb-1">{msg.authorName}</p>}
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                <p className="text-right text-xs opacity-70 mt-1">{msg.timestamp ? format(msg.timestamp.toDate(), 'HH:mm') : ''}</p>
            </div>
            {isSelf && <AvatarDisplay user={currentUser} className="h-8 w-8" />}
        </div>
    );
}
