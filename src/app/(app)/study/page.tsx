
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


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
                   <GradeCalculatorDialog>
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
  grade: string;
  weight: string;
}

function GradeCalculatorDialog({ children }: { children: React.ReactNode }) {
    const [grades, setGrades] = useState<Grade[]>([
        { id: 1, grade: "", weight: "" },
    ]);
    const [desiredGrade, setDesiredGrade] = useState<string>("5");
    const [result, setResult] = useState<{ title: string; description: string; } | null>(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);

    const addGrade = () => {
        setGrades([...grades, { id: Date.now(), grade: "", weight: "" }]);
    };

    const removeGrade = (id: number) => {
        setGrades(grades.filter(g => g.id !== id));
    };

    const handleGradeChange = (id: number, field: 'grade' | 'weight', value: string) => {
        setGrades(grades.map(g => g.id === id ? { ...g, [field]: value } : g));
    };
    
    const calculateGrade = () => {
        const desired = parseFloat(desiredGrade);
        if (isNaN(desired) || desired < 0 || desired > 10) {
            setResult({ title: "Error", description: "La nota final deseada debe ser un número entre 0 y 10." });
            setIsAlertOpen(true);
            return;
        }

        const knownGrades = grades.filter(g => g.grade !== "" && g.weight !== "");
        const unknownGrades = grades.filter(g => g.grade === "" && g.weight !== "");

        if (unknownGrades.length === 0) {
            setResult({ title: "Error", description: "Debes dejar la nota de al menos un examen en blanco para calcularla." });
            setIsAlertOpen(true);
            return;
        }
        if (unknownGrades.length > 1) {
            setResult({ title: "Error", description: "Solo puedes dejar la nota de un examen en blanco para el cálculo." });
            setIsAlertOpen(true);
            return;
        }

        let totalWeight = 0;
        let weightedSum = 0;
        
        for (const g of grades) {
            const weight = parseFloat(g.weight);
            if (isNaN(weight)) continue;
            totalWeight += weight;

            if (g.grade !== "") {
                const grade = parseFloat(g.grade);
                if (isNaN(grade) || grade < 0 || grade > 10) {
                     setResult({ title: "Error", description: `La nota '${g.grade}' no es válida. Deben ser números entre 0 y 10.` });
                     setIsAlertOpen(true);
                     return;
                }
                weightedSum += (grade * weight) / 100;
            }
        }
        
        if (Math.abs(totalWeight - 100) > 0.01) {
            setResult({ title: "Error", description: `La suma de los porcentajes debe ser 100%, pero es ${totalWeight}%.` });
            setIsAlertOpen(true);
            return;
        }

        const unknownWeight = parseFloat(unknownGrades[0].weight);
        if (isNaN(unknownWeight) || unknownWeight <= 0) {
            setResult({ title: "Error", description: "El examen a calcular debe tener un porcentaje válido y mayor que cero." });
            setIsAlertOpen(true);
            return;
        }

        const neededGrade = ((desired - weightedSum) * 100) / unknownWeight;

        if (neededGrade > 10) {
            setResult({
                title: "¡Objetivo Difícil!",
                description: `Necesitas sacar un ${neededGrade.toFixed(2)} en el último examen. ¡Es un reto, pero no imposible con esfuerzo extra!`
            });
        } else if (neededGrade < 0) {
             setResult({
                title: "¡Ya Aprobaste!",
                description: `Felicidades, ya has alcanzado tu nota deseada. ¡Incluso si sacas un 0 en el último examen, tu nota final será superior!`
            });
        } else {
             setResult({
                title: "Nota Necesaria",
                description: `Para obtener un ${desired} de nota final, necesitas sacar un ${neededGrade.toFixed(2)} en el último examen.`
            });
        }
        setIsAlertOpen(true);
    };

    return (
        <>
            <Dialog>
                <DialogTrigger asChild>{children}</DialogTrigger>
                <DialogContent className="max-w-md w-[95vw]">
                    <DialogHeader>
                        <DialogTitle>Calculadora de Notas</DialogTitle>
                        <DialogDescription>
                            Añade tus notas parciales y porcentajes para saber qué necesitas.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto px-1">
                        {grades.map((g, index) => (
                            <div key={g.id} className="flex items-center gap-2">
                                <div className="flex-1 space-y-1">
                                    {index === 0 && <Label htmlFor={`grade-${g.id}`}>Nota</Label>}
                                    <Input
                                        id={`grade-${g.id}`}
                                        type="number"
                                        placeholder="Nota (0-10)"
                                        value={g.grade}
                                        onChange={e => handleGradeChange(g.id, 'grade', e.target.value)}
                                    />
                                </div>
                                <div className="w-24 space-y-1">
                                     {index === 0 && <Label htmlFor={`weight-${g.id}`}>Peso %</Label>}
                                    <Input
                                        id={`weight-${g.id}`}
                                        type="number"
                                        placeholder="%"
                                        value={g.weight}
                                        onChange={e => handleGradeChange(g.id, 'weight', e.target.value)}
                                    />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeGrade(g.id)}
                                    disabled={grades.length === 1}
                                    className="self-end text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                         <Button variant="outline" onClick={addGrade} className="w-full border-dashed">
                            <Plus className="mr-2 h-4 w-4" />
                            Añadir examen/trabajo
                        </Button>

                        <div className="space-y-2 pt-4">
                            <Label htmlFor="desired-grade">Nota Final Deseada</Label>
                            <div className="relative">
                               <Flag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="desired-grade"
                                    type="number"
                                    value={desiredGrade}
                                    onChange={e => setDesiredGrade(e.target.value)}
                                    className="pl-10 font-bold text-base bg-primary/10"
                                />
                            </div>
                        </div>
                    </div>
                     <DialogFooter>
                        <DialogClose asChild>
                           <Button variant="outline">Cerrar</Button>
                        </DialogClose>
                        <Button onClick={calculateGrade}>Calcular</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {result && (
                <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{result.title}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {result.description}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogAction onClick={() => setIsAlertOpen(false)}>Entendido</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </>
    );
}

    