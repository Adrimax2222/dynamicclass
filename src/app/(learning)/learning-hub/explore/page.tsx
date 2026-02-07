"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Rocket, TrendingUp, Palette, FlaskConical, Brain, Zap, Wand2, Users, Globe, ShieldCheck, Gamepad2, BrainCircuit, Smartphone, Monitor, Code, Scale, Heart } from "lucide-react";

const courseSections = [
    {
        category: "Tecnología y Futuro (Hard Skills)",
        description: "Estos cursos transforman la informática tradicional en herramientas de poder.",
        icon: Rocket,
        color: "text-indigo-500",
        courses: [
            { title: "Hacking Ético y Ciberseguridad Básica", description: "Aprende a proteger redes pensando como un hacker. (Enfoque: Lógica informática y seguridad)." },
            { title: "Inteligencia Artificial Generativa (Prompt Engineering)", description: "Cómo dominar ChatGPT y Midjourney para investigar y crear. (Enfoque: Lógica semántica y tecnología)." },
            { title: "Desarrollo de Videojuegos 2D con Unity", description: "De la idea al código C#. (Enfoque: Programación y física mecánica)." },
            { title: "Robótica con Arduino", description: "Construye y programa tu primer autómata. (Enfoque: Ingeniería electrónica y código)." },
            { title: "Ciencia de Datos aplicada al Fútbol/Deportes", description: "Analiza estadísticas y predice resultados. (Enfoque: Estadística y Big Data)." },
        ]
    },
    {
        category: "Finanzas y Emprendimiento",
        description: "La educación financiera es una de las mayores demandas de los jóvenes hoy en día.",
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
        category: "Creatividad y Comunicación Digital",
        description: "Cursos que profesionalizan sus hobbies artísticos.",
        icon: Palette,
        color: "text-orange-500",
        courses: [
            { title: "Escritura Creativa para Guiones de Series y Cine", description: "Estructura narrativa y creación de personajes. (Enfoque: Literatura y dramaturgia)." },
            { title: "Producción Musical (Home Studio)", description: "Teoría musical y mezcla digital. (Enfoque: Música y física del sonido)." },
            { title: "Diseño Gráfico para Redes Sociales", description: "Psicología del color y composición visual. (Enfoque: Artes visuales y marketing)." },
            { title: "Oratoria y Debate Competitivo", description: "Técnicas para hablar en público y ganar discusiones. (Enfoque: Retórica y lógica argumentativa)." },
        ]
    },
    {
        category: "Ciencia y Humanidades Modernas",
        description: "Temas académicos clásicos con un \"giro\" moderno.",
        icon: FlaskConical,
        color: "text-purple-500",
        courses: [
            { title: "La Física de los Superhéroes", description: "Entendiendo a Newton a través de Marvel y DC. (Enfoque: Física clásica)." },
            { title: "Bioética y Genética (CRISPR)", description: "¿Debemos editar el ADN humano? (Enfoque: Biología y ética filosófica)." },
            { title: "Historia a través de los Videojuegos", description: "La Segunda Guerra Mundial o la Edad Media vistas desde \"Call of Duty\" o \"Age of Empires\". (Enfoque: Historia universal)." },
            { title: "Japonés Básico a través del Anime y Manga", description: "Introducción al idioma y cultura. (Enfoque: Lingüística)." },
        ]
    },
    {
        category: "Vida Práctica y Bienestar (Soft Skills)",
        description: "Habilidades para la vida adulta (\"Adulting\") y salud mental.",
        icon: Brain,
        color: "text-pink-500",
        courses: [
            { title: "Neurociencia del Aprendizaje", description: "Hackea tu cerebro para estudiar menos y aprender más. (Enfoque: Psicología cognitiva y técnicas de estudio)." },
            { title: "Nutrición Deportiva Real", description: "Bioquímica de los alimentos vs. mitos de internet. (Enfoque: Biología y salud)." },
            { title: "Sostenibilidad y Moda", description: "El impacto ambiental de la ropa (Fast Fashion) y el Upcycling. (Enfoque: Ecología y sociología)." },
            { title: "\"Adulting\" Starter Pack: Cosas que el colegio olvidó", description: "Cómo leer un contrato de alquiler, qué es una factura de la luz, cómo se pide una cita médica solo y qué hacer si pierdes el DNI." },
        ]
    },
     {
        category: "Inteligencia Emocional y Mental",
        description: "Para entender qué pasa por la cabeza cuando todo parece un lío.",
        icon: Brain,
        color: "text-teal-500",
        courses: [
            { title: "Inteligencia Emocional: \"Modo Pro\"", description: "Cómo identificar qué sientes (¿es rabia o es tristeza?), técnicas para que una emoción no te arruine el día y cómo responder en lugar de reaccionar." },
            { title: "Braintuning: El Manual contra la Ansiedad y el Estrés", description: "Por qué el cerebro se bloquea antes de un examen o una cita, y ejercicios prácticos (como la respiración 4-7-8) para bajar las revoluciones en 60 segundos." },
        ]
    },
    {
        category: "Cuerpo, Identidad y Relaciones",
        description: "Sin filtros, centrado en el respeto y la realidad.",
        icon: Heart,
        color: "text-rose-500",
        courses: [
            { title: "Cuerpo y Relaciones: Lo que no sale en las películas (ni en el porno)", description: "La realidad de los cuerpos (diversidad, vello, estrías), el concepto de consentimiento real, cómo poner límites sin sentir culpa y salud sexual básica desde la prevención y el autocuidado." },
            { title: "Amor Propio vs. El Espejo de Instagram", description: "Cómo los filtros y la edición afectan nuestra percepción, la diferencia entre \"quererse\" y ser narcisista, y cómo construir una relación sana con tu propia imagen." },
        ]
    },
    {
        category: "Socializar y Cultura del \"Clout\"",
        description: "Para navegar la jungla social de hoy en día.",
        icon: Users,
        color: "text-cyan-500",
        courses: [
            { title: "Socializar en la Era del Algoritmo: El Arte de Conectar", description: "Cómo iniciar una conversación sin que sea \"awkward\", cómo leer el lenguaje corporal en una fiesta y la diferencia entre tener muchos \"seguidores\" y tener amigos reales." },
            { title: "Presión Social y \"Clout\": ¿Lo haces porque quieres o por el vídeo?", description: "Por qué buscamos llamar la atención (la dopamina del reconocimiento), cómo decir \"no\" cuando todo el grupo hace algo que no te late, y el análisis de las polémicas virales (¿por qué nos enganchan?)." },
            { title: "Marca Personal: Tú eres un logo (aunque no lo sepas)", description: "Todo lo que publicas en internet es tu CV del futuro. Cómo crear una imagen digital que te abra puertas en lugar de cerrarlas, sin dejar de ser tú mismo." },
        ]
    },
    {
        category: "Habilidades Digitales \"Cool\" & Rápidas",
        description: "Cosas que pueden usar ya mismo en sus móviles.",
        icon: Zap,
        color: "text-yellow-500",
        courses: [
            { title: "Edición Viral con CapCut", description: "Trucos de edición, transiciones y efectos para TikTok/Reels. (Enfoque: Narrativa audiovisual)." },
            { title: "Crea tus propios Filtros de Instagram/TikTok", description: "Introducción a Spark AR. (Enfoque: Diseño y realidad aumentada básica)." },
            { title: "Pixel Art", description: "Aprende a dibujar estilo \"retro\" 8-bit para videojuegos o iconos. (Enfoque: Arte digital y geometría)." },
            { title: "Google Hacking", description: "Aprende a buscar en Google como un pro (comandos para encontrar archivos ocultos, PDFs, etc.). (Enfoque: Investigación y gestión de información)." },
            { title: "Seguridad de Contraseñas", description: "Cómo crear claves invencibles y gestionar tus cuentas. (Enfoque: Higiene digital)." },
        ]
    },
    {
        category: "Creatividad y \"Flow\"",
        description: "Arte y expresión, pero sin la teoría aburrida.",
        icon: Wand2,
        color: "text-rose-500",
        courses: [
            { title: "Cómo escribir barras de Rap/Trap", description: "Rimas, métrica y figuras retóricas (metáforas, similes). (Enfoque: Poesía y literatura)." },
            { title: "Stop Motion con tu Móvil", description: "Anima tus Legos o muñecos frame a frame. (Enfoque: Principios de animación)." },
            { title: "Lettering y Apuntes Bonitos", description: "Mejora tu letra y organiza tus cuadernos. (Enfoque: Caligrafía y diseño)." },
            { title: "Fotografía de Producto con el Móvil", description: "Haz que tus zapatillas o comida se vean de anuncio para venderlas en Vinted/Wallapop. (Enfoque: Iluminación y composición)." },
            { title: "Customiza tu Ropa (Upcycling)", description: "Pintura textil y cortes básicos para renovar camisetas viejas. (Enfoque: Diseño de moda y sostenibilidad)." },
        ]
    },
    {
        category: "Habilidades Sociales y Mentales",
        description: "Trucos psicológicos y lógicos fáciles de digerir.",
        icon: Users,
        color: "text-cyan-500",
        courses: [
            { title: "Lenguaje Corporal Básico", description: "Cómo saber si alguien te miente o si le gustas. (Enfoque: Psicología del comportamiento)." },
            { title: "Detectar Falacias Lógicas", description: "Que no te engañen en una discusión (el hombre de paja, ad hominem, etc.). (Enfoque: Lógica y pensamiento crítico)." },
            { title: "Paradojas que te explotan la cabeza", description: "El gato de Schrödinger o la paradoja del abuelo explicadas fácil. (Enfoque: Filosofía y lógica)." },
            { title: "Mindfulness para Gamers", description: "Cómo controlar el \"Rage Quit\" y la frustración al perder. (Enfoque: Inteligencia emocional)." },
            { title: "Inglés de la Calle (Slang)", description: "Aprende las frases de las series y canciones que no salen en los libros de texto. (Enfoque: Sociolingüística)." },
        ]
    },
    {
        category: "Curiosidades y Mundo Real",
        description: "Cultura general, pero divertida.",
        icon: Globe,
        color: "text-lime-500",
        courses: [
            { title: "Banderas del Mundo (Vexilología)", description: "Por qué son como son y cómo diseñar una bandera propia. (Enfoque: Geografía y diseño)." },
            { title: "Supervivencia Básica", description: "Nudos, orientación sin brújula y potabilizar agua. (Enfoque: Escultismo y física aplicada)." },
            { title: "Mitos del Espacio", description: "¿Explotas en el vacío? ¿Hay sonido en el espacio? (Enfoque: Astronomía básica)." },
            { title: "Historia de las Zapatillas (Sneakerhead 101)", description: "De las Jordan a las Yeezy, el negocio y la cultura. (Enfoque: Historia cultural y marketing)." },
            { title: "Mecánica de Bicicletas", description: "Arregla un pinchazo y ajusta los frenos tú mismo. (Enfoque: Mecánica básica)." },
        ]
    },
    {
        category: "Cursos de Autodefensa Digital",
        description: "Aprende a proteger tu identidad y tus datos en el mundo online.",
        icon: ShieldCheck,
        color: "text-slate-500",
        courses: [
            { title: "Tu Identidad bajo Candado: El Triángulo de Seguridad", description: "Protege tus cuentas de Google, Apple y Microsoft. Aprende a configurar 2FA, usar llaves físicas o biometría y revisar quién tiene acceso a tus cuentas." },
            { title: "IA sin Huella: Privacidad con ChatGPT y Midjourney", description: "Usa la IA de forma inteligente y privada. Aprende a usar el 'Modo Incógnito' en ChatGPT, a no subir archivos sensibles y a detectar Deepfakes." },
            { title: "CSI Redes Sociales: Privacidad Extrema", description: "Controla quién puede verte en Instagram y TikTok. Evita que te encuentren por tu número, limpia la ubicación de tus fotos y gestiona permisos de apps." },
            { title: "Manual de Supervivencia en la Calle: Wifi, QR y Enlaces", description: "Aprende a evitar los peligros del mundo físico. No uses Wi-Fis públicas para tu banco, identifica códigos QR maliciosos y enlaces falsos." },
        ]
    },
    {
        category: "Sector Aviación",
        description: "Para los que sueñan con las nubes o simplemente aman la ingeniería de los aviones.",
        icon: Rocket,
        color: "text-sky-500",
        courses: [
            { title: "Aviation Masterclass: De Pasajero a Capitán", description: "Principios de aerodinámica, cómo leer una cabina 'Glass Cockpit' y fases de un vuelo en simulador. Nivel Pro: Rutas IFR, navegación por radio y emergencias." },
        ]
    },
    {
        category: "Creación de Videojuegos",
        description: "Aprovechando que ya pasan tiempo ahí, ¡que aprendan a crearlo!",
        icon: Gamepad2,
        color: "text-red-500",
        courses: [
            { title: "Roblox Studio: Crea tu primer juego viral", description: "Interfaz de Roblox Studio, construcción de mapas con 'Parts' y nociones básicas de Luau para crear trampas, tiendas y sistemas de puntos." },
        ]
    },
    {
        category: "Inteligencia Artificial",
        description: "Desmitificando la \"magia\" para entender la lógica.",
        icon: BrainCircuit,
        color: "text-blue-500",
        courses: [
            { title: "¿Cómo piensa una IA? Redes Neuronales con Pizza", description: "Aprende Machine Learning, algoritmos y LLMs con ejemplos visuales y sencillos." },
        ]
    },
     {
        category: "Hardware: Móviles y Gadgets",
        description: "Para los que siempre miran las \"specs\" antes de comprar.",
        icon: Smartphone,
        color: "text-gray-500",
        courses: [
            { title: "Smartphone Anatomy: Chips, Sensores y Cámaras", description: "Diferencias entre procesadores, qué hace un sensor de 108MP y cómo leer una comparativa sin que te engañe el marketing." },
        ]
    },
    {
        category: "Hardware: El Mundo del PC",
        description: "El curso definitivo para cualquier \"Gamer\" o futuro editor de vídeo.",
        icon: Monitor,
        color: "text-gray-700",
        courses: [
            { title: "PC Master Builder: Hardware y Optimización total", description: "Elige componentes según tu presupuesto (CPU, GPU, RAM), móntalos y configura el software (BIOS, Drivers) para que el PC vuele." },
        ]
    },
    {
        category: "Programación Práctica",
        description: "Aprende a programar con proyectos reales y útiles desde el primer día.",
        icon: Code,
        color: "text-green-500",
        courses: [
            { title: "Python para \"Lazy People\": Automatiza tus tareas", description: "Crea un bot de ofertas, organiza tus carpetas automáticamente o haz un raspado de datos de una web." },
            { title: "HTML & CSS: Tu primera Web desde cero", description: "Aprende la estructura de internet (etiquetas HTML) y el diseño visual (CSS) para publicar tu propia página personal online." },
            { title: "Arduino Makers: Electrónica que cobra vida", description: "Usa la 'protoboard' y programa sensores de movimiento, luces LED rítmicas o un termómetro digital." },
        ]
    },
    {
        category: "Sistemas Operativos (SO)",
        description: "No es solo \"qué botones apretar\", sino entender el motor que mueve tu mundo.",
        icon: Monitor,
        color: "text-gray-700",
        courses: [
            { title: "Duelo de Sistemas: Windows, macOS o Linux, ¿cuál es tu \"Main\"?", description: "Cómo funciona el Kernel (el corazón del sistema), la gestión de archivos y la privacidad de datos. Incluye un test interactivo para encontrar tu SO ideal: ¿Eres un Power User (Linux), un creador (Mac) o un todoterreno (Windows)?" },
        ]
    },
    {
        category: "Programación Visual (STEAM)",
        description: "Perfecto para los que quieren ver resultados físicos sin pelearse con el código escrito todavía.",
        icon: Wand2,
        color: "text-rose-500",
        courses: [
            { title: "Arduino STEAMakers: Programación por Bloques para Inventores", description: "La lógica de programación (bucles, variables, condicionales) usando el entorno de ArduinoBlocks. Aprenderán a conectar la placa STEAMakers para encender luces, mover motores o leer sensores ambientales sin escribir ni una línea de código." },
        ]
    },
    {
        category: "Verdad vs. Mentira en Internet",
        description: "Habilidades de detective para no ser manipulado.",
        icon: ShieldCheck,
        color: "text-slate-500",
        courses: [
            { title: "Digital Detective: Cómo detectar Fake News y estafas en segundos", description: "Técnicas de \"Lectura Lateral\" (investigar quién dice qué), búsqueda inversa de imágenes para ver si una foto es vieja o falsa, y cómo funcionan los algoritmos de las redes para encerrarte en una \"burbuja de eco\"." },
        ]
    },
    {
        category: "Política y Sociedad (Neutral y Claro)",
        description: "Para entender de qué hablan los adultos y formar tu propia opinión.",
        icon: Scale,
        color: "text-cyan-500",
        courses: [
            { title: "La Brújula Política: ¿Dónde estás tú?", description: "El origen de la \"Izquierda\" y la \"Derecha\" (desde la Revolución Francesa), qué significan conceptos como liberalismo, socialismo o conservadurismo, y cómo leer un programa electoral para saber qué apoyan realmente." },
            { title: "Economía de Bolsillo: Impuestos, IVA y tu primer sueldo", description: "Explica de forma simple qué es el IVA que pagan al comprar un juego, por qué el gobierno quita una parte del sueldo (IRPF) y cómo funciona un banco por dentro." },
            { title: "Psicología del Scroll Infinito: Hackea tu cerebro", description: "Enseña cómo las apps de redes sociales usan el sistema de recompensa (dopamina) para mantenerte enganchado y cómo recuperar el control de tu tiempo." },
            { title: "Ética de la IA: ¿Es arte lo que hace Midjourney?", description: "Un curso de debate sobre los derechos de autor, el futuro del trabajo y si una IA debería tener \"responsabilidad\" por sus actos." },
        ]
    }
];

function ExploreContent() {
    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold font-headline tracking-tight">Explora Nuevos Cursos</h2>
                <p className="text-muted-foreground">Amplía tus conocimientos y descubre nuevas pasiones.</p>
            </div>

            {courseSections.map(section => (
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
            ))}
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
