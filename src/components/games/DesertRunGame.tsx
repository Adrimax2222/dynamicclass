"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { ViewContainer } from '@/components/layout/view-container';
import { cn } from "@/lib/utils";

// Constantes físicas del motor
const PLAYER_SIZE = 40;
const PLAYER_X = 50;
const GRAVITY = 0.6;
const JUMP_VELOCITY = 12;
const SPAWN_X = 1000;
const BASE_SPEED = 6;

// Tipos
type Obstacle = {
  id: number;
  x: number;
  width: number;
  height: number;
  type: "single" | "double";
};

type Cloud = {
  id: number;
  x: number;
  y: number;
  scale: number;
  opacity: number;
};

type GameState = {
  y: number;
  vy: number;
  obstacles: Obstacle[];
  clouds: Cloud[];
  score: number;
  speed: number;
  nextObstacleIn: number;
  nextCloudIn: number;
  gameOver: boolean;
  isPlaying: boolean;
  hasStarted: boolean;
};

export default function DesertRun({ onBack }: { onBack: () => void }) {
  const [gameState, setGameState] = useState<GameState>({
    y: 0,
    vy: 0,
    obstacles: [],
    clouds: [],
    score: 0,
    speed: BASE_SPEED,
    nextObstacleIn: 60,
    nextCloudIn: 10,
    gameOver: false,
    isPlaying: false,
    hasStarted: false,
  });

  const requestRef = useRef<number>();

  const jump = useCallback(() => {
    setGameState((prev) => {
      if (prev.gameOver) {
        return {
          y: 0,
          vy: 0,
          obstacles: [],
          clouds: [], // Reiniciamos el cielo al perder
          score: 0,
          speed: BASE_SPEED,
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
        return { ...prev, vy: JUMP_VELOCITY };
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

        // 1. Físicas del Robot
        let newVY = prev.vy - GRAVITY;
        let newY = prev.y + newVY;
        if (newY <= 0) {
          newY = 0;
          newVY = 0;
        }

        // 2. Progresión de Dificultad
        const newScore = prev.score + 0.1;
        // La velocidad capea en 12 para que no sea injugable
        const newSpeed = Math.min(12, BASE_SPEED + Math.floor(newScore / 100) * 0.5);

        // 3. Gestión de Nubes (Parallax - más lento que la velocidad base)
        const cloudSpeed = newSpeed * 0.3;
        const newClouds = prev.clouds
          .map((c) => ({ ...c, x: c.x - cloudSpeed }))
          .filter((c) => c.x > -100);

        let nextCloud = prev.nextCloudIn - 1;
        if (nextCloud <= 0) {
          newClouds.push({
            id: Date.now() + Math.random(),
            x: SPAWN_X,
            y: Math.floor(Math.random() * 100) + 20, // Altura aleatoria en el cielo
            scale: 0.5 + Math.random() * 0.8, // Diferentes tamaños
            opacity: 0.4 + Math.random() * 0.5,
          });
          nextCloud = Math.floor(Math.random() * 80) + 40; // Spawns frecuentes
        }

        // 4. Gestión de Obstáculos (Cactus simples y dobles)
        const newObstacles = prev.obstacles
          .map((obs) => ({ ...obs, x: obs.x - newSpeed }))
          .filter((obs) => obs.x + obs.width > -50);

        let nextObs = prev.nextObstacleIn - 1;
        if (nextObs <= 0) {
          const isDouble = Math.random() > 0.7 && newSpeed > 7; // Los dobles salen más adelante
          const type = isDouble ? "double" : "single";
          const width = isDouble ? 50 : 24;
          const height = Math.floor(Math.random() * 20) + 40; // Max 60px alto (saltable garantizado)

          newObstacles.push({
            id: Date.now(),
            x: SPAWN_X,
            width,
            height,
            type,
          });

          // MATEMÁTICAS DE FAIR PLAY (Equidad)
          // Un salto dura aprox 40 frames. Le sumamos 20 frames de margen de aterrizaje.
          const minSafeFrames = 60; 
          const maxRandomGap = Math.max(80, 160 - newSpeed * 5); // El gap baja conforme sube la vel
          nextObs = Math.floor(Math.random() * (maxRandomGap - minSafeFrames)) + minSafeFrames;
        }

        // 5. Colisiones AABB (Ajustadas al nuevo modelo)
        let isGameOver = false;
        const hitboxShrink = 6; // Hace la hitbox ligeramente más pequeña que el div visual (más indulgente)

        for (const obs of newObstacles) {
          if (
            PLAYER_X + hitboxShrink < obs.x + obs.width &&
            PLAYER_X + PLAYER_SIZE - hitboxShrink > obs.x &&
            newY + hitboxShrink < obs.height &&
            newY + PLAYER_SIZE - hitboxShrink > 0
          ) {
            isGameOver = true;
          }
        }

        return {
          ...prev,
          y: newY,
          vy: newVY,
          obstacles: newObstacles,
          clouds: newClouds,
          score: newScore,
          speed: newSpeed,
          nextObstacleIn: nextObs,
          nextCloudIn: nextCloud,
          gameOver: isGameOver,
          isPlaying: !isGameOver,
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
            {/* Marcador Superior estilo Arcade */}
            <div className="w-full flex justify-between px-6 py-2 bg-slate-800 text-white rounded-t-lg font-mono text-xl shadow-md z-10">
                <div className="text-amber-400">HI: 00999</div> {/* Aquí podrías meter tu highscore de Firebase */}
                <div className="tracking-widest flex items-center gap-2">
                <span className="text-slate-400 text-sm">SCORE</span>
                {Math.floor(gameState.score).toString().padStart(5, "0")}
                </div>
            </div>

            {/* Escenario */}
            <div
                className="relative w-full h-72 bg-gradient-to-b from-sky-200 to-sky-50 dark:from-sky-800 dark:to-sky-600 overflow-hidden border-b-[8px] border-[#c2b280] dark:border-amber-800 shadow-xl rounded-b-lg select-none touch-none cursor-pointer"
                onTouchStart={(e) => {
                e.preventDefault();
                jump();
                }}
                onClick={jump}
            >
                {/* Nubes en el fondo */}
                {gameState.clouds.map((cloud) => (
                <div
                    key={cloud.id}
                    className="absolute bg-white rounded-full transition-transform"
                    style={{
                    width: "60px",
                    height: "20px",
                    left: `${'${cloud.x}'}px`,
                    top: `${'${cloud.y}'}px`,
                    transform: `scale(${'${cloud.scale}'})`,
                    opacity: cloud.opacity,
                    }}
                >
                    {/* Volumen superior de la nube */}
                    <div className="absolute -top-3 left-3 w-8 h-8 bg-white rounded-full" />
                    <div className="absolute -top-2 left-8 w-6 h-6 bg-white rounded-full" />
                </div>
                ))}

                {/* B.O.B el Robot (Jugador) */}
                <div
                className="absolute z-20 transition-transform"
                style={{
                    width: `${'${PLAYER_SIZE}'}px`,
                    height: `${'${PLAYER_SIZE}'}px`,
                    left: `${'${PLAYER_X}'}px`,
                    bottom: `${'${gameState.y}'}px`,
                }}
                >
                {/* Cuerpo naranja */}
                <div className="absolute inset-0 bg-orange-500 rounded-lg shadow-sm">
                    {/* Visor del ojo */}
                    <div className="absolute top-2 right-1 w-5 h-4 bg-slate-900 rounded-sm flex items-center justify-end p-0.5">
                    <div className={cn("w-2 h-2 rounded-full", gameState.gameOver ? 'bg-red-500' : 'bg-cyan-400 animate-pulse')} />
                    </div>
                    {/* Rueda/Oruga base */}
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-3 bg-slate-800 rounded-full border-2 border-slate-600 flex items-center justify-between px-1">
                    <div className="w-1 h-1 bg-slate-400 rounded-full" />
                    <div className="w-1 h-1 bg-slate-400 rounded-full" />
                    </div>
                </div>
                </div>

                {/* Obstáculos (Cactus Detallados) */}
                {gameState.obstacles.map((obs) => (
                <div
                    key={obs.id}
                    className="absolute z-10 flex items-end justify-center gap-2"
                    style={{
                    width: `${'${obs.width}'}px`,
                    height: `${'${obs.height}'}px`,
                    left: `${'${obs.x}'}px`,
                    bottom: "0px",
                    }}
                >
                    {/* Cactus Simple */}
                    {obs.type === "single" && (
                    <div className="relative w-6 h-full bg-emerald-600 border-2 border-emerald-800 rounded-t-lg">
                        <div className="absolute bottom-4 -left-3 w-4 h-6 border-b-2 border-l-2 border-emerald-800 rounded-bl-lg" />
                        <div className="absolute bottom-6 -right-3 w-4 h-8 border-b-2 border-r-2 border-emerald-800 rounded-br-lg" />
                    </div>
                    )}
                    
                    {/* Cactus Doble */}
                    {obs.type === "double" && (
                    <>
                        <div className="relative w-6 h-full bg-emerald-600 border-2 border-emerald-800 rounded-t-lg" />
                        <div className="relative w-6 bg-emerald-700 border-2 border-emerald-900 rounded-t-lg" style={{ height: '80%' }} />
                    </>
                    )}
                </div>
                ))}

                {/* Pantalla de Inicio */}
                {!gameState.hasStarted && !gameState.gameOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-sm z-30">
                    <div className="bg-slate-800 text-white px-8 py-4 rounded-xl shadow-2xl text-center animate-bounce">
                    <h1 className="text-2xl font-black mb-2 text-amber-400">DESERT RUN</h1>
                    <p className="font-mono text-sm">ESPACIO / CLICK para saltar</p>
                    </div>
                </div>
                )}

                {/* Pantalla de Muerte */}
                {gameState.gameOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-30">
                    <div className="bg-white px-10 py-6 rounded-2xl shadow-2xl text-center transform scale-100 transition-all">
                    <h2 className="text-5xl font-black text-red-600 mb-2">CRASH!</h2>
                    <p className="text-slate-600 font-mono mb-6">Score: {Math.floor(gameState.score)}</p>
                    <button 
                        onClick={jump}
                        className="bg-orange-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-orange-600 hover:scale-105 active:scale-95 transition-all"
                    >
                        REINTENTAR
                    </button>
                    </div>
                </div>
                )}
            </div>
            
            <p className="mt-4 text-xs font-mono text-slate-400">
                Engine: React Frame Loop | Render: DOM CSS | FPS: VSync
            </p>
        </div>
    </ViewContainer>
  );
};
