
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useApp } from "@/lib/hooks/use-app";
import { Moon, Sun, Bell, LogOut, ChevronLeft, LifeBuoy, Globe, FileText, ExternalLink, ShieldAlert, Trash2, Languages, KeyRound, Loader2, Eye, EyeOff, Sparkles, Shield, FlaskConical, Cat, ShieldCheck, Save, GraduationCap, Pin, Mail, Copy, Check, Gift } from "lucide-react";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { useAuth, useFirestore } from "@/firebase";
import { signOut, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
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
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { SCHOOL_VERIFICATION_CODE } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { doc, increment, updateDoc } from "firebase/firestore";


export default function SettingsPage() {
  const { user, theme, setTheme, logout: contextLogout, deleteAccount, isChatBubbleVisible, toggleChatBubble, saveScannedDocs, setSaveScannedDocs } = useApp();
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

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

  const handleCopy = () => {
    navigator.clipboard.writeText("info.dynamicclass@gmail.com");
    setIsCopied(true);
    toast({ title: '✓ Copiado', description: 'Correo de soporte copiado al portapapeles.' });
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  const isUserAdmin = user?.role === 'admin';
  const isUserClassAdmin = user?.role?.startsWith('admin-') && user.role !== 'admin' && user.organizationId;


  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6">
      <header className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft />
        </Button>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold font-headline tracking-tighter sm:text-3xl">
            Ajustes
          </h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline">V3.0.22.6</Badge>
            <Badge variant="outline" className="border-accent/50 bg-accent/10 text-accent">Beta - Tester</Badge>
          </div>
        </div>
      </header>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Apariencia y Accesibilidad</CardTitle>
            <CardDescription>
              Personaliza el aspecto y el comportamiento de la aplicación.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <Separator />
            <div className="flex items-center justify-between">
                <Label htmlFor="ai-bubble-switch" className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span>Burbuja de IA</span>
                </Label>
                <Switch
                    id="ai-bubble-switch"
                    checked={isChatBubbleVisible}
                    onCheckedChange={toggleChatBubble}
                />
            </div>
            <Separator />
             <div className="flex items-center justify-between">
                <Label htmlFor="save-scans-switch" className="flex items-center gap-2">
                    <Save className="h-5 w-5" />
                    <span>Guardar archivos en el historial</span>
                </Label>
                <Switch
                    id="save-scans-switch"
                    checked={saveScannedDocs}
                    onCheckedChange={setSaveScannedDocs}
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
              <CardTitle>Seguridad</CardTitle>
              <CardDescription>
                  Gestiona la seguridad de tu cuenta.
              </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                  <Label htmlFor="change-password-button" className="flex items-center gap-2">
                      <KeyRound className="h-5 w-5" />
                      <span>Contraseña</span>
                  </Label>
                  <ChangePasswordDialog />
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
                <CardTitle className="flex items-center gap-2"><LifeBuoy />Soporte y Legal</CardTitle>
                <CardDescription>
                Ayuda, sugerencias y políticas de la aplicación.
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
                <div className="flex items-center justify-between rounded-md border p-4">
                    <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-primary" />
                        <div className="flex flex-col">
                            <span className="font-medium">Contacto y Soporte</span>
                            <span className="text-sm text-muted-foreground">info.dynamicclass@gmail.com</span>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleCopy} className="h-8 w-8">
                        {isCopied ? <Check className="h-4 w-4 text-green-500"/> : <Copy className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                </div>
                <a href="https://docs.google.com/forms/d/e/1FAIpQLSdVdZ5H7L4Je1-NbX-3TTmvZX6kRVyHhagokwaBNYwZQOUlfw/viewform?usp=sharing&ouid=117084013399350850231" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-md border-accent/50 bg-accent/10 p-4 transition-colors hover:bg-accent/20">
                    <div className="flex items-center gap-3">
                        <FlaskConical className="h-5 w-5 text-accent" />
                        <span className="font-medium text-accent">Formulario para Beta Testers</span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
                <PrivacyPolicyDialog />
            </CardContent>
        </Card>

        {isUserAdmin ? (
             <Card className="border-blue-500/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-500"><ShieldCheck />Panel de Administrador</CardTitle>
                     <CardDescription>Gestiona usuarios, grupos y otros aspectos de la aplicación.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild className="w-full">
                        <Link href="/admin">
                            <Shield className="mr-2 h-4 w-4" />
                            Acceder al Panel
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        ) : isUserClassAdmin ? (
            <Card className="border-green-500/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600"><GraduationCap />Panel de Gestión de Clase</CardTitle>
                    <CardDescription>Gestiona los miembros, horarios y calendario de tu clase.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                        <Link href={`/admin/groups/${user.organizationId}`}>
                            <Shield className="mr-2 h-4 w-4" />
                            Gestionar mi Clase
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        ) : (
             <DeveloperPortalDialog />
        )}
        
        { (isUserAdmin || isUserClassAdmin) && <DeveloperPortalDialog /> }


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
            <div className="flex justify-center gap-2 mb-2">
                <Badge variant="outline">V3.0.22.6</Badge>
                <Badge variant="outline" className="border-accent/50 bg-accent/10 text-accent">Beta - Tester</Badge>
            </div>
            <Link href="https://proyectoadrimax.framer.website/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
            Impulsado por <span className="font-semibold">Proyecto Adrimax</span>
            </Link>
        </div>
    </div>
  );
}


const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, { message: "La contraseña actual es obligatoria." }),
  newPassword: z.string().min(6, { message: "La nueva contraseña debe tener al menos 6 caracteres." }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las nuevas contraseñas no coinciden.",
  path: ["confirmPassword"],
});

