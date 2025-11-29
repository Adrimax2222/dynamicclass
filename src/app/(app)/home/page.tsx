
"use client";

import { useState, useEffect, useRef } from "react";
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
import { upcomingClasses, fullSchedule } from "@/lib/data";
import type { SummaryCardData, Schedule, ScheduleEntry, User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ArrowRight, Trophy, NotebookText, FileCheck2, Clock, ListChecks, LifeBuoy, BookOpen, Building, User as UserIcon, Info, ShieldAlert, Medal, Gem } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { useApp } from "@/lib/hooks/use-app";
import { Button } from "@/components/ui/button";
import { SCHOOL_NAME, SCHOOL_VERIFICATION_CODE } from "@/lib/constants";
import { Logo } from "@/components/icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import WelcomeModal from "@/components/layout/welcome-modal";
import { doc, updateDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { FullScheduleView } from "@/components/layout/full-schedule-view";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

type Category = "Tareas" | "Exámenes" | "Pendientes" | "Actividades";

export default function HomePage() {
  const { user, updateUser } = useApp();
  const firestore = useFirestore();
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);

  useEffect(() => {
    // Only show the modal if the user is new and the state is not already open
    if (user?.isNewUser && !isWelcomeModalOpen) {
      setIsWelcomeModalOpen(true);
    }
  }, [user, isWelcomeModalOpen]);

  const handleCloseWelcomeModal = async () => {
    if (user && firestore) {
        const userDocRef = doc(firestore, 'users', user.uid);
        try {
            await updateDoc(userDocRef, { isNewUser: false });
            updateUser({ isNewUser: false }); // Update local context
            setIsWelcomeModalOpen(false);
        } catch (error) {
            console.error("Failed to update isNewUser flag:", error);
            // Even if the update fails, close the modal for a better user experience
            setIsWelcomeModalOpen(false);
        }
    } else {
        setIsWelcomeModalOpen(false);
    }
  };
  
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
    { title: 'Tareas', value: user.tasks, icon: NotebookText, color: 'text-blue-500' },
    { title: 'Exámenes', value: user.exams, icon: FileCheck2, color: 'text-red-500' },
    { title: 'Pendientes', value: user.pending, icon: Clock, color: 'text-yellow-500' },
    { title: 'Actividades', value: user.activities, icon: ListChecks, color: 'text-green-500' },
  ];

  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6">
      
      {isWelcomeModalOpen && <WelcomeModal onClose={handleCloseWelcomeModal} />}

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
          <DetailsDialog key={card.title} title={card.title}>
            <Card className="hover:border-primary/50 transition-colors duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-lg cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    <card.icon className={cn("h-5 w-5 text-muted-foreground", card.color)} />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{card.value}</div>
                </CardContent>
            </Card>
          </DetailsDialog>
        ))}
      </div>

      <section className="mb-10">
        <h3 className="text-xl font-semibold font-headline mb-4">Próximas Clases</h3>
        <div className="space-y-4">
          {upcomingClasses.map((item) => (
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
          ))}
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

