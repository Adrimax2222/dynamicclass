
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
    ArrowRight,
    Wand2,
    Target,
    MessageSquare,
    Gift,
    Cat,
    BookOpenCheck,
    FlaskConical,
    PencilRuler,
    Users,
    BrainCircuit,
    ShieldCheck,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const introIcons = [
    { icon: BookOpenCheck, angle: 0 },
    { icon: GraduationCap, angle: 45 },
    { icon: FlaskConical, angle: 90 },
    { icon: PencilRuler, angle: 135 },
    { icon: Calendar, angle: 180 },
    { icon: School, angle: 225 },
    { icon: Sparkles, angle: 270 },
    { icon: Trophy, angle: 315 },
];

const steps = [
     {
        icon: Users,
        title: "Una Estructura Colaborativa",
        description: "Organizamos los roles para una gestión clara y segura, desde el administrador global hasta cada estudiante.",
        content: () => (
             <motion.div 
                className="mt-6 space-y-2"
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
                }}
                initial="hidden"
                animate="visible"
            >
                {[
                    { icon: ShieldCheck, title: "Admin Global", desc: "Supervisa toda la plataforma.", color: "border-blue-500/50 bg-blue-500/10" },
                    { icon: Building, title: "Admin de Centro", desc: "Gestiona un centro educativo y sus clases.", color: "border-purple-500/50 bg-purple-500/10" },
                    { icon: GraduationCap, title: "Admin de Clase", desc: "Modera el chat y el horario de su clase.", color: "border-green-500/50 bg-green-500/10" },
                    { icon: User, title: "Estudiante", desc: "Participa, aprende y compite.", color: "border-gray-500/50 bg-gray-500/10" },
                ].map((item, i) => {
                    const ItemIcon = item.icon;
                    return (
                        <motion.div
                            key={i}
                            className={cn("flex items-center gap-4 p-3 rounded-lg border", item.color)}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 }
                            }}
                        >
                            <ItemIcon className="h-5 w-5 text-foreground"/>
                            <div>
                                <h4 className="font-semibold text-sm">{item.title}</h4>
                                <p className="text-xs text-muted-foreground">{item.desc}</p>
                            </div>
                        </motion.div>
                    )
                })}
            </motion.div>
        )
    },
    {
        icon: BrainCircuit,
        title: "Tu Centro de Operaciones",
        description: "Todas tus herramientas de productividad, centralizadas en el Modo Estudio para que nada te distraiga.",
        content: () => {
            const tools = [
                { icon: Timer, name: 'Pomodoro' },
                { icon: ScanLine, name: 'Escáner' },
                { icon: Calculator, name: 'Calculadora' },
                { icon: Music, name: 'Música' },
                { icon: Target, name: 'Calcula Notas' },
                { icon: Wand2, name: 'Editor Mágico'},
                { icon: MessageSquare, name: 'Chat de Clase' },
                { icon: Sparkles, name: 'ADRIMAX AI' },
            ];
            return (
                <motion.div 
                    className="grid grid-cols-4 gap-2 sm:gap-4 mt-6 text-center"
                    variants={{
                        hidden: {},
                        visible: { transition: { staggerChildren: 0.05 } }
                    }}
                    initial="hidden"
                    animate="visible"
                >
                    {tools.map((tool, i) => (
                        <motion.div
                            key={i}
                            className="flex flex-col items-center justify-center gap-2 p-2 sm:p-3 rounded-lg border bg-muted/50 aspect-square"
                            variants={{
                                hidden: { opacity: 0, scale: 0.5 },
                                visible: { opacity: 1, scale: 1 }
                            }}
                            whileHover={{ scale: 1.1, backgroundColor: 'hsl(var(--muted))' }}
                        >
                            <tool.icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary"/>
                            <span className="text-[10px] sm:text-xs font-semibold">{tool.name}</span>
                        </motion.div>
                    ))}
                </motion.div>
            )
        }
    },
    {
        icon: Sparkles,
        title: "Asistencia Inteligente",
        description: "Nuestra IA integrada te ayuda a entender conceptos, generar resúmenes, crear tarjetas de estudio interactivas, cuestionarios ¡y mucho más!",
        content: () => {
             const aiFeatures = ["Resúmenes", "Flashcards", "Explicaciones", "Esquemas", "Cuestionarios"];
            return (
                <motion.div 
                    className="mt-6 p-6 rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg text-left"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <h4 className="font-bold text-lg">ADRIMAX AI</h4>
                    <p className="opacity-80 mt-1 text-sm">Tu asistente 24/7. Pídele que te explique un tema, que te cree tarjetas de estudio o que te ponga a prueba con un cuestionario.</p>
                    <motion.div 
                        className="flex flex-wrap gap-2 mt-4"
                        variants={{
                            visible: { transition: { staggerChildren: 0.1 } }
                        }}
                        initial="hidden"
                        animate="visible"
                    >
                        {aiFeatures.map(feat => (
                             <motion.span
                                key={feat}
                                className="text-xs font-bold bg-white/20 py-1 px-2 rounded-full"
                                variants={{
                                    hidden: { opacity: 0, y: 10 },
                                    visible: { opacity: 1, y: 0 }
                                }}
                            >
                                {feat}
                            </motion.span>
                        ))}
                    </motion.div>
                </motion.div>
            )
        }
    },
    {
        icon: Vote,
        title: "Interactúa con tu Clase",
        description: "Consulta tu horario, participa en encuestas y mantente siempre al día con el chat de clase y los anuncios importantes.",
        content: () => (
            <motion.div
                className="mt-6 space-y-4"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.2 } }}}
            >
                 <motion.div 
                    className="flex items-center gap-4 p-4 rounded-lg border bg-muted/50"
                    variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                 >
                    <MessageSquare className="h-6 w-6 text-primary"/>
                    <div>
                        <h4 className="font-semibold">Chat de Clase</h4>
                        <p className="text-sm text-muted-foreground">Comunícate en tiempo real con compañeros y profesores.</p>
                    </div>
                 </motion.div>
                  <motion.div 
                    className="flex items-center gap-4 p-4 rounded-lg border bg-muted/50"
                    variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }}
                 >
                    <Building className="h-6 w-6 text-primary"/>
                    <div>
                        <h4 className="font-semibold">Anuncios y Encuestas</h4>
                        <p className="text-sm text-muted-foreground">Mantente al día de las novedades y da tu opinión.</p>
                    </div>
                 </motion.div>
                 <motion.div 
                    className="flex items-center gap-4 p-4 rounded-lg border bg-muted/50"
                    variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                 >
                    <Calendar className="h-6 w-6 text-primary"/>
                    <div>
                        <h4 className="font-semibold">Horario Integrado</h4>
                        <p className="text-sm text-muted-foreground">Consulta tus clases de un vistazo.</p>
                    </div>
                 </motion.div>
            </motion.div>
        )
    },
    {
        icon: Trophy,
        title: "Compite y Gana Recompensas",
        description: "Gana trofeos por tus logros y canjéalos por tarjetas regalo o avatares exclusivos para tu perfil.",
         content: () => (
            <motion.div
                className="grid grid-cols-2 gap-4 mt-6"
                variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={{hidden: {opacity: 0, scale: 0.5}, visible: {opacity: 1, scale: 1}}} className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border bg-amber-400/10 border-amber-400/30">
                    <Trophy className="h-8 w-8 text-amber-500"/>
                    <span className="font-bold text-xl">125</span>
                    <span className="text-xs font-semibold">Trofeos</span>
                </motion.div>
                 <motion.div variants={{hidden: {opacity: 0, scale: 0.5}, visible: {opacity: 1, scale: 1}}} className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border bg-orange-400/10 border-orange-400/30">
                    <Flame className="h-8 w-8 text-orange-500"/>
                    <span className="font-bold text-xl">12 Días</span>
                    <span className="text-xs font-semibold">Racha Actual</span>
                </motion.div>
                 <motion.div variants={{hidden: {opacity: 0, scale: 0.5}, visible: {opacity: 1, scale: 1}}} className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border bg-green-400/10 border-green-400/30">
                    <Gift className="h-8 w-8 text-green-500"/>
                    <span className="font-bold text-base">Tarjetas Regalo</span>
                </motion.div>
                 <motion.div variants={{hidden: {opacity: 0, scale: 0.5}, visible: {opacity: 1, scale: 1}}} className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border bg-purple-400/10 border-purple-400/30">
                    <Cat className="h-8 w-8 text-purple-500"/>
                    <span className="font-bold text-base">Avatares</span>
                </motion.div>
            </motion.div>
        )
    }
];

