
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BrainCircuit, ChevronLeft, Loader2, RotateCcw, Check, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// Mock data for UI development
const mockFlashcards = [
  { id: 1, question: '¿Cuál es la capital de Francia?', answer: 'París' },
  { id: 2, question: '¿Qué es la fotosíntesis?', answer: 'El proceso mediante el cual las plantas convierten la luz solar en energía.' },
  { id: 3, question: 'Define la segunda ley de Newton.', answer: 'Fuerza es igual a masa por aceleración (F=ma).' },
  { id: 4, question: '¿En qué año llegó el hombre a la luna?', answer: '1969' },
  { id: 5, question: '¿Quién escribió "Cien años de soledad"?', answer: 'Gabriel García Márquez' },
];

type FlashcardResult = 'correct' | 'incorrect';

export default function FlashcardsPage() {
  const router = useRouter();
  const params = useParams();
  const { chatId } = params;

  const [isLoading, setIsLoading] = useState(true);
  const [flashcards, setFlashcards] = useState(mockFlashcards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState<Record<number, FlashcardResult>>({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    // Simulate loading AI-generated content
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleAnswer = (result: FlashcardResult) => {
    setResults(prev => ({ ...prev, [flashcards[currentIndex].id]: result }));
    if (currentIndex < flashcards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex(currentIndex + 1);
    } else {
      // Last card answered, show results
      setShowResults(true);
    }
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
        setIsFlipped(false);
        setCurrentIndex(currentIndex + 1);
    }
  }

  const handlePrev = () => {
      if (currentIndex > 0) {
          setIsFlipped(false);
          setCurrentIndex(currentIndex - 1);
      }
  }

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setResults({});
    setShowResults(false);
  };
  
  const correctAnswers = Object.values(results).filter(r => r === 'correct').length;
  const incorrectAnswers = Object.values(results).filter(r => r === 'incorrect').length;
  const score = flashcards.length > 0 ? (correctAnswers / flashcards.length) * 100 : 0;
  const progress = flashcards.length > 0 ? ((currentIndex + 1) / flashcards.length) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="relative mb-4">
            <BrainCircuit className="h-16 w-16 text-primary animate-pulse" />
            <Loader2 className="h-8 w-8 text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
        </div>
        <h2 className="text-xl font-bold">Generando tarjetas de estudio...</h2>
        <p className="text-muted-foreground">La IA está analizando tu chat para crear contenido relevante.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-muted/30">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft />
        </Button>
        <div className="text-center">
            <h1 className="text-lg font-bold">Tarjetas Didácticas</h1>
            <p className="text-xs text-muted-foreground">Basado en tu chat</p>
        </div>
        <Button variant="ghost" size="icon" onClick={handleRestart}>
          <RotateCcw />
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {showResults ? (
          <Card className="w-full max-w-sm p-6 text-center shadow-xl">
             <CardContent className="p-0">
                <h2 className="text-2xl font-bold mb-2">¡Completado!</h2>
                <p className="text-muted-foreground mb-4">Este es tu resultado:</p>
                 <div className="relative w-40 h-40 mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path
                        className="stroke-current text-muted/20"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        strokeWidth="3"
                        />
                        <path
                        className="stroke-current text-primary"
                        strokeDasharray={`${score}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        strokeWidth="3"
                        strokeLinecap="round"
                        />
                    </svg>
                    <p className="absolute text-4xl font-bold">{score.toFixed(0)}<span className="text-xl">%</span></p>
                 </div>
                 <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-green-500/10 rounded-lg">
                        <p className="font-bold text-green-600">{correctAnswers}</p>
                        <p className="text-xs text-muted-foreground">Correctas</p>
                    </div>
                     <div className="p-3 bg-red-500/10 rounded-lg">
                        <p className="font-bold text-red-600">{incorrectAnswers}</p>
                        <p className="text-xs text-muted-foreground">Incorrectas</p>
                    </div>
                 </div>
                 <Button onClick={handleRestart} className="w-full mt-6">Volver a Intentar</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="w-full max-w-sm flex flex-col items-center">
             <div className="w-full mb-4 flex items-center gap-2">
                <Progress value={progress} />
                <Badge variant="outline" className="whitespace-nowrap">{currentIndex + 1} / {flashcards.length}</Badge>
            </div>
            
            <div 
                className="relative w-full h-80 rounded-xl shadow-lg cursor-pointer transition-transform duration-500"
                onClick={handleFlip}
                style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
            >
              {/* Front Side */}
              <div className="absolute w-full h-full bg-card p-6 flex flex-col justify-center items-center text-center rounded-xl" style={{ backfaceVisibility: 'hidden' }}>
                <p className="text-xs text-muted-foreground mb-2">PREGUNTA</p>
                <p className="text-xl font-semibold">{flashcards[currentIndex].question}</p>
              </div>

              {/* Back Side */}
              <div className="absolute w-full h-full bg-primary text-primary-foreground p-6 flex flex-col justify-center items-center text-center rounded-xl" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <p className="text-xs text-primary-foreground/70 mb-2">RESPUESTA</p>
                <p className="text-xl font-semibold">{flashcards[currentIndex].answer}</p>
              </div>
            </div>

            <div className="w-full mt-6 flex justify-between items-center">
                 <Button variant="outline" size="icon" onClick={handlePrev} disabled={currentIndex === 0}>
                    <ArrowLeft className="h-5 w-5" />
                 </Button>
                 <div className="flex gap-4">
                    <Button variant="destructive" size="lg" onClick={() => handleAnswer('incorrect')}>
                        <X className="mr-2 h-5 w-5"/> Repasar
                    </Button>
                    <Button variant="default" size="lg" className="bg-green-500 hover:bg-green-600" onClick={() => handleAnswer('correct')}>
                       <Check className="mr-2 h-5 w-5"/> Lo sabía
                    </Button>
                </div>
                 <Button variant="outline" size="icon" onClick={handleNext} disabled={currentIndex === flashcards.length - 1}>
                    <ArrowRight className="h-5 w-5" />
                 </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
