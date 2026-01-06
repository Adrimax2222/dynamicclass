
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2, Save, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useApp } from "@/lib/hooks/use-app";
import LoadingScreen from "@/components/layout/loading-screen";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import type { Center, Schedule, ScheduleEntry } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const weekDays: (keyof Schedule)[] = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

const defaultEntry: Omit<ScheduleEntry, 'id'> = { subject: '', time: '', teacher: '', room: '', details: '' };

export default function EditSchedulePage() {
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
    
    const [schedule, setSchedule] = useState<Schedule | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (center) {
            const classData = center.classes.find(c => c.name === className);
            if (classData?.schedule) {
                setSchedule(classData.schedule);
            } else {
                setSchedule({ Lunes: [], Martes: [], Miércoles: [], Jueves: [], Viernes: [] });
            }
        }
    }, [center, className]);

    const handleScheduleChange = (day: keyof Schedule, index: number, field: keyof ScheduleEntry, value: string) => {
        if (!schedule) return;
        const newSchedule = { ...schedule };
        const daySchedule = [...newSchedule[day]];
        daySchedule[index] = { ...daySchedule[index], [field]: value };
        newSchedule[day] = daySchedule;
        setSchedule(newSchedule);
    };

    const addScheduleEntry = (day: keyof Schedule) => {
        if (!schedule) return;
        const newSchedule = { ...schedule };
        newSchedule[day] = [...newSchedule[day], { id: Date.now().toString(), ...defaultEntry }];
        setSchedule(newSchedule);
    };
    
    const removeScheduleEntry = (day: keyof Schedule, index: number) => {
        if (!schedule) return;
        const newSchedule = { ...schedule };
        const daySchedule = [...newSchedule[day]];
        daySchedule.splice(index, 1);
        newSchedule[day] = daySchedule;
        setSchedule(newSchedule);
    };


    const handleSave = async () => {
        if (!firestore || !center || !schedule) return;
        setIsSaving(true);
        
        const updatedClasses = center.classes.map(c => 
            c.name === className ? { ...c, schedule } : c
        );

        try {
            await updateDoc(centerDocRef!, { classes: updatedClasses });
            toast({
                title: "Horario actualizado",
                description: `Se ha guardado el horario para la clase ${className}.`,
            });
        } catch (error) {
            console.error("Error updating schedule:", error);
            toast({
                title: "Error",
                description: "No se pudo guardar el horario.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };
    
    if (!user || user.role !== 'admin' || isCenterLoading || schedule === null) {
        return <LoadingScreen />;
    }

    if (!isCenterLoading && !center?.classes.some(c => c.name === className)) {
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
            <header className="mb-8 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ChevronLeft />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold font-headline tracking-tighter sm:text-3xl">
                            Editar Horario
                        </h1>
                        <p className="text-muted-foreground">{center?.name} - {className}</p>
                    </div>
                 </div>
                 <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Guardar Cambios
                </Button>
            </header>
            
            <Card>
                <CardContent className="p-4">
                    <Tabs defaultValue="Lunes" className="w-full">
                        <TabsList className="grid w-full grid-cols-5">
                            {weekDays.map(day => (
                                <TabsTrigger key={day} value={day}>{day.substring(0,3)}</TabsTrigger>
                            ))}
                        </TabsList>
                        {weekDays.map(day => (
                            <TabsContent key={day} value={day}>
                                <div className="space-y-4 pt-4">
                                     {schedule[day].length === 0 && (
                                        <p className="text-center text-muted-foreground py-8">No hay clases para este día.</p>
                                     )}
                                     {schedule[day].map((entry, index) => (
                                        <div key={entry.id} className="p-4 border rounded-lg space-y-3 relative">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute -top-3 -right-3 h-7 w-7 bg-muted text-muted-foreground hover:bg-destructive hover:text-destructive-foreground rounded-full"
                                                onClick={() => removeScheduleEntry(day, index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <Label htmlFor={`${day}-${index}-subject`}>Asignatura</Label>
                                                    <Input id={`${day}-${index}-subject`} value={entry.subject} onChange={e => handleScheduleChange(day, index, 'subject', e.target.value)} />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label htmlFor={`${day}-${index}-time`}>Hora</Label>
                                                    <Input id={`${day}-${index}-time`} value={entry.time} onChange={e => handleScheduleChange(day, index, 'time', e.target.value)} placeholder="08:15 - 09:10" />
                                                </div>
                                            </div>
                                             <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <Label htmlFor={`${day}-${index}-teacher`}>Profesor</Label>
                                                    <Input id={`${day}-${index}-teacher`} value={entry.teacher} onChange={e => handleScheduleChange(day, index, 'teacher', e.target.value)} />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label htmlFor={`${day}-${index}-room`}>Aula</Label>
                                                    <Input id={`${day}-${index}-room`} value={entry.room} onChange={e => handleScheduleChange(day, index, 'room', e.target.value)} />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor={`${day}-${index}-details`}>Detalles (Opcional)</Label>
                                                <Input id={`${day}-${index}-details`} value={entry.details || ''} onChange={e => handleScheduleChange(day, index, 'details', e.target.value)} />
                                            </div>
                                        </div>
                                     ))}
                                     <Button variant="outline" className="w-full border-dashed" onClick={() => addScheduleEntry(day)}>
                                        <Plus className="h-4 w-4 mr-2" /> Añadir bloque
                                     </Button>
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
