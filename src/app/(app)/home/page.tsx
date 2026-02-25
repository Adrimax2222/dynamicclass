
"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
import type { SummaryCardData, Schedule, User, ScheduleEntry, UpcomingClass, CalendarEvent, Announcement, Center } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ArrowRight, Trophy, NotebookText, FileCheck2, Clock, MessageSquare, LifeBuoy, BookX, Loader2, CalendarIcon, CheckCircle, BrainCircuit, Infinity, Flame, ShoppingCart, TreePine, Gift, Lightbulb, Monitor, Users, HelpCircle, BookCopy } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { useApp } from "@/lib/hooks/use-app";
import { Button } from "@/components/ui/button";
import { SCHOOL_NAME, SCHOOL_VERIFICATION_CODE } from "@/lib/constants";
import { Logo } from "@/components/icons";
import WelcomeModal from "@/components/layout/welcome-modal";
import { doc, updateDoc, increment, collection, query, orderBy, getDocs, addDoc, serverTimestamp, arrayRemove, arrayUnion, writeBatch } from "firebase/firestore";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { FullScheduleView } from "@/components/layout/full-schedule-view";
import { RankingDialog } from "@/components/layout/ranking-dialog";
import { StreakRankingDialog } from "@/components/layout/streak-ranking-dialog";
import CompleteProfileModal from "@/components/layout/complete-profile-modal";
import { startOfWeek, endOfWeek, addWeeks, isWithinInterval, format, startOfToday, isToday, isTomorrow, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { TeacherInfoDialog } from "@/components/layout/teacher-info-dialog";
import { useToast } from "@/hooks/use-toast";
import { WhatsNewDialog } from "@/components/layout/whats-new-dialog";
import { WipDialog } from "@/components/layout/wip-dialog";
import { QuotePill } from "@/components/layout/quote-pill";

type Category = "Tareas" | "Exámenes" | "Pendientes" | "Anuncios";

interface ParsedEvent extends CalendarEvent {
    // an extension of the base type to ensure date is a Date object during processing
    date: Date;
}

const keywords = {
    exam: ['examen', 'exam', 'prueba', 'control', 'prova'],
    task: ['tarea', 'ejercicios', 'deberes', 'lliurament', 'fitxa', 'feina', 'deures', 'entrega', 'presentació', 'actividad', 'proyecto', 'sortida', 'exposició', 'projecte'],
};

const ADMIN_EMAILS = ['anavarrod@iestorredelpalau.cat', 'lrotav@iestorredelpalau.cat', 'adrimax.dev@gmail.com', 'info.dynamicclass@gmail.com'];

export default function HomePage() {
  const { user, updateUser } = useApp();
  const firestore = useFirestore();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showWelcomeAfterCompletion, setShowWelcomeAfterCompletion] = useState(false);
  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([]);
  const [upcomingClassesDay, setUpcomingClassesDay] = useState<string>("Próximas Clases");
  const [userSchedule, setUserSchedule] = useState<Schedule | null>(null);
  
  const [allEvents, setAllEvents] = useState<ParsedEvent[]>([]);
  const [allAnnouncements, setAllAnnouncements] = useState<Announcement[]>([]);
  const [allCenters, setAllCenters] = useState<Center[]>([]);
  const [isLoadingVariables, setIsLoadingVariables] = useState(true);
  const [completedEventIds, setCompletedEventIds] = useState<string[]>([]);
  const [readAnnouncementIds, setReadAnnouncementIds] = useState<string[]>([]);


  useEffect(() => {
    // On mount, load completed IDs from localStorage
    const storedCompletedIds = localStorage.getItem('completedEventIds');
    if (storedCompletedIds) {
      setCompletedEventIds(JSON.parse(storedCompletedIds));
    }
    const storedReadAnnouncementIds = localStorage.getItem('readAnnouncementIds');
    if (storedReadAnnouncementIds) {
      setReadAnnouncementIds(JSON.parse(storedReadAnnouncementIds));
    }
  }, []);
    
  useEffect(() => {
    if (!firestore || !user) return;

    // Increment accessCount for onboarding logic
    const sessionKey = `accessIncremented_${user.uid}`;
    const hasIncrementedInSession = sessionStorage.getItem(sessionKey);

    if (!hasIncrementedInSession) {
        const userDocRef = doc(firestore, 'users', user.uid);
        updateDoc(userDocRef, {
            accessCount: increment(1)
        });
        sessionStorage.setItem(sessionKey, 'true');
    }
  }, [firestore, user]);

  const getCategorizedEvents = (category: Category): (ParsedEvent | Announcement)[] => {
      const today = startOfToday();
      
      if (category === 'Anuncios') {
        return allAnnouncements.filter(ann => !readAnnouncementIds.includes(ann.uid));
      }

      // 1. Filter only for school calendar events
      const schoolEvents = allEvents.filter(event => event.type === 'class');
      
      const endOfNextWeek = endOfWeek(addWeeks(today, 1), { weekStartsOn: 1 });

      // 2. Filter for relevant date range and not completed
      const relevantEvents = schoolEvents.filter(event => 
        event.date >= today &&
        isWithinInterval(event.date, { start: today, end: endOfNextWeek }) &&
        !completedEventIds.includes(event.id)
      );
      
      if (category === 'Pendientes') {
          return relevantEvents
            .sort((a, b) => a.date.getTime() - b.date.getTime());
      }
      
      let eventKeywords: string[] = [];
      let isDefaultCategory = false;

      if (category === 'Exámenes') {
        eventKeywords = keywords.exam;
      } else if (category === 'Tareas') {
        isDefaultCategory = true;
      }
      
      return relevantEvents
        .filter(event => {
            const title = event.title.toLowerCase();
            if (isDefaultCategory) {
                const isExam = keywords.exam.some(kw => title.includes(kw));
                return !isExam;
            }
            return eventKeywords.some(kw => title.includes(kw));
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const getCategoryCount = (category: Category): number => {
    return getCategorizedEvents(category).length;
  }
  
  const handleMarkAsComplete = async (eventId: string) => {
    if (!firestore || !user) return;
    
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return;

    const newCompletedIds = [...completedEventIds, eventId];
    setCompletedEventIds(newCompletedIds);
    localStorage.setItem('completedEventIds', JSON.stringify(newCompletedIds));
    
    const userDocRef = doc(firestore, 'users', user.uid);
    const title = event.title.toLowerCase();
    const isExam = keywords.exam.some(kw => title.includes(kw));
    const itemType = isExam ? 'exam' : 'task';
    const fieldToIncrement = isExam ? 'exams' : 'tasks';

    // Save to history
    const completedItemsRef = collection(firestore, `users/${user.uid}/completedItems`);
    await addDoc(completedItemsRef, {
        title: event.title,
        type: itemType,
        completedAt: serverTimestamp()
    });
        
    // Update user stats
    await updateDoc(userDocRef, {
        [fieldToIncrement]: increment(1),
        trophies: increment(1),
    }).catch(err => console.error("Error updating user stats:", err));
  };


  // Moved parser and fetch logic inside useEffect or as standalone functions within the component
    const parseIcal = useCallback((icalData: string): ParsedEvent[] => {
        const events: ParsedEvent[] = [];
        const lines = icalData.split(/\r\n|\n|\r/);
        let currentEvent: any = null;

        for (const line of lines) {
            if (line.startsWith('BEGIN:VEVENT')) {
                currentEvent = {};
            } else if (line.startsWith('END:VEVENT')) {
                if (currentEvent && currentEvent.dtstart && currentEvent.summary) {
                    try {
                        const dateStrRaw = currentEvent.dtstart.split(':')[1];
                        const dateStr = dateStrRaw.split('T')[0].replace(';VALUE=DATE', '');
                        const year = parseInt(dateStr.substring(0, 4), 10);
                        const month = parseInt(dateStr.substring(4, 6), 10) - 1;
                        const day = parseInt(dateStr.substring(6, 8), 10);
                        
                        const eventDate = new Date(year, month, day); // FIX: Do not use UTC for all-day events
                        
                        events.push({
                            id: currentEvent.uid || Math.random().toString(),
                            title: currentEvent.summary,
                            description: (currentEvent.description || 'No hay descripción.').replace(/\\n/g, '\n'),
                            date: eventDate,
                            type: 'class'
                        });
                    } catch(e) {
                        console.error("Could not parse event date:", currentEvent.dtstart, e);
                    }
                }
                currentEvent = null;
            } else if (currentEvent) {
                const [key, ...valueParts] = line.split(':');
                const value = valueParts.join(':');
                const mainKey = key.split(';')[0]; 

                switch (mainKey) {
                    case 'UID': currentEvent.uid = value; break;
                    case 'SUMMARY': currentEvent.summary = value; break;
                    case 'DESCRIPTION': currentEvent.description = value; break;
                    case 'DTSTART': currentEvent.dtstart = line; break;
                }
            }
        }
        return events;
    }, []);

    const announcementsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, "announcements"), orderBy("createdAt", "desc"));
    }, [firestore]);
    const { data: announcementsData } = useCollection<Announcement>(announcementsQuery);

  useEffect(() => {
    // Only show the modal if the user is new and the state is not already open
    if (user?.isNewUser && !isModalOpen) {
      setIsModalOpen(true);
    }
  }, [user, isModalOpen]);

  useEffect(() => {
    const fetchAndCalculateVars = async () => {
        if (!firestore || !user) return;

        setIsLoadingVariables(true);

        const centersRef = collection(firestore, "centers");
        const centersSnapshot = await getDocs(centersRef);
        const centersList = centersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Center));
        setAllCenters(centersList);

        const userCenter = centersList.find(c => c.uid === user.organizationId);
        const userClassName = `${user.course.replace('eso','ESO')}-${user.className}`;
        
        let icalUrlToFetch: string | null = null;
        if (userCenter) {
            const userClassDef = userCenter.classes.find(c => c.name === userClassName);
            if (userClassDef?.icalUrl) {
                icalUrlToFetch = userClassDef.icalUrl;
            }
            if (userClassDef?.schedule) {
                setUserSchedule(userClassDef.schedule);
            } else {
                setUserSchedule(null);
            }
        } else {
             setUserSchedule(null);
        }

        if (icalUrlToFetch) {
            const cacheKey = `ical_cache_${encodeURIComponent(icalUrlToFetch)}`;
            try {
                const response = await fetch(`/api/calendar-proxy?url=${encodeURIComponent(icalUrlToFetch)}`);
                if (!response.ok) throw new Error(`Failed to fetch calendar: ${response.status}`);
                const icalData = await response.text();
                const parsedEvents = parseIcal(icalData);
                setAllEvents(parsedEvents);
                localStorage.setItem(cacheKey, JSON.stringify(parsedEvents));
            } catch (error) {
                console.error("Error fetching or processing calendar for variables:", error);
                const cachedData = localStorage.getItem(cacheKey);
                if (cachedData) {
                    try {
                        const parsedCache = JSON.parse(cachedData).map((event: any) => ({ ...event, date: new Date(event.date) }));
                        setAllEvents(parsedCache);
                    } catch (cacheError) {
                        setAllEvents([]);
                    }
                } else {
                    setAllEvents([]);
                }
            }
        } else {
            setAllEvents([]);
        }

        // Filter announcements
        if (announcementsData) {
            const filteredAnnouncements = announcementsData.filter(ann => {
                if (!userCenter) { // If user is not in any center
                    return ann.scope === 'general';
                }
                // If user is in a center, show general announcements AND announcements for their center
                return ann.scope === 'general' || (userCenter && ann.scope === 'center' && userCenter.uid === user.organizationId) || (userCenter && ann.scope === 'class' && userCenter.uid === user.organizationId && ann.className === userClassName);
            });
            setAllAnnouncements(filteredAnnouncements);
        }
        
        setIsLoadingVariables(false);
    };
    
    fetchAndCalculateVars();
  }, [user, firestore, announcementsData, parseIcal]);


  useEffect(() => {
    if (!userSchedule) {
      setUpcomingClasses([]);
      return;
    };

    const getUpcomingClasses = (): { classes: UpcomingClass[], dayTitle: string } => {
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 (Sun) - 6 (Sat)
        const hour = now.getHours();
        const minute = now.getMinutes();
        const currentTime = hour * 60 + minute;

        const weekDays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

        let targetDayIndex: number;
        let showRemainingToday = false;

        // After 2:40 PM on Friday, or on Saturday/Sunday, show Monday's classes
        if ((dayOfWeek === 5 && currentTime >= 14 * 60 + 40) || dayOfWeek === 6 || dayOfWeek === 0) {
            targetDayIndex = 1; // Monday
        } 
        // On a weekday, but after class hours
        else if (dayOfWeek >= 1 && dayOfWeek <= 5 && currentTime >= 14 * 60 + 40) {
            targetDayIndex = dayOfWeek + 1;
        } 
        // During school hours on a weekday
        else if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            targetDayIndex = dayOfWeek;
            showRemainingToday = true;
        } 
        // Default to Monday if something is off
        else {
            targetDayIndex = 1;
        }
        
        const targetDayName = weekDays[targetDayIndex] as keyof Schedule;
        let classesForDay: ScheduleEntry[] = userSchedule[targetDayName] || [];

        if (showRemainingToday) {
            classesForDay = classesForDay.filter(c => {
                const [startHour] = c.time.split(':').map(Number);
                return startHour >= hour;
            });
        }
        
        const dayTitle = targetDayIndex === dayOfWeek ? "Clases de Hoy" : `Clases del ${targetDayName}`;

        // If today's classes are all done, show tomorrow's
        if (classesForDay.length === 0 && dayOfWeek >= 1 && dayOfWeek < 5) {
             const nextDayName = weekDays[dayOfWeek + 1] as keyof Schedule;
             return {
                 classes: (userSchedule[nextDayName] || []).slice(0, 3),
                 dayTitle: `Clases del ${nextDayName}`
             };
        }
        
        // If it's after hours on friday or weekend
        if (classesForDay.length === 0 && (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0)) {
            const nextDayName = weekDays[1] as keyof Schedule; // Monday
            return {
                classes: (userSchedule[nextDayName] || []).slice(0, 3),
                dayTitle: `Clases del ${nextDayName}`
            };
        }

        return { classes: classesForDay.slice(0, 3), dayTitle };
    };

    const { classes, dayTitle } = getUpcomingClasses();
    setUpcomingClasses(classes);
    setUpcomingClassesDay(dayTitle);
  }, [userSchedule]);

  const handleProfileCompletionSave = async (updatedData?: Partial<User>) => {
    if (user && firestore) {
        const userDocRef = doc(firestore, 'users', user.uid);
        try {
            const finalData = { ...updatedData, isNewUser: false };
            await updateDoc(userDocRef, finalData);
            updateUser(finalData); // Update local context
            setIsModalOpen(false); // Close the profile completion modal
            setShowWelcomeAfterCompletion(true); // Trigger the welcome modal
        } catch (error) {
            console.error("Failed to update user profile:", error);
            setIsModalOpen(false); // Close on error too
        }
    } else {
        setIsModalOpen(false);
    }
  };
  
  const handleWelcomeModalClose = () => {
    setShowWelcomeAfterCompletion(false);
  }

  const handleAnnouncementsClick = async () => {
    if (!firestore || !user) return;
  
    const announcementsToMark = getCategorizedEvents('Anuncios') as Announcement[];
    if (announcementsToMark.length === 0) {
      router.push('/courses');
      return;
    };
  
    const batch = writeBatch(firestore);
    announcementsToMark.forEach(ann => {
        const annRef = doc(firestore, "announcements", ann.uid);
        batch.update(annRef, {
            viewedBy: arrayUnion(user.uid)
        });
    });
  
    try {
      await batch.commit();
      setReadAnnouncementIds(prev => [...prev, ...announcementsToMark.map(a => a.uid)]);
      localStorage.setItem('readAnnouncementIds', JSON.stringify([...readAnnouncementIds, ...announcementsToMark.map(a => a.uid)]));
    } catch (error) {
      console.error("Error marking announcements as read:", error);
    } finally {
      router.push('/courses');
    }
  };

  const handleLikeAnnouncement = async (announcementId: string) => {
    if (!firestore || !user) return;
    const announcementRef = doc(firestore, "announcements", announcementId);
    const announcement = allAnnouncements.find(ann => ann.uid === announcementId);
    if (!announcement) return;

    const likedBy = announcement.likedBy || [];
    const isLiked = likedBy.includes(user.uid);

    try {
        await updateDoc(announcementRef, {
            likedBy: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
            likes: increment(isLiked ? -1 : 1)
        });
    } catch (error) {
        console.error("Error liking announcement:", error);
    }
  }

  
  if (!user) {
    return null; // Or a loading spinner
  }

  const getFirstName = (fullName: string) => {
    return fullName.split(" ")[0];
  };

  const formattedDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  const summaryCards: SummaryCardData[] = [
    { title: 'Tareas', value: getCategoryCount('Tareas'), icon: NotebookText, color: 'text-blue-500', isAnnouncement: false },
    { title: 'Exámenes', value: getCategoryCount('Exámenes'), icon: FileCheck2, color: 'text-red-500', isAnnouncement: false },
    { title: 'Pendientes', value: getCategoryCount('Pendientes'), icon: Clock, color: 'text-yellow-500', isAnnouncement: false },
    { title: 'Anuncios', value: getCategoryCount('Anuncios'), icon: MessageSquare, color: 'text-green-500', isAnnouncement: true },
  ];
  
  const userCenterName = allCenters.find(c => c.uid === user.organizationId)?.name || user.center;

  const isProfileIncomplete = user.isNewUser && (user.course === "default" || user.className === "default" || user.ageRange === "default");
  const isAdmin = ADMIN_EMAILS.includes(user.email);
  const streakCount = user.streak || 0;
  const isScheduleAvailable = !!userSchedule;

  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6">
      
      {isProfileIncomplete && isModalOpen ? (
        <CompleteProfileModal user={user} onSave={handleProfileCompletionSave} />
      ) : showWelcomeAfterCompletion ? (
        <WelcomeModal onClose={handleWelcomeModalClose} />
      ) : null}

      <header className="mb-8 space-y-2">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold font-headline tracking-tighter sm:text-3xl">
                Dynamic Class
            </h1>
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-full border bg-card p-1 pr-2 shadow-sm">
                    <RankingDialog user={user}>
                        <div className="flex items-center gap-1 cursor-pointer hover:bg-muted p-1 rounded-full transition-colors">
                            <Trophy className="h-5 w-5 text-yellow-400" />
                            <span className="font-bold text-sm">
                                {isAdmin ? <Infinity className="h-4 w-4" /> : user.trophies}
                            </span>
                        </div>
                    </RankingDialog>
                    <StreakRankingDialog user={user}>
                        <div className={cn("flex items-center gap-1 cursor-pointer hover:bg-muted p-1 rounded-full transition-colors", streakCount > 0 ? "bg-orange-100/50 dark:bg-orange-900/20" : "")}>
                            <Flame className={cn("h-5 w-5", streakCount > 0 ? "text-orange-500" : "text-muted-foreground")} />
                            <span className="font-bold text-sm">{streakCount}</span>
                        </div>
                    </StreakRankingDialog>
                </div>
              <ThemeToggle />
            </div>
        </div>
        <div className="flex items-center gap-2">
            <Badge variant="outline">V3.0 - Beta</Badge>
            {user.center && user.center !== 'default' && (
                <Badge>{userCenterName}</Badge>
            )}
            {user.role === 'admin' && (
                <Badge variant="destructive">Admin</Badge>
            )}
        </div>
      </header>

      <div className="mb-8 space-y-2">
        <div>
            <h2 className="text-xl font-semibold sm:text-2xl">
              ¡Bienvenido de nuevo, {getFirstName(user.name)}!
            </h2>
            <p className="text-muted-foreground">Este es tu Dynamic Panel para hoy.</p>
        </div>
        <QuotePill />
        <p className="text-xs text-muted-foreground/80 pt-1">{capitalizedDate}</p>
      </div>


      <div className="mb-10 grid grid-cols-2 gap-4">
        <DetailsDialog 
          title="Tareas" 
          events={getCategorizedEvents("Tareas")}
          isLoading={isLoadingVariables}
          onMarkAsComplete={handleMarkAsComplete}
          cardData={summaryCards[0]}
          user={user}
          updateUser={updateUser}
        >
          <Card className="hover:border-primary/50 transition-colors duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-lg cursor-pointer relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tareas</CardTitle>
                  <NotebookText className="h-5 w-5 text-muted-foreground text-blue-500" />
              </CardHeader>
              <CardContent>
                  {isLoadingVariables ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{getCategoryCount('Tareas')}</div>}
              </CardContent>
          </Card>
        </DetailsDialog>

        <DetailsDialog 
          title="Exámenes" 
          events={getCategorizedEvents("Exámenes")}
          isLoading={isLoadingVariables}
          onMarkAsComplete={handleMarkAsComplete}
          cardData={summaryCards[1]}
          user={user}
          updateUser={updateUser}
        >
          <Card className="hover:border-primary/50 transition-colors duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-lg cursor-pointer relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Exámenes</CardTitle>
                  <FileCheck2 className="h-5 w-5 text-muted-foreground text-red-500" />
              </CardHeader>
              <CardContent>
                  {isLoadingVariables ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{getCategoryCount('Exámenes')}</div>}
              </CardContent>
          </Card>
        </DetailsDialog>

        <DetailsDialog 
          title="Pendientes" 
          events={getCategorizedEvents("Pendientes")}
          isLoading={isLoadingVariables}
          onMarkAsComplete={handleMarkAsComplete}
          cardData={summaryCards[2]}
          user={user}
          updateUser={updateUser}
        >
          <Card className="hover:border-primary/50 transition-colors duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-lg cursor-pointer relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                  <Clock className="h-5 w-5 text-muted-foreground text-yellow-500" />
              </CardHeader>
              <CardContent>
                  {isLoadingVariables ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{getCategoryCount('Pendientes')}</div>}
              </CardContent>
          </Card>
        </DetailsDialog>

        <div onClick={handleAnnouncementsClick} className="cursor-pointer">
          <Card className="hover:border-primary/50 transition-colors duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-lg relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Anuncios</CardTitle>
                  <MessageSquare className="h-5 w-5 text-muted-foreground text-green-500" />
              </CardHeader>
              <CardContent>
                  {isLoadingVariables ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{getCategoryCount('Anuncios')}</div>}
              </CardContent>
          </Card>
        </div>
        <div className="col-span-2">
            <Link href="/learning-hub">
                <Card className="border-accent/50 cursor-pointer hover:bg-accent/10 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mis Cursos</CardTitle>
                        <Lightbulb className="h-5 w-5 text-accent" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                           Explorar <ArrowRight className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
            </Link>
        </div>
      </div>

       <section className="mb-10">
        <Link href="/study" className="block">
          <div className="relative rounded-lg p-6 bg-gradient-to-br from-primary to-accent text-primary-foreground cursor-pointer transition-transform hover:scale-[1.02] shadow-lg hover:shadow-xl overflow-hidden">
                <div className="relative z-10">
                    <div className="absolute top-0 right-0 bg-white/20 text-white text-xs font-bold py-1 px-2 rounded-full">
                        BETA
                    </div>
                    <BrainCircuit className="h-8 w-8 mb-2" />
                    <h3 className="text-xl font-bold font-headline">Modo Estudio</h3>
                    <p className="opacity-80 text-sm mb-4">Concéntrate, organiza y gana recompensas.</p>
                     <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-500/30 text-white py-0.5 px-2 rounded-full">Scanner</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/30 text-white py-0.5 px-2 rounded-full">Calculadora</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-500/30 text-white py-0.5 px-2 rounded-full">Focus</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-violet-500/30 text-white py-0.5 px-2 rounded-full">Sonidos</span>
                    </div>
                </div>
          </div>
        </Link>
      </section>

      <section className="mb-10">
        <Link href="/forum">
            <div className="relative rounded-lg p-6 bg-gradient-to-br from-teal-500 to-cyan-600 text-white cursor-pointer transition-transform hover:scale-[1.02] shadow-lg hover:shadow-xl overflow-hidden">
                <div className="relative z-10">
                    <Users className="h-8 w-8 mb-2" />
                    <h3 className="text-xl font-bold font-headline">Foro de la Comunidad</h3>
                    <p className="opacity-80 text-sm mb-4">Conecta, aprende y comparte con otros estudiantes.</p>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 py-0.5 px-2 rounded-full">Dudas</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 py-0.5 px-2 rounded-full">Apuntes</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 py-0.5 px-2 rounded-full">Recursos</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 py-0.5 px-2 rounded-full">Salud</span>
                    </div>
                </div>
            </div>
        </Link>
      </section>

      <section className="mb-10">
        <h3 className="text-xl font-semibold font-headline mb-4">{isScheduleAvailable ? upcomingClassesDay : "Próximas Clases"}</h3>
        <div className="space-y-4">
          {isScheduleAvailable ? (
            upcomingClasses.length > 0 ? (
              upcomingClasses.map((item) => (
                <ScheduleDialog 
                    key={item.id} 
                    scheduleData={userSchedule} 
                    selectedClassId={item.id}
                    userCourse={user.course}
                    userClassName={user.className}
                >
                    <Card className="overflow-hidden transition-all hover:shadow-md cursor-pointer">
                        <div className="p-4">
                            <div className="flex items-start justify-between">
                                <h4 className="font-semibold">{item.subject}</h4>
                                {item.grade && <Badge variant="secondary">{item.grade}</Badge>}
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1 mt-2">
                                <p className="flex items-center gap-1.5">
                                    {item.teacher}
                                    <span onClick={(e) => { e.stopPropagation(); }}>
                                        <TeacherInfoDialog />
                                    </span>
                                </p>
                                <p>{item.time}</p>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-sm italic text-muted-foreground line-clamp-2">{item.notes}</p>
                              <div className="flex items-center gap-2 ml-4 shrink-0">
                                <Button size="sm" variant="secondary" className="rounded-full">
                                    Ver horario
                                </Button>
                                <Button asChild size="sm" className="bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-full">
                                    <Link href="/study">
                                        <BrainCircuit className="h-4 w-4 mr-2" />
                                        Estudiar
                                    </Link>
                                </Button>
                              </div>
                            </div>
                        </div>
                    </Card>
                </ScheduleDialog>
              ))
            ) : (
               <Card>
                  <CardContent className="p-4 text-center text-muted-foreground">
                      No hay más clases programadas por hoy. ¡Disfruta de tu tarde!
                  </CardContent>
              </Card>
            )
          ) : (
             <Card>
                <CardContent className="flex flex-col items-center justify-center text-center p-8">
                  <BookX className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="font-semibold">Horario no disponible</p>
                  <p className="text-sm text-muted-foreground">
                      Actualmente, el horario solo está disponible para tu grupo si un administrador lo ha configurado.
                  </p>
                </CardContent>
            </Card>
          )}
        </div>
      </section>

      <section className="mb-4 space-y-4">
        <RankingDialog user={user} openTo="shop">
          <Card className="bg-muted/50 cursor-pointer hover:bg-muted/80 transition-colors">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                  <div className="space-y-1">
                      <CardTitle className="text-base flex items-center gap-2">
                          <ShoppingCart className="h-5 w-5 text-accent" />
                          Canjear Trofeos
                          <Badge variant="secondary">Beta</Badge>
                      </CardTitle>
                      <CardDescription className="text-xs pl-7">
                          Usa tus trofeos para conseguir recompensas.
                      </CardDescription>
                  </div>
                  <Button asChild size="sm" variant="outline">
                      <span className="flex items-center">
                        Tienda
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </span>
                  </Button>
              </CardHeader>
          </Card>
        </RankingDialog>

        <WhatsNewDialog>
          <Card className="bg-muted/50 cursor-pointer hover:bg-muted/80 transition-colors relative">
              <span className="absolute top-2 right-2 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                  <div className="space-y-1">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-primary" />
                        Novedades y Futuro
                    </CardTitle>
                    <CardDescription className="text-xs pl-7">
                        Descubre las últimas mejoras y lo que está por venir.
                    </CardDescription>
                  </div>
                  <Button asChild size="sm" variant="outline">
                      <span className="flex items-center">
                        Ver
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </span>
                  </Button>
              </CardHeader>
          </Card>
        </WhatsNewDialog>

        <Card className="bg-muted/50">
            <CardHeader className="flex-row items-center justify-between space-y-0">
                <div className="space-y-1">
                    <CardTitle className="text-base flex items-center gap-2">
                        <LifeBuoy className="h-5 w-5 text-accent" />
                        ¿Necesitas ayuda?
                        <Badge variant="secondary">Beta</Badge>
                    </CardTitle>
                    <CardDescription className="text-xs pl-7">
                        Contacta con el equipo de soporte.
                    </CardDescription>
                </div>
                <Button asChild size="sm" variant="outline">
                    <Link href="/settings">
                        Contactar
                    </Link>
                </Button>
            </CardHeader>
        </Card>
      </section>

       <section className="text-center text-muted-foreground text-xs p-4 my-4 rounded-lg bg-muted/40">
        <div className="flex items-center justify-center gap-2">
            <Monitor className="h-4 w-4" />
            <p>
                ¡Estamos trabajando en una versión de escritorio! Próximamente una nueva interfaz para pantallas horizontales.
            </p>
        </div>
      </section>
    </div>
  );
}

