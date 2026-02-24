"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ViewContainer } from '@/components/layout/view-container';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X, Circle, Award, Bot, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type Player = 'X' | 'O';
type Square = Player | null;
type Difficulty = 'easy' | 'medium' | 'hard';
type GameStatus = 'playing' | 'won' | 'draw' | 'menu';

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6], // diagonals
];

const TicTacToeGame = ({ onBack }: { onBack: () => void }) => {
  const [board, setBoard] = useState<Square[]>(Array(9).fill(null));
  const [player, setPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<{ player: Player; line: number[] } | null>(null);
  const [status, setStatus] = useState<GameStatus>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [scores, setScores] = useState({ user: 0, ai: 0, draws: 0 });

  const checkWinner = (currentBoard: Square[]): { player: Player; line: number[] } | null => {
    for (const line of WINNING_COMBINATIONS) {
      const [a, b, c] = line;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return { player: currentBoard[a] as Player, line };
      }
    }
    return null;
  };

  const isBoardFull = (currentBoard: Square[]): boolean => {
    return currentBoard.every(square => square !== null);
  };

  const handlePlayerMove = (index: number) => {
    if (board[index] || winner || status !== 'playing' || player !== 'X') {
      return;
    }

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setPlayer('O');

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      setStatus('won');
      setScores(s => ({ ...s, user: s.user + 1 }));
    } else if (isBoardFull(newBoard)) {
      setStatus('draw');
      setScores(s => ({ ...s, draws: s.draws + 1 }));
    }
  };

  const aiMove = useCallback((currentBoard: Square[]): number => {
    const emptySquares = currentBoard.map((sq, i) => sq === null ? i : null).filter(i => i !== null) as number[];

    // --- Lógica de la IA ---

    const findWinningMove = (p: Player): number | null => {
      for (const i of emptySquares) {
        const testBoard = [...currentBoard];
        testBoard[i] = p;
        if (checkWinner(testBoard)) {
          return i;
        }
      }
      return null;
    };
    
    // DIFÍCIL: Algoritmo Minimax
    if (difficulty === 'hard') {
        const minimax = (newBoard: Square[], depth: number, isMaximizing: boolean): { score: number, index?: number } => {
            const gameWinner = checkWinner(newBoard);
            if (gameWinner) {
                return { score: gameWinner.player === 'O' ? 10 - depth : depth - 10 };
            }
            if (isBoardFull(newBoard)) {
                return { score: 0 };
            }

            const currentEmptySquares = newBoard.map((sq, i) => sq === null ? i : null).filter(i => i !== null) as number[];

            if (isMaximizing) { // Turno de la IA (O)
                let bestScore = -Infinity;
                let bestMove: number | undefined;
                for (const i of currentEmptySquares) {
                    const testBoard = [...newBoard];
                    testBoard[i] = 'O';
                    const { score } = minimax(testBoard, depth + 1, false);
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = i;
                    }
                }
                return { score: bestScore, index: bestMove };
            } else { // Turno del Jugador (X)
                let bestScore = Infinity;
                 for (const i of currentEmptySquares) {
                    const testBoard = [...newBoard];
                    testBoard[i] = 'X';
                    const { score } = minimax(testBoard, depth + 1, true);
                    if (score < bestScore) {
                        bestScore = score;
                    }
                }
                return { score: bestScore };
            }
        };

        const result = minimax(currentBoard, 0, true);
        if (result.index !== undefined) {
             return result.index;
        }
    }
    
    // FÁCIL: 60% de error
    if (difficulty === 'easy' && Math.random() < 0.6) {
      return emptySquares[Math.floor(Math.random() * emptySquares.length)];
    }

    // Lógica para MEDIO y FÁCIL (sin error)
    // 1. Ganar
    const winningMove = findWinningMove('O');
    if (winningMove !== null) return winningMove;
    
    // 2. Bloquear
    const blockingMove = findWinningMove('X');
    if (blockingMove !== null) return blockingMove;
    
    // 3. Estrategia: Centro y Esquinas
    const strategicMoves = [4, 0, 2, 6, 8].filter(i => emptySquares.includes(i));
    if (strategicMoves.length > 0) return strategicMoves[0];

    // 4. Movimiento aleatorio como último recurso
    return emptySquares[Math.floor(Math.random() * emptySquares.length)];

  }, [difficulty]);


  useEffect(() => {
    if (player === 'O' && status === 'playing') {
      const timer = setTimeout(() => {
        const move = aiMove(board);
        if (move !== undefined) {
          const newBoard = [...board];
          newBoard[move] = 'O';
          setBoard(newBoard);
          setPlayer('X');

          const gameWinner = checkWinner(newBoard);
          if (gameWinner) {
            setWinner(gameWinner);
            setStatus('won');
            setScores(s => ({ ...s, ai: s.ai + 1 }));
          } else if (isBoardFull(newBoard)) {
            setStatus('draw');
            setScores(s => ({ ...s, draws: s.draws + 1 }));
          }
        }
      }, 500); // Retraso para simular pensamiento
      return () => clearTimeout(timer);
    }
  }, [player, board, status, aiMove]);

  const startGame = (diff: Difficulty) => {
    setDifficulty(diff);
    resetBoard();
    setStatus('playing');
  };
  
  const resetBoard = () => {
    setBoard(Array(9).fill(null));
    setPlayer('X');
    setWinner(null);
    setStatus('playing');
  }

  const backToMenu = () => {
      setStatus('menu');
      setBoard(Array(9).fill(null));
      setWinner(null);
      setPlayer('X');
  }
  
  if (status === 'menu') {
      return (
         <ViewContainer title="Tres en Raya" onBack={onBack}>
            <div className="flex flex-col items-center justify-center h-full gap-4">
                 <h3 className="text-xl font-bold">Elige la Dificultad</h3>
                <Button onClick={() => startGame('easy')} className="w-full max-w-xs">Fácil</Button>
                <Button onClick={() => startGame('medium')} className="w-full max-w-xs">Medio</Button>
                <Button onClick={() => startGame('hard')} className="w-full max-w-xs">Difícil (Imposible)</Button>
            </div>
         </ViewContainer>
      )
  }

  return (
    <ViewContainer title="Tres en Raya" onBack={onBack}>
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center justify-center gap-4 text-sm font-semibold w-full bg-muted p-2 rounded-lg">
            <span className="flex items-center gap-1.5"><User className="h-4 w-4"/>Tú: {scores.user}</span>
            <span className="flex items-center gap-1.5"><Bot className="h-4 w-4"/>IA: {scores.ai}</span>
            <span className="flex items-center gap-1.5"><Award className="h-4 w-4"/>Empates: {scores.draws}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 w-full max-w-[300px] aspect-square">
          {board.map((value, index) => (
            <button
              key={index}
              onClick={() => handlePlayerMove(index)}
              className={cn(
                "flex items-center justify-center bg-muted rounded-lg aspect-square transition-all duration-300 hover:bg-accent active:scale-95",
                winner && winner.line.includes(index) && "bg-yellow-400/30 animate-pulse"
              )}
            >
              {value === 'X' && <X className="h-12 w-12 text-blue-500" strokeWidth={3} />}
              {value === 'O' && <Circle className="h-12 w-12 text-rose-500" strokeWidth={3} />}
            </button>
          ))}
        </div>
        <AnimatePresence>
            {(status === 'won' || status === 'draw') && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                >
                    <p className="text-2xl font-bold">
                        {status === 'draw' ? '¡Es un Empate!' : winner?.player === 'X' ? '¡Has Ganado!' : '¡Ha Ganado la IA!'}
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={backToMenu}>Cambiar Dificultad</Button>
                        <Button onClick={resetBoard}>Jugar otra vez</Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
         <Badge variant="secondary" className="mt-4">{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</Badge>
      </div>
    </ViewContainer>
  );
};

export default TicTacToeGame;
