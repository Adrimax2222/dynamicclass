"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/lib/hooks/use-app";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, updateDoc, collection, query, where } from "firebase/firestore";
import type { Center, User as CenterUser, ClassDefinition, Schedule } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Search, Loader2, Crown, User, ShieldCheck, Users } from "lucide-react";
import LoadingScreen from "@/components/layout/loading-screen";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";

import { cn } from "@/lib/utils";

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
    
    // Derived state from className
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

    const { data: members, isLoading, error } = useCollection<CenterUser>(membersQuery);
    
    const filteredMembers = (members || []).filter(member =>
        (member.name && member.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleRoleChange = async (member: CenterUser | null, newRole: string) => {
         console.log("Datos del miembro recibidos:", member);
         if (!firestore || !member) return;
         if (!member.uid) {
            console.error("Error: el miembro no tiene un UID válido.", member);
            toast({ title: "Error", description: "No se puede actualizar el rol de un usuario sin identificador.", variant: "destructive" });
            return;
        }
         try {
            const userDocRef = doc(firestore, 'users', member.uid);
            await updateDoc(userDocRef, { role: newRole });
            toast({ title: "Rol actualizado", description: `${member.name} es ahora ${newRole}.` });
            setSelectedMember(null); // Close dialog on success
         } catch (error) {
             console.error("Error updating role:", error);
             toast({ title: "Error", description: "No se pudo actualizar el rol.", variant: "destructive" });
         }
    };
    
    const classAdminRole = `admin-${className}`;

    const isGlobalAdmin = currentUser?.role === 'admin';
    const isClassAdmin = currentUser?.role === classAdminRole;
    
    const canManage = isGlobalAdmin || isClassAdmin;

    if (isLoading) {
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
        if (role === classAdminRole) return <Crown className="h-5 w-5 text-amber-500" />;
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
                    {isLoading ? (
                        <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                    ) : filteredMembers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <p className="font-semibold">No hay miembros en esta clase</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                             <Dialog>
                                {filteredMembers.map((member, index) => (
                                    <DialogTrigger asChild key={member.uid || index}>
                                        <button
                                          className={cn(
                                            "flex w-full items-center gap-4 p-3 text-left rounded-lg border transition-colors hover:bg-muted/50",
                                            currentUser && member.uid === currentUser.uid && "bg-primary/10"
                                          )}
                                          onClick={() => setSelectedMember(member)}
                                        >
                                            <Avatar>
                                                <AvatarImage src={member.avatar} />
                                                <AvatarFallback>{member.name?.charAt(0)}</AvatarFallback>
                                            </Avatar>
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
                                                <Avatar className="h-20 w-20 mb-4 ring-4 ring-primary/20">
                                                    <AvatarImage src={selectedMember.avatar} />
                                                    <AvatarFallback className="text-2xl">{selectedMember.name?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <DialogTitle>{selectedMember.name}</DialogTitle>
                                                <DialogDescription>{selectedMember.email}</DialogDescription>
                                                 <Badge variant={selectedMember.role === 'admin' ? 'destructive' : selectedMember.role === classAdminRole ? 'default' : 'secondary'} className="w-fit">
                                                    {selectedMember.role === 'admin' ? "Admin Global" : selectedMember.role === classAdminRole ? "Admin Clase" : "Estudiante"}
                                                </Badge>
                                            </DialogHeader>
                                            <DialogFooter className="flex-col gap-2 pt-4">
                                               {isGlobalAdmin && selectedMember.role !== 'admin' && (
                                                     selectedMember.role === classAdminRole ? (
                                                        <Button variant="destructive" onClick={() => handleRoleChange(selectedMember, 'student')}>
                                                            Quitar Admin de Clase
                                                        </Button>
                                                   ) : (
                                                        <Button onClick={() => handleRoleChange(selectedMember, classAdminRole)}>
                                                            Hacer Admin de Clase
                                                        </Button>
                                                   )
                                               )}
                                                <DialogClose asChild>
                                                    <Button variant="outline">Cerrar</Button>
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
