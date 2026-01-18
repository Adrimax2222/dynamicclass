'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
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
    MailCheck,
    Sun,
    Moon
} from 'lucide-react';
import { 
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/lib/hooks/use-app';
import type { Theme } from '@/context/app-provider';

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

const ExplanationSheet = ({ trigger, title, description, icon: Icon }: { trigger: React.ReactNode, title: string, description: string, icon?: React.ElementType }) => (
    <Sheet>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent>
            <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                    {Icon && <Icon className="h-5 w-5" />}
                    {title}
                </SheetTitle>
                <SheetDescription>{description}</SheetDescription>
            </SheetHeader>
        </SheetContent>
    </Sheet>
);

const steps = [
    {
        icon: School,
        title: "Elige tu Camino",
        description: "Dynamic Class se adapta a ti. Pulsa en cada opción para saber más.",
        content: () => (
            <motion.div 
                className="mt-6 space-y-3"
                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                initial="hidden"
                animate="visible"
            >
                {[
                    { icon: School, title: "Unirse a un Centro", desc: "Usa un código para acceder a tu clase.", explanation: "Si tu centro educativo ya usa Dynamic Class, solo necesitas un código de 6 dígitos para unirte. Al hacerlo, tu horario, calendario de exámenes y anuncios se sincronizarán automáticamente." },
                    { icon: PlusCircle, title: "Crear un Centro", desc: "Si tu centro no existe, créalo y compártelo.", explanation: "Conviértete en administrador de tu propio centro. Podrás crear clases, gestionar miembros y configurar todo el contenido para tus compañeros. Ideal para delegados o profesores." },
                    { icon: User, title: "Uso Personal", desc: "Utiliza la app de forma individual.", explanation: "Perfecto si quieres usar las herramientas de estudio como el Pomodoro, el escáner, la IA y las notas sin estar conectado a un centro. Siempre podrás unirte a uno más tarde." },
                ].map((item, i) => {
                    const ItemIcon = item.icon;
                    return (
                        <ExplanationSheet 
                            key={i}
                            title={item.title}
                            description={item.explanation}
                            icon={ItemIcon}
                            trigger={
                                <motion.button
                                    type="button"
                                    className="w-full flex items-center text-left gap-4 p-4 rounded-lg border bg-background/50 backdrop-blur-sm cursor-pointer hover:bg-muted/50"
                                    variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                                >
                                    <ItemIcon className="h-6 w-6 text-primary flex-shrink-0"/>
                                    <div>
                                        <h4 className="font-semibold text-sm">{item.title}</h4>
                                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                                    </div>
                                </motion.button>
                            }
                        />
                    )
                })}
            </motion.div>
        )
    },
    {
        icon: Users,
        title: "Una Estructura Colaborativa",
        description: "Organizamos los roles para una gestión clara y segura. Pulsa para saber qué hace cada uno.",
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
                    { icon: ShieldCheck, title: "Admin Global", desc: "Supervisa toda la plataforma.", explanation: "Tiene control total para crear y gestionar centros, usuarios y roles. Es el nivel más alto de administración, reservado para el equipo de Dynamic Class." },
                    { icon: Building, title: "Admin de Centro", desc: "Gestiona un centro educativo y sus clases.", explanation: "Puede añadir clases, gestionar miembros y configurar los calendarios y horarios de su centro específico. Un rol ideal para el director o jefe de estudios." },
                    { icon: GraduationCap, title: "Admin de Clase", desc: "Modera el chat y el horario de su clase.", explanation: "Un rol de delegado o profesor que puede fijar mensajes, gestionar miembros y editar el horario de su propia clase. Facilita la autogestión de cada grupo." },
                    { icon: User, title: "Estudiante", desc: "Participa, aprende y compite.", explanation: "El rol principal. Accede a todas las herramientas de estudio, participa en su clase y compite en los rankings para ganar recompensas." },
                ].map((item, i) => {
                    const ItemIcon = item.icon;
                    return (
                       <ExplanationSheet
                            key={i}
                            title={item.title}
                            description={item.explanation}
                            icon={ItemIcon}
                            trigger={
                                <motion.button
                                    type="button"
                                    className="w-full flex items-center text-left gap-4 p-3 rounded-lg border bg-background/50 backdrop-blur-sm cursor-pointer hover:bg-muted/50"
                                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                                >
                                    <ItemIcon className="h-5 w-5 text-primary"/>
                                    <div>
                                        <h4 className="font-semibold text-sm">{item.title}</h4>
                                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                                    </div>
                                </motion.button>
                            }
                       />
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
                { icon: Timer, name: 'Pomodoro', explanation: "Utiliza la técnica Pomodoro para mantener la concentración en bloques de estudio (ej. 25 min) seguidos de descansos cortos." },
                { icon: ScanLine, name: 'Escáner', explanation: "Digitaliza tus apuntes en papel. Haz una foto, mejora la imagen y guárdala como PDF en tu dispositivo." },
                { icon: Calculator, name: 'Calculadora', explanation: "Una calculadora científica siempre a mano para resolver problemas complejos sin salir de la app." },
                { icon: Music, name: 'Música', explanation: "Conéctate a Spotify y controla tu música de estudio favorita directamente desde el Modo Estudio." },
                { icon: Target, name: 'Calcula Notas', explanation: "Introduce tus notas y sus porcentajes para calcular qué necesitas sacar en el próximo examen para aprobar." },
                { icon: Wand2, name: 'Editor Mágico', explanation: "Potencia tus apuntes con IA. Pídele que resuma, traduzca, corrija la ortografía o incluso continúe tus textos." },
            ];
            return (
                <motion.div 
                    className="grid grid-cols-3 gap-2 sm:gap-4 mt-6 text-center"
                    variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                    initial="hidden"
                    animate="visible"
                >
                    {tools.map((tool, i) => (
                        <ExplanationSheet
                            key={i}
                            title={tool.name}
                            description={tool.explanation}
                            icon={tool.icon}
                            trigger={
                                <motion.button
                                    type="button"
                                    className="flex flex-col items-center justify-center gap-2 p-2 sm:p-3 rounded-lg border bg-background/50 backdrop-blur-sm cursor-pointer aspect-square"
                                    variants={{ hidden: { opacity: 0, scale: 0.5 }, visible: { opacity: 1, scale: 1 } }}
                                    whileHover={{ scale: 1.1, backgroundColor: 'hsl(var(--muted))' }}
                                >
                                    <tool.icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary"/>
                                    <span className="text-[10px] sm:text-xs font-semibold leading-tight">{tool.name}</span>
                                </motion.button>
                            }
                        />
                    ))}
                </motion.div>
            )
        }
    },
    {
        icon: Sparkles,
        title: "Asistencia Inteligente",
        description: "Nuestra IA te ayuda a entender conceptos, generar resúmenes y crear tarjetas de estudio interactivas.",
        content: () => {
             const aiFeatures = ["Resúmenes", "Flashcards", "Explicaciones", "Esquemas", "Cuestionarios"];
            return (
                <ExplanationSheet
                    title="ADRIMAX AI"
                    description="ADRIMAX AI es un asistente educativo avanzado integrado en la app. Puedes chatear con él para pedirle que te explique conceptos difíciles, te haga un resumen de un texto largo, genere tarjetas de estudio interactivas para repasar, o incluso cree cuestionarios para que pongas a prueba tus conocimientos. ¡Es como tener un tutor personal en tu bolsillo!"
                    icon={Sparkles}
                    trigger={
                        <motion.button
                            type="button"
                            className="w-full mt-6 p-6 rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg text-left cursor-pointer"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            whileHover={{ scale: 1.05 }}
                        >
                            <h4 className="font-bold text-lg">ADRIMAX AI</h4>
                            <p className="opacity-80 mt-1 text-sm">Tu asistente 24/7. Pídele que te explique un tema, te cree tarjetas de estudio o que te ponga a prueba con un cuestionario.</p>
                            <motion.div 
                                className="flex flex-wrap gap-2 mt-4"
                                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                                initial="hidden"
                                animate="visible"
                            >
                                {aiFeatures.map(feat => (
                                     <motion.span
                                        key={feat}
                                        className="text-xs font-bold bg-white/20 py-1 px-2 rounded-full"
                                        variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                                    >
                                        {feat}
                                    </motion.span>
                                ))}
                            </motion.div>
                        </motion.button>
                    }
                />
            )
        }
    },
    {
        icon: Vote,
        title: "Interactúa con tu Clase",
        description: "Consulta tu horario, participa en encuestas y mantente siempre al día con el chat de clase y los anuncios.",
        content: () => (
            <motion.div
                className="mt-6 space-y-4"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.2 } }}}
            >
                {[
                    { icon: MessageSquare, title: "Chat de Clase", explanation: "Un espacio de chat en tiempo real, similar a WhatsApp, pero exclusivo para los miembros de tu clase. Ideal para resolver dudas rápidas, organizar trabajos en grupo o compartir información importante." },
                    { icon: Building, title: "Anuncios y Encuestas", explanation: "Mantente al día con los comunicados de tus profesores o administradores. Puedes ver anuncios importantes y participar en encuestas para dar tu opinión sobre temas de clase." },
                    { icon: Calendar, title: "Horario Integrado", explanation: "Consulta tus clases de un vistazo. Si tu administrador lo ha configurado, verás qué asignatura tienes, a qué hora, con qué profesor y en qué aula." },
                ].map((item, index) => {
                    const ItemIcon = item.icon;
                    return(
                        <ExplanationSheet
                            key={index}
                            title={item.title}
                            description={item.explanation}
                            icon={ItemIcon}
                            trigger={
                                <motion.button 
                                    type="button"
                                    className="w-full flex items-center gap-4 p-4 rounded-lg border bg-background/50 backdrop-blur-sm text-left cursor-pointer hover:bg-muted/50"
                                    variants={{ hidden: { opacity: 0, x: index % 2 === 0 ? -20 : 20 }, visible: { opacity: 1, x: 0 } }}
                                >
                                    <ItemIcon className="h-6 w-6 text-primary flex-shrink-0"/>
                                    <div>
                                        <h4 className="font-semibold">{item.title}</h4>
                                    </div>
                                </motion.button>
                            }
                        />
                    );
                })}
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
                {[
                    { icon: Trophy, title: "Trofeos", value: "125", explanation: "Gana trofeos al completar tareas y exámenes. ¡Acumúlalos para subir en el ranking y canjearlos por premios!"},
                    { icon: Flame, title: "Racha Actual", value: "12 Días", explanation: "Mantén tu racha de estudio diaria utilizando el Modo Estudio. ¡Compite con tus compañeros para ver quién tiene la racha más larga!"},
                    { icon: Gift, title: "Tarjetas Regalo", value: "", explanation: "Canjea los trofeos que tanto te ha costado ganar por tarjetas regalo de tus tiendas favoritas como Amazon, GAME, y más."},
                    { icon: Cat, title: "Avatares", value: "", explanation: "Usa tus trofeos para desbloquear iconos y avatares exclusivos para personalizar tu foto de perfil y destacar en la comunidad."},
                ].map((item, index) => {
                    const ItemIcon = item.icon;
                    return (
                        <ExplanationSheet
                            key={index}
                            title={item.title}
                            description={item.explanation}
                            icon={ItemIcon}
                            trigger={
                                <motion.button
                                    type="button"
                                    variants={{hidden: {opacity: 0, scale: 0.5}, visible: {opacity: 1, scale: 1}}}
                                    className="w-full flex flex-col items-center justify-center gap-2 p-4 rounded-lg border bg-amber-400/10 border-amber-400/30 cursor-pointer"
                                >
                                    <ItemIcon className="h-8 w-8 text-amber-500"/>
                                    <span className="font-bold text-sm text-center">{item.title}</span>
                                    {item.value && <span className="font-bold text-xl">{item.value}</span>}
                                </motion.button>
                            }
                        />
                    );
                })}
            </motion.div>
        )
    },
    {
        icon: MailCheck,
        title: "Notificaciones Inteligentes",
        description: "Recibe resúmenes semanales y mantente al día sin esfuerzo. Personaliza tu experiencia visual desde el principio.",
        content: ({ theme, setTheme }: { theme?: Theme; setTheme?: (theme: Theme) => void; }) => {
            const Icon = theme === 'dark' ? Moon : Sun;
            return (
                 <motion.div
                    className="mt-6 space-y-4"
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.2 } }}}
                >
                    <ExplanationSheet
                        title="Resúmenes Semanales"
                        description="Si lo activas, cada viernes recibirás en tu correo un resumen de tu rendimiento, tareas completadas y los próximos eventos de tu calendario. ¡Una forma perfecta de planificar tu semana!"
                        icon={MailCheck}
                        trigger={
                             <motion.button 
                                type="button"
                                className="w-full flex items-center gap-4 p-4 rounded-lg border bg-background/50 backdrop-blur-sm text-left cursor-pointer hover:bg-muted/50"
                                variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                             >
                                <MailCheck className="h-6 w-6 text-primary flex-shrink-0"/>
                                <div>
                                    <h4 className="font-semibold">Resúmenes Semanales</h4>
                                    <p className="text-sm text-muted-foreground">Recibe cada viernes un informe de tu progreso.</p>
                                </div>
                             </motion.button>
                        }
                    />
                     <ExplanationSheet
                        title="Pre-configurar Tema"
                        description="Elige tu tema preferido, claro u oscuro. Puedes cambiarlo en cualquier momento desde los ajustes de la aplicación."
                        icon={Icon}
                        trigger={
                            <motion.button 
                                type="button"
                                className="w-full flex items-center gap-4 p-4 rounded-lg border bg-background/50 backdrop-blur-sm text-left cursor-pointer hover:bg-muted/50"
                                variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }}
                                onClick={() => setTheme && setTheme(theme === 'dark' ? 'light' : 'dark')}
                            >
                                <Icon className="h-6 w-6 text-primary flex-shrink-0"/>
                                <div>
                                    <h4 className="font-semibold">Pre-configurar Tema</h4>
                                    <p className="text-sm text-muted-foreground">Prueba el Modo Oscuro y elige tu vista preferida.</p>
                                </div>
                            </motion.button>
                        }
                    />
                </motion.div>
            )
        }
    }
];

