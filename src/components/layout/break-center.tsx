
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Brain, Dog, Cat, Gamepad2, Loader2, AlertTriangle, Check, Trophy, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// --- Type Definitions ---
type View = 'menu' | 'trivia' | 'animals' | 'minigames_menu' | 'snake' | '2048' | 'tic-tac-toe';

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

    const fetchTrivia = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setQuestion(null);
        setSelectedAnswer(null);
        setIsCorrect(null);
        try {
            const response = await fetch('https://opentdb.com/api.php?amount=1&type=multiple&encode=url3986');
            if (!response.ok) throw new Error('No se pudo cargar la trivia.');
            const data = await response.json();
            const result = data.results[0];
            const allAnswers = shuffleArray([...result.incorrect_answers, result.correct_answer]);
            setQuestion({ ...result, shuffled_answers: allAnswers });
        } catch (e: any) {
            setError(e.message || 'Error de red.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTrivia();
    }, [fetchTrivia]);

    const handleAnswer = (answer: string) => {
        if (selectedAnswer) return;
        setSelectedAnswer(answer);
        setIsCorrect(answer === question?.correct_answer);
    };

    if (isLoading) return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    if (error) return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mb-2"/>
            <p className="font-semibold text-destructive">{error}</p>
            <Button onClick={fetchTrivia} className="mt-4">Reintentar</Button>
        </div>
    );
    if (!question) return null;

    return (
        <ViewContainer title="Trivia Rápida" onBack={onBack}>
            <div className="space-y-6">
                <p className="text-center font-semibold text-lg">{decodeURIComponent(question.question)}</p>
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
                                {decodeURIComponent(answer)}
                            </Button>
                        )
                    })}
                </div>
                {selectedAnswer && (
                    <div className="text-center space-y-3">
                        <p className={`font-bold ${isCorrect ? 'text-green-500' : 'text-destructive'}`}>
                            {isCorrect ? '¡Correcto!' : 'Incorrecto'}
                        </p>
                        <Button onClick={fetchTrivia}><RotateCcw className="mr-2 h-4 w-4"/>Siguiente Pregunta</Button>
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

const GameWIP = ({ gameName, onBack }: { gameName: string, onBack: () => void }) => (
    <ViewContainer title={gameName} onBack={onBack}>
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Gamepad2 className="h-16 w-16 mb-4"/>
            <p className="font-bold text-lg">Próximamente</p>
            <p>{gameName} estará disponible en futuras actualizaciones.</p>
        </div>
    </ViewContainer>
);

const MinigamesMenu = ({ setView, onBack }: { setView: (view: View) => void, onBack: () => void }) => {
    return (
        <ViewContainer title="Minijuegos" onBack={onBack}>
            <div className="space-y-3">
                <Button onClick={() => setView('snake')} className="w-full h-14" variant="outline">Snake</Button>
                <Button onClick={() => setView('tic-tac-toe')} className="w-full h-14" variant="outline">Tres en Raya</Button>
                <Button onClick={() => setView('2048')} className="w-full h-14" variant="outline">2048</Button>
            </div>
        </ViewContainer>
    );
};

const useSnakeGame = () => {
    const GRID_SIZE = 20;
    const initialSnake = [{ x: 10, y: 10 }];
    const initialFood = { x: 15, y: 15 };

    const [snake, setSnake] = useState(initialSnake);
    const [food, setFood] = useState(initialFood);
    const [direction, setDirection] = useState({ x: 0, y: -1 });
    const [speed, setSpeed] = useState<number | null>(null);
    const [gameOver, setGameOver] = useState(false);
    
    const startGame = () => {
        setSnake(initialSnake);
        setFood(initialFood);
        setDirection({ x: 0, y: -1 });
        setSpeed(200);
        setGameOver(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowUp': if(direction.y === 0) setDirection({ x: 0, y: -1 }); break;
            case 'ArrowDown': if(direction.y === 0) setDirection({ x: 0, y: 1 }); break;
            case 'ArrowLeft': if(direction.x === 0) setDirection({ x: -1, y: 0 }); break;
            case 'ArrowRight': if(direction.x === 0) setDirection({ x: 1, y: 0 }); break;
        }
    };
    
    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [direction]);

    const createFood = () => {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE)
            };
        } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        setFood(newFood);
    };

    const moveSnake = () => {
        const newSnake = [...snake];
        const head = { x: newSnake[0].x + direction.x, y: newSnake[0].y + direction.y };

        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE || newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
            setGameOver(true);
            setSpeed(null);
            return;
        }

        newSnake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
            createFood();
        } else {
            newSnake.pop();
        }
        setSnake(newSnake);
    };
    
    useEffect(() => {
        if (speed === null) return;
        const gameInterval = setInterval(moveSnake, speed);
        return () => clearInterval(gameInterval);
    }, [snake, direction, speed]);

    return { snake, food, gameOver, GRID_SIZE, startGame };
};

