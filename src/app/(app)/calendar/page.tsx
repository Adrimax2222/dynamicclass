
"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, Link, AlertTriangle, Loader2, Info, Pencil } from "lucide-react";

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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useApp } from "@/lib/hooks/use-app";
import { SCHOOL_VERIFICATION_CODE } from "@/lib/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type CalendarType = "personal" | "class";

interface ParsedEvent extends AppCalendarEvent {
    // an extension of the base type to ensure date is a Date object during processing
    date: Date;
}

const SCHOOL_ICAL_URL = "https://calendar.google.com/calendar/ical/iestorredelpalau.cat_9vm0113gitbs90a9l7p4c3olh4%40group.calendar.google.com/public/basic.ics";

export default function CalendarPage() {
  const { user } = useApp();
  const [personalIcalUrl, setPersonalIcalUrl] = useState("");
  const [processedEvents, setProcessedEvents] = useState<ParsedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const [calendarType, setCalendarType] = useState<CalendarType>("personal");
  const [isPersonalCalendarConnected, setIsPersonalCalendarConnected] = useState(false);

  const userIsInCenter = user?.center === SCHOOL_VERIFICATION_CODE;

  // Load personal iCal URL from localStorage on mount
  useEffect(() => {
    const savedIcalUrl = localStorage.getItem('icalUrl');
    if (savedIcalUrl) {
      setPersonalIcalUrl(savedIcalUrl);
      setIsPersonalCalendarConnected(true);
    }
  }, []);

  // Fetch events when calendar type or user changes
  useEffect(() => {
    handleFetchEvents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarType, user, isPersonalCalendarConnected]);


  const parseIcal = (icalData: string, type: CalendarType): ParsedEvent[] => {
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
                    const description = (currentEvent.description || 'No hay descripción.').replace(/\\n/g, '\n');

                    events.push({
                        id: currentEvent.uid || Math.random().toString(),
                        title: currentEvent.summary,
                        description: description,
                        date: eventDate,
                        type: type,
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
  
  const handleFetchEvents = async () => {
      let urlToFetch: string | null = null;

      if (calendarType === 'personal') {
          urlToFetch = personalIcalUrl;
          if (!isPersonalCalendarConnected) {
             setProcessedEvents([]);
             setError(null);
             return; // Don't fetch if personal calendar is not set up
          }
      } else if (calendarType === 'class') {
          if (!userIsInCenter) {
              setError("No tienes permiso para ver el calendario del instituto.");
              setProcessedEvents([]);
              return;
          }
          urlToFetch = SCHOOL_ICAL_URL;
      }
      
      if (!urlToFetch) {
          setProcessedEvents([]);
          setError(calendarType === 'personal' ? "Introduce una URL de iCal para tu calendario personal." : null);
          return;
      }

      setIsLoading(true);
      setError(null);
      setProcessedEvents([]);

      try {
          const response = await fetch(`/api/calendar-proxy?url=${encodeURIComponent(urlToFetch)}`);
          if (!response.ok) {
               const errorData = await response.json();
               throw new Error(errorData.error || `No se pudo obtener el calendario. Código de estado: ${response.status}`);
          }
          const icalData = await response.text();
          const parsed = parseIcal(icalData, calendarType);
          
          if (parsed.length === 0) {
            setError("No se encontraron eventos o el formato no es compatible. Si es un calendario personal, asegúrate de que la URL de iCal sea 'pública'.");
          } else {
            setProcessedEvents(parsed);
            if (calendarType === 'personal') {
              setIsPersonalCalendarConnected(true);
              localStorage.setItem('icalUrl', urlToFetch);
            }
          }

      } catch (err: any) {
          console.error("Error al obtener el iCal:", err);
          setError(err.message || "No se pudo cargar el calendario. Verifica la URL y su configuración de privacidad.");
          if(calendarType === 'personal') {
            setIsPersonalCalendarConnected(false);
            localStorage.removeItem('icalUrl');
          }
      } finally {
          setIsLoading(false);
      }
  };

  const handlePersonalCalendarConnect = () => {
    // This is just a wrapper for handleFetchEvents for the button
    handleFetchEvents();
  }

  const handleDisconnectPersonalCalendar = () => {
    localStorage.removeItem('icalUrl');
    setIsPersonalCalendarConnected(false);
    setPersonalIcalUrl("");
    setProcessedEvents([]);
    setError(null);
  };

  const eventsOnSelectedDate = processedEvents.filter(
    (event) => date && format(event.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
  );

  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6">
      <header className="mb-8 flex flex-col items-start gap-4">
        <div>
            <h1 className="text-2xl font-bold font-headline tracking-tighter sm:text-3xl">
                Dynamic Calendar
            </h1>
            <p className="text-muted-foreground">Gestiona tus eventos personales y de clase.</p>
        </div>
         <div className="w-full flex items-center gap-2">
          <Select onValueChange={(value: CalendarType) => setCalendarType(value)} defaultValue="personal">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar calendario" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="personal">Calendario Personal</SelectItem>
              <SelectItem value="class" disabled={!userIsInCenter}>
                Calendario del Instituto
              </SelectItem>
            </SelectContent>
          </Select>
          {calendarType === 'personal' && isPersonalCalendarConnected && (
              <Button variant="outline" size="icon" onClick={handleDisconnectPersonalCalendar} aria-label="Cambiar URL del calendario">
                  <Pencil className="h-4 w-4" />
              </Button>
          )}
        </div>
        {!userIsInCenter && calendarType === 'class' && (
            <p className="text-xs text-muted-foreground -mt-2">
              Únete al grupo de tu centro para ver su calendario.
            </p>
        )}
      </header>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-64">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="mt-4 font-semibold">Cargando eventos...</p>
        </div>
      ) : calendarType === 'personal' && !isPersonalCalendarConnected ? (
        <Card className="p-6">
            <CardHeader className="text-center p-0 pb-6">
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                    <CalendarIcon className="h-10 w-10 text-primary" />
                </div>
                <CardTitle>Sincroniza tu Calendario Personal</CardTitle>
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
                        value={personalIcalUrl}
                        onChange={(e) => setPersonalIcalUrl(e.target.value)}
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

                <Button onClick={handlePersonalCalendarConnect} disabled={isLoading || !personalIcalUrl} className="w-full">
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
                {eventsOnSelectedDate.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                    {eventsOnSelectedDate.map((event) => (
                        <AccordionItem value={event.id} key={event.id}>
                            <AccordionTrigger>
                                <div className="flex flex-col items-start text-left">
                                    <p className="font-semibold">{event.title}</p>
                                     <Badge variant={event.type === 'class' ? 'secondary' : 'default'} className="mt-1.5">
                                        {event.type === 'class' ? 'Instituto' : 'Personal'}
                                    </Badge>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{event.description}</p>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                    </Accordion>
                ) : (
                    <div className="flex h-full flex-col items-center justify-center text-center p-8">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-muted-foreground">No hay eventos para este día.</p>
                    {error && (
                         <Alert variant="destructive" className="mt-4 max-w-sm text-left">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
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


    