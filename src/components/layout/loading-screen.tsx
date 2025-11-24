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
  const [currentMessage, setCurrentMessage] = useState(loadingMessages[0]);
  const [isFading, setIsFading] = useState(false);

  // Effect for cycling messages
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
        setIsFading(false);
      }, 500); // Half a second for fade-out
    }, 2500); // Change message every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setCurrentMessage(loadingMessages[messageIndex]);
  }, [messageIndex]);


  // Effect for the progress bar
  useEffect(() => {
    const progressTimer = setInterval(() => {
        setProgress(prev => {
            if (prev >= 95) {
                clearInterval(progressTimer);
                return 95;
            }
            return prev + 5;
        })
    }, 600); 

    return () => clearInterval(progressTimer);
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
                        "absolute animate-float-icons text-primary",
                        item.position
                    )}
                    style={{ animationDelay: `${index * 250}ms`}}
                >
                    <Icon className="h-8 w-8" />
                </div>
            )
        })}
        <Logo className="h-20 w-20 animate-float-logo text-primary" />
      </div>

      <div className="h-12 w-full max-w-sm mb-4 flex items-center justify-center">
        <p className={cn("text-sm text-muted-foreground transition-opacity duration-500", isFading ? 'opacity-0' : 'opacity-100')}>
            {currentMessage}
        </p>
      </div>
      <Progress value={progress} className="w-full max-w-xs h-2" />
    </div>
  );
}
