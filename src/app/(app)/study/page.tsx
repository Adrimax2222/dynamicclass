
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
  PlusCircle,
  Trash2,
  Timer,
  Brain,
  Plus,
  Settings2,
  Target,
  Sigma,
  Copy,
  History,
  Scale,
  ArrowRightLeft,
  Upload,
  Download,
  FileCheck2,
  RotateCw as RotateCwIcon, // Renamed to avoid conflict
  Crop,
  X,
  Check,
  Loader2,
  Palette,
  Save,
  Sparkles,
  BrainCircuit,
  TreePine,
  Camera,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { GradeCalculatorDialog } from "@/components/layout/grade-calculator-dialog";
import { useFirestore } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { WipDialog } from "@/components/layout/wip-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import jsPDF from 'jspdf';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from 'next/link';
import type { Center, TimerMode, CustomMode } from "@/lib/types";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from 'framer-motion';

// --- Plant Growth SVG Components ---

const Stage1Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500" {...props}>
        <motion.path 
            d="M250 450V350" 
            stroke="currentColor" strokeWidth="12" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
        />
        <motion.path 
            d="M250 350 C 200 330, 200 250, 250 230"
            fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }}
        />
        <motion.path 
            d="M250 350 C 300 330, 300 250, 250 230"
            fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.1 }}
        />
    </svg>
);

const Stage2Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500" {...props}>
        <motion.path 
            d="M250 450V230" 
            stroke="currentColor" strokeWidth="12" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }}
        />
        <motion.path 
            d="M250 390 C 170 370, 170 270, 250 250"
            fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
        />
        <motion.path 
            d="M250 390 C 330 370, 330 270, 250 250"
            fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}
        />
        <motion.path 
            d="M250 310 C 190 290, 190 210, 250 190"
            fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }}
        />
        <motion.path 
            d="M250 310 C 310 290, 310 210, 250 190"
            fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }}
        />
    </svg>
);

const Stage3Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500" {...props}>
        <motion.path 
            d="M250 450V190" 
            stroke="currentColor" strokeWidth="15" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }}
        />
        <motion.path 
            d="M170 310 L250 190 L330 310"
            fill="none" stroke="currentColor" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}
        />
        <motion.circle 
            cx="250" cy="150" r="90" 
            fill="currentColor"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.5 }}
        />
         <motion.circle 
            cx="150" cy="190" r="70" 
            fill="currentColor"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.6 }}
        />
         <motion.circle 
            cx="350" cy="190" r="70" 
            fill="currentColor"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.6 }}
        />
    </svg>
);

const Stage4Icon = Stage3Icon;

const Stage5Icon = Stage3Icon;


const PLANT_STAGES = [
    null,
    Stage1Icon,
    Stage2Icon,
    Stage3Icon,
    Stage4Icon,
    Stage5Icon
];


type Sound = {
    id: string;
    label: string;
    icon: React.ElementType;
    url: string;
} | null;

interface Playlist {
    id: string;
    name: string;
    url: string;
}

const defaultPlaylists: Playlist[] = [
    { id: "lofi", name: "Lofi", url: "https://open.spotify.com/embed/playlist/37i9dQZF1DZ06evO0FDzS8?utm_source=generator" },
    { id: "hits", name: "Exitos España", url: "https://open.spotify.com/embed/playlist/37i9dQZF1DXaxEKcoCdWHD?utm_source=generator" },
    { id: "jazz", name: "Jazz", url: "https://open.spotify.com/embed/playlist/37i9dQZF1DXbITWG1ZJKYt?utm_source=generator" },
    { id: "vgm", name: "Videojuegos", url: "https://open.spotify.com/embed/playlist/37i9dQZF1DXdfOcg1fm0VG?utm_source=generator" },
    { id: "focus", name: "Focus", url: "https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ?utm_source=generator" },
    { id: "phonk", name: "Phonk", url: "https://open.spotify.com/embed/playlist/37i9dQZF1DWWY64wDtewQt?utm_source=generator" },
    { id: "indiefolk", name: "Indie Folk", url: "https://open.spotify.com/embed/playlist/2MsGtroclirkNnI6snEoxk?utm_source=generator" },
    { id: "chilltracks", name: "Chill Tracks", url: "https://open.spotify.com/embed/playlist/37i9dQZF1DX6VdMW310YC7?utm_source=generator" },
    { id: "chillout", name: "Chill Out", url: "https://open.spotify.com/embed/playlist/37i9dQZF1DX32oVqaQE8BM?utm_source=generator" },
    { id: "piano", name: "Peaceful Piano", url: "https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO?utm_source=generator" },
    { id: "coffeejazz", name: "Coffee Table Jazz", url: "https://open.spotify.com/embed/playlist/37i9dQZF1DWVqfgj8NZEp1?utm_source=generator" },
];

const sounds: Sound[] = [
    { id: "rain", label: "Lluvia", icon: CloudRain, url: "https://firebasestorage.googleapis.com/v0/b/studio-7840988595-13b35.appspot.com/o/relaxing-rain-419012.mp3?alt=media&token=aa591a3a-8eed-42d0-9347-f8e0da836dcf" },
    { id: "cafe", label: "Cafetería", icon: Coffee, url: "https://firebasestorage.googleapis.com/v0/b/studio-7840988595-13b35.appspot.com/o/casual-cafe-restaurant-noise-73945.mp3?alt=media&token=bc050ad2-746b-410d-8fdb-c89c620f10c" },
    { id: "forest", label: "Bosque", icon: Trees, url: "https://firebasestorage.googleapis.com/v0/b/studio-7840988595-13b35.appspot.com/o/ambiente-de-bosque-arvi-ambix-17159.mp3?alt=media&token=3311c173-b307-4fbb-97ff-8450fbc3cdc8" },
    { id: "sea", label: "Mar", icon: Waves, url: "https://firebasestorage.googleapis.com/v0/b/studio-7840988595-13b35.appspot.com/o/mar-agitado-272999.mp3?alt=media&token=d7322a3a-6397-42eb-9039-b569be846fc7" },
    { id: "noise", label: "Ruido Blanco", icon: Waves, url: "https://firebasestorage.googleapis.com/v0/b/studio-7840988595-13b35.appspot.com/o/white-noise-358382.mp3?alt=media&token=e4fae111-a420-45f0-a75a-9a3e09d8a357" },
    { id: "nature", label: "Pájaros", icon: Leaf, url: "https://firebasestorage.googleapis.com/v0/b/studio-7840988595-13b35.appspot.com/o/birds-frogs-nature-8257.mp3?alt=media&token=462a8b0e-ffd7-46a0-917f-5510f4085649" },
    { id: "city", label: "Ciudad", icon: Building2, url: "https://firebasestorage.googleapis.com/v0/b/studio-7840988595-13b35.appspot.com/o/city-ambience-121693.mp3?alt=media&token=00c7c7fa-cba2-4a8a-b091-6d07e56262c0" },
    { id: "library", label: "Biblioteca", icon: BookOpen, url: "https://firebasestorage.googleapis.com/v0/b/studio-7840988595-13b35.appspot.com/o/biblioteca.mp3?alt=media&token=b60acf9f-d0c9-40f5-9cf4-0e63af7d9385" },
];


