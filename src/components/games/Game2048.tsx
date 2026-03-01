"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { ViewContainer } from '@/components/layout/view-container';

const GRID_SIZE = 4;

type Board = number[][];

type GameState = {
  board: Board;
  score: number;
  gameOver: boolean;
  gameWon: boolean;
};

// Genera un tablero vacío 4x4
const getEmptyBoard = (): Board => Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));

// Añade un 2 (90% prob) o 4 (10% prob) en una celda vacía aleatoria
const addRandomTile = (board: Board): Board => {
  const emptyCells: { r: number; c: number }[] = [];
  board.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell === 0) emptyCells.push({ r, c });
    });
  });

  if (emptyCells.length === 0) return board;

  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const newBoard = board.map((row) => [...row]);
  newBoard[randomCell.r][randomCell.c] = Math.random() < 0.9 ? 2 : 4;
  return newBoard;
};

function Game2048Content() {
  const [gameState, setGameState] = useState<GameState>(() => {
    let initialBoard = getEmptyBoard();
    initialBoard = addRandomTile(initialBoard);
    initialBoard = addRandomTile(initialBoard);
    return {
      board: initialBoard,
      score: 0,
      gameOver: false,
      gameWon: false,
    };
  });

  // Utilidad: Comprueba si hay movimientos posibles
  const checkGameOver = (board: Board) => {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (board[r][c] === 0) return false;
        if (c < GRID_SIZE - 1 && board[r][c] === board[r][c + 1]) return false;
        if (r < GRID_SIZE - 1 && board[r][c] === board[r + 1][c]) return false;
      }
    }
    return true;
  };

  // El motor del juego: Colapsa un array hacia la izquierda (ej: [2, 2, 4, 0] -> [4, 4, 0, 0])
  const slideAndMerge = (row: number[]): { newRow: number[]; scoreGained: number } => {
    let scoreGained = 0;
    // 1. Quitar ceros
    let filtered = row.filter((val) => val !== 0);
    // 2. Fusionar iguales adyacentes
    for (let i = 0; i < filtered.length - 1; i++) {
      if (filtered[i] === filtered[i + 1]) {
        filtered[i] *= 2;
        scoreGained += filtered[i];
        filtered.splice(i + 1, 1);
      }
    }
    // 3. Rellenar con ceros hasta GRID_SIZE
    while (filtered.length < GRID_SIZE) {
      filtered.push(0);
    }
    return { newRow: filtered, scoreGained };
  };

  // Función principal de movimiento
  const move = useCallback((direction: "UP" | "DOWN" | "LEFT" | "RIGHT") => {
    setGameState((prev) => {
      if (prev.gameOver || prev.gameWon) return prev;

      let newBoard = prev.board.map((row) => [...row]);
      let scoreGained = 0;
      let moved = false;

      // Utilidad para rotar la matriz (transposición)
      const transpose = (mat: Board) => mat[0].map((_, colIndex) => mat.map((row) => row[colIndex]));

      if (direction === "LEFT" || direction === "RIGHT") {
        for (let r = 0; r < GRID_SIZE; r++) {
          let row = newBoard[r];
          if (direction === "RIGHT") row.reverse();
          const result = slideAndMerge(row);
          if (direction === "RIGHT") result.newRow.reverse();
          
          if (JSON.stringify(newBoard[r]) !== JSON.stringify(result.newRow)) moved = true;
          newBoard[r] = result.newRow;
          scoreGained += result.scoreGained;
        }
      } else if (direction === "UP" || direction === "DOWN") {
        let transposed = transpose(newBoard);
        for (let r = 0; r < GRID_SIZE; r++) {
          let row = transposed[r];
          if (direction === "DOWN") row.reverse();
          const result = slideAndMerge(row);
          if (direction === "DOWN") result.newRow.reverse();

          if (JSON.stringify(transposed[r]) !== JSON.stringify(result.newRow)) moved = true;
          transposed[r] = result.newRow;
          scoreGained += result.scoreGained;
        }
        newBoard = transpose(transposed);
      }

      if (moved) {
        newBoard = addRandomTile(newBoard);
        const isOver = checkGameOver(newBoard);
        const isWon = newBoard.some((row) => row.includes(2048)); // Ganaste si llegas a 2048

        return {
          board: newBoard,
          score: prev.score + scoreGained,
          gameOver: isOver,
          gameWon: !prev.gameWon && isWon, // Solo muestra victoria la primera vez
        };
      }

      return prev;
    });
  }, []);

  // Controles por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "KeyW"].includes(e.code)) { e.preventDefault(); move("UP"); }
      if (["ArrowDown", "KeyS"].includes(e.code)) { e.preventDefault(); move("DOWN"); }
      if (["ArrowLeft", "KeyA"].includes(e.code)) { e.preventDefault(); move("LEFT"); }
      if (["ArrowRight", "KeyD"].includes(e.code)) { e.preventDefault(); move("RIGHT"); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [move]);

  // Controles Táctiles
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) {
      move(dx > 0 ? "RIGHT" : "LEFT");
    } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 30) {
      move(dy > 0 ? "DOWN" : "UP");
    }
    touchStartRef.current = null;
  };

  const resetGame = () => {
    let initialBoard = getEmptyBoard();
    initialBoard = addRandomTile(initialBoard);
    initialBoard = addRandomTile(initialBoard);
    setGameState({ board: initialBoard, score: 0, gameOver: false, gameWon: false });
  };

  // Mapeo dinámico de colores y tamaños de texto
  const getTileStyles = (val: number) => {
    if (val === 0) return "bg-slate-300 text-transparent";
    if (val === 2) return "bg-slate-100 text-slate-700 text-4xl";
    if (val === 4) return "bg-amber-100 text-slate-700 text-4xl";
    if (val === 8) return "bg-orange-300 text-white text-4xl";
    if (val === 16) return "bg-orange-400 text-white text-4xl";
    if (val === 32) return "bg-orange-500 text-white text-4xl";
    if (val === 64) return "bg-orange-600 text-white text-4xl";
    if (val === 128) return "bg-yellow-400 text-white text-3xl shadow-[0_0_10px_rgba(250,204,21,0.5)]";
    if (val === 256) return "bg-yellow-500 text-white text-3xl shadow-[0_0_15px_rgba(234,179,8,0.6)]";
    if (val === 512) return "bg-yellow-600 text-white text-3xl shadow-[0_0_20px_rgba(202,138,4,0.7)]";
    if (val === 1024) return "bg-yellow-700 text-white text-2xl shadow-[0_0_25px_rgba(161,98,7,0.8)]";
    if (val >= 2048) return "bg-yellow-800 text-white text-2xl shadow-[0_0_30px_rgba(113,63,18,0.9)]";
    return "bg-slate-800 text-white text-2xl";
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 font-sans select-none touch-none">
      
      {/* Cabecera del Juego */}
      <div className="w-[320px] sm:w-[400px] flex justify-between items-center mb-6">
        <h1 className="text-5xl font-black text-slate-700">2048</h1>
        <div className="bg-slate-700 rounded-md px-4 py-2 text-center shadow-inner">
          <p className="text-slate-300 font-bold text-xs uppercase tracking-wider">Score</p>
          <p className="text-white font-black text-xl">{gameState.score}</p>
        </div>
      </div>

      {/* Controles táctiles invisibles sobre el tablero */}
      <div className="relative">
        <div 
          className="bg-slate-400 p-3 rounded-lg shadow-xl"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* El Grid */}
          <div className="grid grid-cols-4 gap-3 bg-slate-400 rounded-md">
            {gameState.board.map((row, rIndex) => (
              <React.Fragment key={rIndex}>
                {row.map((cell, cIndex) => (
                  <div
                    key={`${rIndex}-${cIndex}`}
                    className={`
                      w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-md font-black
                      transition-all duration-150 ease-in-out transform
                      ${getTileStyles(cell)}
                      ${cell > 0 ? 'scale-100' : 'scale-95'}
                    `}
                  >
                    {cell > 0 ? cell : ""}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Overlay Game Over */}
        {gameState.gameOver && (
          <div className="absolute inset-0 bg-slate-200/70 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg z-10 animate-fade-in">
            <h2 className="text-4xl font-black text-slate-800 mb-4">¡Juego Terminado!</h2>
            <button
              onClick={resetGame}
              className="bg-slate-800 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-slate-700 active:scale-95 transition-all"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Overlay Victoria */}
        {gameState.gameWon && (
          <div className="absolute inset-0 bg-yellow-400/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg z-10 animate-fade-in">
            <h2 className="text-5xl font-black text-white mb-2 drop-shadow-md">¡Ganaste!</h2>
            <p className="text-yellow-900 font-bold mb-6">Llegaste al 2048</p>
            <div className="flex gap-4">
              <button
                onClick={() => setGameState(p => ({ ...p, gameWon: false }))}
                className="bg-white text-yellow-600 font-bold py-2 px-6 rounded-full shadow-md active:scale-95 transition-all"
              >
                Seguir jugando
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 text-slate-500 text-sm max-w-[320px] sm:max-w-[400px] text-center">
        <p>Usa las <strong className="text-slate-600">flechas del teclado</strong>, <strong className="text-slate-600">WASD</strong> o <strong className="text-slate-600">desliza</strong> en móvil para unir los números y llegar a la ficha 2048.</p>
      </div>

    </div>
  );
}

const Game2048 = ({ onBack }: { onBack: () => void }) => {
    return (
        <ViewContainer title="2048" onBack={onBack}>
            <Game2048Content />
        </ViewContainer>
    );
};

export default Game2048;