interface DetailsDialogProps {
    title: string;
    children: React.ReactNode;
    events: (ParsedEvent | Announcement)[];
    isLoading: boolean;
    onMarkAsComplete: (eventId: string) => void;
    cardData: SummaryCardData;
    user: User;
    updateUser: (data: Partial<User>) => void;
}

function DetailsDialog({ title, children, events, isLoading, onMarkAsComplete, cardData, user, updateUser }: DetailsDialogProps) {
    const groupedEvents = (events as ParsedEvent[]).reduce((acc, event) => {
        const dateStr = format(event.date, 'yyyy-MM-dd');
        if (!acc[dateStr]) {
            acc[dateStr] = [];
        }
        acc[dateStr].push(event);
        return acc;
    }, {} as Record<string, ParsedEvent[]>);

    const getDayLabel = (dateStr: string) => {
        const date = new Date(dateStr);
        const localDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
        
        if (isToday(localDate)) return "Hoy";
        if (isTomorrow(localDate)) return "Mañana";
        return format(localDate, "EEEE, d 'de' MMMM", { locale: es });
    };

    const HeaderIcon = cardData.icon;

    const headerColorClasses = {
        "text-blue-500": "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
        "text-red-500": "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
        "text-yellow-500": "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
        "text-green-500": "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
    };
    
    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-md w-[95vw] p-0">
                <DialogHeader className={cn("p-6 text-left flex-row items-center gap-4", headerColorClasses[cardData.color as keyof typeof headerColorClasses])}>
                    <div className="rounded-lg p-2 bg-background/50">
                        <HeaderIcon className={cn("h-6 w-6", cardData.color)} />
                    </div>
                    <div>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription className="text-current/80">
                            {`Listado de tus ${title.toLowerCase()} para las próximas 2 semanas.`}
                        </DialogDescription>
                    </div>
                </DialogHeader>
                <div className="my-4 max-h-[60vh] overflow-y-auto px-6">
                 {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                 ) : events.length > 0 ? (
                    <div className="space-y-6">
                        {Object.entries(groupedEvents).map(([dateStr, dayEvents], index) => (
                            <div key={dateStr} className="space-y-3">
                                {index > 0 && <Separator />}
                                <h3 className="text-sm font-bold text-muted-foreground px-1 pt-2">{getDayLabel(dateStr)}</h3>
                                <div className="space-y-2">
                                    {dayEvents.map(event => (
                                      <div key={event.id} className="flex items-center gap-2 group p-3 rounded-lg transition-colors border bg-card hover:bg-muted/50 hover:border-border shadow-sm">
                                        <div className="flex-1">
                                          <p className="font-semibold leading-tight">{event.title}</p>
                                          <p className="text-xs text-muted-foreground">{formatDistanceToNow(event.date, { locale: es, addSuffix: true })}</p>
                                        </div>
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                             <Button variant="ghost" className="shrink-0 text-amber-500/80 hover:text-amber-500 hover:bg-amber-500/10 transition-colors rounded-full flex items-center gap-1.5 px-3 h-9">
                                              <Trophy className="h-4 w-4" />
                                              <span className="font-bold text-sm">+1</span>
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>¿Marcar como completado?</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                Esta acción eliminará el elemento de esta lista y sumará 1 trofeo a tu perfil. También se guardará en tu historial.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                              <AlertDialogAction onClick={() => onMarkAsComplete(event.id)}>Confirmar</AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                 ) : (
                    <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[200px]">
                        <CalendarIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="font-semibold">¡Todo despejado!</p>
                        <p className="text-sm text-muted-foreground">
                           {`No tienes ${title.toLowerCase()} en las próximas dos semanas.`}
                        </p>
                    </div>
                 )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

function ScheduleDialog({ children, scheduleData, selectedClassId, userCourse, userClassName }: { children: React.ReactNode, scheduleData: Schedule | null, selectedClassId?: string, userCourse: string, userClassName: string }) {
    
    if (!scheduleData) {
        return <>{children}</>;
    }
    
    const courseMap: Record<string, string> = {
        "1eso": "1º ESO",
        "2eso": "2º ESO",
        "3eso": "3º ESO",
        "4eso": "4º ESO",
        "1bach": "1º Bachillerato",
        "2bach": "2º Bachillerato",
    };

    const formattedCourse = courseMap[userCourse] || userCourse;

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-lg w-[95vw] max-h-[80vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-2">
                    <div className="flex items-center gap-4">
                        <DialogTitle className="text-xl">Horario de Clases</DialogTitle>
                         <Badge variant="default" className="text-sm px-3 py-1">{formattedCourse} - {userClassName}</Badge>
                    </div>
                    <DialogDescription>
                        Aquí tienes tu horario para toda la semana.
                    </DialogDescription>
                </DialogHeader>
                 <FullScheduleView 
                    scheduleData={scheduleData} 
                    selectedClassId={selectedClassId}
                 />
            </DialogContent>
        </Dialog>
    );
}

    