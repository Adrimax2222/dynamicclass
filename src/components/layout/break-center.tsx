
"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Brain, Dog, Cat, Gamepad2, Loader2, AlertTriangle, Check, Trophy, RotateCcw, Globe, Waves, SkipForward, Ghost, Users, ChevronRight, Rocket, BrainCircuit, Dna, Code, Briefcase, SmilePlus, Activity, Banknote, DollarSign, Lightbulb, ShoppingCart, Building, Mountain, Zap, User as UserIcon, Heart, Vote, TrendingUp, HelpCircle, BookText, Scale, Sigma, ScanLine, Music, Timer, Plus, Settings2, Target, Percent, FileCheck2, TreePine, Camera, Upload, Download, RotateCw as RotateCwIcon, Crop, Save, CheckCircle, Award, TrendingDown, BookCopy, Wrench } from 'lucide-react';
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
import { Input } from "@/components/ui/input";
import { ViewContainer } from '@/components/layout/view-container';


// --- Type Definitions ---
type View = 'menu' | 'trivia' | 'animals' | 'minigames_menu' | 'snake' | '2048' | 'tic-tac-toe' | 'zen' | 'desert-run' | 'flappy-bird' | 'memory-game' | 'wordle';

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

// Constantes del motor del juego Desert Run
const DESERT_PLAYER_SIZE = 40;
const DESERT_PLAYER_X = 50;
const DESERT_GRAVITY = 0.6;
const DESERT_JUMP_VELOCITY = 12;
const DESERT_SPAWN_X = 1000;
const DESERT_BASE_SPEED = 6;

// Types for DesertRun
type DesertRunObstacle = {
  id: number;
  x: number;
  width: number;
  height: number;
  type: "single" | "double";
};

type DesertRunCloud = {
  id: number;
  x: number;
  y: number;
  scale: number;
  opacity: number;
};

type DesertRunGameState = {
  y: number;
  vy: number;
  obstacles: DesertRunObstacle[];
  clouds: DesertRunCloud[];
  score: number;
  speed: number;
  nextObstacleIn: number;
  nextCloudIn: number;
  gameOver: boolean;
  isPlaying: boolean;
  hasStarted: boolean;
};

// Constantes del motor del juego Flappy BOT
const FLAPPY_GRAVITY = 0.5;
const FLAP_VELOCITY = -8;
const FLAPPY_PIPE_SPEED = 3;
const FLAPPY_PIPE_WIDTH = 60;
const FLAPPY_GAP_SIZE = 140;
const FLAPPY_BIRD_SIZE = 24;
const FLAPPY_BIRD_X = 50;
const FLAPPY_GAME_WIDTH = 350;
const FLAPPY_GAME_HEIGHT = 500;
const FLAPPY_PIPE_SPAWN_RATE = 90;

// Types for FlappyBird
type FlappyBirdGameState = {
  birdY: number;
  velocity: number;
  pipes: Pipe[];
  score: number;
  status: 'idle' | 'playing' | 'gameover';
  framesUntilNextPipe: number;
};

type Pipe = {
  id: number;
  x: number;
  topHeight: number;
  passed: boolean;
};

// Types for MemoryGame
type MemoryCard = {
  id: number;
  seed: string;
  isFlipped: boolean;
  isMatched: boolean;
};

const DICEBEAR_STYLES = ['pixel-art', 'identicon', 'fun-emoji', 'croodles', 'bottts', 'avataaars', 'adventurer', 'lorelei', 'micah', 'open-peeps'];

// Types for WordleGame
type CellStatus = 'empty' | 'typing' | 'correct' | 'present' | 'absent';
type GameStatus = 'playing' | 'won' | 'lost' | 'loading' | 'config';

type Cell = {
  char: string;
  status: CellStatus;
};

