"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const myCoursesData = [
    { title: "Introducción a la Programación", progress: 75, category: "Tecnología" },
    { title: "Historia del Arte Moderno", progress: 40, category: "Artes" },
    { title: "Fundamentos de la Química", progress: 90, category: "Ciencias" },
];

function MyCoursesContent() {
    return (
        <div className="space-y-4">
             <div className="text-center">
                <h2 className="text-2xl font-bold font-headline tracking-tight">Mis Cursos</h2>
                <p className="text-muted-foreground">Continúa donde lo dejaste.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myCoursesData.map(course => (
                    <Card key={course.title} className="overflow-hidden">
                        <CardContent className="p-4">
                            <p className="text-xs font-semibold uppercase text-primary">{course.category}</p>
                            <h3 className="font-bold">{course.title}</h3>
                            <div className="flex items-center gap-4 mt-2">
                                <Progress value={course.progress} className="w-full h-2" />
                                <span className="text-sm font-semibold">{course.progress}%</span>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/50 p-3">
                            <Button size="sm" className="w-full">Continuar Curso</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default function MyCoursesPage() {
    return (
        <div className="p-4 sm:p-6 md:p-8">
            <MyCoursesContent />
        </div>
    );
}
