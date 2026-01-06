
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/lib/hooks/use-app";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, getDoc, updateDoc, collection, query, where } from "firebase/firestore";
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
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRoleChange = async (member: CenterUser, newRole: string) => {
         if (!firestore) return;
         try {
            const userDocRef = doc(firestore, 'users', member.uid);
            await updateDoc(userDocRef, { role: newRole });
            toast({ title: "Rol actualizado", description: `${member.name} es ahora ${newRole}.` });
         } catch (error) {
             toast({ title: "Error", description: "No se pudo actualizar el rol.", variant: "destructive" });
         }
    };
    
    const classAdminRole = `admin-${className}`;

    const canManage = currentUser?.role === 'admin' || currentUser?.role === classAdminRole;

    if (!canManage || isLoading) {
        return <LoadingScreen />;
    }

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
                            {filteredMembers.map((member, index) => (
                                <div key={member.uid || index} className={cn("flex items-center gap-4 p-2 rounded-lg border", currentUser && member.uid === currentUser.uid && "bg-primary/10")}>
                                    <Avatar>
                                        <AvatarImage src={member.avatar} />
                                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="font-semibold">{member.name}</p>
                                        <p className="text-xs text-muted-foreground">{member.email}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                       <Badge variant={member.role === 'admin' ? 'destructive' : member.role === classAdminRole ? 'default' : 'secondary'}>
                                           {member.role === 'admin' ? "Admin Global" : member.role === classAdminRole ? "Admin Clase" : "Estudiante"}
                                       </Badge>
                                       {canManage && currentUser && member.uid !== currentUser.uid && member.role !== 'admin' && (
                                           <AlertDialog>
                                               <AlertDialogTrigger asChild>
                                                   <Button variant="ghost" size="icon" className="h-8 w-8">
                                                       {member.role === classAdminRole ? <User className="h-4 w-4 text-red-500" /> : <Crown className="h-4 w-4 text-amber-500" />}
                                                   </Button>
                                               </AlertDialogTrigger>
                                               <AlertDialogContent>
                                                   <AlertDialogHeader>
                                                       <AlertDialogTitle>Gestionar Rol</AlertDialogTitle>
                                                       <AlertDialogDescription>
                                                            ¿Qué quieres hacer con {member.name}?
                                                       </AlertDialogDescription>
                                                   </AlertDialogHeader>
                                                   <AlertDialogFooter>
                                                       <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                       {member.role === classAdminRole ? (
                                                            <AlertDialogAction onClick={() => handleRoleChange(member, 'student')}>
                                                                Quitar Admin de Clase
                                                            </AlertDialogAction>
                                                       ) : (
                                                            <AlertDialogAction onClick={() => handleRoleChange(member, classAdminRole)}>
                                                                Hacer Admin de Clase
                                                            </AlertDialogAction>
                                                       )}
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
        </div>
    );
}
