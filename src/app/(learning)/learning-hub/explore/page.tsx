
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Leaf, Code, Users, TrendingUp, Brain, Palette } from "lucide-react";

const courseCategories = [
    { 
        title: "Ciencias Naturales", 
        icon: Leaf, 
        color: "text-green-500", 
        description: "Desde la biología molecular hasta la ecología de los ecosistemas." 
    },
    { 
        title: "Tecnología y Programación", 
        icon: Code, 
        color: "text-blue-500", 
        description: "Aprende a crear con código, desde apps hasta inteligencia artificial." 
    },
    { 
        title: "Humanidades y Sociedad", 
        icon: Users, 
        color: "text-purple-500", 
        description: "Explora la historia, la filosofía y las estructuras que nos definen." 
    },
    { 
        title: "Economía y Finanzas", 
        icon: TrendingUp, 
        color: "text-teal-500", 
        description: "Entiende el mundo del dinero, la inversión y el emprendimiento." 
    },
    { 
        title: "Bienestar y Psicología", 
        icon: Brain, 
        color: "text-pink-500", 
        description: "Herramientas para la gestión emocional y el autoconocimiento." 
    },
    { 
        title: "Artes y Creatividad", 
        icon: Palette, 
        color: "text-orange-500", 
        description: "Desarrolla tu lado creativo a través del diseño, la música o la escritura." 
    },
];

function ExploreContent() {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold font-headline tracking-tight">Explora Nuevos Cursos</h2>
                <p className="text-muted-foreground">Amplía tus conocimientos y descubre nuevas pasiones.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {courseCategories.map(category => (
                    <Card key={category.title} className="hover:border-primary/50 transition-colors cursor-pointer hover:shadow-lg flex flex-col">
                        <CardHeader>
                            <category.icon className={`h-8 w-8 ${category.color}`} />
                        </CardHeader>
                        <CardContent className="flex-1">
                            <CardTitle className="text-base">{category.title}</CardTitle>
                            <CardDescription className="mt-1 text-xs">{category.description}</CardDescription>
                        </CardContent>
                    </Card>
                ))}
            </div>
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
