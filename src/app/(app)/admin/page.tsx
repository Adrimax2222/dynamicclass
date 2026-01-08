
"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/lib/hooks/use-app";
import { useRouter } from "next/navigation";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, getDocs, writeBatch, query, orderBy, updateDoc, deleteDoc, increment, addDoc, serverTimestamp, setDoc, where } from "firebase/firestore";
import type { User, Center } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Group, Trophy, ChevronLeft, Search, UserX, Trash2, CheckCircle, Ban, Loader2, Wrench, PlusCircle, MinusCircle, Copy, Check, Edit, Pin, Image as ImageIcon, RefreshCw } from "lucide-react";
import LoadingScreen from "@/components/layout/loading-screen";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SCHOOL_NAME, SCHOOL_VERIFICATION_CODE } from "@/lib/constants";
import { fullSchedule } from "@/lib/data";
import { AvatarDisplay } from "@/components/profile/avatar-creator";

export default function AdminPage() {
    const { user } = useApp();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            if (user.role?.startsWith('admin-')) {
                // It's a class admin, redirect them to their specific group management page
                if (user.organizationId) {
                     router.replace(`/admin/groups/${user.organizationId}`);
                } else {
                     // Fallback if class details are missing, though they should exist for a class admin
                     router.replace('/home');
                }
            } else if (user.role !== 'admin') {
                router.replace('/home');
            }
        }
    }, [user, router]);

    if (!user || user.role !== 'admin') {
        return <LoadingScreen />;
    }

    return (
        <div className="container mx-auto max-w-4xl p-4 sm:p-6">
            <header className="mb-8 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ChevronLeft />
                </Button>
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold font-headline tracking-tighter sm:text-3xl">
                        Panel de Administrador
                    </h1>
                </div>
            </header>

            <Tabs defaultValue="users" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="users"><Users className="h-4 w-4 mr-2" />Usuarios</TabsTrigger>
                    <TabsTrigger value="trophies"><Trophy className="h-4 w-4 mr-2" />Trofeos</TabsTrigger>
                    <TabsTrigger value="groups"><Group className="h-4 w-4 mr-2" />Grupos</TabsTrigger>
                </TabsList>

                <div className="py-6">
                    <TabsContent value="users">
                        <UsersTab />
                    </TabsContent>
                    <TabsContent value="trophies">
                        <TrophiesTab />
                    </TabsContent>
                    <TabsContent value="groups">
                        <GroupsTab />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}