function DetailsDialog({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        Aquí verás el listado de tus {title.toLowerCase()}.
                    </DialogDescription>
                </DialogHeader>
                 <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg my-4">
                    <Logo className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="font-semibold">Próximamente</p>
                    <p className="text-sm text-muted-foreground">
                       Esta sección está en construcción.
                    </p>
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

function RankingDialog({ children, user }: { children: React.ReactNode; user: User }) {
    const [isOpen, setIsOpen] = useState(false);
    const firestore = useFirestore();
    const [ranking, setRanking] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isInSchoolGroup = user.center === SCHOOL_VERIFICATION_CODE;

    const fetchRanking = async () => {
        // Temporarily disable ranking and show error message
        setError("Debes estar en el grupo del centro para ver el ranking. Añade el código de centro en tu perfil.");
        return;

        /*
        if (!isInSchoolGroup) {
            setError("Debes estar en el grupo del centro para ver el ranking. Añade el código de centro en tu perfil.");
            return;
        }

        if (!firestore) return;
        setIsLoading(true);
        setError(null);
        try {
            const usersRef = collection(firestore, "users");
            const q = query(usersRef, where("center", "==", SCHOOL_VERIFICATION_CODE), orderBy("trophies", "desc"));
            const querySnapshot = await getDocs(q);
            const usersList = querySnapshot.docs.map(doc => doc.data() as User);
            setRanking(usersList);
        } catch (err) {
            console.error(err);
            setError("No se pudo cargar el ranking. Inténtalo de nuevo.");
        } finally {
            setIsLoading(false);
        }
        */
    };

    useEffect(() => {
        if (isOpen) {
            fetchRanking();
        }
    }, [isOpen]);

    const top3 = ranking.slice(0, 3);
    const rest = ranking.slice(3);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-md w-[95vw]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Trophy className="text-yellow-400" />
                        Ranking de Trofeos
                    </DialogTitle>
                    <DialogDescription>
                        Clasificación de {SCHOOL_NAME}
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto pr-4">
                    {isLoading && (
                        <div className="space-y-4">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    )}
                    {error && (
                         <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg my-4 bg-destructive/10 border-destructive/50">
                            <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
                            <p className="font-semibold text-destructive">Acceso Denegado</p>
                            <p className="text-sm text-destructive/80">
                               {error}
                            </p>
                        </div>
                    )}
                    {!isLoading && !error && (
                        <div>
                             {/* Podium */}
                            <div className="grid grid-cols-3 gap-2 text-center mb-8 items-end">
                                <PodiumPlace user={top3[1]} place={2} />
                                <PodiumPlace user={top3[0]} place={1} />
                                <PodiumPlace user={top3[2]} place={3} />
                            </div>

                            {/* Rest of the list */}
                            <div className="space-y-2">
                                {rest.map((rankedUser, index) => (
                                    <RankingItem key={rankedUser.uid} user={rankedUser} rank={index + 4} isCurrentUser={rankedUser.uid === user.uid} />
                                ))}
                            </div>

                            {ranking.length === 0 && (
                                <p className="text-muted-foreground text-center p-8">Nadie tiene trofeos todavía. ¡Sé el primero!</p>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function PodiumPlace({ user, place }: { user?: User; place: 1 | 2 | 3 }) {
    if (!user) return <div />;

    const placeStyles = {
        1: { icon: Gem, color: "text-amber-400", size: "h-32 w-32", text: "text-4xl", shadow: "shadow-amber-400/50" },
        2: { icon: Medal, color: "text-slate-400", size: "h-24 w-24", text: "text-3xl", shadow: "shadow-slate-400/50" },
        3: { icon: Medal, color: "text-orange-600", size: "h-20 w-20", text: "text-2xl", shadow: "shadow-orange-600/40" },
    };

    const style = placeStyles[place];
    const Icon = style.icon;

    return (
        <div className={cn("flex flex-col items-center gap-1", place === 1 ? "-mt-4" : "")}>
            <div className="relative">
                <Avatar className={cn(style.size, "ring-4 ring-offset-2 ring-offset-background", `ring-${style.color.replace('text-','').replace('-400','')}`)}>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className={cn("absolute -bottom-3 -right-2 rounded-full bg-background p-1 shadow-lg", style.shadow)}>
                     <Icon className={cn("h-6 w-6", style.color)} />
                </div>
            </div>
            <p className="font-bold text-sm truncate w-full">{user.name.split(' ')[0]}</p>
            <div className="flex items-center gap-1">
                 <Trophy className="h-4 w-4 text-yellow-400" />
                <span className="font-bold text-lg">{user.trophies}</span>
            </div>
        </div>
    );
}


function RankingItem({ user, rank, isCurrentUser }: { user: User; rank: number; isCurrentUser: boolean }) {
    return (
        <div className={cn("flex items-center gap-4 rounded-lg p-3", isCurrentUser ? "bg-primary/10 border border-primary/50" : "bg-muted/50")}>
            <div className="text-lg font-bold text-muted-foreground w-6 text-center">{rank}</div>
            <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <p className="flex-1 font-medium truncate">{user.name}</p>
            <div className="flex items-center gap-1.5 font-bold">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span>{user.trophies}</span>
            </div>
        </div>
    );
}
