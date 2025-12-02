
"use client";

import { useState, useEffect } from "react";
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
import { fullSchedule } from "@/lib/data";
import type { SummaryCardData, Schedule, User, ScheduleEntry, UpcomingClass, CalendarEvent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ArrowRight, Trophy, NotebookText, FileCheck2, Clock, ListChecks, LifeBuoy, BookX, Loader2, CalendarIcon, CheckCircle } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { useApp } from "@/lib/hooks/use-app";
import { Button } from "@/components/ui/button";
import { SCHOOL_NAME, SCHOOL_VERIFICATION_CODE } from "@/lib/constants";
import { Logo } from "@/components/icons";
import WelcomeModal from "@/components/layout/welcome-modal";
import { doc, updateDoc, increment } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { FullScheduleView } from "@/components/layout/full-schedule-view";
import { RankingDialog } from "@/components/layout/ranking-dialog";
import CompleteProfileModal from "@/components/layout/complete-profile-modal";
import { startOfWeek, endOfWeek, addWeeks, isWithinInterval, format, startOfToday } from 'date-fns';
import { es } from 'date-fns/locale';

type Category = "Tareas" | "Exámenes" | "Pendientes" | "Actividades";
const SCHOOL_ICAL_URL = "https://calendar.google.com/calendar/ical/iestorredelpalau.cat_9vm0113gitbs90a9l7p4c3olh4%40group.calendar.google.com/public/basic.ics";

interface ParsedEvent extends CalendarEvent {
    // an extension of the base type to ensure date is a Date object during processing
    date: Date;
}

const keywords = {
    exam: ['examen', 'exam', 'prueba', 'control', 'prova'],
    task: ['tarea', 'ejercicios', 'deberes', 'lliurament', 'fitxa', 'feina', 'deures', 'entrega', 'presentació'],
    activity: ['actividad', 'proyecto', 'sortida', 'exposició', 'projecte']
};