export default function StudyPage() {
    const { 
        user, 
        timerMode,
        setTimerMode,
        phase,
        setPhase,
        isActive,
        setIsActive,
        isFocusMode,
        setIsFocusMode,
        timeLeft,
        customMode,
        setCustomMode,
        resetTimer,
        skipPhase,
        plantCount,
    } = useApp();
    const router = useRouter();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [selectedSound, setSelectedSound] = useState<Sound>(null);
    const [volume, setVolume] = useState(100);
    
    const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
    const [activePlaylist, setActivePlaylist] = useState<Playlist>(defaultPlaylists[0]);
    const [isMounted, setIsMounted] = useState(false);
    const [isScheduleAvailable, setIsScheduleAvailable] = useState(false);
    const [plantStage, setPlantStage] = useState(0); 


    const audioRef = useRef<HTMLAudioElement>(null);

    const modes = useMemo(() => ({
        pomodoro: { focus: 25, break: 5, label: "Pomodoro", icon: Timer, colors: "from-blue-400 to-blue-500" },
        long: { focus: 50, break: 10, label: "Largo", icon: Brain, colors: "from-purple-400 to-purple-500" },
        deep: { focus: 90, break: 20, label: "Deep Work", icon: Brain, colors: "from-indigo-400 to-indigo-500" },
        custom: { focus: customMode.focus, break: customMode.break, label: "Personalizado", icon: Settings2, colors: "from-green-400 to-green-500" }
    }), [customMode]);
  
    useEffect(() => {
        setIsMounted(true);
        try {
            const savedPlaylists = localStorage.getItem('userPlaylists');
            if (savedPlaylists) {
                setUserPlaylists(JSON.parse(savedPlaylists));
            }
            const savedCustomMode = localStorage.getItem('customStudyMode');
            if (savedCustomMode) {
                setCustomMode(JSON.parse(savedCustomMode));
            }
        } catch (e) {
            console.error("Failed to parse data from localStorage", e);
        }
    }, [setCustomMode]);

    useEffect(() => {
        if (isMounted) {
            localStorage.setItem('userPlaylists', JSON.stringify(userPlaylists));
        }
    }, [userPlaylists, isMounted]);

    useEffect(() => {
        if (isMounted) {
            localStorage.setItem('customStudyMode', JSON.stringify(customMode));
        }
    }, [customMode, isMounted]);

    useEffect(() => {
        if (!firestore || !user || !user.organizationId) {
            setIsScheduleAvailable(false);
            return;
        }
        const checkSchedule = async () => {
            const centerDocRef = doc(firestore, 'centers', user.organizationId!);
            const centerDoc = await getDoc(centerDocRef);
            if (centerDoc.exists()) {
                const centerData = centerDoc.data() as Center;
                const userClassName = `${user.course.replace('eso','ESO')}-${user.className}`;
                const userClassDef = centerData.classes.find(c => c.name === userClassName);
                setIsScheduleAvailable(!!userClassDef?.schedule);
            } else {
                setIsScheduleAvailable(false);
            }
        };
        checkSchedule();
    }, [firestore, user]);

   useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (selectedSound && isActive) {
        if (audio.src !== selectedSound.url) {
            audio.src = selectedSound.url;
        }
        if (audio.paused) {
          audio.play().catch(error => console.log("Esperando interacción del usuario..."));
        }
    } else {
      audio.pause();
    }
  }, [selectedSound, isActive]);

    
    const handleToggleFocusMode = (checked: boolean) => {
        if (!isActive) return;
        setIsFocusMode(checked);
    };

    useEffect(() => {
        const exitFullScreen = () => {
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(err => console.error(err));
            }
        };

        if (isFocusMode && isActive) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error al activar pantalla completa: ${'\'\'\''}err.message${'\'\'\''}`);
                setIsFocusMode(false);
                toast({
                    title: "Error de Pantalla Completa",
                    description: "Tu navegador no permitió entrar en pantalla completa.",
                    variant: "destructive"
                });
            });
        } else {
            exitFullScreen();
        }

        return () => {
            exitFullScreen();
        };
    }, [isFocusMode, isActive, toast, setIsFocusMode]);


    const handleModeChange = (newMode: TimerMode) => {
        setIsActive(false);
        setIsFocusMode(false);
        setTimerMode(newMode);
        setPhase("focus");
    };

    const handleToggle = () => {
        const willBeActive = !isActive;
        if (!willBeActive) {
            setIsFocusMode(false);
        }
        setIsActive(willBeActive);
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
            setSelectedSound(null);
        } else {
            setSelectedSound(sound);
        }
    }

    const handlePlaylistChange = (playlistUrl: string) => {
      const allPlaylists = [...defaultPlaylists, ...userPlaylists];
      const newPlaylist = allPlaylists.find(p => p.url === playlistUrl);
      if (newPlaylist) {
          setActivePlaylist(newPlaylist);
      }
    }


    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    const formatStudyTime = (totalMinutes: number = 0) => {
        return `${totalMinutes}m`;
    };

    const progress = useMemo(() => {
        const totalDuration = modes[timerMode][phase] * 60;
        if (totalDuration === 0) return 100;
        return (timeLeft / totalDuration) * 100;
    }, [timeLeft, timerMode, phase, modes]);
    
    useEffect(() => {
        if (!isActive || phase !== 'focus') {
          if (plantStage !== 0) setPlantStage(0);
          return;
        }

        const totalDuration = modes[timerMode].focus * 60;
        const timeElapsed = totalDuration - timeLeft;
        
        const stageDuration = totalDuration / 5; // 5 stages
        
        let newStage = 0;
        if (timeElapsed >= stageDuration * 4) {
            newStage = 5;
        } else if (timeElapsed >= stageDuration * 3) {
            newStage = 4;
        } else if (timeElapsed >= stageDuration * 2) {
            newStage = 3;
        } else if (timeElapsed >= stageDuration) {
            newStage = 2;
        } else {
            newStage = 1;
        }
        
        if (newStage !== plantStage) {
            setPlantStage(newStage);
        }
    
    }, [isActive, phase, timeLeft, timerMode, modes, plantStage]);
  
    if (!user) return null;

    const streakCount = user.streak || 0;

    const phaseColors = phase === 'focus' 
        ? modes[timerMode].colors
        : "from-green-400 to-emerald-500";
    
    const CurrentPlantIcon = PLANT_STAGES[plantStage];
  
    return (
    <div className="flex flex-col h-screen bg-muted/30">
        <audio ref={audioRef} crossOrigin="anonymous" loop />
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
                <Link href="/study/collection">
                    <Badge variant="outline" className="flex items-center gap-1.5 bg-green-100 dark:bg-green-900/50 border-green-300 dark:border-green-700 cursor-pointer">
                        <TreePine className="h-4 w-4 text-green-600 dark:text-green-400"/>
                        <span className="font-bold text-green-700 dark:text-green-300">{plantCount}</span>
                    </Badge>
                </Link>
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
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        {Object.keys(modes).map((key) => {
                            const modeData = modes[key as TimerMode];
                            const Icon = modeData.icon;
                            const isCustom = key === 'custom';

                            const content = (
                                <button
                                    onClick={() => handleModeChange(key as TimerMode)}
                                    className={cn(
                                        "w-full flex flex-col items-center justify-center gap-1 p-3 rounded-lg border-2 transition-all duration-300",
                                        timerMode === key
                                            ? `border-transparent bg-gradient-to-br text-white shadow-lg ${modeData.colors}`
                                            : "border-dashed bg-muted/50 hover:bg-muted"
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span className="text-xs font-semibold">{modeData.label}</span>
                                    <span className="text-xs opacity-70">{modes[key as TimerMode].focus} min</span>
                                </button>
                            );

                            if (isCustom) {
                                return (
                                    <CustomTimerDialog key={key} customMode={customMode} setCustomMode={setCustomMode}>
                                        {content}
                                    </CustomTimerDialog>
                                )
                            }
                            return <div key={key}>{content}</div>;
                        })}
                    </div>
                    
                    <div className="relative flex items-center justify-center">
                       <div className="relative w-64 h-64 rounded-full bg-background flex flex-col items-center justify-center shadow-inner overflow-hidden">
                           <AnimatePresence>
                                {!isActive ? (
                                    <motion.div
                                        key="timer-inactive"
                                        className="flex flex-col items-center justify-center"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                    >
                                        <p className="font-mono text-6xl font-bold tracking-tighter">
                                            {formatTime(timeLeft)}
                                        </p>
                                        <p className="text-sm font-semibold tracking-widest text-primary uppercase">
                                            {phase === 'focus' ? 'ENFOQUE' : 'DESCANSO'}
                                        </p>
                                    </motion.div>
                                ) : (
                                    <>
                                        <motion.div
                                            key="timer-active"
                                            className="absolute top-4 text-center"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: 0.2 }}
                                        >
                                            <p className="font-mono text-3xl font-bold tracking-tighter">
                                                {formatTime(timeLeft)}
                                            </p>
                                            <p className="text-xs font-semibold tracking-widest text-primary uppercase">
                                                {phase === 'focus' ? 'ENFOQUE' : 'DESCANSO'}
                                            </p>
                                        </motion.div>
                                        
                                        <div className="flex items-center justify-center">
                                            <AnimatePresence mode="wait">
                                                {CurrentPlantIcon && (
                                                    <motion.div
                                                        key={plantStage}
                                                        initial={{ opacity: 0, scale: 0.5 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.5 }}
                                                        transition={{ duration: 0.5 }}
                                                        className="text-green-500 w-40 h-40 mt-8"
                                                    >
                                                        <CurrentPlantIcon className="w-full h-full" />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="flex items-center justify-center space-x-2 my-4">
                        <Switch 
                            id="focus-mode-switch" 
                            checked={isFocusMode} 
                            onCheckedChange={handleToggleFocusMode} 
                            disabled={!isActive}
                        />
                        <Label 
                            htmlFor="focus-mode-switch" 
                            className={cn("font-semibold", !isActive && "text-muted-foreground/50 cursor-not-allowed")}
                        >
                            Modo Enfoque
                        </Label>
                    </div>

                    <Progress value={100 - progress} className={cn("h-2", `[&>div]:bg-gradient-to-r ${phaseColors}`)} />

                    <div className="flex justify-between items-center gap-2 mt-6">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-14 w-14 rounded-full bg-muted/50">
                                    <Calculator className="h-6 w-6" />
                                </Button>
                            </DialogTrigger>
                            <ScienceCalculatorDialog />
                        </Dialog>
                        <Button variant="ghost" size="icon" onClick={resetTimer} className="h-14 w-14 rounded-full bg-muted/50">
                            <RotateCcw className="h-6 w-6" />
                        </Button>
                        <Button onClick={handleToggle} className={cn("h-20 w-20 rounded-full shadow-lg bg-gradient-to-br", phaseColors)}>
                            {isActive ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={skipPhase} className="h-14 w-14 rounded-full bg-muted/50">
                            <SkipForward className="h-6 w-6" />
                        </Button>
                        <GradeCalculatorDialog isScheduleAvailable={isScheduleAvailable} user={user}>
                             <Button variant="ghost" size="icon" className="h-14 w-14 rounded-full bg-muted/50">
                                <Target className="h-6 w-6" />
                            </Button>
                        </GradeCalculatorDialog>
                    </div>
                </CardContent>
            </Card>

            <Alert className="w-full max-w-sm mx-auto bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-200 [&>svg]:text-amber-500">
                <Flame className="h-4 w-4" />
                <AlertTitle className="font-semibold">¡A por la racha!</AlertTitle>
                <AlertDescription className="text-xs">
                    Las sesiones de 7 minutos o más cuentan para tu racha diaria y te recompensan con una planta nueva para tu jardín.
                </AlertDescription>
            </Alert>
            
            <Card className="w-full max-w-sm mx-auto shadow-lg">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <TreePine className="h-5 w-5 text-primary"/>
                        Mis Plantas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Button asChild className="w-full bg-green-500 hover:bg-green-600">
                       <Link href="/study/collection">
                            <TreePine className="mr-2 h-4 w-4" />
                            Ver mi colección
                       </Link>
                    </Button>
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
                            if (!sound) return null;
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
            
            <Card className="w-full max-w-sm mx-auto shadow-lg">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Music className="h-5 w-5 text-primary"/>
                        Control de Música
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center gap-2">
                        <Select onValueChange={handlePlaylistChange} value={activePlaylist.url}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecciona un género..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Playlists Sugeridas</SelectLabel>
                                    {defaultPlaylists.map(playlist => (
                                        <SelectItem key={playlist.id} value={playlist.url}>
                                            {playlist.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                                {userPlaylists.length > 0 && (
                                    <SelectGroup>
                                        <SelectLabel>Mis Playlists</SelectLabel>
                                        {userPlaylists.map(playlist => (
                                            <SelectItem key={playlist.id} value={playlist.url}>
                                                {playlist.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                )}
                            </SelectContent>
                        </Select>
                        <PlaylistManagerDialog 
                            userPlaylists={userPlaylists} 
                            setUserPlaylists={setUserPlaylists}
                        />
                    </div>
                    <div className="aspect-video w-full">
                        <iframe 
                            key={activePlaylist.id}
                            title={activePlaylist.name}
                            style={{borderRadius: "12px"}}
                            src={activePlaylist.url}
                            width="100%" 
                            height="100%" 
                            frameBorder="0" 
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                            loading="lazy"
                        ></iframe>
                    </div>
                </CardContent>
            </Card>

             <Card className="w-full max-w-sm mx-auto shadow-lg">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Grid className="h-5 w-5 text-primary"/>
                        Herramientas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="flex">
                            <GradeCalculatorDialog isScheduleAvailable={isScheduleAvailable} user={user}>
                                <div className="relative p-4 rounded-lg bg-gradient-to-br from-red-400 to-pink-500 text-white overflow-hidden cursor-pointer hover:scale-105 transition-transform flex-1">
                                    <div className="relative z-10">
                                        <h3 className="font-bold">Nota Necesaria</h3>
                                        <p className="text-xs opacity-80">Calcula cuánto necesitas para aprobar.</p>
                                    </div>
                                    <Percent className="absolute -right-2 -bottom-2 h-16 w-16 opacity-10" />
                                    <Calculator className="absolute top-2 right-2 h-6 w-6 opacity-20" />
                                </div>
                            </GradeCalculatorDialog>
                       </div>
                       <div className="flex">
                            <ScannerDialog>
                                <div
                                    className="relative p-4 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 text-white overflow-hidden cursor-pointer hover:scale-105 transition-transform flex-1"
                                >
                                    <div className="relative z-10">
                                        <h3 className="font-bold">Escanear</h3>
                                        <p className="text-xs opacity-80">Digitaliza tus apuntes al instante.</p>
                                    </div>
                                    <ScanLine className="absolute -right-2 -bottom-2 h-16 w-16 opacity-10" />
                                </div>
                            </ScannerDialog>
                       </div>
                       <div className="flex">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <div className="relative p-4 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 text-white overflow-hidden cursor-pointer hover:scale-105 transition-transform flex-1">
                                        <div className="relative z-10">
                                            <h3 className="font-bold">Calculadora</h3>
                                            <p className="text-xs opacity-80">Acceso rápido a la calculadora científica.</p>
                                        </div>
                                        <Sigma className="absolute -right-2 -bottom-2 h-16 w-16 opacity-10" />
                                    </div>
                                </DialogTrigger>
                                <ScienceCalculatorDialog />
                            </Dialog>
                       </div>
                       <div className="flex">
                            <Link href="/scanner" className="flex-1">
                                <div className="relative p-4 rounded-lg bg-gradient-to-br from-purple-400 to-violet-500 text-white overflow-hidden cursor-pointer hover:scale-105 transition-transform flex-1 h-full">
                                    <div className="relative z-10">
                                        <h3 className="font-bold">Documentos</h3>
                                        <p className="text-xs opacity-80">Historial de tus apuntes escaneados.</p>
                                    </div>
                                    <FileCheck2 className="absolute -right-2 -bottom-2 h-16 w-16 opacity-10" />
                                </div>
                            </Link>
                       </div>
                    </div>
                    <Link href="/editor" className="block mt-4">
                        <div className="relative p-4 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 text-white overflow-hidden cursor-pointer hover:scale-105 transition-transform">
                             <div className="relative z-10">
                                <h3 className="font-bold">Editor Mágico</h3>
                                <p className="text-xs opacity-80">Transforma tus apuntes con IA.</p>
                            </div>
                            <Sparkles className="absolute -right-2 -bottom-2 h-16 w-16 opacity-10" />
                            <BrainCircuit className="absolute top-2 right-2 h-6 w-6 opacity-20" />
                        </div>
                    </Link>
                </CardContent>
            </Card>

        </main>
      </ScrollArea>
    </div>
  );
}

interface CropData {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface Page {
    id: number;
    originalSrc: string;
    processedSrc: string;
    rotation: number;
    crop: CropData | null;
    isColor: boolean;
}

function ScannerDialog({ children }: { children: React.ReactNode }) {
    const { saveScannedDocs } = useApp();
    const [pages, setPages] = useState<Page[]>([]);
    const [activePageId, setActivePageId] = useState<number | null>(null);
    const [mode, setMode] = useState<'capture' | 'preview'>('capture');
    
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [fileName, setFileName] = useState('apuntes-escaneados.pdf');
    const [isSaving, setIsSaving] = useState(false);
    
    const [isCropping, setIsCropping] = useState(false);
    const [startCropPoint, setStartCropPoint] = useState<{ x: number; y: number } | null>(null);
    
    const [stream, setStream] = useState<MediaStream | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const previewContainerRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    const activePage = useMemo(() => pages.find(p => p.id === activePageId), [pages, activePageId]);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsCameraActive(false);
    }, [stream]);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);


    useEffect(() => {
        return () => { // Cleanup on unmount
            stopCamera();
        };
    }, [stopCamera]);

    const getCameraPermission = async () => {
        try {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setHasCameraPermission(true);
            setIsCameraActive(true);
            setStream(mediaStream);
        } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            setIsCameraActive(false);
            setStream(null);
            toast({
                variant: 'destructive',
                title: 'Acceso a la Cámara Denegado',
                description: 'Por favor, activa los permisos de cámara en tu navegador.',
            });
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                processNewImage(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const takePicture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/png');
                processNewImage(dataUrl);
            }
        }
    };
    
    const processNewImage = (src: string) => {
        const img = new Image();
        img.onload = () => {
            const newPage: Page = {
                id: Date.now(),
                originalSrc: src,
                processedSrc: '',
                rotation: 0,
                crop: null,
                isColor: false,
            };
            
            const processedSrc = processImage(img, newPage.rotation, null, newPage.isColor);
            
            setPages(prev => [...prev, { ...newPage, processedSrc }]);
            setActivePageId(newPage.id);
            setMode('preview');
            stopCamera();
        };
        img.src = src;
    };
    
    const processImage = (img: HTMLImageElement, angleDegrees: number, crop: CropData | null, isColor: boolean): string => {
        const canvas = canvasRef.current;
        if (!canvas) return '';
        const context = canvas.getContext('2d');
        if (!context) return '';
        
        const angle = angleDegrees * Math.PI / 180;
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);
        
        let sourceX = 0, sourceY = 0, sourceWidth = img.width, sourceHeight = img.height;

        if (crop) {
            sourceX = crop.x;
            sourceY = crop.y;
            sourceWidth = crop.width;
            sourceHeight = crop.height;
        }
        
        const newWidth = Math.abs(sourceWidth * cos) + Math.abs(sourceHeight * sin);
        const newHeight = Math.abs(sourceWidth * sin) + Math.abs(sourceHeight * cos);

        canvas.width = newWidth;
        canvas.height = newHeight;

        context.translate(newWidth / 2, newHeight / 2);
        context.rotate(angle);

        if (!isColor) {
            context.filter = 'grayscale(100%) contrast(1.7)';
        }
        
        context.drawImage(
            img, 
            sourceX, sourceY, sourceWidth, sourceHeight,
            -sourceWidth/2, -sourceHeight/2, sourceWidth, sourceHeight
        );
        
        context.filter = 'none';
        context.setTransform(1, 0, 0, 1, 0, 0);

        return canvas.toDataURL('image/jpeg');
    };
    
    const updatePage = (id: number, updates: Partial<Page>) => {
        setPages(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    }

    const handleRotate = () => {
        if (!activePage) return;
        const newRotation = (activePage.rotation + 90) % 360;
        const img = new Image();
        img.onload = () => {
            const processedSrc = processImage(img, newRotation, null, activePage.isColor);
            updatePage(activePage.id, { rotation: newRotation, processedSrc, crop: null });
        }
        img.src = activePage.originalSrc;
    };

    const handleToggleColor = () => {
        if (!activePage) return;
        const newIsColor = !activePage.isColor;
        const img = new Image();
        img.onload = () => {
            const processedSrc = processImage(img, activePage.rotation, activePage.crop, newIsColor);
            updatePage(activePage.id, { processedSrc, isColor: newIsColor });
        };
        img.src = activePage.originalSrc;
    };
    
    const handleCropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isCropping || !previewContainerRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setStartCropPoint({ x, y });
    };

    const handleCropMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isCropping || !startCropPoint || !previewContainerRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        updatePage(activePageId!, { crop: {
            x: Math.min(startCropPoint.x, currentX),
            y: Math.min(startCropPoint.y, currentY),
            width: Math.abs(currentX - startCropPoint.x),
            height: Math.abs(currentY - startCropPoint.y),
        }});
    };
    
    const handleCropMouseUp = () => {
        setStartCropPoint(null);
    };

    const handleApplyCrop = () => {
        if (!activePage || !activePage.crop || !previewContainerRef.current) return;

        const img = new Image();
        img.onload = () => {
            const container = previewContainerRef.current!;
            const renderedImg = container.querySelector('img');
            if (!renderedImg) return;
            
            const { naturalWidth, naturalHeight } = img;
            
            const imageAspectRatio = naturalWidth / naturalHeight;
            const containerAspectRatio = container.clientWidth / container.clientHeight;

            let renderWidth: number, renderHeight: number;
            let offsetX = 0, offsetY = 0;

            if (imageAspectRatio > containerAspectRatio) {
                renderWidth = container.clientWidth;
                renderHeight = renderWidth / imageAspectRatio;
                offsetY = (container.clientHeight - renderHeight) / 2;
            } else {
                renderHeight = container.clientHeight;
                renderWidth = renderHeight * imageAspectRatio;
                offsetX = (container.clientWidth - renderWidth) / 2;
            }
            
            const scaleX = naturalWidth / renderWidth;
            const scaleY = naturalHeight / renderHeight;
            
            const actualCropData: CropData = {
                x: (activePage.crop!.x - offsetX) * scaleX,
                y: (activePage.crop!.y - offsetY) * scaleY,
                width: activePage.crop!.width * scaleX,
                height: activePage.crop!.height * scaleY,
            };
            
            const processedSrc = processImage(img, activePage.rotation, actualCropData, activePage.isColor);
            updatePage(activePage.id, { processedSrc, crop: null });
        };
        img.src = activePage.originalSrc;
        setIsCropping(false);
    };

    const resetEdits = () => {
        if (!activePage) return;
        const img = new Image();
        img.onload = () => {
            const processedSrc = processImage(img, 0, null, false);
            updatePage(activePage.id, { processedSrc, rotation: 0, crop: null, isColor: false });
        }
        img.src = activePage.originalSrc;
    };

    const downloadAsPDF = async () => {
        if (pages.length === 0) return;
        setIsSaving(true);
        
        try {
            const pdf = new jsPDF();
            
            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                if (i > 0) {
                    pdf.addPage();
                }

                const img = new Image();
                img.src = page.processedSrc;
                await new Promise(resolve => { img.onload = resolve; });

                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const ratio = Math.min(pdfWidth / img.width, pdfHeight / img.height);
                const imgWidth = img.width * ratio;
                const imgHeight = img.height * ratio;
                const x = (pdfWidth - imgWidth) / 2;
                const y = (pdfHeight - imgHeight) / 2;

                pdf.addImage(img, 'JPEG', x, y, imgWidth, imgHeight);
            }
            
            pdf.save(fileName);
            
            if (saveScannedDocs) {
              const savedDocsString = localStorage.getItem('scannedDocuments');
              const savedDocs = savedDocsString ? JSON.parse(savedDocsString) : [];
              const newDoc = {
                  id: Date.now(),
                  name: fileName,
                  timestamp: new Date().toISOString(),
                  thumbnail: pages[0].processedSrc,
                  pages: pages.map(p => p.processedSrc)
              };
              savedDocs.push(newDoc);
              localStorage.setItem('scannedDocuments', JSON.stringify(savedDocs));
              toast({ title: 'PDF Descargado y Guardado', description: `Se ha guardado "${fileName}" en tu historial.` });
            } else {
              toast({ title: 'PDF Descargado', description: `El guardado en el historial está desactivado.` });
            }

        } catch (error) {
            console.error("Error creating PDF", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo generar el PDF.' });
        } finally {
            setIsSaving(false);
        }
    };
    
    const deletePage = (id: number) => {
        const newPages = pages.filter(p => p.id !== id);
        setPages(newPages);
        if (activePageId === id) {
            setActivePageId(newPages.length > 0 ? newPages[0].id : null);
        }
        if (newPages.length === 0) {
            setMode('capture');
        }
    }

    const resetScanner = () => {
        setPages([]);
        setActivePageId(null);
        setMode('capture');
        setHasCameraPermission(null);
        setIsCropping(false);
        stopCamera();
    };
    
    const renderCaptureUI = () => {
        return (
             <div className="flex flex-col items-center justify-center space-y-4 p-4 h-full">
                <Button onClick={getCameraPermission} className="w-full max-w-xs">
                    <Camera className="mr-2 h-4 w-4" /> Usar Cámara
                </Button>
                <Button onClick={() => fileInputRef.current?.click()} className="w-full max-w-xs">
                    <Upload className="mr-2 h-4 w-4" /> Subir Archivo
                </Button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden"/>
                {hasCameraPermission === false && (
                    <Alert variant="destructive" className="max-w-xs">
                        <AlertDescription>
                            El acceso a la cámara fue denegado.
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        );
    };

    return (
        <Dialog onOpenChange={(open) => !open && resetScanner()}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-xl w-[95vw] flex flex-col h-[90vh]">
                 <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><ScanLine className="h-5 w-5"/> Escáner de Apuntes</DialogTitle>
                    <DialogDescription>
                        Captura, edita y agrupa imágenes para crear un único PDF.
                    </DialogDescription>
                </DialogHeader>
                <div className="relative flex-grow flex flex-col min-h-0 space-y-4">
                    <div className="flex-grow min-h-0 relative border rounded-lg bg-muted/30 flex items-center justify-center">
                        {mode === 'capture' && !isCameraActive && (
                            <div className="bg-background p-8 rounded-lg shadow-2xl border">
                                {renderCaptureUI()}
                            </div>
                        )}

                        {isCameraActive && (
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 bg-background">
                                <video ref={videoRef} className="w-full max-w-lg aspect-video rounded-md bg-muted" autoPlay muted playsInline />
                                <div className="flex items-center gap-4 mt-4">
                                    <Button onClick={stopCamera} variant="outline">
                                        Cancelar
                                    </Button>
                                    <Button onClick={takePicture} className="h-16 w-16 rounded-full">
                                        <Camera className="h-8 w-8" />
                                    </Button>
                                </div>
                            </div>
                        )}
                        
                        {pages.length > 0 && activePage && mode === 'preview' ? (
                             <div 
                                ref={previewContainerRef}
                                className="w-full h-full flex items-center justify-center p-2"
                                onDragStart={(e) => e.preventDefault()}
                                onMouseDown={handleCropMouseDown}
                                onMouseMove={handleCropMouseMove}
                                onMouseUp={handleCropMouseUp}
                                onMouseLeave={handleCropMouseUp}
                            >
                                <img src={activePage.processedSrc} alt={`Page ${activePage.id}`} className={cn("max-w-full max-h-full h-auto w-auto object-contain", isCropping && "cursor-crosshair border-2 border-primary border-dashed")} />
                                {isCropping && activePage.crop && (
                                    <div
                                        className="absolute border-2 border-dashed border-primary bg-primary/20 pointer-events-none"
                                        style={{
                                            left: activePage.crop.x,
                                            top: activePage.crop.y,
                                            width: activePage.crop.width,
                                            height: activePage.crop.height,
                                        }}
                                    />
                                )}
                            </div>
                        ) : (
                           mode === 'preview' && (
                             <div className="text-center text-muted-foreground p-8">
                                <p>Añade una página para empezar</p>
                            </div>
                           )
                        )}
                    </div>
                    
                    <ScrollArea>
                         <div className="flex items-center gap-2 p-2">
                            {pages.map((p, index) => (
                                <div key={p.id} className="relative group shrink-0" onClick={() => setActivePageId(p.id)}>
                                     <img 
                                        src={p.processedSrc} 
                                        alt={`Thumbnail ${index + 1}`}
                                        className={cn(
                                            "h-20 w-20 object-cover rounded-md border-2 cursor-pointer transition-all",
                                            activePageId === p.id ? "border-primary shadow-lg scale-105" : "border-transparent hover:border-primary/50"
                                        )}
                                     />
                                     <Button 
                                        variant="destructive" size="icon"
                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => { e.stopPropagation(); deletePage(p.id); }}
                                     >
                                        <X className="h-4 w-4" />
                                     </Button>
                                     <div className="absolute bottom-1 left-1 bg-background/70 text-xs font-bold px-1.5 py-0.5 rounded-full">{index + 1}</div>
                                </div>
                            ))}
                              <button
                                onClick={() => { setIsCameraActive(false); setMode('capture'); }}
                                className="h-20 w-20 flex flex-col items-center justify-center rounded-md border-2 border-dashed bg-muted/50 hover:bg-muted hover:border-primary transition-colors shrink-0"
                              >
                                <PlusCircle className="h-6 w-6 text-muted-foreground" />
                                <span className="text-xs mt-1 text-muted-foreground">Añadir</span>
                              </button>
                        </div>
                    </ScrollArea>
                </div>
                
                <DialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-2">
                     <div className="flex items-center gap-2">
                        <Button onClick={handleRotate} variant="outline" size="icon" disabled={!activePage}><RotateCwIcon className="h-4 w-4" /></Button>
                        <Button onClick={() => setIsCropping(!isCropping)} variant={isCropping ? "default" : "outline"} size="icon" disabled={!activePage} className={cn(isCropping && "ring-2 ring-primary ring-offset-2")}>
                          <Crop className="h-4 w-4" />
                        </Button>
                        <Button onClick={handleToggleColor} variant={activePage?.isColor ? "default" : "outline"} size="icon" disabled={!activePage} className={cn(activePage?.isColor && "ring-2 ring-primary ring-offset-2")}>
                            <Palette className="h-4 w-4" />
                        </Button>
                        <Button onClick={resetEdits} variant="outline" size="icon" aria-label="Restablecer edición" disabled={!activePage}><RotateCcw className="h-4 w-4 text-red-500" /></Button>
                        {isCropping && (
                            <Button onClick={handleApplyCrop} variant="secondary" className="flex-1">
                                <Check className="mr-2 h-4 w-4" /> Aplicar Recorte
                            </Button>
                        )}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="pdf-filename">Nombre del Archivo</Label>
                        <Input id="pdf-filename" value={fileName} onChange={e => setFileName(e.target.value)} />
                     </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Button onClick={resetScanner} variant="outline">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Limpiar Todo
                        </Button>
                        <Button onClick={downloadAsPDF} disabled={isSaving || pages.length === 0}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Download className="mr-2 h-4 w-4" />}
                            Descargar PDF
                        </Button>
                    </div>
                </DialogFooter>
                 <canvas ref={canvasRef} className="hidden" />
            </DialogContent>
        </Dialog>
    );
}

function CustomTimerDialog({ children, customMode, setCustomMode }: { children: React.ReactNode, customMode: CustomMode, setCustomMode: (mode: CustomMode) => void }) {
    const { setCustomMode: setGlobalCustomMode } = useApp();
    const [focus, setFocus] = useState(customMode.focus.toString());
    const [rest, setRest] = useState(customMode.break.toString());
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();

    const handleSave = () => {
        const focusNum = parseInt(focus, 10);
        const restNum = parseInt(rest, 10);

        if (!isNaN(focusNum) && !isNaN(restNum) && focusNum >= 7 && restNum > 0) {
            setGlobalCustomMode({ focus: focusNum, break: restNum });
            setIsOpen(false);
        } else {
            toast({
                title: "Tiempo no válido",
                description: "El tiempo de enfoque debe ser de al menos 7 minutos.",
                variant: "destructive",
            });
        }
    };
    
    useEffect(() => {
        if(isOpen) {
            setFocus(customMode.focus.toString());
            setRest(customMode.break.toString());
        }
    }, [isOpen, customMode]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Temporizador Personalizado</DialogTitle>
                    <DialogDescription>
                        Define tus propios tiempos de estudio y descanso.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="focus-time">Minutos de Enfoque</Label>
                        <Input 
                            id="focus-time" 
                            type="number" 
                            value={focus} 
                            onChange={(e) => setFocus(e.target.value)} 
                            placeholder="Ej: 45"
                            min="7"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="break-time">Minutos de Descanso</Label>
                        <Input 
                            id="break-time" 
                            type="number" 
                            value={rest}
                            onChange={(e) => setRest(e.target.value)}
                            placeholder="Ej: 15"
                            min="1"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button onClick={handleSave}>Guardar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function PlaylistManagerDialog({ userPlaylists, setUserPlaylists }: { userPlaylists: Playlist[], setUserPlaylists: React.Dispatch<React.SetStateAction<Playlist[]>>}) {
    const { toast } = useToast();
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [newPlaylistUrl, setNewPlaylistUrl] = useState("");

    const extractPlaylistId = (url: string): string | null => {
        const regex = /playlist\/([a-zA-Z0-9]+)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    const handleAddPlaylist = () => {
        if (!newPlaylistName.trim() || !newPlaylistUrl.trim()) {
            toast({ title: "Error", description: "El nombre y la URL no pueden estar vacíos.", variant: "destructive"});
            return;
        }

        const playlistId = extractPlaylistId(newPlaylistUrl);
        if (!playlistId) {
            toast({ title: "URL no válida", description: "Asegúrate de que la URL es una URL de playlist de Spotify válida.", variant: "destructive"});
            return;
        }

        const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator`;
        
        const newPlaylist: Playlist = {
            id: `user-${Date.now()}`,
            name: newPlaylistName,
            url: embedUrl,
        };

        setUserPlaylists(prev => [...prev, newPlaylist]);
        setNewPlaylistName("");
        setNewPlaylistUrl("");
        toast({ title: "¡Playlist añadida!", description: `"${newPlaylist.name}" se ha guardado.`});
    };
    
    const handleDeletePlaylist = (id: string) => {
        setUserPlaylists(prev => prev.filter(p => p.id !== id));
        toast({ title: "Playlist eliminada", variant: "destructive"});
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Gestionar playlists">
                    <PlusCircle className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Gestionar Mis Playlists</DialogTitle>
                    <DialogDescription>Añade o elimina tus playlists personalizadas de Spotify.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="playlist-name">Nombre de la Playlist</Label>
                        <Input id="playlist-name" value={newPlaylistName} onChange={(e) => setNewPlaylistName(e.target.value)} placeholder="Ej: Mi Playlist de Estudio"/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="playlist-url">URL de la Playlist de Spotify</Label>
                        <Input id="playlist-url" value={newPlaylistUrl} onChange={(e) => setNewPlaylistUrl(e.target.value)} placeholder="https://open.spotify.com/playlist/..."/>
                    </div>
                     <Button onClick={handleAddPlaylist} className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" /> Añadir Playlist
                     </Button>
                </div>
                
                 {userPlaylists.length > 0 && (
                    <div className="space-y-2 pt-4 border-t">
                        <h4 className="font-semibold text-sm">Mis Playlists Guardadas</h4>
                        <ScrollArea className="h-40">
                             <div className="space-y-2 pr-4">
                                {userPlaylists.map(playlist => (
                                    <div key={playlist.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                        <p className="text-sm font-medium truncate">{playlist.name}</p>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDeletePlaylist(playlist.id)}>
                                            <Trash2 className="h-4 w-4"/>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                )}
                
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cerrar</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function ScienceCalculatorDialog() {
    const [expression, setExpression] = useState<string>("");
    const [display, setDisplay] = useState<string>("0");
    const [history, setHistory] = useState<string[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const { toast } = useToast();

    const handleInput = (char: string) => {
        if (display === "Error") {
            setDisplay("0");
            setExpression("");
        }
        
        if (display === "0" && "123456789.()".indexOf(char) === -1) {
             setExpression(prev => prev + char);
             setDisplay(char);
        } else if (display === "0" && "123456789.()".indexOf(char) > -1) {
            setDisplay(char);
            setExpression(char);
        }
        else {
            setDisplay(prev => prev + char);
            setExpression(prev => prev + char);
        }
    };
    
    const handleOperator = (op: string) => {
        setExpression(prev => prev + op);
        setDisplay(prev => prev + op);
    };

    const handleConstant = (name: string, value: number) => {
        handleInput(String(value));
    };

    const calculateResult = () => {
        if (!expression) return;
        try {
            // Replace visual operators with evaluatable ones
            let evalExpr = expression
                .replace(/√/g, 'Math.sqrt')
                .replace(/∛/g, 'Math.cbrt')
                .replace(/π/g, 'Math.PI')
                .replace(/e/g, 'Math.E')
                .replace(/sin\(/g, 'Math.sin(Math.PI / 180 *')
                .replace(/cos\(/g, 'Math.cos(Math.PI / 180 *')
                .replace(/tan\(/g, 'Math.tan(Math.PI / 180 *')
                .replace(/ln\(/g, 'Math.log(')
                .replace(/log\(/g, 'Math.log10(')
                .replace(/G/g, '9.8')
                .replace(/c/g, '299792458')
                .replace(/h/g, '6.62607015e-34')
                .replace(/\^/g, '**');

            const result = new Function('return ' + evalExpr)();
            if (typeof result !== 'number' || isNaN(result)) {
                throw new Error("Invalid calculation");
            }
            
            const resultString = String(result);
            setDisplay(resultString);
            setExpression(resultString);
            setHistory(prev => [`${expression} = ${resultString}`, ...prev].slice(0, 10));
        } catch (e) {
            setDisplay("Error");
            setExpression("");
        }
    };

    const clear = () => {
        setExpression("");
        setDisplay("0");
    };
    
    const backspace = () => {
        setExpression(prev => prev.slice(0, -1));
        setDisplay(prev => prev.slice(0, -1) || "0");
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(display);
        toast({ title: "Resultado copiado al portapapeles" });
    }

    const useFromHistory = (calc: string) => {
        const result = calc.split(" = ")[1];
        if (result) {
            setDisplay(result);
            setExpression(result);
            setShowHistory(false);
        }
    }

    return (
        <DialogContent className="max-w-lg w-full">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Sigma className="h-5 w-5"/> Calculadora Científica</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 relative">
                <div className="p-4 bg-muted rounded-lg text-right break-all min-h-[96px]">
                    <div className="text-xs text-muted-foreground h-5 flex justify-end items-center gap-2">
                        <span>{expression || " "}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyToClipboard}><Copy className="h-3 w-3"/></Button>
                    </div>
                    <div className="text-4xl font-bold text-foreground">{display}</div>
                </div>

                {showHistory && (
                    <Card className="absolute top-0 left-0 right-0 z-10 p-4 bg-background/95 backdrop-blur-sm">
                        <h4 className="font-semibold mb-2">Historial</h4>
                        <ScrollArea className="h-48">
                            {history.length > 0 ? (
                                history.map((calc, i) => (
                                    <div key={i} className="text-sm p-2 rounded hover:bg-muted cursor-pointer" onClick={() => useFromHistory(calc)}>
                                        {calc}
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center pt-8">No hay historial.</p>
                            )}
                        </ScrollArea>
                        <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => setShowHistory(false)}>Cerrar</Button>
                    </Card>
                )}

                <div className="grid grid-cols-5 gap-2">
                    {/* Scientific Functions */}
                    <Button onClick={() => handleOperator('^')} variant="outline" className="h-12 bg-accent/10 text-accent font-semibold">xʸ</Button>
                    <Button onClick={() => handleOperator('√(')} variant="outline" className="h-12 bg-accent/10 text-accent font-semibold">√</Button>
                    <Button onClick={() => handleOperator('sin(')} variant="outline" className="h-12 bg-accent/10 text-accent font-semibold">sin</Button>
                    <Button onClick={() => handleOperator('cos(')} variant="outline" className="h-12 bg-accent/10 text-accent font-semibold">cos</Button>
                    <Button onClick={() => handleOperator('tan(')} variant="outline" className="h-12 bg-accent/10 text-accent font-semibold">tan</Button>
                    <Button onClick={() => handleOperator('(')} variant="outline" className="h-12 bg-accent/10 text-accent font-semibold">(</Button>
                    <Button onClick={() => handleOperator(')')} variant="outline" className="h-12 bg-accent/10 text-accent font-semibold">)</Button>
                    <Button onClick={() => handleConstant('π', Math.PI)} variant="outline" className="h-12 bg-accent/10 text-accent font-semibold">π</Button>
                    <Button onClick={() => handleConstant('e', Math.E)} variant="outline" className="h-12 bg-accent/10 text-accent font-semibold">e</Button>
                    <Button onClick={() => handleOperator('log(')} variant="outline" className="h-12 bg-accent/10 text-accent font-semibold">log</Button>
                    <Button onClick={() => handleOperator('ln(')} variant="outline" className="h-12 bg-accent/10 text-accent font-semibold">ln</Button>
                    <Button onClick={() => handleConstant('G', 9.8)} variant="outline" className="h-12 bg-accent/10 text-accent font-semibold">G</Button>
                    <Button onClick={() => handleConstant('c', 299792458)} variant="outline" className="h-12 bg-accent/10 text-accent font-semibold">c</Button>
                    <Button onClick={() => handleConstant('h', 6.62607015e-34)} variant="outline" className="h-12 bg-accent/10 text-accent font-semibold">h</Button>
                    <UnitConverterDialog>
                      <Button variant="outline" className="h-12 bg-accent/10 text-accent"><Scale className="h-5 w-5"/></Button>
                    </UnitConverterDialog>


                    {/* Basic Operations & Numbers */}
                    <Button onClick={() => clear()} variant="destructive" className="h-12 text-lg font-bold">C</Button>
                    <Button onClick={() => backspace()} variant="destructive" className="h-12 font-bold">⌫</Button>
                    <Button onClick={() => handleOperator('%')} variant="outline" className="h-12 text-lg bg-primary/20 text-primary">%</Button>
                    <Button onClick={() => handleOperator('/')} variant="outline" className="h-12 text-lg bg-primary/20 text-primary">÷</Button>
                    <Button onClick={() => setShowHistory(!showHistory)} variant="outline" className="h-12 text-lg"><History className="h-5 w-5"/></Button>

                    
                    <Button onClick={() => handleInput('7')} variant="outline" className="h-12 text-lg font-bold">7</Button>
                    <Button onClick={() => handleInput('8')} variant="outline" className="h-12 text-lg font-bold">8</Button>
                    <Button onClick={() => handleInput('9')} variant="outline" className="h-12 text-lg font-bold">9</Button>
                    <Button onClick={() => handleOperator('*')} variant="outline" className="h-12 text-lg bg-primary/20 text-primary">×</Button>
                    <div></div>

                    <Button onClick={() => handleInput('4')} variant="outline" className="h-12 text-lg font-bold">4</Button>
                    <Button onClick={() => handleInput('5')} variant="outline" className="h-12 text-lg font-bold">5</Button>
                    <Button onClick={() => handleInput('6')} variant="outline" className="h-12 text-lg font-bold">6</Button>
                    <Button onClick={() => handleOperator('-')} variant="outline" className="h-12 text-lg bg-primary/20 text-primary">−</Button>
                    <div></div>

                    <Button onClick={() => handleInput('1')} variant="outline" className="h-12 text-lg font-bold">1</Button>
                    <Button onClick={() => handleInput('2')} variant="outline" className="h-12 text-lg font-bold">2</Button>
                    <Button onClick={() => handleInput('3')} variant="outline" className="h-12 text-lg font-bold">3</Button>
                    <Button onClick={() => handleOperator('+')} variant="outline" className="h-12 text-lg bg-primary/20 text-primary">+</Button>
                    <div></div>

                    <Button onClick={() => handleInput('0')} variant="outline" className="h-12 text-lg col-span-2 font-bold">0</Button>
                    <Button onClick={() => handleInput('.')} variant="outline" className="h-12 text-lg font-bold">.</Button>
                    <Button onClick={calculateResult} className="h-12 text-2xl col-span-2 bg-primary hover:bg-primary/90 shadow-md">=</Button>
                </div>
            </div>
        </DialogContent>
    );
}

function UnitConverterDialog({ children }: { children: React.ReactNode }) {
    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-md w-full">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><Scale className="h-5 w-5"/> Conversor de Unidades</DialogTitle>
                </DialogHeader>
                <UnitConverter />
                 <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cerrar</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const conversionFactors = {
  length: {
    km: 1000,
    m: 1,
    cm: 0.01,
    mm: 0.001,
    mi: 1609.34,
    yd: 0.9144,
    ft: 0.3048,
    in: 0.0254,
  },
  mass: {
    t: 1000,
    kg: 1,
    g: 0.001,
    mg: 1e-6,
    lb: 0.453592,
    oz: 0.0283495,
  },
};

const unitLabels = {
    length: { km: 'Kilómetros', m: 'Metros', cm: 'Centímetros', mm: 'Milímetros', mi: 'Millas', yd: 'Yardas', ft: 'Pies', in: 'Pulgadas' },
    mass: { t: 'Toneladas', kg: 'Kilogramos', g: 'Gramos', mg: 'Miligramos', lb: 'Libras', oz: 'Onzas' },
    temperature: { c: 'Celsius', f: 'Fahrenheit', k: 'Kelvin' }
}

function UnitConverter() {
    const [type, setType] = useState<'length' | 'mass' | 'temperature'>('length');
    const [fromUnit, setFromUnit] = useState<string>('m');
    const [toUnit, setToUnit] = useState<string>('km');
    const [fromValue, setFromValue] = useState<string>('1');
    const [toValue, setToValue] = useState<string>('');

    const convert = useCallback(() => {
        const value = parseFloat(fromValue);
        if (isNaN(value)) {
            setToValue('');
            return;
        }

        let result: number;
        if (type === 'temperature') {
            if (fromUnit === 'c') {
                if (toUnit === 'f') result = (value * 9/5) + 32;
                else if (toUnit === 'k') result = value + 273.15;
                else result = value;
            } else if (fromUnit === 'f') {
                if (toUnit === 'c') result = (value - 32) * 5/9;
                else if (toUnit === 'k') result = (value - 32) * 5/9 + 273.15;
                else result = value;
            } else { // from Kelvin
                if (toUnit === 'c') result = value - 273.15;
                else if (toUnit === 'f') result = (value - 273.15) * 9/5 + 32;
                else result = value;
            }
        } else {
            const factors = conversionFactors[type] as Record<string, number>;
            const fromFactor = factors[fromUnit];
            const toFactor = factors[toUnit];
            result = (value * fromFactor) / toFactor;
        }
        
        setToValue(result.toPrecision(5));
    }, [fromValue, fromUnit, toUnit, type]);
    
    useEffect(() => {
        convert();
    }, [convert]);

    useEffect(() => {
        const units = Object.keys(unitLabels[type]);
        setFromUnit(units[1] || units[0]);
        setToUnit(units[0]);
        setFromValue('1');
    }, [type]);

    const units = unitLabels[type];

    return (
        <Tabs defaultValue="length" onValueChange={(v) => setType(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="length">Longitud</TabsTrigger>
                <TabsTrigger value="mass">Masa</TabsTrigger>
                <TabsTrigger value="temperature">Temperatura</TabsTrigger>
            </TabsList>
            <div className="py-4 space-y-4">
                <div className="flex items-center gap-2">
                    <div className="flex-1 space-y-1">
                        <Label htmlFor="from-value">Valor</Label>
                        <Input id="from-value" type="number" value={fromValue} onChange={(e) => setFromValue(e.target.value)} />
                    </div>
                     <Select value={fromUnit} onValueChange={setFromUnit}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(units).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="flex items-center justify-center">
                    <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex-1 space-y-1">
                        <Label htmlFor="to-value">Resultado</Label>
                        <Input id="to-value" type="text" value={toValue} readOnly className="bg-muted font-bold" />
                    </div>
                     <Select value={toUnit} onValueChange={setToUnit}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(units).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </Tabs>
    );
}

    