type PasswordChangeSchema = z.infer<typeof passwordChangeSchema>;

function ChangePasswordDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const { toast } = useToast();
  const auth = useAuth();

  const form = useForm<PasswordChangeSchema>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: PasswordChangeSchema) => {
    setIsLoading(true);
    const user = auth?.currentUser;

    if (!user || !user.email) {
      toast({
        title: "Error",
        description: "No se pudo encontrar el usuario. Intenta iniciar sesión de nuevo.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, values.currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Re-authentication successful, now update the password
      await updatePassword(user, values.newPassword);

      toast({
        title: "¡Contraseña actualizada!",
        description: "Tu contraseña ha sido cambiada exitosamente.",
      });
      setIsOpen(false);
      form.reset();

    } catch (error: any) {
      console.error("Password change error:", error);
      let description = "Ocurrió un error inesperado.";
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        description = "La contraseña actual es incorrecta.";
        form.setError("currentPassword", { type: "manual", message: description });
      }
      toast({
        title: "Error al cambiar la contraseña",
        description: description,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button id="change-password-button" variant="outline">Cambiar Contraseña</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar tu Contraseña</DialogTitle>
          <DialogDescription>
            Introduce tu contraseña actual y luego la nueva.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña Actual</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva Contraseña</FormLabel>
                   <div className="relative">
                    <FormControl>
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                  <FormControl>
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button variant="outline" type="button" disabled={isLoading}>Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function PrivacyPolicyDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="flex w-full items-center justify-between rounded-md border p-4 transition-colors hover:bg-muted/50 text-left">
                    <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-primary" />
                        <span className="font-medium">Políticas de Privacidad y Seguridad</span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl w-[95vw] max-h-[80vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-4 border-b">
                    <DialogTitle>Políticas de Privacidad y Seguridad de Dynamic Class</DialogTitle>
                    <DialogDescription>
                        Última actualización: 24 de Mayo de 2024
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-1 overflow-y-auto">
                    <div className="px-6 py-4 space-y-6 text-sm text-muted-foreground">
                        <section>
                            <h3 className="font-bold text-foreground text-base mb-2">1. Quiénes Somos</h3>
                            <p>Dynamic Class es una aplicación desarrollada por <span className="font-semibold text-foreground">Adrià Navarro</span> y <span className="font-semibold text-foreground">Luc Rota</span>, como parte de la iniciativa <span className="font-semibold text-foreground">Proyecto Adrimax</span>. Nuestro objetivo es proporcionar herramientas educativas innovadoras y seguras para estudiantes y educadores.</p>
                        </section>

                        <section>
                            <h3 className="font-bold text-foreground text-base mb-2">2. Información que Recopilamos y Cómo la Usamos</h3>
                            <ul className="list-disc list-inside space-y-4 pl-4 mt-2">
                                <li>
                                    <strong>Información de Perfil:</strong> Recopilamos tu nombre, correo, rango de edad y avatar para personalizar tu experiencia. Si te unes a un centro, también tu curso y clase para mostrarte contenido relevante como anuncios y horarios.
                                </li>
                                <li>
                                    <strong>Contenido Privado del Usuario:</strong>
                                    <ul className="list-circle list-inside space-y-2 pl-6 mt-2">
                                        <li><strong>Chats con la IA:</strong> Tus conversaciones son privadas y se usan para que herramientas como la generación de flashcards puedan crear material de estudio personalizado para ti.</li>
                                        <li><strong>Anotaciones y Escaneos:</strong> Tus notas personales son privadas. Los documentos que escaneas se guardan en el historial de tu dispositivo (puedes desactivarlo) y no se suben a nuestros servidores.</li>
                                    </ul>
                                </li>
                                <li>
                                    <strong>Gamificación y Rankings:</strong> Para fomentar una competición sana, tu nombre, avatar y trofeos son visibles para otros usuarios de **tu mismo centro educativo**. El resto de tus datos de progreso son privados.
                                </li>
                                 <li>
                                    <strong>Resúmenes Semanales (Opcional):</strong> Si activas esta función, usaremos los datos de tu calendario de clase y tu historial de uso privado para generar un correo electrónico semanal. Este correo, enviado desde nuestra cuenta oficial, te ofrecerá un resumen de tu rendimiento y las tareas pendientes para la semana siguiente. Puedes activar o desactivar esta opción en cualquier momento desde los ajustes.
                                </li>
                            </ul>
                        </section>
                        
                        <section>
                            <h3 className="font-bold text-foreground text-base mb-2">3. Gestión de Centros y Roles de Administrador</h3>
                            <p>Dynamic Class implementa un sistema de roles para la gestión de contenido:</p>
                            <ul className="list-disc list-inside space-y-2 pl-4 mt-2">
                                <li><strong>Administradores Globales:</strong> Tienen control total sobre la plataforma, incluyendo la creación de centros, la gestión de todos los usuarios y la publicación de anuncios globales.</li>
                                <li><strong>Administradores de Clase:</strong> Son usuarios (generalmente delegados o profesores) a los que un Administrador Global otorga permisos para gestionar un grupo específico. Pueden administrar los miembros, el horario, el calendario y los anuncios de **su propia clase únicamente**.</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="font-bold text-foreground text-base mb-2">4. Seguridad de los Datos y RGPD</h3>
                             <p>La seguridad de tus datos es nuestra máxima prioridad. La aplicación está construida sobre <span className="font-semibold text-foreground">Google Cloud</span> y <span className="font-semibold text-foreground">Firebase</span>, garantizando encriptación y autenticación robustas. Implementamos estrictas reglas de acceso para que solo tú puedas ver y modificar tu información privada.</p>
                             <div className="mt-4 space-y-2">
                                <p>Dynamic Class es un desarrollo independiente. El administrador de cada clase es el **único responsable** de introducir y gestionar los datos de su grupo, incluyendo la información del profesorado necesaria para el horario. Es su responsabilidad garantizar el cumplimiento del RGPD en su entorno.</p>
                             </div>
                        </section>

                        <section>
                            <h3 className="font-bold text-foreground text-base mb-2">5. Uso de Nombres de Marcas en la Tienda</h3>
                             <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
                                <Gift className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-foreground mb-1">Recompensas y Marcas</h4>
                                    <p>Las marcas que aparecen en la sección de "Tienda" (ej. Amazon, Spotify, etc.) no están afiliadas ni patrocinan Dynamic Class. Sus nombres se utilizan únicamente con fines representativos para identificar el tipo de tarjeta regalo que se entregará al usuario como recompensa. El canjeo de trofeos se traduce en la entrega de un producto real de dicha marca, gestionado por nuestro equipo.</p>
                                </div>
                            </div>
                        </section>

                         <section>
                            <h3 className="font-bold text-foreground text-base mb-2">6. Tus Derechos y Control</h3>
                            <p>Tienes control total sobre tus datos:</p>
                             <ul className="list-disc list-inside space-y-1 pl-4 mt-2">
                                <li><strong>Acceso y Modificación:</strong> Puedes ver y editar tu información de perfil en cualquier momento.</li>
                                <li><strong>Desactivar Funciones:</strong> Puedes desactivar el guardado del historial de documentos escaneados desde los Ajustes.</li>
                                <li><strong>Eliminación:</strong> Puedes eliminar tu cuenta y todos tus datos de forma permanente e irreversible desde la sección "Zona Peligrosa" en Ajustes.</li>
                            </ul>
                        </section>
                        
                        <section>
                            <h3 className="font-bold text-foreground text-base mb-2">7. Contacto</h3>
                            <p>Si tienes alguna pregunta, no dudes en contactarnos a través del <span className="font-semibold text-foreground">Formulario de Asistencia</span> disponible en la sección de Soporte.</p>
                        </section>
                    </div>
                </ScrollArea>
                <DialogFooter className="p-6 pt-4 border-t">
                    <DialogClose asChild>
                        <Button>Entendido</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function DeveloperPortalDialog() {
  const [pin, setPin] = useState('');

  // No logic for now, just UI
  const handleConfirm = () => {
    // Future logic will go here
  };

  return (
    <Dialog>
        <DialogTrigger asChild>
            <Card className="border-purple-400/30 bg-purple-500/5 cursor-pointer hover:bg-purple-500/10 transition-colors">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-600 dark:text-purple-400"><FlaskConical />Portal de Desarrolladores</CardTitle>
                    <CardDescription className="text-purple-600/80 dark:text-purple-400/80">Acceso a funciones experimentales y de depuración.</CardDescription>
                </CardHeader>
            </Card>
        </DialogTrigger>
        <DialogContent className="max-w-sm">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Pin className="h-5 w-5"/>Acceso para Desarrolladores</DialogTitle>
                <DialogDescription>Introduce el PIN de administrador para acceder a las funciones avanzadas.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Label htmlFor="pin-input" className="sr-only">PIN</Label>
                <Input 
                    id="pin-input"
                    type="password"
                    placeholder="••••"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="text-center text-2xl tracking-[0.5em]"
                    maxLength={4}
                />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button onClick={handleConfirm}>Confirmar</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}
