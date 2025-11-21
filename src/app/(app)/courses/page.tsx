
"use client"

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Megaphone } from "lucide-react";

export default function AnnouncementsPage() {
  // Simulación de un usuario administrador. En una app real, esto vendría del estado de autenticación.
  const isAdmin = true; 

  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold font-headline tracking-tighter sm:text-3xl flex items-center gap-2">
          <Megaphone className="h-6 w-6"/>
          Punto de Información
        </h1>
        <p className="text-muted-foreground">
          Anuncios y actualizaciones importantes del centro.
        </p>
      </header>

      <Card className="h-[calc(100vh-16rem)]">
        <CardHeader>
          <CardTitle>Últimos Anuncios</CardTitle>
          <CardDescription>Solo los administradores pueden publicar aquí.</CardDescription>
        </CardHeader>
        <CardContent className="h-full flex flex-col">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6">
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
            </div>
          </ScrollArea>
          {isAdmin && (
            <div className="mt-4 flex w-full items-center space-x-2 pt-4 border-t">
              <Input placeholder="Escribir un nuevo anuncio..." />
              <Button aria-label="Enviar anuncio"><Send className="h-4 w-4" /></Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Announcement({ user, text, avatarSeed, timestamp }: { user: string, text: string, avatarSeed: string, timestamp: string }) {
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
