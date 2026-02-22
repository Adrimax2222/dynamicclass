
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Brain, Dog, Cat, Gamepad2, Loader2, AlertTriangle, Check, Trophy, RotateCcw, Globe, Waves, SkipForward, Ghost } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/lib/hooks/use-app';


// --- Type Definitions ---
type View = 'menu' | 'trivia' | 'animals' | 'minigames_menu' | 'snake' | '2048' | 'tic-tac-toe' | 'zen' | 'dino';

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
                setTimeout(fetchTrivia, 2000);
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
    return (
        <ViewContainer title="Minijuegos" onBack={onBack}>
            <div className="space-y-3">
                <Button onClick={() => setView('dino')} className="w-full h-14" variant="outline"><Ghost className="mr-2 h-5 w-5"/>Dino Run</Button>
                <Button onClick={() => setView('snake')} className="w-full h-14" variant="outline">Snake</Button>
                <Button onClick={() => setView('tic-tac-toe')} className="w-full h-14" variant="outline">Tres en Raya</Button>
                <Button onClick={() => setView('2048')} className="w-full h-14" variant="outline">2048</Button>
            </div>
        </ViewContainer>
    );
};

function DinoGame({ onBack }: { onBack: () => void }) {
    // Constantes físicas e iniciales
    const DINO_SIZE = 40;
    const DINO_X = 50; // Posición horizontal fija del dino
    const GRAVITY = 0.6;
    const JUMP_VELOCITY = 12;
    const SPAWN_X = 1000; // Distancia de spawn (fuera de pantalla a la derecha)
    const BASE_SPEED = 6;

    type Obstacle = {
      id: number;
      x: number;
      width: number;
      height: number;
    };

    type GameState = {
      dinoY: number;
      dinoVY: number;
      obstacles: Obstacle[];
      score: number;
      speed: number;
      nextObstacleIn: number;
      gameOver: boolean;
      isPlaying: boolean;
      hasStarted: boolean;
    };
    const [gameState, setGameState] = useState<GameState>({
        dinoY: 0,
        dinoVY: 0,
        obstacles: [],
        score: 0,
        speed: BASE_SPEED,
        nextObstacleIn: 60,
        gameOver: false,
        isPlaying: false,
        hasStarted: false,
    });

    const requestRef = useRef<number>();

    // Controlador de Salto y Reinicio
    const jump = useCallback(() => {
        setGameState((prev) => {
        // Reiniciar si es Game Over
        if (prev.gameOver) {
            return {
            dinoY: 0,
            dinoVY: 0,
            obstacles: [],
            score: 0,
            speed: BASE_SPEED,
            nextObstacleIn: 60,
            gameOver: false,
            isPlaying: true,
            hasStarted: true,
            };
        }
        // Empezar si no ha empezado
        if (!prev.isPlaying) {
            return { ...prev, isPlaying: true, hasStarted: true };
        }
        // Saltar solo si está en el suelo (y=0)
        if (prev.dinoY === 0) {
            return { ...prev, dinoVY: JUMP_VELOCITY };
        }
        return prev;
        });
    }, []);

    // Listeners de teclado
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

    // Motor del juego (Game Loop)
    useEffect(() => {
        const loop = () => {
        setGameState((prev) => {
            if (!prev.isPlaying || prev.gameOver) return prev;

            // 1. Físicas y Gravedad
            let newVY = prev.dinoVY - GRAVITY;
            let newY = prev.dinoY + newVY;
            
            // Colisión con el suelo
            if (newY <= 0) {
            newY = 0;
            newVY = 0;
            }

            // 2. Lógica de Obstáculos (Mover y limpiar memoria)
            const newObstacles = prev.obstacles
            .map((obs) => ({ ...obs, x: obs.x - prev.speed }))
            .filter((obs) => obs.x + obs.width > -50); // Eliminar si sale por la izquierda

            let nextIn = prev.nextObstacleIn - 1;
            
            // Generar nuevos obstáculos
            if (nextIn <= 0) {
            newObstacles.push({
                id: Date.now() + Math.random(),
                x: SPAWN_X,
                width: Math.floor(Math.random() * 20) + 20, // Ancho: 20px a 40px
                height: Math.floor(Math.random() * 30) + 30, // Alto: 30px a 60px
            });
            
            // Calcular cuándo aparecerá el siguiente (aumenta dificultad con velocidad)
            const minFrames = Math.max(30, 80 - prev.speed * 2);
            const maxFrames = Math.max(60, 150 - prev.speed * 2);
            nextIn = Math.floor(Math.random() * (maxFrames - minFrames)) + minFrames;
            }

            // 3. Puntuación y Velocidad Dinámica
            const newScore = prev.score + 0.1;
            const newSpeed = BASE_SPEED + Math.floor(newScore / 100) * 0.4;

            // 4. Detección de Colisiones AABB
            let isGameOver = false;
            // Margen de hit para que no sea tan punitivo (mejora la experiencia)
            const hitMarginX = 5; 
            const hitMarginY = 5;

            for (const obs of newObstacles) {
            if (
                DINO_X + hitMarginX < obs.x + obs.width &&
                DINO_X + DINO_SIZE - hitMarginX > obs.x &&
                newY + hitMarginY < obs.height && // newY es el "bottom" del dino
                newY + DINO_SIZE - hitMarginY > 0
            ) {
                isGameOver = true;
            }
            }

            return {
            ...prev,
            dinoY: newY,
            dinoVY: newVY,
            obstacles: newObstacles,
            nextObstacleIn: nextIn,
            score: newScore,
            speed: newSpeed,
            gameOver: isGameOver,
            isPlaying: !isGameOver,
            };
        });

        requestRef.current = requestAnimationFrame(loop);
        };

        requestRef.current = requestAnimationFrame(loop);
        
        // Clean-up del frame de animación al desmontar
        return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    return (
        <ViewContainer title="Dino Run" onBack={onBack}>
            <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
            
            {/* Marcador Superior */}
            <div className="w-full flex justify-end px-4 py-2 text-2xl font-mono text-slate-700 tracking-widest">
                {Math.floor(gameState.score).toString().padStart(5, "0")}
            </div>

            {/* Contenedor Principal del Juego */}
            <div
                className="relative w-full h-64 bg-slate-50 overflow-hidden border-b-4 border-slate-700 select-none touch-none cursor-pointer"
                onTouchStart={(e) => {
                e.preventDefault(); // Evita scroll en móviles al tocar
                jump();
                }}
                onClick={jump}
            >
                
                {/* Dino */}
                <div
                className="absolute bg-slate-800 rounded-sm"
                style={{
                    width: `${DINO_SIZE}px`,
                    height: `${DINO_SIZE}px`,
                    left: `${DINO_X}px`,
                    bottom: `${gameState.dinoY}px`,
                }}
                >
                {/* Pequeño detalle de un "ojo" para darle dirección al bloque */}
                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-slate-50 rounded-full" />
                </div>

                {/* Obstáculos (Cactus) */}
                {gameState.obstacles.map((obs) => (
                <div
                    key={obs.id}
                    className="absolute bg-emerald-600 rounded-t-md"
                    style={{
                    width: `${obs.width}px`,
                    height: `${obs.height}px`,
                    left: `${obs.x}px`,
                    bottom: "0px",
                    }}
                />
                ))}

                {/* Overlay Inicial */}
                {!gameState.hasStarted && !gameState.gameOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40">
                    <span className="animate-pulse text-lg font-bold text-slate-700 bg-white/80 px-4 py-2 rounded shadow">
                    Pulsa ESPACIO o toca para empezar
                    </span>
                </div>
                )}

                {/* Overlay Game Over */}
                {gameState.gameOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
                    <h2 className="text-4xl font-black text-slate-800 tracking-wider mb-4">
                    GAME OVER
                    </h2>
                    <button 
                    className="px-6 py-2 bg-slate-700 text-white font-bold rounded hover:bg-slate-800 transition shadow-lg active:scale-95"
                    >
                    Pulsa ESPACIO para reiniciar
                    </button>
                </div>
                )}
            </div>
            
            <p className="mt-4 text-sm text-slate-500">
                Usa la barra espaciadora, la flecha arriba o toca la zona de juego para saltar.
            </p>
            </div>
        </ViewContainer>
    );
}

