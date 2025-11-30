
"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, Link, AlertTriangle, Loader2, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CalendarEvent as AppCalendarEvent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/hooks/use-app";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ParsedEvent {
    id: string;
    title: string;
    description: string;
    date: Date;
    type: 'personal';
}

export default function CalendarPage() {
  const [icalUrl, setIcalUrl] = useState("https://calendar.google.com/calendar/ical/adrimax.dev%40gmail.com/public/basic.ics");
  const [processedEvents, setProcessedEvents] = useState<AppCalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());

  const parseIcal = (icalData: string): ParsedEvent[] => {
      const events: ParsedEvent[] = [];
      const lines = icalData.split(/\r\n|\n|\r/);
      let currentEvent: Partial<ParsedEvent> & { dtstart?: string, uid?: string } = {};

      for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.startsWith('BEGIN:VEVENT')) {
              currentEvent = { type: 'personal' };
          } else if (line.startsWith('END:VEVENT')) {
              if (currentEvent.dtstart && currentEvent.title) {
                  const dateStr = currentEvent.dtstart.split(':')[1] || '';
                  const year = dateStr.substring(0, 4);
                  const month = dateStr.substring(4, 6);
                  const day = dateStr.substring(6, 8);
                  
                  currentEvent.date = new Date(`${year}-${month}-${day}T00:00:00`);
                  currentEvent.id = currentEvent.uid || Math.random().toString();
                  events.push(currentEvent as ParsedEvent);
              }
          } else if (currentEvent) {
              const [key, ...valueParts] = line.split(':');
              const value = valueParts.join(':');
              if (key.startsWith('DTSTART')) currentEvent.dtstart = line;
              if (key === 'SUMMARY') currentEvent.title = value;
              if (key === 'DESCRIPTION') currentEvent.description = value;
              if (key === 'UID') currentEvent.uid = value;
          }
      }
      return events;
  };
  
  const handleFetchEvents = async () => {
      if (!icalUrl) {
          setError("Por favor, introduce una URL de iCal.");
          return;
      }
      setIsLoading(true);
      setError(null);

      try {
          // Use CORS proxy to bypass browser restrictions
          const response = await fetch(`https://cors-anywhere.herokuapp.com/${icalUrl}`);
          if (!response.ok) {
              throw new Error(`No se pudo obtener el calendario. Código de estado: ${response.status}`);
          }
          const icalData = await response.text();
          const parsed = parseIcal(icalData);
          
          if (parsed.length === 0) {
            setError("No se encontraron eventos en la URL proporcionada o el formato no es compatible. Asegúrate de que es una URL de iCal 'pública'.");
          } else {
            setProcessedEvents(parsed);
            setIsConnected(true);
          }

      } catch (err: any) {
          console.error("Error al obtener el iCal:", err);
          setError("No se pudo cargar el calendario. Verifica la URL y que sea accesible públicamente. A veces, las redes bloquean el acceso.");
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
    // Automatically fetch events when the component mounts with the pre-filled URL.
    handleFetchEvents();
  }, []); // The empty dependency array ensures this runs only once on mount.

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

      {!isConnected && !isLoading ? (
        <Card className="p-6">
            <CardHeader className="text-center p-0 pb-6">
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                    <CalendarIcon className="h-10 w-10 text-primary" />
                </div>
                <CardTitle>Sincroniza tu Calendario</CardTitle>
                <CardDescription>
                    Pega la dirección URL pública de tu Google Calendar.
                </CardDescription>
            </CardHeader>
             
            <div className="space-y-4">
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>¿Cómo obtener la URL?</AlertTitle>
                    <AlertDescription className="text-xs space-y-1">
                       <p>1. En Google Calendar (web), ve a <strong>Configuración</strong> del calendario que quieres compartir.</p>
                       <p>2. En <strong>Permisos de acceso a los eventos</strong>, marca <strong>"Poner a disposición del público"</strong>.</p>
                       <p>3. En <strong>Integrar el calendario</strong>, copia la <strong>"Dirección URL pública en formato iCal"</strong>.</p>
                    </AlertDescription>
                </Alert>

                <div className="space-y-2">
                    <Input 
                        value={icalUrl}
                        onChange={(e) => setIcalUrl(e.target.value)}
                        placeholder="Pega aquí la URL de iCal..."
                    />
                </div>
                
                 {error && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error de Conexión</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Button onClick={handleFetchEvents} disabled={isLoading} className="w-full">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Link className="mr-2 h-4 w-4" />}
                    Cargar Eventos del Calendario
                </Button>
            </div>
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
    
