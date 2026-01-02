
"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  Trees,
  Coffee,
  Waves,
  Building2,
  BookOpen,
  CloudRain,
  Leaf,
  Grid,
  Percent,
  Calculator,
  ScanLine,
  Flame,
  Music,
  Rewind,
  FastForward,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { GradeCalculatorDialog } from "@/components/layout/grade-calculator-dialog";
import { useFirestore } from "@/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";
import { format as formatDate, subDays, isSameDay } from 'date-fns';
import { WipDialog } from "@/components/layout/wip-dialog";


type TimerMode = "pomodoro" | "long" | "deep";
type Phase = "focus" | "break";
type Sound = {
    id: string;
    label: string;
    icon: React.ElementType;
    url: string;
} | null;

const modes = {
  pomodoro: { focus: 25, break: 5, label: "Pomodoro (25/5)" },
  long: { focus: 50, break: 10, label: "Bloque Largo (50/10)" },
  deep: { focus: 90, break: 20, label: "Deep Work (90/20)" },
};

const sounds = [
    { id: "rain", label: "Lluvia", icon: CloudRain, url: "https://firebasestorage.googleapis.com/v0/b/studio-7840988595-13b35.appspot.com/o/relaxing-rain-419012.mp3?alt=media" },
    { id: "cafe", label: "Cafetería", icon: Coffee, url: "https://firebasestorage.googleapis.com/v0/b/studio-7840988595-13b35.appspot.com/o/casual-cafe-restaurant-noise-73945.mp3?alt=media" },
    { id: "forest", label: "Bosque", icon: Trees, url: "https://firebasestorage.googleapis.com/v0/b/studio-7840988595-13b35.appspot.com/o/ambiente-de-bosque-arvi-ambix-17159.mp3?alt=media" },
    { id: "noise", label: "Ruido Blanco", icon: Waves, url: "https://firebasestorage.googleapis.com/v0/b/studio-7840988595-13b35.appspot.com/o/white-noise-358382.mp3?alt=media" },
    { id: "library", label: "Biblioteca", icon: BookOpen, url: "https://firebasestorage.googleapis.com/v0/b/studio-7840988595-13b35.appspot.com/o/biblioteca.mp3?alt=media" },
    { id: "nature", label: "Naturaleza", icon: Leaf, url: "https://firebasestorage.googleapis.com/v0/b/studio-7840988595-13b35.appspot.com/o/birds-frogs-nature-8257.mp3?alt=media" },
    { id: "city", label: "Ciudad", icon: Building2, url: "https://firebasestorage.googleapis.com/v0/b/studio-7840988595-13b35.appspot.com/o/city-ambience-121693.mp3?alt=media" },
    { id: "sea", label: "Mar", icon: Waves, url: "https://firebasestorage.googleapis.com/v0/b/studio-7840988595-13b35.appspot.com/o/mar-agitado-272999.mp3?alt=media" },
]

const ADMIN_EMAILS = ['anavarrod@iestorredelpalau.cat', 'lrotav@iestorredelpalau.cat', 'adrimax.dev@gmail.com'];

