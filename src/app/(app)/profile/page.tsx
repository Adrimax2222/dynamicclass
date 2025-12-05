
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SummaryCardData, User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Edit, Settings, Loader2, Camera, Trophy, NotebookText, FileCheck2, ListChecks, Medal, Star, Infinity, LineChart, Flame, BrainCircuit, Clock, PawPrint, Rocket, Pizza, Gamepad2, Ghost, Palmtree, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/lib/hooks/use-app";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useRef, useMemo } from "react";
import { doc, updateDoc, arrayUnion, increment } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription as AlertDialogDescriptionComponent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { SCHOOL_NAME, SCHOOL_VERIFICATION_CODE } from "@/lib/constants";
import { RankingDialog } from "@/components/layout/ranking-dialog";
import { GradeCalculatorDialog } from "@/components/layout/grade-calculator-dialog";

const ADMIN_EMAILS = ['anavarrod@iestorredelpalau.cat', 'lrotav@iestorredelpalau.cat'];

export default function ProfilePage() {
  const { user } = useApp();

  if (!user) {
    return (
        <div className="container mx-auto max-w-4xl p-4 sm:p-6 space-y-8">
            <Skeleton className="h-8 w-1/2" />
            <Card className="mb-8 overflow-hidden shadow-lg">
                <Skeleton className="h-24 w-full" />
                <CardContent className="p-4 text-center -mt-16">
                    <Skeleton className="mx-auto h-24 w-24 rounded-full" />
                    <Skeleton className="mt-4 h-8 w-1/3 mx-auto" />
                    <Skeleton className="mt-2 h-4 w-1/2 mx-auto" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full col-span-2" />
                </CardContent>
            </Card>
        </div>
    );
  }

  const courseMap: Record<string, string> = {
    "1eso": "1º ESO",
    "2eso": "2º ESO",
    "3eso": "3º ESO",
    "4eso": "4º ESO",
    "1bach": "1º Bachillerato",
    "2bach": "2º Bachillerato",
  }
  
  const displayCenter = user.center === SCHOOL_VERIFICATION_CODE ? SCHOOL_NAME : user.center;

  const achievements: Omit<SummaryCardData, 'isAnnouncement'>[] = [
    { title: 'Tareas Completadas', value: user.tasks, icon: NotebookText, color: 'text-blue-400' },
    { title: 'Exámenes Superados', value: user.exams, icon: FileCheck2, color: 'text-green-400' },
  ];

  const isAdmin = ADMIN_EMAILS.includes(user.email);
  const isScheduleAvailable = user?.course === "4eso" && user?.className === "B";
  const streakCount = user.streak || 0;
  
  const formatStudyTime = (totalMinutes: number = 0) => {
    if (totalMinutes < 1) return "0m";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };


  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold font-headline tracking-tighter sm:text-3xl">
          Mi Perfil
        </h1>
        <div className="flex items-center gap-2">
            <Link href="/study" className={cn("flex items-center gap-1 cursor-pointer hover:bg-muted p-1 rounded-full transition-colors", streakCount > 0 ? "bg-orange-100/50 dark:bg-orange-900/20" : "")}>
                <Flame className={cn("h-5 w-5", streakCount > 0 ? "text-orange-500" : "text-muted-foreground")} />
                <span className="font-bold text-sm">{streakCount}</span>
            </Link>
            <RankingDialog user={user}>
               <div className="flex items-center gap-1 cursor-pointer hover:bg-muted p-1 rounded-full transition-colors">
                   <Trophy className="h-5 w-5 text-yellow-400" />
                   <span className="font-bold text-sm">
                       {isAdmin ? <Infinity className="h-4 w-4" /> : user.trophies}
                   </span>
               </div>
            </RankingDialog>
            <Button variant="ghost" size="icon" asChild>
                <Link href="/settings" aria-label="Ajustes">
                    <Settings />
                </Link>
            </Button>
        </div>
      </header>

      <Card className="mb-8 overflow-hidden shadow-lg">
        <div className="bg-muted/40 h-24" />
        <CardContent className="p-4 text-center -mt-16">
          <Avatar className="mx-auto h-24 w-24 ring-4 ring-background">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <h2 className="mt-4 text-2xl font-bold">{user.name}</h2>
          {user.role === 'admin' && (
            <Badge variant="destructive" className="mt-2">Admin</Badge>
          )}
          <p className="text-muted-foreground mt-2">{displayCenter}</p>
          <EditProfileDialog />
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardHeader>
            <CardTitle className="text-base">Detalles</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
             <div>
                <p className="text-muted-foreground">Rol</p>
                <p className="font-bold">{user.role === 'student' ? 'Estudiante' : user.role === 'admin' ? 'Administrador' : 'Profesor'}</p>
            </div>
            <div>
                <p className="text-muted-foreground">Edad</p>
                <p className="font-bold">{user.ageRange}</p>
            </div>
            <div>
                <p className="text-muted-foreground">Curso</p>
                <p className="font-bold">{courseMap[user.course] || user.course}</p>
            </div>
            <div>
                <p className="text-muted-foreground">Clase</p>
                <p className="font-bold">{user.className}</p>
            </div>
            <div className="col-span-2">
                <p className="text-muted-foreground">Correo Electrónico</p>
                <p className="font-bold break-words">{user.email}</p>
            </div>
        </CardContent>
      </Card>
      
      <section>
        <h3 className="text-xl font-semibold font-headline mb-4">Logros</h3>
        <div className="grid grid-cols-2 gap-4">
            <RankingDialog user={user}>
              <Card className="hover:border-primary/50 transition-colors duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-lg cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Trofeos Ganados</CardTitle>
                  <Trophy className={cn("h-5 w-5 text-muted-foreground", "text-yellow-400")} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isAdmin ? <Infinity className="h-6 w-6" /> : user.trophies}
                  </div>
                </CardContent>
              </Card>
            </RankingDialog>
            
            <GradeCalculatorDialog isScheduleAvailable={isScheduleAvailable} user={user} openTo="report">
                <Card className="hover:border-primary/50 transition-colors duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-lg cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mi Evaluación</CardTitle>
                        <LineChart className="h-5 w-5 text-muted-foreground text-purple-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                           Ver Informe <span aria-hidden="true">→</span>
                        </div>
                    </CardContent>
                </Card>
            </GradeCalculatorDialog>
            
            <Link href="/study" className="cursor-pointer">
              <AchievementCard 
                  title="Tiempo de Estudio"
                  value={formatStudyTime(user.studyMinutes)}
                  icon={Clock}
                  color="text-teal-400"
              />
            </Link>

            <Link href="/study" className="cursor-pointer">
                <AchievementCard 
                    title="Racha de Estudio"
                    value={streakCount}
                    icon={Flame}
                    color={streakCount > 0 ? "text-orange-500" : "text-muted-foreground"}
                />
            </Link>

            {achievements.map(card => (
                <AchievementCard key={card.title} {...card} />
            ))}
        </div>
      </section>
    </div>
  );
}

