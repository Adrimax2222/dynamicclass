
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search, Rocket, TrendingUp, Palette, FlaskConical, Brain, Code, ShieldCheck, Gamepad2, BrainCircuit, Users, Globe, Leaf, Waves, Clock, PlusCircle, CheckCircle, Loader2, Info, AlertTriangle } from "lucide-react";
import { useApp } from "@/lib/hooks/use-app";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { addDoc, collection, serverTimestamp, type Timestamp } from "firebase/firestore";
import type { ReservedCourse } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const courseSections = [
    {
        category: "Tecnología y Programación",
        description: "Desde crear tu primera web hasta montar un PC.",
        icon: Code,
        color: "text-green-500",
        courses: [
            { title: "Python para \"Lazy People\": Automatiza tus tareas", description: "Crea un bot de ofertas, organiza tus carpetas automáticamente o haz un raspado de datos de una web.", difficulty: "Medio", duration: "1h 45m" },
            { title: "HTML & CSS: Tu primera Web desde cero", description: "Aprende la estructura de internet (etiquetas HTML) y el diseño visual (CSS) para publicar tu propia página personal online.", difficulty: "Fácil", duration: "2h" },
            { title: "Arduino Makers: Electrónica que cobra vida", description: "Usa la 'protoboard' y programa sensores de movimiento, luces LED rítmicas o un termómetro digital.", difficulty: "Medio", duration: "1h 30m" },
            { title: "PC Master Builder: Hardware y Optimización total", description: "Elige componentes según tu presupuesto, móntalos y configura el software (BIOS, Drivers) para que el PC vuele.", difficulty: "Difícil", duration: "2h" },
            { title: "Smartphone Anatomy: Chips, Sensores y Cámaras", description: "Diferencias entre procesadores, qué hace un sensor de 108MP y cómo leer una comparativa sin que te engañe el marketing.", difficulty: "Medio", duration: "1h" },
            { title: "Arduino STEAMakers: Programación por Bloques para Inventores", description: "Aprende la lógica de programación (bucles, variables, condicionales) usando el entorno de ArduinoBlocks sin escribir código.", difficulty: "Fácil", duration: "1h 15m" },
            { title: "Duelo de Sistemas: Windows, macOS o Linux, ¿cuál es tu \"Main\"?", description: "Cómo funciona el Kernel, la gestión de archivos y la privacidad de datos. Incluye un test para encontrar tu SO ideal.", difficulty: "Fácil", duration: "45 min" },
        ]
    },
    {
        category: "IA y Videojuegos",
        description: "Domina la IA y aprende a crear tus propios juegos.",
        icon: Gamepad2,
        color: "text-red-500",
        courses: [
            { title: "Inteligencia Artificial Generativa (Prompt Engineering)", description: "Cómo dominar ChatGPT y Midjourney para investigar y crear. (Enfoque: Lógica semántica y tecnología).", difficulty: "Medio", duration: "1h 30m" },
            { title: "Desarrollo de Videojuegos 2D con Unity", description: "De la idea al código C#. (Enfoque: Programación y física mecánica).", difficulty: "Difícil", duration: "2h" },
            { title: "Roblox Studio: Crea tu primer juego viral", description: "Interfaz de Roblox Studio, construcción de mapas con 'Parts' y nociones básicas de Luau para crear trampas y tiendas.", difficulty: "Fácil", duration: "1h 15m" },
            { title: "¿Cómo piensa una IA? Redes Neuronales explicadas con Pizza", description: "Aprende Machine Learning, algoritmos y LLMs con ejemplos visuales y sencillos.", difficulty: "Fácil", duration: "45 min" },
        ]
    },
    {
        category: "Seguridad y Sociedad Digital",
        description: "Protege tu identidad y navega de forma segura.",
        icon: ShieldCheck,
        color: "text-slate-500",
        courses: [
            { title: "Hacking Ético y Ciberseguridad Básica", description: "Aprende a proteger redes pensando como un hacker. (Enfoque: Lógica informática y seguridad).", difficulty: "Difícil", duration: "2h" },
            { title: "Tu Identidad bajo Candado: El Triángulo de Seguridad", description: "Protege tus cuentas de Google, Apple y Microsoft con 2FA, biometría y revisión de sesiones activas.", difficulty: "Fácil", duration: "30 min" },
            { title: "IA sin Huella: Cómo usar ChatGPT y Midjourney sin regalar tus datos", description: "Usa la IA de forma inteligente y privada: Modo Incógnito, qué no subir y cómo detectar Deepfakes.", difficulty: "Fácil", duration: "40 min" },
            { title: "CSI Redes Sociales: Configuración de Privacidad Extrema", description: "Controla quién puede verte en Instagram y TikTok. Evita que te encuentren por tu número y limpia la ubicación de tus fotos.", difficulty: "Fácil", duration: "45 min" },
            { title: "Wifi, QR y Enlaces: El Manual de Supervivencia en la Calle", description: "Evita los peligros del mundo físico: Wi-Fis públicas, códigos QR maliciosos y enlaces falsos.", difficulty: "Fácil", duration: "25 min" },
            { title: "Digital Detective: Cómo detectar Fake News y estafas en segundos", description: "Aprende técnicas de \"Lectura Lateral\", búsqueda inversa de imágenes y cómo funcionan los algoritmos de burbuja.", difficulty: "Medio", duration: "1h" },
        ]
    },
    {
        category: "Creatividad y Contenido Digital",
        description: "Desata tu lado artístico y aprende a crear contenido viral.",
        icon: Palette,
        color: "text-orange-500",
        courses: [
            { title: "Escritura Creativa para Guiones de Series y Cine", description: "Estructura narrativa y creación de personajes. (Enfoque: Literatura y dramaturgia).", difficulty: "Medio", duration: "1h 45m" },
            { title: "Producción Musical (Home Studio)", description: "Teoría musical y mezcla digital. (Enfoque: Música y física del sonido).", difficulty: "Difícil", duration: "2h" },
            { title: "Diseño Gráfico para Redes Sociales", description: "Psicología del color y composición visual. (Enfoque: Artes visuales y marketing).", difficulty: "Medio", duration: "1h 30m" },
            { title: "Oratoria y Debate Competitivo", description: "Técnicas para hablar en público y ganar discusiones. (Enfoque: Retórica y lógica argumentativa).", difficulty: "Medio", duration: "1h 15m" },
            { title: "Edición Viral con CapCut", description: "Trucos de edición, transiciones y efectos para TikTok/Reels. (Enfoque: Narrativa audiovisual).", difficulty: "Fácil", duration: "1h" },
            { title: "Crea tus propios Filtros de Instagram/TikTok", description: "Introducción a Spark AR. (Enfoque: Diseño y realidad aumentada básica).", difficulty: "Medio", duration: "1h 30m" },
            { title: "Pixel Art", description: "Aprende a dibujar estilo \"retro\" 8-bit para videojuegos o iconos. (Enfoque: Arte digital y geometría).", difficulty: "Fácil", duration: "1h" },
            { title: "Google Hacking: Aprende a buscar como un pro", description: "Aprende comandos para encontrar archivos ocultos, PDFs, etc. (Enfoque: Investigación y gestión de información).", difficulty: "Fácil", duration: "30 min" },
            { title: "Cómo escribir barras de Rap/Trap", description: "Rimas, métrica y figuras retóricas (metáforas, similes). (Enfoque: Poesía y literatura).", difficulty: "Fácil", duration: "45 min" },
            { title: "Stop Motion con tu Móvil", description: "Anima tus Legos o muñecos frame a frame. (Enfoque: Principios de animación).", difficulty: "Fácil", duration: "1h 15m" },
            { title: "Lettering y Apuntes Bonitos", description: "Mejora tu letra y organiza tus cuadernos. (Enfoque: Caligrafía y diseño).", difficulty: "Fácil", duration: "45 min" },
            { title: "Fotografía de Producto con el Móvil", description: "Haz que tus zapatillas o comida se vean de anuncio para venderlas en Vinted/Wallapop.", difficulty: "Medio", duration: "1h" },
            { title: "Customiza tu Ropa (Upcycling)", description: "Pintura textil y cortes básicos para renovar camisetas viejas. (Enfoque: Diseño de moda y sostenibilidad).", difficulty: "Fácil", duration: "1h" },
        ]
    },
    {
        category: "Finanzas y Emprendimiento",
        description: "Aprende a gestionar tu dinero y a lanzar tus propias ideas.",
        icon: TrendingUp,
        color: "text-teal-500",
        courses: [
            { title: "Economía de Creadores", description: "Cómo monetizar un canal de YouTube/Twitch legalmente. (Enfoque: Modelos de negocio y fiscalidad básica).", difficulty: "Medio", duration: "1h 30m" },
            { title: "Inversión Joven 101", description: "Entendiendo el interés compuesto, ETFs y la Bolsa. (Enfoque: Matemáticas financieras).", difficulty: "Medio", duration: "1h 15m" },
            { title: "De la Idea a la Startup", description: "Metodología Lean para lanzar proyectos escolares o reales. (Enfoque: Administración de empresas).", difficulty: "Difícil", duration: "2h" },
            { title: "Criptomonedas y Blockchain", description: "La tecnología detrás del Hype. (Enfoque: Economía digital y criptografía).", difficulty: "Difícil", duration: "1h 45m" },
            { title: "Economía de Bolsillo: Impuestos, IVA y tu primer sueldo", description: "Explica de forma simple qué es el IVA que pagan al comprar un juego, por qué el gobierno quita una parte del sueldo (IRPF) y cómo funciona un banco por dentro.", difficulty: "Fácil", duration: "1h" },
        ]
    },
    {
        category: "Desarrollo Personal y Bienestar",
        description: "Habilidades para la vida, inteligencia emocional y bienestar mental.",
        icon: Brain,
        color: "text-pink-500",
        courses: [
            { title: "Neurociencia del Aprendizaje", description: "Hackea tu cerebro para estudiar menos y aprender más. (Enfoque: Psicología cognitiva y técnicas de estudio).", difficulty: "Medio", duration: "1h 20m" },
            { title: "Nutrición Deportiva Real", description: "Bioquímica de los alimentos vs. mitos de internet. (Enfoque: Biología y salud).", difficulty: "Medio", duration: "1h" },
            { title: "Sostenibilidad y Moda", description: "El impacto ambiental de la ropa (Fast Fashion) y el Upcycling. (Enfoque: Ecología y sociología).", difficulty: "Fácil", duration: "45 min" },
            { title: "Inteligencia Emocional: \"Modo Pro\"", description: "Cómo identificar qué sientes, técnicas para que una emoción no te arruine el día y cómo responder en lugar de reaccionar.", difficulty: "Medio", duration: "1h 10m" },
            { title: "Braintuning: El Manual contra la Ansiedad", description: "Por qué el cerebro se bloquea antes de un examen y ejercicios prácticos (respiración 4-7-8) para bajar las revoluciones.", difficulty: "Fácil", duration: "45 min" },
            { title: "Cuerpo y Relaciones: Lo que no sale en las películas", description: "La realidad de los cuerpos, el consentimiento real, cómo poner límites sin sentir culpa y salud sexual básica.", difficulty: "Fácil", duration: "1h" },
            { title: "Amor Propio vs. El Espejo de Instagram", description: "Cómo los filtros y la edición afectan nuestra percepción y cómo construir una relación sana con tu propia imagen.", difficulty: "Fácil", duration: "50 min" },
            { title: "Socializar en la Era del Algoritmo", description: "Cómo iniciar una conversación, cómo leer el lenguaje corporal y la diferencia entre 'seguidores' y amigos reales.", difficulty: "Fácil", duration: "1h" },
            { title: "Presión Social y \"Clout\"", description: "Por qué buscamos la atención (dopamina), cómo decir \"no\" y el análisis de las polémicas virales.", difficulty: "Medio", duration: "1h" },
            { title: "Marca Personal: Tú eres un logo", description: "Cómo crear una imagen digital que te abra puertas en lugar de cerrarlas, sin dejar de ser tú mismo.", difficulty: "Medio", duration: "1h 15m" },
            { title: "\"Adulting\" Starter Pack: Cosas que el colegio olvidó", description: "Cómo leer un contrato de alquiler, qué es una factura de la luz, cómo se pide una cita médica solo y qué hacer si pierdes el DNI.", difficulty: "Fácil", duration: "1h 30m" },
        ]
    },
    {
        category: "Ciencia y Curiosidades",
        description: "Explora desde la física de los superhéroes hasta los secretos de la historia.",
        icon: FlaskConical,
        color: "text-purple-500",
        courses: [
            { title: "La Física de los Superhéroes", description: "Entendiendo a Newton a través de Marvel y DC. (Enfoque: Física clásica).", difficulty: "Fácil", duration: "1h" },
            { title: "Bioética y Genética (CRISPR)", description: "¿Debemos editar el ADN humano? (Enfoque: Biología y ética filosófica).", difficulty: "Difícil", duration: "1h 45m" },
            { title: "Historia a través de los Videojuegos", description: "La Segunda Guerra Mundial o la Edad Media vistas desde \"Call of Duty\" o \"Age of Empires\".", difficulty: "Fácil", duration: "1h 30m" },
            { title: "Japonés Básico a través del Anime y Manga", description: "Introducción al idioma y cultura. (Enfoque: Lingüística).", difficulty: "Fácil", duration: "1h 45m" },
            { title: "Detectar Falacias Lógicas", description: "Que no te engañen en una discusión (el hombre de paja, ad hominem, etc.). (Enfoque: Lógica y pensamiento crítico).", difficulty: "Medio", duration: "1h" },
            { title: "Lenguaje Corporal Básico", description: "Cómo saber si alguien te miente o si le gustas. (Enfoque: Psicología del comportamiento).", difficulty: "Fácil", duration: "45 min" },
            { title: "Paradojas que te explotan la cabeza", description: "El gato de Schrödinger o la paradoja del abuelo explicadas fácil. (Enfoque: Filosofía y lógica).", difficulty: "Medio", duration: "1h" },
            { title: "Mindfulness para Gamers", description: "Cómo controlar el \"Rage Quit\" y la frustración al perder. (Enfoque: Inteligencia emocional).", difficulty: "Fácil", duration: "30 min" },
            { title: "Inglés de la Calle (Slang)", description: "Aprende las frases de las series y canciones que no salen en los libros de texto.", difficulty: "Fácil", duration: "45 min" },
            { title: "Banderas del Mundo (Vexilología)", description: "Por qué son como son y cómo diseñar una bandera propia. (Enfoque: Geografía y diseño).", difficulty: "Fácil", duration: "30 min" },
            { title: "Supervivencia Básica", description: "Nudos, orientación sin brújula y potabilizar agua. (Enfoque: Escultismo y física aplicada).", difficulty: "Medio", duration: "1h" },
            { title: "Mitos del Espacio", description: "¿Explotas en el vacío? ¿Hay sonido en el espacio? (Enfoque: Astronomía básica).", difficulty: "Fácil", duration: "45 min" },
            { title: "Historia de las Zapatillas (Sneakerhead 101)", description: "De las Jordan a las Yeezy, el negocio y la cultura. (Enfoque: Historia cultural y marketing).", difficulty: "Fácil", duration: "50 min" },
            { title: "Mecánica de Bicicletas", description: "Arregla un pinchazo y ajusta los frenos tú mismo. (Enfoque: Mecánica básica).", difficulty: "Medio", duration: "1h" },
            { title: "Aviation Masterclass: De Pasajero a Capitán (Simulación y Realidad)", description: "Principios de aerodinámica, cómo leer una cabina \"Glass Cockpit\" y fases de un vuelo en simulador (Microsoft Flight Simulator).", difficulty: "Medio", duration: "1h 30m" },
            { title: "La Brújula Política: ¿Dónde estás tú?", description: "El origen de la \"Izquierda\" y la \"Derecha\", qué significan liberalismo, socialismo, etc., y cómo leer un programa electoral.", difficulty: "Medio", duration: "1h 15m" },
            { title: "Psicología del Scroll Infinito", description: "Enseña cómo las apps de redes sociales usan la dopamina para mantenerte enganchado y cómo recuperar el control.", difficulty: "Fácil", duration: "40 min" },
            { title: "Ética de la IA: ¿Es arte lo que hace Midjourney?", description: "Un curso de debate sobre los derechos de autor, el futuro del trabajo y si una IA debería tener \"responsabilidad\".", difficulty: "Medio", duration: "1h" },
        ]
    },
];

function ReservationInfoDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                    <Info className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>¿Cómo funcionan las reservas?</DialogTitle>
                    <DialogDescription>
                        Todo lo que necesitas saber sobre reservar un curso.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <p>Al reservar un curso, te apuntas a la <strong>lista de espera</strong> para cuando se lance. Serás de los primeros en saberlo.</p>
                    <Alert>
                        <Rocket className="h-4 w-4" />
                        <AlertTitle>Plazas Limitadas</AlertTitle>
                        <AlertDescription>
                            Algunos cursos tendrán un número máximo de plazas para garantizar la calidad. ¡Reservar te da prioridad!
                        </AlertDescription>
                    </Alert>
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Límite Temporal de 5 Cursos</AlertTitle>
                        <AlertDescription>
                            Para asegurar que todos tengan la oportunidad de explorar, hemos establecido un límite temporal de <strong>5 reservas</strong> por usuario.
                        </AlertDescription>
                    </Alert>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button>Entendido</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ExploreContent() {
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useApp();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

    const reservedCoursesQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return collection(firestore, `users/${user.uid}/reservedCourses`);
    }, [user, firestore]);

    const { data: reservedCourses = [] } = useCollection<ReservedCourse>(reservedCoursesQuery);
    
    const RESERVATION_LIMIT = 5;
    const isLimitReached = reservedCourses.length >= RESERVATION_LIMIT;

    const reservedCourseTitles = useMemo(() => new Set(reservedCourses.map(c => c.courseTitle)), [reservedCourses]);

    const handleReserveCourse = async (courseTitle: string, category: string) => {
        if (!user || !firestore) {
            toast({ title: 'Debes iniciar sesión para reservar cursos.', variant: 'destructive' });
            return;
        }

        if (isLimitReached) {
            toast({
                title: 'Límite de reservas alcanzado',
                description: 'Solo puedes reservar un máximo de 5 cursos por ahora.',
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(courseTitle);
        try {
            const reservedCourseData: Omit<ReservedCourse, 'uid'> = {
                courseTitle,
                category,
                progress: 0,
                reservedAt: serverTimestamp() as Timestamp,
            };
            await addDoc(collection(firestore, `users/${user.uid}/reservedCourses`), reservedCourseData);
            toast({
                title: '¡Curso reservado!',
                description: `"${courseTitle}" se ha añadido a "Mis Cursos".`
            });
        } catch (error) {
            console.error("Error reserving course:", error);
            toast({ title: 'Error', description: 'No se pudo reservar el curso.', variant: 'destructive' });
        } finally {
            setIsSubmitting(null);
        }
    };

    const filteredCourseSections = useMemo(() => {
        if (!searchTerm.trim()) {
            return courseSections;
        }

        const lowercasedFilter = searchTerm.toLowerCase();

        return courseSections
            .map(section => {
                const filteredCourses = section.courses.filter(course =>
                    course.title.toLowerCase().includes(lowercasedFilter) ||
                    course.description.toLowerCase().includes(lowercasedFilter)
                );

                if (filteredCourses.length > 0) {
                    return { ...section, courses: filteredCourses };
                }

                return null;
            })
            .filter((section): section is NonNullable<typeof section> => section !== null);
    }, [searchTerm]);
    
    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold font-headline tracking-tight">Explora Nuevos Cursos</h2>
                <p className="text-muted-foreground">Amplía tus conocimientos y descubre nuevas pasiones.</p>
            </div>

            <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm py-4 -my-4 md:-my-6 md:py-6">
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Buscar cursos por palabras clave..."
                        className="w-full pl-12 h-14 text-base rounded-full shadow-lg border-2 border-primary/10 focus:border-primary/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <ReservationInfoDialog />
                    </div>
                </div>
            </div>

            {filteredCourseSections.length > 0 ? (
                filteredCourseSections.map(section => (
                    <section key={section.category}>
                        <div className="flex items-start gap-3 mb-4">
                            <div className="p-2 bg-muted rounded-lg mt-1">
                              <section.icon className={`h-6 w-6 ${section.color}`} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">{section.category}</h3>
                                <p className="text-sm text-muted-foreground">{section.description}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {section.courses.map(course => (
                                <Card key={course.title} className="hover:border-primary/50 transition-colors hover:shadow-lg flex flex-col">
                                    <CardHeader>
                                        <CardTitle className="text-base">{course.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <CardDescription className="text-xs">{course.description}</CardDescription>
                                    </CardContent>
                                    <CardFooter className="p-4 pt-0 flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline" className={cn(
                                                course.difficulty === 'Fácil' && 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700',
                                                course.difficulty === 'Medio' && 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700',
                                                course.difficulty === 'Difícil' && 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700'
                                            )}>
                                                {course.difficulty}
                                            </Badge>
                                            <Badge variant="secondary">
                                                <Clock className="h-3 w-3 mr-1.5" />
                                                {course.duration}
                                            </Badge>
                                        </div>
                                         {reservedCourseTitles.has(course.title) ? (
                                            <Button variant="outline" size="sm" className="h-8 text-green-600 border-green-500/50" disabled>
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Reservado
                                            </Button>
                                        ) : (
                                            <Button 
                                                variant="default" 
                                                size="sm" 
                                                className="h-8" 
                                                onClick={() => handleReserveCourse(course.title, section.category)}
                                                disabled={isLimitReached || isSubmitting === course.title}
                                            >
                                                {isSubmitting === course.title ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <PlusCircle className="mr-2 h-4 w-4" />
                                                )}
                                                Reservar
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </section>
                ))
            ) : (
                <div className="text-center py-16">
                    <p className="font-semibold text-lg">No se encontraron cursos</p>
                    <p className="text-muted-foreground">Intenta con otra palabra clave.</p>
                </div>
            )}
        </div>
    );
}

export default function ExplorePage() {
    return (
        <div className="p-4 sm:p-6 md:p-8">
            <ExploreContent />
        </div>
    );
}