export default function StudyPage() {
  const { user, updateUser } = useApp();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [phase, setPhase] = useState<Phase>("focus");
  const [isActive, setIsActive] = useState(false);
  const [selectedSound, setSelectedSound] = useState<Sound>(null);
  const [volume, setVolume] = useState(33);

  const audioRef = useRef<HTMLAudioElement>(null);

  // Ref to track if a minute has been logged
  const lastLoggedMinuteRef = useRef<number | null>(null);
  
  // Ref to track if streak has been updated today
  const streakUpdatedTodayRef = useRef<boolean>(false);

  const getInitialTime = useCallback(() => {
    return modes[mode][phase] * 60;
  }, [mode, phase]);

  const [timeLeft, setTimeLeft] = useState(getInitialTime);
  
  // Update time left when mode or phase changes
  useEffect(() => {
    if (!isActive) {
      setTimeLeft(getInitialTime());
    }
  }, [mode, phase, getInitialTime, isActive]);

  // Audio playback effect
   useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (selectedSound && audio.src !== selectedSound.url) {
        audio.src = selectedSound.url;
        audio.load();
    }
    
    if (selectedSound) {
        audio.loop = true;
        audio.volume = volume / 100;
        audio.play().catch(error => console.error("Error playing audio:", error));
    } else {
        audio.pause();
    }
  }, [selectedSound, volume]);

  // Handle streak logic
  const handleStreak = useCallback(async () => {
    if (!firestore || !user || streakUpdatedTodayRef.current) return;
    
    const today = new Date();
    const todayStr = formatDate(today, 'yyyy-MM-dd');
    const lastStudyDay = user.lastStudyDay ? new Date(user.lastStudyDay) : null;

    if (lastStudyDay && isSameDay(today, lastStudyDay)) {
        streakUpdatedTodayRef.current = true;
        return;
    }

    const yesterday = subDays(today, 1);
    let newStreak = user.streak || 0;

    if (lastStudyDay && isSameDay(yesterday, lastStudyDay)) {
        newStreak++;
    } else {
        newStreak = 1;
    }
    
    const userDocRef = doc(firestore, 'users', user.uid);
    try {
        await updateDoc(userDocRef, {
            streak: newStreak,
            lastStudyDay: todayStr,
        });
        updateUser({ streak: newStreak, lastStudyDay: todayStr });
        streakUpdatedTodayRef.current = true;
        console.log("Streak updated:", newStreak);
    } catch (err) {
        console.error("Failed to update streak:", err);
    }
  }, [firestore, user, updateUser]);


  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      const nextPhase = phase === "focus" ? "break" : "focus";
      const nextPhaseDuration = modes[mode][nextPhase];
      
      toast({
        title: `¡Tiempo de ${nextPhase === 'break' ? 'descanso' : 'enfoque'}!`,
        description: `Comienza tu bloque de ${nextPhaseDuration} minutos.`,
      });

      setPhase(nextPhase);
      setTimeLeft(modes[mode][nextPhase] * 60);
      setIsActive(true); 
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, phase, toast]);

  // Effect to log study minutes and handle streak
  useEffect(() => {
    if (!firestore || !user || !isActive || phase !== 'focus') return;

    if (!streakUpdatedTodayRef.current) {
        handleStreak();
    }

    const currentMinute = Math.floor((modes[mode].focus * 60 - timeLeft) / 60);

    if (currentMinute > 0 && currentMinute !== lastLoggedMinuteRef.current) {
        lastLoggedMinuteRef.current = currentMinute;
        
        const userDocRef = doc(firestore, 'users', user.uid);
        updateDoc(userDocRef, {
            studyMinutes: increment(1)
        }).then(() => {
            console.log('Study minute logged');
            updateUser({ studyMinutes: (user.studyMinutes || 0) + 1 });
        }).catch(err => {
            console.error("Failed to log study minute:", err);
        });
    }

  }, [timeLeft, isActive, phase, firestore, user, mode, updateUser, handleStreak]);


  const handleModeChange = (newMode: TimerMode) => {
    setIsActive(false);
    setMode(newMode);
    setPhase("focus");
  };

  const handleToggle = () => {
    if (!isActive) {
        lastLoggedMinuteRef.current = Math.floor((modes[mode].focus * 60 - timeLeft) / 60);
    }
    setIsActive(!isActive);
  }

  const handleReset = () => {
    setIsActive(false);
    setPhase("focus");
    setTimeLeft(modes[mode].focus * 60);
    lastLoggedMinuteRef.current = null;
  };

  const handleSkip = () => {
    setIsActive(false);
    const nextPhase = phase === "focus" ? "break" : "focus";
    setPhase(nextPhase);
    lastLoggedMinuteRef.current = null;
  };
  
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  const handleSoundSelect = (sound: Sound) => {
      if (selectedSound?.id === sound?.id) {
          setSelectedSound(null); // Deselect if clicked again
      } else {
          setSelectedSound(sound);
      }
  }


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

   const formatStudyTime = (totalMinutes: number = 0) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const progress = useMemo(() => {
    const totalDuration = modes[mode][phase] * 60;
    return (1 - timeLeft / totalDuration) * 100;
  }, [timeLeft, mode, phase]);
  
  if (!user) return null;

  const isAdmin = ADMIN_EMAILS.includes(user.email);
  const isScheduleAvailable = user?.course === "4eso" && user?.className === "B";
  const streakCount = user.streak || 0;

  const phaseColors = phase === 'focus' 
    ? "from-primary to-accent" 
    : "from-green-400 to-emerald-500";
  
  const phaseProgressColor = phase === 'focus' ? "bg-primary" : "bg-green-500";

  return (
    <div className="flex flex-col h-screen bg-muted/30">
        <audio ref={audioRef} />
        <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft />
            </Button>
            <h1 className="text-lg font-bold">Modo Estudio</h1>
            <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4"/>
                    <span>{formatStudyTime(user.studyMinutes)}</span>
                </Badge>
                <Badge variant="outline" className={cn("flex items-center gap-1.5", streakCount > 0 ? "bg-orange-100 dark:bg-orange-900/50 border-orange-300 dark:border-orange-700" : "")}>
                    <Flame className={cn("h-4 w-4", streakCount > 0 ? "text-orange-500" : "text-muted-foreground")} />
                    <span className="font-bold">{streakCount}</span>
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/50 border-amber-300 dark:border-amber-700">
                    <Trophy className="h-4 w-4 text-amber-500"/>
                    <span className="font-bold">
                        {user.trophies}
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
                                    onClick={() => handleSoundSelect(sound)}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-2 p-2 rounded-lg border-2 transition-colors",
                                        selectedSound?.id === sound.id 
                                            ? "border-primary bg-primary/10"
                                            : "border-transparent bg-muted/60 hover:bg-muted"
                                    )}
                                >
                                    <div className={cn(
                                        "h-10 w-10 rounded-full flex items-center justify-center",
                                         selectedSound?.id === sound.id ? "bg-primary/20 text-primary" : "bg-background"
                                    )}>
                                        <SoundIcon className="h-5 w-5" />
                                    </div>
                                    <span className="text-xs font-medium">{sound.label}</span>
                                </button>
                            );
                        })}
                    </div>
                    <Slider 
                        defaultValue={[volume]} 
                        max={100} 
                        step={1} 
                        onValueChange={handleVolumeChange}
                        disabled={!selectedSound}
                    />
                </CardContent>
            </Card>
            
            <WipDialog>
                <Card className="w-full max-w-sm mx-auto shadow-lg cursor-pointer hover:border-primary/50 transition-colors">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Music className="h-5 w-5 text-primary"/>
                            Control de Música
                            <Badge variant="outline">Próximamente</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-md bg-muted flex-shrink-0"></div>
                            <div className="flex-1 space-y-1">
                                <div className="h-4 w-3/4 rounded-md bg-muted"></div>
                                <div className="h-3 w-1/2 rounded-md bg-muted/50"></div>
                            </div>
                        </div>
                        <div className="flex justify-center items-center gap-6 text-muted-foreground">
                            <Rewind className="h-6 w-6" />
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-foreground">
                                <Play className="h-6 w-6" />
                            </div>
                            <FastForward className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>
            </WipDialog>

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
                    <WipDialog>
                        <div
                            className="relative p-4 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 text-white overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                        >
                            <div className="relative z-10">
                                <h3 className="font-bold">Escanear</h3>
                                <p className="text-xs opacity-80">Digitaliza tus apuntes al instante.</p>
                            </div>
                            <ScanLine className="absolute -right-2 -bottom-2 h-16 w-16 opacity-10" />
                        </div>
                    </WipDialog>
                </CardContent>
            </Card>

        </main>
      </ScrollArea>
    </div>
  );
}

    