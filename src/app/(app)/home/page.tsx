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

export default function HomePage() {
  const { user } = useApp();

  if (!user) {
    return null; // Or a loading spinner
  }

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
          <Badge variant="outline">V3.0</Badge>
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
              ¡Bienvenido de nuevo, {user.name}!
            </h2>
            <p className="text-muted-foreground">Este es tu Dynamic Panel para hoy.</p>
        </div>

        <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
            <CardHeader className="flex-row items-center gap-4 space-y-0 p-4">
                <LifeBuoy className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                <div className="flex-1">
                    <CardTitle className="text-base font-semibold">¿Necesitas ayuda?</CardTitle>
                    <CardDescription className="text-sm">Si encuentras algún error, no dudes en contactarnos.</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <Button className="w-full" asChild>
                    <Link href="/settings">
                        Ir a Soporte
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
      </div>


      <div className="mb-10 grid grid-cols-2 gap-4">
        {summaryCards.map((card) => (
          <SummaryCard key={card.title} {...card} />
        ))}
      </div>

      <section>
        <h3 className="text-xl font-semibold font-headline mb-4">Próximas Clases</h3>
        <div className="space-y-4">
          {upcomingClasses.map((item) => (
            <UpcomingClassCard key={item.id} {...item} />
          ))}
        </div>
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
