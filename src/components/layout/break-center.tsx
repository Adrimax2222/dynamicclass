
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
const MemoryGame = ({ onBack }: { onBack: () => void }) => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [isBoardLocked, setIsBoardLocked] = useState(false);
  const [gamesWon, setGamesWon] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentStyle, setCurrentStyle] = useState<string>('bottts');

  const initializeGame = useCallback(() => {
    // Choose a new random style, excluding the current one
    const availableStyles = DICEBEAR_STYLES.filter(style => style !== currentStyle);
    const newStyle = availableStyles[Math.floor(Math.random() * availableStyles.length)];
    setCurrentStyle(newStyle);

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
  }, [currentStyle]);

  // Initial game setup
  useEffect(() => {
    initializeGame();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (isBoardLocked || flippedIndices.length >= 2 || cards[index].isFlipped || cards[index].isMatched) {
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
        <div className="w-full flex justify-between items-center text-sm font-semibold">
           <span>Estilo actual: <Badge variant="secondary">{currentStyle}</Badge></span>
           <span className="flex items-center gap-1 text-amber-500"><Trophy className="h-4 w-4"/> Partidas ganadas: {gamesWon}</span>
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
                  <h2 className="text-3xl font-bold mb-2">¡Nivel Completado!</h2>
                  <p className="text-muted-foreground mb-4">Has ganado {gamesWon} partida{gamesWon !== 1 && 's'}.</p>
                  <Button onClick={initializeGame}>Siguiente Ronda</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-4 gap-3 h-full">
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
                    className="absolute w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg shadow-md"
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
                      src={`https://api.dicebear.com/7.x/${currentStyle}/svg?seed=${card.seed}`}
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
};

const Game2048 = ({ onBack }: { onBack: () => void }) => {
    // ... Implementation remains the same
    return <ViewContainer title="2048" onBack={onBack}><div className="text-center">Próximamente...</div></ViewContainer>;
};

const SnakeGame = ({ onBack }: { onBack: () => void }) => {
    // ... Implementation remains the same
    return <ViewContainer title="Snake" onBack={onBack}><div className="text-center">Próximamente...</div></ViewContainer>;
};

const TicTacToeGame = ({ onBack }: { onBack: () => void }) => {
    // ... Implementation remains the same
    return <ViewContainer title="Tres en Raya" onBack={onBack}><div className="text-center">Próximamente...</div></ViewContainer>;
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
        }, 100);

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

const DesertRun = ({ onBack }: { onBack: () => void }) => {
  const { user, updateUser } = useApp();
  const firestore = useFirestore();
  const [gameState, setGameState] = useState<DesertRunGameState>({
    y: 0,
    vy: 0,
    obstacles: [],
    clouds: [],
    score: 0,
    speed: DESERT_BASE_SPEED,
    nextObstacleIn: 60,
    nextCloudIn: 10,
    gameOver: false,
    isPlaying: false,
    hasStarted: false,
  });

  const requestRef = useRef<number>();
  const isPersonalUser = user?.center === 'personal' || user?.center === 'default';

  const classmatesQuery = useMemoFirebase(() => {
    if (!firestore || !user || isPersonalUser) return null;
    return query(
        collection(firestore, "users"),
        where("organizationId", "==", user.organizationId),
        where("course", "==", user.course),
        where("className", "==", user.className),
        orderBy("desertRunHighScore", "desc")
    );
  }, [firestore, user, isPersonalUser]);

  const { data: classmatesData, isLoading: isLoadingClassmates } = useCollection<AppUser>(classmatesQuery);

  const sortedClassmates = useMemo(() => {
    if (!classmatesData) return [];
    return classmatesData
        .filter(c => c.uid !== user?.uid)
        .sort((a, b) => (b.desertRunHighScore || 0) - (a.desertRunHighScore || 0));
  }, [classmatesData, user]);

  useEffect(() => {
    if (gameState.gameOver && user && firestore) {
      const finalScore = Math.floor(gameState.score);
      const currentHighScore = user.desertRunHighScore || 0;
      if (finalScore > currentHighScore) {
        const userDocRef = doc(firestore, "users", user.uid);
        updateDoc(userDocRef, { desertRunHighScore: finalScore });
        updateUser({ desertRunHighScore: finalScore }); // Update local state
      }
    }
  }, [gameState.gameOver, gameState.score, user, firestore, updateUser]);

  const jump = useCallback(() => {
    setGameState((prev) => {
      if (prev.gameOver) {
        return {
          y: 0,
          vy: 0,
          obstacles: [],
          clouds: [],
          score: 0,
          speed: DESERT_BASE_SPEED,
          nextObstacleIn: 60,
          nextCloudIn: 10,
          gameOver: false,
          isPlaying: true,
          hasStarted: true,
        };
      }
      if (!prev.isPlaying) {
        return { ...prev, isPlaying: true, hasStarted: true };
      }
      if (prev.y === 0) {
        return { ...prev, vy: DESERT_JUMP_VELOCITY };
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [jump]);

  useEffect(() => {
    const loop = () => {
      setGameState((prev) => {
        if (!prev.isPlaying || prev.gameOver) return prev;
        
        let newVY = prev.vy - DESERT_GRAVITY;
        let newY = prev.y + newVY;
        if (newY <= 0) {
          newY = 0;
          newVY = 0;
        }

        const newScore = prev.score + 0.1;
        const newSpeed = Math.min(12, DESERT_BASE_SPEED + Math.floor(newScore / 100) * 0.5);

        const cloudSpeed = newSpeed * 0.3;
        const newClouds = prev.clouds
          .map((c) => ({ ...c, x: c.x - cloudSpeed }))
          .filter((c) => c.x > -100);

        let nextCloud = prev.nextCloudIn - 1;
        if (nextCloud <= 0) {
          newClouds.push({
            id: Date.now() + Math.random(),
            x: DESERT_SPAWN_X,
            y: Math.floor(Math.random() * 100) + 20,
            scale: 0.5 + Math.random() * 0.8,
            opacity: 0.4 + Math.random() * 0.5,
          });
          nextCloud = Math.floor(Math.random() * 80) + 40;
        }

        const newObstacles = prev.obstacles
          .map((obs) => ({ ...obs, x: obs.x - newSpeed }))
          .filter((obs) => obs.x + obs.width > -50);

        let nextObs = prev.nextObstacleIn - 1;
        if (nextObs <= 0) {
          const isDouble = Math.random() > 0.7 && newSpeed > 7;
          const type = isDouble ? "double" : "single";
          const width = isDouble ? 50 : 24;
          const height = Math.floor(Math.random() * 20) + 40;

          newObstacles.push({ id: Date.now(), x: DESERT_SPAWN_X, width, height, type });
          
          const minSafeFrames = 60; 
          const maxRandomGap = Math.max(80, 160 - newSpeed * 5);
          nextObs = Math.floor(Math.random() * (maxRandomGap - minSafeFrames)) + minSafeFrames;
        }

        let isGameOver = false;
        const hitboxShrink = 6;
        for (const obs of newObstacles) {
          if (
            DESERT_PLAYER_X + hitboxShrink < obs.x + obs.width &&
            DESERT_PLAYER_X + DESERT_PLAYER_SIZE - hitboxShrink > obs.x &&
            newY + hitboxShrink < obs.height &&
            newY + DESERT_PLAYER_SIZE - hitboxShrink > 0
          ) {
            isGameOver = true;
          }
        }

        return {
          ...prev, y: newY, vy: newVY, obstacles: newObstacles, clouds: newClouds,
          score: newScore, speed: newSpeed, nextObstacleIn: nextObs, nextCloudIn: nextCloud,
          gameOver: isGameOver, isPlaying: !isGameOver,
        };
      });

      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <ViewContainer title="Desert Run" onBack={onBack}>
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        <div className="w-full flex justify-between px-6 py-2 bg-slate-800 text-white rounded-t-lg font-mono text-xl shadow-md z-10">
          <div className="text-amber-400">HI: {String(user?.desertRunHighScore || 0).padStart(5, '0')}</div>
          <div className="tracking-widest flex items-center gap-2">
            <span className="text-slate-400 text-sm">SCORE</span>
            {Math.floor(gameState.score).toString().padStart(5, "0")}
          </div>
        </div>
        <div
          className="relative w-full h-72 bg-gradient-to-b from-sky-200 to-sky-50 overflow-hidden border-b-[8px] border-[#c2b280] shadow-xl rounded-b-lg select-none touch-none cursor-pointer"
          onTouchStart={(e) => { e.preventDefault(); jump(); }} onClick={jump}
        >
          {gameState.clouds.map((cloud) => (
            <div key={cloud.id} className="absolute bg-white rounded-full transition-transform" style={{ width: "60px", height: "20px", left: `${cloud.x}px`, top: `${cloud.y}px`, transform: `scale(${cloud.scale})`, opacity: cloud.opacity }}>
              <div className="absolute -top-3 left-3 w-8 h-8 bg-white rounded-full" />
              <div className="absolute -top-2 left-8 w-6 h-6 bg-white rounded-full" />
            </div>
          ))}
          <div className="absolute z-20 transition-transform" style={{ width: `${DESERT_PLAYER_SIZE}px`, height: `${DESERT_PLAYER_SIZE}px`, left: `${DESERT_PLAYER_X}px`, bottom: `${gameState.y}px` }}>
            <div className="absolute inset-0 bg-orange-500 rounded-lg shadow-sm">
              <div className="absolute top-2 right-1 w-5 h-4 bg-slate-900 rounded-sm flex items-center justify-end p-0.5">
                <div className={`w-2 h-2 rounded-full ${gameState.gameOver ? 'bg-red-500' : 'bg-cyan-400 animate-pulse'}`} />
              </div>
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-3 bg-slate-800 rounded-full border-2 border-slate-600 flex items-center justify-between px-1">
                 <div className="w-1 h-1 bg-slate-400 rounded-full" />
                 <div className="w-1 h-1 bg-slate-400 rounded-full" />
              </div>
            </div>
          </div>
          {gameState.obstacles.map((obs) => (
            <div key={obs.id} className="absolute z-10 flex items-end justify-center gap-2" style={{ width: `${obs.width}px`, height: `${obs.height}px`, left: `${obs.x}px`, bottom: "0px" }}>
              {obs.type === "single" && (
                <div className="relative w-6 h-full bg-emerald-600 border-2 border-emerald-800 rounded-t-lg">
                  <div className="absolute bottom-4 -left-3 w-4 h-6 border-b-2 border-l-2 border-emerald-800 rounded-bl-lg" />
                  <div className="absolute bottom-6 -right-3 w-4 h-8 border-b-2 border-r-2 border-emerald-800 rounded-br-lg" />
                </div>
              )}
              {obs.type === "double" && (<>
                  <div className="relative w-6 h-full bg-emerald-600 border-2 border-emerald-800 rounded-t-lg" />
                  <div className="relative w-6 bg-emerald-700 border-2 border-emerald-900 rounded-t-lg" style={{ height: '80%' }} />
              </>)}
            </div>
          ))}
          {!gameState.hasStarted && !gameState.gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-sm z-30">
              <div className="bg-slate-800 text-white px-8 py-4 rounded-xl shadow-2xl text-center animate-bounce">
                <h1 className="text-2xl font-black mb-2 text-amber-400">DESERT RUN</h1>
                <p className="font-mono text-sm">ESPACIO / CLICK para saltar</p>
              </div>
            </div>
          )}
          {gameState.gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-30">
              <div className="bg-white px-10 py-6 rounded-2xl shadow-2xl text-center transform scale-100 transition-all">
                <h2 className="text-5xl font-black text-red-600 mb-2">CRASH!</h2>
                <p className="text-slate-600 font-mono mb-6">Score: {Math.floor(gameState.score)}</p>
                <button onClick={jump} className="bg-orange-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-orange-600 hover:scale-105 active:scale-95 transition-all">REINTENTAR</button>
              </div>
            </div>
          )}
        </div>
        <p className="mt-2 text-xs font-mono text-slate-400">Engine: React Frame Loop | Render: DOM CSS | FPS: VSync</p>

        {!isPersonalUser && (
            <Collapsible className="w-full mt-4">
              <CollapsibleTrigger asChild>
                <div className="group flex w-full cursor-pointer items-center justify-between rounded-lg border bg-muted/50 p-4 transition-all hover:bg-muted">
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
                        <div className="p-4 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
                    ) : sortedClassmates.length > 0 ? (
                        <Carousel opts={{ align: "start", loop: false }} className="w-full">
                            <CarouselContent className="-ml-2">
                                {sortedClassmates.map((classmate) => (
                                    <CarouselItem key={classmate.uid} className="pl-2 basis-1/2 md:basis-1/3">
                                        <div className="p-1">
                                            <Card>
                                                <CardContent className="flex flex-col items-center justify-center p-3 sm:p-4 aspect-[4/5]">
                                                    <AvatarDisplay user={classmate} className="h-12 w-12 sm:h-16 sm:w-16 mb-2" />
                                                    <p className="font-bold text-sm text-center truncate w-full">{classmate.name}</p>
                                                    <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-2">
                                                        <Trophy className="h-3 w-3 text-amber-500" />
                                                        <span className="font-bold">{classmate.desertRunHighScore || 0}</span>
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
                        <div className="text-center text-sm text-muted-foreground p-4 border-dashed border-2 rounded-lg">Aún no hay puntuaciones en tu clase.</div>
                    )}
                </div>
              </CollapsibleContent>
            </Collapsible>
        )}
      </div>
    </ViewContainer>
  );
};

const FlappyBirdGame = ({ onBack }: { onBack: () => void }) => {
  const { user, updateUser } = useApp();
  const firestore = useFirestore();
  const [gameState, setGameState] = useState<FlappyBirdGameState>({
    birdY: FLAPPY_GAME_HEIGHT / 2,
    velocity: 0,
    pipes: [],
    score: 0,
    status: "idle",
    framesUntilNextPipe: 0,
  });

  const requestRef = useRef<number>();
  const isPersonalUser = user?.center === 'personal' || user?.center === 'default';

  const classmatesQuery = useMemoFirebase(() => {
    if (!firestore || !user || isPersonalUser) return null;
    return query(
        collection(firestore, "users"),
        where("organizationId", "==", user.organizationId),
        where("course", "==", user.course),
        where("className", "==", user.className),
        orderBy("flappyBotHighScore", "desc")
    );
  }, [firestore, user, isPersonalUser]);

  const { data: classmatesData, isLoading: isLoadingClassmates } = useCollection<AppUser>(classmatesQuery);

  const sortedClassmates = useMemo(() => {
    if (!classmatesData) return [];
    return classmatesData
        .filter(c => c.uid !== user?.uid)
        .sort((a, b) => (b.flappyBotHighScore || 0) - (a.flappyBotHighScore || 0));
  }, [classmatesData, user]);

  useEffect(() => {
    if (gameState.status === 'gameover' && user && firestore) {
      const finalScore = gameState.score;
      const currentHighScore = user.flappyBotHighScore || 0;
      if (finalScore > currentHighScore) {
        const userDocRef = doc(firestore, "users", user.uid);
        updateDoc(userDocRef, { flappyBotHighScore: finalScore });
        updateUser({ flappyBotHighScore: finalScore });
      }
    }
  }, [gameState.status, gameState.score, user, firestore, updateUser]);

  const flap = useCallback(() => {
    setGameState((prev) => {
      if (prev.status === "gameover") {
        return {
          birdY: FLAPPY_GAME_HEIGHT / 2,
          velocity: FLAP_VELOCITY,
          pipes: [],
          score: 0,
          status: "playing",
          framesUntilNextPipe: FLAPPY_PIPE_SPAWN_RATE,
        };
      }
      if (prev.status === "idle") {
        return { ...prev, status: "playing", velocity: FLAP_VELOCITY };
      }
      return { ...prev, velocity: FLAP_VELOCITY };
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        flap();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flap]);

  useEffect(() => {
    const loop = () => {
      setGameState((prev) => {
        if (prev.status !== "playing") return prev;

        const newVelocity = prev.velocity + FLAPPY_GRAVITY;
        let newBirdY = prev.birdY + newVelocity;

        let newPipes = prev.pipes
          .map((pipe) => ({ ...pipe, x: pipe.x - FLAPPY_PIPE_SPEED }))
          .filter((pipe) => pipe.x + FLAPPY_PIPE_WIDTH > 0);

        let nextPipeTimer = prev.framesUntilNextPipe - 1;
        if (nextPipeTimer <= 0) {
          const minPipeHeight = 50;
          const maxPipeHeight = FLAPPY_GAME_HEIGHT - FLAPPY_GAP_SIZE - minPipeHeight;
          const topHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1)) + minPipeHeight;
          newPipes.push({ id: Date.now(), x: FLAPPY_GAME_WIDTH, topHeight, passed: false });
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
          if (newBirdY + FLAPPY_BIRD_SIZE > FLAPPY_GAME_HEIGHT) newBirdY = FLAPPY_GAME_HEIGHT - FLAPPY_BIRD_SIZE;
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
            if (bTop < pipe.topHeight || bBottom > pipe.topHeight + FLAPPY_GAP_SIZE) {
              isGameOver = true;
            }
          }
        }

        return {
          ...prev, birdY: newBirdY, velocity: newVelocity, pipes: newPipes,
          score: newScore, status: isGameOver ? "gameover" : "playing",
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

  return (
    <ViewContainer title="Flappy BOT" onBack={onBack}>
      <div className="flex flex-col items-center justify-center w-full p-4 font-sans select-none touch-none">
        <div className="w-full flex justify-between px-6 py-2 bg-slate-800 text-white rounded-t-lg font-mono text-xl shadow-md z-10">
          <div className="text-amber-400">HI: {String(user?.flappyBotHighScore || 0).padStart(5, '0')}</div>
          <div className="tracking-widest flex items-center gap-2">
            <span className="text-slate-400 text-sm">SCORE</span>
            {gameState.score.toString().padStart(5, "0")}
          </div>
        </div>
        <div className="relative overflow-hidden bg-sky-300 shadow-2xl rounded-b-lg border-4 border-slate-800 cursor-pointer" style={{ width: `${FLAPPY_GAME_WIDTH}px`, height: `${FLAPPY_GAME_HEIGHT}px` }} onClick={flap} onTouchStart={(e) => { e.preventDefault(); flap(); }}>
          <div className="absolute top-6 w-full text-center z-20 pointer-events-none">
            <span className="text-5xl font-black text-white" style={{ WebkitTextStroke: "2px #1e293b" }}>{gameState.score}</span>
          </div>
          <div className="absolute bg-yellow-400 rounded-full border-2 border-slate-800 z-10 transition-transform duration-75" style={{ width: `${FLAPPY_BIRD_SIZE}px`, height: `${FLAPPY_BIRD_SIZE}px`, left: `${FLAPPY_BIRD_X}px`, top: `${gameState.birdY}px`, transform: `rotate(${Math.min(Math.max(gameState.velocity * 4, -25), 90)}deg)` }}>
            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-white rounded-full"><div className="absolute top-0.5 right-0.5 w-1 h-1 bg-black rounded-full" /></div>
            <div className="absolute top-2.5 -right-2 w-3 h-2 bg-orange-500 rounded-r-full border border-slate-800" />
          </div>
          {gameState.pipes.map((pipe) => (
            <React.Fragment key={pipe.id}>
              <div className="absolute bg-green-500 border-2 border-green-800 rounded-b-sm" style={{ width: `${FLAPPY_PIPE_WIDTH}px`, height: `${pipe.topHeight}px`, left: `${pipe.x}px`, top: 0 }}>
                <div className="absolute bottom-0 -left-1 w-[calc(100%+8px)] h-6 bg-green-500 border-2 border-green-800" />
              </div>
              <div className="absolute bg-green-500 border-2 border-green-800 rounded-t-sm" style={{ width: `${FLAPPY_PIPE_WIDTH}px`, height: `${FLAPPY_GAME_HEIGHT - pipe.topHeight - FLAPPY_GAP_SIZE}px`, left: `${pipe.x}px`, top: `${pipe.topHeight + FLAPPY_GAP_SIZE}px` }}>
                <div className="absolute top-0 -left-1 w-[calc(100%+8px)] h-6 bg-green-500 border-2 border-green-800" />
              </div>
            </React.Fragment>
          ))}
          <div className="absolute bottom-0 w-full h-4 bg-amber-200 border-t-4 border-amber-800 z-10" />
          {gameState.status === "idle" && (
            <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center z-30 pointer-events-none">
              <div className="bg-white px-6 py-3 rounded shadow-lg text-slate-800 font-bold text-lg animate-bounce">Toca para volar</div>
            </div>
          )}
          {gameState.status === "gameover" && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-30 backdrop-blur-sm">
              <div className="bg-[#ded895] border-4 border-[#543847] p-6 rounded-lg shadow-2xl text-center transform scale-100 transition-transform">
                <h2 className="text-4xl font-black text-white mb-2" style={{ WebkitTextStroke: "1px #543847" }}>GAME OVER</h2>
                <div className="bg-[#bdae58] border-2 border-[#543847] rounded p-4 mb-4 text-center">
                  <p className="text-[#543847] font-bold uppercase text-sm mb-1">Score</p>
                  <p className="text-3xl font-black text-white" style={{ WebkitTextStroke: "1px #543847" }}>{gameState.score}</p>
                </div>
                <button onClick={flap} className="bg-orange-500 border-2 border-white hover:bg-orange-600 text-white font-black uppercase tracking-wider py-2 px-6 rounded-full shadow-lg active:scale-95 transition-all">Reintentar</button>
              </div>
            </div>
          )}
        </div>
        <p className="mt-4 text-xs text-slate-500 font-mono">Pulsa Espacio o toca la pantalla</p>
         {!isPersonalUser && (
            <Collapsible className="w-full mt-4">
              <CollapsibleTrigger asChild>
                <div className="group flex w-full cursor-pointer items-center justify-between rounded-lg border bg-muted/50 p-4 transition-all hover:bg-muted">
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
                        <div className="p-4 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
                    ) : sortedClassmates.length > 0 ? (
                        <Carousel opts={{ align: "start", loop: false }} className="w-full">
                            <CarouselContent className="-ml-2">
                                {sortedClassmates.map((classmate) => (
                                    <CarouselItem key={classmate.uid} className="pl-2 basis-1/2 md:basis-1/3">
                                        <div className="p-1">
                                            <Card>
                                                <CardContent className="flex flex-col items-center justify-center p-3 sm:p-4 aspect-[4/5]">
                                                    <AvatarDisplay user={classmate} className="h-12 w-12 sm:h-16 sm:w-16 mb-2" />
                                                    <p className="font-bold text-sm text-center truncate w-full">{classmate.name}</p>
                                                    <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-2">
                                                        <Trophy className="h-3 w-3 text-amber-500" />
                                                        <span className="font-bold">{classmate.flappyBotHighScore || 0}</span>
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
                        <div className="text-center text-sm text-muted-foreground p-4 border-dashed border-2 rounded-lg">Aún no hay puntuaciones en tu clase.</div>
                    )}
                </div>
              </CollapsibleContent>
            </Collapsible>
        )}
      </div>
    </ViewContainer>
  );
};