function UsersList({ children, onUsersLoaded }: { children: (users: User[], isLoading: boolean, searchTerm: string, handleSearch: (term: string) => void) => React.ReactNode, onUsersLoaded?: (users: User[]) => void }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            if (!firestore) return;
            setIsLoading(true);
            try {
                const usersQuery = query(collection(firestore, "users"));
                const querySnapshot = await getDocs(usersQuery);
                const usersList = querySnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as User));
                setUsers(usersList);
                if (onUsersLoaded) onUsersLoaded(usersList);
            } catch (error) {
                console.error("Error fetching users:", error);
                toast({ title: "Error", description: "No se pudieron cargar los usuarios.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, [firestore, toast, onUsersLoaded]);

    const filteredUsers = users.filter(user =>
        (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return children(filteredUsers, isLoading, searchTerm, setSearchTerm);
}


function UsersTab() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({});

    const handleToggleBan = async (targetUser: User) => {
        if (!firestore) return;
        setIsProcessing(prev => ({...prev, [targetUser.uid]: true}));
        try {
            const userDocRef = doc(firestore, 'users', targetUser.uid);
            const newBanStatus = !targetUser.isBanned;
            await updateDoc(userDocRef, { isBanned: newBanStatus });
            
            setAllUsers(prevUsers => prevUsers.map(u => u.uid === targetUser.uid ? { ...u, isBanned: newBanStatus } : u));

            toast({
                title: `Usuario ${newBanStatus ? 'baneado' : 'desbaneado'}`,
                description: `${targetUser.name} ha sido ${newBanStatus ? 'restringido' : 'reactivado'}.`,
            });
        } catch (error) {
            console.error("Error toggling ban:", error);
            toast({ title: "Error", description: "No se pudo actualizar el estado del usuario.", variant: "destructive" });
        } finally {
            setIsProcessing(prev => ({...prev, [targetUser.uid]: false}));
        }
    };
    
    const handleDeleteUser = async (targetUser: User) => {
         if (!firestore) return;
        setIsProcessing(prev => ({...prev, [targetUser.uid]: true}));
        try {
            const userDocRef = doc(firestore, 'users', targetUser.uid);
            await deleteDoc(userDocRef);
            setAllUsers(prevUsers => prevUsers.filter(u => u.uid !== targetUser.uid));
            toast({
                title: "Usuario Eliminado",
                description: `El perfil de ${targetUser.name} ha sido eliminado de Firestore.`,
                variant: "destructive"
            });
        } catch (error) {
            console.error("Error deleting user:", error);
            toast({ title: "Error", description: "No se pudo eliminar el usuario de Firestore.", variant: "destructive" });
        } finally {
            setIsProcessing(prev => ({...prev, [targetUser.uid]: false}));
        }
    };

    return (
        <UsersList onUsersLoaded={setAllUsers}>
            {(users, isLoading, searchTerm, handleSearch) => (
                <Card>
                    <CardHeader>
                        <CardTitle>Gestión de Usuarios</CardTitle>
                        <CardDescription>Modera, banea o elimina usuarios de la aplicación.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nombre o email..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                        <Separator />
                        {isLoading ? (
                            <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin"/></div>
                        ) : (
                            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                                {users.map(u => (
                                    <div key={u.uid} className="flex items-center gap-4 p-2 rounded-lg border">
                                        <AvatarDisplay user={u} className="h-10 w-10" showHat={false} />
                                        <div className="flex-1">
                                            <p className="font-semibold">{u.name}</p>
                                            <p className="text-xs text-muted-foreground">{u.email}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant={u.role === 'admin' ? 'destructive' : u.role?.startsWith('admin-') ? 'secondary' : 'outline'}>{u.role}</Badge>
                                                {u.isBanned && <Badge variant="destructive" className="bg-orange-500">Baneado</Badge>}
                                            </div>
                                        </div>
                                        {u.role !== 'admin' && (
                                            <div className="flex gap-1">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="outline" size="icon" className="h-8 w-8" disabled={isProcessing[u.uid]}>
                                                            {isProcessing[u.uid] ? <Loader2 className="h-4 w-4 animate-spin"/> : u.isBanned ? <CheckCircle className="h-4 w-4 text-green-500"/> : <Ban className="h-4 w-4 text-orange-500"/>}
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>¿Confirmar acción?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Vas a {u.isBanned ? 'desbanear' : 'banear'} a {u.name}. {u.isBanned ? 'Podrá volver a iniciar sesión.' : 'No podrá iniciar sesión hasta que se revierta esta acción.'}
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleToggleBan(u)}>{u.isBanned ? 'Desbanear' : 'Banear Usuario'}</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive" size="icon" className="h-8 w-8" disabled={isProcessing[u.uid]}>
                                                            {isProcessing[u.uid] ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4"/>}
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>¿Eliminar permanentemente?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Esta acción eliminará el perfil de {u.name} de la base de datos de Firestore, pero **no** eliminará su cuenta de autenticación de Firebase. Es irreversible.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteUser(u)} className="bg-destructive hover:bg-destructive/90">Sí, eliminar</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </UsersList>
    );
}

function TrophiesTab() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [trophyAmounts, setTrophyAmounts] = useState<Record<string, number>>({});
    const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({});

    const handleUpdateTrophies = async (targetUser: User, amount: number) => {
        if (!firestore || amount === 0) return;
        setIsProcessing(prev => ({...prev, [targetUser.uid]: true}));
        
        try {
            const userDocRef = doc(firestore, 'users', targetUser.uid);
            await updateDoc(userDocRef, { trophies: increment(amount) });
            
            setAllUsers(prevUsers => prevUsers.map(u => u.uid === targetUser.uid ? { ...u, trophies: (u.trophies || 0) + amount } : u));
            setTrophyAmounts(prev => ({...prev, [targetUser.uid]: 0})); // Reset input field

            toast({
                title: "Trofeos Actualizados",
                description: `Se han ${amount > 0 ? 'añadido' : 'quitado'} ${Math.abs(amount)} trofeos a ${targetUser.name}.`,
            });
        } catch (error) {
            console.error("Error updating trophies:", error);
            toast({ title: "Error", description: "No se pudieron actualizar los trofeos.", variant: "destructive" });
        } finally {
            setIsProcessing(prev => ({...prev, [targetUser.uid]: false}));
        }
    };

    const handleAmountChange = (uid: string, value: string) => {
        const amount = parseInt(value, 10);
        setTrophyAmounts(prev => ({ ...prev, [uid]: isNaN(amount) ? 0 : amount }));
    };

    return (
        <UsersList onUsersLoaded={setAllUsers}>
            {(users, isLoading, searchTerm, handleSearch) => (
                 <Card>
                    <CardHeader>
                        <CardTitle>Gestión de Trofeos</CardTitle>
                        <CardDescription>Añade o quita trofeos a los usuarios manualmente.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nombre o email..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                        <Separator />
                         {isLoading ? (
                            <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin"/></div>
                        ) : (
                            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                                {users.map(u => (
                                     <div key={u.uid} className="flex items-center gap-4 p-2 rounded-lg border">
                                        <AvatarDisplay user={u} className="h-10 w-10" showHat={false} />
                                        <div className="flex-1">
                                            <p className="font-semibold">{u.name}</p>
                                            <div className="flex items-center gap-1.5 text-sm">
                                                <Trophy className="h-4 w-4 text-yellow-400" />
                                                <span className="font-bold">{u.trophies || 0}</span>
                                            </div>
                                        </div>
                                         {u.role !== 'admin' && (
                                            <div className="flex gap-2 items-center">
                                                <Input 
                                                    type="number" 
                                                    className="w-20 h-8" 
                                                    placeholder="Cant."
                                                    value={trophyAmounts[u.uid] || ""}
                                                    onChange={(e) => handleAmountChange(u.uid, e.target.value)}
                                                    disabled={isProcessing[u.uid]}
                                                />
                                                <Button 
                                                    variant="outline" 
                                                    size="icon" 
                                                    className="h-8 w-8" 
                                                    onClick={() => handleUpdateTrophies(u, -(trophyAmounts[u.uid] || 0))}
                                                    disabled={isProcessing[u.uid] || !trophyAmounts[u.uid] || trophyAmounts[u.uid] <= 0}
                                                >
                                                    <MinusCircle className="h-4 w-4 text-red-500"/>
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="icon" 
                                                    className="h-8 w-8"
                                                    onClick={() => handleUpdateTrophies(u, trophyAmounts[u.uid] || 0)}
                                                    disabled={isProcessing[u.uid] || !trophyAmounts[u.uid] || trophyAmounts[u.uid] <= 0}
                                                >
                                                    <PlusCircle className="h-4 w-4 text-green-500"/>
                                                </Button>
                                            </div>
                                         )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </UsersList>
    );
}

function GroupsTab() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [centerName, setCenterName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    
    const centersCollection = useMemoFirebase(() => {
        if (!firestore) return null;
        // Use a stable query, sorting will be done on the client
        return query(collection(firestore, "centers"), orderBy("createdAt", "desc"));
    }, [firestore]);

    const { data: centersData = [], isLoading } = useCollection<Center>(centersCollection);
    
    // Client-side sorting for pinned status
    const centers = centersData.sort((a, b) => {
        const aPinned = a.isPinned ?? false;
        const bPinned = b.isPinned ?? false;
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        return 0; // Keep original order for items with same pinned status
    });

    const generateCode = () => {
        const part1 = Math.floor(100 + Math.random() * 900);
        const part2 = Math.floor(100 + Math.random() * 900);
        return `${part1}-${part2}`;
    };

    const handleAddCenter = async () => {
        if (!firestore || !centerName.trim()) return;
        setIsCreating(true);
        try {
            const newCenter = {
                name: centerName.trim(),
                code: generateCode(),
                classes: [],
                createdAt: serverTimestamp(),
                isPinned: false,
                imageUrl: "",
            };
            await addDoc(collection(firestore, "centers"), newCenter);
            toast({ title: "Centro Creado", description: `El centro "${newCenter.name}" se ha añadido con el código ${newCenter.code}.` });
            setCenterName("");
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Error creating center:", error);
            toast({ title: "Error", description: "No se pudo crear el centro.", variant: "destructive" });
        } finally {
            setIsCreating(false);
        }
    };
    
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <Card>
            <CardHeader className="flex-row items-start justify-between">
                <div>
                    <CardTitle>Gestión de Grupos</CardTitle>
                    <CardDescription>Añade y gestiona los centros educativos y sus clases.</CardDescription>
                </div>
                 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><PlusCircle className="mr-2 h-4 w-4"/>Añadir Centro</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Nuevo Centro Educativo</DialogTitle>
                            <DialogDescription>
                                Crea un nuevo centro y genera un código de acceso único para los usuarios.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-2">
                            <Label htmlFor="center-name">Nombre del Centro</Label>
                            <Input 
                                id="center-name"
                                placeholder="Ej: IES Torre del Palau"
                                value={centerName}
                                onChange={(e) => setCenterName(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline" disabled={isCreating}>Cancelar</Button>
                            </DialogClose>
                            <Button onClick={handleAddCenter} disabled={isCreating || !centerName.trim()}>
                                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                Crear Centro
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
                <Separator />
                {isLoading ? (
                    <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin"/></div>
                ) : centers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                        <Group className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="font-semibold">No hay centros educativos</p>
                        <p className="text-sm text-muted-foreground">
                            Crea el primer centro para empezar a organizar los grupos.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                        {centers.map(center => (
                            <div key={center.uid} className="flex items-center gap-4 p-3 rounded-lg border">
                                <div className="p-2 bg-muted rounded-md relative">
                                    {center.imageUrl ? (
                                        <img src={center.imageUrl} alt={center.name} className="h-8 w-8 object-cover rounded-sm" />
                                    ) : (
                                        <Group className="h-8 w-8 text-muted-foreground" />
                                    )}
                                    {center.isPinned && <Pin className="h-4 w-4 text-white bg-primary rounded-full p-0.5 absolute -top-1 -right-1" />}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold">{center.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-xs text-muted-foreground">Código:</p>
                                        <Badge variant="outline">{center.code}</Badge>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(center.code)}>
                                            {copiedCode === center.code ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <EditCenterDialog center={center}>
                                        <Button variant="outline" size="sm" className="bg-blue-500/10 border-blue-500/20 text-blue-600 hover:bg-blue-500/20 hover:text-blue-700 w-full">
                                            <Edit className="mr-2 h-4 w-4" />
                                            Editar
                                        </Button>
                                    </EditCenterDialog>
                                    <Button asChild variant="secondary" size="sm" className="w-full">
                                        <Link href={`/admin/groups/${center.uid}`}>Gestionar</Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function EditCenterDialog({ center, children }: { center: Center, children: React.ReactNode }) {
    const [name, setName] = useState(center.name);
    const [imageUrl, setImageUrl] = useState(center.imageUrl || "");
    const [isSaving, setIsSaving] = useState(false);
    const [isUpdatingCode, setIsUpdatingCode] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const firestore = useFirestore();
    const { toast } = useToast();

    const generateCode = () => {
        const part1 = Math.floor(100 + Math.random() * 900);
        const part2 = Math.floor(100 + Math.random() * 900);
        return `${part1}-${part2}`;
    };

    const handleSaveChanges = async () => {
        if (!firestore) return;
        setIsSaving(true);
        try {
            const centerDocRef = doc(firestore, 'centers', center.uid);
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
        if (!firestore) return;
        try {
            const centerDocRef = doc(firestore, 'centers', center.uid);
            await updateDoc(centerDocRef, { isPinned: !center.isPinned });
            toast({ title: center.isPinned ? "Centro Desanclado" : "Centro Anclado" });
        } catch (error) {
            toast({ title: "Error", description: "No se pudo cambiar el estado de anclaje.", variant: "destructive" });
        }
    };
    
    const handleUpdateCode = async () => {
        if (!firestore) return;
        setIsUpdatingCode(true);
        try {
            const newCode = generateCode();
            const oldCode = center.code;
            const centerDocRef = doc(firestore, 'centers', center.uid);
            
            // 1. Find all users with the old code
            const usersQuery = query(collection(firestore, 'users'), where('center', '==', oldCode));
            const usersSnapshot = await getDocs(usersQuery);

            // 2. Create a batch write
            const batch = writeBatch(firestore);

            // 3. Update the center's code
            batch.update(centerDocRef, { code: newCode });
            
            // 4. Update each user's center code
            usersSnapshot.forEach(userDoc => {
                batch.update(userDoc.ref, { center: newCode });
            });
            
            // 5. Commit the batch
            await batch.commit();

            toast({ title: "Código Actualizado", description: `El nuevo código es ${newCode} y se ha actualizado para todos los miembros.` });
        } catch (error) {
            toast({ title: "Error", description: "No se pudo actualizar el código.", variant: "destructive" });
        } finally {
            setIsUpdatingCode(false);
        }
    };
    
    const handleDeleteCenter = async () => {
        if (!firestore) return;
        setIsDeleting(true);
        try {
            const centerDocRef = doc(firestore, 'centers', center.uid);
            await deleteDoc(centerDocRef);
            toast({ title: "Centro Eliminado", description: `El centro "${center.name}" ha sido eliminado.`, variant: "destructive" });
        } catch (error) {
             toast({ title: "Error", description: "No se pudo eliminar el centro.", variant: "destructive" });
        } finally {
            setIsDeleting(false);
        }
    };


    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Centro: {center.name}</DialogTitle>
                    <DialogDescription>Gestiona los detalles de este centro educativo.</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="edit-center-name">Nombre del Centro</Label>
                        <Input id="edit-center-name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="edit-center-image">URL de la Imagen del Centro</Label>
                        <Input id="edit-center-image" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://ejemplo.com/logo.png" />
                    </div>
                    <div className="space-y-4">
                         <Button variant="outline" className="w-full justify-start gap-2" onClick={handleTogglePin}>
                            <Pin className="h-4 w-4"/> {center.isPinned ? 'Desanclar Centro' : 'Anclar Centro'}
                        </Button>
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
                                        Sí, eliminar
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" disabled={isSaving}>Cancelar</Button>
                    </DialogClose>
                    <Button onClick={handleSaveChanges} disabled={isSaving}>
                         {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                         Guardar Cambios
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
    

    
