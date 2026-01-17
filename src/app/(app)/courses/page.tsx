
"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
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
  Globe,
  Filter,
  BookX,
  Users,
  Pin,
  Eye,
  SmilePlus,
  TextIcon,
  File,
  Vote,
  PlusIcon,
  CheckCircle2,
  EyeOff,
  ChevronDown,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  query,
  where,
  getDoc,
  arrayUnion,
  runTransaction,
  increment,
  writeBatch,
  FieldValue,
} from "firebase/firestore";
import type { Note, Announcement, AnnouncementScope, Schedule, Center, AnnouncementType, PollOption, User as AppUser } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/icons";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { FullScheduleView } from "@/components/layout/full-schedule-view";
import { cn } from "@/lib/utils";
import { AvatarDisplay } from "@/components/profile/avatar-creator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";


export default function InfoPage() {
  return (
    <div className="flex flex-col min-h-full">
      <header className="p-4 sm:p-6 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <h1 className="text-3xl font-bold font-headline tracking-tighter flex items-center gap-3">
          <InfoIcon className="h-7 w-7" />
          Punto de Información
        </h1>
        <p className="text-muted-foreground mt-1">
          Anuncios, recursos y herramientas para tu día a día.
        </p>
      </header>

      <main className="flex-1">
        <Tabs defaultValue="announcements" className="w-full">
          <div className="p-4 sm:p-6">
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

type AnnouncementFilter = "all" | AnnouncementScope | "my-class";

function AnnouncementsTab() {
  const { user } = useApp();
  const firestore = useFirestore();
  const [filter, setFilter] = useState<AnnouncementFilter>("all");

  const announcementsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "announcements"), orderBy("createdAt", "desc"));
  }, [firestore]);
  
  const usersInCenterQuery = useMemoFirebase(() => {
    if (!firestore || !user?.organizationId) return null;
    return query(collection(firestore, "users"), where("organizationId", "==", user.organizationId));
  }, [firestore, user?.organizationId]);

  const { data: usersInCenter = [] } = useCollection<AppUser>(usersInCenterQuery);
  const { data: announcements = [], isLoading } = useCollection<Announcement>(announcementsCollection);

  const handleAddAnnouncement = async (announcementData: Partial<Announcement>) => {
    if (!firestore || !user) return;
    const announcementsCollectionRef = collection(firestore, "announcements");
    
    const newAnnouncement: Partial<Announcement> = {
        ...announcementData,
        authorId: user.uid,
        authorName: user.name,
        authorAvatar: user.avatar,
        createdAt: serverTimestamp(),
        isPinned: false,
        viewedBy: [],
        reactions: {},
    };

    if (newAnnouncement.type === 'poll') {
        newAnnouncement.pollVoteCounts = {};
        newAnnouncement.pollOptions?.forEach(opt => {
            newAnnouncement.pollVoteCounts![opt.id] = 0;
        });
        newAnnouncement.votedUserIds = [];
    }
    
    await addDoc(announcementsCollectionRef, newAnnouncement);
  }

  const handleUpdateAnnouncement = async (uid: string, text: string) => {
    if (!firestore) return;
    const announcementDocRef = doc(firestore, "announcements", uid);
    await updateDoc(announcementDocRef, { text });
  }

  const handleDeleteAnnouncement = async (uid: string) => {
      if (!firestore) return;
      const announcementDocRef = doc(firestore, "announcements", uid);
      await deleteDoc(announcementDocRef);
  }
  
  const handlePinAnnouncement = async (uid: string, currentStatus: boolean) => {
    if (!firestore) return;
    const announcementDocRef = doc(firestore, "announcements", uid);
    await updateDoc(announcementDocRef, { isPinned: !currentStatus });
  };
  
  const handleReaction = async (announcementId: string, emoji: string) => {
    if (!firestore || !user) return;
    const announcementDocRef = doc(firestore, "announcements", announcementId);

    try {
        await runTransaction(firestore, async (transaction) => {
            const annDoc = await transaction.get(announcementDocRef);
            if (!annDoc.exists()) {
                throw "Document does not exist!";
            }

            const data = annDoc.data();
            let currentReactions = data.reactions || {};
            
            // Atomically update reactions
            const newReactions = { ...currentReactions };
            const isUnreacting = (newReactions[emoji] || []).includes(user.uid);

            // Remove user from all other reactions
            Object.keys(newReactions).forEach(key => {
                const reactors = newReactions[key] as string[];
                const userIndex = reactors.indexOf(user.uid);
                if (userIndex > -1) {
                    reactors.splice(userIndex, 1);
                }
                if (reactors.length === 0) {
                    delete newReactions[key];
                }
            });

            // Add new reaction or toggle off
            if (!isUnreacting) {
                if (!newReactions[emoji]) {
                    newReactions[emoji] = [];
                }
                newReactions[emoji].push(user.uid);
            }

            transaction.update(announcementDocRef, { reactions: newReactions });
        });
    } catch (error) {
        console.error("Error updating reaction:", error);
    }
  }

  const userIsInCenter = user?.center && user.center !== 'personal';
  const userClassName = useMemo(() => user ? `${user.course.replace('eso','ESO')}-${user.className}` : null, [user]);

  const canUserManageAnnouncement = (ann: Announcement) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'center-admin' && ann.scope === 'center') {
        return ann.centerId === user.organizationId;
    }
    if (user.role.startsWith('admin-')) {
        const adminClassName = user.role.split('admin-')[1];
        if (ann.scope === 'class' && ann.centerId === user.organizationId && adminClassName === ann.className) {
            return true;
        }
    }
    return false;
  };


  const sortedAndFilteredAnnouncements = useMemo(() => {
    const sorted = [...announcements].sort((a, b) => {
        const pinA = a.isPinned ? 1 : 0;
        const pinB = b.isPinned ? 1 : 0;
        if (pinB !== pinA) {
            return pinB - pinA;
        }
        return (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0);
    });

    return sorted.filter(ann => {
      if (!user) return false;
      if (filter === 'all') {
        if (ann.scope === 'general') return true;
        if (ann.scope === 'center' && user.organizationId === ann.centerId) return true;
        if (ann.scope === 'class' && user.organizationId === ann.centerId && userClassName === ann.className) return true;
        return false;
      }
      if (filter === 'general') return ann.scope === 'general';
      if (filter === 'center') return ann.scope === 'center' && user.organizationId === ann.centerId;
      if (filter === 'my-class') return ann.scope === 'class' && user.organizationId === ann.centerId && userClassName === ann.className;
      return false;
    });
  }, [announcements, filter, user, userClassName]);
  
  const isGlobalAdmin = user?.role === 'admin';
  const isCenterAdmin = user?.role === 'center-admin';
  const isClassAdmin = user?.role?.startsWith('admin-');
  const canPost = isGlobalAdmin || isCenterAdmin || isClassAdmin;


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Últimos Anuncios</h2>
          <div className="w-full sm:w-auto">
            <Select onValueChange={(v: AnnouncementFilter) => setFilter(v)} defaultValue="all">
                <SelectTrigger className="w-full sm:w-[220px]">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <SelectValue placeholder="Filtrar anuncios..." />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos los Anuncios</SelectItem>
                    <SelectItem value="general">
                        <div className="flex items-center gap-2">
                           <Globe className="h-4 w-4" /> General
                        </div>
                    </SelectItem>
                    {userIsInCenter && (
                        <>
                            <SelectItem value="center">
                                <div className="flex items-center gap-2">
                                <Building className="h-4 w-4" /> Centro
                                </div>
                            </SelectItem>
                             <SelectItem value="my-class">
                                <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" /> {userClassName}
                                </div>
                            </SelectItem>
                        </>
                    )}
                </SelectContent>
            </Select>
          </div>
      </div>

      {canPost && (
        <NewAnnouncementCard onSend={handleAddAnnouncement} />
      )}

      {isLoading && <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin text-primary" />}
      
      {!isLoading && sortedAndFilteredAnnouncements.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
          <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="font-semibold">No hay anuncios</p>
          <p className="text-sm text-muted-foreground">
            No hay anuncios que coincidan con el filtro seleccionado.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {sortedAndFilteredAnnouncements.map((announcement) => (
          <AnnouncementItem
              key={announcement.uid}
              announcement={announcement}
              isAuthor={user?.uid === announcement.authorId}
              canManage={canUserManageAnnouncement(announcement)}
              onUpdate={handleUpdateAnnouncement}
              onDelete={handleDeleteAnnouncement}
              onPin={() => handlePinAnnouncement(announcement.uid, !!announcement.isPinned)}
              onReaction={handleReaction}
              allUsersInCenter={usersInCenter}
          />
        ))}
      </div>
    </div>
  );
}