const FALLBACK_WORDS_ES = ['QUESO', 'CASAS', 'FAROL', 'MANGO', 'PERRO', 'GATOS', 'CINCO', 'JUEGO', 'MUNDO', 'ARBOL', 'PLAZA', 'LIBRO', 'MESAS', 'CIELO', 'NUBES', 'FLACO', 'GRANO', 'TRIGO', 'POLLO', 'LETRA', 'CORTO', 'LARGO', 'FOTOS', 'REGLA', 'PAPEL', 'LAPIZ', 'GOMAS', 'SALTO', 'FUEGO', 'AGUAS', 'PIEZA', 'BRAZO', 'MANOS', 'DEDOS', 'CARNE', 'PESAR', 'LISTA', 'CORAL', 'BARCO', 'AVION', 'MOTOS', 'LLAVE', 'PUERTA', 'LUCES', 'VERDE', 'ROJOS', 'AZUL', 'NUNCA', 'SIEMPRE', 'TARDE'];


// --- Helper Functions ---
const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
};

const normalizeWord = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
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
    
    const hasFetched = useRef(false);
    const retryAttempted = useRef(false);

    const fetchTrivia = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setQuestion(null);
        setSelectedAnswer(null);
        
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
        setTimeout(() => {
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
                        const showAsCorrect = selectedAnswer && isTheCorrectAnswer;
                        const showAsIncorrect = selectedAnswer && isSelected && !isTheCorrectAnswer;
                        
                        return (
                            <Button
                                key={answer}
                                onClick={() => handleAnswer(answer)}
                                disabled={!!selectedAnswer}
                                className={cn(
                                    "h-auto py-3 whitespace-normal",
                                    showAsCorrect ? 'bg-green-500 hover:bg-green-600' : 
                                    showAsIncorrect ? 'bg-destructive hover:bg-destructive/90' : 
                                    selectedAnswer ? 'bg-muted hover:bg-muted opacity-50' : ''
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
                                className={`font-bold text-lg ${selectedAnswer === question.correct_answer ? 'text-green-500' : 'text-destructive'}`}
                            >
                                {selectedAnswer === question.correct_answer ? '¡Correcto!' : 'Incorrecto'}
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
        { view: 'desert-run' as View, icon: '🤖', label: 'Desert Run', colors: 'bg-orange-100 dark:bg-orange-900/40 hover:bg-orange-200 dark:hover:bg-orange-900/60 border-orange-200 dark:border-orange-800/60' },
        { view: 'flappy-bird' as View, icon: '🚀', label: 'Flappy BOT', colors: 'bg-sky-100 dark:bg-sky-900/40 hover:bg-sky-200 dark:hover:bg-sky-900/60 border-sky-200 dark:border-sky-800/60' },
        { view: 'wordle' as View, icon: '✍️', label: 'Wordle', colors: 'bg-teal-100 dark:bg-teal-900/40 hover:bg-teal-200 dark:hover:bg-teal-900/60 border-teal-200 dark:border-teal-800/60' },
        { view: 'memory-game' as View, icon: '🧠', label: 'Memory', colors: 'bg-violet-100 dark:bg-violet-900/40 hover:bg-violet-200 dark:hover:bg-violet-900/60 border-violet-200 dark:border-violet-800/60' },
        { view: 'snake' as View, icon: '🐍', label: 'Snake', colors: 'bg-emerald-100 dark:bg-emerald-900/40 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 border-emerald-200 dark:border-emerald-800/60' },
        { view: 'tic-tac-toe' as View, icon: '🤔', label: 'Tres en Raya', colors: 'bg-rose-100 dark:bg-rose-900/40 hover:bg-rose-200 dark:hover:bg-rose-900/60 border-rose-200 dark:border-rose-800/60' },
        { view: '2048' as View, icon: '🔢', label: '2048', colors: 'bg-indigo-100 dark:bg-indigo-900/40 hover:bg-indigo-200 dark:hover:bg-indigo-900/60 border-indigo-200 dark:border-indigo-800/60' },
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

const SnakeGame = ({ onBack }: { onBack: () => void }) => {
  const GRID_SIZE = 20;
  const SPEED = 120;
  const FRUITS = ["🍎", "🍌", "🍇", "🍓", "🍒", "🍍", "🥭", "🍉"];

  const getInitialSnake = () => [{ x: 10, y: 10 }];
  const getInitialDirection = () => ({ x: 0, y: -1 });

  const [snake, setSnake] = useState(getInitialSnake());
  const [direction, setDirection] = useState(getInitialDirection());
  const [food, setFood] = useState({ x: 5, y: 5, emoji: "🍎" });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const lastProcessedDirection = useRef(getInitialDirection());

  const generateFood = useCallback((currentSnake: {x:number, y:number}[]) => {
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

  const resetGame = () => {
    setSnake(getInitialSnake());
    setDirection(getInitialDirection());
    lastProcessedDirection.current = getInitialDirection();
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    generateFood(getInitialSnake());
  };

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
        if ((newDir.x !== 0 && currentDir.x === -newDir.x) || (newDir.y !== 0 && currentDir.y === -newDir.y)) {
            return;
        }
        
        e.preventDefault();
        setDirection(newDir);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameOver]);

  const handleTouchControl = (newDir: {x: number, y: number}) => {
    const currentDir = lastProcessedDirection.current;
    if ((newDir.x !== 0 && currentDir.x === -newDir.x) || (newDir.y !== 0 && currentDir.y === -newDir.y)) {
        return;
    }
    setDirection(newDir);
  };
  
  const getRotation = (dir: { x: number; y: number }) => {
    if (dir.y === -1) return 'rotate(0deg)';
    if (dir.x === 1) return 'rotate(90deg)';
    if (dir.y === 1) return 'rotate(180deg)';
    if (dir.x === -1) return 'rotate(-90deg)';
    return 'rotate(0deg)';
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
            className="absolute flex items-center justify-center text-xl"
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
                className={`absolute rounded-sm border border-black/20 ${
                    isHead ? "bg-emerald-700 z-10" : "bg-emerald-500 z-0"
                }`}
                style={{
                    left: `${(segment.x / GRID_SIZE) * 100}%`,
                    top: `${(segment.y / GRID_SIZE) * 100}%`,
                    width: `${100 / GRID_SIZE}%`,
                    height: `${100 / GRID_SIZE}%`,
                    transition: 'left 0.1s linear, top 0.1s linear',
                }}
                >
                {isHead && (
                    <div
                        className="relative w-full h-full transition-transform duration-200"
                        style={{ transform: getRotation(direction) }}
                    >
                        <div className="absolute w-1 h-3 bg-red-500 rounded-b-full top-[-6px] left-1/2 -translate-x-1/2 border-b border-l border-r border-red-700"></div>
                        <div className="absolute w-1.5 h-1.5 bg-white rounded-full flex items-center justify-center top-1/3 left-1/4 border border-black/20">
                            <div className="w-0.5 h-0.5 bg-black rounded-full" />
                        </div>
                        <div className="absolute w-1.5 h-1.5 bg-white rounded-full flex items-center justify-center top-1/3 right-1/4 border border-black/20">
                            <div className="w-0.5 h-0.5 bg-black rounded-full" />
                        </div>
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
                className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 px-6 rounded-full shadow-lg transform transition active:scale-95"
                >
                Jugar de nuevo
                </button>
            </div>
            )}
        </div>

        <div className="mt-8 grid grid-cols-3 gap-2 w-48 opacity-80 hover:opacity-100 transition-opacity">
            <div />
            <button onClick={() => handleTouchControl({ x: 0, y: -1 })} className="bg-slate-200 hover:bg-slate-300 active:bg-slate-400 aspect-square rounded-lg flex items-center justify-center shadow-sm text-2xl">⬆️</button>
            <div />
            <button onClick={() => handleTouchControl({ x: -1, y: 0 })} className="bg-slate-200 hover:bg-slate-300 active:bg-slate-400 aspect-square rounded-lg flex items-center justify-center shadow-sm text-2xl">⬅️</button>
            <button onClick={() => handleTouchControl({ x: 0, y: 1 })} className="bg-slate-200 hover:bg-slate-300 active:bg-slate-400 aspect-square rounded-lg flex items-center justify-center shadow-sm text-2xl">⬇️</button>
            <button onClick={() => handleTouchControl({ x: 1, y: 0 })} className="bg-slate-200 hover:bg-slate-300 active:bg-slate-400 aspect-square rounded-lg flex items-center justify-center shadow-sm text-2xl">➡️</button>
        </div>
        </div>
    </ViewContainer>
  );
};

const TicTacToeGame = ({ onBack }: { onBack: () => void }) => {
    return <ViewContainer title="Tres en Raya" onBack={onBack}><div className="text-center">Próximamente...</div></ViewContainer>;
};

const Game2048 = ({ onBack }: { onBack: () => void }) => {
    return <ViewContainer title="2048" onBack={onBack}><div className="text-center">Próximamente...</div></ViewContainer>;
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
    
    const handleNextImage = useCallback(() => {
        setIsLoadingImage(true);
        setSecondsLeft(13);
        setCurrentIndex(prevIndex => {
            if (prevIndex >= playlist.length - 1) {
                setPlaylist(shuffleArray(earthImages));
                return 0;
            }
            return prevIndex + 1;
        });
    }, [playlist.length]);
    
    useEffect(() => {
        setPlaylist(shuffleArray(earthImages));
        setCurrentIndex(0);
        setIsLoadingImage(true);
        setSecondsLeft(13);
    }, []);

    const currentImage = playlist[currentIndex];
    const imageUrl = currentImage ? `https://www.gstatic.com/prettyearth/assets/full/${currentImage.id}.jpg?t=${Date.now()}` : '';

    useEffect(() => {
        if (isLoadingImage) return;

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
    }, [isLoadingImage, handleNextImage]);

    if (!currentImage) {
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

const WordleGame = ({ onBack }: { onBack: () => void }) => {
    const [gameState, setGameState] = useState<GameStatus>('config');
    const [theme, setTheme] = useState('');
    const [wordToGuess, setWordToGuess] = useState('');
    const [grid, setGrid] = useState<Cell[][]>([]);
    const [currentRow, setCurrentRow] = useState(0);
    const [usedChars, setUsedChars] = useState<Record<string, CellStatus>>({});
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const isProcessingKey = useRef(false);
    const fallbackWords = useMemo(() => ['PERRO', 'GATOS', 'CASAS', 'SILLA', 'LIBRO', 'PLAYA', 'BARCO', 'FRUTA', 'VERDE', 'PIANO'], []);


    const getPlayedWords = (): string[] => {
        try {
            const words = localStorage.getItem('wordle_played_words');
            return words ? JSON.parse(words) : [];
        } catch (e) {
            return [];
        }
    };

    const addPlayedWord = (word: string) => {
        try {
            const words = getPlayedWords();
            const updatedWords = [word, ...words].slice(0, 50); // Keep last 50
            localStorage.setItem('wordle_played_words', JSON.stringify(updatedWords));
        } catch (e) {
            console.error("Failed to save played word to localStorage", e);
        }
    };

    const initializeGrid = () => {
        return Array(6).fill(null).map(() => Array(5).fill(null).map(() => ({ char: '', status: 'empty' })));
    };

    const handleGenerateWord = useCallback(async (currentTheme: string) => {
        setGameState('loading');
        setError(null);
        try {
            const response = await fetch(`https://api.datamuse.com/words?ml=${encodeURIComponent(currentTheme)}&v=es&max=100`);
            if (!response.ok) throw new Error('API request failed');
            const data = await response.json();
            
            const playedWords = getPlayedWords();
            
            let validWords = data
                .map((d: { word: string }) => normalizeWord(d.word))
                .filter((word: string) => 
                    word.length === 5 && 
                    /^[A-Z]+$/.test(word) && 
                    !playedWords.includes(word) &&
                    (word.match(/[AEIOU]/g) || []).length >= 2
                );
            
            if (validWords.length === 0) {
                console.warn("No valid words from API, using fallback.");
                validWords = fallbackWords.filter(word => !playedWords.includes(word));
                if (validWords.length === 0) validWords = fallbackWords;
            }

            const selectedWord = validWords[Math.floor(Math.random() * validWords.length)];
            
            setWordToGuess(selectedWord);
            addPlayedWord(selectedWord);
            setGrid(initializeGrid());
            setCurrentRow(0);
            setUsedChars({});
            setGameState('playing');
        } catch (err) {
            console.error(err);
            let validWords = fallbackWords.filter(word => !getPlayedWords().includes(word));
            if (validWords.length === 0) validWords = fallbackWords;
            const selectedWord = validWords[Math.floor(Math.random() * validWords.length)];
            setWordToGuess(selectedWord);
            addPlayedWord(selectedWord);
            setGrid(initializeGrid());
            setCurrentRow(0);
            setUsedChars({});
            setGameState('playing');
        }
    }, [fallbackWords]);

    const handleSubmitGuess = useCallback(() => {
        if (isSubmitting) return;
    
        const guess = grid[currentRow].map(cell => cell.char).join('');
        if (guess.length !== 5) return;
        
        setIsSubmitting(true);
    
        setTimeout(() => {
            let newGrid = [...grid];
            let newUsedChars = { ...usedChars };
            const tempWord = wordToGuess.split('');
        
            // First pass for 'correct' letters
            newGrid[currentRow] = newGrid[currentRow].map((cell, index) => {
                if (cell.char === tempWord[index]) {
                    tempWord[index] = ''; // Mark as used
                    newUsedChars[cell.char] = 'correct';
                    return { ...cell, status: 'correct' };
                }
                return cell;
            });
            
            // Second pass for 'present' and 'absent' letters
            newGrid[currentRow] = newGrid[currentRow].map((cell) => {
                if (cell.status === 'correct') return cell;
        
                const charIndex = tempWord.indexOf(cell.char);
                if (charIndex !== -1) {
                    tempWord[charIndex] = ''; // Mark as used
                    if (newUsedChars[cell.char] !== 'correct') {
                        newUsedChars[cell.char] = 'present';
                    }
                    return { ...cell, status: 'present' };
                }
                if (!newUsedChars[cell.char]) {
                    newUsedChars[cell.char] = 'absent';
                }
                return { ...cell, status: 'absent' };
            });
        
            setGrid(newGrid);
            setUsedChars(newUsedChars);
            
            if (guess === wordToGuess) {
                setTimeout(() => setGameState('won'), 600);
            } else if (currentRow === 5) {
                setTimeout(() => setGameState('lost'), 600);
            } else {
                setCurrentRow(prev => prev + 1);
            }
            setIsSubmitting(false);

        }, 1000); // Wait for animations to finish
    }, [grid, currentRow, wordToGuess, isSubmitting, usedChars]);
    
    const handleKeyInput = useCallback((key: string) => {
        if (isProcessingKey.current || gameState !== 'playing' || isSubmitting) return;

        isProcessingKey.current = true;

        if (key === 'Enter') {
            handleSubmitGuess();
        } else if (key === 'Backspace') {
            setGrid(prev => {
                const newGrid = [...prev];
                for (let i = 4; i >= 0; i--) {
                    if (newGrid[currentRow][i].char !== '') {
                        newGrid[currentRow][i] = { char: '', status: 'empty' };
                        break;
                    }
                }
                return newGrid;
            });
        } else if (/^[a-zA-ZñÑ]$/.test(key)) {
            setGrid(prev => {
                const newGrid = [...prev];
                for (let i = 0; i < 5; i++) {
                    if (newGrid[currentRow][i].char === '') {
                        newGrid[currentRow][i] = { char: key.toUpperCase(), status: 'typing' };
                        break;
                    }
                }
                return newGrid;
            });
        }

        setTimeout(() => {
            isProcessingKey.current = false;
        }, 150);

    }, [gameState, isSubmitting, currentRow, handleSubmitGuess]);
    
    useEffect(() => {
        const listener = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                return;
            }
            if (e.key === 'Enter' || e.key === 'Backspace' || /^[a-zA-ZñÑ]$/.test(e.key)) {
                e.preventDefault();
                handleKeyInput(e.key);
            }
        };
        window.addEventListener('keydown', listener);
        return () => window.removeEventListener('keydown', listener);
    }, [handleKeyInput]);

    if (gameState === 'config' || gameState === 'loading') {
        return (
            <ViewContainer title="Wordle" onBack={onBack}>
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                    {gameState === 'loading' ? (
                        <>
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="font-semibold text-lg">Generando Wordle de "{theme}"...</p>
                            <p className="text-sm text-muted-foreground">Buscando la palabra perfecta...</p>
                        </>
                    ) : (
                        <>
                            <h3 className="text-xl font-bold">Elige un Tema</h3>
                            <p className="text-muted-foreground">Escribe una palabra para generar un Wordle relacionado.</p>
                            <Input
                                value={theme}
                                onChange={(e) => setTheme(e.target.value)}
                                placeholder="Ej: Naturaleza, Espacio..."
                                className="text-center"
                                onKeyDown={(e) => e.key === 'Enter' && theme && handleGenerateWord(theme)}
                            />
                            <Button onClick={() => handleGenerateWord(theme)} disabled={!theme}>
                                Generar Wordle
                            </Button>
                            {error && <p className="text-destructive text-sm">{error}</p>}
                        </>
                    )}
                </div>
            </ViewContainer>
        );
    }
    
    return (
        <ViewContainer title={`Wordle: ${theme}`} onBack={() => setGameState('config')}>
            <div className="flex flex-col items-center gap-4 h-full">
                <div className="grid grid-rows-6 gap-1.5">
                    {grid.map((row, rowIndex) => (
                        <div key={rowIndex} className="grid grid-cols-5 gap-1.5">
                            {row.map((cell, cellIndex) => {
                                const isSubmittedRow = rowIndex < currentRow;
                                const isCurrentSubmittingRow = isSubmitting && rowIndex === currentRow;

                                return (
                                    <div
                                        key={cellIndex}
                                        className={cn(
                                            "w-14 h-14 rounded-md border-2 flex items-center justify-center text-2xl font-bold uppercase aspect-square transition-all duration-500",
                                            isCurrentSubmittingRow ? "animate-flip-reveal" : "",
                                            cell.status === 'typing' && 'border-primary',
                                            isSubmittedRow || (isCurrentSubmittingRow && cell.status !== 'typing' && cell.status !== 'empty') ? 
                                              (cell.status === 'correct' ? 'bg-green-500 border-green-500 text-white' :
                                               cell.status === 'present' ? 'bg-yellow-500 border-yellow-500 text-white' :
                                               cell.status === 'absent' ? 'bg-slate-500 border-slate-500 text-white' : 'border-muted-foreground/30')
                                            : 'border-muted-foreground/30'
                                        )}
                                        style={{ animationDelay: isCurrentSubmittingRow ? `${cellIndex * 150}ms` : '0ms' }}
                                    >
                                        {cell.char}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {(gameState === 'won' || gameState === 'lost') && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg p-4">
                        <div className="bg-white text-slate-800 p-8 rounded-xl shadow-2xl text-center">
                            <h2 className="text-3xl font-bold mb-2">{gameState === 'won' ? '¡Has ganado!' : 'Has perdido'}</h2>
                            <p className="text-muted-foreground mb-4">La palabra era: <strong className="text-primary">{wordToGuess}</strong></p>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setGameState('config')}>Cambiar de Tema</Button>
                                <Button onClick={() => handleGenerateWord(theme)}>Volver a Jugar</Button>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="space-y-1 w-full max-w-sm mt-auto">
                    {['QWERTYUIOP', 'ASDFGHJKLÑ', 'ZXCVBNM'].map((row, rowIndex) => (
                        <div key={rowIndex} className="flex justify-center gap-1">
                            {rowIndex === 2 && <Button className="h-10 px-3" variant="outline" onClick={() => handleKeyInput('Enter')}>↵</Button>}
                            {row.split('').map(key => {
                                const status = usedChars[key];
                                return (
                                    <Button
                                        key={key}
                                        onClick={() => handleKeyInput(key)}
                                        className={cn(
                                            'h-10 px-2.5 sm:px-3 text-sm font-bold flex-1',
                                            status === 'correct' && 'bg-green-500 text-white hover:bg-green-600',
                                            status === 'present' && 'bg-yellow-500 text-white hover:bg-yellow-600',
                                            status === 'absent' && 'bg-slate-500 text-white hover:bg-slate-600'
                                        )}
                                        variant="outline"
                                    >
                                        {key}
                                    </Button>
                                );
                            })}
                            {rowIndex === 2 && <Button className="h-10 px-3" variant="outline" onClick={() => handleKeyInput('Backspace')}>⌫</Button>}
                        </div>
                    ))}
                </div>
            </div>
        </ViewContainer>
    );
};

export const BreakCenter = ({ isOpen, onClose }: BreakCenterProps) => {
    const { isActive, setIsActive, phase, user, updateUser, firestore } = useApp();
    const { toast } = useToast();
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
            case 'wordle': return <WordleGame onBack={() => setView('minigames_menu')} />;
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
