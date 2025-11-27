
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
import { achievements } from "@/lib/data";
import type { SummaryCardData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Edit, Settings, Loader2, Camera, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/lib/hooks/use-app";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useRef } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SCHOOL_NAME, SCHOOL_VERIFICATION_CODE } from "@/lib/constants";


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

  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold font-headline tracking-tighter sm:text-3xl">
          Mi Perfil
        </h1>
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings" aria-label="Ajustes">
            <Settings />
          </Link>
        </Button>
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
  const [finalAvatarUrl, setFinalAvatarUrl] = useState(user?.avatar || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Avatar creator state
  const [initial, setInitial] = useState(user?.name?.charAt(0).toUpperCase() || 'A');
  const [bgColor, setBgColor] = useState(AVATAR_COLORS[0]);

  useEffect(() => {
    if (user && isOpen) {
      setName(user.name);
      setCenter(user.center);
      setAgeRange(user.ageRange);
      setCourse(user.course);
      setClassName(user.className);
      setFinalAvatarUrl(user.avatar);
      setInitial(user.name?.charAt(0).toUpperCase() || 'A');
      setAvatarFile(null);
    }
  }, [user, isOpen]);
  
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFinalAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInitialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInitial = e.target.value.charAt(0).toUpperCase();
    setInitial(newInitial);
    setAvatarFile(null); // Clear file when creating avatar
  };

  const handleColorChange = (color: string) => {
    setBgColor(color);
    setAvatarFile(null); // Clear file when creating avatar
  };

  useEffect(() => {
    if (avatarFile) return; // If a file is being previewed, don't generate a URL
    const newAvatarUrl = `https://placehold.co/100x100/${bgColor}/${'FFFFFF'}?text=${initial}`;
    setFinalAvatarUrl(newAvatarUrl);
  }, [initial, bgColor, avatarFile]);
  
  if (!user) return null;
  
  async function uploadAvatar(userId: string): Promise<string> {
    if (avatarFile) {
        const storage = getStorage();
        const filePath = `avatars/${userId}/${Date.now()}_${avatarFile.name}`;
        const fileRef = storageRef(storage, filePath);
        await uploadBytes(fileRef, avatarFile);
        const downloadUrl = await getDownloadURL(fileRef);
        return downloadUrl;
    }
    // If no new file, return the current URL (either original or newly generated placehold.co)
    return finalAvatarUrl;
  }

  const handleSaveChanges = async () => {
    if (!firestore || !user) return;

    setIsLoading(true);

    try {
        const uploadedAvatarUrl = await uploadAvatar(user.uid);
        
        const updatedData = {
            name,
            center: center,
            ageRange,
            course,
            className,
            avatar: uploadedAvatarUrl,
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
        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="space-y-2">
                <Label>Foto de Perfil</Label>
                <div className="flex justify-center py-4">
                    <img src={finalAvatarUrl} alt="Avatar Preview" width={100} height={100} className="rounded-full aspect-square object-cover ring-4 ring-primary ring-offset-2" />
                </div>
                 <Tabs defaultValue="create" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="create">Crear Avatar</TabsTrigger>
                        <TabsTrigger value="upload">Subir Foto</TabsTrigger>
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
                        </div>
                    </TabsContent>
                    <TabsContent value="upload" className="pt-4">
                        <input type="file" accept="image/*" className="sr-only" ref={fileInputRef} onChange={handleAvatarUpload} />
                        <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                            <Camera className="mr-2 h-4 w-4" />
                            Seleccionar Archivo
                        </Button>
                         <p className="text-xs text-muted-foreground mt-2 text-center">Sube una imagen JPG, PNG o GIF.</p>
                    </TabsContent>
                    <Alert variant="destructive" className="mt-4 text-xs">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            Esta función es beta. La subida de archivos puede fallar. Si tienes problemas, intenta crear un avatar.
                        </AlertDescription>
                    </Alert>
                </Tabs>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="center">Código de Centro Educativo</Label>
                <Input id="center" value={center} onChange={(e) => setCenter(e.target.value)} />
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
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSaveChanges} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


function AchievementCard({ title, value, icon: Icon, color }: SummaryCardData) {
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

    

    
