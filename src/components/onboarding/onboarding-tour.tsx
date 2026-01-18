
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
    Moon,
    X
} from 'lucide-react';
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

const InfoPanel = ({ title, description, icon: Icon, onClose }: { title: string; description:string; icon: React.ElementType; onClose: () => void; }) => {
    return (
        <motion.div
            className="w-full h-full p-6 rounded-2xl shadow-2xl bg-background/80 backdrop-blur-lg border border-border/50 text-center flex flex-col items-center justify-center relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
            <Button size="icon" variant="ghost" className="absolute top-2 right-2 rounded-full h-8 w-8" onClick={onClose}>
                <X className="h-4 w-4" />
            </Button>
            <div className="w-12 h-12 bg-background/50 rounded-lg flex items-center justify-center mx-auto mb-4 border">
                <Icon className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-bold text-lg text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </motion.div>
    );
};


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
    const [activeExplanation, setActiveExplanation] = useState<string | null>(null);
    const { theme, setTheme } = useApp();
    
    useEffect(() => {
        const timer = setTimeout(() => setIsIntro(false), 4000); 
        return () => clearTimeout(timer);
    }, []);

    const handleShowInfo = (title: string) => {
        setActiveExplanation(title);
    };
    
    const handleCloseInfo = () => {
        setActiveExplanation(null);
    };

    const handleNext = () => {
        setActiveExplanation(null);
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            setIsFinishing(true);
            setTimeout(() => {
                setIsExiting(true);
            }, 5000);
        }
    };
    
    const steps = [
        {
            icon: School,
            title: "Elige tu Camino",
            description: "Dynamic Class se adapta a ti. Pulsa en cada opción para saber más.",
            items: [
                { icon: School, title: "Unirse a un Centro", desc: "Usa el código de tu clase para conectar.", explanation: "Usa el código de tu clase para conectar con tu centro y sincronizar horarios." },
                { icon: PlusCircle, title: "Crear un Centro", desc: "Crea un espacio para tu centro y comparte.", explanation: "Si eres profesor o delegado, crea un espacio para tu centro y comparte recursos." },
                { icon: User, title: "Uso Personal", desc: "Disfruta de la app de forma individual.", explanation: "Disfruta de las herramientas de estudio sin conexión a un centro." },
            ],
            content: () => {
                const activeItem = steps[0].items.find(item => item.title === activeExplanation);
                return (
                    <div className="w-full h-[400px] flex overflow-x-hidden">
                        <motion.div 
                            className="w-full h-full flex-shrink-0 flex items-center justify-center"
                            animate={{ x: activeExplanation ? '-50%' : '0%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        >
                            <div className="w-72 space-y-4">
                            {steps[0].items.map((item) => (
                                <div key={item.title} className="w-full flex items-center text-left p-3 rounded-xl border bg-background/80 backdrop-blur-sm gap-4">
                                    <div className="p-2 bg-primary/10 rounded-lg"> <item.icon className="h-5 w-5 text-primary" /> </div>
                                    <div>
                                        <h4 className="font-semibold text-sm text-foreground">{item.title}</h4>
                                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                                    </div>
                                    <Button size="icon" variant="ghost" className="ml-auto h-8 w-8 rounded-full" onClick={() => handleShowInfo(item.title)}>
                                        <motion.span className="absolute inline-flex h-2 w-2 rounded-full bg-blue-500" animate={{ scale: [1, 2, 1], opacity: [1, 0, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                                    </Button>
                                </div>
                            ))}
                            </div>
                        </motion.div>
                         <AnimatePresence>
                            {activeExplanation && activeItem && (
                                <motion.div 
                                    className="w-full h-full flex-shrink-0 flex items-center justify-center absolute left-full"
                                    initial={{ x: 0 }}
                                    animate={{ x: '-100%' }}
                                    exit={{ x: '0%' }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                >
                                    <div className="w-72 h-[300px]">
                                        <InfoPanel {...activeItem} onClose={handleCloseInfo} />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )
            }
        },
        {
            icon: Users,
            title: "Una Estructura Colaborativa",
            description: "Organizamos los roles para una gestión clara y segura. Pulsa para saber qué hace cada uno.",
            items: [
                { icon: ShieldCheck, title: "Admin Global", desc: "Supervisa toda la plataforma.", explanation: "Control total para crear centros, gestionar usuarios y roles. Es el nivel más alto, reservado para el equipo de Dynamic Class." },
                { icon: Building, title: "Admin de Centro", desc: "Gestiona un centro educativo.", explanation: "Añade clases, gestiona miembros y configura calendarios y horarios. Ideal para directores o jefes de estudios." },
                { icon: GraduationCap, title: "Admin de Clase", desc: "Modera el chat y horario de su clase.", explanation: "Un rol de delegado o profesor que puede fijar mensajes y editar el horario de su propia clase." },
                { icon: User, title: "Estudiante", desc: "Participa, aprende y compite.", explanation: "El rol principal. Accede a las herramientas de estudio, participa en clase y compite en los rankings." },
            ],
            content: () => {
                const activeItem = steps[1].items.find(item => item.title === activeExplanation);
                return (
                    <div className="w-full h-[400px] flex items-center justify-center gap-4">
                        <div className="w-64 space-y-3">
                        {steps[1].items.map((item) => (
                            <div key={item.title} className="w-full flex items-center text-left p-2 rounded-xl border bg-background/80 backdrop-blur-sm gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg"> <item.icon className="h-5 w-5 text-primary" /> </div>
                                <div className='flex-1'>
                                    <h4 className="font-semibold text-xs text-foreground">{item.title}</h4>
                                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                                </div>
                                <Button size="icon" variant="ghost" className="ml-auto h-8 w-8 rounded-full" onClick={() => handleShowInfo(item.title)}>
                                    <motion.span className="absolute inline-flex h-2 w-2 rounded-full bg-blue-500" animate={{ scale: [1, 2, 1], opacity: [1, 0, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                                </Button>
                            </div>
                        ))}
                        </div>
                        <AnimatePresence>
                            {activeExplanation && activeItem && (
                                <div className="w-56 h-[280px]">
                                    <InfoPanel {...activeItem} onClose={handleCloseInfo} />
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                )
            }
        },
        {
            icon: BrainCircuit,
            title: "Tu Centro de Operaciones",
            description: "Todas tus herramientas de productividad, centralizadas en el Modo Estudio para que nada te distraiga.",
            items: [
                { title: 'Pomodoro', icon: Timer, explanation: "Utiliza la técnica Pomodoro para mantener la concentración en bloques de estudio (ej. 25 min) seguidos de descansos cortos." },
                { title: 'Escáner', icon: ScanLine, explanation: "Digitaliza tus apuntes en papel. Haz una foto, mejora la imagen y guárdala como PDF en tu dispositivo." },
                { title: 'Calculadora', icon: Calculator, explanation: "Una calculadora científica siempre a mano para resolver problemas complejos sin salir de la app." },
                { title: 'Música', icon: Music, explanation: "Conéctate a Spotify y controla tu música de estudio favorita directamente desde el Modo Estudio." },
                { title: 'Calcula Notas', icon: Target, explanation: "Introduce tus notas y sus porcentajes para calcular qué necesitas sacar en el próximo examen para aprobar." },
                { title: 'Editor Mágico', icon: Wand2, explanation: "Potencia tus apuntes con IA. Pídele que resuma, traduzca, corrija la ortografía o incluso continúe tus textos." },
            ],
            content: () => {
                const activeItem = steps[2].items.find(item => item.title === activeExplanation);
                 return (
                    <div className="w-full h-[400px] flex items-center justify-center gap-4">
                        <div className="grid grid-cols-3 gap-3 w-72">
                        {steps[2].items.map(tool => (
                            <div key={tool.title} className="w-full h-full flex flex-col items-center justify-center gap-2 p-2 rounded-lg border bg-background/80 backdrop-blur-sm aspect-square">
                                <div className="p-2 bg-primary/10 rounded-lg"> <tool.icon className="h-6 w-6 text-primary"/> </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-xs font-semibold leading-tight text-center">{tool.title}</span>
                                    <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full" onClick={() => handleShowInfo(tool.title)}>
                                        <motion.span className="absolute inline-flex h-2 w-2 rounded-full bg-blue-500" animate={{ scale: [1, 2, 1], opacity: [1, 0, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        </div>
                         <AnimatePresence>
                            {activeExplanation && activeItem && (
                                <div className="w-56 h-[280px]">
                                    <InfoPanel {...activeItem} onClose={handleCloseInfo} />
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                )
            }
        },
        {
            icon: Sparkles,
            title: "Asistencia Inteligente",
            description: "Nuestra IA te ayuda a entender conceptos, generar resúmenes y crear tarjetas de estudio interactivas.",
            items: [{ title: "ADRIMAX AI", features: ["Resúmenes", "Flashcards", "Explicaciones", "Esquemas", "Cuestionarios"], explanation: "ADRIMAX AI es un asistente educativo avanzado integrado en la app. Puedes chatear con él para pedirle que te explique conceptos difíciles, te haga un resumen de un texto largo, genere tarjetas de estudio interactivas para repasar, o incluso cree cuestionarios para que pongas a prueba tus conocimientos. ¡Es como tener un tutor personal en tu bolsillo!" }],
            content: () => {
                const item = steps[3].items[0];
                return (
                    <div className="w-full h-[400px] flex items-center justify-center">
                        <div className="w-full max-w-sm">
                            <div className="w-full p-6 rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg text-left">
                                <h4 className="font-bold text-lg">{item.title}</h4>
                                <p className="opacity-80 mt-1 text-sm">Tu asistente 24/7. Pídele que te explique un tema, te cree tarjetas de estudio o que te ponga a prueba con un cuestionario.</p>
                                <div className="flex flex-wrap gap-2 mt-4">
                                {item.features.map(feat => (
                                    <span key={feat} className="text-xs font-bold bg-white/20 py-1 px-2 rounded-full">{feat}</span>
                                ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        },
        {
            icon: Vote,
            title: "Interactúa con tu Clase",
            description: "Consulta tu horario, participa en encuestas y mantente siempre al día con el chat de clase y los anuncios.",
            items: [
                { icon: MessageSquare, title: "Chat de Clase", explanation: "Un espacio de chat en tiempo real para resolver dudas y organizar trabajos en grupo con tus compañeros." },
                { icon: Building, title: "Anuncios y Encuestas", explanation: "Mantente al día con los comunicados de tus profesores y participa en encuestas para dar tu opinión." },
                { icon: Calendar, title: "Horario Integrado", explanation: "Consulta tus clases: asignatura, hora, profesor y aula. Todo en un mismo lugar y siempre accesible." },
            ],
            content: () => {
                const activeItem = steps[4].items.find(item => item.title === activeExplanation);
                 return (
                    <div className="w-full h-[400px] flex items-center justify-center gap-4">
                        <div className="w-72 space-y-4">
                        {steps[4].items.map((item) => (
                            <div key={item.title} className="w-full flex items-center text-left p-3 rounded-xl border bg-background/80 backdrop-blur-sm gap-4">
                                <div className="p-2 bg-primary/10 rounded-lg"> <item.icon className="h-5 w-5 text-primary" /> </div>
                                <h4 className="flex-1 font-semibold text-sm text-foreground">{item.title}</h4>
                                <Button size="icon" variant="ghost" className="ml-auto h-8 w-8 rounded-full" onClick={() => handleShowInfo(item.title)}>
                                    <motion.span className="absolute inline-flex h-2 w-2 rounded-full bg-blue-500" animate={{ scale: [1, 2, 1], opacity: [1, 0, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                                </Button>
                            </div>
                        ))}
                        </div>
                         <AnimatePresence>
                            {activeExplanation && activeItem && (
                                <div className="w-56 h-[280px]">
                                    <InfoPanel {...activeItem} onClose={handleCloseInfo} />
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                )
            }
        },
        {
            icon: Trophy,
            title: "Compite y Gana Recompensas",
            description: "Gana trofeos por tus logros y canjéalos por tarjetas regalo o avatares exclusivos para tu perfil.",
            items: [
                { icon: Trophy, title: "Trofeos", value: "125", explanation: "Gana trofeos al completar tareas y exámenes. ¡Acumúlalos para subir en el ranking y canjearlos por premios!" },
                { icon: Flame, title: "Racha Actual", value: "12 Días", explanation: "Mantén tu racha de estudio diaria utilizando el Modo Estudio. ¡Compite con tus compañeros para ver quién tiene la racha más larga!" },
                { icon: Gift, title: "Tarjetas Regalo", value: "", explanation: "Canjea los trofeos que tanto te ha costado ganar por tarjetas regalo de tus tiendas favoritas como Amazon, GAME, y más." },
                { icon: Cat, title: "Avatares", value: "", explanation: "Usa tus trofeos para desbloquear iconos y avatares exclusivos para personalizar tu foto de perfil y destacar en la comunidad." },
            ],
            content: () => {
                 const activeItem = steps[5].items.find(item => item.title === activeExplanation);
                 return (
                    <div className="w-full h-[400px] flex items-center justify-center gap-4">
                        <div className="grid grid-cols-2 gap-4 w-72">
                        {steps[5].items.map((item) => (
                           <div key={item.title} className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border bg-amber-400/10 border-amber-400/30">
                                <item.icon className="h-8 w-8 text-amber-500"/>
                                <span className="font-bold text-sm text-center">{item.title}</span>
                                {item.value && <span className="font-bold text-xl">{item.value}</span>}
                                 <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full" onClick={() => handleShowInfo(item.title)}>
                                    <motion.span className="absolute inline-flex h-2 w-2 rounded-full bg-blue-500" animate={{ scale: [1, 2, 1], opacity: [1, 0, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                                </Button>
                           </div>
                        ))}
                        </div>
                        <AnimatePresence>
                            {activeExplanation && activeItem && (
                                <div className="w-56 h-[280px]">
                                    <InfoPanel {...activeItem} onClose={handleCloseInfo} />
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                )
            }
        },
        {
            icon: MailCheck,
            title: "Notificaciones y Tema",
            description: "Recibe resúmenes semanales y mantente al día sin esfuerzo. Personaliza tu experiencia visual desde el principio.",
            items: [
                { icon: MailCheck, title: "Resúmenes Semanales", explanation: "Si lo activas, cada viernes recibirás en tu correo un resumen de tu rendimiento, tareas completadas y los próximos eventos de tu calendario. ¡Una forma perfecta de planificar tu semana!" },
                { icon: theme === 'dark' ? Moon : Sun, title: "Pre-configurar Tema", explanation: "Elige tu tema preferido, claro u oscuro. Puedes cambiarlo en cualquier momento desde los ajustes de la aplicación." },
            ],
            content: ({ setTheme, theme }: { setTheme: (theme: Theme) => void, theme: Theme }) => {
                const ThemeIcon = theme === 'dark' ? Moon : Sun;
                const activeItem = steps[6].items.find(item => item.title === activeExplanation);
                return (
                     <div className="w-full h-[400px] flex items-center justify-center gap-4">
                        <div className="w-72 space-y-4">
                            <div className="w-full flex items-center gap-4 p-4 rounded-xl border bg-background/80 backdrop-blur-sm text-left">
                                <MailCheck className="h-6 w-6 text-primary flex-shrink-0"/>
                                <div>
                                    <h4 className="font-semibold">Resúmenes Semanales</h4>
                                    <p className="text-sm text-muted-foreground">Recibe cada viernes un informe de tu progreso.</p>
                                </div>
                                <Button size="icon" variant="ghost" className="ml-auto h-8 w-8 rounded-full" onClick={() => handleShowInfo("Resúmenes Semanales")}>
                                    <motion.span className="absolute inline-flex h-2 w-2 rounded-full bg-blue-500" animate={{ scale: [1, 2, 1], opacity: [1, 0, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                                </Button>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    const newTheme = theme === 'dark' ? 'light' : 'dark';
                                    setTheme(newTheme);
                                }}
                                className="w-full flex items-center gap-4 p-4 rounded-xl border bg-background/80 backdrop-blur-sm text-left cursor-pointer hover:bg-muted/50"
                            >
                                <ThemeIcon className="h-6 w-6 text-primary flex-shrink-0"/>
                                <div>
                                    <h4 className="font-semibold">Pre-configurar Tema</h4>
                                    <p className="text-sm text-muted-foreground">Prueba el Modo Oscuro y elige tu vista preferida.</p>
                                </div>
                            </button>
                        </div>
                        <AnimatePresence>
                            {activeExplanation && activeItem && (
                                <div className="w-56 h-[280px]">
                                    <InfoPanel {...activeItem} onClose={handleCloseInfo} />
                                </div>
                            )}
                        </AnimatePresence>
                     </div>
                )
            }
        }
    ];

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
            className="fixed inset-0 bg-background z-[100] flex flex-col p-6"
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
                        <h2 className="text-2xl font-bold font-headline mb-6">Configurando tu espacio...</h2>
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
                                    className="w-full max-w-xl mx-auto"
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
                                    
                                    <div className="min-h-[400px] flex items-center justify-center">
                                        <CurrentContent setTheme={setTheme} theme={theme} />
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