function NewAnnouncementCard({ onSend }: { onSend: (data: Partial<Announcement>) => Promise<void> }) {
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useApp();

    const [announcementType, setAnnouncementType] = useState<AnnouncementType>('text');
    const [text, setText] = useState("");
    const [pollQuestion, setPollQuestion] = useState("");
    const [pollOptions, setPollOptions] = useState<PollOption[]>([{ id: '1', text: '' }, { id: '2', text: '' }]);
    const [allowMultipleVotes, setAllowMultipleVotes] = useState(false);

    const isGlobalAdmin = user?.role === 'admin';
    const isCenterAdmin = user?.role === 'center-admin';
    const isClassAdmin = user?.role?.startsWith('admin-');

    const adminClassName = useMemo(() => {
        if (isClassAdmin && user) {
            const roleParts = user.role.split('admin-');
            if (roleParts.length > 1) return roleParts[1];
        }
        return null;
    }, [isClassAdmin, user]);

    const getInitialScope = useCallback((): AnnouncementScope => {
        if (isClassAdmin) return 'class';
        if (isCenterAdmin) return 'center';
        return 'general';
    }, [isCenterAdmin, isClassAdmin]);

    const [scope, setScope] = useState<AnnouncementScope>(getInitialScope());

    useEffect(() => {
        setScope(getInitialScope());
    }, [isGlobalAdmin, isCenterAdmin, isClassAdmin, getInitialScope]);

    const handleAddOption = () => {
        setPollOptions(prev => [...prev, { id: (prev.length + 1).toString(), text: '' }]);
    };
    
    const handleRemoveOption = (id: string) => {
        setPollOptions(prev => prev.filter(opt => opt.id !== id));
    };

    const handleOptionChange = (id: string, newText: string) => {
        setPollOptions(prev => prev.map(opt => opt.id === id ? { ...opt, text: newText } : opt));
    };
    
    const handleSend = async () => {
        if (!user) return;
        setIsLoading(true);

        try {
            let announcementData: Partial<Announcement> = {
                scope,
                type: announcementType,
            };

            if (scope === 'center' || scope === 'class') {
                announcementData.centerId = user.organizationId;
            }
            if (scope === 'class' && adminClassName) {
                announcementData.className = adminClassName;
            }

            if (announcementType === 'text') {
                if (!text.trim()) {
                    setIsLoading(false);
                    return;
                }
                announcementData.text = text;
            } else if (announcementType === 'poll') {
                const validOptions = pollOptions.filter(opt => opt.text.trim() !== '');
                if (!pollQuestion.trim() || validOptions.length < 2) {
                     setIsLoading(false);
                     return; // Add toast feedback later
                }
                announcementData.pollQuestion = pollQuestion;
                announcementData.pollOptions = validOptions.map((opt, index) => ({ id: (index + 1).toString(), text: opt.text })); // Re-ID to be safe
                announcementData.allowMultipleVotes = allowMultipleVotes;
                announcementData.pollVoteCounts = {}; // Initialize vote counts
                announcementData.votedUserIds = []; // Initialize voted users
            }

            await onSend(announcementData);
            
            // Reset form
            setText("");
            setPollQuestion("");
            setPollOptions([{ id: '1', text: '' }, { id: '2', text: '' }]);
            setAllowMultipleVotes(false);
            setAnnouncementType('text');

        } catch (error) {
            console.error("Failed to send announcement", error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="shadow-sm">
            <CardContent className="p-4 space-y-3">
                <div className="flex gap-3">
                    {user && <AvatarDisplay user={user} className="h-10 w-10 border" />}
                    <div className="flex-1 space-y-3">
                       {announcementType === 'text' && (
                            <Textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Escribe un nuevo anuncio..."
                                className="bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
                                rows={3}
                            />
                       )}
                       {announcementType === 'poll' && (
                           <div className="space-y-3 p-3 bg-muted/50 rounded-md border">
                               <Input 
                                 value={pollQuestion}
                                 onChange={(e) => setPollQuestion(e.target.value)}
                                 placeholder="Pregunta de la votación..."
                                 className="text-base font-semibold"
                               />
                               <div className="space-y-2">
                                  {pollOptions.map((option, index) => (
                                      <div key={option.id} className="flex items-center gap-2">
                                        <Input
                                          value={option.text}
                                          onChange={(e) => handleOptionChange(option.id, e.target.value)}
                                          placeholder={`Opción ${index + 1}`}
                                        />
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0" onClick={() => handleRemoveOption(option.id)} disabled={pollOptions.length <= 2}>
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                  ))}
                               </div>
                               <Button variant="outline" size="sm" onClick={handleAddOption} className="w-full border-dashed">
                                    <PlusIcon className="h-4 w-4 mr-2"/>Añadir opción
                               </Button>
                               <div className="flex items-center space-x-2 pt-2">
                                     <Switch id="multiple-votes" checked={allowMultipleVotes} onCheckedChange={setAllowMultipleVotes} />
                                     <Label htmlFor="multiple-votes">Permitir múltiples respuestas</Label>
                               </div>
                           </div>
                       )}
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-end items-stretch gap-2">
                    <div className="flex items-center gap-2">
                         <Select onValueChange={(v: AnnouncementType) => setAnnouncementType(v)} value={announcementType}>
                            <SelectTrigger className="w-full sm:w-[130px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="text"><div className="flex items-center gap-2"><TextIcon className="h-4 w-4" /> Texto</div></SelectItem>
                                <SelectItem value="poll"><div className="flex items-center gap-2"><Vote className="h-4 w-4" /> Votación</div></SelectItem>
                                <SelectItem value="file" disabled><div className="flex items-center gap-2"><File className="h-4 w-4" /> Archivo</div></SelectItem>
                            </SelectContent>
                        </Select>
                        <Select onValueChange={(v: AnnouncementScope) => setScope(v)} value={scope} disabled={!isGlobalAdmin}>
                            <SelectTrigger className="w-full sm:w-[130px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {isGlobalAdmin && (
                                    <SelectItem value="general"><div className="flex items-center gap-2"><Globe className="h-4 w-4" /> General</div></SelectItem>
                                )}
                                {(isGlobalAdmin || isCenterAdmin) && user?.organizationId && (
                                   <SelectItem value="center"><div className="flex items-center gap-2"><Building className="h-4 w-4" /> Centro</div></SelectItem>
                                )}
                                {(isGlobalAdmin || isClassAdmin) && user?.organizationId && adminClassName && (
                                   <SelectItem value="class"><div className="flex items-center gap-2"><Users className="h-4 w-4" /> {adminClassName}</div></SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleSend} disabled={isLoading} className="w-full sm:w-auto">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Publicar
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}


function AnnouncementItem({ announcement, isAuthor, canManage, onUpdate, onDelete, onPin, onReaction, allUsersInCenter }: { 
    announcement: Announcement, 
    isAuthor: boolean, 
    canManage: boolean, 
    onUpdate: (uid: string, text: string) => void, 
    onDelete: (uid: string) => void, 
    onPin: () => void,
    onReaction: (uid: string, emoji: string) => void,
    allUsersInCenter: AppUser[]
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(announcement.text || '');
  const { user, firestore } = useApp();
  const ref = useRef<HTMLDivElement>(null);
  
  const availableReactions = ['😊', '😂', '❤️', '👍', '👎', '😡', '😮', '🎉', '😢'];

  useEffect(() => {
    const node = ref.current;
    if (!node || !firestore || !user) return;

    const hasViewed = announcement.viewedBy?.includes(user.uid);
    if (hasViewed) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const announcementDocRef = doc(firestore, "announcements", announcement.uid);
          updateDoc(announcementDocRef, {
            viewedBy: arrayUnion(user.uid)
          }).catch(err => console.error("Failed to update view count", err));
          observer.unobserve(node);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [announcement.uid, announcement.viewedBy, firestore, user]);

  const formatTimestamp = (timestamp: { seconds: number }) => {
    if (!timestamp) return "";
    const date = new Date(timestamp.seconds * 1000);
    return formatDistanceToNow(date, { addSuffix: true, locale: es });
  };
  
  const handleUpdate = () => {
    onUpdate(announcement.uid, editText);
    setIsEditing(false);
  }

  const getBadge = () => {
      switch(announcement.scope) {
          case 'general':
              return <Badge variant="outline"><Globe className="h-3 w-3 mr-1.5"/>General</Badge>;
          case 'center':
              return <Badge variant="secondary"><Building className="h-3 w-3 mr-1.5"/>Centro</Badge>;
          case 'class':
               return <Badge><Users className="h-3 w-3 mr-1.5"/>{announcement.className || 'Clase'}</Badge>;
          default:
              return null;
      }
  }

  return (
    <Card ref={ref} className={cn("overflow-hidden transition-all duration-300 hover:border-primary/20 hover:shadow-md", announcement.isPinned && "border-primary/50 bg-primary/5")}>
        <CardHeader className="flex flex-row items-start gap-4 space-y-0 p-4">
             <AvatarDisplay user={{ name: announcement.authorName, avatar: announcement.authorAvatar }} className="h-10 w-10 border" />
            <div className="flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
                    <div>
                        <p className="font-bold text-sm">{announcement.authorName}</p>
                        <p className="text-xs text-muted-foreground">{formatTimestamp(announcement.createdAt)}</p>
                    </div>
                     <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Eye className="h-4 w-4" />
                            <span>{announcement.viewedBy?.length || 0}</span>
                        </div>
                        {getBadge()}
                    </div>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
            {announcement.type === 'poll' ? (
                <PollDisplay announcement={announcement} allUsers={allUsersInCenter} />
            ) : isEditing ? (
                 <div className="space-y-2">
                    <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={3} />
                    <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</Button>
                        <Button size="sm" onClick={handleUpdate}>Guardar</Button>
                    </div>
                </div>
            ) : (
                <div className="rounded-lg bg-muted/50 p-4 border text-sm text-foreground/90 whitespace-pre-wrap">
                    {announcement.text}
                </div>
            )}
        </CardContent>
        {(isAuthor || canManage || user) && !isEditing && (
             <CardFooter className="p-4 pt-0 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                <SmilePlus className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-1">
                            <div className="grid grid-cols-5 gap-0">
                                {availableReactions.map(emoji => (
                                    <Button
                                        key={emoji}
                                        variant="ghost"
                                        size="icon"
                                        className="text-xl rounded-full h-9 w-9"
                                        onClick={() => onReaction(announcement.uid, emoji)}
                                    >
                                        {emoji}
                                    </Button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>

                    <div className="flex flex-wrap gap-1">
                        {Object.entries(announcement.reactions || {}).map(([emoji, uids]) => {
                            if (uids.length === 0) return null;
                            const userHasReacted = uids.includes(user?.uid || '');
                            return (
                                <Badge
                                    key={emoji}
                                    variant={userHasReacted ? "default" : "secondary"}
                                    className="cursor-pointer transition-transform hover:scale-110 py-0.5 px-1.5"
                                    onClick={() => onReaction(announcement.uid, emoji)}
                                >
                                    <span className="text-sm mr-1">{emoji}</span>
                                    <span className="font-bold text-xs">{uids.length}</span>
                                </Badge>
                            )
                        })}
                    </div>
                </div>

                <div className="flex items-center">
                    {canManage && (
                        <Button variant="ghost" size="sm" onClick={onPin}>
                            <Pin className={cn("h-4 w-4", announcement.isPinned && "fill-current text-primary")} />
                        </Button>
                    )}
                    {isAuthor && announcement.type !== 'poll' && (
                        <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>Editar</Button>
                    )}
                   {(isAuthor || canManage) && (
                     <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => onDelete(announcement.uid)}>Eliminar</Button>
                   )}
                </div>
            </CardFooter>
        )}
    </Card>
  );
}

function PollDisplay({ announcement, allUsers }: { announcement: Announcement, allUsers: AppUser[]}) {
    const { user, firestore, auth } = useApp();
    const { toast } = useToast();
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const hasUserVoted = useMemo(() => {
        if (!auth?.currentUser || !announcement.votedUserIds) return false;
        return announcement.votedUserIds.includes(auth.currentUser.uid);
    }, [auth?.currentUser, announcement.votedUserIds]);
    
    const totalVotes = useMemo(() => {
        if (!announcement.pollVoteCounts) return 0;
        return Object.values(announcement.pollVoteCounts).reduce((acc, count) => acc + count, 0);
    }, [announcement.pollVoteCounts]);

    const handleSelectOption = (optionId: string) => {
        const isMultiVote = announcement.allowMultipleVotes || false;
        setSelectedOptions(prev => {
            if (isMultiVote) {
                return prev.includes(optionId)
                    ? prev.filter(id => id !== optionId)
                    : [...prev, optionId];
            } else {
                return prev.includes(optionId) ? [] : [optionId];
            }
        });
    };

    const handleSubmitVote = async () => {
        if (!auth || !auth.currentUser) {
            alert("Error crítico: Firebase dice que no hay un usuario logueado actualmente.");
            return;
        }
        
        const currentUser = auth.currentUser;

        if (selectedOptions.length === 0) {
            toast({ title: "Selecciona una opción", description: "Debes elegir al menos una respuesta.", variant: "destructive" });
            return;
        }
        if (!firestore) {
            toast({ title: "Error de conexión", description: "No se pudo conectar con la base de datos.", variant: "destructive" });
            return;
        }
        
        setIsSubmitting(true);
        console.log("Intentando escribir en: anuncios/" + announcement.uid);
        const announcementRef = doc(firestore, "announcements", announcement.uid);
        
        try {
            await runTransaction(firestore, async (transaction) => {
                const annDoc = await transaction.get(announcementRef);
                if (!annDoc.exists()) {
                    throw { code: 'not-found', message: 'La encuesta ya no existe.' };
                }

                const currentData = annDoc.data() as Announcement;
                
                if (currentData.votedUserIds?.includes(currentUser.uid) && !currentData.allowMultipleVotes) {
                    throw { code: 'already-voted', message: 'Ya has votado en esta encuesta.' };
                }

                const updateData: { [key: string]: any } = {};
                
                selectedOptions.forEach(optionId => {
                    const fieldPath = `pollVoteCounts.${optionId}`;
                    updateData[fieldPath] = increment(1);
                });

                updateData.votedUserIds = arrayUnion(currentUser.uid);
                
                transaction.update(announcementRef, updateData);
            });

            toast({ title: "¡Voto registrado!", description: "Gracias por tu participación." });
        } catch (error: any) {
            console.error("Error al registrar el voto:", error);
            alert("Error técnico de Firebase: " + (error.code || 'UNKNOWN') + " - " + error.message);
            toast({ title: 'Error al votar', description: `No se pudo registrar tu voto. Error: ${error.message}`, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const canUserManageAnnouncement = (ann: Announcement): boolean => {
        if (!user) return false;
        if (user.role === 'admin') return true;
        if (user.role === 'center-admin' && ann.scope === 'center') {
            return ann.centerId === user.organizationId;
        }
        if (user.role.startsWith('admin-')) {
            const adminClassName = user.role.split('admin-')[1];
            return ann.scope === 'class' && ann.centerId === user.organizationId && adminClassName === ann.className;
        }
        return false;
    };
    
    const showAdminResultsButton = canUserManageAnnouncement(announcement);

    if (hasUserVoted) {
      return (
        <div className="space-y-3">
          <h4 className="font-bold text-base">{announcement.pollQuestion}</h4>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
                {totalVotes} {totalVotes === 1 ? 'voto' : 'votos'} en total. Gracias por participar.
            </p>
            {showAdminResultsButton && (
                <PollResultsDialog announcement={announcement} allUsers={allUsers} />
            )}
          </div>
          <div className="space-y-2">
              {announcement.pollOptions?.map(option => {
                  const votes = announcement.pollVoteCounts?.[option.id] || 0;
                  const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                  
                  return (
                      <div key={option.id} className="relative rounded-lg border p-3 overflow-hidden bg-muted/50">
                          <div
                              className="absolute left-0 top-0 h-full bg-primary/20 transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                          />
                          <div className="relative flex items-center justify-between z-10">
                              <span className="font-semibold">{option.text}</span>
                              <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold">{votes}</span>
                                  <span className="text-xs text-muted-foreground">{percentage.toFixed(0)}%</span>
                              </div>
                          </div>
                      </div>
                  )
              })}
          </div>
        </div>
      )
    }

    return (
        <div className="space-y-3">
            <h4 className="font-bold text-base">{announcement.pollQuestion}</h4>
            <div className="space-y-2">
                {announcement.pollOptions?.map(option => {
                    const isSelected = selectedOptions.includes(option.id);
                    return (
                        <button
                            type="button"
                            key={option.id}
                            className={cn(
                                "relative rounded-lg border overflow-hidden cursor-pointer text-left w-full block hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all",
                                isSelected && "border-primary"
                            )}
                            onClick={() => handleSelectOption(option.id)}
                            disabled={isSubmitting}
                        >
                            <div className={cn("relative p-3 flex items-center gap-3", isSelected && "bg-primary/10")}>
                                <div className={cn("h-5 w-5 rounded-full border-2 border-primary shrink-0 flex items-center justify-center transition-colors", isSelected && "bg-primary")}>
                                  {isSelected && <CheckCircle2 className="h-3 w-3 text-white"/>}
                                </div>
                                <span className="flex-1 font-semibold">{option.text}</span>
                            </div>
                        </button>
                    )
                })}
            </div>
            
            <div className="flex items-center justify-between mt-3">
              <Button
                  type="button"
                  onClick={handleSubmitVote}
                  disabled={isSubmitting || selectedOptions.length === 0}
                  className="w-full"
              >
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                  {isSubmitting ? "Enviando..." : "Enviar Respuesta"}
              </Button>
              {showAdminResultsButton && (
                  <PollResultsDialog announcement={announcement} allUsers={allUsers} />
              )}
            </div>
        </div>
    )
}

function PollResultsDialog({ announcement, allUsers }: { announcement: Announcement, allUsers: AppUser[]}) {
     const voters = useMemo(() => {
        const voterUids = announcement.votedUserIds || [];
        return voterUids.map(uid => allUsers.find(u => u.uid === uid)).filter(Boolean) as AppUser[];
    }, [announcement.votedUserIds, allUsers]);

    return (
        <Dialog>
            <DialogTrigger asChild>
                 <Button variant="secondary" size="sm" className="ml-2">Ver respuestas</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Participantes de la Votación</DialogTitle>
                    <DialogDescription>{announcement.pollQuestion}</DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] -mx-6 px-6">
                    <div className="space-y-2">
                        {voters.length > 0 ? (
                            voters.map(voter => (
                                <div key={voter.uid} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md text-sm">
                                    <AvatarDisplay user={voter} className="h-6 w-6"/>
                                    <span>{voter.name}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-muted-foreground text-center py-8">Nadie ha participado en esta votación todavía.</p>
                        )}
                    </div>
                </ScrollArea>
                 <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cerrar</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function MyClassesTab() {
  const { user } = useApp();
  const firestore = useFirestore();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!firestore || !user || !user.center || user.center === 'personal' || !user.organizationId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);

      const centerDocRef = doc(firestore, 'centers', user.organizationId);
      const centerDoc = await getDoc(centerDocRef);
      
      if (centerDoc.exists()) {
        const centerData = centerDoc.data() as Center;
        const userClassName = `${user.course.replace('eso','ESO')}-${user.className}`;
        const userClassDef = centerData.classes.find(c => c.name === userClassName);
        if (userClassDef?.schedule) {
          setSchedule(userClassDef.schedule);
        } else {
          setSchedule(null);
        }
      } else {
        setSchedule(null);
      }
      setIsLoading(false);
    };

    fetchSchedule();
  }, [firestore, user]);

  if (!user || isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mis Clases</CardTitle>
          <CardDescription>Cargando tu horario...</CardDescription>
        </CardHeader>
        <CardContent>
          <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const isScheduleAvailable = !!schedule;

  const courseMap: Record<string, string> = {
    "1eso": "1º ESO",
    "2eso": "2º ESO",
    "3eso": "3º ESO",
    "4eso": "4º ESO",
    "1bach": "1º Bachillerato",
    "2bach": "2º Bachillerato",
  };

  const formattedCourse = courseMap[user.course] || user.course;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle>Mi Horario de Clases</CardTitle>
            <CardDescription className="pt-1">
              {isScheduleAvailable ? "Aquí tienes tu horario para toda la semana." : "Tu horario de clases no está disponible."}
            </CardDescription>
          </div>
          <Badge variant="default" className="text-sm px-2 py-1 whitespace-nowrap">{`${formattedCourse} - ${user.className}`}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0 sm:p-2">
        {isScheduleAvailable && schedule ? (
          <FullScheduleView scheduleData={schedule} />
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12">
            <BookX className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="font-semibold text-lg">Horario no disponible</p>
            <p className="text-muted-foreground max-w-sm">
                Actualmente no hay un horario definido para tu clase. Pide a un administrador de tu centro que lo configure.
            </p>
          </div>
        )}
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

    