const AVATAR_COLORS = [
  "F87171", // red
  "FBBF24", // amber
  "34D399", // emerald
  "60A5FA", // blue
  "A78BFA", // violet
  "F472B6", // pink
];

const SHOP_AVATARS = [
    { id: 'paw', icon: PawPrint, price: 50, url: 'https://placehold.co/100x100/f87171/FFFFFF?text=🐾' },
    { id: 'rocket', icon: Rocket, price: 75, url: 'https://placehold.co/100x100/60a5fa/FFFFFF?text=🚀' },
    { id: 'pizza', icon: Pizza, price: 25, url: 'https://placehold.co/100x100/fbbf24/FFFFFF?text=🍕' },
    { id: 'gamepad', icon: Gamepad2, price: 100, url: 'https://placehold.co/100x100/a78bfa/FFFFFF?text=🎮' },
    { id: 'ghost', icon: Ghost, price: 150, url: 'https://placehold.co/100x100/d1d5db/FFFFFF?text=👻' },
    { id: 'palmtree', icon: Palmtree, price: 60, url: 'https://placehold.co/100x100/34d399/FFFFFF?text=🌴' },
];

function EditProfileDialog() {
  const { user, updateUser } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [center, setCenter] = useState(user?.center || "");
  const [ageRange, setAgeRange] = useState(user?.ageRange || "");
  const [course, setCourse] = useState(user?.course || "");
  const [className, setClassName] = useState(user?.className || "");
  const firestore = useFirestore();
  const { toast } = useToast();
  
  // Avatar state
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(user?.avatar || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Avatar creator state
  const [initial, setInitial] = useState(user?.name?.charAt(0).toUpperCase() || 'A');
  const [bgColor, setBgColor] = useState(AVATAR_COLORS[0]);
  
  const isSaveDisabled = useMemo(() => {
    if (!user) return true;
    const selectedShopAvatar = SHOP_AVATARS.find(a => a.url === selectedAvatarUrl);
    if (selectedShopAvatar && !(user.ownedAvatars || []).includes(selectedShopAvatar.url)) {
        return true; // Cannot save if selected avatar is from shop and not owned
    }
    return false;
  }, [selectedAvatarUrl, user]);

  useEffect(() => {
    if (user && isOpen) {
      setName(user.name);
      setCenter(user.center);
      setAgeRange(user.ageRange);
      setCourse(user.course);
      setClassName(user.className);
      setSelectedAvatarUrl(user.avatar);
      setInitial(user.name?.charAt(0).toUpperCase() || 'A');
    }
  }, [user, isOpen]);
  
  const handleInitialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInitial = e.target.value.charAt(0).toUpperCase();
    setInitial(newInitial);
    const newAvatarUrl = `https://placehold.co/100x100/${bgColor}/${'FFFFFF'}?text=${newInitial || 'A'}`;
    setSelectedAvatarUrl(newAvatarUrl);
  };

  const handleColorChange = (color: string) => {
    setBgColor(color);
    const newAvatarUrl = `https://placehold.co/100x100/${color}/${'FFFFFF'}?text=${initial || 'A'}`;
    setSelectedAvatarUrl(newAvatarUrl);
  };

  const handlePurchaseAvatar = async (avatar: typeof SHOP_AVATARS[0]) => {
     if (!firestore || !user || user.trophies < avatar.price) {
        toast({ title: "Fondos insuficientes", description: "No tienes suficientes trofeos para comprar este avatar.", variant: "destructive"});
        return;
     }
     
     setIsLoading(true);
     try {
        const userDocRef = doc(firestore, 'users', user.uid);
        await updateDoc(userDocRef, {
            trophies: increment(-avatar.price),
            ownedAvatars: arrayUnion(avatar.url),
        });
        updateUser({ trophies: user.trophies - avatar.price, ownedAvatars: [...(user.ownedAvatars || []), avatar.url] });
        toast({ title: "¡Compra realizada!", description: `Has adquirido el avatar ${avatar.id}.`});
     } catch (error) {
        console.error("Error purchasing avatar:", error);
        toast({ title: "Error", description: "No se pudo completar la compra.", variant: "destructive"});
     } finally {
        setIsLoading(false);
     }
  }
  
  if (!user) return null;
  
  const handleSaveChanges = async () => {
    if (!firestore || !user) return;

    if (isSaveDisabled) {
        toast({ title: "Avatar no adquirido", description: "Debes comprar este avatar antes de poder guardarlo.", variant: "destructive"});
        return;
    }

    setIsLoading(true);

    try {
        const updatedData: Partial<User> = {
            name,
            center: center,
            ageRange,
            course,
            className,
            avatar: selectedAvatarUrl,
        };

        const userDocRef = doc(firestore, 'users', user.uid);
        await updateDoc(userDocRef, updatedData);
      
        updateUser(updatedData);

        toast({
            title: "¡Perfil actualizado!",
            description: "Tu información ha sido guardada correctamente.",
        });
        setIsOpen(false); 
    } catch (error) {
        console.error("Error updating profile:", error);
        toast({
            title: "Error",
            description: "No se pudo actualizar tu perfil. Inténtalo de nuevo.",
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mt-4">
          <Edit className="h-4 w-4 mr-2" />
          Editar Perfil
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-[95vw]">
        <DialogHeader>
          <DialogTitle>Editar tu Perfil</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1 pr-4">
            <div className="space-y-2">
                <Label>Foto de Perfil</Label>
                <div className="flex justify-center py-4">
                    <img src={selectedAvatarUrl} alt="Avatar Preview" width={100} height={100} className="rounded-full aspect-square object-cover ring-4 ring-primary ring-offset-2" />
                </div>
                 <Tabs defaultValue="create" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="create">Editar</TabsTrigger>
                        <TabsTrigger value="shop">Tienda</TabsTrigger>
                    </TabsList>
                    <TabsContent value="create" className="pt-4">
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4 items-center">
                               <Label className="text-right">Inicial</Label>
                                <Input 
                                    value={initial}
                                    onChange={handleInitialChange}
                                    maxLength={1}
                                    className="col-span-2"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4 items-center">
                                <Label className="text-right">Color</Label>
                                <div className="col-span-2 grid grid-cols-6 gap-2">
                                    {AVATAR_COLORS.map(color => (
                                        <button key={color} type="button" onClick={() => handleColorChange(color)} className={cn("w-8 h-8 rounded-full border", bgColor === color && "ring-2 ring-primary ring-offset-2")} style={{ backgroundColor: `#${color}` }} />
                                    ))}
                                </div>
                            </div>
                            
                            <div className="space-y-2 pt-4">
                                <Label htmlFor="name">Nombre Completo</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="center">Código de Centro Educativo</Label>
                                <Input id="center" value={center} onChange={(e) => setCenter(e.target.value)} placeholder="123-456" />
                                 <p className="text-xs text-muted-foreground">
                                    Introduce el código proporcionado por tu centro para unirte a su grupo.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ageRange">Rango de Edad</Label>
                                <Select onValueChange={setAgeRange} value={ageRange}>
                                    <SelectTrigger id="ageRange">
                                        <SelectValue placeholder="Selecciona tu rango de edad" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="12-15">12-15 años</SelectItem>
                                        <SelectItem value="16-18">16-18 años</SelectItem>
                                        <SelectItem value="19-22">19-22 años</SelectItem>
                                        <SelectItem value="23+">23+ años</SelectItem>
                                        <SelectItem value="No especificado">No especificado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="course">Curso</Label>
                                    <Select onValueChange={setCourse} value={course}>
                                        <SelectTrigger id="course"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1eso">1º ESO</SelectItem>
                                            <SelectItem value="2eso">2º ESO</SelectItem>
                                            <SelectItem value="3eso">3º ESO</SelectItem>
                                            <SelectItem value="4eso">4º ESO</SelectItem>
                                            <SelectItem value="1bach">1º Bachillerato</SelectItem>
                                            <SelectItem value="2bach">2º Bachillerato</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="className">Clase</Label>
                                    <Select onValueChange={setClassName} value={className}>
                                        <SelectTrigger id="className"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="A">A</SelectItem>
                                            <SelectItem value="B">B</SelectItem>
                                            <SelectItem value="C">C</SelectItem>
                                            <SelectItem value="D">D</SelectItem>
                                            <SelectItem value="E">E</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Correo Electrónico</Label>
                                <Input id="email" value={user.email} disabled />
                                <p className="text-xs text-muted-foreground">El correo electrónico no se puede cambiar.</p>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="shop" className="pt-4">
                        <div className="grid grid-cols-3 gap-4">
                            {SHOP_AVATARS.map((avatar, index) => {
                                const isOwned = user.ownedAvatars?.includes(avatar.url);
                                const isSelected = selectedAvatarUrl === avatar.url;
                                return (
                                    <div key={avatar.id} className="relative group">
                                        <button 
                                            type="button" 
                                            onClick={() => setSelectedAvatarUrl(avatar.url)}
                                            className={cn("w-full aspect-square rounded-lg flex items-center justify-center transition-all transform hover:scale-105", isSelected && "ring-4 ring-primary ring-offset-2")}
                                        >
                                            <img src={avatar.url} alt={avatar.id} className="rounded-md object-cover" />
                                        </button>
                                        <div className="mt-2 text-center">
                                            {isOwned ? (
                                                <Badge variant="secondary" className="flex items-center gap-1">
                                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                                    Adquirido
                                                </Badge>
                                            ) : (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button size="sm" variant="outline" className="h-8 w-full" disabled={isLoading}>
                                                            <Trophy className="h-4 w-4 mr-1 text-yellow-400" />
                                                            {avatar.price}
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Confirmar Compra</AlertDialogTitle>
                                                            <AlertDialogDescriptionComponent>
                                                                ¿Quieres comprar este avatar por {avatar.price} trofeos? Tus trofeos actuales son {user.trophies}.
                                                            </AlertDialogDescriptionComponent>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handlePurchaseAvatar(avatar)}>Comprar</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSaveChanges} disabled={isLoading || isSaveDisabled}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


function AchievementCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: React.ElementType; color: string; }) {
    return (
      <Card className="hover:border-primary/50 transition-colors duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className={cn("h-5 w-5 text-muted-foreground", color)} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
        </CardContent>
      </Card>
    );
  }

    

    

    