
"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { FullScheduleView } from "@/components/layout/full-schedule-view";
import { fullSchedule } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookX } from "lucide-react";
import { useApp } from "@/lib/hooks/use-app";
import LoadingScreen from "@/components/layout/loading-screen";
import { SCHOOL_VERIFICATION_CODE } from "@/lib/constants";
import { useEffect, useState } from "react";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import type { Center } from "@/lib/types";


export default function ManageSchedulePage() {
    const { user } = useApp();
    const router = useRouter();
    const params = useParams();
    const centerId = params.centerId as string;
    const className = decodeURIComponent(params.className as string);
    const firestore = useFirestore();

    const centerDocRef = useMemoFirebase(() => {
        if (!firestore || !centerId) return null;
        return doc(firestore, 'centers', centerId);
    }, [firestore, centerId]);

    const { data: center, isLoading: isCenterLoading } = useDoc<Center>(centerDocRef);
    
    // For now, the only available schedule is hardcoded for a specific class
    const isScheduleHardcoded = center?.code === SCHOOL_VERIFICATION_CODE && className === '4ESO-B';

    if (!user || user.role !== 'admin' || isCenterLoading) {
        return <LoadingScreen />;
    }

    return (
        <div className="container mx-auto max-w-4xl p-4 sm:p-6">
            <header className="mb-8 flex items-center gap-4">
                 <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ChevronLeft />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold font-headline tracking-tighter sm:text-3xl">
                        Gestionar Horario
                    </h1>
                    <p className="text-muted-foreground">{center?.name} - {className}</p>
                </div>
            </header>
            
            <Card>
                <CardHeader>
                    <CardTitle>Horario de la Clase</CardTitle>
                    <CardDescription>
                       {isScheduleHardcoded 
                        ? "Este es el horario predefinido para esta clase. Próximamente podrás editarlo desde aquí."
                        : "Esta clase aún no tiene un horario predefinido. La funcionalidad para crearlo estará disponible pronto."
                       }
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0 sm:p-2">
                    {isScheduleHardcoded ? (
                        <FullScheduleView scheduleData={fullSchedule} />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12">
                            <BookX className="h-16 w-16 text-muted-foreground/50 mb-4" />
                            <p className="font-semibold text-lg">Horario no disponible</p>
                            <p className="text-muted-foreground max-w-sm">
                                Aún no se ha definido un horario para esta clase.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

    