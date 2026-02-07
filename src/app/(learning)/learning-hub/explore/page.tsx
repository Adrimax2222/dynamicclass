"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, BrainCircuit, Code, Scale } from "lucide-react";

const courseCategories = [
    { title: "Ciencias", icon: BrainCircuit, color: "text-blue-500", courses: 5 },
    { title: "Tecnología", icon: Code, color: "text-green-500", courses: 8 },
    { title: "Humanidades", icon: BookOpen, color: "text-purple-500", courses: 7 },
    { title: "Artes", icon: Scale, color: "text-pink-500", courses: 4 },
];

function ExploreContent() {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold font-headline tracking-tight">Explora Nuevos Cursos</h2>
                <p className="text-muted-foreground">Amplía tus conocimientos y descubre nuevas pasiones.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {courseCategories.map(category => (
                    <Card key={category.title} className="hover:border-primary/50 transition-colors cursor-pointer hover:shadow-lg">
                        <CardHeader>
                            <category.icon className={`h-8 w-8 ${category.color}`} />
                        </CardHeader>
                        <CardContent>
                            <CardTitle className="text-base">{category.title}</CardTitle>
                            <CardDescription>{category.courses} cursos</CardDescription>
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
