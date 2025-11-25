"use client";

import { useState } from "react";
import {
  Notebook,
  Building,
  GraduationCap,
  PlusCircle,
  Edit,
  Trash2,
  ListFilter,
  Info as InfoIcon,
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
import { Avatar, AvatarImage } from "@/components/ui/avatar";
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
} from "firebase/firestore";
import type { Note } from "@/lib/types";
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
  const [filter, setFilter] = useState("all");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Últimos Anuncios</h2>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <ListFilter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo</SelectItem>
            <SelectItem value="institute">Instituto</SelectItem>
            <SelectItem value="class">Clase</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Announcement
        user="@Adrià Navarro"
        text="Recordatorio: El próximo viernes hay huelga general de estudiantes. No habrá clases."
        avatarSeed="avatar1"
        timestamp="Hace 2 horas"
      />
      <Announcement
        user="@Luc Rota"
        text="Se necesita la autorización para la salida al museo de ciencias antes del día 25. Podéis descargar el documento desde la web del centro."
        avatarSeed="avatar2"
        timestamp="Hace 1 día"
      />
      <Announcement
        user="@Adrià Navarro"
        text="Debido a una indisposición del profesor de matemáticas, la clase de mañana se cancela. Se recuperará la próxima semana."
        avatarSeed="avatar1"
        timestamp="Hace 3 días"
      />
      <Announcement
        user="@Luc Rota"
        text="Las notas de la segunda evaluación estarán disponibles en la plataforma a partir del viernes a las 15:00h."
        avatarSeed="avatar2"
        timestamp="Hace 4 días"
      />
    </div>
  );
}

function Announcement({
  user,
  text,
  avatarSeed,
  timestamp,
}: {
  user: string;
  text: string;
  avatarSeed: string;
  timestamp: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Avatar className="h-9 w-9 border-2 border-primary/50">
        <AvatarImage src={`https://picsum.photos/seed/${avatarSeed}/100`} />
      </Avatar>
      <div className="w-full">
        <div className="flex items-baseline gap-2">
          <p className="font-bold text-sm">{user}</p>
          <p className="text-xs text-muted-foreground">{timestamp}</p>
        </div>
        <div className="rounded-lg px-4 py-3 bg-muted mt-1">
          <p className="text-sm">{text}</p>
        </div>
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
          <GraduationCap className="h-12 w-12 text-muted-foreground/50 mb-4" />
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
