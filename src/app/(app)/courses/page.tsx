"use client";

import { useState } from "react";
import {
  Notebook,
  Building,
  GraduationCap,
  PlusCircle,
  Edit,
  Trash2,
  Send,
  Loader2,
  Info as InfoIcon,
  MessageSquare,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/lib/hooks/use-app";
import {
  useFirestore,
  useCollection,
  useMemoFirebase,
} from "@/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  query
} from "firebase/firestore";
import type { Note, Announcement } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SCHOOL_NAME } from "@/lib/constants";
import { Logo } from "@/components/icons";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default function InfoPage() {
  return (
    <div className="flex flex-col min-h-full">
      <header className="p-4 sm:p-6 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <h1 className="text-2xl font-bold font-headline tracking-tighter sm:text-3xl flex items-center gap-2">
          <InfoIcon className="h-6 w-6" />
          Punto de Información
        </h1>
        <p className="text-muted-foreground">
          Anuncios, recursos y herramientas para tu día a día.
        </p>
      </header>

      <main className="flex-1">
        <Tabs defaultValue="announcements" className="w-full">
          <div className="p-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="announcements">
                <Building className="h-4 w-4 mr-2" /> Anuncios
              </TabsTrigger>
              <TabsTrigger value="my-classes">
                <GraduationCap className="h-4 w-4 mr-2" /> Mis Clases
              </TabsTrigger>
              <TabsTrigger value="notes">
                <Notebook className="h-4 w-4 mr-2" /> Anotaciones
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-4 sm:p-6 pt-0">
            <TabsContent value="announcements">
              <AnnouncementsTab />
            </TabsContent>
            <TabsContent value="my-classes">
              <MyClassesTab />
            </TabsContent>
            <TabsContent value="notes">
              <NotesTab />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}

function AnnouncementsTab() {
  const { user } = useApp();
  const firestore = useFirestore();

  const announcementsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "announcements"), orderBy("createdAt", "desc"));
  }, [firestore]);

  const { data: announcements = [], isLoading } = useCollection<Announcement>(announcementsCollection);

  const handleAddAnnouncement = async (text: string) => {
    if (!firestore || !user) return;
    const announcementsCollectionRef = collection(firestore, "announcements");
    await addDoc(announcementsCollectionRef, {
        text,
        authorId: user.uid,
        authorName: user.name,
        authorAvatar: user.avatar,
        createdAt: serverTimestamp()
    });
  }

  const handleUpdateAnnouncement = async (id: string, text: string) => {
    if (!firestore) return;
    const announcementDocRef = doc(firestore, "announcements", id);
    await updateDoc(announcementDocRef, { text });
  }

  const handleDeleteAnnouncement = async (id: string) => {
      if (!firestore) return;
      const announcementDocRef = doc(firestore, "announcements", id);
      await deleteDoc(announcementDocRef);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Últimos Anuncios</h2>
          {user?.center === SCHOOL_NAME && (
              <Badge variant="secondary" className="border-primary/50">Torre del Palau</Badge>
          )}
      </div>

      {user?.role === 'admin' && (
        <NewAnnouncementCard onSend={handleAddAnnouncement} />
      )}

      {isLoading && <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin text-primary" />}
      
      {!isLoading && announcements.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
          <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="font-semibold">No hay anuncios</p>
          <p className="text-sm text-muted-foreground">
            Aún no se ha publicado ningún anuncio.
          </p>
        </div>
      )}

      {announcements.map((announcement) => (
        <AnnouncementItem
            key={announcement.id}
            announcement={announcement}
            isAuthor={user?.uid === announcement.authorId}
            onUpdate={handleUpdateAnnouncement}
            onDelete={handleDeleteAnnouncement}
        />
      ))}
    </div>
  );
}

function NewAnnouncementCard({ onSend }: { onSend: (text: string) => Promise<void> }) {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useApp();

  const handleSend = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    try {
        await onSend(text);
        setText("");
    } catch (error) {
        console.error("Failed to send announcement", error);
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-base">Nuevo Anuncio</CardTitle>
            <CardDescription>Este mensaje será visible para todos los usuarios de la app.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
            <div className="flex gap-3">
                <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <Textarea 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Escribe tu anuncio aquí..."
                    className="flex-1"
                    rows={3}
                />
            </div>
            <div className="flex justify-end">
                <Button onClick={handleSend} disabled={isLoading || !text.trim()}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Publicar
                </Button>
            </div>
        </CardContent>
    </Card>
  )
}


