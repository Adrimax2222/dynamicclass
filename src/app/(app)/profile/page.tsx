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
import type { SummaryCardData, User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Edit, Settings, Loader2 } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/lib/hooks/use-app";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { useToast } from "@/hooks/use-toast";


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
                    <Skeleton className="h-10 w-full col-span-2" />
                </CardContent>
            </Card>
        </div>
    );
  }

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
          <p className="text-muted-foreground">{user.center}</p>
          <EditProfileDialog user={user} />
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardHeader>
            <CardTitle className="text-base">Detalles</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
             <div>
                <p className="font-bold">{user.role === 'student' ? 'Estudiante' : 'Profesor'}</p>
                <p className="text-muted-foreground">Rol</p>
            </div>
            <div>
                <p className="font-bold">{user.ageRange}</p>
                <p className="text-muted-foreground">Edad</p>
            </div>
            <div className="col-span-2">
                 <p className="font-bold break-words">{user.email}</p>
                <p className="text-muted-foreground">Correo Electrónico</p>
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

function EditProfileDialog({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(user.name);
  const [center, setCenter] = useState(user.center);
  const [ageRange, setAgeRange] = useState(user.ageRange);
  const firestore = useFirestore();
  const { toast } = useToast();
  const { updateUser } = useApp();

  const handleSaveChanges = async () => {
    if (!firestore || !user) return;
    setIsLoading(true);

    const updatedData = {
        name,
        center,
        ageRange,
    };

    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, updatedData);
      
      // Update user in the context to reflect changes immediately
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar tu Perfil</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre Completo</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="center">Centro Educativo</Label>
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