export default function HomePage() {
  const { user, updateUser } = useApp();
  const firestore = useFirestore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showWelcomeAfterCompletion, setShowWelcomeAfterCompletion] = useState(false);
  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([]);
  const [upcomingClassesDay, setUpcomingClassesDay] = useState<string>("Próximas Clases");
  
  const [allEvents, setAllEvents] = useState<ParsedEvent[]>([]);
  const [isLoadingVariables, setIsLoadingVariables] = useState(true);
  const [completedEventIds, setCompletedEventIds] = useState<string[]>([]);

  const isScheduleAvailable = user?.course === "4eso" && user?.className === "B";
    
  const getCategorizedEvents = (category: Category): ParsedEvent[] => {
      const today = startOfToday();
      const endOfNextWeek = endOfWeek(addWeeks(today, 1), { weekStartsOn: 1 });

      const relevantEvents = allEvents.filter(event => 
        event.date >= today &&
        isWithinInterval(event.date, { start: today, end: endOfNextWeek }) &&
        !completedEventIds.includes(event.id)
      );
      
      if (category === 'Pendientes') {
          return relevantEvents
            .filter(event => {
              const title = event.title.toLowerCase();
              // Es pendiente si es un examen o una tarea (implícitamente)
              const isExam = keywords.exam.some(kw => title.includes(kw));
              const isTask = !isExam && !keywords.activity.some(kw => title.includes(kw));
              return isExam || isTask;
            })
            .sort((a, b) => a.date.getTime() - b.date.getTime());
      }
      
      let eventKeywords: string[] = [];
      let isDefaultCategory = false;

      if (category === 'Exámenes') eventKeywords = keywords.exam;
      else if (category === 'Actividades') eventKeywords = keywords.activity;
      else if (category === 'Tareas') {
        isDefaultCategory = true;
      }
      
      return relevantEvents
        .filter(event => {
            const title = event.title.toLowerCase();
            if (isDefaultCategory) {
                // Es "Tarea" si no es ni examen ni actividad
                const isExam = keywords.exam.some(kw => title.includes(kw));
                const isActivity = keywords.activity.some(kw => title.includes(kw));
                return !isExam && !isActivity;
            }
            return eventKeywords.some(kw => title.includes(kw));
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const getCategoryCount = (category: Category): number => {
    return getCategorizedEvents(category).length;
  }
  
  const handleMarkAsComplete = (eventId: string, category: Category) => {
    if (!firestore || !user) return;
    
    setCompletedEventIds(prev => [...prev, eventId]);
    
    // Update user stats in Firestore
    const userDocRef = doc(firestore, 'users', user.uid);
    let fieldToIncrement: string | null = null;
    
    if (category === 'Tareas') {
        fieldToIncrement = 'tasks';
    } else if (category === 'Exámenes') {
        fieldToIncrement = 'exams';
    } else if (category === 'Actividades') {
        fieldToIncrement = 'activities';
    }

    if (fieldToIncrement) {
        updateDoc(userDocRef, {
            [fieldToIncrement]: increment(1),
            trophies: increment(1), // Also increment trophies
        }).catch(err => console.error("Error updating user stats:", err));
    }
  };

  // Moved parser and fetch logic inside useEffect or as standalone functions within the component
    const parseIcal = (icalData: string): ParsedEvent[] => {
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
                        
                        const eventDate = new Date(Date.UTC(year, month, day));
                        
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
    };

  useEffect(() => {
    // Only show the modal if the user is new and the state is not already open
    if (user?.isNewUser && !isModalOpen) {
      setIsModalOpen(true);
    }
  }, [user, isModalOpen]);

  useEffect(() => {
    const fetchAndCalculateVars = async () => {
        if (user?.center !== SCHOOL_VERIFICATION_CODE) {
             setIsLoadingVariables(false);
             return;
        }

        setIsLoadingVariables(true);
        try {
            const response = await fetch(`/api/calendar-proxy?url=${encodeURIComponent(SCHOOL_ICAL_URL)}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch calendar: ${response.status}`);
            }
            const icalData = await response.text();
            const parsedEvents = parseIcal(icalData);
            setAllEvents(parsedEvents);
        } catch (error) {
            console.error("Error fetching or processing calendar for variables:", error);
            setAllEvents([]);
        } finally {
            setIsLoadingVariables(false);
        }
    };
    
    fetchAndCalculateVars();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);


  useEffect(() => {
    if (!isScheduleAvailable) return;

    const getUpcomingClasses = (): { classes: UpcomingClass[], dayTitle: string } => {
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 (Sun) - 6 (Sat)
        const hour = now.getHours();
        const minute = now.getMinutes();
        const currentTime = hour * 60 + minute;

        const weekDays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        const scheduleDays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

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
        let classesForDay: ScheduleEntry[] = fullSchedule[targetDayName] || [];

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
                 classes: (fullSchedule[nextDayName] || []).slice(0, 3),
                 dayTitle: `Clases del ${nextDayName}`
             };
        }
        
        // If it's after hours on friday or weekend
        if (classesForDay.length === 0 && (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0)) {
            const nextDayName = weekDays[1] as keyof Schedule; // Monday
            return {
                classes: (fullSchedule[nextDayName] || []).slice(0, 3),
                dayTitle: `Clases del ${nextDayName}`
            };
        }

        return { classes: classesForDay.slice(0, 3), dayTitle };
    };

    const { classes, dayTitle } = getUpcomingClasses();
    setUpcomingClasses(classes);
    setUpcomingClassesDay(dayTitle);
  }, [isScheduleAvailable]);

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
    { title: 'Tareas', value: getCategoryCount('Tareas'), icon: NotebookText, color: 'text-blue-500' },
    { title: 'Exámenes', value: getCategoryCount('Exámenes'), icon: FileCheck2, color: 'text-red-500' },
    { title: 'Pendientes', value: getCategoryCount('Pendientes'), icon: Clock, color: 'text-yellow-500' },
    { title: 'Actividades', value: getCategoryCount('Actividades'), icon: ListChecks, color: 'text-green-500' },
  ];

  // Determine if profile is incomplete (for Google sign-up case)
  const isProfileIncomplete = user.isNewUser && (user.course === "default" || user.className === "default" || user.ageRange === "default");


  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6">
      
      {isProfileIncomplete && isModalOpen ? (
        <CompleteProfileModal user={user} onSave={handleProfileCompletionSave} />
      ) : showWelcomeAfterCompletion ? (
        <WelcomeModal onClose={handleWelcomeModalClose} />
      ) : null}

      <header className="mb-8 flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold font-headline tracking-tighter sm:text-3xl">
                Dynamic Class
            </h1>
            <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">V3.0 - Beta</Badge>
                {user.center === SCHOOL_VERIFICATION_CODE && (
                    <Badge>{SCHOOL_NAME}</Badge>
                )}
                {user.role === 'admin' && (
                    <Badge variant="destructive">Admin</Badge>
                )}
            </div>
        </div>
        <div className="flex items-center gap-2">
            <RankingDialog user={user}>
                 <div className="flex items-center gap-2 rounded-full border bg-card p-2 shadow-sm cursor-pointer hover:bg-muted transition-colors">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                    <span className="font-bold">{user.trophies}</span>
                </div>
            </RankingDialog>
          <ThemeToggle />
        </div>
      </header>

      <div className="mb-8 space-y-4">
        <div>
            <h2 className="text-xl font-semibold sm:text-2xl">
              ¡Bienvenido de nuevo, {getFirstName(user.name)}!
            </h2>
            <p className="text-muted-foreground">Este es tu Dynamic Panel para hoy.</p>
            <p className="text-xs text-muted-foreground/80 mt-1">{capitalizedDate}</p>
        </div>
      </div>


      <div className="mb-10 grid grid-cols-2 gap-4">
        {summaryCards.map((card) => (
          <DetailsDialog 
            key={card.title} 
            title={card.title}
            events={getCategorizedEvents(card.title as Category)}
            isLoading={isLoadingVariables}
            onMarkAsComplete={(eventId) => handleMarkAsComplete(eventId, card.title as Category)}
          >
            <Card className="hover:border-primary/50 transition-colors duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-lg cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    <card.icon className={cn("h-5 w-5 text-muted-foreground", card.color)} />
                </CardHeader>
                <CardContent>
                    {isLoadingVariables ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                        <div className="text-2xl font-bold">{card.value}</div>
                    )}
                </CardContent>
            </Card>
          </DetailsDialog>
        ))}
      </div>

      <section className="mb-10">
        <h3 className="text-xl font-semibold font-headline mb-4">{isScheduleAvailable ? upcomingClassesDay : "Próximas Clases"}</h3>
        <div className="space-y-4">
          {isScheduleAvailable ? (
            upcomingClasses.length > 0 ? (
              upcomingClasses.map((item) => (
                <ScheduleDialog 
                    key={item.id} 
                    scheduleData={fullSchedule} 
                    selectedClassId={item.id}
                    userCourse={user.course}
                    userClassName={user.className}
                >
                    <Card className="overflow-hidden transition-all hover:shadow-md cursor-pointer">
                        <div className="block hover:bg-muted/50">
                            <CardContent className="p-4">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-start justify-between">
                                        <h4 className="font-semibold">{item.subject}</h4>
                                        {item.grade && <Badge variant="secondary">{item.grade}</Badge>}
                                    </div>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                        <p>{item.teacher}</p>
                                        <p>{item.time}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                      <p className="text-sm italic text-muted-foreground line-clamp-2">{item.notes}</p>
                                      <ArrowRight className="h-5 w-5 text-primary shrink-0 ml-4" />
                                    </div>
                                </div>
                            </CardContent>
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
                      Actualmente, el horario solo está disponible para el grupo 4ºB.
                  </p>
                </CardContent>
            </Card>
          )}
        </div>
      </section>

      <section>
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
    </div>
  );
}

function DetailsDialog({ title, children, events, isLoading, onMarkAsComplete }: { title: string, children: React.ReactNode, events: ParsedEvent[], isLoading: boolean, onMarkAsComplete: (eventId: string) => void }) {
    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-md w-[95vw]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        Listado de tus {title.toLowerCase()} para las próximas 2 semanas.
                    </DialogDescription>
                </DialogHeader>
                <div className="my-4 max-h-[50vh] overflow-y-auto pr-4">
                 {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                 ) : events.length > 0 ? (
                    <div className="space-y-3">
                        {events.map(event => (
                            <div key={event.id} className="flex items-center gap-3 group">
                                <div className="flex flex-col items-center justify-center bg-muted p-2 rounded-md h-12 w-12 shrink-0">
                                    <span className="text-xs font-bold uppercase text-red-500">{format(event.date, 'MMM', { locale: es })}</span>
                                    <span className="text-lg font-bold">{format(event.date, 'dd')}</span>
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold">{event.title}</p>
                                    <p className="text-sm text-muted-foreground">{format(event.date, "EEEE, d 'de' MMMM", { locale: es })}</p>
                                </div>
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground/50 hover:text-green-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <CheckCircle className="h-5 w-5" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Marcar como completado?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta acción eliminará el elemento de esta lista y sumará 1 trofeo a tu perfil.
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
                 ) : (
                    <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                        <CalendarIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="font-semibold">¡Todo despejado!</p>
                        <p className="text-sm text-muted-foreground">
                           No tienes {title.toLowerCase()} en las próximas dos semanas.
                        </p>
                    </div>
                 )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

function ScheduleDialog({ children, scheduleData, selectedClassId, userCourse, userClassName }: { children: React.ReactNode, scheduleData: Schedule, selectedClassId?: string, userCourse: string, userClassName: string }) {
    
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

    