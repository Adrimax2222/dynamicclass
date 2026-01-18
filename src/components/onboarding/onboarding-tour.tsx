
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Logo
} from '@/components/icons';
import { 
    Button
} from '@/components/ui/button';
import { 
    School, 
    PlusCircle, 
    User, 
    Calendar, 
    ScanLine, 
    Calculator, 
    Music, 
    Timer, 
    Sparkles, 
    GraduationCap, 
    Trophy, 
    Flame, 
    Vote, 
    Building,
    ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '../ui/progress';

const steps = [
    {
        icon: School,
        title: "Elige tu camino",
        description: "Dynamic Class se adapta a ti. Únete a un centro existente con un código, crea uno nuevo para tu clase, o úsalo de forma personal.",
        content: () => (
            <div className="grid grid-cols-1 gap-4 mt-6">
                <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/50">
                    <School className="h-6 w-6 text-primary"/>
                    <div>
                        <h4 className="font-semibold">Unirse a un Centro</h4>
                        <p className="text-sm text-muted-foreground">Usa un código para conectar con tu clase.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/50">
                    <PlusCircle className="h-6 w-6 text-primary"/>
                    <div>
                        <h4 className="font-semibold">Crear un Centro</h4>
                        <p className="text-sm text-muted-foreground">Administra tu propia clase y comparte.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/50">
                    <User className="h-6 w-6 text-primary"/>
                    <div>
                        <h4 className="font-semibold">Uso Personal</h4>
                        <p className="text-sm text-muted-foreground">Organiza tus estudios de forma individual.</p>
                    </div>
                </div>
            </div>
        )
    },
    {
        icon: GraduationCap,
        title: "Tu Centro de Operaciones",
        description: "Todas tus herramientas de productividad, centralizadas en el Modo Estudio para que nada te distraiga.",
        content: () => {
            const tools = [
                { icon: Calendar, name: 'Calendario' },
                { icon: ScanLine, name: 'Escáner' },
                { icon: Calculator, name: 'Calculadora' },
                { icon: Music, name: 'Música' },
                { icon: Timer, name: 'Pomodoro' },
                { icon: Sparkles, name: 'IA' },
            ];
            return (
                <div className="grid grid-cols-3 gap-4 mt-6 text-center">
                    {tools.map((tool, i) => (
                        <div key={i} className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border bg-muted/50">
                            <tool.icon className="h-7 w-7 text-primary"/>
                            <span className="text-xs font-semibold">{tool.name}</span>
                        </div>
                    ))}
                </div>
            )
        }
    },
    {
        icon: Sparkles,
        title: "Asistencia Inteligente",
        description: "Nuestra IA integrada te ayuda a entender conceptos, generar resúmenes de tus apuntes y prepararte para los exámenes.",
        content: () => (
            <div className="mt-6 p-6 rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg">
                <h4 className="font-bold text-lg">ADRIMAX AI</h4>
                <p className="opacity-80 mt-1">Tu asistente personal 24/7. Pregúntale cualquier cosa, desde resolver ecuaciones hasta obtener explicaciones detalladas sobre temas complejos.</p>
            </div>
        )
    },
    {
        icon: Vote,
        title: "Interactúa con tu Clase",
        description: "Mantente siempre informado con anuncios importantes y participa en encuestas en tiempo real para tomar decisiones en grupo.",
        content: () => (
            <div className="mt-6 border rounded-lg p-4 space-y-4 bg-muted/50">
                 <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary"/>
                    <h4 className="font-semibold">Anuncio del Centro</h4>
                 </div>
                 <p className="text-sm">"Recordad que la fecha límite para la entrega del proyecto de Biología es este viernes."</p>
                 <div className="pt-2">
                     <h4 className="font-semibold text-sm mb-2">Encuesta: ¿Próxima tutoría?</h4>
                     <div className="space-y-2">
                         <div className="flex items-center justify-between text-sm p-2 rounded-md bg-background"><span>Repaso General</span> <span>68%</span></div>
                         <div className="flex items-center justify-between text-sm p-2 rounded-md bg-background"><span>Dudas Individuales</span> <span>32%</span></div>
                     </div>
                 </div>
            </div>
        )
    },
    {
        icon: Trophy,
        title: "Compite y Gana",
        description: "Gana trofeos completando tareas y exámenes. Mantén tu racha de estudio diaria para escalar en el ranking de tu centro.",
         content: () => (
            <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border bg-amber-400/10 border-amber-400/30">
                    <Trophy className="h-8 w-8 text-amber-500"/>
                    <span className="font-bold text-xl">125</span>
                    <span className="text-xs font-semibold">Trofeos</span>
                </div>
                 <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border bg-orange-400/10 border-orange-400/30">
                    <Flame className="h-8 w-8 text-orange-500"/>
                    <span className="font-bold text-xl">12 Días</span>
                    <span className="text-xs font-semibold">Racha Actual</span>
                </div>
            </div>
        )
    }
];

export function OnboardingTour({ onComplete }: { onComplete: () => void }) {
    const [step, setStep] = useState(0);
    const [isIntro, setIsIntro] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsIntro(false), 2000); 
        return () => clearTimeout(timer);
    }, []);

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            onComplete();
        }
    };
    
    const isLastStep = step === steps.length - 1;

    if (isIntro) {
        return (
             <div className="fixed inset-0 bg-background z-[100] flex flex-col items-center justify-center p-6">
                <motion.div layoutId="onboarding-logo">
                    <Logo className="h-24 w-24 text-primary" />
                </motion.div>
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="text-2xl font-bold font-headline mt-6"
                >
                    Introducing Dynamic Class
                </motion.h1>
            </div>
        )
    }

    const CurrentIcon = steps[step].icon;

    return (
        <div className="fixed inset-0 bg-background z-[100] flex flex-col p-6">
            <header className="flex items-center justify-between">
                <motion.div layoutId="onboarding-logo">
                    <Logo className="h-10 w-10 text-primary" />
                </motion.div>
                <Button variant="ghost" onClick={onComplete}>Saltar</Button>
            </header>

            <div className="flex-1 flex flex-col justify-center text-center">
                 <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="w-full max-w-sm mx-auto"
                    >
                        <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto mb-6">
                           <CurrentIcon className="h-8 w-8 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold font-headline">{steps[step].title}</h2>
                        <p className="text-muted-foreground mt-2">{steps[step].description}</p>
                        
                        <div className="min-h-[200px] flex items-center justify-center">
                           {steps[step].content()}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
            
            <footer className="space-y-4">
                 <div className="flex justify-center gap-2">
                    {steps.map((_, i) => (
                        <div 
                            key={i} 
                            className={cn("h-2 w-2 rounded-full bg-muted transition-all", i === step && "bg-primary w-6")}
                        />
                    ))}
                </div>
                <Button onClick={handleNext} className="w-full bg-blue-500 hover:bg-blue-600" size="lg">
                    {isLastStep ? "Comenzar a Explorar" : "Siguiente"}
                    {!isLastStep && <ArrowRight className="h-4 w-4 ml-2"/>}
                </Button>
            </footer>
        </div>
    );
}
