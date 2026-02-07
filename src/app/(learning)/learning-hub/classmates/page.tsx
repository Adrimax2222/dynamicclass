"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { AvatarDisplay } from "@/components/profile/avatar-creator";
import { useApp } from "@/lib/hooks/use-app";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import type { User as AppUser } from "@/lib/types";
import { Badge } from "@/components/ui/badge";


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

    const courseMap: Record<string, string> = {
        "1eso": "1º ESO",
        "2eso": "2º ESO",
        "3eso": "3º ESO",
        "4eso": "4º ESO",
        "1bach": "1º Bachillerato",
        "2bach": "2º Bachillerato",
    };

    if (isLoading) {
        return (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-4 flex flex-col items-center text-center">
                            <Skeleton className="h-20 w-20 rounded-full mb-4" />
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-6 w-1/2" />
                        </CardContent>
                    </Card>
                ))}
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
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold font-headline tracking-tight">Compañeros de Clase</h2>
                <p className="text-muted-foreground">Conecta con los miembros de tu grupo.</p>
            </div>
             {classmates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                    {classmates.map(c => {
                        const formattedCourse = c.course && c.course !== 'default' && c.course !== 'personal'
                            ? `${courseMap[c.course] || c.course.toUpperCase()} - ${c.className}`
                            : "No está cursando nada";
                        
                        return (
                            <Card key={c.uid} className="overflow-hidden hover:shadow-lg transition-shadow">
                                <CardContent className="p-4 flex flex-col items-center text-center">
                                    <AvatarDisplay user={c} className="h-20 w-20 mb-4" />
                                    <p className="font-bold text-lg">{c.name}</p>
                                    <p className="text-xs text-muted-foreground mb-2">{c.email}</p>
                                    <Badge variant="secondary">{formattedCourse}</Badge>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center p-8 space-y-3 border-2 border-dashed rounded-lg max-w-lg mx-auto">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="font-semibold">No hay compañeros en esta clase</h3>
                    <p className="text-sm text-muted-foreground">Anima a tus compañeros a unirse con el código del centro.</p>
                </div>
            )}
        </div>
    );
}

export default function ClassmatesPage() {
    return (
        <div className="p-4 sm:p-6 md:p-8">
            <ClassmatesContent />
        </div>
    )
}
