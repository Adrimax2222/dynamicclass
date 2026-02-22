
"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Brain, Dog, Cat, Gamepad2, Loader2, AlertTriangle, Check, Trophy, RotateCcw, Globe, Waves, SkipForward, Ghost, Users, ChevronRight, Rocket, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/lib/hooks/use-app';
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { User as AppUser } from "@/lib/types";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { AvatarDisplay } from "@/components/profile/avatar-creator";


// --- Type Definitions ---
type View = 'menu' | 'trivia' | 'animals' | 'minigames_menu' | 'snake' | '2048' | 'tic-tac-toe' | 'zen' | 'desert-run' | 'flappy-bird' | 'memory-game';

interface TriviaQuestion {
    question: string;
    correct_answer: string;
    incorrect_answers: string[];
    shuffled_answers: string[];
}

interface AnimalImage {
    url: string;
}

interface BreakCenterProps {
    isOpen: boolean;
    onClose: () => void;
}

interface EarthImage {
    id: number;
    location: string;
}

// --- Helper Functions ---
const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
};

// --- Framer Motion Variants ---
const backdropVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
};

const modalVariants = {
    hidden: { y: "100vh", opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: { y: "100vh", opacity: 0, transition: { duration: 0.3 } },
};

const viewVariants = {
  enter: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: 'easeIn' } },
};

// --- Sub-components ---

const ViewContainer: React.FC<{title: string; onBack: () => void; children: React.ReactNode; className?: string}> = ({ title, onBack, children, className }) => {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      <header className="flex items-center p-2 border-b flex-shrink-0">
        <Button onClick={onBack} variant="ghost" size="icon" aria-label="Volver"><ArrowLeft /></Button>
        <h3 className="font-bold text-lg text-center flex-1">{title}</h3>
        <div className="w-10"></div> {/* Spacer */}
      </header>
      <div className="flex-1 p-4 overflow-y-auto">{children}</div>
    </div>
  )
};

const MainMenu = ({ setView }: { setView: (view: View) => void }) => {
    const menuItems = [
        { view: 'trivia' as View, icon: Brain, label: 'Trivia Rápida' },
        { view: 'animals' as View, icon: Cat, label: 'Animales' },
        { view: 'minigames_menu' as View, icon: Gamepad2, label: 'Minijuegos' },
        { view: 'zen' as View, icon: Globe, label: 'Vuelo Zen' },
    ];
    return (
        <div className="flex flex-col items-center justify-center h-full p-4 space-y-4">
            <h2 className="text-xl font-bold text-center mb-4">Centro de Descanso</h2>
            {menuItems.map(item => (
                <Button key={item.view} onClick={() => setView(item.view)} className="w-full max-w-xs h-16 text-lg" variant="outline">
                    <item.icon className="mr-3 h-6 w-6" />
                    {item.label}
                </Button>
            ))}
        </div>
    );
};

const TriviaView = ({ onBack }: { onBack: () => void }) => {
    const [question, setQuestion] = useState<TriviaQuestion | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    
    const hasFetched = useRef(false);
    const retryAttempted = useRef(false);

    const fetchTrivia = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setQuestion(null);
        setSelectedAnswer(null);
        setIsCorrect(null);
        
        try {
            const response = await fetch('https://opentdb.com/api.php?amount=1&type=multiple&encode=url3986');
            if (!response.ok) {
                throw new Error('No se pudo conectar con el servidor de trivia.');
            }
            const data = await response.json();
            
            if (data.response_code === 0) {
                const result = data.results[0];
                const correctAnswer = decodeURIComponent(result.correct_answer);
                const incorrectAnswers = result.incorrect_answers.map(decodeURIComponent);
                const allAnswers = shuffleArray([correctAnswer, ...incorrectAnswers]);
                
                setQuestion({
                    question: decodeURIComponent(result.question),
                    correct_answer: correctAnswer,
                    incorrect_answers: incorrectAnswers,
                    shuffled_answers: allAnswers,
                });
                retryAttempted.current = false;
            } else if (data.response_code === 5 && !retryAttempted.current) {
                console.warn("Trivia API rate limit hit. Retrying...");
                retryAttempted.current = true;
                setTimeout(fetchTrivia, 3000);
                return;
            } else {
                 console.error('Error detallado Trivia:', data);
                 throw new Error(`La API de trivia devolvió un error (código: ${data.response_code}).`);
            }
        } catch (e: any) {
            console.error('Error detallado Trivia:', e);
            setError(e.message || 'Error de red.');
            setTimeout(() => {
                retryAttempted.current = false;
            }, 3000);
        } finally {
            if (!retryAttempted.current || error) {
                setIsLoading(false);
            }
        }
    }, [error]);

    useEffect(() => {
        if (!hasFetched.current) {
            hasFetched.current = true;
            fetchTrivia();
        }
    }, [fetchTrivia]);


    const handleAnswer = (answer: string) => {
        if (selectedAnswer) return;
        setSelectedAnswer(answer);
        setIsCorrect(answer === question?.correct_answer);
        setIsTransitioning(true);
        setTimeout(() => {
            setIsTransitioning(false);
            fetchTrivia();
        }, 2000);
    };
    
    if (isLoading) return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    
    if (error) return (
        <ViewContainer title="Trivia Rápida" onBack={onBack}>
            <div className="flex flex-col items-center justify-center h-full text-center">
                <AlertTriangle className="h-8 w-8 text-destructive mb-2"/>
                <p className="font-semibold text-destructive">{error}</p>
                <Button onClick={fetchTrivia} className="mt-4">Reintentar</Button>
            </div>
        </ViewContainer>
    );
    
    if (isTransitioning) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p className="font-semibold text-muted-foreground">Preparando siguiente pregunta...</p>
            </div>
        )
    }

    if (!question) return null;

    return (
        <ViewContainer title="Trivia Rápida" onBack={onBack}>
            <div className="space-y-6">
                <div className="text-center mb-4">
                    <Badge variant="secondary">Reto de Inglés 🇬🇧</Badge>
                </div>
                <p className="text-center font-semibold text-lg">{question.question}</p>
                <div className="grid grid-cols-1 gap-3">
                    {question.shuffled_answers.map(answer => {
                        const isSelected = selectedAnswer === answer;
                        const isTheCorrectAnswer = answer === question.correct_answer;
                        return (
                            <Button
                                key={answer}
                                onClick={() => handleAnswer(answer)}
                                disabled={!!selectedAnswer}
                                className={cn(
                                    "h-auto py-3 whitespace-normal",
                                    selectedAnswer && (isTheCorrectAnswer ? 'bg-green-500 hover:bg-green-600' : isSelected ? 'bg-destructive hover:bg-destructive/90' : 'bg-muted hover:bg-muted'),
                                    selectedAnswer && !isSelected && !isTheCorrectAnswer && 'opacity-50'
                                )}
                            >
                                {answer}
                            </Button>
                        )
                    })}
                </div>
                {selectedAnswer !== null && (
                    <div className="text-center space-y-3 pt-2">
                        <AnimatePresence>
                            <motion.p 
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={`font-bold text-lg ${isCorrect ? 'text-green-500' : 'text-destructive'}`}
                            >
                                {isCorrect ? '¡Correcto!' : 'Incorrecto'}
                            </motion.p>
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </ViewContainer>
    );
};

const AnimalsView = ({ onBack }: { onBack: () => void }) => {
    const [imageUrl, setImageUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAnimal = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const isCat = Math.random() > 0.5;
            const url = isCat
                ? 'https://api.thecatapi.com/v1/images/search'
                : 'https://api.thedogapi.com/v1/images/search';
            const response = await fetch(url);
            if (!response.ok) throw new Error('No se pudo cargar la imagen.');
            const data: AnimalImage[] = await response.json();
            setImageUrl(data[0].url);
        } catch (e: any) {
            setError(e.message || 'Error de red.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnimal();
    }, [fetchAnimal]);

    return (
        <ViewContainer title="Momento de Relax" onBack={onBack}>
            <div className="space-y-4 flex flex-col items-center h-full">
                <div className="w-full flex-grow relative bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                    {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : 
                     error ? <AlertTriangle className="h-8 w-8 text-destructive"/> :
                     <img src={imageUrl} alt="animal" className="object-contain h-full w-full"/>}
                </div>
                <Button onClick={fetchAnimal} disabled={isLoading}>
                    <RotateCcw className="mr-2 h-4 w-4"/>
                    {isLoading ? 'Cargando...' : 'Otra Imagen'}
                </Button>
            </div>
        </ViewContainer>
    );
};

