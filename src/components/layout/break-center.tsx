
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

const DESERT_PLAYER_SIZE = 40;
const DESERT_PLAYER_X = 50;
const DESERT_JUMP_VELOCITY = 18;
const DESERT_GRAVITY = 0.8;
const DESERT_BASE_SPEED = 5;
const DESERT_SPAWN_X = 800;

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

const FLAPPY_GAME_HEIGHT = 500;
const FLAPPY_GAME_WIDTH = 350;
const FLAPPY_BIRD_SIZE = 30;
const FLAPPY_BIRD_X = 50;
const FLAPPY_GRAVITY = 0.5;
const FLAP_VELOCITY = -8;
const FLAPPY_PIPE_WIDTH = 60;
const FLAPPY_GAP_SIZE = 150;
const FLAPPY_PIPE_SPEED = 4;
const FLAPPY_PIPE_SPAWN_RATE = 90; // in frames


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

const DesertRun = ({ onBack }: { onBack: () => void }) => {
    const [gameState, setGameState] = useState<DesertRunGameState>({
        y: 400 - DESERT_PLAYER_SIZE,
        vy: 0,
        obstacles: [],
        clouds: [],
        score: 0,
        speed: DESERT_BASE_SPEED,
        nextObstacleIn: 100,
        nextCloudIn: 50,
        gameOver: false,
        isPlaying: false,
        hasStarted: false,
    });
    const gameLoopRef = useRef<number>();
    const gameAreaRef = useRef<HTMLDivElement>(null);

    const resetGame = () => {
        setGameState({
            y: 400 - DESERT_PLAYER_SIZE,
            vy: 0,
            obstacles: [],
            clouds: [],
            score: 0,
            speed: DESERT_BASE_SPEED,
            nextObstacleIn: 100,
            nextCloudIn: 50,
            gameOver: false,
            isPlaying: false,
            hasStarted: false,
        });
    };
    
    const startGame = () => {
        if (!gameState.hasStarted || gameState.gameOver) {
            resetGame();
            setGameState(prev => ({...prev, isPlaying: true, hasStarted: true}));
        }
    };
    
    const jump = useCallback(() => {
        if (gameState.isPlaying && gameState.y >= 400 - DESERT_PLAYER_SIZE) {
            setGameState(prev => ({ ...prev, vy: -DESERT_JUMP_VELOCITY }));
        }
    }, [gameState.isPlaying, gameState.y]);

    const gameLoop = useCallback(() => {
        setGameState(prev => {
            if (!prev.isPlaying || prev.gameOver) return prev;
    
            let { y, vy, obstacles, clouds, score, speed, nextObstacleIn, nextCloudIn, gameOver } = prev;
    
            // Update player
            vy += DESERT_GRAVITY;
            y += vy;
            if (y >= 400 - DESERT_PLAYER_SIZE) {
                y = 400 - DESERT_PLAYER_SIZE;
                vy = 0;
            }
            
            // Update obstacles
            const newObstacles = obstacles
                .map(o => ({...o, x: o.x - speed }))
                .filter(o => o.x > -o.width);

            // Update clouds
            const newClouds = clouds
                .map(c => ({ ...c, x: c.x - speed / 3 }))
                .filter(c => c.x > -100);

            // Collision detection
            const playerRect = { x: DESERT_PLAYER_X, y, width: DESERT_PLAYER_SIZE, height: DESERT_PLAYER_SIZE };
            for (const obstacle of newObstacles) {
                const obstacleRect = { x: obstacle.x, y: 400 - obstacle.height, width: obstacle.width, height: obstacle.height };
                if (
                    playerRect.x < obstacleRect.x + obstacleRect.width &&
                    playerRect.x + playerRect.width > obstacleRect.x &&
                    playerRect.y < obstacleRect.y + obstacleRect.height &&
                    playerRect.y + playerRect.height > obstacleRect.y
                ) {
                    gameOver = true;
                }
            }
    
            // Spawn new obstacles
            let newNextObstacleIn = nextObstacleIn - 1;
            if (newNextObstacleIn <= 0) {
                const type = Math.random() > 0.7 ? 'double' : 'single';
                newObstacles.push({
                    id: Date.now(),
                    x: DESERT_SPAWN_X,
                    width: type === 'double' ? 60 : 30,
                    height: type === 'double' ? 40 : 60,
                    type,
                });
                newNextObstacleIn = 80 + Math.random() * 50;
            }

            // Spawn new clouds
            let newNextCloudIn = nextCloudIn - 1;
            if (newNextCloudIn <= 0) {
                newClouds.push({
                    id: Date.now(),
                    x: DESERT_SPAWN_X,
                    y: 50 + Math.random() * 100,
                    scale: 0.8 + Math.random() * 0.4,
                    opacity: 0.5 + Math.random() * 0.3
                });
                newNextCloudIn = 120 + Math.random() * 80;
            }
    
            return {
                ...prev,
                y, vy,
                obstacles: newObstacles,
                clouds: newClouds,
                score: gameOver ? prev.score : prev.score + 1,
                speed: prev.speed + 0.002,
                nextObstacleIn: newNextObstacleIn,
                nextCloudIn: newNextCloudIn,
                gameOver,
            };
        });
        
        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, []);

    useEffect(() => {
        if (gameState.isPlaying && !gameState.gameOver) {
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        }
        return () => {
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        };
    }, [gameState.isPlaying, gameState.gameOver, gameLoop]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.key === 'ArrowUp') {
                e.preventDefault();
                if (!gameState.hasStarted || gameState.gameOver) {
                    startGame();
                } else {
                    jump();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState.hasStarted, gameState.gameOver, jump]);

    return (
        <ViewContainer title="Desert Run" onBack={onBack}>
            <div className="flex flex-col items-center gap-4">
                <div 
                    ref={gameAreaRef} 
                    className="relative w-full max-w-[800px] h-[400px] bg-sky-200 dark:bg-sky-900 overflow-hidden border-4 border-slate-800 rounded-lg shadow-xl"
                    onClick={() => { if (!gameState.hasStarted || gameState.gameOver) startGame(); else jump(); }}
                >
                    {/* Sun/Moon */}
                    <div className="absolute top-8 right-16 w-16 h-16 bg-yellow-300 dark:bg-slate-300 rounded-full" />
                    
                    {/* Clouds */}
                    {gameState.clouds.map(cloud => (
                        <div key={cloud.id} className="absolute bg-white/70 dark:bg-slate-400/50 rounded-full" style={{
                            left: cloud.x,
                            top: cloud.y,
                            width: 80 * cloud.scale,
                            height: 40 * cloud.scale,
                            opacity: cloud.opacity
                        }}/>
                    ))}

                    {/* Ground */}
                    <div className="absolute bottom-0 left-0 w-full h-10 bg-orange-300 dark:bg-orange-800" />

                    {/* Player */}
                    <div className="absolute w-10 h-10" style={{ left: DESERT_PLAYER_X, top: gameState.y }}>
                        <div className="w-full h-full bg-slate-700 rounded-md relative flex items-end justify-center">
                            <div className="w-8 h-3 bg-slate-500 rounded-t-sm" />
                            <div className="absolute w-4 h-4 bg-cyan-400 rounded-full top-3 flex items-center justify-center text-xs">
                               🤖
                            </div>
                        </div>
                    </div>
                    
                    {/* Obstacles */}
                    {gameState.obstacles.map(o => (
                        <div key={o.id} className="absolute bg-green-600 dark:bg-green-800 rounded-t-md" style={{
                            left: o.x,
                            bottom: 0,
                            width: o.width,
                            height: o.height,
                        }} />
                    ))}

                    {/* Score */}
                    <div className="absolute top-4 right-4 font-mono text-2xl font-bold text-slate-700 dark:text-slate-200">
                        {Math.floor(gameState.score / 10)}
                    </div>

                    {/* Game Over / Start Screen */}
                    {(!gameState.hasStarted || gameState.gameOver) && (
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center">
                            <h3 className="text-3xl font-bold">
                                {gameState.gameOver ? 'Game Over' : 'Desert Run'}
                            </h3>
                            {gameState.gameOver && <p className="text-xl mt-2">Puntuación: {Math.floor(gameState.score / 10)}</p>}
                            <p className="mt-4 text-lg animate-pulse">
                                {gameState.gameOver ? 'Toca para reintentar' : 'Toca o pulsa espacio para empezar'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </ViewContainer>
    );
};

const FlappyBirdGame = ({ onBack }: { onBack: () => void }) => {
    const [gameState, setGameState] = useState<FlappyBirdGameState>({
        birdY: FLAPPY_GAME_HEIGHT / 2,
        velocity: 0,
        pipes: [],
        score: 0,
        status: 'idle',
        framesUntilNextPipe: 0,
    });
    const gameLoopRef = useRef<number>();
    const gameAreaRef = useRef<HTMLDivElement>(null);

    const resetGame = () => {
        setGameState({
            birdY: FLAPPY_GAME_HEIGHT / 2,
            velocity: 0,
            pipes: [],
            score: 0,
            status: 'idle',
            framesUntilNextPipe: 0,
        });
    };

    const gameLoop = useCallback(() => {
        if (gameState.status !== 'playing') return;

        setGameState(prev => {
            const newVelocity = prev.velocity + FLAPPY_GRAVITY;
            const newBirdY = prev.birdY + newVelocity;
            let newStatus = prev.status;
            let newScore = prev.score;

            if (newBirdY > FLAPPY_GAME_HEIGHT - FLAPPY_BIRD_SIZE || newBirdY < 0) {
                newStatus = 'gameover';
            }

            let newPipes = prev.pipes.map(pipe => ({ ...pipe, x: pipe.x - FLAPPY_PIPE_SPEED })).filter(pipe => pipe.x > -FLAPPY_PIPE_WIDTH);
            
            newPipes.forEach(pipe => {
                if (
                    FLAPPY_BIRD_X < pipe.x + FLAPPY_PIPE_WIDTH &&
                    FLAPPY_BIRD_X + FLAPPY_BIRD_SIZE > pipe.x &&
                    (newBirdY < pipe.topHeight || newBirdY + FLAPPY_BIRD_SIZE > pipe.topHeight + FLAPPY_GAP_SIZE)
                ) {
                    newStatus = 'gameover';
                }

                if (pipe.x + FLAPPY_PIPE_WIDTH < FLAPPY_BIRD_X && !pipe.passed) {
                    pipe.passed = true;
                    newScore += 1;
                }
            });

            let newFramesUntilNextPipe = prev.framesUntilNextPipe - 1;
            if (newFramesUntilNextPipe <= 0) {
                newPipes.push({
                    id: Date.now(),
                    x: FLAPPY_GAME_WIDTH,
                    topHeight: Math.random() * (FLAPPY_GAME_HEIGHT - FLAPPY_GAP_SIZE - 40) + 20,
                    passed: false,
                });
                newFramesUntilNextPipe = FLAPPY_PIPE_SPAWN_RATE;
            }

            return {
                ...prev,
                birdY: newBirdY,
                velocity: newVelocity,
                status: newStatus,
                pipes: newPipes,
                score: newScore,
                framesUntilNextPipe: newFramesUntilNextPipe,
            };
        });

        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, [gameState.status]);

    useEffect(() => {
        if (gameState.status === 'playing') {
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        }
        return () => {
            if (gameLoopRef.current) {
                cancelAnimationFrame(gameLoopRef.current);
            }
        };
    }, [gameLoop, gameState.status]);

    const handleTap = () => {
        if (gameState.status === 'idle') {
            setGameState(prev => ({ ...prev, status: 'playing', velocity: FLAP_VELOCITY }));
        } else if (gameState.status === 'playing') {
            setGameState(prev => ({ ...prev, velocity: FLAP_VELOCITY }));
        } else if (gameState.status === 'gameover') {
            resetGame();
        }
    };
    
    return (
        <ViewContainer title="Flappy BOT" onBack={onBack}>
            <div className="flex flex-col items-center gap-4">
                <div
                    ref={gameAreaRef}
                    className="relative w-full max-w-[350px] bg-sky-300 dark:bg-sky-800 overflow-hidden border-4 border-slate-800 rounded-lg shadow-xl"
                    style={{ height: `${FLAPPY_GAME_HEIGHT}px` }}
                    onClick={handleTap}
                    tabIndex={0}
                >
                    {/* Bird */}
                    <motion.div
                        className="absolute bg-yellow-400 rounded-full flex items-center justify-center border-2 border-slate-800"
                        style={{
                            width: FLAPPY_BIRD_SIZE,
                            height: FLAPPY_BIRD_SIZE,
                            left: FLAPPY_BIRD_X,
                            top: gameState.birdY,
                            rotate: Math.min(Math.max(-30, gameState.velocity * 4), 60)
                        }}
                    >
                        <div className="w-2 h-2 bg-white rounded-full border border-black/50 ml-1 flex items-center justify-center">
                            <div className="w-1 h-1 bg-black rounded-full" />
                        </div>
                    </motion.div>

                    {/* Pipes */}
                    {gameState.pipes.map(pipe => (
                        <React.Fragment key={pipe.id}>
                            <div
                                className="absolute bg-green-600 border-2 border-slate-800"
                                style={{
                                    left: pipe.x,
                                    top: 0,
                                    width: FLAPPY_PIPE_WIDTH,
                                    height: pipe.topHeight,
                                }}
                            />
                            <div
                                className="absolute bg-green-600 border-2 border-slate-800"
                                style={{
                                    left: pipe.x,
                                    top: pipe.topHeight + FLAPPY_GAP_SIZE,
                                    width: FLAPPY_PIPE_WIDTH,
                                    height: FLAPPY_GAME_HEIGHT - (pipe.topHeight + FLAPPY_GAP_SIZE),
                                }}
                            />
                        </React.Fragment>
                    ))}

                    {/* Score */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 text-4xl font-bold text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                        {gameState.score}
                    </div>

                    {/* Game Over Screen */}
                    {gameState.status === 'gameover' && (
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-4 text-white">
                            <h3 className="text-3xl font-bold">Game Over</h3>
                            <Button onClick={resetGame}>Reintentar</Button>
                        </div>
                    )}
                    
                    {gameState.status === 'idle' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white p-4">
                            <p className="text-xl font-bold text-center" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>Toca para empezar</p>
                        </div>
                    )}
                </div>
            </div>
        </ViewContainer>
    );
};


const SnakeGame = ({ onBack }: { onBack: () => void }) => {
    return <ViewContainer title="Snake" onBack={onBack}><div className="text-center">Próximamente...</div></ViewContainer>;
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
    const { isActive, setIsActive, phase, user, updateUser, firestore, breakTimeLeft } = useApp();
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
    
    const formatBreakTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
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
                        <div className="absolute top-3 left-3 z-20">
                            <div className="flex items-center gap-2 h-9 px-4 rounded-full bg-destructive/10 border border-destructive/20">
                                <Timer className="h-5 w-5 text-destructive" />
                                <span className="font-mono font-bold text-destructive">{formatBreakTime(breakTimeLeft)}</span>
                            </div>
                        </div>
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

const MemoryGame = ({ onBack }: { onBack: () => void }) => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [gameSize, setGameSize] = useState(12);

  const generateCards = useCallback(() => {
    const seeds = Array(gameSize / 2).fill(0).map(() => Math.random().toString(36).substring(7));
    const cardPairs = seeds.flatMap(seed => [
      { id: Math.random(), seed, isFlipped: false, isMatched: false },
      { id: Math.random(), seed, isFlipped: false, isMatched: false }
    ]);
    setCards(shuffleArray(cardPairs));
    setFlippedCards([]);
    setMoves(0);
  }, [gameSize]);

  useEffect(() => {
    generateCards();
  }, [generateCards]);

  const handleCardClick = (id: number) => {
    if (isChecking || flippedCards.includes(id) || cards.find(c => c.id === id)?.isMatched) {
      return;
    }

    const newFlippedCards = [...flippedCards, id];
    setCards(prev => prev.map(c => c.id === id ? { ...c, isFlipped: true } : c));
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setIsChecking(true);
      setMoves(m => m + 1);
      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard && secondCard && firstCard.seed === secondCard.seed) {
        // Match
        setTimeout(() => {
          setCards(prev => prev.map(c => (c.id === firstId || c.id === secondId) ? { ...c, isMatched: true } : c));
          setFlippedCards([]);
          setIsChecking(false);
        }, 800);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(c => (c.id === firstId || c.id === secondId) ? { ...c, isFlipped: false } : c));
          setFlippedCards([]);
          setIsChecking(false);
        }, 1200);
      }
    }
  };

  const isGameWon = cards.length > 0 && cards.every(c => c.isMatched);

  return (
      <ViewContainer title="Memory" onBack={onBack}>
          <div className="flex flex-col items-center gap-4">
              <div className="flex justify-between w-full font-semibold">
                  <span>Movimientos: {moves}</span>
                  <Button variant="outline" size="sm" onClick={generateCards}>Reiniciar</Button>
              </div>
              <div className={`grid gap-2 w-full`} style={{ gridTemplateColumns: `repeat(${gameSize === 12 ? 3 : 4}, 1fr)` }}>
                  {cards.map(card => (
                      <div key={card.id} className="w-full aspect-square" onClick={() => handleCardClick(card.id)}>
                          <div
                              className="relative w-full h-full cursor-pointer transition-transform duration-500 rounded-lg"
                              style={{ transformStyle: 'preserve-3d', transform: card.isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                          >
                              <div className="absolute w-full h-full bg-primary rounded-lg flex items-center justify-center" style={{ backfaceVisibility: 'hidden' }}>
                                  <Brain className="h-8 w-8 text-primary-foreground"/>
                              </div>
                              <div
                                  className={cn("absolute w-full h-full bg-muted rounded-lg border-2 flex items-center justify-center", card.isMatched && 'border-green-500 bg-green-500/20')}
                                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                              >
                                  <img src={`https://api.dicebear.com/9.x/${DICEBEAR_STYLES[Math.floor(Math.random() * DICEBEAR_STYLES.length)]}/svg?seed=${card.seed}`} alt="avatar" className="w-12 h-12"/>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
               {isGameWon && (
                <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <p className="font-bold text-green-600">¡Felicidades, lo has completado!</p>
                </div>
            )}
          </div>
      </ViewContainer>
  );
};
