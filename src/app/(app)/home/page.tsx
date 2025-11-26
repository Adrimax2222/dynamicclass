
"use client";

import { useState } from "react";
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
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { upcomingClasses, fullSchedule } from "@/lib/data";
import type { SummaryCardData, UpcomingClass, Schedule, ScheduleEntry } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ArrowRight, Trophy, NotebookText, FileCheck2, Clock, ListChecks, LifeBuoy, BookOpen, Building, User, Info } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { useApp } from "@/lib/hooks/use-app";
import { Button } from "@/components/ui/button";
import { SCHOOL_NAME } from "@/lib/constants";
import { Logo } from "@/components/icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";


type Category = "Tareas" | "Exámenes" | "Pendientes" | "Actividades";

export default function HomePage() {
  const { user } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

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
      <header className="mb-8 flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold font-headline tracking-tighter sm:text-3xl">
                Dynamic Class
            </h1>
            <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">V3.0 - Beta</Badge>
                {user.center === SCHOOL_NAME && (
                    <Badge>Ins Torre del Palau</Badge>
                )}
            </div>
        </div>
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border bg-card p-2 shadow-sm">
                <Trophy className="h-5 w-5 text-yellow-400" />
                <span className="font-bold">{user.trophies}</span>
            </div>
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
            <DialogTrigger asChild>
                <Card className="hover:border-primary/50 transition-colors duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-lg cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                        <card.icon className={cn("h-5 w-5 text-muted-foreground", card.color)} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{card.value}</div>
                    </CardContent>
                </Card>
            </DialogTrigger>
          </DetailsDialog>
        ))}
      </div>

      <section className="mb-10">
        <h3 className="text-xl font-semibold font-headline mb-4">Próximas Clases</h3>
        <div className="space-y-4">
          {upcomingClasses.map((item) => (
             <ScheduleDialog key={item.id} scheduleData={fullSchedule} selectedClassId={item.id}>
                <DialogTrigger asChild>
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
                </DialogTrigger>
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
            {children}
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

function ScheduleDialog({ children, scheduleData, selectedClassId }: { children: React.ReactNode, scheduleData: Schedule, selectedClassId: string }) {
    const today = new Date().toLocaleString('es-ES', { weekday: 'long' });
    const capitalizedToday = today.charAt(0).toUpperCase() + today.slice(1);
    
    // Find which day the selected class is on to set the default tab
    const findDefaultTab = () => {
        for (const day in scheduleData) {
            if (scheduleData[day as keyof Schedule].some(entry => entry.id === selectedClassId)) {
                return day;
            }
        }
        return capitalizedToday; // Fallback to today
    }
    const defaultTab = findDefaultTab();

    return (
        <Dialog>
            {children}
            <DialogContent className="max-w-lg w-[95vw] max-h-[80vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-xl">Horario de Clases</DialogTitle>
                    <DialogDescription>
                        Aquí tienes tu horario para toda la semana.
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue={defaultTab} className="w-full flex-1 flex flex-col min-h-0">
                    <div className="px-6">
                        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 h-auto">
                            {Object.keys(scheduleData).map(day => (
                                <TabsTrigger key={day} value={day} className="py-2 text-xs sm:text-sm">{day}</TabsTrigger>
                            ))}
                        </TabsList>
                    </div>
                    <ScrollArea className="flex-1 px-6 py-4">
                        {Object.entries(scheduleData).map(([day, entries]) => (
                            <TabsContent key={day} value={day}>
                                <Accordion type="single" collapsible defaultValue={`item-${selectedClassId}`}>
                                    {entries.map(entry => (
                                        <AccordionItem key={entry.id} value={`item-${entry.id}`} className={cn(entry.id === selectedClassId && 'border-primary')}>
                                            <AccordionTrigger className="hover:no-underline">
                                                <div className="flex-1 text-left">
                                                    <p className="font-bold">{entry.subject}</p>
                                                    <p className="text-sm text-muted-foreground">{entry.time}</p>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    <span>{entry.teacher}</span>
                                                </div>
                                                 <div className="flex items-center gap-2 text-sm">
                                                    <Building className="h-4 w-4 text-muted-foreground" />
                                                    <span>{entry.room}</span>
                                                </div>
                                                {entry.details && (
                                                    <div className="flex items-start gap-2 text-sm pt-2">
                                                        <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                        <p className="italic">{entry.details}</p>
                                                    </div>
                                                )}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </TabsContent>
                        ))}
                    </ScrollArea>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
