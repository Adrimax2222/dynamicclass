
"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useApp } from "@/lib/hooks/use-app";
import LoadingScreen from "@/components/layout/loading-screen";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import type { Center } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function ManageSchedulePage() {
    const { user } = useApp();
    const router = useRouter();
    const params = useParams();
    const centerId = params.centerId as string;
    const className = decodeURIComponent(params.className as string);
    const firestore = useFirestore();
    const { toast } = useToast();

    const centerDocRef = useMemoFirebase(() => {
        if (!firestore || !centerId) return null;
        return doc(firestore, 'centers', centerId);
    }, [firestore, centerId]);

    const { data: center, isLoading: isCenterLoading } = useDoc<Center>(centerDocRef);
    
    const [icalUrl, setIcalUrl] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const classData = useMemo(() => {
        return center?.classes.find(c => c.name === className);
    }, [center, className]);

    useEffect(() => {
        if (classData) {
            setIcalUrl(classData.icalUrl || "");
        }
    }, [classData]);

    const handleSave = async () => {
        if (!firestore || !center || !classData) return;
        setIsSaving(true);
        
        const updatedClasses = center.classes.map(c => 
            c.name === className ? { ...c, icalUrl: icalUrl.trim() } : c
        );

        try {
            await updateDoc(centerDocRef, { classes: updatedClasses });
            toast({
                title: "Calendario actualizado",
                description: `Se ha guardado la URL del calendario para la clase ${className}.`,
            });
        } catch (error) {
            console.error("Error updating iCal URL:", error);
            toast({
                title: "Error",
                description: "No se pudo guardar la URL del calendario.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (!user || user.role !== 'admin' || isCenterLoading) {
        return <LoadingScreen />;
    }

    if (!isCenterLoading && !classData) {
         return (
            <div className="container mx-auto max-w-4xl p-4 sm:p-6">
                <header className="mb-8 flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ChevronLeft />
                    </Button>
                    <h1 className="text-2xl font-bold font-headline tracking-tighter sm:text-3xl text-destructive">
                        Clase no encontrada
                    </h1>
                </header>
                <p>No se pudo encontrar la clase "{className}" en el centro "{center?.name}".</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-4xl p-4 sm:p-6">
            <header className="mb-8 flex items-center gap-4">
                 <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ChevronLeft />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold font-headline tracking-tighter sm:text-3xl">
                        Gestionar Calendario
                    </h1>
                    <p className="text-muted-foreground">{center?.name} - {className}</p>
                </div>
            </header>
            
            <Card>
                <CardHeader>
                    <CardTitle>Calendario iCal de la Clase</CardTitle>
                    <CardDescription>
                       Pega la URL pública del calendario iCal para esta clase. Los eventos se sincronizarán automáticamente para los estudiantes.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>¿Cómo obtener la URL de iCal?</AlertTitle>
                        <AlertDescription className="text-xs space-y-1">
                           <p>1. En Google Calendar, ve a <strong>Configuración</strong> del calendario que quieres compartir.</p>
                           <p>2. Asegúrate de que en <strong>Permisos de acceso</strong> esté marcada la opción <strong>"Poner a disposición del público"</strong>.</p>
                           <p>3. En <strong>Integrar el calendario</strong>, copia la <strong>"Dirección URL pública en formato iCal"</strong>.</p>
                        </AlertDescription>
                    </Alert>
                    <div className="space-y-2">
                        <Label htmlFor="ical-url">URL del Calendario iCal</Label>
                        <Input 
                            id="ical-url"
                            placeholder="https://calendar.google.com/calendar/ical/..."
                            value={icalUrl}
                            onChange={(e) => setIcalUrl(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Guardar Cambios
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