const SnakeGame = ({ onBack }: { onBack: () => void }) => {
  const GRID_SIZE = 20;
  const SPEED = 150;
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
        const newHead = { x: head.x + direction.x, y: head.y + direction.y };

        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE || prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
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
              className="absolute flex items-center justify-center text-xl transition-all duration-150"
              style={{
                left: `${(food.x / GRID_SIZE) * 100}%`,
                top: `${(food.y / GRID_SIZE) * 100}%`,
                width: `${100 / GRID_SIZE}%`,
                height: `${100 / GRID_SIZE}%`,
                transition: `all ${SPEED}ms linear`
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
                    backgroundColor: isHead ? '#065f46' : '#10b981',
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
                  className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 px-6 rounded-full shadow-lg transform transition active:scale-95"
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
}

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
                // Modo Fácil
                if (difficulty === 'easy') {
                    if (Math.random() < 0.2) { // 20% de jugar bien
                        for (const i of emptySquares) { // Bloquear al jugador
                            const nextBoard = board.slice();
                            nextBoard[i] = 'X';
                            if (calculateWinner(nextBoard) === 'X') return i;
                        }
                    }
                    return emptySquares[Math.floor(Math.random() * emptySquares.length)];
                }

                // Modo Medio
                if (difficulty === 'medium') {
                    // 1. Ganar si es posible
                    for (const i of emptySquares) {
                        const nextBoard = board.slice();
                        nextBoard[i] = 'O';
                        if (calculateWinner(nextBoard) === 'O') return i;
                    }
                    // 2. Bloquear al jugador
                    for (const i of emptySquares) {
                        const nextBoard = board.slice();
                        nextBoard[i] = 'X';
                        if (calculateWinner(nextBoard) === 'X') return i;
                    }
                    // 3. Ocupar el centro
                    if (emptySquares.includes(4)) return 4;
                    // 4. Ocupar una esquina
                    const corners = [0, 2, 6, 8].filter(i => emptySquares.includes(i));
                    if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];
                    // 5. Movimiento aleatorio
                    return emptySquares[Math.floor(Math.random() * emptySquares.length)];
                }

                // Modo Difícil (Minimax con error)
                if (difficulty === 'hard') {
                    const moves: { index: number; score: number }[] = [];
                    for (const i of emptySquares) {
                        const newBoard = board.slice();
                        newBoard[i] = 'O';
                        const moveScore = minimax(newBoard, false);
                        moves.push({ index: i, score: moveScore });
                    }
                    moves.sort((a, b) => b.score - a.score);
                    
                    // 15% de probabilidad de cometer un error si hay más de una opción
                    if (Math.random() < 0.15 && moves.length > 1) {
                        return moves[1].index; // Elige la segunda mejor opción
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


const ZenFlightView = ({ onBack, onClose }: { onBack: () => void; onClose: () => void; }) => {
    const [playlist, setPlaylist] = useState<EarthImage[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoadingImage, setIsLoadingImage] = useState(true);
    const [cacheBuster, setCacheBuster] = useState(Date.now());
    const [secondsLeft, setSecondsLeft] = useState(13);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        setPlaylist(shuffleArray(earthImages));
        setCurrentIndex(0);
        setIsLoadingImage(true);
        setSecondsLeft(13);
    }, []);
    
    const currentImage = playlist[currentIndex];
    const imageUrl = currentImage ? `https://www.gstatic.com/prettyearth/assets/full/${currentImage.id}.jpg?t=${cacheBuster}` : '';

    const handleNextImage = useCallback(() => {
        setIsLoadingImage(true);
        setSecondsLeft(13);
        setCacheBuster(Date.now());
        setCurrentIndex(prevIndex => {
            let newShuffledPlaylist = playlist;
            let nextIndex = prevIndex + 1;
            
            if (nextIndex >= newShuffledPlaylist.length) {
                newShuffledPlaylist = shuffleArray(earthImages);
                // Ensure the new first image is not the same as the last one.
                if (playlist.length > 1 && newShuffledPlaylist[0].id === playlist[playlist.length - 1].id) {
                    [newShuffledPlaylist[0], newShuffledPlaylist[1]] = [newShuffledPlaylist[1], newShuffledPlaylist[0]];
                }
                setPlaylist(newShuffledPlaylist);
                nextIndex = 0;
            }
            return nextIndex;
        });
    }, [playlist]);

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
                className="absolute inset-0 w-full h-full object-cover animate-kenburns"
                style={{ animationDuration: '13s' }}
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: isLoadingImage ? 0 : 1, scale: isLoadingImage ? 1 : 1.08 }}
                transition={{ duration: 1.5, scale: { duration: 13, ease: 'linear' } }}
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

export const BreakCenter = ({ isOpen, onClose }: BreakCenterProps) => {
    const [view, setView] = useState<View>('menu');
    const { isActive, setIsActive, phase } = useApp();
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
            case 'dino': return <DinoGame onBack={() => setView('minigames_menu')} />;
            case 'snake': return <SnakeGame onBack={() => setView('minigames_menu')} />;
            case '2048': return <Game2048 onBack={() => setView('minigames_menu')} />;
            case 'tic-tac-toe': return <TicTacToeGame onBack={() => setView('minigames_menu')} />;
            case 'zen': return <ZenFlightView onBack={() => setView('menu')} onClose={handleClose} />;
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