export function OnboardingTour({ onComplete }: { onComplete: () => void }) {
    const [step, setStep] = useState(0);
    const [isIntro, setIsIntro] = useState(true);
    const [isFinishing, setIsFinishing] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsIntro(false), 4000); 
        return () => clearTimeout(timer);
    }, []);

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            setIsFinishing(true);
            setTimeout(() => {
                setIsExiting(true);
            }, 2000); // Duration of the finishing screen
        }
    };
    
    const isLastStep = step === steps.length - 1;
    const CurrentIcon = steps[step].icon;

    const introScreen = (
         <div className="fixed inset-0 bg-background z-[100] flex flex-col items-center justify-center p-6 overflow-hidden">
            <motion.div
                layoutId="onboarding-logo"
                className="relative h-24 w-24"
            >
                <motion.div
                    className="absolute inset-0"
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.2, 1], rotate: 360 }}
                    transition={{ duration: 2, delay: 0.5, repeat: Infinity, repeatType: "loop", ease: "linear" }}
                >
                    <Logo className="h-24 w-24 text-primary" />
                </motion.div>
                
                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: {
                            transition: { staggerChildren: 0.1, delayChildren: 1.5 }
                        }
                    }}
                    className="absolute inset-0"
                >
                    {introIcons.map((item, i) => {
                        const angleRad = (item.angle * Math.PI) / 180;
                        const radius = 100; // pixels
                        const x = Math.cos(angleRad) * radius;
                        const y = Math.sin(angleRad) * radius;

                        return (
                            <motion.div
                                key={i}
                                className="absolute top-1/2 left-1/2"
                                style={{ x: "-50%", y: "-50%" }}
                                variants={{
                                    hidden: { scale: 0, opacity: 0, x: "-50%", y: "-50%" },
                                    visible: {
                                        x: `calc(-50% + ${x}px)`,
                                        y: `calc(-50% + ${y}px)`,
                                        scale: 1,
                                        opacity: 1,
                                        transition: { type: "spring", stiffness: 300, damping: 15, delay: i * 0.1 }
                                    }
                                }}
                            >
                                <div className="p-2 bg-background rounded-full shadow-lg border">
                                    <item.icon className="h-5 w-5 text-primary" />
                                </div>
                            </motion.div>
                        )
                    })}
                </motion.div>
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3, duration: 0.7 }}
                className="text-2xl font-bold font-headline mt-20 text-center"
            >
                Construyendo tu espacio en
                <br />
                <span className="text-primary">Dynamic Class</span>
            </motion.h1>
        </div>
    );
    
    if (isIntro) return introScreen;
    
    return (
        <motion.div 
            className="fixed inset-0 bg-background z-[100] flex flex-col p-6 overflow-hidden"
            initial={{ opacity: 1, scale: 1 }}
            animate={isExiting ? { opacity: 0, scale: 0.95 } : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            onAnimationComplete={() => {
                if (isExiting) {
                    onComplete();
                }
            }}
        >
             {/* Animated Background Blobs */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-blue-300/50 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 right-0 w-72 h-72 bg-purple-300/50 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-pink-300/50 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

            <AnimatePresence>
                {isFinishing ? (
                     <motion.div
                        key="finishing"
                        className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 bg-background"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <motion.div layoutId="onboarding-logo">
                           <Logo className="h-16 w-16 text-primary" />
                        </motion.div>
                        <h2 className="text-2xl font-bold font-headline mt-6">Configurando tu espacio...</h2>
                        <p className="text-muted-foreground mt-2">Personalizando tu experiencia.</p>
                        <Loader2 className="h-6 w-6 text-primary animate-spin mt-4" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="tour-content"
                        className="relative z-10 flex flex-col flex-1"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <header className="flex items-center justify-between h-10">
                            <motion.div layoutId="onboarding-logo">
                                <Logo className="h-10 w-10 text-primary" />
                            </motion.div>
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
                                    <motion.div 
                                        className="bg-primary/10 p-4 rounded-full w-fit mx-auto mb-6"
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                    >
                                    <CurrentIcon className="h-8 w-8 text-primary" />
                                    </motion.div>
                                    <h2 className="text-2xl font-bold font-headline">{steps[step].title}</h2>
                                    <p className="text-muted-foreground mt-2">{steps[step].description}</p>
                                    
                                    <div className="min-h-[290px] flex items-center justify-center">
                                    {steps[step].content()}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        
                        <footer className="space-y-4">
                            <Progress value={((step + 1) / steps.length) * 100} className="h-2 w-full max-w-xs mx-auto" />

                            <Button onClick={handleNext} className="w-full bg-blue-500 hover:bg-blue-600" size="lg">
                                {isLastStep ? "Comenzar a Explorar" : "Siguiente"}
                                {!isLastStep && <ArrowRight className="h-4 w-4 ml-2"/>}
                            </Button>
                        </footer>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
