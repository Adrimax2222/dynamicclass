"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

// Constantes del motor del juego
const GRAVITY = 0.5;
const FLAP_VELOCITY = -8;
const PIPE_SPEED = 3;
const PIPE_WIDTH = 60;
const GAP_SIZE = 140; // Hueco entre tuberías
const BIRD_SIZE = 24;
const BIRD_X = 50; // Posición horizontal estática del pájaro
const GAME_WIDTH = 350; // Resolución lógica interna (ancho)
const GAME_HEIGHT = 500; // Resolución lógica interna (alto)
const PIPE_SPAWN_RATE = 90; // Frames entre cada nueva tubería

type Pipe = {
  id: number;
  x: number;
  topHeight: number;
  passed: boolean;
};

type GameState = {
  birdY: number;
  velocity: number;
  pipes: Pipe[];
  score: number;
  status: "idle" | "playing" | "gameover";
  framesUntilNextPipe: number;
};

export default function FlappyBirdGame() {
  const [gameState, setGameState] = useState<GameState>({
    birdY: GAME_HEIGHT / 2,
    velocity: 0,
    pipes: [],
    score: 0,
    status: "idle",
    framesUntilNextPipe: 0,
  });

  const requestRef = useRef<number>();

  // Controlador de Salto (Flap)
  const flap = useCallback(() => {
    setGameState((prev) => {
      if (prev.status === "gameover") {
        // Reiniciar el juego
        return {
          birdY: GAME_HEIGHT / 2,
          velocity: FLAP_VELOCITY,
          pipes: [],
          score: 0,
          status: "playing",
          framesUntilNextPipe: PIPE_SPAWN_RATE,
        };
      }
      if (prev.status === "idle") {
        // Iniciar el juego
        return { ...prev, status: "playing", velocity: FLAP_VELOCITY };
      }
      // Saltar (sobrescribe la velocidad actual con el impulso negativo)
      return { ...prev, velocity: FLAP_VELOCITY };
    });
  }, []);

  // Listeners de controles (Teclado)
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

  // Motor del juego (Game Loop a 60 FPS aprox)
  useEffect(() => {
    const loop = () => {
      setGameState((prev) => {
        if (prev.status !== "playing") return prev;

        // 1. Físicas del Pájaro (Gravedad)
        const newVelocity = prev.velocity + GRAVITY;
        let newBirdY = prev.birdY + newVelocity;

        // 2. Gestión de Tuberías (Movimiento y Limpieza)
        let newPipes = prev.pipes
          .map((pipe) => ({ ...pipe, x: pipe.x - PIPE_SPEED }))
          .filter((pipe) => pipe.x + PIPE_WIDTH > 0); // Limpieza de memoria off-screen

        // 3. Generación de nuevas Tuberías
        let nextPipeTimer = prev.framesUntilNextPipe - 1;
        if (nextPipeTimer <= 0) {
          const minPipeHeight = 50;
          const maxPipeHeight = GAME_HEIGHT - GAP_SIZE - minPipeHeight;
          const topHeight =
            Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1)) +
            minPipeHeight;

          newPipes.push({
            id: Date.now(),
            x: GAME_WIDTH,
            topHeight: topHeight,
            passed: false,
          });
          nextPipeTimer = PIPE_SPAWN_RATE;
        }

        // 4. Sistema de Puntuación
        let newScore = prev.score;
        newPipes.forEach((pipe) => {
          if (!pipe.passed && pipe.x + PIPE_WIDTH < BIRD_X) {
            newScore += 1;
            pipe.passed = true;
          }
        });

        // 5. Detección de Colisiones (AABB - Axis-Aligned Bounding Box)
        let isGameOver = false;
        
        // Colisión con Techo y Suelo
        if (newBirdY < 0 || newBirdY + BIRD_SIZE > GAME_HEIGHT) {
          isGameOver = true;
          // Ajustamos visualmente el pájaro para que no atraviese el suelo al morir
          if (newBirdY + BIRD_SIZE > GAME_HEIGHT) newBirdY = GAME_HEIGHT - BIRD_SIZE;
        }

        // Hitbox indulgente (reduce el área de colisión unos píxeles para ser más justo con el jugador)
        const hitboxShrink = 4;
        const bLeft = BIRD_X + hitboxShrink;
        const bRight = BIRD_X + BIRD_SIZE - hitboxShrink;
        const bTop = newBirdY + hitboxShrink;
        const bBottom = newBirdY + BIRD_SIZE - hitboxShrink;

        for (const pipe of newPipes) {
          const pLeft = pipe.x;
          const pRight = pipe.x + PIPE_WIDTH;

          // Si el pájaro está horizontalmente dentro de la tubería...
          if (bRight > pLeft && bLeft < pRight) {
            // Choca con la tubería superior O la inferior
            if (bTop < pipe.topHeight || bBottom > pipe.topHeight + GAP_SIZE) {
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
          status: isGameOver ? "gameover" : "playing",
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
    <div className="flex flex-col items-center justify-center w-full w-full p-4 font-sans select-none touch-none">
      
      {/* Contenedor Principal del Juego */}
      <div
        className="relative overflow-hidden bg-sky-300 shadow-2xl rounded-lg border-4 border-slate-800 cursor-pointer"
        style={{ width: `${GAME_WIDTH}px`, height: `${GAME_HEIGHT}px` }}
        onClick={flap}
        onTouchStart={(e) => {
          e.preventDefault();
          flap();
        }}
      >
        
        {/* UI: Puntuación en tiempo real */}
        <div className="absolute top-6 w-full text-center z-20 pointer-events-none">
          <span className="text-5xl font-black text-white" style={{ WebkitTextStroke: "2px #1e293b" }}>
            {gameState.score}
          </span>
        </div>

        {/* El Pájaro */}
        <div
          className="absolute bg-yellow-400 rounded-full border-2 border-slate-800 z-10 transition-transform duration-75"
          style={{
            width: `${BIRD_SIZE}px`,
            height: `${BIRD_SIZE}px`,
            left: `${BIRD_X}px`,
            top: `${gameState.birdY}px`,
            // Rota el pájaro dependiendo de su velocidad vertical (da un toque visual excelente)
            transform: `rotate(${Math.min(Math.max(gameState.velocity * 4, -25), 90)}deg)`,
          }}
        >
          {/* Ojo del pájaro */}
          <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-white rounded-full">
            <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-black rounded-full" />
          </div>
          {/* Pico del pájaro */}
          <div className="absolute top-2.5 -right-2 w-3 h-2 bg-orange-500 rounded-r-full border border-slate-800" />
        </div>

        {/* Las Tuberías */}
        {gameState.pipes.map((pipe) => (
          <React.Fragment key={pipe.id}>
            {/* Tubería Superior */}
            <div
              className="absolute bg-green-500 border-2 border-green-800 rounded-b-sm"
              style={{
                width: `${PIPE_WIDTH}px`,
                height: `${pipe.topHeight}px`,
                left: `${pipe.x}px`,
                top: 0,
              }}
            >
              {/* Reborde inferior de la tubería (para darle el look clásico de Mario/Flappy) */}
              <div className="absolute bottom-0 -left-1 w-[calc(100%+8px)] h-6 bg-green-500 border-2 border-green-800" />
            </div>

            {/* Tubería Inferior */}
            <div
              className="absolute bg-green-500 border-2 border-green-800 rounded-t-sm"
              style={{
                width: `${PIPE_WIDTH}px`,
                height: `${GAME_HEIGHT - pipe.topHeight - GAP_SIZE}px`,
                left: `${pipe.x}px`,
                top: `${pipe.topHeight + GAP_SIZE}px`,
              }}
            >
              {/* Reborde superior de la tubería */}
              <div className="absolute top-0 -left-1 w-[calc(100%+8px)] h-6 bg-green-500 border-2 border-green-800" />
            </div>
          </React.Fragment>
        ))}

        {/* Suelo (Visual) */}
        <div className="absolute bottom-0 w-full h-4 bg-amber-200 border-t-4 border-amber-800 z-10" />

        {/* Overlays de Estado (Start / Game Over) */}
        {gameState.status === "idle" && (
          <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center z-30 pointer-events-none">
            <div className="bg-white px-6 py-3 rounded shadow-lg text-slate-800 font-bold text-lg animate-bounce">
              Toca para volar
            </div>
          </div>
        )}

        {gameState.status === "gameover" && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-30 backdrop-blur-sm">
            <div className="bg-[#ded895] border-4 border-[#543847] p-6 rounded-lg shadow-2xl text-center transform scale-100 transition-transform">
              <h2 className="text-4xl font-black text-white mb-2" style={{ WebkitTextStroke: "1px #543847" }}>
                GAME OVER
              </h2>
              <div className="bg-[#bdae58] border-2 border-[#543847] rounded p-4 mb-4 text-center">
                <p className="text-[#543847] font-bold uppercase text-sm mb-1">Score</p>
                <p className="text-3xl font-black text-white" style={{ WebkitTextStroke: "1px #543847" }}>
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
    </div>
  );
}
