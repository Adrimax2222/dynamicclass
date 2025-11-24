"use client";

import { useState, useEffect } from "react";
import { Logo } from "@/components/icons";
import { BookOpenCheck, FlaskConical, GraduationCap, PencilRuler } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const loadingMessages = [
  "Preparando tu aula virtual...",
  "Afinando los conceptos...",
  "Organizando tus apuntes...",
  "¿Sabías que aprender algo nuevo crea conexiones neuronales?",
  "La curiosidad es el motor del aprendizaje.",
  "Calculando trayectorias de conocimiento...",
  "Desempolvando los libros...",
  "¡Casi listo para empezar a aprender!",
];

const icons = [
    { icon: BookOpenCheck, position: "top-0 left-1/2 -translate-x-1/2" },
    { icon: GraduationCap, position: "right-0 top-1/2 -translate-y-1/2" },
    { icon: FlaskConical, position: "bottom-0 left-1/2 -translate-x-1/2" },
    { icon: PencilRuler, position: "left-0 top-1/2 -translate-y-1/2" },
];

export default function LoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    // Timer for the cycling messages
    const messageInterval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 2500); // Change message every 2.5 seconds

    // Timer for the progress bar to simulate loading
    const progressTimer = setInterval(() => {
        setProgress(prev => {
            // Stop incrementing just before the end to wait for real load
            if (prev >= 95) {
                clearInterval(progressTimer);
                return 95;
            }
            // Increment slowly
            return prev + 5;
        })
    }, 400); // Slower progress update

    return () => {
        clearInterval(messageInterval)
        clearInterval(progressTimer)
    };
  }, []);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-center p-4">
      <div className="relative mb-8 flex h-40 w-40 items-center justify-center">
        {icons.map((item, index) => {
            const Icon = item.icon;
            return (
                <div
                    key={index}
                    className={cn(
                        "absolute animate-float-icons text-primary/70",
                        item.position
                    )}
                    style={{ animationDelay: `${index * 250}ms`}}
                >
                    <Icon className="h-8 w-8" />
                </div>
            )
        })}
        <Logo className="h-20 w-20 animate-pulse-slow text-primary" />
      </div>

      <div className="relative h-6 w-full max-w-sm overflow-hidden mb-4">
        <div
          className="absolute w-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateY(-${messageIndex * 100}%)` }}
        >
          {loadingMessages.map((msg, index) => (
            <div
              key={index}
              className="flex h-6 w-full items-center justify-center"
            >
              <p className="text-sm text-muted-foreground">{msg}</p>
            </div>
          ))}
        </div>
      </div>
      <Progress value={progress} className="w-full max-w-xs h-2" />
    </div>
  );
}
