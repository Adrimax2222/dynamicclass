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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { AvatarDisplay } from "@/components/profile/avatar-creator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    
    const [course, classLetter] = className.split('-');
    
    const membersQuery = useMemoFirebase(() => {
        if (!firestore || !course || !classLetter) return null;
        return query(
            collection(firestore, 'users'), 
            where('organizationId', '==', centerId),
            where('course', '==', course.toLowerCase()),
            where('className', '==', classLetter)
        );
    }, [firestore, centerId, course, classLetter]);

    const { data: members, isLoading: isMembersLoading, error } = useCollection<CenterUser>(membersQuery);
    
    const filteredMembers = (members || []).filter(member =>
        (member.name && member.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    const classAdminRole = `admin-${className}`;

    const handleRoleChange = async (member: CenterUser | null, newRole: string) => {
         if (!firestore || !member) return;
         if (!member.uid) {
            console.error("Error: el miembro no tiene un UID válido.", member);
            toast({ title: "Error", description: "No se puede actualizar el rol de un usuario sin identificador.", variant: "destructive" });
            return;
        }
         console.log("Datos del miembro recibidos:", member);
         try {
            const userDocRef = doc(firestore, 'users', member.uid);
            await updateDoc(userDocRef, { role: newRole });
            toast({ title: "Rol actualizado", description: `${member.name} es ahora ${newRole === classAdminRole ? 'Admin de Clase' : 'Estudiante'}.` });
            setSelectedMember(prev => prev ? { ...prev, role: newRole } : null);
         } catch (error) {
             console.error("Error updating role:", error);
             toast({ title: "Error", description: "No se pudo actualizar el rol.", variant: "destructive" });
         }
    };

    const handleBanUser = async (member: CenterUser | null) => {
        if (!firestore || !member || !member.uid) return;
        setIsProcessing(true);
        try {
            const userDocRef = doc(firestore, 'users', member.uid);
            await updateDoc(userDocRef, { isBanned: true });
            toast({ title: "Usuario Expulsado", description: `${member.name} ha sido expulsado y no podrá acceder a la aplicación.`, variant: "destructive"});
            setSelectedMember(null);
        } catch (error) {
             console.error("Error banning user:", error);
             toast({ title: "Error", description: "No se pudo expulsar al usuario.", variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };
    
    const isGlobalAdmin = currentUser?.role === 'admin';
    const isClassAdmin = currentUser?.role === classAdminRole;
    const canManage = isGlobalAdmin || isClassAdmin;

    if (isMembersLoading || isCenterLoading) {
        return <LoadingScreen />;
    }
    
    if (!canManage) {
         return (
             <div className="container mx-auto p-6">
                 <p>No tienes permiso para ver esta página.</p>
             </div>
         );
    }

    const RoleIcon = ({ role }: { role: string }) => {
        if (role === 'admin') return <ShieldCheck className="h-5 w-5 text-destructive" />;
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
                        Gestionar Clase: {className}
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
                                            <AvatarDisplay user={member} className="h-10 w-10 shrink-0" showHat={false}/>
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
                                                <AvatarDisplay user={selectedMember} className="h-24 w-24 mb-4" showHat={true} />
                                                <DialogTitle>{selectedMember.name}</DialogTitle>
                                                <DialogDescription>{selectedMember.email}</DialogDescription>
                                                 <Badge variant={selectedMember.role === 'admin' ? 'destructive' : selectedMember.role.startsWith('admin-') ? 'default' : 'secondary'} className="w-fit">
                                                    {selectedMember.role === 'admin' ? "Admin Global" : selectedMember.role.startsWith('admin-') ? "Admin Clase" : "Estudiante"}
                                                </Badge>
                                            </DialogHeader>
                                            <div className="pt-4 space-y-2">
                                                {isGlobalAdmin && selectedMember.role !== 'admin' && (
                                                    selectedMember.role.startsWith('admin-') ? (
                                                        <Button variant="outline" onClick={() => handleRoleChange(selectedMember, 'student')} className="w-full">
                                                            <Crown className="mr-2 h-4 w-4" /> Quitar Admin de Clase
                                                        </Button>
                                                   ) : (
                                                        <Button onClick={() => handleRoleChange(selectedMember, classAdminRole)} className="w-full">
                                                            <Crown className="mr-2 h-4 w-4" /> Hacer Admin de Clase
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
                                                            <UserX className="mr-2 h-4 w-4" /> Expulsar
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>¿Expulsar a {selectedMember.name}?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Esta acción marcará al usuario como baneado y no podrá volver a iniciar sesión. Esta acción es reversible por un admin global desde el panel principal.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleBanUser(selectedMember)} className="bg-destructive hover:bg-destructive/90">Sí, expulsar</AlertDialogAction>
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
    const [targetCourse, setTargetCourse] = useState("");
    const [targetClass, setTargetClass] = useState("");
    const [isMoving, setIsMoving] = useState(false);
    const firestore = useFirestore();
    const { toast } = useToast();

    if (!center) return <>{children}</>;

    const availableClasses = useMemo(() => {
        const classMap = new Map<string, Set<string>>();
        center.classes.forEach(c => {
            const [course, className] = c.name.split('-');
            if (course && className) {
                const courseKey = course.toLowerCase();
                if (!classMap.has(courseKey)) {
                    classMap.set(courseKey, new Set());
                }
                classMap.get(courseKey)!.add(className);
            }
        });
        return classMap;
    }, [center.classes]);

    const handleMoveUser = async () => {
        if (!firestore || !member.uid || !targetCourse || !targetClass) return;

        setIsMoving(true);
        try {
            const userDocRef = doc(firestore, 'users', member.uid);
            await updateDoc(userDocRef, {
                course: targetCourse,
                className: targetClass
            });
            toast({ title: "Usuario Movido", description: `${member.name} ha sido movido a la clase ${targetCourse.toUpperCase()}-${targetClass}.` });
            onMove();
        } catch (error) {
            console.error("Error moving user:", error);
            toast({ title: "Error", description: "No se pudo mover al usuario.", variant: "destructive" });
        } finally {
            setIsMoving(false);
        }
    };
    
    const courseOptions = Array.from(availableClasses.keys());
    const classOptions = targetCourse ? Array.from(availableClasses.get(targetCourse) || []) : [];

    return (
        <Dialog>
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
                        <Label htmlFor="target-course">Nuevo Curso</Label>
                        <Select onValueChange={(value) => { setTargetCourse(value); setTargetClass(""); }}>
                            <SelectTrigger id="target-course"><SelectValue placeholder="Seleccionar curso..."/></SelectTrigger>
                            <SelectContent>
                                {courseOptions.map(course => (
                                    <SelectItem key={course} value={course}>{course.toUpperCase()}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="target-class">Nueva Clase</Label>
                        <Select onValueChange={setTargetClass} value={targetClass} disabled={!targetCourse}>
                            <SelectTrigger id="target-class"><SelectValue placeholder="Seleccionar clase..."/></SelectTrigger>
                            <SelectContent>
                                {classOptions.map(cls => (
                                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline" disabled={isMoving}>Cancelar</Button></DialogClose>
                    <Button onClick={handleMoveUser} disabled={isMoving || !targetCourse || !targetClass}>
                        {isMoving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Confirmar Movimiento
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

