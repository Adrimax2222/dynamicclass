"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Compass, BookUser, Users, BookOpen, BrainCircuit, Code, Scale } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AvatarDisplay } from "@/components/profile/avatar-creator";
import { useApp } from "@/lib/hooks/use-app";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import type { User as AppUser } from "@/lib/types";

// Placeholder data
const courseCategories = [
    { title: "Ciencias", icon: BrainCircuit, color: "text-blue-500", courses: 5 },
    { title: "Tecnología", icon: Code, color: "text-green-500", courses: 8 },
    { title: "Humanidades", icon: BookOpen, color: "text-purple-500", courses: 7 },
    { title: "Artes", icon: Scale, color: "text-pink-500", courses: 4 },
];

const myCoursesData = [
    { title: "Introducción a la Programación", progress: 75, category: "Tecnología" },
    { title: "Historia del Arte Moderno", progress: 40, category: "Artes" },
    { title: "Fundamentos de la Química", progress: 90, category: "Ciencias" },
];


function ExploreContent() {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold font-headline tracking-tight">Explora Nuevos Cursos</h2>
                <p className="text-muted-foreground">Amplía tus conocimientos y descubre nuevas pasiones.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
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

function MyCoursesContent() {
    return (
        <div className="space-y-4">
             <div className="text-center">
                <h2 className="text-2xl font-bold font-headline tracking-tight">Mis Cursos</h2>
                <p className="text-muted-foreground">Continúa donde lo dejaste.</p>
            </div>
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
    );
}

function ClassmatesContent() {
    const { user } = useApp();
    const firestore = useFirestore();
    const isPersonalUser = user?.center === 'personal' || user?.center === 'default';

    const classmatesQuery = useMemoFirebase(() => {
        if (!firestore || !user || isPersonalUser) return null;
        return query(
            collection(firestore, "users"),
            where("organizationId", "==", user.organizationId),
            where("course", "==", user.course),
            where("className", "==", user.className)
        );
    }, [firestore, user, isPersonalUser]);

    const { data: classmatesData, isLoading } = useCollection<AppUser>(classmatesQuery);

    const classmates = useMemo(() => {
        if (!classmatesData) return [];
        return classmatesData.sort((a, b) => a.name.localeCompare(b.name));
    }, [classmatesData]);

    if (isLoading) {
        return (
             <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        )
    }

    if (isPersonalUser) {
        return (
            <div className="text-center p-8 space-y-3">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="font-semibold">No estás en una clase</h3>
                <p className="text-sm text-muted-foreground">Únete a un centro para ver a tus compañeros de clase.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="text-center">
                <h2 className="text-2xl font-bold font-headline tracking-tight">Compañeros de Clase</h2>
                <p className="text-muted-foreground">Conecta con los miembros de tu grupo.</p>
            </div>
            {classmates.map(c => (
                <Card key={c.uid}>
                    <CardContent className="p-3 flex items-center gap-4">
                        <AvatarDisplay user={c} className="h-12 w-12" />
                        <div>
                            <p className="font-semibold">{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.email}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}


export default function LearningHubPage() {
    return (
        <div className="p-4 sm:p-6">
            <Tabs defaultValue="explore" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="explore"><Compass className="h-4 w-4 mr-2"/>Explorar</TabsTrigger>
                    <TabsTrigger value="my-courses"><BookUser className="h-4 w-4 mr-2"/>Mis Cursos</TabsTrigger>
                    <TabsTrigger value="classmates"><Users className="h-4 w-4 mr-2"/>Compañeros</TabsTrigger>
                </TabsList>
                <TabsContent value="explore">
                    <ExploreContent />
                </TabsContent>
                <TabsContent value="my-courses">
                    <MyCoursesContent />
                </TabsContent>
                <TabsContent value="classmates">
                    <ClassmatesContent />
                </TabsContent>
            </Tabs>
        </div>
    )
}
