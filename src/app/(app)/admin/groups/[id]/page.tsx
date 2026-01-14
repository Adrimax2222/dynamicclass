
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/lib/hooks/use-app";
import { useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, query, where, getDocs } from "firebase/firestore";
import type { Center, User as CenterUser, ClassDefinition, Schedule } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Search, GraduationCap, PlusCircle, Trash2, Loader2, Copy, Check, Users, CalendarCog, BookOpen, UserCog, Info, Edit, Group } from "lucide-react";
import LoadingScreen from "@/components/layout/loading-screen";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AvatarDisplay } from "@/components/profile/avatar-creator";
import { TeacherInfoDialog } from "@/components/layout/teacher-info-dialog";

export default function ManageGroupPage() {
    const { user: currentUser } = useApp();
    const router = useRouter();
    const params = useParams();
    const centerId = params.id as string;
    
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const centerDocRef = useMemoFirebase(() => {
        if (!firestore || !centerId) return null;
        return doc(firestore, 'centers', centerId);
    }, [firestore, centerId]);

    const { data: center, isLoading } = useDoc<Center>(centerDocRef);
    
    const isGlobalAdmin = currentUser?.role === 'admin';
    const isCenterAdmin = currentUser?.role === 'center-admin' && currentUser.organizationId === centerId;
    const classAdminRoleName = currentUser?.role.startsWith('admin-') ? currentUser.role.split('admin-')[1] : null;
    const isClassAdmin = !!classAdminRoleName;

    useEffect(() => {
        if (!isLoading && !center) {
            toast({ title: "Error", description: "No se pudo encontrar el centro.", variant: "destructive" });
            router.push('/admin');
        }
    }, [isLoading, center, router, toast]);
    
    if (isLoading || !currentUser) {
        return <LoadingScreen />;
    }

    // Permission check
    if (!isGlobalAdmin && !isCenterAdmin && !isClassAdmin) {
        return <div className="p-8 text-center">No tienes permiso para ver esta página.</div>;
    }
    
    // If a class admin is trying to access a center they don't belong to
    if (isClassAdmin && currentUser.organizationId !== centerId) {
        return <div className="p-8 text-center">No tienes permiso para gestionar este centro.</div>;
    }

    if (!center) {
         return <LoadingScreen />;
    }
    
    // A class admin can only see their own class, but center/global admins see all
    const canManageAllClasses = isGlobalAdmin || isCenterAdmin;
    const filteredClasses = canManageAllClasses
        ? center.classes
        : center.classes.filter(c => c.name === classAdminRoleName);

    return (
        <div className="container mx-auto max-w-4xl p-4 sm:p-6">
            <header className="mb-8 flex items-start justify-between">
                <div className="flex items-start gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push(isGlobalAdmin ? '/admin' : '/settings')}>
                        <ChevronLeft />
                    </Button>
                    {center.imageUrl ? (
                        <img src={center.imageUrl} alt={center.name} className="h-12 w-12 object-cover rounded-lg flex-shrink-0" />
                    ) : (
                        <div className="h-12 w-12 flex items-center justify-center bg-muted rounded-lg flex-shrink-0">
                           <Group className="h-6 w-6 text-muted-foreground" />
                        </div>
                    )}
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold font-headline tracking-tighter sm:text-2xl break-words">
                            {center.name}
                        </h1>
                         <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-muted-foreground">Código:</p>
                            <Badge variant="outline">{center.code}</Badge>
                            <CopyButton text={center.code} />
                        </div>
                    </div>
                </div>
                 {canManageAllClasses && (
                    <Button asChild variant="outline" size="sm" className="ml-2 flex-shrink-0">
                        <Link href={`/admin/centers/${center.uid}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </Link>
                    </Button>
                )}
            </header>

            <Tabs defaultValue="classes" className="w-full">
                {canManageAllClasses && (
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="classes"><GraduationCap className="mr-2 h-4 w-4"/>Clases</TabsTrigger>
                        <TabsTrigger value="all-members"><Users className="mr-2 h-4 w-4"/>Todos los Miembros</TabsTrigger>
                    </TabsList>
                )}

                <div className="py-6">
                    <TabsContent value="classes">
                        <ClassesTab center={center} visibleClasses={filteredClasses} isGlobalAdmin={canManageAllClasses}/>
                    </TabsContent>
                    {canManageAllClasses && (
                        <TabsContent value="all-members">
                            <MembersTab centerId={center.uid} />
                        </TabsContent>
                    )}
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

function MembersTab({ centerId }: { centerId: string }) {
    const firestore = useFirestore();
    const [searchTerm, setSearchTerm] = useState("");

    const membersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'), where('organizationId', '==', centerId));
    }, [firestore, centerId]);

    const { data: members, isLoading } = useCollection<CenterUser>(membersQuery);

    const filteredMembers = (members || []).filter(member =>
        (member.name && member.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Miembros del Centro</CardTitle>
                <CardDescription>Todos los usuarios que se han unido a este grupo con el código.</CardDescription>
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
                        {filteredMembers.map((member, i) => (
                            <div key={member.uid || i} className="flex items-center gap-4 p-2 rounded-lg border">
                                <AvatarDisplay user={member} className="h-10 w-10" />
                                <div className="flex-1">
                                    <p className="font-semibold">{member.name}</p>
                                    <p className="text-xs text-muted-foreground">{member.email}</p>
                                </div>
                                <Badge variant={member.role === 'admin' ? 'destructive' : member.role?.startsWith('admin-') ? 'secondary' : 'outline'}>{member.role}</Badge>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function ClassesTab({ center, visibleClasses, isGlobalAdmin }: { center: Center, visibleClasses: ClassDefinition[], isGlobalAdmin: boolean }) {
    const [newCourse, setNewCourse] = useState("");
    const [newClassName, setNewClassName] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const firestore = useFirestore();
    const { toast } = useToast();

    const handleAddClass = async () => {
        if (!firestore || !center.uid || !newCourse || !newClassName) return;

        const combinedClassName = `${newCourse.replace('eso','ESO')}-${newClassName}`;

        setIsProcessing(true);
        const centerDocRef = doc(firestore, 'centers', center.uid);
        const newClass: ClassDefinition = { name: combinedClassName, icalUrl: '', schedule: { Lunes: [], Martes: [], Miércoles: [], Jueves: [], Viernes: [] } };

        try {
            await updateDoc(centerDocRef, {
                classes: arrayUnion(newClass)
            });
            setNewCourse("");
            setNewClassName("");
            toast({ title: "Clase añadida", description: `La clase "${combinedClassName}" ha sido añadida.` });
        } catch (error) {
            toast({ title: "Error", description: "No se pudo añadir la clase.", variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRemoveClass = async (classObj: ClassDefinition) => {
        if (!firestore || !center.uid) return;
        setIsProcessing(true);
        const centerDocRef = doc(firestore, 'centers', center.uid);
        try {
            await updateDoc(centerDocRef, {
                classes: arrayRemove(classObj)
            });
            toast({ title: "Clase eliminada", description: `La clase "${classObj.name}" ha sido eliminada.` });
        } catch (error) {
            toast({ title: "Error", description: "No se pudo eliminar la clase.", variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Clases del Centro</CardTitle>
                <CardDescription>Gestiona las clases, sus calendarios y sus miembros.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isGlobalAdmin && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="space-y-1">
                                <Label htmlFor="course-select">Curso</Label>
                                <Select onValueChange={setNewCourse} value={newCourse} disabled={isProcessing}>
                                    <SelectTrigger id="course-select"><SelectValue placeholder="Curso..."/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1eso">1º ESO</SelectItem>
                                        <SelectItem value="2eso">2º ESO</SelectItem>
                                        <SelectItem value="3eso">3º ESO</SelectItem>
                                        <SelectItem value="4eso">4º ESO</SelectItem>
                                        <SelectItem value="1bach">1º Bach.</SelectItem>
                                        <SelectItem value="2bach">2º Bach.</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="class-name-select">Clase</Label>
                                <Select onValueChange={setNewClassName} value={newClassName} disabled={isProcessing}>
                                    <SelectTrigger id="class-name-select"><SelectValue placeholder="Clase..."/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="A">A</SelectItem>
                                        <SelectItem value="B">B</SelectItem>
                                        <SelectItem value="C">C</SelectItem>
                                        <SelectItem value="D">D</SelectItem>
                                        <SelectItem value="E">E</SelectItem>
                                        <SelectItem value="F">F</SelectItem>
                                        <SelectItem value="G">G</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end">
                                <Button onClick={handleAddClass} disabled={isProcessing || !newCourse || !newClassName} className="w-full">
                                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                                    Añadir Clase
                                </Button>
                            </div>
                        </div>
                        <Separator />
                    </>
                )}
                {(visibleClasses || []).length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                        <GraduationCap className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="font-semibold">No hay clases</p>
                        <p className="text-sm text-muted-foreground">
                            Añade la primera clase para este centro.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {visibleClasses.map((classObj, index) => (
                           <div 
                             key={`class-${index}-${classObj.name}`} 
                             className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg border bg-muted/50"
                           >
                             <div className="flex items-center gap-2">
                                <p className="font-semibold text-base whitespace-nowrap">{classObj.name || "Clase sin nombre"}</p>
                                <TeacherInfoDialog />
                             </div>
                             <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap justify-end">
                               <Button asChild variant="secondary" size="sm" className="flex-1 sm:flex-initial">
                                  <Link href={`/admin/groups/${center.uid}/${encodeURIComponent(classObj.name)}`}>
                                   <UserCog className="h-4 w-4 mr-2" />
                                   Miembros
                                 </Link>
                               </Button>
                               <Button asChild variant="secondary" size="sm" className="flex-1 sm:flex-initial">
                                  <Link href={`/admin/schedule/editor/${center.uid}/${encodeURIComponent(classObj.name)}`}>
                                   <BookOpen className="h-4 w-4 mr-2" />
                                   Horario
                                 </Link>
                               </Button>
                               <Button asChild variant="secondary" size="sm" className="flex-1 sm:flex-initial">
                                 <Link href={`/admin/schedule/${center.uid}/${encodeURIComponent(classObj.name)}`}>
                                   <CalendarCog className="h-4 w-4 mr-2" />
                                   Calendario
                                 </Link>
                               </Button>
                               {isGlobalAdmin && (
                                   <AlertDialog>
                                     <AlertDialogTrigger asChild>
                                       <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0" disabled={isProcessing}>
                                         <Trash2 className="h-4 w-4" />
                                       </Button>
                                     </AlertDialogTrigger>
                                     <AlertDialogContent>
                                       <AlertDialogHeader>
                                         <AlertDialogTitle>¿Eliminar clase?</AlertDialogTitle>
                                         <AlertDialogDescription>
                                           Vas a eliminar la clase "{classObj.name}". Esta acción no se puede deshacer.
                                         </AlertDialogDescription>
                                       </AlertDialogHeader>
                                       <AlertDialogFooter>
                                         <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                         <AlertDialogAction onClick={() => handleRemoveClass(classObj)}>Sí, eliminar</AlertDialogAction>
                                       </AlertDialogFooter>
                                     </AlertDialogContent>
                                   </AlertDialog>
                               )}
                             </div>
                           </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

    

    
