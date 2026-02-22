
"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Brain, Dog, Cat, Gamepad2, Loader2, AlertTriangle, Check, Trophy, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

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
                retryAttempted.current = false; // Reset on success
            } else if (data.response_code === 5 && !retryAttempted.current) {
                retryAttempted.current = true;
                setTimeout(() => {
                    fetchTrivia(); // Retry
                }, 2000);
                return; // Prevent setting isLoading to false yet
            } else {
                 console.error('Error detallado Trivia:', data);
                 throw new Error(`La API de trivia devolvió un error (código: ${data.response_code}).`);
            }
        } catch (e: any) {
            console.error('Error detallado Trivia:', e);
            setError(e.message || 'Error de red.');
        } finally {
            if (!retryAttempted.current || (retryAttempted.current && error !== null)) {
               setIsLoading(false);
            }
        }
    }, [error]);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        fetchTrivia();
    }, [fetchTrivia]);


    const handleAnswer = (answer: string) => {
        if (selectedAnswer) return;
        setSelectedAnswer(answer);
        setIsCorrect(answer === question?.correct_answer);
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
        setSpeed(150);
        setGameOver(false);
    };

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowUp': if(direction.y === 0) setDirection({ x: 0, y: -1 }); break;
            case 'ArrowDown': if(direction.y === 0) setDirection({ x: 0, y: 1 }); break;
            case 'ArrowLeft': if(direction.x === 0) setDirection({ x: -1, y: 0 }); break;
            case 'ArrowRight': if(direction.x === 0) setDirection({ x: 1, y: 0 }); break;
        }
    }, [direction]);
    
    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

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

    const moveSnake = useCallback(() => {
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
    }, [snake, direction, food.x, food.y]);
    
    useEffect(() => {
        if (speed === null) return;
        const gameInterval = setInterval(moveSnake, speed);
        return () => clearInterval(gameInterval);
    }, [snake, moveSnake, speed]);

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
                         <div key={index} className={cn("flex items-center justify-center", index === 0 ? "text-lg" : "bg-green-500 rounded-sm")} style={{ gridColumn: segment.x + 1, gridRow: segment.y + 1 }}>
                            {index === 0 && '🐍'}
                        </div>
                    ))}
                    <div className="flex items-center justify-center text-lg" style={{ gridColumn: food.x + 1, gridRow: food.y + 1 }}>🍎</div>
                </div>
                <Button onClick={startGame}>
                    {gameOver ? 'Jugar de Nuevo' : 'Iniciar Juego'}
                </Button>
            </div>
        </ViewContainer>
    );
};

const TicTacToeGame = ({ onBack }: { onBack: () => void }) => {
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
    
    useEffect(() => {
        if (!isXNext && !winner && !isBoardFull) {
            const emptySquares = board.map((sq, i) => sq === null ? i : null).filter((i): i is number => i !== null);
            
            const findBestMove = () => {
                // 1. AI can win
                for (const i of emptySquares) {
                    const nextBoard = board.slice();
                    nextBoard[i] = 'O';
                    if (calculateWinner(nextBoard) === 'O') return i;
                }
                // 2. Player can win, block
                for (const i of emptySquares) {
                    const nextBoard = board.slice();
                    nextBoard[i] = 'X';
                    if (calculateWinner(nextBoard) === 'X') return i;
                }
                // 3. Take center
                if (emptySquares.includes(4)) return 4;
                // 4. Take a corner
                const corners = [0, 2, 6, 8].filter(i => emptySquares.includes(i));
                if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];
                // 5. Random
                return emptySquares[Math.floor(Math.random() * emptySquares.length)];
            };

            const aiMove = findBestMove();
            
            if(aiMove !== undefined) {
                setTimeout(() => {
                    const newBoard = board.slice();
                    newBoard[aiMove] = 'O';
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

    const initializeBoard = useCallback(() => {
        let newBoard = Array(4).fill(0).map(() => Array(4).fill(0));
        addRandomTile(newBoard);
        addRandomTile(newBoard);
        setBoard(newBoard);
        setScore(0);
        setGameOver(false);
    }, []);
    
    const addRandomTile = (currentBoard: number[][]) => {
        let emptyTiles: {x: number, y: number}[] = [];
        currentBoard.forEach((row, y) => {
            row.forEach((tile, x) => { if (tile === 0) emptyTiles.push({x, y}); });
        });
        if (emptyTiles.length > 0) {
            const { x, y } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
            currentBoard[y][x] = Math.random() < 0.9 ? 2 : 4;
        }
        return currentBoard;
    };

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
            addRandomTile(tempBoard);
            setBoard(tempBoard);
            checkGameOver(tempBoard);
        }
    }, [board, gameOver]);
    
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
            case '2048': return <Game2048 onBack={() => setView('minigames_menu')} />;
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
