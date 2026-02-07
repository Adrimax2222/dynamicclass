
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Rocket, TrendingUp, Palette, FlaskConical, Brain } from "lucide-react";

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
