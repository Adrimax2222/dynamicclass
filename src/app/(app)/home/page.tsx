
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
import { upcomingClasses, fullSchedule } from "@/lib/data";
import type { SummaryCardData, Schedule, User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ArrowRight, Trophy, NotebookText, FileCheck2, Clock, ListChecks, LifeBuoy } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { useApp } from "@/lib/hooks/use-app";
import { Button } from "@/components/ui/button";
import { SCHOOL_NAME, SCHOOL_VERIFICATION_CODE } from "@/lib/constants";
import { Logo } from "@/components/icons";
import WelcomeModal from "@/components/layout/welcome-modal";
import { doc, updateDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { FullScheduleView } from "@/components/layout/full-schedule-view";
import { RankingDialog } from "@/components/layout/ranking-dialog";
import CompleteProfileModal from "@/components/layout/complete-profile-modal";

type Category = "Tareas" | "Exámenes" | "Pendientes" | "Actividades";

export default function HomePage() {
  const { user, updateUser } = useApp();
  const firestore = useFirestore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showWelcomeAfterCompletion, setShowWelcomeAfterCompletion] = useState(false);

  useEffect(() => {
    // Only show the modal if the user is new and the state is not already open
    if (user?.isNewUser && !isModalOpen) {
      setIsModalOpen(true);
    }
  }, [user, isModalOpen]);

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
    { title: 'Tareas', value: user.tasks, icon: NotebookText, color: 'text-blue-500' },
    { title: 'Exámenes', value: user.exams, icon: FileCheck2, color: 'text-red-500' },
    { title: 'Pendientes', value: user.pending, icon: Clock, color: 'text-yellow-500' },
    { title: 'Actividades', value: user.activities, icon: ListChecks, color: 'text-green-500' },
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

    
