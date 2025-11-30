
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, Link, AlertTriangle, Loader2 } from "lucide-react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CalendarEvent as AppCalendarEvent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/hooks/use-app";
import { useAuth } from "@/firebase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface GoogleCalendarEvent {
    id: string;
    summary: string;
    description?: string;
    start: { dateTime?: string; date?: string; };
    end: { dateTime?: string; date?: string; };
}

export default function CalendarPage() {
  const { user } = useApp();
  const auth = useAuth();
  const [processedEvents, setProcessedEvents] = useState<AppCalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());

  const getUpcomingEvents = async (accessToken: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
        const timeMin = new Date().toISOString(); 
        const timeMax = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString();

        const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/primary/events`);
        url.searchParams.append('timeMin', timeMin);
        url.searchParams.append('timeMax', timeMax);
        url.searchParams.append('maxResults', '250');
        url.searchParams.append('singleEvents', 'true');
        url.searchParams.append('orderBy', 'startTime');

        const response = await fetch(url.toString(), {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: No se pudieron obtener los eventos del calendario principal.`);
        }

        const data = await response.json();
        const googleEvents: GoogleCalendarEvent[] = data.items || [];

        const appEvents: AppCalendarEvent[] = googleEvents.map(e => ({
            id: e.id,
            title: e.summary,
            description: e.description || 'Sin descripción',
            date: new Date(e.start.dateTime || e.start.date || new Date()),
            type: 'personal' as const,
        }));
        
        setProcessedEvents(appEvents);
        setIsConnected(true);

    } catch (err: any) {
        console.error("Error al obtener eventos del calendario:", err);
        setError("No se pudieron cargar los eventos del calendario. Es posible que el permiso sea inválido o haya caducado.");
        setIsConnected(false);
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleAuthClick = async () => {
    if (!auth) {
        setError("El servicio de autenticación no está disponible.");
        return;
    }

    setIsLoading(true);
    setError(null);

    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/calendar.readonly');
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        
        if (!credential?.accessToken) {
            throw new Error("No se pudo obtener el token de acceso de Google.");
        }
        
        const token = credential.accessToken;
        await getUpcomingEvents(token);

    } catch (error: any) {
        console.error("Error durante la autenticación con Google:", error);
        if (error.code === 'auth/popup-closed-by-user') {
            setError("Se ha cancelado la conexión con Google Calendar.");
        } else {
            setError(`Error de autenticación: ${error.message || 'No se ha podido conectar con Google Calendar.'}`);
        }
        setIsConnected(false);
        setIsLoading(false);
    }
  };

  const eventsOnSelectedDate = processedEvents.filter(
    (event) => date && format(event.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
  );

  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6">
      <header className="mb-8 flex flex-col items-start gap-4">
        <div>
            <h1 className="text-2xl font-bold font-headline tracking-tighter sm:text-3xl">
                Calendario Personal
            </h1>
            <p className="text-muted-foreground">Gestiona tus eventos de Google Calendar.</p>
        </div>
      </header>

      {!isConnected ? (
        <Card className="text-center p-8">
            <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                    <CalendarIcon className="h-10 w-10 text-primary" />
                </div>
                <CardTitle>Sincroniza tu Calendario</CardTitle>
                <CardContent className="text-sm text-muted-foreground pt-2">
                    Conecta tu cuenta de Google para ver tus eventos personales directamente aquí.
                </CardContent>
            </CardHeader>
             {error && (
                <Alert variant="destructive" className="mb-4 text-left">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error de Conexión</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <Button onClick={handleAuthClick} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Link className="mr-2 h-4 w-4" />}
                Conectar con Google Calendar
            </Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-8">
            <div>
            <Card>
                <CardContent className="p-0">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="w-full"
                    locale={es}
                    modifiers={{
                      hasEvent: processedEvents.map((event) => new Date(event.date)),
                    }}
                    modifiersClassNames={{
                      hasEvent: "bg-primary/20 rounded-full",
                    }}
                />
                </CardContent>
            </Card>
            </div>

            <div>
            <h2 className="mb-4 text-lg font-semibold">
                Eventos del {date ? format(date, "d 'de' MMMM", {locale: es}) : "día seleccionado"}
            </h2>
            <Card className="min-h-[200px]">
                <CardContent className="p-4">
                {isLoading ? <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div> : 
                eventsOnSelectedDate.length > 0 ? (
                    <ul className="space-y-3">
                    {eventsOnSelectedDate.map((event) => (
                        <li key={event.id} className="rounded-lg border bg-background p-3">
                            <p className="font-semibold">{event.title}</p>
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                            <span className={cn("mt-2 inline-block px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800")}>Personal</span>
                        </li>
                    ))}
                    </ul>
                ) : (
                    <div className="flex h-full flex-col items-center justify-center text-center p-8">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-muted-foreground">No hay eventos para este día.</p>
                    </div>
                )}
                </CardContent>
            </Card>
            </div>
        </div>
      )}
    </div>
  );
}
