
"use client";

import { useState, useEffect, useMemo } from "react";
import { format, startOfToday, addDays, isWithinInterval, endOfDay, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, Link as LinkIcon, AlertTriangle, Loader2, Info, Pencil, BrainCircuit, MailCheck, Trophy, Flame, TreePine, Clock, FileCheck2, NotebookText, Star, RefreshCw, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { CalendarEvent as AppCalendarEvent, Center, User, CompletedItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useApp } from "@/lib/hooks/use-app";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Separator } from "@/components/ui/separator";

type CalendarType = "personal" | "class";

interface ParsedEvent extends AppCalendarEvent {
    // an extension of the base type to ensure date is a Date object during processing
    date: Date;
}

interface SummaryData {
    tasksCompletedLast5Days: number;
    examsCompletedLast5Days: number;
    trophiesGainedLast5Days: number;
    studyMinutes: number;
    streak: number;
    plantCount: number;
    overallAverage: number;
    upcomingEvents: ParsedEvent[];
    pastEvents: ParsedEvent[];
    generationDate: string;
}

export default function CalendarPage() {
  const { user } = useApp();
  const firestore = useFirestore();
  const [personalIcalUrl, setPersonalIcalUrl] = useState("");
  const [processedEvents, setProcessedEvents] = useState<ParsedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summary, setSummary] = useState<SummaryData | null>(null);

  const userIsInCenter = user?.center && user.center !== 'personal';
  
  // Logic to get the class iCal URL
  const [classIcalUrl, setClassIcalUrl] = useState<string | null>(null);
  const [isClassIcalLoading, setIsClassIcalLoading] = useState(true);

  useEffect(() => {
    const fetchClassIcal = async () => {
      if (!firestore || !user || !userIsInCenter) {
        setIsClassIcalLoading(false);
        return;
      }
      try {
        setIsClassIcalLoading(true);
        const centersQuery = query(collection(firestore, 'centers'), where('code', '==', user.center));
        const centerSnapshot = await getDocs(centersQuery);

        if (!centerSnapshot.empty) {
            const centerDoc = centerSnapshot.docs[0];
            const centerData = centerDoc.data() as Center;
            
            // Standardize the class name format to match what the admin creates
            const userClassNameStandard = `${user.course.replace('eso','ESO')}-${user.className}`;
            
            const userClass = centerData.classes.find(c => c.name === userClassNameStandard);
            if (userClass && userClass.icalUrl) {
                setClassIcalUrl(userClass.icalUrl);
            } else {
                setClassIcalUrl(null);
            }
        } else {
             setClassIcalUrl(null);
        }
      } catch (e) {
        console.error("Error fetching class iCal URL:", e);
        setClassIcalUrl(null);
      } finally {
        setIsClassIcalLoading(false);
      }
    };
    fetchClassIcal();
  }, [firestore, user, userIsInCenter]);

  const isClassCalendarAvailable = !!classIcalUrl;
  
  const [calendarType, setCalendarType] = useState<CalendarType>("personal");
  const [isPersonalCalendarConnected, setIsPersonalCalendarConnected] = useState(false);

  // Set default calendar type once we know if the class calendar is available
  useEffect(() => {
    if (!isClassIcalLoading) {
      if (isClassCalendarAvailable) {
        setCalendarType('class');
      } else {
        setCalendarType('personal');
      }
    }
  }, [isClassIcalLoading, isClassCalendarAvailable]);


  // Load personal iCal URL from localStorage on mount
  useEffect(() => {
    const savedIcalUrl = localStorage.getItem('icalUrl');
    if (savedIcalUrl) {
      setPersonalIcalUrl(savedIcalUrl);
      setIsPersonalCalendarConnected(true);
      // If default is personal, fetch it on load
      if (calendarType === 'personal') {
          handleFetchEvents('personal', savedIcalUrl);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch events when calendar type or user changes
  useEffect(() => {
    if (isClassIcalLoading) return;

    if (calendarType === 'class' && isClassCalendarAvailable) {
      handleFetchEvents('class');
    } else if (calendarType === 'personal' && isPersonalCalendarConnected) {
      handleFetchEvents('personal', localStorage.getItem('icalUrl') || personalIcalUrl);
    } else {
      setProcessedEvents([]);
      setError(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarType, user, isClassCalendarAvailable, isPersonalCalendarConnected, isClassIcalLoading]);


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
  
  const handleFetchEvents = async (type: CalendarType, urlOverride?: string | null) => {
      let urlToFetch: string | null = null;
      
      if (type === 'personal') {
          urlToFetch = urlOverride || personalIcalUrl;
      } else if (type === 'class') {
          if (!isClassCalendarAvailable) {
              setError("No hay un calendario predefinido para tu clase.");
              setProcessedEvents([]);
              return;
          }
          urlToFetch = classIcalUrl;
      }
      
      if (!urlToFetch) {
          setProcessedEvents([]);
          setError(type === 'personal' ? "Introduce una URL de iCal para tu calendario personal." : null);
          return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
          const response = await fetch(`/api/calendar-proxy?url=${encodeURIComponent(urlToFetch)}`);
          if (!response.ok) {
               const errorData = await response.json();
               throw new Error(errorData.error || `No se pudo obtener el calendario. Código de estado: ${response.status}`);
          }
          const icalData = await response.text();
          const parsed = parseIcal(icalData, type);
          
          if (parsed.length === 0) {
            setError("No se encontraron eventos o el formato no es compatible. Si es un calendario personal, asegúrate de que la URL de iCal sea 'pública'.");
            setProcessedEvents([]);
          } else {
            setProcessedEvents(parsed);
            if (type === 'personal') {
              setIsPersonalCalendarConnected(true);
              localStorage.setItem('icalUrl', urlToFetch);
            }
          }

      } catch (err: any) {
          console.error("Error al obtener el iCal:", err);
          setError(err.message || "No se pudo cargar el calendario. Verifica la URL y su configuración de privacidad.");
           if(type === 'personal') {
            setIsPersonalCalendarConnected(false); // Disconnect on error
            localStorage.removeItem('icalUrl');
          }
          setProcessedEvents([]);
      } finally {
          setIsLoading(false);
      }
  };

  const handlePersonalCalendarConnect = () => {
    handleFetchEvents('personal');
  }

  const handleDisconnectPersonalCalendar = () => {
    localStorage.removeItem('icalUrl');
    setIsPersonalCalendarConnected(false);
    setPersonalIcalUrl("");
    if (calendarType === 'personal') {
      setProcessedEvents([]);
      setError(null);
      // If the user could see the class calendar, switch to it
      if (isClassCalendarAvailable) {
        setCalendarType('class');
      }
    }
  };

  const eventsOnSelectedDate = processedEvents.filter(
    (event) => date && format(event.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
  );

  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6">
      <header className="mb-8 flex flex-col items-start gap-4">
        <div>
            <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold font-headline tracking-tighter sm:text-3xl">
                    Dynamic Calendar
                </h1>
                <CalendarIcon className="h-6 w-6 text-primary" />
            </div>
            <p className="text-muted-foreground">Gestiona tus eventos personales y de clase.</p>
        </div>
         <div className="w-full flex items-center gap-2">
          <Select onValueChange={(value: CalendarType) => setCalendarType(value)} value={calendarType}>
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
        {userIsInCenter && !isClassCalendarAvailable && calendarType === 'class' && (
            <p className="text-xs text-muted-foreground -mt-2">
              Actualmente no hay un calendario predefinido para tu clase. Pide a un administrador que lo configure.
            </p>
        )}
      </header>
      
      {isLoading || isClassIcalLoading ? (
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
                
                <Button asChild variant="outline" className="w-full">
                    <a href="https://docs.google.com/document/d/1__w6CP8D0o6kEJFXZ--eVhas1Acxq6cgIDrVv4FCXZE/edit?usp=sharing" target="_blank" rel="noopener noreferrer">
                       <BrainCircuit className="mr-2 h-4 w-4 text-primary" />
                        Ver Tutorial
                    </a>
                </Button>

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
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LinkIcon className="mr-2 h-4 w-4" />}
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
             <WeeklySummary 
                user={user!}
                processedEvents={processedEvents}
                isGenerating={isGeneratingSummary} 
                setIsGenerating={setIsGeneratingSummary}
                summary={summary}
                setSummary={setSummary}
             />
        </div>
        <section className="mt-8">
          <Link href="/study" className="block">
            <div className="relative rounded-lg p-6 bg-gradient-to-br from-primary to-accent text-primary-foreground cursor-pointer transition-transform hover:scale-[1.02] shadow-lg hover:shadow-xl overflow-hidden">
                <div className="relative z-10">
                    <div className="absolute top-0 right-0 bg-white/20 text-white text-xs font-bold py-1 px-2 rounded-full">
                        BETA
                    </div>
                    <BrainCircuit className="h-8 w-8 mb-2" />
                    <h3 className="text-xl font-bold font-headline">Modo Estudio</h3>
                    <p className="opacity-80 text-sm mb-4">Concéntrate, organiza y gana recompensas.</p>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-500/30 text-white py-0.5 px-2 rounded-full">Scanner</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/30 text-white py-0.5 px-2 rounded-full">Calculadora</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-500/30 text-white py-0.5 px-2 rounded-full">Focus</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-violet-500/30 text-white py-0.5 px-2 rounded-full">Sonidos</span>
                    </div>
                </div>
            </div>
          </Link>
        </section>
        </div>
      )}
    </div>
  );
}

const loadingTexts = ["Analizando tu calendario...", "Calculando tu rendimiento...", "Compilando tu informe..."];

function LoadingSummary() {
    const [textIndex, setTextIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTextIndex(prev => (prev + 1) % loadingTexts.length);
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="relative w-24 h-24">
                <motion.div
                    className="absolute inset-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    <BrainCircuit className="h-full w-full text-primary opacity-20" />
                </motion.div>
                <motion.div
                     className="absolute inset-0 flex items-center justify-center"
                     animate={{ scale: [1, 1.1, 1] }}
                     transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                    <CalendarIcon className="h-10 w-10 text-primary" />
                </motion.div>
            </div>
            <AnimatePresence mode="wait">
                <motion.p
                    key={textIndex}
                    className="font-semibold text-muted-foreground"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    {loadingTexts[textIndex]}
                </motion.p>
            </AnimatePresence>
        </div>
    );
}

function SummaryDisplay({ data, onRefresh }: { data: SummaryData; onRefresh: () => void; }) {
    
    const handleDownloadPdf = () => {
        const doc = new jsPDF();
        let y = 15;

        // Header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("Resumen Semanal - Dynamic Class", 15, y);
        y += 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Generado el ${data.generationDate}`, 15, y);
        y += 15;

        // Stats Section
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0);
        doc.text("Estadísticas Generales", 15, y);
        y += 7;

        const statsData = [
            { label: 'Trofeos (5d)', value: data.trophiesGainedLast5Days },
            { label: 'Racha', value: data.streak },
            { label: 'Estudio Total', value: `${Math.floor(data.studyMinutes / 60)}h ${data.studyMinutes % 60}m` },
            { label: 'Plantas Total', value: data.plantCount },
        ];
        
        let x = 15;
        statsData.forEach(stat => {
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text(stat.label, x, y);
            doc.setFontSize(16);
            doc.setTextColor(0);
            doc.setFont("helvetica", "bold");
            doc.text(String(stat.value), x, y + 7);
            x += 48;
        });
        y += 20;

        // Performance Section
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Rendimiento Académico", 15, y);
        y += 7;

        const performanceStatsData = [
            { label: 'Media Actual', value: data.overallAverage.toFixed(1) },
            { label: 'Tareas (5d)', value: data.tasksCompletedLast5Days },
            { label: 'Exámenes (5d)', value: data.examsCompletedLast5Days },
        ];
        
        x = 15;
        performanceStatsData.forEach(stat => {
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text(stat.label, x, y);
            doc.setFontSize(16);
            doc.setTextColor(0);
            doc.setFont("helvetica", "bold");
            doc.text(String(stat.value), x, y + 7);
            x += 65;
        });
        y += 20;

        // Line separator
        doc.setDrawColor(221, 221, 221);
        doc.line(15, y - 5, 195, y - 5);
        
        // Upcoming Events
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0);
        doc.text("Próximos 5 Días", 15, y);
        y += 7;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        if (data.upcomingEvents.length > 0) {
            data.upcomingEvents.forEach(event => {
                if (y > 280) { doc.addPage(); y = 20; }
                doc.setTextColor(0);
                doc.setFont("helvetica", "bold");
                doc.text(`${format(event.date, 'EEEE d', { locale: es })}:`, 15, y);
                doc.setTextColor(80);
                doc.setFont("helvetica", "normal");
                doc.text(event.title, 50, y, { maxWidth: 140 });
                y += 7;
            });
        } else {
            doc.setTextColor(150);
            doc.text("No tienes eventos en los próximos 5 días.", 15, y);
            y += 7;
        }
        y += 10;
        
        // Past Events
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0);
        doc.text("Eventos de los últimos 5 días", 15, y);
        y += 7;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        if (data.pastEvents.length > 0) {
            data.pastEvents.forEach(event => {
                if (y > 280) { doc.addPage(); y = 20; }
                doc.setTextColor(0);
                doc.setFont("helvetica", "bold");
                doc.text(`${format(event.date, 'EEEE d', { locale: es })}:`, 15, y);
                doc.setTextColor(80);
                doc.setFont("helvetica", "normal");
                doc.text(event.title, 50, y, { maxWidth: 140 });
                y += 7;
            });
        } else {
            doc.setTextColor(150);
            doc.text("No hubo eventos en los últimos 5 días.", 15, y);
        }
        
        doc.save(`resumen_semanal_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const stats = [
        { icon: Trophy, value: data.trophiesGainedLast5Days, label: 'Trofeos (5d)', color: 'text-amber-500' },
        { icon: Flame, value: data.streak, label: 'Racha', color: 'text-orange-500' },
        { icon: Clock, value: `${Math.floor(data.studyMinutes / 60)}h ${data.studyMinutes % 60}m`, label: 'Estudio Total', color: 'text-teal-500' },
        { icon: TreePine, value: data.plantCount, label: 'Plantas Total', color: 'text-green-500' },
    ];

    const performanceStats = [
        { icon: Star, value: data.overallAverage.toFixed(1), label: 'Media Actual', color: 'text-purple-500' },
        { icon: NotebookText, value: data.tasksCompletedLast5Days, label: 'Tareas (5d)', color: 'text-blue-500' },
        { icon: FileCheck2, value: data.examsCompletedLast5Days, label: 'Exámenes (5d)', color: 'text-red-500' },
    ];
    
    return (
        <Card className="shadow-lg animate-in fade-in-50 duration-500">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Tu Resumen Semanal</CardTitle>
                    <CardDescription>Generado el {data.generationDate}</CardDescription>
                </div>
                <div className="flex items-center">
                    <Button variant="ghost" size="icon" onClick={handleDownloadPdf} aria-label="Descargar resumen">
                        <Download className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onRefresh} aria-label="Actualizar resumen">
                        <RefreshCw className="h-5 w-5 text-muted-foreground" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-4 gap-2 text-center">
                    {stats.map(stat => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.label} className="p-2 bg-muted/50 rounded-lg">
                                <Icon className={cn("h-6 w-6 mx-auto", stat.color)} />
                                <p className="text-xl font-bold mt-1">{stat.value}</p>
                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                            </div>
                        )
                    })}
                </div>
                
                <Separator />

                <div>
                    <h4 className="font-semibold text-sm mb-3 text-center">Rendimiento Académico</h4>
                    <div className="grid grid-cols-3 gap-2 text-center">
                         {performanceStats.map(stat => {
                            const Icon = stat.icon;
                            return (
                                <div key={stat.label} className="p-3 bg-muted/50 rounded-lg">
                                    <Icon className={cn("h-5 w-5 mx-auto mb-1", stat.color)} />
                                    <p className="font-bold">{stat.label}</p>
                                    <p className="text-sm text-muted-foreground">{stat.value}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <Separator />

                <div>
                    <h4 className="font-semibold text-sm mb-3 text-center">Próximos 5 Días</h4>
                    {data.upcomingEvents.length > 0 ? (
                        <div className="space-y-2">
                            {data.upcomingEvents.map(event => (
                                <div key={event.id} className="flex items-center gap-3 p-2 border rounded-lg">
                                    <div className="flex flex-col items-center justify-center p-2 bg-primary/10 rounded-md">
                                        <span className="text-xs font-bold text-primary">{format(event.date, 'MMM', { locale: es }).toUpperCase()}</span>
                                        <span className="text-lg font-bold text-primary">{format(event.date, 'd')}</span>
                                    </div>
                                    <p className="flex-1 text-sm font-medium line-clamp-2">{event.title}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">No tienes eventos en los próximos 5 días.</p>
                    )}
                </div>

                <Separator />
                
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="past-events">
                        <AccordionTrigger className="text-sm font-semibold">
                            Eventos de los últimos 5 días
                        </AccordionTrigger>
                        <AccordionContent className="pt-2">
                            {data.pastEvents.length > 0 ? (
                                <div className="space-y-2">
                                    {data.pastEvents.map(event => (
                                        <div key={event.id} className="flex items-center gap-3 p-2 border rounded-lg bg-muted/50">
                                            <div className="flex flex-col items-center justify-center p-2 bg-muted rounded-md">
                                                <span className="text-xs font-bold text-muted-foreground">{format(event.date, 'MMM', { locale: es }).toUpperCase()}</span>
                                                <span className="text-lg font-bold text-muted-foreground">{format(event.date, 'd')}</span>
                                            </div>
                                            <p className="flex-1 text-sm font-medium line-clamp-2 text-muted-foreground">{event.title}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-sm text-muted-foreground p-4 bg-muted rounded-lg">No hubo eventos en los últimos 5 días.</p>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

            </CardContent>
        </Card>
    );
}

function WeeklySummary({ user, processedEvents, isGenerating, setIsGenerating, summary, setSummary }: {
    user: User;
    processedEvents: ParsedEvent[];
    isGenerating: boolean;
    setIsGenerating: (isGenerating: boolean) => void;
    summary: SummaryData | null;
    setSummary: (summary: SummaryData | null) => void;
}) {
    const firestore = useFirestore();

    const handleGenerateSummary = async () => {
        if (!user) return;
        setIsGenerating(true);
        setSummary(null);

        await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate AI thinking

        const today = startOfToday();
        const nextFiveDays = endOfDay(addDays(today, 4));
        const fiveDaysAgo = subDays(today, 5);

        const upcomingEvents = processedEvents
            .filter(event => event.type === 'class' && isWithinInterval(event.date, { start: today, end: nextFiveDays }))
            .sort((a,b) => a.date.getTime() - b.date.getTime());
        
        const pastEvents = processedEvents
            .filter(event => event.type === 'class' && isWithinInterval(event.date, { start: fiveDaysAgo, end: subDays(today, 1) }))
            .sort((a,b) => b.date.getTime() - a.date.getTime());
            
        let tasksCompletedLast5Days = 0;
        let examsCompletedLast5Days = 0;

        if (firestore && user.uid) {
            const completedItemsRef = collection(firestore, `users/${user.uid}/completedItems`);
            const q = query(
                completedItemsRef, 
                where('completedAt', '>=', fiveDaysAgo)
            );
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                const item = doc.data() as CompletedItem;
                if (item.type === 'task') {
                    tasksCompletedLast5Days++;
                } else if (item.type === 'exam') {
                    examsCompletedLast5Days++;
                }
            });
        }
        
        const trophiesGainedLast5Days = tasksCompletedLast5Days + examsCompletedLast5Days;

        let overallAverage = 0;
        try {
            const savedConfigs = localStorage.getItem(`gradeConfigs-${user.uid}`);
            if (savedConfigs) {
                const parsedConfigs = JSON.parse(savedConfigs);
                const calculatedSubjects = Object.values(parsedConfigs)
                    .map((config: any) => {
                        const filledGrades = config.grades.filter((g: any) => g.grade.trim() !== '' && g.weight.trim() !== '');
                        if (filledGrades.length === 0) return null;
                        const weightedSum = filledGrades.reduce((acc: number, g: any) => acc + (parseFloat(g.grade.replace(',', '.')) * parseFloat(g.weight.replace(',', '.'))), 0);
                        const totalWeight = filledGrades.reduce((acc: number, g: any) => acc + parseFloat(g.weight.replace(',', '.')), 0);
                        if (totalWeight === 0) return null;
                        return { grade: weightedSum / totalWeight };
                    })
                    .filter(Boolean);

                if (calculatedSubjects.length > 0) {
                    const total = calculatedSubjects.reduce((acc: number, curr: any) => acc + curr.grade, 0);
                    overallAverage = total / calculatedSubjects.length;
                }
            }
        } catch (e) {
            console.error("Could not get grade data", e);
        }

        const summaryData: SummaryData = {
            tasksCompletedLast5Days,
            examsCompletedLast5Days,
            trophiesGainedLast5Days,
            studyMinutes: user.studyMinutes || 0,
            streak: user.streak || 0,
            plantCount: user.plantCount || 0,
            overallAverage: overallAverage,
            upcomingEvents: upcomingEvents,
            pastEvents: pastEvents,
            generationDate: format(new Date(), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })
        };

        setSummary(summaryData);
        setIsGenerating(false);
    };

    return (
        <section className="mt-8">
            {isGenerating ? (
                <Card className="shadow-lg">
                    <CardContent className="p-4">
                        <LoadingSummary />
                    </CardContent>
                </Card>
            ) : summary ? (
                <SummaryDisplay data={summary} onRefresh={handleGenerateSummary} />
            ) : (
                <Card className="mt-8 bg-gradient-to-tr from-blue-50 to-indigo-100 dark:from-blue-950/80 dark:to-indigo-950/80 border-blue-200 dark:border-blue-800">
                    <CardHeader className="flex-row items-start gap-4">
                        <div className="p-2 bg-white rounded-lg border shadow-sm">
                            <BrainCircuit className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Resumen Semanal Inteligente</h3>
                            <p className="text-sm text-muted-foreground">Obtén un informe de tu rendimiento y tus próximas tareas con un solo clic.</p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleGenerateSummary} disabled={isGenerating} className="w-full">
                            ✨ Generar Resumen
                        </Button>
                    </CardContent>
                </Card>
            )}
        </section>
    );
}

    