const MinigamesMenu = ({ setView, onBack }: { setView: (view: View) => void, onBack: () => void }) => {
    const menuItems = [
        { view: 'desert-run' as View, icon: '👻', label: 'Desert Run', colors: 'bg-orange-100 dark:bg-orange-900/40 hover:bg-orange-200 dark:hover:bg-orange-900/60 border-orange-200 dark:border-orange-800/60' },
        { view: 'flappy-bird' as View, icon: '🚀', label: 'Flappy BOT', colors: 'bg-sky-100 dark:bg-sky-900/40 hover:bg-sky-200 dark:hover:bg-sky-900/60 border-sky-200 dark:border-sky-800/60' },
        { view: 'snake' as View, icon: '🐍', label: 'Snake', colors: 'bg-emerald-100 dark:bg-emerald-900/40 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 border-emerald-200 dark:border-emerald-800/60' },
        { view: 'tic-tac-toe' as View, icon: '🤔', label: 'Tres en Raya', colors: 'bg-rose-100 dark:bg-rose-900/40 hover:bg-rose-200 dark:hover:bg-rose-900/60 border-rose-200 dark:border-rose-800/60' },
        { view: '2048' as View, icon: '🔢', label: '2048', colors: 'bg-indigo-100 dark:bg-indigo-900/40 hover:bg-indigo-200 dark:hover:bg-indigo-900/60 border-indigo-200 dark:border-indigo-800/60' },
        { view: 'memory-game' as View, icon: '🧠', label: 'Memory', colors: 'bg-violet-100 dark:bg-violet-900/40 hover:bg-violet-200 dark:hover:bg-violet-900/60 border-violet-200 dark:border-violet-800/60' },
    ];

    return (
        <ViewContainer title="Minijuegos" onBack={onBack}>
            <div className="space-y-3">
                {menuItems.map(item => (
                    <Button key={item.view} onClick={() => setView(item.view)} className={cn("w-full h-16 text-lg justify-start text-foreground", item.colors)} variant="outline">
                        <span className="text-2xl mr-4">{item.icon}</span>
                        {item.label}
                    </Button>
                ))}
            </div>
        </ViewContainer>
    );
};

// Constantes del motor del juego Flappy Bird
const FLAPPY_GRAVITY = 0.5;
const FLAP_VELOCITY = -8;
const FLAPPY_PIPE_SPEED = 3;
const FLAPPY_PIPE_WIDTH = 60;
const FLAPPY_GAP_SIZE = 140; // Hueco entre tuberías
const FLAPPY_BIRD_SIZE = 24;
const FLAPPY_BIRD_X = 50; // Posición horizontal estática del pájaro
const FLAPPY_GAME_WIDTH = 350; // Resolución lógica interna (ancho)
const FLAPPY_GAME_HEIGHT = 500; // Resolución lógica interna (alto)
const FLAPPY_PIPE_SPAWN_RATE = 90; // Frames entre cada nueva tubería

