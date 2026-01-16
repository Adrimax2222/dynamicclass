"use client";

import { useState, useEffect } from "react";
import { Logo } from "@/components/icons";
import { BookOpenCheck, FlaskConical, GraduationCap, PencilRuler } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

const loadingMessages = [
  // App specific
  "¿Sabías que la idea de Dynamic Class salió en 2022?",
  "¿Sabías que existieron 3 versiones de Dynamic Class antes que esta?",
  "Estas leyendo esto :)",
  "¿Sabías que esta app ha sido desarrollada por 2 estudiantes?",
  "Preparando tu aula virtual...",
  "Afinando los conceptos...",
  "Calculando trayectorias de conocimiento...",

  // Science & Nature
  "¿Sabías que el corazón de un colibrí late más de 1.200 veces por minuto?",
  "El ADN humano es idéntico al de un plátano en un 50%.",
  "En Júpiter y Saturno, la presión es tan fuerte que literalmente llueven diamantes.",
  "Un rayo es cinco veces más caliente que la superficie del Sol.",

  // History & Curiosities
  "Las primeras almohadas en la antigua Mesopotamia eran de piedra.",
  "El antiguo Egipto usaba moho de pan para tratar infecciones, ¡miles de años antes de la penicilina!",
  "Las pirámides de Egipto eran originalmente de color blanco brillante.",
  "El primer correo electrónico de la historia se envió en 1971.",

  // Psychology & Learning
  "Tu cerebro genera suficiente electricidad para encender una bombilla LED.",
  "Aprender un nuevo idioma puede hacer que tu cerebro crezca físicamente.",
  "Escribir a mano te ayuda a recordar mejor las cosas que escribir en teclado.",
  "El cerebro procesa las imágenes 60.000 veces más rápido que el texto.",

  // Random Facts
  "Las abejas pueden reconocer rostros humanos.",
  "Es físicamente imposible para los cerdos mirar al cielo.",
  "El nombre oficial de la forma de una patata Pringles es paraboloide hiperbólico.",
  "Un pulpo tiene tres corazones y su sangre es de color azul.",
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

  // Effect for cycling messages randomly
  useEffect(() => {
    // Set an initial random message
    setMessageIndex(Math.floor(Math.random() * loadingMessages.length));

    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setMessageIndex((prevIndex) => {
          let newIndex;
          do {
            newIndex = Math.floor(Math.random() * loadingMessages.length);
          } while (newIndex === prevIndex); // Ensure the new message is different
          return newIndex;
        });
        setIsFading(false);
      }, 500); // Half a second for fade-out
    }, 3500); // Change message every 3.5 seconds to give enough reading time

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
    <div className="relative flex h-screen w-full flex-col items-center justify-center bg-background text-center p-4">
      <div className="relative mb-8 flex h-48 w-48 items-center justify-center">
        {icons.map((item, index) => {
            const Icon = item.icon;
            return (
                <div
                    key={index}
                    className={cn(
                        "absolute animate-float-icons text-primary",
                        item.position
                    )}
                    style={{ animationDelay: `${index * 500}ms`}}
                >
                    <Icon className="h-8 w-8" />
                </div>
            )
        })}
        <div className="animate-float-logo" style={{ animationDelay: '1000ms' }}>
            <Logo className="h-20 w-20 text-primary" />
        </div>
      </div>

      <div className="h-12 w-full max-w-sm mb-4 flex items-center justify-center">
        <p className={cn("text-sm text-muted-foreground transition-opacity duration-500", isFading ? 'opacity-0' : 'opacity-100')}>
            {currentMessage}
        </p>
      </div>
      <Progress value={progress} className="w-full max-w-xs h-2" />
      
      <div className="absolute bottom-6 text-center text-sm text-muted-foreground">
        <Link href="https://proyectoadrimax.framer.website/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
            Impulsado por <span className="font-semibold">Proyecto Adrimax</span>
        </Link>
      </div>
    </div>
  );
}
