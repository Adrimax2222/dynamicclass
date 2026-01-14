"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, updateDoc, writeBatch, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import type { Center } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, Save, ChevronLeft, Image as ImageIcon, Pin, RefreshCw, Trash2 } from "lucide-react";
import LoadingScreen from "@/components/layout/loading-screen";
import { useApp } from "@/lib/hooks/use-app";

export default function EditCenterPage() {
    const router = useRouter();
    const params = useParams();
    const centerId = params.id as string;
    const firestore = useFirestore();
    const { toast } = useToast();
    const { user: currentUser } = useApp();

    const centerDocRef = useMemoFirebase(() => {
        if (!firestore || !centerId) return null;
        return doc(firestore, "centers", centerId);
    }, [firestore, centerId]);

    const { data: center, isLoading: isLoadingCenter } = useDoc<Center>(centerDocRef);

    const [name, setName] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isUpdatingCode, setIsUpdatingCode] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (center) {
            setName(center.name);
            setImageUrl(center.imageUrl || "");
        }
    }, [center]);

    if (isLoadingCenter || !currentUser) {
        return <LoadingScreen />;
    }

    if (!center) {
        return (
            <div className="container mx-auto p-6">
                <h1 className="text-xl font-bold text-destructive">Centro no encontrado.</h1>
                <p className="text-muted-foreground">No se pudo cargar la información del centro.</p>
                <Button onClick={() => router.back()} className="mt-4">Volver</Button>
            </div>
        );
    }
    
    const handleSaveChanges = async () => {
        if (!firestore || !centerDocRef) return;
        setIsSaving(true);
        try {
            await updateDoc(centerDocRef, { 
                name: name,
                imageUrl: imageUrl 
            });
            toast({ title: "Cambios Guardados", description: "El nombre y la imagen del centro se han actualizado." });
        } catch (error) {
            toast({ title: "Error", description: "No se pudieron guardar los cambios.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleTogglePin = async () => {
        if (!firestore || !centerDocRef) return;
        try {
            await updateDoc(centerDocRef, { isPinned: !center.isPinned });
            toast({ title: center.isPinned ? "Centro Desanclado" : "Centro Anclado" });
        } catch (error) {
            toast({ title: "Error", description: "No se pudo cambiar el estado de anclaje.", variant: "destructive" });
        }
    };
    
    const generateCode = () => {
        return `${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`;
    };

    const handleUpdateCode = async () => {
        if (!firestore || !centerDocRef) return;
        setIsUpdatingCode(true);
        try {
            const newCode = generateCode();
            const usersQuery = query(collection(firestore, 'users'), where('organizationId', '==', center.uid));
            const usersSnapshot = await getDocs(usersQuery);

            const batch = writeBatch(firestore);
            batch.update(centerDocRef, { code: newCode });
            
            usersSnapshot.forEach(userDoc => {
                batch.update(userDoc.ref, { center: newCode });
            });
            
            await batch.commit();
            toast({ title: "Código Actualizado", description: `El nuevo código es ${newCode} y se ha actualizado para todos los miembros.` });
        } catch (error) {
            console.error("Error updating code:", error);
            toast({ title: "Error", description: "No se pudo actualizar el código.", variant: "destructive" });
        } finally {
            setIsUpdatingCode(false);
        }
    };

     const handleDeleteCenter = async () => {
        if (!firestore || !centerDocRef) return;
        setIsDeleting(true);
        try {
            await deleteDoc(centerDocRef);
            toast({ title: "Centro Eliminado", description: `El centro "${center.name}" ha sido eliminado.`, variant: "destructive" });
            router.push('/admin');
        } catch (error) {
             toast({ title: "Error", description: "No se pudo eliminar el centro.", variant: "destructive" });
             setIsDeleting(false);
        }
    };
    
    const isGlobalAdmin = currentUser.role === 'admin';

    return (
        <div className="container mx-auto max-w-2xl p-4 sm:p-6">
            <header className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                     <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ChevronLeft />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold font-headline tracking-tighter sm:text-3xl">
                            Editar Centro
                        </h1>
                        <p className="text-muted-foreground">{center.name}</p>
                    </div>
                </div>
                 <Button onClick={handleSaveChanges} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Guardar
                </Button>
            </header>

            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Información General</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="center-name">Nombre del Centro</Label>
                            <Input id="center-name" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="center-image">URL de la Imagen</Label>
                             <div className="relative">
                                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="center-image" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://ejemplo.com/logo.png" className="pl-10" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Acciones</CardTitle>
                         <CardDescription>Operaciones de gestión para el centro.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {isGlobalAdmin && (
                             <Button variant="outline" className="w-full justify-start gap-2" onClick={handleTogglePin}>
                                <Pin className="h-4 w-4"/> {center.isPinned ? 'Desanclar Centro' : 'Anclar Centro'}
                            </Button>
                        )}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" className="w-full justify-start gap-2 text-amber-600 border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 hover:text-amber-700">
                                    <RefreshCw className="h-4 w-4"/> Actualizar Código de Acceso
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>¿Actualizar el código?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                       Esta acción generará un nuevo código y actualizará automáticamente a todos los miembros actuales del centro. El código antiguo dejará de ser válido.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel disabled={isUpdatingCode}>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleUpdateCode} disabled={isUpdatingCode}>
                                        {isUpdatingCode && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                        Sí, actualizar
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>

                <Card className="border-destructive/50">
                    <CardHeader>
                         <CardTitle className="text-destructive">Zona Peligrosa</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full justify-start gap-2">
                                    <Trash2 className="h-4 w-4"/> Eliminar Centro
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>¿Eliminar este centro?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                       Esta acción es permanente. Se eliminará el centro y todas sus clases. Los usuarios que pertenezcan a este centro perderán el acceso al contenido específico del mismo.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteCenter} className="bg-destructive hover:bg-destructive/90" disabled={isDeleting}>
                                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                        Sí, eliminar permanentemente
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}