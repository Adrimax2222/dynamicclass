"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { upcomingClasses } from "@/lib/data";
import type { SummaryCardData, UpcomingClass } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ArrowRight, Trophy, NotebookText, FileCheck2, Clock, ListChecks, LifeBuoy } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { useApp } from "@/lib/hooks/use-app";
import { Button } from "@/components/ui/button";
import { SCHOOL_NAME } from "@/lib/constants";

export default function HomePage() {
  const { user } = useApp();

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
            <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold font-headline tracking-tighter sm:text-3xl">
                    Dynamic Class
                </h1>
                {user.center === SCHOOL_NAME && (
                    <Badge>Ins Torre del Palau</Badge>
                )}
            </div>
          <Badge variant="outline">V3.0 - Beta</Badge>
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
          <SummaryCard key={card.title} {...card} />
        ))}
      </div>

      <section className="mb-10">
        <h3 className="text-xl font-semibold font-headline mb-4">Próximas Clases</h3>
        <div className="space-y-4">
          {upcomingClasses.map((item) => (
            <UpcomingClassCard key={item.id} {...item} />
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

function SummaryCard({ title, value, icon: Icon, color }: SummaryCardData) {
  return (
    <Card className="hover:border-primary/50 transition-colors duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-5 w-5 text-muted-foreground", color)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function UpcomingClassCard(item: UpcomingClass) {
    return (
        <Card className="overflow-hidden transition-all hover:shadow-md">
            <Link href="#" className="block hover:bg-muted/50">
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
            </Link>
        </Card>
    )
}
