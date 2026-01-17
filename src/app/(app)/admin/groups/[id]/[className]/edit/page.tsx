
"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFirestore, useDoc, useMemoFirebase, useCollection } from "@/firebase";
import { doc, updateDoc, collection, writeBatch, getDocs, query, where } from "firebase/firestore";
import type { Center, ClassDefinition, User as CenterUser } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, ChevronLeft, Image as ImageIcon, Upload, Link as LinkIcon, Palette, Trash2, History, MicOff } from "lucide-react";
import LoadingScreen from "@/components/layout/loading-screen";
import { useApp } from "@/lib/hooks/use-app";
import { AvatarDisplay } from "@/components/profile/avatar-creator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WipDialog } from "@/components/layout/wip-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Constants for avatar creation
const AVATAR_COLORS = [
    { name: 'Gris', value: '737373' },
    { name: 'Rojo', value: 'F87171' },
    { name: 'Verde', value: '34D399' },
    { name: 'Azul', value: '60A5FA' },
    { name: 'Rosa', value: 'F472B6' },
    { name: 'Morado', value: 'A78BFA' },
    { name: 'Amarillo', value: 'FBBF24' },
    { name: 'Naranja', value: 'F97316' },
    { name: 'Cian', value: '2DD4BF' },
];
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

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
    const [description, setDescription] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    
    // For custom avatar creation
    const [tempImageUrl, setTempImageUrl] = useState("");
    const [customAvatarLetter, setCustomAvatarLetter] = useState('A');
    const [customAvatarColor, setCustomAvatarColor] = useState('60A5FA');

    // State for moderation
    const [members, setMembers] = useState<CenterUser[]>([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(true);
    const [selectedMember, setSelectedMember] = useState<CenterUser | null>(null);
    const [isMuting, setIsMuting] = useState(false);
    
    const [course, classLetter] = useMemo(() => {
        const parts = className.split('-');
        return [parts[0]?.toLowerCase(), parts[1]];
    }, [className]);

    const membersQuery = useMemoFirebase(() => {
        if (!firestore || !centerId || !course || !classLetter) return null;
        return query(
            collection(firestore, 'users'),
            where('organizationId', '==', centerId),
            where('course', '==', course),
            where('className', '==', classLetter)
        );
    }, [firestore, centerId, course, classLetter]);

    const { data: classMembers, isLoading: isMembersLoading } = useCollection<CenterUser>(membersQuery);

    useEffect(() => {
        if (classMembers) {
            setMembers(classMembers);
        }
        setIsLoadingMembers(isMembersLoading);
    }, [classMembers, isMembersLoading]);

    useEffect(() => {
        if (center) {
            const foundClass = center.classes.find(c => c.name === className);
            if (foundClass) {
                setClassData(foundClass);
                setName(foundClass.name);
                setDescription(foundClass.description || "");
                const initialImageUrl = foundClass.imageUrl || `letter_${foundClass.name.charAt(0) || 'A'}_60A5FA`;
                setImageUrl(initialImageUrl);
                setTempImageUrl(initialImageUrl);

                if (initialImageUrl.startsWith('letter_')) {
                    const parts = initialImageUrl.split('_');
                    setCustomAvatarLetter(parts[1] || 'A');
                    setCustomAvatarColor(parts[2] || '60A5FA');
                }
            }
        }
    }, [center, className]);

    const handleSaveChanges = async () => {
        if (!firestore || !centerDocRef || !center || !classData) return;
        setIsSaving(true);
        try {
            const updatedClasses = center.classes.map(c => 
                c.name === className 
                ? { ...c, imageUrl: imageUrl, description: description }
                : c
            );

            await updateDoc(centerDocRef, { classes: updatedClasses });
            toast({ title: "Cambios Guardados", description: "La información de la clase se ha actualizado." });
            
        } catch (error) {
            toast({ title: "Error", description: "No se pudieron guardar los cambios.", variant: "destructive" });
            console.error("Error saving class changes:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleResetChat = async () => {
        if (!firestore || !centerId || !className) return;
        setIsResetting(true);
        try {
            const messagesPath = `centers/${centerId}/classes/${className}/messages`;
            const messagesRef = collection(firestore, messagesPath);
            const messagesSnapshot = await getDocs(messagesRef);

            if (messagesSnapshot.empty) {
                toast({ title: "Chat Vacío", description: "El historial de chat ya estaba vacío." });
                setIsResetting(false);
                return;
            }
            
            const batch = writeBatch(firestore);
            messagesSnapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();

            toast({ title: "Chat Reiniciado", description: "Se ha borrado todo el historial de mensajes de la clase." });

        } catch (error) {
            console.error("Error resetting chat:", error);
            toast({ title: "Error", description: "No se pudo reiniciar el chat. Revisa los permisos.", variant: "destructive" });
        } finally {
            setIsResetting(false);
        }
    };
    
    const handleSetCustomAvatar = () => {
        const newImageUrl = `letter_${customAvatarLetter}_${customAvatarColor}`;
        setImageUrl(newImageUrl);
        toast({ title: 'Avatar aplicado', description: 'Pulsa "Guardar" para confirmar el cambio.' });
    };

    const handleSelectMember = (uid: string) => {
        const member = members.find(m => m.uid === uid);
        setSelectedMember(member || null);
    };

    const handleMuteToggle = async () => {
        if (!firestore || !selectedMember) return;
        setIsMuting(true);

        const newBanStatus = !selectedMember.isChatBanned;
        const userDocRef = doc(firestore, 'users', selectedMember.uid);

        try {
            await updateDoc(userDocRef, { isChatBanned: newBanStatus });
            toast({
                title: `Usuario ${newBanStatus ? 'Silenciado' : 'Reactivado'}`,
                description: `${selectedMember.name} ${newBanStatus ? 'ya no puede' : 'ahora puede'} enviar mensajes.`,
            });
            
            // Update local state
            const updatedMembers = members.map(m => m.uid === selectedMember.uid ? { ...m, isChatBanned: newBanStatus } : m);
            setMembers(updatedMembers);
            setSelectedMember(prev => prev ? { ...prev, isChatBanned: newBanStatus } : null);
        } catch (error) {
            console.error("Error toggling mute status:", error);
            toast({ title: "Error", description: "No se pudo actualizar el estado del usuario.", variant: "destructive" });
        } finally {
            setIsMuting(false);
        }
    };
    
    const isGlobalAdmin = currentUser?.role === 'admin';
    const isCenterAdmin = currentUser?.role === 'center-admin' && currentUser?.organizationId === centerId;
    const classAdminRoleName = currentUser?.role.startsWith('admin-') ? currentUser.role.substring('admin-'.length) : null;
    const isClassAdminForThisClass = classAdminRoleName === className;
    const canEdit = isGlobalAdmin || isCenterAdmin || isClassAdminForThisClass;

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

            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Información de la Clase</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="class-name">Nombre de la Clase</Label>
                            <Input id="class-name" value={name} disabled />
                            <p className="text-xs text-muted-foreground">El nombre de la clase no se puede cambiar para mantener la integridad de los permisos de administrador.</p>
                        </div>

                         <div className="space-y-2">
                            <Label htmlFor="class-description">Descripción</Label>
                            <Textarea id="class-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Añade una descripción corta para el chat de la clase..."/>
                        </div>
                        
                        <div className="space-y-2">
                             <Label>Imagen del Grupo</Label>
                             <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border rounded-lg bg-muted/30">
                                <AvatarDisplay user={{ avatar: imageUrl, name: name }} className="h-24 w-24 flex-shrink-0" />
                                <div className="flex-1 w-full">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full">
                                                <ImageIcon className="mr-2 h-4 w-4" />
                                                Cambiar Imagen
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80 p-0">
                                            <Tabs defaultValue="custom" className="w-full">
                                                <TabsList className="grid w-full grid-cols-3">
                                                    <TabsTrigger value="custom"><Palette className="h-4 w-4"/></TabsTrigger>
                                                    <TabsTrigger value="url"><LinkIcon className="h-4 w-4"/></TabsTrigger>
                                                    <TabsTrigger value="upload"><Upload className="h-4 w-4"/></TabsTrigger>
                                                </TabsList>
                                                <TabsContent value="custom" className="p-4">
                                                    <div className="space-y-4">
                                                        <h4 className="font-medium leading-none">Crear Avatar</h4>
                                                        <p className="text-sm text-muted-foreground">Personaliza un avatar para el grupo.</p>
                                                        <div className="space-y-2">
                                                            <Label>Letra</Label>
                                                            <Select value={customAvatarLetter} onValueChange={setCustomAvatarLetter}>
                                                                <SelectTrigger><SelectValue/></SelectTrigger>
                                                                <SelectContent>
                                                                    {ALPHABET.map(letter => <SelectItem key={letter} value={letter}>{letter}</SelectItem>)}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                         <div className="space-y-2">
                                                            <Label>Color de Fondo</Label>
                                                            <div className="flex flex-wrap gap-2">
                                                                {AVATAR_COLORS.map(color => (
                                                                    <button
                                                                        key={color.value}
                                                                        type="button"
                                                                        onClick={() => setCustomAvatarColor(color.value)}
                                                                        className={cn("h-7 w-7 rounded-full border-2 transition-transform hover:scale-110", customAvatarColor === color.value ? 'border-ring' : 'border-transparent')}
                                                                        style={{ backgroundColor: `#${color.value}` }}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <Button className="w-full" onClick={handleSetCustomAvatar}>Aplicar Avatar</Button>
                                                    </div>
                                                </TabsContent>
                                                <TabsContent value="url" className="p-4">
                                                    <div className="space-y-4">
                                                        <h4 className="font-medium leading-none">Usar URL</h4>
                                                        <p className="text-sm text-muted-foreground">Pega un enlace a una imagen.</p>
                                                        <div className="flex gap-2">
                                                            <Input value={tempImageUrl.startsWith('letter_') ? '' : tempImageUrl} onChange={(e) => setTempImageUrl(e.target.value)} placeholder="https://ejemplo.com/logo.png" />
                                                            <Button onClick={() => setImageUrl(tempImageUrl)}>Aplicar</Button>
                                                        </div>
                                                    </div>
                                                </TabsContent>
                                                <TabsContent value="upload" className="p-4">
                                                    <div className="space-y-4 text-center">
                                                        <h4 className="font-medium leading-none">Subir Imagen</h4>
                                                         <WipDialog>
                                                            <Button className="w-full" variant="outline">Subir (Próximamente)</Button>
                                                        </WipDialog>
                                                    </div>
                                                </TabsContent>
                                            </Tabs>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Moderación del Chat</CardTitle>
                        <CardDescription>Silencia o reactiva a miembros específicos en el chat de la clase.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoadingMembers ? (
                            <div className="flex items-center justify-center p-4">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : members.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center">No hay miembros en esta clase.</p>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="member-select">Seleccionar Miembro</Label>
                                    <Select onValueChange={handleSelectMember}>
                                        <SelectTrigger id="member-select">
                                            <SelectValue placeholder="Elige un usuario..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {members.map(member => (
                                                    <SelectItem key={member.uid} value={member.uid}>
                                                        <div className="flex items-center gap-2">
                                                            <AvatarDisplay user={member} className="h-6 w-6"/>
                                                            <span>{member.name}</span>
                                                            {member.isChatBanned && <MicOff className="h-4 w-4 text-destructive" />}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {selectedMember && (
                                    <div className="p-4 border rounded-lg bg-muted/30 flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold">{selectedMember.name}</p>
                                            <p className={cn("text-sm", selectedMember.isChatBanned ? "text-destructive" : "text-muted-foreground")}>
                                                {selectedMember.isChatBanned ? "Actualmente silenciado" : "Puede enviar mensajes"}
                                            </p>
                                        </div>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant={selectedMember.isChatBanned ? "secondary" : "destructive"}>
                                                    <MicOff className="mr-2 h-4 w-4"/>
                                                    {selectedMember.isChatBanned ? "Reactivar" : "Silenciar"}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>¿{selectedMember.isChatBanned ? 'Reactivar' : 'Silenciar'} a {selectedMember.name}?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        {selectedMember.isChatBanned
                                                            ? `El usuario podrá volver a enviar mensajes en el chat de la clase.`
                                                            : `El usuario no podrá enviar mensajes en el chat de la clase hasta que se le reactive.`
                                                        }
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel disabled={isMuting}>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={handleMuteToggle} disabled={isMuting}>
                                                        {isMuting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                                        {selectedMember.isChatBanned ? 'Sí, reactivar' : 'Sí, silenciar'}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                )}
                            </div>
                        )}
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
                                    <History className="h-4 w-4"/> Reiniciar Historial del Chat
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>¿Reiniciar el chat de la clase?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                       Esta acción es permanente. Se eliminarán **todos los mensajes** del chat para todos los miembros de la clase. Es útil para empezar de cero un nuevo curso.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel disabled={isResetting}>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleResetChat} className="bg-destructive hover:bg-destructive/90" disabled={isResetting}>
                                        {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                        Sí, borrar todo
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
