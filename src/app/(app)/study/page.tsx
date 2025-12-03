
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/hooks/use-app";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  Clock,
  Trophy,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Infinity,
  Headphones,
  Wind,
  Coffee,
  Trees,
  Waves,
  Grid,
  Percent,
  Calculator,
  ScanLine,
  Plus,
  Trash2,
  Flag,
  BookCopy,
  Pencil,
  Award,
  TrendingUp,
  TrendingDown,
  Info,
  LineChart,
  Target,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fullSchedule } from "@/lib/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


type TimerMode = "pomodoro" | "long" | "deep";
type Phase = "focus" | "break";
type Sound = "rain" | "coffee" | "forest" | "noise";

const modes = {
  pomodoro: { focus: 25, break: 5, label: "Pomodoro (25/5)" },
  long: { focus: 50, break: 10, label: "Bloque Largo (50/10)" },
  deep: { focus: 90, break: 20, label: "Deep Work (90/20)" },
};

const sounds = [
    { id: "rain", label: "Lluvia", icon: Wind },
    { id: "coffee", label: "Cafetería", icon: Coffee },
    { id: "forest", label: "Bosque", icon: Trees },
    { id: "noise", label: "Ruido Blanco", icon: Waves },
]

const ADMIN_EMAILS = ['anavarrod@iestorredelpalau.cat', 'lrotav@iestorredelpalau.cat'];

