
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Rocket, TrendingUp, Palette, FlaskConical, Brain, Zap, Wand2, Users, Globe, ShieldCheck, Gamepad2, BrainCircuit, Code, Heart, Scale, Dna, Briefcase, SmilePlus, Activity, Banknote, DollarSign, Lightbulb, ShoppingCart, Building, Mountain, MessageSquare, BookCopy, HelpCircle, Leaf, Waves } from "lucide-react";

const courseSections = [
    {
        category: "Tecnología y Programación",
        description: "Desde crear tu primera web hasta montar un PC.",
        icon: Code,
        color: "text-green-500",
        courses: [
            { title: "Python para \"Lazy People\": Automatiza tus tareas", description: "Crea un bot de ofertas, organiza tus carpetas automáticamente o haz un raspado de datos de una web." },
            { title: "HTML & CSS: Tu primera Web desde cero", description: "Aprende la estructura de internet (etiquetas HTML) y el diseño visual (CSS) para publicar tu propia página personal online." },
            { title: "Arduino Makers: Electrónica que cobra vida", description: "Usa la 'protoboard' y programa sensores de movimiento, luces LED rítmicas o un termómetro digital." },
            { title: "Duelo de Sistemas: Windows, macOS o Linux, ¿cuál es tu \"Main\"?", description: "Cómo funciona el Kernel, la gestión de archivos y la privacidad. Incluye un test para encontrar tu SO ideal." },
            { title: "PC Master Builder: Hardware y Optimización total", description: "Elige componentes según tu presupuesto, móntalos y configura el software (BIOS, Drivers) para que el PC vuele." },
            { title: "Smartphone Anatomy: Chips, Sensores y Cámaras", description: "Diferencias entre procesadores, qué hace un sensor de 108MP y cómo leer una comparativa sin que te engañe el marketing." },
            { title: "Arduino STEAMakers: Programación por Bloques para Inventores", description: "Aprende la lógica de programación (bucles, variables, condicionales) usando el entorno de ArduinoBlocks sin escribir código." },
        ]
    },
    {
        category: "IA y Videojuegos",
        description: "Domina la IA y aprende a crear tus propios juegos.",
        icon: Gamepad2,
        color: "text-red-500",
        courses: [
            { title: "Inteligencia Artificial Generativa (Prompt Engineering)", description: "Cómo dominar ChatGPT y Midjourney para investigar y crear. (Enfoque: Lógica semántica y tecnología)." },
            { title: "Desarrollo de Videojuegos 2D con Unity", description: "De la idea al código C#. (Enfoque: Programación y física mecánica)." },
            { title: "Roblox Studio: Crea tu primer juego viral", description: "Interfaz de Roblox Studio, construcción de mapas con 'Parts' y nociones básicas de Luau para crear trampas y tiendas." },
            { title: "¿Cómo piensa una IA? Redes Neuronales explicadas con Pizza", description: "Aprende Machine Learning, algoritmos y LLMs con ejemplos visuales y sencillos." },
        ]
    },
    {
        category: "Seguridad y Sociedad Digital",
        description: "Protege tu identidad y navega de forma segura.",
        icon: ShieldCheck,
        color: "text-slate-500",
        courses: [
            { title: "Hacking Ético y Ciberseguridad Básica", description: "Aprende a proteger redes pensando como un hacker. (Enfoque: Lógica informática y seguridad)." },
            { title: "Tu Identidad bajo Candado: El Triángulo de Seguridad", description: "Protege tus cuentas de Google, Apple y Microsoft con 2FA, biometría y revisión de sesiones activas." },
            { title: "IA sin Huella: Cómo usar ChatGPT y Midjourney sin regalar tus datos", description: "Usa la IA de forma inteligente y privada: Modo Incógnito, qué no subir y cómo detectar Deepfakes." },
            { title: "CSI Redes Sociales: Configuración de Privacidad Extrema", description: "Controla quién puede verte en Instagram y TikTok. Evita que te encuentren por tu número y limpia la ubicación de tus fotos." },
            { title: "Wifi, QR y Enlaces: El Manual de Supervivencia en la Calle", description: "Evita los peligros del mundo físico: Wi-Fis públicas, códigos QR maliciosos y enlaces falsos." },
        ]
    },
    {
        category: "Creatividad y Contenido Digital",
        description: "Desata tu lado artístico y aprende a crear contenido viral.",
        icon: Palette,
        color: "text-orange-500",
        courses: [
            { title: "Escritura Creativa para Guiones de Series y Cine", description: "Estructura narrativa y creación de personajes. (Enfoque: Literatura y dramaturgia)." },
            { title: "Producción Musical (Home Studio)", description: "Teoría musical y mezcla digital. (Enfoque: Música y física del sonido)." },
            { title: "Diseño Gráfico para Redes Sociales", description: "Psicología del color y composición visual. (Enfoque: Artes visuales y marketing)." },
            { title: "Edición Viral con CapCut", description: "Trucos de edición, transiciones y efectos para TikTok/Reels. (Enfoque: Narrativa audiovisual)." },
            { title: "Crea tus propios Filtros de Instagram/TikTok", description: "Introducción a Spark AR. (Enfoque: Diseño y realidad aumentada básica)." },
            { title: "Pixel Art", description: "Aprende a dibujar estilo \"retro\" 8-bit para videojuegos o iconos. (Enfoque: Arte digital y geometría)." },
            { title: "Cómo escribir barras de Rap/Trap", description: "Rimas, métrica y figuras retóricas (metáforas, similes). (Enfoque: Poesía y literatura)." },
            { title: "Stop Motion con tu Móvil", description: "Anima tus Legos o muñecos frame a frame. (Enfoque: Principios de animación)." },
            { title: "Lettering y Apuntes Bonitos", description: "Mejora tu letra y organiza tus cuadernos. (Enfoque: Caligrafía y diseño)." },
            { title: "Fotografía de Producto con el Móvil", description: "Haz que tus zapatillas o comida se vean de anuncio para venderlas en Vinted/Wallapop." },
            { title: "Customiza tu Ropa (Upcycling)", description: "Pintura textil y cortes básicos para renovar camisetas viejas. (Enfoque: Diseño de moda y sostenibilidad)." },
        ]
    },
    {
        category: "Finanzas y Emprendimiento",
        description: "Aprende a gestionar tu dinero y a lanzar tus propias ideas.",
        icon: TrendingUp,
        color: "text-teal-500",
        courses: [
            { title: "Economía de Creadores", description: "Cómo monetizar un canal de YouTube/Twitch legalmente. (Enfoque: Modelos de negocio y fiscalidad básica)." },
            { title: "Inversión Joven 101", description: "Entendiendo el interés compuesto, ETFs y la Bolsa. (Enfoque: Matemáticas financieras)." },
            { title: "De la Idea a la Startup", description: "Metodología Lean para lanzar proyectos escolares o reales. (Enfoque: Administración de empresas)." },
            { title: "Criptomonedas y Blockchain", description: "La tecnología detrás del Hype. (Enfoque: Economía digital y criptografía)." },
        ]
    },
    {
        category: "Desarrollo Personal y Bienestar",
        description: "Habilidades para la vida, inteligencia emocional y bienestar mental.",
        icon: Brain,
        color: "text-pink-500",
        courses: [
            { title: "Neurociencia del Aprendizaje", description: "Hackea tu cerebro para estudiar menos y aprender más. (Enfoque: Psicología cognitiva y técnicas de estudio)." },
            { title: "Nutrición Deportiva Real", description: "Bioquímica de los alimentos vs. mitos de internet. (Enfoque: Biología y salud)." },
            { title: "Inteligencia Emocional: \"Modo Pro\"", description: "Cómo identificar qué sientes, técnicas para que una emoción no te arruine el día y cómo responder en lugar de reaccionar." },
            { title: "Braintuning: El Manual contra la Ansiedad y el Estrés", description: "Por qué el cerebro se bloquea antes de un examen y ejercicios prácticos (respiración 4-7-8) para bajar las revoluciones." },
            { title: "Cuerpo y Relaciones: Lo que no sale en las películas (ni en el porno)", description: "La realidad de los cuerpos, el consentimiento real, cómo poner límites sin sentir culpa y salud sexual básica." },
            { title: "Amor Propio vs. El Espejo de Instagram", description: "Cómo los filtros y la edición afectan nuestra percepción y cómo construir una relación sana con tu propia imagen." },
            { title: "Socializar en la Era del Algoritmo: El Arte de Conectar", description: "Cómo iniciar una conversación, cómo leer el lenguaje corporal y la diferencia entre 'seguidores' y amigos reales." },
            { title: "Presión Social y \"Clout\": ¿Lo haces porque quieres o por el vídeo?", description: "Por qué buscamos la atención (dopamina), cómo decir \"no\" y el análisis de las polémicas virales." },
            { title: "Marca Personal: Tú eres un logo (aunque no lo sepas)", description: "Cómo crear una imagen digital que te abra puertas en lugar de cerrarlas, sin dejar de ser tú mismo." },
            { title: "\"Adulting\" Starter Pack: Cosas que el colegio olvidó", description: "Cómo leer un contrato de alquiler, qué es una factura de la luz, cómo se pide una cita médica solo y qué hacer si pierdes el DNI." },
        ]
    },
    {
        category: "Ciencia y Curiosidades",
        description: "Explora desde la física de los superhéroes hasta los secretos de la historia.",
        icon: FlaskConical,
        color: "text-purple-500",
        courses: [
            { title: "La Física de los Superhéroes", description: "Entendiendo a Newton a través de Marvel y DC. (Enfoque: Física clásica)." },
            { title: "Bioética y Genética (CRISPR)", description: "¿Debemos editar el ADN humano? (Enfoque: Biología y ética filosófica)." },
            { title: "Historia a través de los Videojuegos", description: "La Segunda Guerra Mundial o la Edad Media vistas desde \"Call of Duty\" o \"Age of Empires\"." },
            { title: "Japonés Básico a través del Anime y Manga", description: "Introducción al idioma y cultura. (Enfoque: Lingüística)." },
            { title: "Detectar Falacias Lógicas", description: "Que no te engañen en una discusión (el hombre de paja, ad hominem, etc.). (Enfoque: Lógica y pensamiento crítico)." },
            { title: "Lenguaje Corporal Básico", description: "Cómo saber si alguien te miente o si le gustas. (Enfoque: Psicología del comportamiento)." },
            { title: "Paradojas que te explotan la cabeza", description: "El gato de Schrödinger o la paradoja del abuelo explicadas fácil. (Enfoque: Filosofía y lógica)." },
            { title: "Mindfulness para Gamers", description: "Cómo controlar el \"Rage Quit\" y la frustración al perder. (Enfoque: Inteligencia emocional)." },
            { title: "Inglés de la Calle (Slang)", description: "Aprende las frases de las series y canciones que no salen en los libros de texto." },
            { title: "Banderas del Mundo (Vexilología)", description: "Por qué son como son y cómo diseñar una bandera propia. (Enfoque: Geografía y diseño)." },
            { title: "Supervivencia Básica", description: "Nudos, orientación sin brújula y potabilizar agua. (Enfoque: Escultismo y física aplicada)." },
            { title: "Mitos del Espacio", description: "¿Explotas en el vacío? ¿Hay sonido en el espacio? (Enfoque: Astronomía básica)." },
            { title: "Historia de las Zapatillas (Sneakerhead 101)", description: "De las Jordan a las Yeezy, el negocio y la cultura. (Enfoque: Historia cultural y marketing)." },
            { title: "Mecánica de Bicicletas", description: "Arregla un pinchazo y ajusta los frenos tú mismo. (Enfoque: Mecánica básica)." },
            { title: "Sector Aviación", description: "Para los que sueñan con las nubes o simplemente aman la ingeniería de los aviones." },
            { title: "La Brújula Política: ¿Dónde estás tú?", description: "El origen de la \"Izquierda\" y la \"Derecha\", qué significan liberalismo, socialismo, etc., y cómo leer un programa electoral." },
            { title: "Psicología del Scroll Infinito: Hackea tu cerebro", description: "Enseña cómo las apps de redes sociales usan la dopamina para mantenerte enganchado y cómo recuperar el control." },
            { title: "Ética de la IA: ¿Es arte lo que hace Midjourney?", description: "Un curso de debate sobre los derechos de autor, el futuro del trabajo y si una IA debería tener \"responsabilidad\"." },
            { title: "Digital Detective: Cómo detectar Fake News y estafas en segundos", description: "Aprende técnicas de \"Lectura Lateral\", búsqueda inversa de imágenes y cómo funcionan los algoritmos de burbuja." },
        ]
    },
];


function ExploreContent() {
    const [searchTerm, setSearchTerm] = useState('');

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
                        placeholder="Buscar cursos por palabra clave..."
                        className="w-full pl-12 h-14 text-base rounded-full shadow-lg border-2 border-primary/10 focus:border-primary/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
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
                                <Card key={course.title} className="hover:border-primary/50 transition-colors cursor-pointer hover:shadow-lg flex flex-col">
                                    <CardHeader>
                                        <CardTitle className="text-base">{course.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <CardDescription className="text-xs">{course.description}</CardDescription>
                                    </CardContent>
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
