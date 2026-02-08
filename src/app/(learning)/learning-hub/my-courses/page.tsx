
"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/hooks/use-app";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { ReservedCourse } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function MyCoursesContent() {
    const { user } = useApp();
    const firestore = useFirestore();

    const reservedCoursesQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, `users/${user.uid}/reservedCourses`),
            orderBy("reservedAt", "desc")
        );
    }, [user, firestore]);

    const { data: myCourses = [], isLoading } = useCollection<ReservedCourse>(reservedCoursesQuery);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                        <CardContent className="p-4">
                            <Skeleton className="h-4 w-1/4 mb-2" />
                            <Skeleton className="h-6 w-3/4 mb-4" />
                            <Skeleton className="h-2 w-full" />
                        </CardContent>
                        <CardFooter className="bg-muted/50 p-3">
                            <Skeleton className="h-8 w-full" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        );
    }
    
    if (myCourses.length === 0) {
        return (
            <div className="text-center p-8 space-y-3 border-2 border-dashed rounded-lg max-w-lg mx-auto">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="font-semibold">No tienes cursos reservados</h3>
                <p className="text-sm text-muted-foreground">Ve a la sección "Explorar" para reservar tu primer curso.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
             <div className="text-center">
                <h2 className="text-2xl font-bold font-headline tracking-tight">Mis Cursos</h2>
                <p className="text-muted-foreground">Continúa donde lo dejaste.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myCourses.map(course => (
                    <Card key={course.uid} className="overflow-hidden">
                        <CardContent className="p-4">
                            <p className="text-xs font-semibold uppercase text-primary">{course.category}</p>
                            <h3 className="font-bold">{course.courseTitle}</h3>
                            <div className="flex items-center gap-4 mt-2">
                                <Progress value={course.progress} className="w-full h-2" />
                                <span className="text-sm font-semibold">{course.progress}%</span>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/50 p-3 flex justify-between items-center">
                            <Badge variant="secondary">Próximamente</Badge>
                            <Button size="sm" disabled>Continuar</Button>
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
