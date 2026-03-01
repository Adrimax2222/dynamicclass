"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { ViewContainer } from '@/components/layout/view-container';

// Constantes del motor
const GRID_SIZE = 20; // 20x20 casillas
const CELL_SIZE = 16; // 16px por casilla (Total: 320x320 px)
const BASE_SPEED_FRAMES = 12; // Frames que deben pasar para moverse 1 casilla

type Point = { x: number; y: number };

type GameState = {
  snake: Point[];
  food: Point;
  direction: Point;
  nextDirection: Point;
  score: number;
  gameOver: boolean;
  isPlaying: boolean;
  framesUntilMove: number;
};

// Vector de direcciones
const UP = { x: 0, y: -1 };
const DOWN = { x: 0, y: 1 };
const LEFT = { x: -1, y: 0 };
const RIGHT = { x: 1, y: 0 };

const generateFood = (snake: Point[]): Point => {
  let newFood: Point;
  let isOccupied = true;
  while (isOccupied) {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    // eslint-disable-next-line no-loop-func
    isOccupied = snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y);
  }
  return newFood!;
};

export default function SnakeGame({ onBack }: { onBack: () => void }) {
  const [gameState, setGameState] = useState<GameState>({
    snake: [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ],
    food: { x: 5, y: 5 },
    direction: UP,
    nextDirection: UP,
    score: 0,
    gameOver: false,
    isPlaying: false,
    framesUntilMove: BASE_SPEED_FRAMES,
  });

  const requestRef = useRef<number>();

  // Calcular la rotación de la cabeza en grados
  const getHeadRotation = (dir: Point) => {
    if (dir.x === 1) return 90; // Derecha
    if (dir.x === -1) return -90; // Izquierda
    if (dir.y === 1) return 180; // Abajo
    return 0; // Arriba (por defecto)
  };

  const startGame = useCallback(() => {
    setGameState({
      snake: [
        { x: 10, y: 10 },
        { x: 10, y: 11 },
        { x: 10, y: 12 },
      ],
      food: generateFood([]), // Idealmente le pasas el snake inicial aquí
      direction: UP,
      nextDirection: UP,
      score: 0,
      gameOver: false,
      isPlaying: true,
      framesUntilMove: BASE_SPEED_FRAMES,
    });
  }, []);

  // Controles de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setGameState((prev) => {
        if (!prev.isPlaying || prev.gameOver) {
          if (e.code === "Space") startGame();
          return prev;
        }

        let newDir = prev.nextDirection;
        // Evitamos que la serpiente gire 180 grados sobre sí misma
        if ((e.code === "ArrowUp" || e.code === "KeyW") && prev.direction.y === 0) newDir = UP;
        if ((e.code === "ArrowDown" || e.code === "KeyS") && prev.direction.y === 0) newDir = DOWN;
        if ((e.code === "ArrowLeft" || e.code === "KeyA") && prev.direction.x === 0) newDir = LEFT;
        if ((e.code === "ArrowRight" || e.code === "KeyD") && prev.direction.x === 0) newDir = RIGHT;

        return { ...prev, nextDirection: newDir };
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [startGame]);

  // Controles Táctiles (Swipe simplificado)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !gameState.isPlaying || gameState.gameOver) return;

    const dx = e.touches[0].clientX - touchStartRef.current.x;
    const dy = e.touches[0].clientY - touchStartRef.current.y;
    
    // Umbral de movimiento para considerarlo un swipe
    if (Math.abs(dx) > 20 || Math.abs(dy) > 20) {
      setGameState((prev) => {
        let newDir = prev.nextDirection;
        if (Math.abs(dx) > Math.abs(dy)) {
          // Horizontal
          if (dx > 0 && prev.direction.x === 0) newDir = RIGHT;
          else if (dx < 0 && prev.direction.x === 0) newDir = LEFT;
        } else {
          // Vertical
          if (dy > 0 && prev.direction.y === 0) newDir = DOWN;
          else if (dy < 0 && prev.direction.y === 0) newDir = UP;
        }
        return { ...prev, nextDirection: newDir };
      });
      touchStartRef.current = null; // Reset para no disparar múltiples veces
    }
  };

  // Motor del juego (Game Loop a 60 FPS aprox)
  useEffect(() => {
    const loop = () => {
      setGameState((prev) => {
        if (!prev.isPlaying || prev.gameOver) return prev;

        let frames = prev.framesUntilMove - 1;

        // Solo movemos la serpiente cuando el contador llega a 0
        if (frames > 0) {
          return { ...prev, framesUntilMove: frames };
        }

        // --- LÓGICA DE MOVIMIENTO EXACTO ---
        const currentHead = prev.snake[0];
        const newDirection = prev.nextDirection;
        const newHead = {
          x: currentHead.x + newDirection.x,
          y: currentHead.y + newDirection.y,
        };

        let isGameOver = false;

        // 1. Colisión con las paredes
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          isGameOver = true;
        }

        // 2. Colisión consigo misma
        // (excluimos la punta de la cola porque se va a mover en este mismo frame)
        if (
          prev.snake.some((segment, index) => {
            if (index === prev.snake.length - 1) return false; 
            return segment.x === newHead.x && segment.y === newHead.y;
          })
        ) {
          isGameOver = true;
        }

        if (isGameOver) {
          return { ...prev, gameOver: true, direction: newDirection };
        }

        const newSnake = [newHead, ...prev.snake];
        let newScore = prev.score;
        let newFood = prev.food;

        // 3. Comer comida
        if (newHead.x === prev.food.x && newHead.y === prev.food.y) {
          newScore += 10;
          newFood = generateFood(newSnake);
          // No hacemos .pop() a la serpiente, así crece
        } else {
          // Si no come, eliminamos el último segmento para mantener el tamaño
          newSnake.pop();
        }

        // Dificultad progresiva: baja los frames necesarios para moverse
        const currentSpeedFrames = Math.max(4, BASE_SPEED_FRAMES - Math.floor(newScore / 50));

        return {
          ...prev,
          snake: newSnake,
          food: newFood,
          direction: newDirection,
          score: newScore,
          framesUntilMove: currentSpeedFrames,
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
    <ViewContainer title="Snake" onBack={onBack}>
      <div className="flex flex-col items-center justify-center p-4 font-sans select-none touch-none">
        
        {/* UI Puntuación */}
        <div className="w-[320px] flex justify-between bg-emerald-900 px-4 py-2 rounded-t-lg shadow-md z-10 text-white font-mono">
          <span className="font-bold">SNAKE FLUID</span>
          <span className="tracking-widest">SCORE: {gameState.score}</span>
        </div>

        {/* Tablero de Juego */}
        <div
          className="relative bg-emerald-50 border-x-4 border-b-4 border-emerald-900 shadow-2xl rounded-b-lg overflow-hidden"
          style={{ width: `${GRID_SIZE * CELL_SIZE}px`, height: `${GRID_SIZE * CELL_SIZE}px` }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          {/* Renderizado de la Comida (Manzana) */}
          <div
            className="absolute bg-red-500 rounded-full shadow-inner transition-transform duration-200"
            style={{
              width: `${CELL_SIZE - 2}px`,
              height: `${CELL_SIZE - 2}px`,
              // Usamos transform para mejor rendimiento
              transform: `translate(${gameState.food.x * CELL_SIZE + 1}px, ${gameState.food.y * CELL_SIZE + 1}px)`,
            }}
          >
            {/* Hojita de la manzana */}
            <div className="absolute -top-1 right-1 w-2 h-2 bg-green-600 rounded-full rounded-bl-none" />
          </div>

          {/* Renderizado de la Serpiente */}
          {gameState.snake.map((segment, index) => {
            const isHead = index === 0;
            
            return (
              <div
                key={`${index}-${segment.x}-${segment.y}`} // Key compuesta para evitar glitches de render
                className={`absolute rounded-sm ${isHead ? 'bg-emerald-700 z-20' : 'bg-emerald-500 z-10'}`}
                style={{
                  width: `${CELL_SIZE}px`,
                  height: `${CELL_SIZE}px`,
                  // LA CLAVE DE LA FLUIDEZ: Usar transform y una transición CSS rápida
                  transform: `translate(${segment.x * CELL_SIZE}px, ${segment.y * CELL_SIZE}px)`,
                  transition: "transform 100ms linear", 
                }}
              >
                {/* Contenido exclusivo de la Cabeza */}
                {isHead && (
                  <div 
                    className="w-full h-full relative"
                    style={{ transform: `rotate(${getHeadRotation(gameState.direction)}deg)` }}
                  >
                    {/* Ojos */}
                    <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white rounded-full flex items-center justify-center">
                      <div className="w-0.5 h-0.5 bg-black rounded-full" />
                    </div>
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full flex items-center justify-center">
                      <div className="w-0.5 h-0.5 bg-black rounded-full" />
                    </div>
                    {/* Lengua bífida animada */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex flex-col items-center animate-pulse">
                       <div className="w-1 h-1.5 bg-red-500" />
                       <div className="flex gap-[2px]">
                          <div className="w-0.5 h-1 bg-red-500 rotate-[20deg]" />
                          <div className="w-0.5 h-1 bg-red-500 -rotate-[20deg]" />
                       </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Overlays */}
          {!gameState.isPlaying && !gameState.gameOver && (
            <div className="absolute inset-0 bg-emerald-900/40 flex flex-col items-center justify-center z-30 backdrop-blur-sm cursor-pointer" onClick={startGame}>
              <div className="bg-white px-6 py-3 rounded-lg shadow-xl text-emerald-900 font-bold text-center animate-bounce">
                Pulsa ESPACIO o toca<br/>para empezar
              </div>
            </div>
          )}

          {gameState.gameOver && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-30 backdrop-blur-sm">
              <h2 className="text-4xl font-black text-red-500 mb-2">¡OUCH!</h2>
              <p className="text-white font-mono mb-6">Puntuación: {gameState.score}</p>
              <button
                onClick={startGame}
                className="bg-emerald-500 hover:bg-emerald-400 text-emerald-900 font-black uppercase py-2 px-6 rounded shadow-lg active:scale-95 transition-all"
              >
                Jugar de nuevo
              </button>
            </div>
          )}
        </div>

        <p className="mt-4 text-xs text-slate-500 font-mono text-center">
          Usa las flechas del teclado, WASD o desliza el dedo en la pantalla.
        </p>
      </div>
    </ViewContainer>
  );
}
