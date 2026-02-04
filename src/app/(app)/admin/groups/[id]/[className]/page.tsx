
"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/lib/hooks/use-app";
import { useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { doc, updateDoc, collection, query, where } from "firebase/firestore";
import type { Center, User as CenterUser, ClassDefinition } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Search, Loader2, Crown, User, ShieldCheck, Users, Replace, UserX } from "lucide-react";
import LoadingScreen from "@/components/layout/loading-screen";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { AvatarDisplay } from "@/components/profile/avatar-creator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function ManageClassMembersPage() {
    const { user: currentUser } = useApp();
    const router = useRouter();
    const params = useParams();
    const centerId = params.id as string;
    const className = decodeURIComponent(params.className as string);
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMember, setSelectedMember] = useState<CenterUser | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Fetch center data to get available classes for moving users
    const centerDocRef = useMemoFirebase(() => {
        if (!firestore || !centerId) return null;
        return doc(firestore, 'centers', centerId);
    }, [firestore, centerId]);
    const { data: centerData, isLoading: isCenterLoading } = useDoc<Center>(centerDocRef);
    
    const [course, classLetter] = useMemo(() => {
        const standardCourseRegex = /^[1-4](eso|bach)$/i;
        const parts = className.split('-');
        const potentialCourse = parts[0]?.toLowerCase();
        
        if (parts.length === 2 && standardCourseRegex.test(potentialCourse)) {
            return [potentialCourse, parts[1]];
        }
        // It's a custom class
        return ["management", className];
    }, [className]);
    
    const membersQuery = useMemoFirebase(() => {
        if (!firestore || !course || !classLetter) return null;
        return query(
            collection(firestore, 'users'), 
            where('organizationId', '==', centerId),
            where('course', '==', course),
            where('className', '==', classLetter)
        );
    }, [firestore, centerId, course, classLetter]);

    const { data: members, isLoading: isMembersLoading, error } = useCollection<CenterUser>(membersQuery);
    
    const filteredMembers = (members || []).filter(member =>
        (member.name && member.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    const classAdminRole = useMemo(() => `admin-${className}`, [className]);

    const handleRoleChange = async (member: CenterUser | null, newRole: string) => {
         if (!firestore || !member?.uid) return;
         
         setIsProcessing(true);
         try {
            const userDocRef = doc(firestore, 'users', member.uid);
            const updateData: { role: string; adminAccessCount?: number } = { role: newRole };
            if (newRole.startsWith('admin-')) {
                updateData.adminAccessCount = 0;
            }
            await updateDoc(userDocRef, updateData);
            toast({ title: "Rol actualizado", description: `${member.name} es ahora ${newRole === classAdminRole ? 'Admin de Clase' : 'Estudiante'}.` });
            setSelectedMember(prev => prev ? { ...prev, role: newRole } : null);
         } catch (error) {
             console.error("Error updating role:", error);
             toast({ title: "Error", description: "No se pudo actualizar el rol.", variant: "destructive" });
         } finally {
            setIsProcessing(false);
         }
    };

    const handleKickFromClass = async (member: CenterUser | null) => {
        if (!firestore || !member?.uid) return;
        setIsProcessing(true);
        try {
            const userDocRef = doc(firestore, 'users', member.uid);
            // This effectively moves them to a "no class" state within the center
            await updateDoc(userDocRef, {
                course: "default",
                className: "default"
            });
            toast({ title: "Usuario Expulsado de la Clase", description: `${member.name} ha sido movido a un estado 'sin clase'.`, variant: "destructive"});
            setSelectedMember(null); // Close dialog and trigger re-fetch
        } catch (error) {
             console.error("Error kicking user from class:", error);
             toast({ title: "Error", description: "No se pudo expulsar al usuario de la clase.", variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };
    
    const isGlobalAdmin = currentUser?.role === 'admin';
    const isCenterAdmin = currentUser?.role === 'center-admin' && currentUser.organizationId === centerId;
    const isClassAdmin = currentUser?.role === classAdminRole;
    const canManage = isGlobalAdmin || isCenterAdmin || isClassAdmin;
    const canPromote = isGlobalAdmin || isCenterAdmin;

    if (isMembersLoading || isCenterLoading) {
        return <LoadingScreen />;
    }
    
    if (!canManage) {
         return (
             <div className="container mx-auto p-6 text-center">
                 <p className="font-bold text-lg">No tienes permiso para ver esta página.</p>
                 <p className="text-muted-foreground text-sm">Tu rol actual es '{currentUser?.role}' pero se necesita '{classAdminRole}' o superior.</p>
             </div>
         );
    }

    const RoleIcon = ({ role }: { role: string }) => {
        if (role === 'admin') return <ShieldCheck className="h-5 w-5 text-destructive" />;
        if (role === 'center-admin') return <ShieldCheck className="h-5 w-5 text-purple-500" />;
        if (role.startsWith('admin-')) return <Crown className="h-5 w-5 text-amber-500" />;
        return <User className="h-5 w-5 text-muted-foreground" />;
    };


    return (
        <div className="container mx-auto max-w-4xl p-4 sm:p-6">
            <header className="mb-8 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ChevronLeft />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold font-headline tracking-tighter sm:text-3xl">
                        Gestionar Clase: {className.toUpperCase()}
                    </h1>
                     <p className="text-sm text-muted-foreground">Administra los miembros y roles de esta clase.</p>
                </div>
            </header>
            
            <Card>
                <CardHeader>
                    <CardTitle>Miembros de la Clase</CardTitle>
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
                    {isMembersLoading ? (
                        <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                    ) : filteredMembers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <p className="font-semibold">No hay miembros en esta clase</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                             <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedMember(null)}>
                                {filteredMembers.map((member, index) => (
                                    <DialogTrigger asChild key={member.uid || index}>
                                        <button
                                          className={cn(
                                            "flex w-full items-center gap-4 p-3 text-left rounded-lg border transition-colors hover:bg-muted/50",
                                            currentUser && member.uid === currentUser.uid && "bg-primary/10"
                                          )}
                                          onClick={() => setSelectedMember(member)}
                                        >
                                            <AvatarDisplay user={member} className="h-10 w-10 shrink-0" />
                                            <div className="flex-1">
                                                <p className="font-semibold">{member.name}</p>
                                                <p className="text-xs text-muted-foreground">{member.email}</p>
                                            </div>
                                            <RoleIcon role={member.role} />
                                        </button>
                                    </DialogTrigger>
                                ))}

                                <DialogContent>
                                    {selectedMember && (
                                        <>
                                            <DialogHeader className="items-center text-center">
                                                <AvatarDisplay user={selectedMember} className="h-24 w-24 mb-4" />
                                                <DialogTitle>{selectedMember.name}</DialogTitle>
                                                <DialogDescription>{selectedMember.email}</DialogDescription>
                                                 <div className="flex gap-2 items-center">
                                                    <Badge variant={selectedMember.role === 'admin' ? 'destructive' : selectedMember.role === 'center-admin' ? 'secondary' : selectedMember.role.startsWith('admin-') ? 'default' : 'secondary'} className={cn(selectedMember.role === 'center-admin' && 'bg-purple-100 text-purple-800')}>
                                                        {selectedMember.role === 'admin' ? "Admin Global" : selectedMember.role === 'center-admin' ? "Admin Centro" : selectedMember.role.startsWith('admin-') ? `Admin ${className}` : "Estudiante"}
                                                    </Badge>
                                                 </div>
                                            </DialogHeader>
                                            <div className="pt-4 space-y-2">
                                                {canPromote && selectedMember.role !== 'admin' && selectedMember.role !== 'center-admin' && (
                                                    selectedMember.role.startsWith('admin-') ? (
                                                        <Button variant="outline" onClick={() => handleRoleChange(selectedMember, 'student')} className="w-full" disabled={isProcessing}>
                                                            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} <Crown className="mr-2 h-4 w-4" /> Quitar Admin de Clase
                                                        </Button>
                                                   ) : (
                                                        <Button onClick={() => handleRoleChange(selectedMember, classAdminRole)} className="w-full" disabled={isProcessing}>
                                                            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} <Crown className="mr-2 h-4 w-4" /> Hacer Admin de Clase
                                                        </Button>
                                                   )
                                               )}
                                               <MoveUserDialog 
                                                    member={selectedMember} 
                                                    center={centerData}
                                                    onMove={() => setSelectedMember(null)}
                                               >
                                                    <Button variant="outline" className="w-full">
                                                        <Replace className="mr-2 h-4 w-4" /> Mover de Clase
                                                    </Button>
                                               </MoveUserDialog>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive" className="w-full" disabled={isProcessing}>
                                                            <UserX className="mr-2 h-4 w-4" /> Expulsar de la Clase
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>¿Expulsar a {selectedMember.name} de esta clase?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Esta acción moverá al usuario a un estado "sin clase" dentro del centro. Podrá volver a ser asignado a una clase más tarde por un administrador. No se le expulsará de la aplicación.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleKickFromClass(selectedMember)} className="bg-destructive hover:bg-destructive/90">Sí, expulsar</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                            <DialogFooter className="pt-2">
                                                <DialogClose asChild>
                                                    <Button variant="outline" className="w-full">Cerrar</Button>
                                                </DialogClose>
                                            </DialogFooter>
                                        </>
                                    )}
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function MoveUserDialog({ member, center, children, onMove }: { member: CenterUser, center: Center | null, children: React.ReactNode, onMove: () => void }) {
    const [selectedClass, setSelectedClass] = useState("");
    const [isMoving, setIsMoving] = useState(false);
    const firestore = useFirestore();
    const { toast } = useToast();

    if (!center) return <>{children}</>;

    const groupedClasses = useMemo(() => {
        const standard: ClassDefinition[] = [];
        const custom: ClassDefinition[] = [];
        const standardCourseRegex = /^[1-4](eso|bach)$/i;

        center.classes.forEach(c => {
            const [course] = c.name.split('-');
            if (course && standardCourseRegex.test(course)) {
                standard.push(c);
            } else {
                custom.push(c);
            }
        });
        
        const groupedByCourse = standard.reduce((acc, c) => {
            const courseName = c.name.split('-')[0].toUpperCase();
            if (!acc[courseName]) {
                acc[courseName] = [];
            }
            acc[courseName].push(c);
            return acc;
        }, {} as Record<string, ClassDefinition[]>);

        return { groupedByCourse, custom };
    }, [center.classes]);

    const handleMoveUser = async () => {
        if (!firestore || !member.uid || !selectedClass) return;

        setIsMoving(true);
        try {
            const userDocRef = doc(firestore, 'users', member.uid);
            
            let course, className;
            const standardCourseRegex = /^[1-4](eso|bach)-([A-G])$/i;
            const match = selectedClass.match(standardCourseRegex);

            if (match) {
                course = match[1].toLowerCase();
                className = match[2];
            } else {
                // It's a custom class
                course = "management"; // Special course for custom classes
                className = selectedClass;
            }
            
            await updateDoc(userDocRef, { course, className });
            toast({ title: "Usuario Movido", description: `${member.name} ha sido movido a la clase ${selectedClass}.` });
            onMove();
        } catch (error) {
            console.error("Error moving user:", error);
            toast({ title: "Error", description: "No se pudo mover al usuario.", variant: "destructive" });
        } finally {
            setIsMoving(false);
        }
    };

    return (
        <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedClass("")}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Mover a {member.name}</DialogTitle>
                    <DialogDescription>
                        Selecciona la nueva clase para este usuario dentro del centro {center.name}.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="target-class">Nueva Clase</Label>
                        <Select onValueChange={setSelectedClass} value={selectedClass}>
                            <SelectTrigger id="target-class"><SelectValue placeholder="Seleccionar clase..."/></SelectTrigger>
                            <SelectContent>
                                {Object.entries(groupedClasses.groupedByCourse).map(([course, classes]) => (
                                    <SelectGroup key={course}>
                                        <Label className="px-2 py-1.5 text-xs font-semibold">{course}</Label>
                                        {classes.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                                    </SelectGroup>
                                ))}
                                {groupedClasses.custom.length > 0 && (
                                     <SelectGroup>
                                        <Label className="px-2 py-1.5 text-xs font-semibold">Otros</Label>
                                        {groupedClasses.custom.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                                    </SelectGroup>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline" disabled={isMoving}>Cancelar</Button></DialogClose>
                    <Button onClick={handleMoveUser} disabled={isMoving || !selectedClass}>
                        {isMoving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Confirmar Movimiento
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