function AnnouncementItem({ announcement, isAuthor, onUpdate, onDelete }: { announcement: Announcement, isAuthor: boolean, onUpdate: (id: string, text: string) => void, onDelete: (id: string) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(announcement.text);

  const formatTimestamp = (timestamp: { seconds: number }) => {
    if (!timestamp) return "";
    const date = new Date(timestamp.seconds * 1000);
    return formatDistanceToNow(date, { addSuffix: true, locale: es });
  };
  
  const handleUpdate = () => {
    onUpdate(announcement.id, editText);
    setIsEditing(false);
  }

  return (
    <div className="flex items-start gap-3">
      <Avatar className="h-9 w-9 border-2 border-primary/50">
        <AvatarImage src={announcement.authorAvatar} />
         <AvatarFallback>{announcement.authorName.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="w-full">
        <div className="flex items-baseline gap-2">
          <p className="font-bold text-sm">{announcement.authorName}</p>
          <p className="text-xs text-muted-foreground">{formatTimestamp(announcement.createdAt)}</p>
        </div>
        <div className="rounded-lg px-4 py-3 bg-muted mt-1">
            {isEditing ? (
                <div className="space-y-2">
                    <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={3} />
                    <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</Button>
                        <Button size="sm" onClick={handleUpdate}>Guardar</Button>
                    </div>
                </div>
            ) : (
                <p className="text-sm whitespace-pre-wrap">{announcement.text}</p>
            )}
        </div>
        {isAuthor && !isEditing && (
            <div className="flex gap-1 mt-1">
                <Button variant="ghost" size="xs" onClick={() => setIsEditing(true)}>Editar</Button>
                <Button variant="ghost" size="xs" className="text-destructive hover:text-destructive" onClick={() => onDelete(announcement.id)}>Eliminar</Button>
            </div>
        )}
      </div>
    </div>
  );
}

function MyClassesTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mis Clases</CardTitle>
        <CardDescription>
          Material de estudio, calificaciones y más. Esta sección está en construcción.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
          <Logo className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="font-semibold">Próximamente</p>
          <p className="text-sm text-muted-foreground">
            Aquí encontrarás todo lo relacionado con tus asignaturas.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function NotesTab() {
  const { user } = useApp();
  const firestore = useFirestore();

  const notesCollection = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, `users/${user.uid}/notes`);
  }, [firestore, user]);

  const { data: notes = [], isLoading } = useCollection<Note>(notesCollection);

  const handleAddNote = async (title: string, content: string) => {
    if (!notesCollection) return;
    await addDoc(notesCollection, { title, content, createdAt: serverTimestamp() });
  };
  
  const handleUpdateNote = async (id: string, title: string, content: string) => {
    if (!notesCollection) return;
    const noteDoc = doc(notesCollection, id);
    await updateDoc(noteDoc, { title, content });
  };

  const handleDeleteNote = async (id: string) => {
    if (!notesCollection) return;
    const noteDoc = doc(notesCollection, id);
    await deleteDoc(noteDoc);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Mis Anotaciones</h2>
        <NoteDialog onSave={handleAddNote} />
      </div>
      {isLoading && <p>Cargando notas...</p>}
      {!isLoading && notes.length === 0 && (
         <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
          <Notebook className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="font-semibold">No tienes anotaciones</p>
          <p className="text-sm text-muted-foreground">
            Crea tu primera nota para empezar a organizarte.
          </p>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {notes.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)).map((note) => (
          <Card key={note.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-base">{note.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{note.content}</p>
            </CardContent>
            <div className="p-4 pt-0 flex justify-end gap-2">
               <NoteDialog note={note} onSave={(title, content) => handleUpdateNote(note.id, title, content)} >
                  <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
               </NoteDialog>
               <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteNote(note.id)}>
                  <Trash2 className="h-4 w-4" />
               </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function NoteDialog({ children, note, onSave }: { children?: React.ReactNode, note?: Note, onSave: (title: string, content: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const isEditing = !!note;

  const handleSave = () => {
    if (title) {
        onSave(title, content);
        setIsOpen(false);
        if (!isEditing) {
            setTitle("");
            setContent("");
        }
    }
  }

  // Sync state if the note prop changes while dialog is open
  useState(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
            {children || <Button><PlusCircle className="mr-2 h-4 w-4" /> Nueva Nota</Button>}
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Anotación' : 'Nueva Anotación'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="note-title">Título</Label>
                    <Input id="note-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título de la nota" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="note-content">Contenido</Label>
                    <Textarea id="note-content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Escribe lo que necesites recordar..." rows={6} />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button onClick={handleSave}>Guardar</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}