const BuildingWorkspaceScreen = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 100,
            },
        },
    };

    const ShimmerBlock = ({ className }: { className?: string }) => (
        <div className={cn("relative overflow-hidden rounded-lg bg-muted", className)}>
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-background/30 to-transparent" />
        </div>
    );

    return (
        <motion.div
            className="w-full max-w-sm mx-auto p-4 space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
        >
            <motion.div variants={itemVariants} className="space-y-2">
                <ShimmerBlock className="h-8 w-3/4" />
                <ShimmerBlock className="h-4 w-1/2" />
            </motion.div>
            
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                <ShimmerBlock className="h-20 w-full" />
                <ShimmerBlock className="h-20 w-full" />
                <ShimmerBlock className="h-20 w-full" />
                <ShimmerBlock className="h-20 w-full" />
            </motion.div>
            
            <motion.div variants={itemVariants}>
                <ShimmerBlock className="h-28 w-full" />
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
                <ShimmerBlock className="h-6 w-1/3" />
                <ShimmerBlock className="h-24 w-full" />
            </motion.div>
        </motion.div>
    );
};


export function OnboardingTour({ onComplete }: { onComplete: () => void }) {
    const [step, setStep] = useState(0);
    const [isIntro, setIsIntro] = useState(true);
    const [isFinishing, setIsFinishing] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const { theme, setTheme } = useApp();

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
            }, 5000); // Extended duration for the build animation
        }
    };
    
    const isLastStep = step === steps.length - 1;
    const CurrentIcon = steps[step].icon;
    const CurrentContent = steps[step].content;

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
                    variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 1.5 } } }}
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
            <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
            <div className="absolute top-[-4rem] -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-1/4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

            <AnimatePresence>
                {isFinishing ? (
                     <motion.div
                        key="finishing"
                        className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 bg-background"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        <h2 className="text-2xl font-bold font-headline mb-6">Construyendo tu Espacio...</h2>
                        <BuildingWorkspaceScreen />
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
                                        <CurrentContent theme={theme} setTheme={setTheme} />
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
