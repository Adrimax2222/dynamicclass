"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { achievements } from "@/lib/data";
import type { SummaryCardData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Edit, Settings } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/lib/hooks/use-app";

export default function ProfilePage() {
  const { user } = useApp();

  if (!user) {
    return null; // Or a loading spinner
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold font-headline tracking-tighter sm:text-3xl">
          Mi Perfil
        </h1>
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings" aria-label="Ajustes">
            <Settings />
          </Link>
        </Button>
      </header>

      <Card className="mb-8 overflow-hidden shadow-lg">
        <div className="bg-muted/40 h-24" />
        <CardContent className="p-4 text-center -mt-16">
          <Avatar className="mx-auto h-24 w-24 ring-4 ring-background">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <h2 className="mt-4 text-2xl font-bold">{user.name}</h2>
          <p className="text-muted-foreground">{user.center}</p>
          <Button variant="outline" size="sm" className="mt-4">
            <Edit className="h-4 w-4 mr-2" />
            Editar Perfil
          </Button>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardHeader>
            <CardTitle className="text-base">Detalles</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
             <div>
                <p className="font-bold">{user.role === 'student' ? 'Estudiante' : 'Profesor'}</p>
                <p className="text-muted-foreground">Rol</p>
            </div>
            <div>
                <p className="font-bold">{user.ageRange}</p>
                <p className="text-muted-foreground">Edad</p>
            </div>
            <div className="col-span-2">
                 <p className="font-bold break-words">{user.email}</p>
                <p className="text-muted-foreground">Correo Electrónico</p>
            </div>
        </CardContent>
      </Card>
      
      <section>
        <h3 className="text-xl font-semibold font-headline mb-4">Logros</h3>
        <div className="grid grid-cols-2 gap-4">
            {achievements.map(card => (
                <AchievementCard key={card.title} {...card} />
            ))}
        </div>
      </section>
    </div>
  );
}

function AchievementCard({ title, value, icon: Icon, color }: SummaryCardData) {
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
