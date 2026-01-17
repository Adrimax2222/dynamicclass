"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import type { Center, ClassDefinition } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, ChevronLeft, Image as ImageIcon } from "lucide-react";
import LoadingScreen from "@/components/layout/loading-screen";
import { useApp } from "@/lib/hooks/use-app";
import { AvatarDisplay } from "@/components/profile/avatar-creator";

export default function EditClassPage() {
    const router = useRouter();
    const params = useParams();
    const centerId = params.id as string;
    const className = decodeURIComponent(params.className as string);
    const firestore = useFirestore();
    const { toast } = useToast();
    const { user: currentUser } = useApp();

    const centerDocRef = useMemoFirebase(() => {
        if (!firestore || !centerId) return null;
        return doc(firestore, "centers", centerId);
    }, [firestore, centerId]);

    const { data: center, isLoading: isLoadingCenter } = useDoc<Center>(centerDocRef);

    const [classData, setClassData] = useState<ClassDefinition | null>(null);
    const [name, setName] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (center) {
            const foundClass = center.classes.find(c => c.name === className);
            if (foundClass) {
                setClassData(foundClass);
                setName(foundClass.name);
                setImageUrl(foundClass.imageUrl || "");
            }
        }
    }, [center, className]);

    const handleSaveChanges = async () => {
        if (!firestore || !centerDocRef || !center || !classData) return;
        setIsSaving(true);
        try {
            const updatedClasses = center.classes.map(c => 
                c.name === className 
                ? { ...c, name: name, imageUrl: imageUrl }
                : c
            );

            await updateDoc(centerDocRef, { classes: updatedClasses });
            toast({ title: "Cambios Guardados", description: "La información de la clase se ha actualizado." });
            
            if (name !== className) {
                router.replace(`/admin/groups/${centerId}/${encodeURIComponent(name)}/edit`);
            }
        } catch (error) {
            toast({ title: "Error", description: "No se pudieron guardar los cambios.", variant: "destructive" });
            console.error("Error saving class changes:", error);
        } finally {
            setIsSaving(false);
        }
    };
    
    const isGlobalAdmin = currentUser?.role === 'admin';
    const classAdminRoleName = currentUser?.role.startsWith('admin-') ? currentUser.role.substring('admin-'.length) : null;
    const isClassAdminForThisClass = classAdminRoleName === className;
    const canEdit = isGlobalAdmin || isClassAdminForThisClass;

    if (isLoadingCenter || !currentUser) {
        return <LoadingScreen />;
    }

    if (!canEdit) {
        return (
            <div className="container mx-auto p-6">
                <h1 className="text-xl font-bold text-destructive">Acceso Denegado</h1>
                <p className="text-muted-foreground">No tienes permisos para editar esta clase.</p>
                <Button onClick={() => router.back()} className="mt-4">Volver</Button>
            </div>
        );
    }
    
    if (!center || !classData) {
        return (
            <div className="container mx-auto p-6">
                <h1 className="text-xl font-bold text-destructive">Clase no encontrada.</h1>
                <p className="text-muted-foreground">No se pudo cargar la información de la clase.</p>
                <Button onClick={() => router.back()} className="mt-4">Volver</Button>
            </div>
        );
    }
    

    return (
        <div className="container mx-auto max-w-2xl p-4 sm:p-6">
            <header className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                     <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ChevronLeft />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold font-headline tracking-tighter sm:text-3xl">
                            Editar Clase
                        </h1>
                        <p className="text-muted-foreground">{className}</p>
                    </div>
                </div>
                 <Button onClick={handleSaveChanges} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Guardar
                </Button>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Información de la Clase</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex justify-center">
                         <AvatarDisplay user={{ avatar: imageUrl, name: name }} className="h-32 w-32" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="class-name">Nombre de la Clase</Label>
                        <Input id="class-name" value={name} onChange={(e) => setName(e.target.value)} />
                        <p className="text-xs text-muted-foreground">¡Cuidado! Cambiar el nombre puede afectar a los permisos de administrador de clase.</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="class-image">URL de la Imagen del Grupo</Label>
                         <div className="relative">
                            <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input id="class-image" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://ejemplo.com/logo.png" className="pl-10" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
