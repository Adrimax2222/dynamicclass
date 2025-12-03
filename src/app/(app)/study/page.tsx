
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/hooks/use-app";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type TimerMode = "pomodoro" | "long" | "deep";
type Phase = "focus" | "break";

const modes = {
  pomodoro: { focus: 25, break: 5, label: "Pomodoro (25/5)" },
  long: { focus: 50, break: 10, label: "Bloque Largo (50/10)" },
  deep: { focus: 90, break: 20, label: "Deep Work (90/20)" },
};

const ADMIN_EMAILS = ['anavarrod@iestorredelpalau.cat', 'lrotav@iestorredelpalau.cat'];

export default function StudyPage() {
  const { user } = useApp();
  const router = useRouter();
  const { toast } = useToast();

  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [phase, setPhase] = useState<Phase>("focus");
  const [isActive, setIsActive] = useState(false);

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

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm shadow-xl">
          <CardContent className="p-6">
            <div className="flex justify-center mb-6">
              <div className="bg-muted p-1 rounded-full flex gap-1">
                {Object.keys(modes).map((key) => (
                  <Button
                    key={key}
                    variant={mode === key ? "default" : "ghost"}
                    size="sm"
                    className="rounded-full"
                    onClick={() => handleModeChange(key as TimerMode)}
                  >
                    {modes[key as TimerMode].label}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="relative flex items-center justify-center my-8">
                <div className="absolute">
                    <Progress value={progress} className="h-64 w-64 rounded-full [&>div]:bg-primary/10" />
                </div>
                <div className="relative w-56 h-56 rounded-full bg-background flex flex-col items-center justify-center shadow-inner">
                    <p className="font-mono text-6xl font-bold tracking-tighter">
                        {formatTime(timeLeft)}
                    </p>
                    <p className="text-sm font-semibold tracking-widest text-primary uppercase">
                        {phase === 'focus' ? 'ENFOQUE' : 'DESCANSO'}
                    </p>
                </div>
            </div>

            <div className="flex justify-center items-center gap-6 mt-8">
              <Button variant="ghost" size="icon" onClick={handleReset} className="h-14 w-14 rounded-full bg-muted/50">
                <RotateCcw className="h-6 w-6" />
              </Button>
              <Button onClick={handleToggle} className="h-20 w-20 rounded-full shadow-lg">
                {isActive ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSkip} className="h-14 w-14 rounded-full bg-muted/50">
                <SkipForward className="h-6 w-6" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

    