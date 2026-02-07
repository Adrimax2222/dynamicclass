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
             <div className="max-w-lg mx-auto space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
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
            <div className="max-w-lg mx-auto space-y-3">
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
