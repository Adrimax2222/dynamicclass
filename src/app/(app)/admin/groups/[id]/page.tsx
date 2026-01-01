
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/lib/hooks/use-app";
import { useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, query, where } from "firebase/firestore";
import type { Center, User as CenterUser } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Search, Group, GraduationCap, Shield, PlusCircle, Trash2, Loader2, Copy, Check, Users } from "lucide-react";
import LoadingScreen from "@/components/layout/loading-screen";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { SCHOOL_VERIFICATION_CODE } from "@/lib/constants";


export default function ManageGroupPage() {
    const { user } = useApp();
    const router = useRouter();
    const params = useParams();
    const centerId = params.id as string;
    
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const [center, setCenter] = useState<Center | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!firestore || !centerId) return;
        
        const fetchCenter = async () => {
            setIsLoading(true);
            if (centerId === SCHOOL_VERIFICATION_CODE) {
                // Handle legacy center
                setCenter({
                    id: 'legacy-center',
                    name: 'IES Torre del Palau',
                    code: SCHOOL_VERIFICATION_CODE,
                    classes: ['4ESO-B'],
                    createdAt: { seconds: 0, nanoseconds: 0 } // dummy timestamp
                });
            } else {
                const centerDocRef = doc(firestore, 'centers', centerId);
                const docSnap = await getDoc(centerDocRef);
                if (docSnap.exists()) {
                    setCenter({ id: docSnap.id, ...docSnap.data() } as Center);
                } else {
                    toast({ title: "Error", description: "No se pudo encontrar el centro.", variant: "destructive" });
                    router.push('/admin');
                }
            }
            setIsLoading(false);
        };
        fetchCenter();
    }, [firestore, centerId, router, toast]);

    if (!user || user.role !== 'admin' || isLoading || !center) {
        return <LoadingScreen />;
    }

    return (
        <div className="container mx-auto max-w-4xl p-4 sm:p-6">
            <header className="mb-8 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push('/admin')}>
                    <ChevronLeft />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold font-headline tracking-tighter sm:text-3xl">
                        {center.name}
                    </h1>
                     <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-muted-foreground">Código:</p>
                        <Badge variant="outline">{center.code}</Badge>
                        <CopyButton text={center.code} />
                    </div>
                </div>
            </header>

            <Tabs defaultValue="members" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="members"><Users className="mr-2 h-4 w-4"/>Miembros</TabsTrigger>
                    <TabsTrigger value="classes"><GraduationCap className="mr-2 h-4 w-4"/>Clases</TabsTrigger>
                    <TabsTrigger value="admins"><Shield className="mr-2 h-4 w-4"/>Admins</TabsTrigger>
                </TabsList>

                <div className="py-6">
                    <TabsContent value="members">
                        <MembersTab centerCode={center.code} />
                    </TabsContent>
                    <TabsContent value="classes">
                        <ClassesTab center={center} setCenter={setCenter} />
                    </TabsContent>
                     <TabsContent value="admins">
                        <CenterAdminsTab />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
        </Button>
    )
}

function MembersTab({ centerCode }: { centerCode: string }) {
    const firestore = useFirestore();
    const [searchTerm, setSearchTerm] = useState("");

    const membersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'), where('center', '==', centerCode));
    }, [firestore, centerCode]);

    const { data: members, isLoading } = useCollection<CenterUser>(membersQuery);

    const filteredMembers = (members || []).filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Miembros del Centro</CardTitle>
                <CardDescription>Usuarios que se han unido a este grupo con el código.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar miembro..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Separator />
                {isLoading ? (
                    <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : filteredMembers.length === 0 ? (
                     <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                        <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="font-semibold">No hay miembros</p>
                        <p className="text-sm text-muted-foreground">
                            Ningún usuario se ha unido a este centro todavía.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                        {filteredMembers.map(member => (
                            <div key={member.uid} className="flex items-center gap-4 p-2 rounded-lg border">
                                <Avatar>
                                    <AvatarImage src={member.avatar} />
                                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="font-semibold">{member.name}</p>
                                    <p className="text-xs text-muted-foreground">{member.email}</p>
                                </div>
                                <Badge variant={member.role === 'admin' ? 'destructive' : 'secondary'}>{member.role}</Badge>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function ClassesTab({ center, setCenter }: { center: Center; setCenter: (c: Center) => void }) {
    const [newClassName, setNewClassName] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const firestore = useFirestore();
    const { toast } = useToast();

    const handleAddClass = async () => {
        if (!firestore || center.id === 'legacy-center' || !newClassName.trim()) return;

        setIsProcessing(true);
        const centerDocRef = doc(firestore, 'centers', center.id);
        try {
            await updateDoc(centerDocRef, {
                classes: arrayUnion(newClassName.trim())
            });
            setCenter({ ...center, classes: [...center.classes, newClassName.trim()] });
            setNewClassName("");
            toast({ title: "Clase añadida", description: `La clase "${newClassName.trim()}" ha sido añadida.` });
        } catch (error) {
            toast({ title: "Error", description: "No se pudo añadir la clase.", variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRemoveClass = async (className: string) => {
        if (!firestore || center.id === 'legacy-center') return;
        setIsProcessing(true);
        const centerDocRef = doc(firestore, 'centers', center.id);
        try {
            await updateDoc(centerDocRef, {
                classes: arrayRemove(className)
            });
            setCenter({ ...center, classes: center.classes.filter(c => c !== className) });
            toast({ title: "Clase eliminada", description: `La clase "${className}" ha sido eliminada.` });
        } catch (error) {
            toast({ title: "Error", description: "No se pudo eliminar la clase.", variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    const isLegacy = center.id === 'legacy-center';

    return (
        <Card>
            <CardHeader>
                <CardTitle>Clases del Centro</CardTitle>
                <CardDescription>Gestiona las clases disponibles en este centro.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {!isLegacy && (
                    <div className="flex gap-2">
                        <Input
                            placeholder="Nombre de la nueva clase (Ej: 4ESO-A)"
                            value={newClassName}
                            onChange={(e) => setNewClassName(e.target.value)}
                            disabled={isProcessing}
                        />
                        <Button onClick={handleAddClass} disabled={isProcessing || !newClassName.trim()}>
                            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                        </Button>
                    </div>
                )}
                <Separator />
                {center.classes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                        <GraduationCap className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="font-semibold">No hay clases</p>
                        <p className="text-sm text-muted-foreground">
                            Añade la primera clase para este centro.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
                        {center.classes.map(className => (
                            <div key={className} className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                                <p className="font-semibold">{className}</p>
                                {!isLegacy && (
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" disabled={isProcessing}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>¿Eliminar clase?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Vas a eliminar la clase "{className}". Esta acción no se puede deshacer.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleRemoveClass(className)}>Sí, eliminar</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                 {isLegacy && (
                    <div className="text-sm text-muted-foreground p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                        Este es un centro heredado. La gestión de clases no está disponible.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function CenterAdminsTab() {
    // Placeholder for future implementation
    return (
        <Card>
            <CardHeader>
                <CardTitle>Administradores del Centro</CardTitle>
                <CardDescription>Gestiona qué usuarios tienen permisos de administrador para este centro.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                    <Shield className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="font-semibold">Función en Desarrollo</p>
                    <p className="text-sm text-muted-foreground">
                        Próximamente podrás asignar administradores específicos para cada centro.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

    