export default function StudyPage() {
  const { user } = useApp();
  const router = useRouter();
  const { toast } = useToast();

  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [phase, setPhase] = useState<Phase>("focus");
  const [isActive, setIsActive] = useState(false);
  const [selectedSound, setSelectedSound] = useState<Sound>("rain");

  const getInitialTime = useCallback(() => {
    return modes[mode][phase] * 60;
  }, [mode, phase]);

  const [timeLeft, setTimeLeft] = useState(getInitialTime);

  useEffect(() => {
    setTimeLeft(getInitialTime());
  }, [mode, phase, getInitialTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Time is up, switch phase
      const nextPhase = phase === "focus" ? "break" : "focus";
      const nextPhaseDuration = modes[mode][nextPhase];
      
      toast({
        title: `¡Tiempo de ${nextPhase === 'break' ? 'descanso' : 'enfoque'}!`,
        description: `Comienza tu bloque de ${nextPhaseDuration} minutos.`,
      });

      setPhase(nextPhase);
      setTimeLeft(modes[mode][nextPhase] * 60);
      setIsActive(true); // Keep timer running for the next phase
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, phase, toast]);

  const handleModeChange = (newMode: TimerMode) => {
    setIsActive(false);
    setMode(newMode);
    setPhase("focus");
    setTimeLeft(modes[newMode].focus * 60);
  };

  const handleToggle = () => setIsActive(!isActive);

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(getInitialTime());
  };

  const handleSkip = () => {
    setIsActive(false);
    const nextPhase = phase === "focus" ? "break" : "focus";
    setPhase(nextPhase);
    setTimeLeft(modes[mode][nextPhase] * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const progress = useMemo(() => {
    const totalDuration = modes[mode][phase] * 60;
    return (1 - timeLeft / totalDuration) * 100;
  }, [timeLeft, mode, phase]);
  
  if (!user) return null;

  const isAdmin = ADMIN_EMAILS.includes(user.email);
  const isScheduleAvailable = user?.course === "4eso" && user?.className === "B";

  const phaseColors = phase === 'focus' 
    ? "from-primary to-accent" 
    : "from-green-400 to-emerald-500";
  
  const phaseProgressColor = phase === 'focus' ? "bg-primary" : "bg-green-500";

  return (
    <div className="flex flex-col h-screen bg-muted/30">
        <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft />
            </Button>
            <h1 className="text-lg font-bold">Modo Estudio</h1>
            <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4"/>
                    <span>14h 20m</span>
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/50 border-amber-300 dark:border-amber-700">
                    <Trophy className="h-4 w-4 text-amber-500"/>
                    <span className="font-bold">
                        {isAdmin ? <Infinity className="h-4 w-4"/> : user.trophies}
                    </span>
                </Badge>
            </div>
        </header>

      <ScrollArea className="flex-1">
        <main className="p-4 space-y-6">
            <Card className="w-full max-w-sm mx-auto shadow-xl overflow-hidden">
                <CardContent className="p-4">
                    <div className="flex justify-center mb-4">
                        <div className="bg-muted p-1 rounded-full flex gap-1">
                            {Object.keys(modes).map((key) => (
                            <Button
                                key={key}
                                variant={mode === key ? "default" : "ghost"}
                                size="sm"
                                className="rounded-full px-2 h-8 text-xs"
                                onClick={() => handleModeChange(key as TimerMode)}
                            >
                                {modes[key as TimerMode].label}
                            </Button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="relative flex items-center justify-center my-6">
                        <div className="relative w-56 h-56 rounded-full bg-background flex flex-col items-center justify-center shadow-inner">
                            <p className="font-mono text-6xl font-bold tracking-tighter">
                                {formatTime(timeLeft)}
                            </p>
                            <p className="text-sm font-semibold tracking-widest text-primary uppercase">
                                {phase === 'focus' ? 'ENFOQUE' : 'DESCANSO'}
                            </p>
                        </div>
                    </div>

                    <Progress value={progress} className={cn("h-2 [&>div]:transition-all [&>div]:duration-500", phaseProgressColor)} />

                    <div className="flex justify-center items-center gap-6 mt-6">
                        <Button variant="ghost" size="icon" onClick={handleReset} className="h-14 w-14 rounded-full bg-muted/50">
                            <RotateCcw className="h-6 w-6" />
                        </Button>
                        <Button onClick={handleToggle} className={cn("h-20 w-20 rounded-full shadow-lg bg-gradient-to-br", phaseColors)}>
                            {isActive ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleSkip} className="h-14 w-14 rounded-full bg-muted/50">
                            <SkipForward className="h-6 w-6" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="w-full max-w-sm mx-auto shadow-lg">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Headphones className="h-5 w-5 text-primary"/>
                        Ambiente Sonoro
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-4 gap-2 mb-4">
                        {sounds.map(sound => {
                            const SoundIcon = sound.icon;
                            return (
                                <button 
                                    key={sound.id} 
                                    onClick={() => setSelectedSound(sound.id as Sound)}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-2 p-2 rounded-lg border-2 transition-colors",
                                        selectedSound === sound.id 
                                            ? "border-primary bg-primary/10"
                                            : "border-transparent bg-muted/60 hover:bg-muted"
                                    )}
                                >
                                    <div className={cn(
                                        "h-10 w-10 rounded-full flex items-center justify-center",
                                         selectedSound === sound.id ? "bg-primary/20 text-primary" : "bg-background"
                                    )}>
                                        <SoundIcon className="h-5 w-5" />
                                    </div>
                                    <span className="text-xs font-medium">{sound.label}</span>
                                </button>
                            );
                        })}
                    </div>
                    <Slider defaultValue={[33]} max={100} step={1} />
                </CardContent>
            </Card>

             <Card className="w-full max-w-sm mx-auto shadow-lg">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Grid className="h-5 w-5 text-primary"/>
                        Herramientas
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                   <GradeCalculatorDialog isScheduleAvailable={isScheduleAvailable} user={user}>
                     <div className="relative p-4 rounded-lg bg-gradient-to-br from-red-400 to-pink-500 text-white overflow-hidden cursor-pointer hover:scale-105 transition-transform">
                          <div className="relative z-10">
                              <h3 className="font-bold">Nota Necesaria</h3>
                              <p className="text-xs opacity-80">Calcula cuánto necesitas para aprobar.</p>
                          </div>
                          <Percent className="absolute -right-2 -bottom-2 h-16 w-16 opacity-10" />
                          <Calculator className="absolute top-2 right-2 h-6 w-6 opacity-20" />
                      </div>
                   </GradeCalculatorDialog>
                    <div className="relative p-4 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 text-white overflow-hidden cursor-pointer hover:scale-105 transition-transform">
                         <div className="relative z-10">
                            <h3 className="font-bold">Escanear</h3>
                            <p className="text-xs opacity-80">Digitaliza tus apuntes al instante.</p>
                        </div>
                        <ScanLine className="absolute -right-2 -bottom-2 h-16 w-16 opacity-10" />
                    </div>
                </CardContent>
            </Card>

        </main>
      </ScrollArea>
    </div>
  );
}


interface Grade {
  id: number;
  title: string;
  grade: string;
  weight: string;
}

type ResultStatus = "success" | "warning" | "danger" | "info" | "error";

interface ResultState {
    status: ResultStatus;
    title: string;
    description: string;
    grade?: number;
}

interface SubjectConfig {
    grades: Grade[];
    desiredGrade: string;
    result: ResultState | null;
}

interface AllSubjectConfigs {
    [subjectName: string]: SubjectConfig;
}


function GradeCalculatorDialog({ children, isScheduleAvailable, user }: { children: React.ReactNode, isScheduleAvailable: boolean, user: any }) {
    const [allConfigs, setAllConfigs] = useState<AllSubjectConfigs>({});
    const [subjects, setSubjects] = useState<string[]>([]);
    const [activeSubject, setActiveSubject] = useState<string>('');
    const [newSubjectName, setNewSubjectName] = useState('');

    
    // Load from localStorage on mount
    useEffect(() => {
        try {
            const savedConfigs = localStorage.getItem("gradeConfigs");
            const parsedConfigs: AllSubjectConfigs = savedConfigs ? JSON.parse(savedConfigs) : {};
            setAllConfigs(parsedConfigs);

            let initialSubjects: string[];
            if (isScheduleAvailable) {
                const scheduleSubjects = Object.values(fullSchedule).flat().map(c => c.subject);
                const uniqueScheduleSubjects = [...new Set(scheduleSubjects)];
                initialSubjects = uniqueScheduleSubjects;
            } else {
                initialSubjects = [];
            }
            
            const savedSubjects = Object.keys(parsedConfigs);
            const allSubjects = [...new Set([...initialSubjects, ...savedSubjects])];

            setSubjects(allSubjects);
            if (allSubjects.length > 0) {
                const firstSubject = allSubjects[0];
                setActiveSubject(firstSubject);
            }

        } catch (error) {
            console.error("Failed to load or parse grade configurations from localStorage", error);
        }
    }, [isScheduleAvailable]);

    // Save to localStorage whenever configs change
    useEffect(() => {
        try {
            if (Object.keys(allConfigs).length > 0) {
              localStorage.setItem("gradeConfigs", JSON.stringify(allConfigs));
            }
        } catch (error) {
            console.error("Failed to save grade configurations to localStorage", error);
        }
    }, [allConfigs]);
    
    const activeConfig = useMemo(() => {
        return allConfigs[activeSubject] || { grades: [{ id: 1, title: "", grade: "", weight: "" }], desiredGrade: "5", result: null };
    }, [allConfigs, activeSubject]);

    const updateActiveConfig = (newConfig: Partial<SubjectConfig>) => {
        if (!activeSubject) return;
        setAllConfigs(prev => ({
            ...prev,
            [activeSubject]: { ...activeConfig, ...newConfig },
        }));
    };
    
    const handleSubjectChange = (subjectName: string) => {
        if (subjectName === "new-subject") {
            const defaultNewName = `Nueva Asignatura ${subjects.filter(s => s.startsWith("Nueva Asignatura")).length + 1}`;
            setSubjects(prev => [...prev, defaultNewName]);
            const newConfig = { grades: [{id: 1, title: "", grade: "", weight: ""}], desiredGrade: "5", result: null };
            setAllConfigs(prev => ({ ...prev, [defaultNewName]: newConfig }));
            setActiveSubject(defaultNewName);
        } else {
            setActiveSubject(subjectName);
        }
    };
    
    const handleRenameSubject = () => {
        if (!newSubjectName || newSubjectName === activeSubject || subjects.includes(newSubjectName)) return;
        
        const oldConfigs = {...allConfigs};
        const subjectData = oldConfigs[activeSubject];
        delete oldConfigs[activeSubject];
        
        const newConfigs = { ...oldConfigs, [newSubjectName]: subjectData };
        setAllConfigs(newConfigs);

        const newSubjects = subjects.map(s => s === activeSubject ? newSubjectName : s);
        setSubjects(newSubjects);
        setActiveSubject(newSubjectName);
    };

    const addGrade = () => {
        const newGrades = [...activeConfig.grades, { id: Date.now(), title: "", grade: "", weight: "" }];
        updateActiveConfig({ grades: newGrades, result: null });
    };

    const removeGrade = (id: number) => {
        const newGrades = activeConfig.grades.filter(g => g.id !== id);
        updateActiveConfig({ grades: newGrades, result: null });
    };

    const handleGradeChange = (id: number, field: keyof Grade, value: string) => {
        const newGrades = activeConfig.grades.map(g => g.id === id ? { ...g, [field]: value } : g);
        updateActiveConfig({ grades: newGrades, result: null });
    };

    const calculateGrade = () => {
        let newResult: ResultState | null = null;
        const desired = parseFloat(activeConfig.desiredGrade.replace(',', '.'));

        if (isNaN(desired) || desired < 0 || desired > 10) {
            newResult = { status: 'error', title: "Error de Formato", description: "La nota final deseada debe ser un número entre 0 y 10." };
            updateActiveConfig({ result: newResult });
            return;
        }

        let totalWeight = 0;
        let weightedSum = 0;
        const unknownGrades = [];
        
        for (const g of activeConfig.grades) {
            const weight = parseFloat(g.weight.replace(',', '.'));
             if (isNaN(weight) || g.weight.trim() === '') {
                newResult = { status: 'error', title: "Error en Porcentaje", description: `Hay un porcentaje vacío o no válido. Todos los campos de porcentaje deben estar rellenos.` };
                updateActiveConfig({ result: newResult });
                return;
            }
            totalWeight += weight;

            if (g.grade.trim() === '') {
                unknownGrades.push(g);
            } else {
                const grade = parseFloat(g.grade.replace(',', '.'));
                if (isNaN(grade) || grade < 0 || grade > 10) {
                     newResult = { status: 'error', title: "Error en Nota", description: `La nota '${g.grade}' no es válida. Deben ser números entre 0 y 10.` };
                     updateActiveConfig({ result: newResult });
                     return;
                }
                weightedSum += (grade * weight);
            }
        }
        
        if (Math.abs(totalWeight - 100) > 0.01) {
            newResult = { status: 'error', title: "Error en la Suma", description: `La suma de los porcentajes debe ser 100%, pero es ${totalWeight.toFixed(2)}%.` };
            updateActiveConfig({ result: newResult });
            return;
        }

        if (unknownGrades.length === 1) {
            const unknownWeight = parseFloat(unknownGrades[0].weight.replace(',', '.'));
            const neededGrade = (desired * 100 - weightedSum) / unknownWeight;

            let status: ResultStatus;
            let title: string;
            let description: string;
            
            if (neededGrade > 10) {
                status = 'danger';
                title = '¡Objetivo Difícil!';
                description = `Un ${neededGrade.toFixed(2)} es un reto. ¡A por todas!`;
            } else if (neededGrade >= 7) {
                status = 'success';
                title = '¡Lo Tienes!';
                description = `Necesitas un ${neededGrade.toFixed(2)}. ¡Sigue así!`;
            } else if (neededGrade >= 5) {
                status = 'warning';
                title = '¡Casi Hecho!';
                description = `Con un ${neededGrade.toFixed(2)} es suficiente. ¡Puedes hacerlo!`;
            } else if (neededGrade >= 0) {
                 status = 'success';
                 title = '¡Fácil!';
                 description = `Solo necesitas un ${neededGrade.toFixed(2)}. ¡Pan comido!`;
            } else {
                 status = 'success';
                 title = '¡Ya Aprobaste!';
                 description = '¡Felicidades! Ya tienes tu objetivo, incluso con un 0.';
            }
            newResult = { status, title, description, grade: neededGrade };
        } 
        else if (unknownGrades.length === 0) {
            const currentAverage = weightedSum / 100;
            let status: ResultStatus;
            let title = 'Tu Media Actual';
            let description = `Tu media ponderada actual es un ${currentAverage.toFixed(2)}.`;

            if (currentAverage >= 7) status = 'success';
            else if (currentAverage >= 5) status = 'warning';
            else status = 'danger';

            newResult = { 
                status,
                title, 
                description,
                grade: currentAverage
            };
        }
        else {
             newResult = { 
                status: 'error', 
                title: 'Error de Cálculo', 
                description: "Deja solo un campo de nota en blanco para calcular, o rellena todos para ver tu media." 
            };
        }
        updateActiveConfig({ result: newResult });
    };
    
    const statusColors = {
        success: "bg-green-500/80",
        warning: "bg-yellow-500/80",
        danger: "bg-red-500/80",
        info: "bg-blue-500/80",
        error: "bg-red-500/80",
    };

    const latestGrade = activeConfig.result?.grade;
    const latestStatus = activeConfig.result?.status;

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-md w-[95vw] p-0 flex flex-col max-h-[85vh]">
                <Tabs defaultValue="calculator" className="flex flex-col flex-1 min-h-0">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle>Herramientas de Notas</DialogTitle>
                        <DialogDescription>
                            Calcula tus notas y revisa tu progreso académico.
                        </DialogDescription>
                        <TabsList className="grid w-full grid-cols-2 mt-4">
                            <TabsTrigger value="calculator">
                                <Calculator className="h-4 w-4 mr-2" />
                                Calculadora
                            </TabsTrigger>
                            <TabsTrigger value="report">
                                <LineChart className="h-4 w-4 mr-2" />
                                Informe
                            </TabsTrigger>
                        </TabsList>
                    </DialogHeader>

                    <TabsContent value="calculator" className="mt-0 flex-1 flex flex-col min-h-0">
                        <ScrollArea className="flex-1">
                          <div className="px-6 space-y-6 py-4">
                              <div className="space-y-2">
                                  <Label>Asignatura</Label>
                                  <div className="flex items-center gap-2">
                                      <Select onValueChange={handleSubjectChange} value={activeSubject}>
                                          <SelectTrigger>
                                              <div className="flex items-center gap-2">
                                                  <BookCopy className="h-4 w-4" />
                                                  <SelectValue placeholder="Selecciona una asignatura..." />
                                              </div>
                                          </SelectTrigger>
                                          <SelectContent>
                                              {subjects.map(subject => (
                                                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                                              ))}
                                              <Separator className="my-1" />
                                              <SelectItem value="new-subject">
                                                  <span className="flex items-center gap-2 text-primary">
                                                      <Plus className="h-4 w-4"/>Crear nueva
                                                  </span>
                                              </SelectItem>
                                          </SelectContent>
                                      </Select>
                                       {latestGrade !== undefined && latestStatus && (
                                            <Badge className={cn("text-base", statusColors[latestStatus])}>
                                                {latestGrade.toFixed(1)}
                                            </Badge>
                                        )}
                                      <Dialog>
                                          <DialogTrigger asChild>
                                              <Button variant="ghost" size="icon" disabled={!activeSubject}><Pencil className="h-4 w-4" /></Button>
                                          </DialogTrigger>
                                          <DialogContent>
                                              <DialogHeader>
                                                  <DialogTitle>Renombrar Asignatura</DialogTitle>
                                              </DialogHeader>
                                              <Input 
                                                  defaultValue={activeSubject}
                                                  onChange={(e) => setNewSubjectName(e.target.value)}
                                                  onKeyDown={(e) => e.key === 'Enter' && handleRenameSubject()}
                                              />
                                              <DialogFooter>
                                                  <DialogClose asChild>
                                                      <Button variant="outline">Cancelar</Button>
                                                  </DialogClose>
                                                  <DialogClose asChild>
                                                      <Button onClick={handleRenameSubject}>Guardar</Button>
                                                  </DialogClose>
                                              </DialogFooter>
                                          </DialogContent>
                                      </Dialog>
                                  </div>
                              </div>
                          
                              <div className="space-y-4">
                                  {activeConfig.grades.map((g, index) => (
                                      <div key={g.id} className="p-3 border rounded-lg space-y-2">
                                          <div className="flex items-center gap-2">
                                              <Input
                                                  id={`title-${g.id}`}
                                                  type="text"
                                                  placeholder={`Examen / Tarea ${index + 1}`}
                                                  value={g.title}
                                                  onChange={e => handleGradeChange(g.id, 'title', e.target.value)}
                                                  className="text-sm font-semibold border-0 bg-transparent px-1 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                                              />
                                              <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  onClick={() => removeGrade(g.id)}
                                                  disabled={activeConfig.grades.length === 1}
                                                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                              >
                                                  <Trash2 className="h-4 w-4" />
                                              </Button>
                                          </div>

                                          <div className="flex items-center gap-2">
                                              <div className="flex-1 space-y-1">
                                                  <Label htmlFor={`grade-${g.id}`} className="text-xs">Nota</Label>
                                                  <Input
                                                      id={`grade-${g.id}`}
                                                      type="text"
                                                      placeholder="0-10"
                                                      value={g.grade}
                                                      onChange={e => handleGradeChange(g.id, 'grade', e.target.value)}
                                                  />
                                              </div>
                                              <div className="w-24 space-y-1">
                                                  <Label htmlFor={`weight-${g.id}`} className="text-xs">Peso %</Label>
                                                  <Input
                                                      id={`weight-${g.id}`}
                                                      type="text"
                                                      placeholder="%"
                                                      value={g.weight}
                                                      onChange={e => handleGradeChange(g.id, 'weight', e.target.value)}
                                                  />
                                              </div>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                              
                              <Button variant="outline" onClick={addGrade} className="w-full border-dashed" disabled={!activeSubject}>
                                  <Plus className="mr-2 h-4 w-4" />
                                  Añadir evaluación
                              </Button>

                                <div className="space-y-2">
                                  <Label htmlFor="desired-grade">Nota Final Deseada</Label>
                                  <div className="relative">
                                      <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                      <Input
                                          id="desired-grade"
                                          type="text"
                                          value={activeConfig.desiredGrade}
                                          onChange={e => updateActiveConfig({ ...activeConfig, desiredGrade: e.target.value, result: null })}
                                          className="pl-10 font-bold text-base bg-muted"
                                          disabled={!activeSubject}
                                      />
                                  </div>
                              </div>
                              {activeConfig.result && <ResultPanel result={activeConfig.result} />}
                          </div>
                        </ScrollArea>
                        <DialogFooter className="p-6 pt-4 border-t">
                            <DialogClose asChild>
                                <Button variant="outline">Cerrar</Button>
                            </DialogClose>
                            <Button onClick={calculateGrade} disabled={!activeSubject}>Calcular</Button>
                        </DialogFooter>
                    </TabsContent>
                    <TabsContent value="report" className="mt-0 flex-1 flex flex-col min-h-0">
                       <ReportTab allConfigs={allConfigs} user={user} />
                        <DialogFooter className="p-6 pt-4 border-t">
                             <DialogClose asChild>
                                <Button variant="outline">Cerrar</Button>
                            </DialogClose>
                        </DialogFooter>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

function ResultPanel({ result }: { result: ResultState }) {
    const statusConfig = {
        success: { icon: Award, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/30" },
        warning: { icon: TrendingUp, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
        danger: { icon: TrendingDown, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30" },
        info: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30" },
        error: { icon: Info, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30" },
    };
    
    const config = statusConfig[result.status];
    const Icon = config.icon;
    
    return (
        <div className={cn("p-4 rounded-lg border", config.bg, config.border)}>
            <div className="flex items-start gap-4">
                 <div className={cn("p-2 rounded-full", config.bg)}>
                    <Icon className={cn("h-6 w-6", config.color)} />
                 </div>
                 <div className="flex-1">
                    <h3 className="font-bold flex-1">{result.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{result.description}</p>
                 </div>
                 {result.grade !== undefined && (
                    <p className={cn("text-4xl font-bold font-mono tracking-tighter", config.color)}>
                        {result.grade < 0 ? '0.0' : result.grade.toFixed(1)}
                    </p>
                )}
            </div>
        </div>
    );
}

function ReportTab({ allConfigs, user }: { allConfigs: AllSubjectConfigs, user: any }) {
    const calculatedSubjects = useMemo(() => {
        return Object.entries(allConfigs)
            .map(([subject, config]) => {
                const filledGrades = config.grades.filter(g => g.grade.trim() !== '' && g.weight.trim() !== '');
                if (filledGrades.length > 0) {
                    const weightedSum = filledGrades.reduce((acc, g) => acc + (parseFloat(g.grade.replace(',', '.')) * parseFloat(g.weight.replace(',', '.'))), 0);
                    const totalWeight = filledGrades.reduce((acc, g) => acc + parseFloat(g.weight.replace(',', '.')), 0);
                    if (totalWeight > 0) {
                        const average = weightedSum / totalWeight;
                         return {
                            subject,
                            grade: average,
                        };
                    }
                } else if (config.result?.status !== 'error' && config.result?.grade !== undefined) {
                     return {
                        subject,
                        grade: config.result.grade,
                    };
                }
                return null;
            })
            .filter((item): item is { subject: string; grade: number } => item !== null);
    }, [allConfigs]);

    const overallAverage = useMemo(() => {
        if (calculatedSubjects.length === 0) return 0;
        const total = calculatedSubjects.reduce((acc, curr) => acc + Math.max(0, curr.grade), 0);
        return total / calculatedSubjects.length;
    }, [calculatedSubjects]);

    const getOverallStatus = (average: number): ResultStatus => {
        if (average >= 7) return 'success';
        if (average >= 5) return 'warning';
        return 'danger';
    };

    const getOverallFeedback = (average: number): { title: string; description: string } => {
        if (average >= 9) return { title: '¡Rendimiento Excepcional!', description: 'Estás demostrando un dominio impresionante de las materias.' };
        if (average >= 7) return { title: '¡Gran Trabajo!', description: 'Tu esfuerzo se refleja en tus notas. ¡Sigue así!' };
        if (average >= 5) return { title: 'Vas por Buen Camino', description: 'Estás aprobando. Con un poco más de empuje, puedes subir esa media.' };
        return { title: 'Ánimo, ¡Puedes Mejorar!', description: 'Algunas asignaturas necesitan más atención. Identifica tus puntos débiles y a por ellos.' };
    };

    const overallStatus = getOverallStatus(overallAverage);
    const overallFeedback = getOverallFeedback(overallAverage);
    const statusConfig = {
        success: { icon: Award, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/30" },
        warning: { icon: TrendingUp, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
        danger: { icon: TrendingDown, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30" },
    };
    const OverallIcon = statusConfig[overallStatus].icon;

    return (
        <ScrollArea className="flex-1">
            <div className="px-6 space-y-6 py-4">
                <div className="text-center">
                    <h3 className="text-lg font-semibold">Informe de Notas de {user.name.split(' ')[0]}</h3>
                    <p className="text-sm text-muted-foreground">Un resumen de tu progreso académico.</p>
                </div>

                <div className={cn("p-4 rounded-lg border", statusConfig[overallStatus].bg, statusConfig[overallStatus].border)}>
                    <div className="flex flex-col items-center text-center gap-2">
                        <OverallIcon className={cn("h-8 w-8", statusConfig[overallStatus].color)} />
                        <div>
                            <p className="text-sm font-bold text-muted-foreground">MEDIA GLOBAL</p>
                            <p className={cn("text-5xl font-bold font-mono tracking-tighter", statusConfig[overallStatus].color)}>
                                {overallAverage.toFixed(2)}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold">{overallFeedback.title}</h4>
                            <p className="text-xs text-muted-foreground">{overallFeedback.description}</p>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="mb-2 font-semibold text-sm text-muted-foreground">DESGLOSE POR ASIGNATURAS</h4>
                    {calculatedSubjects.length > 0 ? (
                        <div className="space-y-2">
                            {calculatedSubjects.map(({ subject, grade }) => {
                                const subjectStatus = getOverallStatus(grade);
                                const SubjectIcon = statusConfig[subjectStatus].icon;
                                return (
                                    <div key={subject} className={cn("flex items-center p-3 rounded-md border", statusConfig[subjectStatus].bg, statusConfig[subjectStatus].border)}>
                                        <SubjectIcon className={cn("h-5 w-5 mr-3", statusConfig[subjectStatus].color)} />
                                        <p className="flex-1 font-semibold text-sm">{subject}</p>
                                        <p className={cn("font-bold text-lg font-mono", statusConfig[subjectStatus].color)}>{Math.max(0, grade).toFixed(1)}</p>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                            <p>Aún no has calculado ninguna nota final.</p>
                            <p>Usa la calculadora para empezar.</p>
                        </div>
                    )}
                </div>
            </div>
        </ScrollArea>
    );
}

    