function FlappyBirdGame({ onBack }: { onBack: () => void }) {
  const { user, updateUser, firestore } = useApp();
  const { toast } = useToast();

  const [gameState, setGameState] = useState<{
    birdY: number;
    velocity: number;
    pipes: { id: number; x: number; topHeight: number; passed: boolean }[];
    score: number;
    status: 'idle' | 'playing' | 'gameover';
    framesUntilNextPipe: number;
  }>({
    birdY: FLAPPY_GAME_HEIGHT / 2,
    velocity: 0,
    pipes: [],
    score: 0,
    status: 'idle',
    framesUntilNextPipe: 0,
  });

  const requestRef = useRef<number>();

  const flap = useCallback(() => {
    setGameState((prev) => {
      if (prev.status === 'gameover') {
        return {
          birdY: FLAPPY_GAME_HEIGHT / 2,
          velocity: FLAP_VELOCITY,
          pipes: [],
          score: 0,
          status: 'playing',
          framesUntilNextPipe: FLAPPY_PIPE_SPAWN_RATE,
        };
      }
      if (prev.status === 'idle') {
        return { ...prev, status: 'playing', velocity: FLAP_VELOCITY };
      }
      return { ...prev, velocity: FLAP_VELOCITY };
    });
  }, []);

  useEffect(() => {
    if (gameState.status === 'gameover' && user && firestore) {
      const finalScore = gameState.score;
      if (finalScore > (user.flappyBotHighScore || 0)) {
        const userDocRef = doc(firestore, 'users', user.uid);
        updateDoc(userDocRef, { flappyBotHighScore: finalScore });
        updateUser({ flappyBotHighScore: finalScore });
        toast({
          title: '¡Nuevo Récord en Flappy BOT!',
          description: `Has conseguido una nueva puntuación máxima de ${finalScore} puntos.`,
        });
      }
    }
  }, [gameState.status, gameState.score, user, firestore, updateUser, toast]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        flap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flap]);

  useEffect(() => {
    const loop = () => {
      setGameState((prev) => {
        if (prev.status !== 'playing') return prev;

        const newVelocity = prev.velocity + FLAPPY_GRAVITY;
        let newBirdY = prev.birdY + newVelocity;

        let newPipes = prev.pipes
          .map((pipe) => ({ ...pipe, x: pipe.x - FLAPPY_PIPE_SPEED }))
          .filter((pipe) => pipe.x + FLAPPY_PIPE_WIDTH > 0);

        let nextPipeTimer = prev.framesUntilNextPipe - 1;
        if (nextPipeTimer <= 0) {
          const minPipeHeight = 50;
          const maxPipeHeight =
            FLAPPY_GAME_HEIGHT - FLAPPY_GAP_SIZE - minPipeHeight;
          const topHeight =
            Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1)) +
            minPipeHeight;

          newPipes.push({
            id: Date.now(),
            x: FLAPPY_GAME_WIDTH,
            topHeight: topHeight,
            passed: false,
          });
          nextPipeTimer = FLAPPY_PIPE_SPAWN_RATE;
        }

        let newScore = prev.score;
        newPipes.forEach((pipe) => {
          if (!pipe.passed && pipe.x + FLAPPY_PIPE_WIDTH < FLAPPY_BIRD_X) {
            newScore += 1;
            pipe.passed = true;
          }
        });

        let isGameOver = false;

        if (newBirdY < 0 || newBirdY + FLAPPY_BIRD_SIZE > FLAPPY_GAME_HEIGHT) {
          isGameOver = true;
          if (newBirdY + FLAPPY_BIRD_SIZE > FLAPPY_GAME_HEIGHT)
            newBirdY = FLAPPY_GAME_HEIGHT - FLAPPY_BIRD_SIZE;
        }

        const hitboxShrink = 4;
        const bLeft = FLAPPY_BIRD_X + hitboxShrink;
        const bRight = FLAPPY_BIRD_X + FLAPPY_BIRD_SIZE - hitboxShrink;
        const bTop = newBirdY + hitboxShrink;
        const bBottom = newBirdY + FLAPPY_BIRD_SIZE - hitboxShrink;

        for (const pipe of newPipes) {
          const pLeft = pipe.x;
          const pRight = pipe.x + FLAPPY_PIPE_WIDTH;

          if (bRight > pLeft && bLeft < pRight) {
            if (
              bTop < pipe.topHeight ||
              bBottom > pipe.topHeight + FLAPPY_GAP_SIZE
            ) {
              isGameOver = true;
            }
          }
        }

        return {
          ...prev,
          birdY: newBirdY,
          velocity: newVelocity,
          pipes: newPipes,
          score: newScore,
          status: isGameOver ? 'gameover' : 'playing',
          framesUntilNextPipe: nextPipeTimer,
        };
      });

      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const isPersonalUser = user?.center === 'personal' || user?.center === 'default';

  const classmatesQuery = useMemoFirebase(() => {
    if (!firestore || !user || isPersonalUser) return null;
    return query(
      collection(firestore, 'users'),
      where('organizationId', '==', user.organizationId),
      where('course', '==', user.course),
      where('className', '==', user.className),
      orderBy('flappyBotHighScore', 'desc')
    );
  }, [firestore, user, isPersonalUser]);

  const { data: classmatesData, isLoading: isLoadingClassmates } = useCollection<AppUser>(classmatesQuery);

  const sortedClassmates = useMemo(() => {
    if (!classmatesData) return [];
    return classmatesData
      .filter((c) => c.uid !== user?.uid)
      .sort((a, b) => (b.flappyBotHighScore || 0) - (a.flappyBotHighScore || 0));
  }, [classmatesData, user]);

  return (
    <ViewContainer title="Flappy BOT" onBack={onBack}>
      <div className="flex flex-col items-center justify-center w-full p-4 font-sans select-none touch-none">
        <div className="w-full flex justify-between px-6 py-2 bg-slate-800 text-white rounded-t-lg font-mono text-xl shadow-md z-10">
          <div className="text-amber-400">
            HI: {String(user?.flappyBotHighScore || 0).padStart(5, '0')}
          </div>
          <div className="tracking-widest flex items-center gap-2">
            <span className="text-slate-400 text-sm">SCORE</span>
            {gameState.score.toString().padStart(5, '0')}
          </div>
        </div>

        <div
          className="relative overflow-hidden bg-sky-300 shadow-2xl rounded-b-lg border-x-4 border-b-4 border-slate-800 cursor-pointer"
          style={{
            width: `${FLAPPY_GAME_WIDTH}px`,
            height: `${FLAPPY_GAME_HEIGHT}px`,
          }}
          onClick={flap}
          onTouchStart={(e) => {
            e.preventDefault();
            flap();
          }}
        >
          <div className="absolute top-6 w-full text-center z-20 pointer-events-none">
            <span
              className="text-5xl font-black text-white"
              style={{ WebkitTextStroke: '2px #1e293b' }}
            >
              {gameState.score}
            </span>
          </div>

          <div
            className="absolute bg-orange-400 rounded-full border-2 border-slate-800 z-10 transition-transform duration-75"
            style={{
              width: `${FLAPPY_BIRD_SIZE}px`,
              height: `${FLAPPY_BIRD_SIZE}px`,
              left: `${FLAPPY_BIRD_X}px`,
              top: `${gameState.birdY}px`,
              transform: `rotate(${Math.min(
                Math.max(gameState.velocity * 4, -25),
                90
              )}deg)`,
            }}
          >
            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-white rounded-full">
              <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-black rounded-full" />
            </div>
            <div className="absolute top-2.5 -right-2 w-3 h-2 bg-red-500 rounded-r-full border border-slate-800" />
          </div>

          {gameState.pipes.map((pipe) => (
            <React.Fragment key={pipe.id}>
              <div
                className="absolute bg-green-500 border-2 border-green-800 rounded-b-sm"
                style={{
                  width: `${FLAPPY_PIPE_WIDTH}px`,
                  height: `${pipe.topHeight}px`,
                  left: `${pipe.x}px`,
                  top: 0,
                }}
              >
                <div className="absolute bottom-0 -left-1 w-[calc(100%+8px)] h-6 bg-green-500 border-2 border-green-800" />
              </div>

              <div
                className="absolute bg-green-500 border-2 border-green-800 rounded-t-sm"
                style={{
                  width: `${FLAPPY_PIPE_WIDTH}px`,
                  height: `${
                    FLAPPY_GAME_HEIGHT - pipe.topHeight - FLAPPY_GAP_SIZE
                  }px`,
                  left: `${pipe.x}px`,
                  top: `${pipe.topHeight + FLAPPY_GAP_SIZE}px`,
                }}
              >
                <div className="absolute top-0 -left-1 w-[calc(100%+8px)] h-6 bg-green-500 border-2 border-green-800" />
              </div>
            </React.Fragment>
          ))}

          <div className="absolute bottom-0 w-full h-4 bg-amber-200 border-t-4 border-amber-800 z-10" />

          {gameState.status === 'idle' && (
            <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center z-30 pointer-events-none">
              <div className="bg-white px-6 py-3 rounded shadow-lg text-slate-800 font-bold text-lg animate-bounce">
                Toca para volar
              </div>
            </div>
          )}

          {gameState.status === 'gameover' && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-30 backdrop-blur-sm">
              <div className="bg-[#ded895] border-4 border-[#543847] p-6 rounded-lg shadow-2xl text-center transform scale-100 transition-transform">
                <h2
                  className="text-4xl font-black text-white mb-2"
                  style={{ WebkitTextStroke: '1px #543847' }}
                >
                  GAME OVER
                </h2>
                <div className="bg-[#bdae58] border-2 border-[#543847] rounded p-4 mb-4 text-center">
                  <p className="text-[#543847] font-bold uppercase text-sm mb-1">
                    Score
                  </p>
                  <p
                    className="text-3xl font-black text-white"
                    style={{ WebkitTextStroke: '1px #543847' }}
                  >
                    {gameState.score}
                  </p>
                </div>
                <button
                  onClick={flap}
                  className="bg-orange-500 border-2 border-white hover:bg-orange-600 text-white font-black uppercase tracking-wider py-2 px-6 rounded-full shadow-lg active:scale-95 transition-all"
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="mt-4 text-xs text-slate-500 font-mono">
          Pulsa Espacio o toca la pantalla
        </p>

        {!isPersonalUser && (
          <Collapsible className="w-full max-w-4xl mx-auto mt-6">
            <CollapsibleTrigger asChild>
              <div className="group flex w-full cursor-pointer items-center justify-between rounded-lg border p-4 transition-all bg-muted/50 hover:bg-muted">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Ranking de la Clase</h3>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-data-[state=open]:rotate-90" />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
              <div className="py-4">
                {isLoadingClassmates ? (
                  <div className="p-4 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground mt-2">
                      Cargando ranking...
                    </p>
                  </div>
                ) : sortedClassmates.length > 0 ? (
                  <Carousel
                    opts={{ align: 'start', loop: false }}
                    className="w-full"
                  >
                    <CarouselContent className="-ml-2">
                      {sortedClassmates.map((classmate) => (
                        <CarouselItem
                          key={classmate.uid}
                          className="pl-2 basis-1/2 md:basis-1/3"
                        >
                          <div className="p-1">
                            <Card>
                              <CardContent className="flex flex-col items-center justify-center p-3 sm:p-4 aspect-[4/5]">
                                <AvatarDisplay
                                  user={classmate}
                                  className="h-12 w-12 sm:h-16 sm:w-16 mb-2"
                                />
                                <p className="font-bold text-sm text-center truncate w-full">
                                  {classmate.name}
                                </p>
                                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-2">
                                  <Rocket className="h-3 w-3 text-sky-500" />
                                  <span className="font-bold text-base text-foreground">
                                    {classmate.flappyBotHighScore || 0}
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <div className="flex justify-center gap-4 pt-4">
                      <CarouselPrevious className="static translate-y-0" />
                      <CarouselNext className="static translate-y-0" />
                    </div>
                  </Carousel>
                ) : (
                  <div className="text-center text-sm text-muted-foreground p-4 border-dashed border-2 rounded-lg">
                    Nadie en tu clase ha jugado todavía.
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </ViewContainer>
  );
}

const SnakeGame = ({ onBack }: { onBack: () => void }) => {
    const GRID_SIZE = 20;
    const SPEED = 150;
    const FRUITS = ["🍎", "🍌", "🍇", "🍓", "🍒", "🍍", "🥭", "🍉"];
  
    const getInitialSnake = () => [{ x: 10, y: 10 }];
    const getInitialDirection = () => ({ x: 0, y: -1 }); // Empieza subiendo
  
    const [snake, setSnake] = useState(getInitialSnake());
    const [direction, setDirection] = useState(getInitialDirection());
    const [food, setFood] = useState({ x: 5, y: 5, emoji: "🍎" });
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
  
    const lastProcessedDirection = useRef(getInitialDirection());
  
    const generateFood = useCallback((currentSnake: {x: number; y: number}[]) => {
      let newX, newY;
      let isOccupied = true;
      while (isOccupied) {
        newX = Math.floor(Math.random() * GRID_SIZE);
        newY = Math.floor(Math.random() * GRID_SIZE);
        isOccupied = currentSnake.some((segment) => segment.x === newX && segment.y === newY);
      }
      const randomFruit = FRUITS[Math.floor(Math.random() * FRUITS.length)];
      setFood({ x: newX, y: newY, emoji: randomFruit });
    }, []);
  
    const resetGame = useCallback(() => {
      setSnake(getInitialSnake());
      setDirection(getInitialDirection());
      lastProcessedDirection.current = getInitialDirection();
      setScore(0);
      setGameOver(false);
      setIsPaused(false);
      generateFood(getInitialSnake());
    }, [generateFood]);
  
    useEffect(() => {
      if (gameOver || isPaused) return;
  
      const moveSnake = () => {
        setSnake((prevSnake) => {
          const head = prevSnake[0];
          const newHead = {
            x: head.x + direction.x,
            y: head.y + direction.y,
          };
  
          if (
            newHead.x < 0 ||
            newHead.x >= GRID_SIZE ||
            newHead.y < 0 ||
            newHead.y >= GRID_SIZE
          ) {
            setGameOver(true);
            return prevSnake;
          }
  
          if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
            setGameOver(true);
            return prevSnake;
          }
  
          const newSnake = [newHead, ...prevSnake];
  
          if (newHead.x === food.x && newHead.y === food.y) {
            setScore((s) => s + 10);
            generateFood(newSnake);
          } else {
            newSnake.pop();
          }
  
          lastProcessedDirection.current = direction;
          return newSnake;
        });
      };
  
      const gameInterval = setInterval(moveSnake, SPEED);
      return () => clearInterval(gameInterval);
    }, [direction, gameOver, isPaused, food, generateFood]);
  
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (gameOver) return;
        
        const { key } = e;
        const currentDir = lastProcessedDirection.current;
  
        let newDir: {x: number, y: number} | null = null;
  
        if (key === "ArrowUp" || key.toLowerCase() === "w") newDir = { x: 0, y: -1 };
        if (key === "ArrowDown" || key.toLowerCase() === "s") newDir = { x: 0, y: 1 };
        if (key === "ArrowLeft" || key.toLowerCase() === "a") newDir = { x: -1, y: 0 };
        if (key === "ArrowRight" || key.toLowerCase() === "d") newDir = { x: 1, y: 0 };
  
        if (newDir) {
          if (newDir.x !== 0 && currentDir.x === -newDir.x) return;
          if (newDir.y !== 0 && currentDir.y === -newDir.y) return;
          
          e.preventDefault();
          setDirection(newDir);
        }
      };
  
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [gameOver]);
  
    const handleTouchControl = (newDir: {x: number, y: number}) => {
      const currentDir = lastProcessedDirection.current;
      if (newDir.x !== 0 && currentDir.x === -newDir.x) return;
      if (newDir.y !== 0 && currentDir.y === -newDir.y) return;
      setDirection(newDir);
    };
      
    return (
      <ViewContainer title="Snake" onBack={onBack}>
          <div className="flex flex-col items-center w-full max-w-md mx-auto select-none">
            <div className="flex justify-between items-center w-full mb-4 bg-slate-800 text-white p-3 rounded-lg shadow-md font-mono">
              <div className="text-xl font-bold">PUNTOS: {score}</div>
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-sm transition-colors"
              >
                {isPaused ? "REANUDAR" : "PAUSAR"}
              </button>
            </div>
  
            <div className="relative w-full aspect-square bg-slate-50 border-4 border-slate-800 shadow-xl overflow-hidden rounded-md"
                 style={{
                   backgroundImage: "linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)",
                   backgroundSize: `${100 / GRID_SIZE}% ${100 / GRID_SIZE}%`
                 }}>
              
              <div
                className="absolute flex items-center justify-center text-xl transition-all duration-100"
                style={{
                  left: `${(food.x / GRID_SIZE) * 100}%`,
                  top: `${(food.y / GRID_SIZE) * 100}%`,
                  width: `${100 / GRID_SIZE}%`,
                  height: `${100 / GRID_SIZE}%`,
                }}
              >
                {food.emoji}
              </div>
  
              {snake.map((segment, index) => {
                const isHead = index === 0;
                return (
                  <div
                    key={`${segment.x}-${segment.y}-${index}`}
                    className="absolute rounded-sm border border-black/20"
                    style={{
                      left: `${(segment.x / GRID_SIZE) * 100}%`,
                      top: `${(segment.y / GRID_SIZE) * 100}%`,
                      width: `${100 / GRID_SIZE}%`,
                      height: `${100 / GRID_SIZE}%`,
                      backgroundColor: isHead ? '#1e40af' : '#2563eb',
                      zIndex: isHead ? 10 : 0,
                      transition: `all ${SPEED}ms linear`
                    }}
                  >
                    {isHead && (
                      <div className="relative w-full h-full">
                         <div className={cn("absolute inset-0 flex items-center justify-around", direction.x !== 0 && "flex-col")}>
                              <div className="w-1.5 h-1.5 bg-white rounded-full flex items-center justify-center">
                                  <div className="w-0.5 h-0.5 bg-black rounded-full" />
                              </div>
                              <div className="w-1.5 h-1.5 bg-white rounded-full flex items-center justify-center">
                                  <div className="w-0.5 h-0.5 bg-black rounded-full" />
                              </div>
                          </div>
                        {direction.y === -1 && <div className="absolute w-1 h-2 bg-red-500 top-0 left-1/2 -translate-x-1/2 rounded-b-full"></div>}
                        {direction.y === 1 && <div className="absolute w-1 h-2 bg-red-500 bottom-0 left-1/2 -translate-x-1/2 rounded-t-full"></div>}
                        {direction.x === -1 && <div className="absolute w-2 h-1 bg-red-500 left-0 top-1/2 -translate-y-1/2 rounded-r-full"></div>}
                        {direction.x === 1 && <div className="absolute w-2 h-1 bg-red-500 right-0 top-1/2 -translate-y-1/2 rounded-l-full"></div>}
                      </div>
                    )}
                  </div>
                );
              })}
  
              {gameOver && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-20">
                  <h2 className="text-3xl font-bold text-white mb-2">¡Juego Terminado!</h2>
                  <p className="text-slate-200 mb-6">Puntuación final: {score}</p>
                  <button
                    onClick={resetGame}
                    className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-6 rounded-full shadow-lg transform transition active:scale-95"
                  >
                    Jugar de nuevo
                  </button>
                </div>
              )}
            </div>
  
            <div className="mt-8 grid grid-cols-3 gap-2 w-48 opacity-80 hover:opacity-100 transition-opacity">
              <div />
              <button
                onClick={() => handleTouchControl({ x: 0, y: -1 })}
                className="bg-slate-200 hover:bg-slate-300 active:bg-slate-400 aspect-square rounded-lg flex items-center justify-center shadow-sm text-2xl"
              >
                ⬆️
              </button>
              <div />
              <button
                onClick={() => handleTouchControl({ x: -1, y: 0 })}
                className="bg-slate-200 hover:bg-slate-300 active:bg-slate-400 aspect-square rounded-lg flex items-center justify-center shadow-sm text-2xl"
              >
                ⬅️
              </button>
              <button
                onClick={() => handleTouchControl({ x: 0, y: 1 })}
                className="bg-slate-200 hover:bg-slate-300 active:bg-slate-400 aspect-square rounded-lg flex items-center justify-center shadow-sm text-2xl"
              >
                ⬇️
              </button>
              <button
                onClick={() => handleTouchControl({ x: 1, y: 0 })}
                className="bg-slate-200 hover:bg-slate-300 active:bg-slate-400 aspect-square rounded-lg flex items-center justify-center shadow-sm text-2xl"
              >
                ➡️
              </button>
            </div>
          </div>
      </ViewContainer>
    );
};

const TicTacToeGame = ({ onBack }: { onBack: () => void }) => {
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | null>(null);
    const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);

    const calculateWinner = (squares: (string | null)[]) => {
        const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }
        return null;
    };

    const winner = calculateWinner(board);
    const isBoardFull = board.every(square => square !== null);

    const handleClick = (i: number) => {
        if (winner || board[i] || !isXNext) return;
        const newBoard = board.slice();
        newBoard[i] = 'X';
        setBoard(newBoard);
        setIsXNext(false);
    };

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setIsXNext(true);
    };

    const changeDifficulty = () => {
        resetGame();
        setDifficulty(null);
    };

    useEffect(() => {
        if (!isXNext && !winner && !isBoardFull && difficulty) {
            const emptySquares = board.map((sq, i) => sq === null ? i : null).filter((i): i is number => i !== null);

            const getAiMove = (): number => {
                // Easy: 80% random, 20% block
                if (difficulty === 'easy') {
                    if (Math.random() < 0.2) { 
                        // Check if player is about to win and block
                        for (const i of emptySquares) {
                            const nextBoard = board.slice();
                            nextBoard[i] = 'X';
                            if (calculateWinner(nextBoard) === 'X') return i;
                        }
                    }
                    // Otherwise, random move
                    return emptySquares[Math.floor(Math.random() * emptySquares.length)];
                }

                // Medium: Rule-based
                if (difficulty === 'medium') {
                    // 1. Win if possible
                    for (const i of emptySquares) {
                        const nextBoard = board.slice();
                        nextBoard[i] = 'O';
                        if (calculateWinner(nextBoard) === 'O') return i;
                    }
                    // 2. Block if player is about to win
                    for (const i of emptySquares) {
                        const nextBoard = board.slice();
                        nextBoard[i] = 'X';
                        if (calculateWinner(nextBoard) === 'X') return i;
                    }
                    // 3. Take center
                    if (emptySquares.includes(4)) return 4;
                    // 4. Random move (could be improved to take corners)
                    return emptySquares[Math.floor(Math.random() * emptySquares.length)];
                }

                // Hard: Minimax with 15% error rate
                if (difficulty === 'hard') {
                    const moves: { index: number; score: number }[] = [];
                    for (const i of emptySquares) {
                        const newBoard = board.slice();
                        newBoard[i] = 'O';
                        const moveScore = minimax(newBoard, false);
                        moves.push({ index: i, score: moveScore });
                    }
                    moves.sort((a, b) => b.score - a.score);
                    
                    // 15% chance to make a mistake
                    if (Math.random() < 0.15 && moves.length > 1) {
                         // Choose second or third best move if available
                        const mistakeIndex = Math.min(Math.floor(Math.random() * 2) + 1, moves.length - 1);
                        return moves[mistakeIndex].index;
                    }
                    return moves[0].index;
                }
                
                return emptySquares[0]; // Fallback
            };
            
            const minimax = (newBoard: (string|null)[], isMaximizing: boolean): number => {
                const winner = calculateWinner(newBoard);
                if (winner === 'O') return 10;
                if (winner === 'X') return -10;
                if (newBoard.every(sq => sq !== null)) return 0;

                const emptySpots = newBoard.map((sq, i) => sq === null ? i : null).filter(i => i !== null) as number[];

                if (isMaximizing) {
                    let bestScore = -Infinity;
                    for (const index of emptySpots) {
                        newBoard[index] = 'O';
                        let score = minimax(newBoard, false);
                        newBoard[index] = null;
                        bestScore = Math.max(score, bestScore);
                    }
                    return bestScore;
                } else {
                    let bestScore = Infinity;
                    for (const index of emptySpots) {
                        newBoard[index] = 'X';
                        let score = minimax(newBoard, true);
                        newBoard[index] = null;
                        bestScore = Math.min(score, bestScore);
                    }
                    return bestScore;
                }
            };


            const aiMove = getAiMove();
            const gameTimeout = setTimeout(() => {
                if(aiMove !== undefined) {
                    const newBoard = board.slice();
                    newBoard[aiMove] = 'O';
                    setBoard(newBoard);
                    setIsXNext(true);
                }
            }, 500);
            return () => clearTimeout(gameTimeout);
        }
    }, [isXNext, board, winner, isBoardFull, difficulty]);
    
    const getStatus = () => {
        if (winner) return `Ganador: ${winner}`;
        if (isBoardFull) return "¡Empate!";
        return `Turno de: ${isXNext ? 'X (Tú)' : 'O (IA)'}`;
    };

    if (!difficulty) {
        return (
            <ViewContainer title="Tres en Raya" onBack={onBack}>
                <div className="flex flex-col items-center justify-center h-full gap-4">
                    <h3 className="text-xl font-semibold mb-4">Elige la dificultad</h3>
                    <Button onClick={() => setDifficulty('easy')} className="w-full max-w-xs h-14 text-lg bg-green-500 hover:bg-green-600">Fácil</Button>
                    <Button onClick={() => setDifficulty('medium')} className="w-full max-w-xs h-14 text-lg bg-yellow-500 hover:bg-yellow-600">Medio</Button>
                    <Button onClick={() => setDifficulty('hard')} className="w-full max-w-xs h-14 text-lg bg-red-500 hover:bg-red-600">Difícil</Button>
                </div>
            </ViewContainer>
        );
    }
    
    const difficultyText = {
        easy: 'Fácil',
        medium: 'Medio',
        hard: 'Difícil'
    };
    const difficultyColor = {
        easy: 'text-green-500',
        medium: 'text-yellow-500',
        hard: 'text-red-500'
    };

    return (
        <ViewContainer title="Tres en Raya" onBack={onBack}>
            <div className="flex flex-col items-center gap-4">
                <div className="text-center">
                    <p className="font-bold">{getStatus()}</p>
                    <p className={cn("text-sm font-semibold", difficultyColor[difficulty])}>Modo: {difficultyText[difficulty]}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 w-64 h-64 bg-muted/50 p-2 rounded-lg">
                    {board.map((value, i) => (
                        <button key={i} onClick={() => handleClick(i)} className="bg-background rounded-md text-4xl font-bold flex items-center justify-center transition-colors hover:bg-slate-200 disabled:cursor-not-allowed" disabled={!isXNext || !!value || !!winner}>
                            <span className={cn(value === 'X' ? 'text-blue-500' : 'text-pink-500')}>{value}</span>
                        </button>
                    ))}
                </div>
                 <div className="flex gap-4 mt-4">
                    <Button onClick={resetGame}>Reiniciar Partida</Button>
                    <Button onClick={changeDifficulty} variant="outline">Cambiar Dificultad</Button>
                </div>
            </div>
        </ViewContainer>
    );
};

const TILE_COLORS: { [key: number]: string } = {
    2: "bg-yellow-100 text-yellow-900", 4: "bg-yellow-200 text-yellow-900",
    8: "bg-orange-300 text-white", 16: "bg-orange-400 text-white",
    32: "bg-orange-500 text-white", 64: "bg-red-500 text-white",
    128: "bg-yellow-400 text-white font-bold", 256: "bg-yellow-500 text-white font-bold",
    512: "bg-yellow-600 text-white font-bold", 1024: "bg-indigo-500 text-white font-bold",
    2048: "bg-indigo-700 text-white font-bold",
};

const Game2048 = ({ onBack }: { onBack: () => void }) => {
    const [board, setBoard] = useState<number[][]>([]);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    const addRandomTile = useCallback((currentBoard: number[][]) => {
        let emptyTiles: {x: number, y: number}[] = [];
        currentBoard.forEach((row, y) => {
            row.forEach((tile, x) => { if (tile === 0) emptyTiles.push({x, y}); });
        });
        if (emptyTiles.length > 0) {
            const { x, y } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
            currentBoard[y][x] = Math.random() < 0.9 ? 2 : 4;
        }
        return currentBoard;
    }, []);

    const initializeBoard = useCallback(() => {
        let newBoard = Array(4).fill(0).map(() => Array(4).fill(0));
        addRandomTile(newBoard);
        addRandomTile(newBoard);
        setBoard(newBoard);
        setScore(0);
        setGameOver(false);
    }, [addRandomTile]);
    
    useEffect(() => {
        initializeBoard();
    }, [initializeBoard]);

    const slideRow = (row: number[]): { newRow: number[], points: number } => {
        let filteredRow = row.filter(tile => tile !== 0);
        let points = 0;
        for (let i = 0; i < filteredRow.length - 1; i++) {
            if (filteredRow[i] === filteredRow[i+1]) {
                filteredRow[i] *= 2;
                points += filteredRow[i];
                filteredRow.splice(i+1, 1);
            }
        }
        while (filteredRow.length < 4) filteredRow.push(0);
        return { newRow: filteredRow, points };
    };

    const rotateBoard = (boardToRotate: number[][]): number[][] => {
        const newBoard = Array(4).fill(0).map(() => Array(4).fill(0));
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                newBoard[x][3-y] = boardToRotate[y][x];
            }
        }
        return newBoard;
    };
    
    const checkGameOver = (currentBoard: number[][]) => {
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                if (currentBoard[y][x] === 0) return;
                if (x < 3 && currentBoard[y][x] === currentBoard[y][x+1]) return;
                if (y < 3 && currentBoard[y][x] === currentBoard[y+1][x]) return;
            }
        }
        setGameOver(true);
    };

    const move = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
        if (gameOver) return;
        let tempBoard = board.map(row => [...row]);
        let totalPoints = 0;
        let boardChanged = false;

        const rotations = { left: 0, right: 2, up: 1, down: 3 };
        for (let i = 0; i < rotations[direction]; i++) tempBoard = rotateBoard(tempBoard);

        for (let y = 0; y < 4; y++) {
            const { newRow, points } = slideRow(tempBoard[y]);
            if (tempBoard[y].join(',') !== newRow.join(',')) boardChanged = true;
            totalPoints += points;
            tempBoard[y] = newRow;
        }
        
        for (let i = 0; i < (4 - rotations[direction]) % 4; i++) tempBoard = rotateBoard(tempBoard);
        
        if (boardChanged) {
            setScore(prev => prev + totalPoints);
            const newBoardWithTile = addRandomTile(tempBoard);
            setBoard(newBoardWithTile);
            checkGameOver(newBoardWithTile);
        }
    }, [board, gameOver, addRandomTile]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        e.preventDefault();
        switch(e.key) {
            case 'ArrowLeft': move('left'); break;
            case 'ArrowRight': move('right'); break;
            case 'ArrowUp': move('up'); break;
            case 'ArrowDown': move('down'); break;
        }
    }, [move]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
      <ViewContainer title="2048" onBack={onBack}>
        <div className="flex flex-col items-center gap-4">
          <div className="flex justify-between w-full max-w-sm">
            <div className="bg-muted p-2 rounded-md text-center"><p className="text-xs font-bold text-muted-foreground">PUNTUACIÓN</p><p className="text-xl font-bold">{score}</p></div>
            <Button onClick={initializeBoard}><RotateCcw className="mr-2 h-4 w-4"/>Reiniciar</Button>
          </div>
          <div className="p-2 bg-muted rounded-lg w-full max-w-sm aspect-square relative">
            {gameOver && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/50 text-white rounded-lg">
                    <p className="text-3xl font-bold">GAME OVER</p>
                    <Button onClick={initializeBoard} className="mt-4">Jugar de Nuevo</Button>
                </div>
            )}
            <div className="grid grid-cols-4 gap-2 h-full">
              {board.flat().map((tile, i) => (
                <div key={i} className={cn("rounded-md flex items-center justify-center text-2xl font-bold transition-all duration-100", TILE_COLORS[tile] || 'bg-muted/50')}>
                  {tile !== 0 && <span>{tile}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </ViewContainer>
    );
};

const earthImages: EarthImage[] = [
    { id: 1003, location: "Cañón del Antílope, EE.UU." },
    { id: 1021, location: "Parque Nacional de los Arcos, EE.UU." },
    { id: 1056, location: "Glaciar de Columbia, Alaska" },
    { id: 1081, location: "Parque Nacional de las Dunas de Arena, EE.UU." },
    { id: 1108, location: "Campos de Tulipanes, Países Bajos" },
    { id: 1224, location: "Glaciar Perito Moreno, Argentina" },
    { id: 1350, location: "Bahía de Halong, Vietnam" },
    { id: 1500, location: "Salar de Uyuni, Bolivia" },
    { id: 1820, location: "Valle de la Luna, Chile" },
    { id: 2030, location: "Monte Fuji, Japón" },
    { id: 2155, location: "Estructura de Richat, Mauritania" },
    { id: 2560, location: "Delta del Río Lena, Rusia" },
    { id: 3045, location: "Desierto del Namib, Namibia" },
    { id: 4500, location: "Río de Janeiro, Brasil" },
    { id: 5010, location: "Parque Nacional del Teide, España" },
    { id: 6020, location: "Gran Barrera de Coral, Australia" },
];


const ZenFlightView = ({ onClose }: { onClose: () => void; }) => {
    const [playlist, setPlaylist] = useState<EarthImage[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoadingImage, setIsLoadingImage] = useState(true);
    const [secondsLeft, setSecondsLeft] = useState(13);
    const [isMounted, setIsMounted] = useState(false);
    
    const handleNextImage = useCallback(() => {
        setIsLoadingImage(true);
        setSecondsLeft(13);
        setCurrentIndex(prevIndex => {
            const possibleNextIndexes = playlist.map((_, i) => i).filter(i => i !== prevIndex);
            if (possibleNextIndexes.length === 0) {
                 setPlaylist(shuffleArray(earthImages)); // Reshuffle if all have been seen
                 return 0;
            }
            return possibleNextIndexes[Math.floor(Math.random() * possibleNextIndexes.length)];
        });
    }, [playlist]);
    
    useEffect(() => {
        setIsMounted(true);
        setPlaylist(shuffleArray(earthImages));
        setCurrentIndex(0);
        setIsLoadingImage(true);
        setSecondsLeft(13);
    }, []);

    const currentImage = playlist[currentIndex];
    const imageUrl = currentImage ? `https://www.gstatic.com/prettyearth/assets/full/${currentImage.id}.jpg?t=${Date.now()}` : '';

    useEffect(() => {
        if (!isMounted || isLoadingImage) return;

        const countdownInterval = setInterval(() => {
            setSecondsLeft(prev => {
                if (prev <= 1) {
                    handleNextImage();
                    return 13;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(countdownInterval);
    }, [isMounted, isLoadingImage, handleNextImage]);

    if (!isMounted || !currentImage) {
        return (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
        );
    }
    
    return (
        <div className="relative h-full w-full overflow-hidden bg-black">
             <AnimatePresence>
                {isLoadingImage && (
                    <motion.div
                        key="loader"
                        className="absolute inset-0 z-20 flex items-center justify-center bg-black"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </motion.div>
                )}
            </AnimatePresence>
            
            <motion.img
                key={imageUrl}
                src={imageUrl}
                alt={currentImage.location}
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1 }}
                animate={{ 
                    opacity: isLoadingImage ? 0 : 1, 
                    scale: 1.08,
                }}
                transition={{
                    opacity: { duration: 1.5 },
                    scale: { duration: 13, ease: 'linear' }
                }}
                onLoad={() => setIsLoadingImage(false)}
                onError={handleNextImage}
            />
            <div className="absolute inset-0 bg-black/10" />
            
            <div className="absolute inset-0 z-10 flex flex-col justify-between p-4">
                <div className="flex justify-end">
                    <Button onClick={onClose} variant="ghost" className="text-white bg-black/40 backdrop-blur-md hover:bg-black/50 hover:text-white rounded-full h-9 w-9 p-0">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex items-end justify-between gap-4">
                     <AnimatePresence>
                        {!isLoadingImage && (
                            <motion.div
                                key={currentImage.location}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <Badge variant="secondary" className="bg-black/40 text-white backdrop-blur-md border-white/20">
                                   {currentImage.location}
                                </Badge>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    <Button variant="secondary" className="bg-black/40 text-white backdrop-blur-md border-white/20 cursor-default pointer-events-none opacity-90 h-9 px-4">
                         {isLoadingImage ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                         ) : (
                            `Próxima en... ${secondsLeft}s`
                         )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

// ===================================
// ===== NEW MEMORY GAME COMPONENT =====
// ===================================
type MemoryCard = {
  id: number;
  seed: string;
  isFlipped: boolean;
  isMatched: boolean;
};

function MemoryGame({ onBack }: { onBack: () => void }) {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [isBoardLocked, setIsBoardLocked] = useState(false);
  const [gamesWon, setGamesWon] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Function to initialize or reset the game
  const initializeGame = useCallback(() => {
    const uniqueSeeds = Array.from({ length: 8 }, () => Math.random().toString(36).substring(7));
    const gameSeeds = shuffleArray([...uniqueSeeds, ...uniqueSeeds]);

    setCards(
      gameSeeds.map((seed, index) => ({
        id: index,
        seed: seed,
        isFlipped: false,
        isMatched: false,
      }))
    );

    setFlippedIndices([]);
    setIsBoardLocked(false);
    setIsCompleted(false);
  }, []);

  // Initial game setup
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Game logic for checking matches
  useEffect(() => {
    if (flippedIndices.length !== 2) return;

    const [firstIndex, secondIndex] = flippedIndices;
    const firstCard = cards[firstIndex];
    const secondCard = cards[secondIndex];

    setIsBoardLocked(true);

    if (firstCard.seed === secondCard.seed) {
      setCards((prev) =>
        prev.map((card) => (card.seed === firstCard.seed ? { ...card, isMatched: true } : card))
      );
      setFlippedIndices([]);
      setIsBoardLocked(false);
    } else {
      const timeoutId = setTimeout(() => {
        setCards((prev) =>
          prev.map((card, index) =>
            index === firstIndex || index === secondIndex ? { ...card, isFlipped: false } : card
          )
        );
        setFlippedIndices([]);
        setIsBoardLocked(false);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [flippedIndices, cards]);

  // Check for game completion
  useEffect(() => {
    if (cards.length > 0 && cards.every((card) => card.isMatched)) {
      setIsCompleted(true);
      setGamesWon((prev) => prev + 1);
    }
  }, [cards]);

  const handleCardClick = (index: number) => {
    if (isBoardLocked || flippedIndices.length >= 2 || cards[index].isFlipped) {
      return;
    }

    setCards((prev) =>
      prev.map((card, i) => (i === index ? { ...card, isFlipped: true } : card))
    );
    setFlippedIndices((prev) => [...prev, index]);
  };
  
  return (
    <ViewContainer title="Memory Cards" onBack={onBack}>
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 font-bold text-lg text-amber-500 bg-amber-500/10 px-4 py-2 rounded-full">
          <Trophy className="h-5 w-5" />
          <span>Partidas ganadas: {gamesWon}</span>
        </div>

        <div className="relative w-full max-w-sm aspect-square">
           <AnimatePresence>
            {isCompleted && (
              <motion.div
                className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="bg-white text-slate-800 p-8 rounded-xl shadow-2xl text-center">
                  <h2 className="text-3xl font-bold mb-2">¡Completado!</h2>
                  <p className="text-muted-foreground mb-4">Has ganado {gamesWon} partida{gamesWon !== 1 && 's'}.</p>
                  <Button onClick={initializeGame}>Jugar de nuevo</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-4 gap-2 h-full">
            {cards.map((card, index) => (
              <div
                key={card.id}
                className="w-full h-full cursor-pointer"
                style={{ perspective: '1000px' }}
                onClick={() => handleCardClick(index)}
              >
                <motion.div
                  className="relative w-full h-full"
                  style={{ transformStyle: 'preserve-3d' }}
                  animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div
                    className="absolute w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <span className="text-4xl font-bold text-white/50">?</span>
                  </div>

                  <div
                    className={cn(
                      "absolute w-full h-full flex items-center justify-center bg-muted rounded-lg shadow-inner",
                       card.isMatched && 'ring-4 ring-green-500 ring-inset'
                    )}
                    style={{
                      transform: 'rotateY(180deg)',
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    <img
                      src={`https://api.dicebear.com/7.x/bottts/svg?seed=${card.seed}`}
                      alt={`Card ${card.seed}`}
                      className="w-10 h-10 sm:w-12 sm:h-12 p-1"
                    />
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ViewContainer>
  );
}



export const BreakCenter = ({ isOpen, onClose }: BreakCenterProps) => {
    const { isActive, setIsActive, phase } = useApp();
    const [view, setView] = useState<View>('menu');
    const [wasActiveBeforeBreak, setWasActiveBeforeBreak] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setView('menu');
        }
    }, [isOpen]);
    
    useEffect(() => {
      if (isOpen) {
        setWasActiveBeforeBreak(isActive);
        if (isActive && phase === 'focus') {
          setIsActive(false);
        }
      } else {
        if (wasActiveBeforeBreak && phase === 'focus') {
          setIsActive(true);
        }
        setWasActiveBeforeBreak(false);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, phase]);

    const prevPhaseRef = useRef(phase);
    useEffect(() => {
        const prevPhase = prevPhaseRef.current;
        if (isOpen && prevPhase === 'break' && phase === 'focus') {
            onClose();
        }
        prevPhaseRef.current = phase;
    }, [phase, isOpen, onClose]);


    const handleClose = () => {
        setView('menu');
        onClose();
    };

    const renderView = () => {
        switch(view) {
            case 'trivia': return <TriviaView onBack={() => setView('menu')} />;
            case 'animals': return <AnimalsView onBack={() => setView('menu')} />;
            case 'minigames_menu': return <MinigamesMenu setView={setView} onBack={() => setView('menu')} />;
            case 'desert-run': return <DesertRun onBack={() => setView('minigames_menu')} />;
            case 'flappy-bird': return <FlappyBirdGame onBack={() => setView('minigames_menu')} />;
            case 'snake': return <SnakeGame onBack={() => setView('minigames_menu')} />;
            case '2048': return <Game2048 onBack={() => setView('minigames_menu')} />;
            case 'tic-tac-toe': return <TicTacToeGame onBack={() => setView('minigames_menu')} />;
            case 'memory-game': return <MemoryGame onBack={() => setView('minigames_menu')} />;
            case 'zen': return <ZenFlightView onClose={handleClose} />;
            case 'menu':
            default:
                return <MainMenu setView={setView} />;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={handleClose}
                >
                    <motion.div
                        className="relative w-full max-w-md h-[80vh] rounded-2xl bg-card border shadow-2xl flex flex-col"
                        variants={modalVariants}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {view !== 'zen' && (
                             <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-3 right-3 h-8 w-8 rounded-full z-20"
                                onClick={handleClose}
                                aria-label="Cerrar"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        )}
                        <div className="relative h-full w-full overflow-hidden rounded-2xl">
                           <AnimatePresence mode="wait">
                             <motion.div
                                key={view}
                                className="absolute inset-0"
                                initial="exit"
                                animate="enter"
                                exit="exit"
                                variants={viewVariants}
                             >
                               {renderView()}
                             </motion.div>
                          </AnimatePresence>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
