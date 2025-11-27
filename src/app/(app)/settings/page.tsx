
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useApp } from "@/lib/hooks/use-app";
import { Moon, Sun, Bell, LogOut, ChevronLeft, LifeBuoy, Globe, FileText, ExternalLink, ShieldAlert, Trash2, Languages, KeyRound, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { useAuth, useFirestore } from "@/firebase";
import { signOut } from "firebase/auth";
import { Logo } from "@/components/icons";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { SCHOOL_NAME, SCHOOL_VERIFICATION_CODE } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { doc, updateDoc } from "firebase/firestore";

export default function SettingsPage() {
  const { theme, setTheme, logout: contextLogout, deleteAccount } = useApp();
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
    contextLogout(); // This clears the user from React context and localStorage
    router.push("/");
  };
  
  const handleDeleteAccount = async () => {
      setIsDeleting(true);
      try {
        await deleteAccount();
        toast({
            title: "Cuenta eliminada",
            description: "Tu cuenta y todos tus datos han sido eliminados.",
        });
        router.push("/");
      } catch (error: any) {
        console.error("Error deleting account:", error);
        toast({
            title: "Error al eliminar la cuenta",
            description: error.message || "No se pudo eliminar tu cuenta. Por favor, intenta cerrar sesión y volver a iniciarla.",
            variant: "destructive",
        });
      } finally {
        setIsDeleting(false);
      }
  };

  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6">
      <header className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft />
        </Button>
        <h1 className="text-2xl font-bold font-headline tracking-tighter sm:text-3xl">
          Ajustes
        </h1>
      </header>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Apariencia</CardTitle>
            <CardDescription>
              Personaliza el aspecto de la aplicación.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-switch" className="flex items-center gap-2">
                {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                <span>Tema Oscuro</span>
              </Label>
              <Switch
                id="theme-switch"
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Languages className="h-5 w-5" />
                    Idioma
                    <Badge variant="outline">Beta</Badge>
                </CardTitle>
                <CardDescription>
                    Selecciona el idioma de la aplicación.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="text-sm text-muted-foreground p-4 text-center border-2 border-dashed rounded-lg">
                    Esta función estará disponible próximamente.
                </div>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificaciones</CardTitle>
            <CardDescription>
              Gestiona cómo y cuándo recibes notificaciones.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications" className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <span>Notificaciones Push</span>
              </Label>
              <Switch id="push-notifications" checked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">
                Notificaciones por Correo
              </Label>
              <Switch id="email-notifications" />
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><LifeBuoy />Soporte</CardTitle>
                <CardDescription>
                ¿Necesitas ayuda o tienes alguna sugerencia? Contáctanos.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <a href="https://proyectoadrimax.framer.website/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-md border p-4 transition-colors hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-primary" />
                        <span className="font-medium">Web Oficial</span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
                <a href="https://form.jotform.com/230622014643040" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-md border p-4 transition-colors hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <span className="font-medium">Formulario de Asistencia</span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
            </CardContent>
        </Card>

        <Card className="border-destructive/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive"><ShieldAlert />Zona Peligrosa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex items-start justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                    <div>
                        <h3 className="font-bold">Cerrar Sesión</h3>
                        <p className="text-sm text-muted-foreground">Cierra tu sesión en este dispositivo.</p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline">
                          <LogOut className="mr-2 h-4 w-4" />
                          Cerrar Sesión
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <div className="mx-auto mb-2">
                            <Logo className="h-14 w-14 text-primary" />
                          </div>
                          <AlertDialogTitle className="text-center">¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription className="text-center">
                            Esta acción cerrará tu sesión actual en este dispositivo.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="sm:justify-center">
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={handleLogout} className="bg-primary hover:bg-primary/90">
                            Confirmar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </div>
                 <div className="flex items-start justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                    <div>
                        <h3 className="font-bold">Eliminar Cuenta</h3>
                        <p className="text-sm text-muted-foreground">Esta acción es permanente e irreversible.</p>
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                             <Button variant="destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Esto eliminará permanentemente tu cuenta y todos tus datos asociados de nuestros servidores.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                                    {isDeleting ? 'Eliminando...' : 'Sí, eliminar mi cuenta'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
      </div>

       <div className="mt-12 text-center text-sm text-muted-foreground">
            <div className="mx-auto mb-4 flex items-center justify-center gap-3">
                <Logo className="h-8 w-8 text-primary" />
                <p className="font-bold text-lg text-foreground">Dynamic Class</p>
            </div>
            <Link href="https://proyectoadrimax.framer.website/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
            Impulsado por <span className="font-semibold">Proyecto Adrimax</span>
            </Link>
        </div>
    </div>
  );
}
