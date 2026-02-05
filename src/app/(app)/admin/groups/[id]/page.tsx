
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/lib/hooks/use-app";
import { useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, query, where, getDocs, writeBatch, increment } from "firebase/firestore";
import type { Center, User as CenterUser, ClassDefinition, Schedule, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Search, GraduationCap, PlusCircle, Trash2, Loader2, Copy, Check, Users, CalendarCog, BookOpen, UserCog, Info, Edit, Group, User as UserIcon, ShieldCheck, Replace, UserX, Move, MessageSquare, Pin } from "lucide-react";
import LoadingScreen from "@/components/layout/loading-screen";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AvatarDisplay } from "@/components/profile/avatar-creator";
import { TeacherInfoDialog } from "@/components/layout/teacher-info-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

function AdminWelcomeDialog({ user, isOpen, onOpenChange }: { user: User, isOpen: boolean, onOpenChange: (open: boolean) => void }) {
  const isCenterAdmin = user.role === 'center-admin';
  
  const centerAdminFeatures = [
    { icon: Edit, text: "Edita la información de tu centro y su código de acceso." },
    { icon: PlusCircle, text: "Crea, modifica y elimina las clases de tu centro." },
    { icon: Users, text: "Gestiona todos los miembros, muévelos entre clases o expúlsalos." },
    { icon: ShieldCheck, text: "Promueve a otros usuarios a Administradores de Clase." },
  ];

  const classAdminFeatures = [
    { icon: UserCog, text: "Gestiona los miembros de tu clase (silenciar, expulsar, mover)." },
    { icon: Edit, text: "Edita la imagen y descripción de tu grupo de clase." },
    { icon: BookOpen, text: "Configura el horario de tu clase." },
    { icon: CalendarCog, text: "Añade el calendario iCal para sincronizar eventos." },
  ];
  
  const features = isCenterAdmin ? centerAdminFeatures : classAdminFeatures;
  const title = isCenterAdmin ? "¡Bienvenido, Administrador de Centro!" : "¡Bienvenido, Administrador de Clase!";
  const description = isCenterAdmin 
    ? "Como administrador de tu centro, tienes el control total sobre su gestión. Estas son tus principales herramientas:"
    : "Como administrador de tu clase, tienes herramientas especiales para moderar y organizar tu grupo. Esto es lo que puedes hacer:";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="text-center items-center">
          <div className="p-3 bg-primary/10 rounded-full mb-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-headline">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                <Icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">{feature.text}</p>
              </div>
            );
          })}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button className="w-full">¡Entendido!</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export default function ManageGroupPage() {
    const { user: currentUser, updateUser } = useApp();
    const router = useRouter();
    const params = useParams();
    const centerId = params.id as string;
    const [showAdminWelcome, setShowAdminWelcome] = useState(false);
    
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const centerDocRef = useMemoFirebase(() => {
        if (!firestore || !centerId) return null;
        return doc(firestore, 'centers', centerId);
    }, [firestore, centerId]);

    const { data: center, isLoading } = useDoc<Center>(centerDocRef);
    
    const allCentersCollection = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, "centers");
    }, [firestore]);
    const { data: allCenters } = useCollection<Center>(allCentersCollection);
    
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

    useEffect(() => {
        if (!currentUser || !firestore) return;

        const isCenterAdmin = currentUser.role === 'center-admin';
        const isClassAdmin = currentUser.role.startsWith('admin-');
        
        if ((isCenterAdmin || isClassAdmin) && (currentUser.adminAccessCount || 0) < 2) {
            setShowAdminWelcome(true);
            const userDocRef = doc(firestore, 'users', currentUser.uid);
            
            updateDoc(userDocRef, { adminAccessCount: increment(1) })
                .then(() => {
                    updateUser({ adminAccessCount: (currentUser.adminAccessCount || 0) + 1 });
                })
                .catch(console.error);
        }
    }, [currentUser, firestore, updateUser]);
    
    if (isLoading || !currentUser || !allCenters) {
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
            <AdminWelcomeDialog user={currentUser} isOpen={showAdminWelcome} onOpenChange={setShowAdminWelcome} />
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
                        <ClassesTab center={center} visibleClasses={filteredClasses} isGlobalAdmin={isGlobalAdmin} canManageAllClasses={canManageAllClasses}/>
                    </TabsContent>
                    {canManageAllClasses && (
                        <TabsContent value="all-members">
                            <MembersTab
                                centerId={center.uid}
                                center={center}
                                allCenters={allCenters}
                                isGlobalAdmin={isGlobalAdmin}
                                isCenterAdmin={isCenterAdmin}
                            />
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

function MembersTab({ centerId, center, allCenters, isGlobalAdmin, isCenterAdmin }: { centerId: string; center: Center, allCenters: Center[], isGlobalAdmin: boolean, isCenterAdmin: boolean }) {
    const firestore = useFirestore();
    const { user: currentUser } = useApp();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [selectedMember, setSelectedMember] = useState<CenterUser | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const membersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'), where('organizationId', '==', centerId));
    }, [firestore, centerId]);

    const { data: members, isLoading } = useCollection<CenterUser>(membersQuery);

    const filteredMembers = (members || []).filter(member => {
        const searchMatch = (member.name && member.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()));

        if (!searchMatch) return false;

        if (roleFilter === "all") return true;
        if (roleFilter === "student") return member.role === 'student';
        if (roleFilter === "class-admin") return member.role.startsWith('admin-') && member.role !== 'admin' && member.role !== 'center-admin';
        if (roleFilter === "center-admin") return member.role === 'center-admin';

        return true;
    });

    const handleKickFromCenter = async (member: CenterUser | null) => {
        if (!firestore || !member?.uid) return;
        setIsProcessing(true);
        try {
            const userDocRef = doc(firestore, 'users', member.uid);
            await updateDoc(userDocRef, {
                organizationId: "",
                center: "personal",
                course: "personal",
                className: "personal",
                role: 'student'
            });
            toast({ title: "Usuario Expulsado", description: `${member.name} ha sido expulsado del centro.`, variant: "destructive"});
            setSelectedMember(null);
        } catch (error) {
            console.error("Error kicking user from center:", error);
            toast({ title: "Error", description: "No se pudo expulsar al usuario.", variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRoleChange = async (member: CenterUser | null, newRole: string) => {
        if (!firestore || !member?.uid) return;
        setIsProcessing(true);
        try {
            const userDocRef = doc(firestore, 'users', member.uid);
            const updateData: {role: string, adminAccessCount?: number, course?: string, className?: string} = { role: newRole };
            if (newRole === 'center-admin') {
                updateData.adminAccessCount = 0;
                updateData.course = "Administración";
                updateData.className = "Administración";
            }
            await updateDoc(userDocRef, updateData);
            toast({ title: "Rol Actualizado", description: `${member.name} ahora es ${newRole === 'center-admin' ? 'Admin de Centro' : 'Estudiante'}.` });
            setSelectedMember(prev => prev ? { ...prev, role: newRole } : null);
        } catch (error) {
            console.error("Error updating role:", error);
            toast({ title: "Error", description: "No se pudo actualizar el rol.", variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Miembros del Centro</CardTitle>
                <CardDescription>Todos los usuarios que se han unido a este grupo con el código.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar miembro por nombre o email..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <SelectValue placeholder="Filtrar por rol..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los roles</SelectItem>
                            <SelectItem value="student">Estudiantes</SelectItem>
                            <SelectItem value="class-admin">Admins de Clase</SelectItem>
                            <SelectItem value="center-admin">Admins de Centro</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Separator />
                {isLoading ? (
                    <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : filteredMembers.length === 0 ? (
                     <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                        <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="font-semibold">No hay miembros</p>
                        <p className="text-sm text-muted-foreground">
                            Ningún usuario coincide con los filtros seleccionados.
                        </p>
                    </div>
                ) : (
                    <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedMember(null)}>
                        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                            {filteredMembers.map((member) => (
                                <DialogTrigger asChild key={member.uid}>
                                    <button onClick={() => setSelectedMember(member)} className="w-full flex items-center gap-4 p-2 rounded-lg border text-left hover:bg-muted/50 transition-colors">
                                        <AvatarDisplay user={member} className="h-10 w-10" />
                                        <div className="flex-1">
                                            <p className="font-semibold">{member.name}</p>
                                            <p className="text-xs text-muted-foreground">{member.email}</p>
                                        </div>
                                        <Badge variant={member.role === 'admin' ? 'destructive' : member.role === 'center-admin' ? 'secondary' : member.role.startsWith('admin-') ? 'default' : 'outline'} className={cn(member.role === 'center-admin' && "bg-purple-100 text-purple-800")}>{member.role}</Badge>
                                    </button>
                                </DialogTrigger>
                            ))}
                        </div>

                        <DialogContent>
                             {selectedMember && (
                                <>
                                    <DialogHeader className="items-center text-center">
                                        <AvatarDisplay user={selectedMember} className="h-24 w-24 mb-4" />
                                        <DialogTitle>{selectedMember.name}</DialogTitle>
                                        <DialogDescription>{selectedMember.email}</DialogDescription>
                                        <div className="flex flex-wrap justify-center items-center gap-2 pt-2">
                                            <Badge variant={selectedMember.role === 'admin' ? 'destructive' : selectedMember.role === 'center-admin' ? 'secondary' : selectedMember.role.startsWith('admin-') ? 'default' : 'secondary'} className={cn(selectedMember.role === 'center-admin' && 'bg-purple-100 text-purple-800')}>
                                                {selectedMember.role === 'admin' ? "Admin Global" : selectedMember.role === 'center-admin' ? "Admin Centro" : selectedMember.role.startsWith('admin-') ? `Admin ${selectedMember.course.toUpperCase()}-${selectedMember.className}` : "Estudiante"}
                                            </Badge>
                                            <Badge variant="outline">{center.name}</Badge>
                                            <Badge variant="outline">{selectedMember.course.toUpperCase()}-{selectedMember.className}</Badge>
                                        </div>
                                    </DialogHeader>
                                    <div className="pt-4 space-y-2">
                                        {isGlobalAdmin && selectedMember.uid !== currentUser?.uid && selectedMember.role !== 'admin' && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                     <Button variant="outline" className="w-full justify-start gap-2">
                                                        <ShieldCheck className="h-4 w-4"/> {selectedMember.role === 'center-admin' ? 'Quitar Admin de Centro' : 'Hacer Admin de Centro'}
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>¿Confirmar cambio de rol?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Vas a {selectedMember.role === 'center-admin' ? 'quitarle el rol de administrador de centro' : 'hacer administrador de centro'} a {selectedMember.name}.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleRoleChange(selectedMember, selectedMember.role === 'center-admin' ? 'student' : 'center-admin')}>Confirmar</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                        {(isGlobalAdmin || isCenterAdmin) && (
                                            <ChangeClassDialog member={selectedMember} center={center} onMove={() => setSelectedMember(null)}>
                                                <Button variant="outline" className="w-full justify-start gap-2">
                                                    <Replace className="h-4 w-4"/> Mover de Clase
                                                </Button>
                                            </ChangeClassDialog>
                                        )}
                                        {isGlobalAdmin && selectedMember.uid !== currentUser?.uid && (
                                             <MoveCenterDialog member={selectedMember} allCenters={allCenters} onMove={() => setSelectedMember(null)}>
                                                <Button variant="outline" className="w-full justify-start gap-2">
                                                    <Move className="h-4 w-4"/> Mover de Centro
                                                </Button>
                                            </MoveCenterDialog>
                                        )}
                                        {(isGlobalAdmin || isCenterAdmin) && selectedMember.uid !== currentUser?.uid && selectedMember.role !== 'admin' && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                     <Button variant="destructive" className="w-full justify-start gap-2">
                                                        <UserX className="h-4 w-4"/> Expulsar del Centro
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>¿Expulsar a {selectedMember.name}?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Esta acción desvinculará permanentemente al usuario de este centro y lo pasará a modo "Uso Personal".
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleKickFromCenter(selectedMember)} className="bg-destructive hover:bg-destructive/90">Sí, expulsar</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
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
                )}
            </CardContent>
        </Card>
    );
}

function ChangeClassDialog({ member, center, children, onMove }: { member: CenterUser, center: Center | null, children: React.ReactNode, onMove: () => void }) {
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

function MoveCenterDialog({ member, allCenters, children, onMove }: { member: CenterUser, allCenters: Center[], children: React.ReactNode, onMove: () => void }) {
    const [targetCode, setTargetCode] = useState("");
    const [verifiedCenter, setVerifiedCenter] = useState<Center | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const firestore = useFirestore();
    const { toast } = useToast();

    const handleVerify = () => {
        const found = allCenters.find(c => c.code === targetCode);
        if (found) {
            setVerifiedCenter(found);
            toast({ title: "Centro encontrado", description: `Centro: ${found.name}` });
        } else {
            setVerifiedCenter(null);
            toast({ title: "Error", description: "No se encontró ningún centro con ese código.", variant: "destructive" });
        }
    };

    const handleMove = async () => {
        if (!firestore || !member.uid || !verifiedCenter) return;
        setIsProcessing(true);
        try {
            const userDocRef = doc(firestore, 'users', member.uid);
            await updateDoc(userDocRef, {
                organizationId: verifiedCenter.uid,
                center: verifiedCenter.code,
                course: "default",
                className: "default",
                role: "student" // Demote on move
            });
            toast({ title: "Usuario Movido", description: `${member.name} ha sido movido a ${verifiedCenter.name}.` });
            onMove();
        } catch (error) {
            console.error("Error moving user between centers:", error);
            toast({ title: "Error", description: "No se pudo mover al usuario.", variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Mover {member.name} a otro centro</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="dest-code">Código del Centro de Destino</Label>
                        <div className="flex gap-2">
                            <Input id="dest-code" placeholder="000-000" value={targetCode} onChange={e => setTargetCode(e.target.value)} disabled={!!verifiedCenter} />
                            <Button onClick={handleVerify} disabled={!targetCode || !!verifiedCenter || isProcessing}>
                                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Verificar'}
                            </Button>
                        </div>
                    </div>
                    {verifiedCenter && (
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                            <p className="font-semibold text-sm text-green-700">Centro Verificado: {verifiedCenter.name}</p>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline" disabled={isProcessing}>Cancelar</Button></DialogClose>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button disabled={!verifiedCenter || isProcessing}>Mover Usuario</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Confirmar movimiento?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Vas a mover a {member.name} al centro "{verifiedCenter?.name}". Será desvinculado de su clase actual y su rol se reiniciará a 'student'. Esta acción es irreversible.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleMove}>Sí, mover</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ClassCreationInfoDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="text-muted-foreground hover:text-primary">
                    <Info className="h-4 w-4" />
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Creación de Clases y Grupos</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4 text-sm">
                    <p>Ahora tienes dos maneras de organizar a los usuarios en tu centro:</p>
                    <div className="p-4 rounded-lg border bg-muted/50">
                        <h4 className="font-semibold text-foreground mb-2">1. Clases Estándar</h4>
                        <p className="text-muted-foreground">Usa los menús desplegables para crear clases académicas con un formato fijo (ej: "4ESO-B"). Estas son las clases que los estudiantes verán y podrán seleccionar al registrarse.</p>
                    </div>
                     <div className="p-4 rounded-lg border bg-muted/50">
                        <h4 className="font-semibold text-foreground mb-2">2. Grupos Personalizados</h4>
                        <p className="text-muted-foreground">Usa el botón "Crear Grupo Personalizado" para grupos no académicos (ej: "Dirección", "Claustro", "Departamento de Mates"). Estos grupos <strong className="text-foreground">no son visibles</strong> para los estudiantes al registrarse; solo los administradores pueden asignar miembros a ellos.</p>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button>Entendido</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function CustomClassDialog({ onAdd }: { onAdd: (name: string) => Promise<void> }) {
    const [customName, setCustomName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    
    const handleAdd = async () => {
        if (!customName.trim()) return;
        setIsCreating(true);
        await onAdd(customName);
        setIsCreating(false);
        setCustomName("");
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                 <Button variant="outline" className="w-full justify-start gap-2 text-muted-foreground">
                    <PlusCircle className="h-4 w-4 text-primary" /> Crear Grupo Personalizado (ej. Dirección)
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Crear Grupo Personalizado</DialogTitle>
                    <DialogDescription>
                        Crea un grupo con un nombre único para fines administrativos o de organización interna, como "Claustro" o "Departamento de Mates".
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <Label htmlFor="custom-class-name">Nombre del Grupo</Label>
                    <Input 
                        id="custom-class-name"
                        placeholder="Ej: Dirección"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        disabled={isCreating}
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" disabled={isCreating}>Cancelar</Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button onClick={handleAdd} disabled={isCreating || !customName.trim()}>
                            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Añadir Grupo
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

const courseOptions = ['1ESO', '2ESO', '3ESO', '4ESO', '1BACH', '2BACH'];
const classOptions = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

function ClassesTab({ center, visibleClasses, isGlobalAdmin, canManageAllClasses }: { center: Center, visibleClasses: ClassDefinition[], isGlobalAdmin: boolean, canManageAllClasses: boolean }) {
    const [newStandardCourse, setNewStandardCourse] = useState("");
    const [newStandardClassName, setNewStandardClassName] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const firestore = useFirestore();
    const { toast } = useToast();

    const addClass = async (name: string) => {
        if (!firestore || !center.uid || !name.trim()) return;

        if (center.classes.some(c => c.name.toLowerCase() === name.trim().toLowerCase())) {
            toast({ title: "Error", description: "Ya existe un grupo con este nombre.", variant: "destructive" });
            return;
        }

        setIsProcessing(true);
        const centerDocRef = doc(firestore, 'centers', center.uid);
        const newClass: ClassDefinition = { name: name.trim(), icalUrl: '', schedule: { Lunes: [], Martes: [], Miércoles: [], Jueves: [], Viernes: [] }, isChatEnabled: true };

        try {
            await updateDoc(centerDocRef, {
                classes: arrayUnion(newClass)
            });
            toast({ title: "Grupo añadido", description: `El grupo "${newClass.name}" ha sido creado.` });
        } catch (error) {
            toast({ title: "Error", description: "No se pudo añadir el grupo.", variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleAddStandardClass = async () => {
        if (!newStandardCourse || !newStandardClassName) {
            toast({ title: "Error", description: "Debes seleccionar un curso y una clase.", variant: "destructive" });
            return;
        }
        const classNameToAdd = `${newStandardCourse}-${newStandardClassName}`;
        await addClass(classNameToAdd);
        setNewStandardCourse("");
        setNewStandardClassName("");
    };

    const handleRemoveClass = async (classObj: ClassDefinition) => {
        if (!firestore || !center.uid) return;
        setIsProcessing(true);
        const centerDocRef = doc(firestore, 'centers', center.uid);
        try {
            const standardCourseRegex = /^[1-4](eso|bach)$/i;
            const classNameParts = classObj.name.split('-');
            const potentialCourse = classNameParts[0]?.toLowerCase();
            const isStandardClass = classNameParts.length === 2 && standardCourseRegex.test(potentialCourse);

            let usersInClassQuery;
            if (isStandardClass) {
                usersInClassQuery = query(collection(firestore, 'users'), 
                    where('organizationId', '==', center.uid), 
                    where('course', '==', potentialCourse), 
                    where('className', '==', classNameParts[1])
                );
            } else { // It's a custom class like "Dirección"
                usersInClassQuery = query(collection(firestore, 'users'), 
                    where('organizationId', '==', center.uid), 
                    where('course', '==', 'management'), 
                    where('className', '==', classObj.name)
                );
            }

            const usersSnapshot = await getDocs(usersInClassQuery);
            
            const batch = writeBatch(firestore);

            // Reset all users found in that class
            usersSnapshot.forEach(userDoc => {
                const updateData: { course: string; className: string; role?: string } = {
                    course: "default",
                    className: "default"
                };

                // If a user was an admin of this specific class, demote them.
                if (userDoc.data().role === `admin-${classObj.name}`) {
                    updateData.role = 'student';
                }

                batch.update(userDoc.ref, updateData);
            });
            
            // Remove the class object from the center's array of classes
            batch.update(centerDocRef, {
                classes: arrayRemove(classObj)
            });

            await batch.commit();

            toast({ title: "Clase eliminada", description: `El grupo "${classObj.name}" ha sido eliminado y sus miembros desasignados.`, variant: "destructive" });
        } catch (error) {
            console.error("Error removing class and updating users:", error);
            toast({ title: "Error", description: "No se pudo eliminar la clase. Revisa los permisos.", variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handlePinClass = async (classToPin: ClassDefinition) => {
        if (!firestore || !center.uid) return;
        setIsProcessing(true);
        const centerDocRef = doc(firestore, 'centers', center.uid);
        
        const updatedClasses = center.classes.map(c => 
            c.name === classToPin.name 
            ? { ...c, isPinned: !(c.isPinned ?? false) } 
            : c
        );

        try {
            await updateDoc(centerDocRef, {
                classes: updatedClasses
            });
            toast({ title: classToPin.isPinned ? "Clase desanclada" : "Clase anclada" });
        } catch (error) {
            console.error("Error pinning class:", error);
            toast({ title: "Error", description: "No se pudo actualizar el anclaje.", variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    const sortedVisibleClasses = useMemo(() => {
        return [...visibleClasses].sort((a, b) => {
            const pinA = a.isPinned ?? false;
            const pinB = b.isPinned ?? false;
            if (pinA && !pinB) return -1;
            if (!pinA && pinB) return 1;
            return a.name.localeCompare(b.name);
        });
    }, [visibleClasses]);


    return (
        <Card>
            <CardHeader>
                <CardTitle>Clases del Centro</CardTitle>
                <CardDescription>Gestiona las clases, sus calendarios y sus miembros.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isGlobalAdmin && (
                    <>
                         <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="font-semibold">Crear Clase Estándar</Label>
                                <ClassCreationInfoDialog />
                            </div>
                            <div className="flex flex-col sm:flex-row items-end gap-2">
                                <div className="flex-1 w-full">
                                    <Label htmlFor="std-course" className="text-xs">Curso</Label>
                                    <Select value={newStandardCourse} onValueChange={setNewStandardCourse}>
                                        <SelectTrigger id="std-course">
                                            <SelectValue placeholder="Curso..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courseOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex-1 w-full">
                                    <Label htmlFor="std-class" className="text-xs">Clase</Label>
                                    <Select value={newStandardClassName} onValueChange={setNewStandardClassName}>
                                        <SelectTrigger id="std-class">
                                            <SelectValue placeholder="Letra..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={handleAddStandardClass} disabled={isProcessing || !newStandardCourse || !newStandardClassName} className="w-full sm:w-auto">
                                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                                    Añadir
                                </Button>
                            </div>
                        </div>

                        <div className="relative flex items-center">
                            <div className="flex-grow border-t border-border"></div>
                            <span className="flex-shrink mx-4 text-xs uppercase text-muted-foreground">O</span>
                            <div className="flex-grow border-t border-border"></div>
                        </div>

                        <CustomClassDialog onAdd={addClass} />
                        <Separator className="my-4" />
                    </>
                )}
                {(sortedVisibleClasses || []).length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                        <GraduationCap className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="font-semibold">No hay clases</p>
                        <p className="text-sm text-muted-foreground">
                            Añade la primera clase para este centro.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sortedVisibleClasses.map((classObj, index) => (
                           <div 
                             key={`class-${index}-${classObj.name}`} 
                             className={cn(
                                "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg border",
                                classObj.isPinned ? "bg-primary/5 border-primary/50" : "bg-muted/50"
                             )}
                           >
                             <div className="flex items-center gap-2">
                                {classObj.isPinned && <Pin className="h-4 w-4 text-primary shrink-0"/>}
                                <p className="font-semibold text-base">{classObj.name || "Clase sin nombre"}</p>
                                <TeacherInfoDialog />
                             </div>
                             <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap justify-end">
                               <Button asChild variant="secondary" size="sm" className="flex-1 sm:flex-initial">
                                  <Link href={`/admin/groups/${center.uid}/${encodeURIComponent(classObj.name)}`}>
                                   <UserCog className="h-4 w-4 mr-2" />
                                   Miembros
                                 </Link>
                               </Button>
                               <ChatSettingsDialog center={center} classObj={classObj}>
                                   <Button variant="secondary" size="sm" className="flex-1 sm:flex-initial">
                                       <MessageSquare className="h-4 w-4 mr-2"/>
                                       Chat
                                   </Button>
                               </ChatSettingsDialog>
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
                                {canManageAllClasses && (
                                   <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handlePinClass(classObj)} disabled={isProcessing}>
                                     <Pin className={cn("h-4 w-4", classObj.isPinned && "fill-primary text-primary")} />
                                   </Button>
                                )}
                               {isGlobalAdmin && (
                                   <AlertDialog>
                                     <AlertDialogTrigger asChild>
                                       <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0" disabled={isProcessing}>
                                         <Trash2 className="h-4 w-4" />
                                       </Button>
                                     </AlertDialogTrigger>
                                     <AlertDialogContent>
                                       <AlertDialogHeader>
                                         <AlertDialogTitle>¿Eliminar clase "{classObj.name}"?</AlertDialogTitle>
                                         <AlertDialogDescription>
                                           Esta acción no se puede deshacer. Los miembros de esta clase serán desasignados y pasarán a un estado "sin clase".
                                         </AlertDialogDescription>
                                       </AlertDialogHeader>
                                       <AlertDialogFooter>
                                         <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                         <AlertDialogAction onClick={() => handleRemoveClass(classObj)} className="bg-destructive hover:bg-destructive/90">Sí, eliminar</AlertDialogAction>
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

function ChatSettingsDialog({ children, center, classObj }: { children: React.ReactNode, center: Center, classObj: ClassDefinition }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isEnabled, setIsEnabled] = useState(classObj.isChatEnabled ?? true);

    useEffect(() => {
        if (isOpen) {
            setIsEnabled(classObj.isChatEnabled ?? true);
        }
    }, [isOpen, classObj.isChatEnabled]);

    const handleToggle = async (checked: boolean) => {
        if (!firestore || !center?.uid) return;

        setIsSaving(true);
        const updatedClasses = center.classes.map(c => 
            c.name === classObj.name ? { ...c, isChatEnabled: checked } : c
        );
        
        try {
            const centerDocRef = doc(firestore, 'centers', center.uid);
            await updateDoc(centerDocRef, { classes: updatedClasses });
            setIsEnabled(checked);
            toast({ title: `Chat ${checked ? 'habilitado' : 'deshabilitado'}`, description: `El chat para la clase ${classObj.name} ha sido ${checked ? 'activado' : 'desactivado'}.` });
        } catch (error) {
            console.error("Error updating chat status:", error);
            toast({ title: "Error", description: "No se pudo actualizar el estado del chat.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleSwitchChange = (checked: boolean) => {
        if (!checked) {
            setIsAlertOpen(true);
        } else {
            handleToggle(true);
        }
    };

    const handleConfirmDisable = () => {
        handleToggle(false);
        setIsAlertOpen(false);
        setIsOpen(false);
    };
    
    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>{children}</DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><MessageSquare /> Gestión del Chat de Clase</DialogTitle>
                        <DialogDescription>
                            Controla el acceso al chat para la clase <span className="font-bold">{classObj.name}</span>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg border">
                            <p className="font-semibold text-foreground mb-2">¿Qué es el Chat de Clase?</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Es un canal de comunicación en tiempo real para alumnos y profesores de una misma clase.</li>
                                <li>Permite resolver dudas, organizar trabajos y fomentar la colaboración.</li>
                                <li>Los administradores pueden moderar el contenido y gestionar a los participantes.</li>
                            </ul>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <Label htmlFor={`chat-enabled-switch-${classObj.name.replace(/\s/g, '-')}`} className="space-y-1">
                                <span className="font-medium">Habilitar Chat de Clase</span>
                                <p className="text-xs text-muted-foreground">
                                    {isEnabled ? "El chat está activo." : "El chat está desactivado."}
                                </p>
                            </Label>
                            <Switch
                                id={`chat-enabled-switch-${classObj.name.replace(/\s/g, '-')}`}
                                checked={isEnabled}
                                onCheckedChange={handleSwitchChange}
                                disabled={isSaving}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cerrar</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Deshabilitar el chat?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción impedirá que todos los miembros de la clase, incluidos los profesores, puedan enviar o ver mensajes.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDisable} className="bg-destructive hover:bg-destructive/90">Sí, deshabilitar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