const SnakeGame = ({ onBack }: { onBack: () => void }) => {
    const { snake, food, gameOver, GRID_SIZE, startGame } = useSnakeGame();

    return (
        <ViewContainer title="Snake" onBack={onBack}>
            <div className="flex flex-col items-center gap-4">
                <div
                    className="grid bg-muted/50 border rounded-md"
                    style={{
                        gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                        width: '100%',
                        aspectRatio: '1/1'
                    }}
                >
                    {gameOver && <div className="col-span-full row-span-full flex items-center justify-center bg-black/50 text-white font-bold text-2xl z-10">GAME OVER</div>}
                    {snake.map((segment, index) => (
                        <div key={index} className="bg-primary" style={{ gridColumn: segment.x + 1, gridRow: segment.y + 1 }}/>
                    ))}
                    <div className="bg-red-500 rounded-full" style={{ gridColumn: food.x + 1, gridRow: food.y + 1 }}/>
                </div>
                <Button onClick={startGame}>
                    {gameOver ? 'Jugar de Nuevo' : 'Iniciar Juego'}
                </Button>
            </div>
        </ViewContainer>
    );
};

const TicTacToeGame = ({ onBack }: { onBack: () => void }) => {
    const [board, setBoard] = useState(Array(9).fill(null));
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
        if (winner || board[i]) return;
        const newBoard = board.slice();
        newBoard[i] = 'X';
        setBoard(newBoard);
        setIsXNext(false);
    };
    
    useEffect(() => {
        if (!isXNext && !winner && !isBoardFull) {
            const emptySquares = board.map((sq, i) => sq === null ? i : null).filter(i => i !== null);
            const aiMove = emptySquares[Math.floor(Math.random() * emptySquares.length)];
            if(aiMove !== null) {
                setTimeout(() => {
                    const newBoard = board.slice();
                    newBoard[aiMove!] = 'O';
                    setBoard(newBoard);
                    setIsXNext(true);
                }, 500);
            }
        }
    }, [isXNext, board, winner, isBoardFull]);

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setIsXNext(true);
    };
    
    const getStatus = () => {
        if (winner) return `Ganador: ${winner}`;
        if (isBoardFull) return "¡Empate!";
        return `Turno de: ${isXNext ? 'X' : 'O'}`;
    };

    return (
        <ViewContainer title="Tres en Raya" onBack={onBack}>
            <div className="flex flex-col items-center gap-4">
                <p className="font-bold">{getStatus()}</p>
                <div className="grid grid-cols-3 gap-2 w-64 h-64 bg-muted/50 p-2 rounded-lg">
                    {board.map((value, i) => (
                        <button key={i} onClick={() => handleClick(i)} className="bg-background rounded-md text-4xl font-bold flex items-center justify-center">
                            {value}
                        </button>
                    ))}
                </div>
                <Button onClick={resetGame}>Reiniciar</Button>
            </div>
        </ViewContainer>
    );
};


export const BreakCenter = ({ isOpen, onClose }: BreakCenterProps) => {
    const [view, setView] = useState<View>('menu');

    useEffect(() => {
        if (isOpen) {
            setView('menu');
        }
    }, [isOpen]);

    const handleClose = () => {
        setView('menu');
        onClose();
    };

    const renderView = () => {
        switch(view) {
            case 'trivia': return <TriviaView onBack={() => setView('menu')} />;
            case 'animals': return <AnimalsView onBack={() => setView('menu')} />;
            case 'minigames_menu': return <MinigamesMenu setView={setView} onBack={() => setView('menu')} />;
            case 'snake': return <SnakeGame onBack={() => setView('minigames_menu')} />;
            case '2048': return <GameWIP onBack={() => setView('minigames_menu')} gameName="2048" />;
            case 'tic-tac-toe': return <TicTacToeGame onBack={() => setView('minigames_menu')} />;
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
                >
                    <motion.div
                        className="relative w-full max-w-md h-[80vh] rounded-2xl bg-card border shadow-2xl flex flex-col"
                        variants={modalVariants}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-3 right-3 h-8 w-8 rounded-full z-20"
                            onClick={handleClose}
                            aria-label="Cerrar"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                        <div className="relative h-full w-full overflow-hidden">
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
