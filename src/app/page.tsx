"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, Loader2, ArrowLeft } from "lucide-react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";


import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useApp } from "@/lib/hooks/use-app";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Logo } from "@/components/icons";
import { useState, useRef, useEffect } from "react";
import { useAuth, useFirestore } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import type { User } from "@/lib/types";

const registrationSchema = z.object({
  fullName: z.string().min(2, { message: "El nombre completo debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, introduce una dirección de correo electrónico válida." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  center: z.string().min(1, { message: "El centro educativo es obligatorio." }),
  ageRange: z.string().min(1, { message: "Por favor, selecciona un rango de edad." }),
  role: z.enum(["student", "teacher"], { required_error: "Debes seleccionar un rol." }),
  classCode: z.string().optional(),
  avatar: z.string().min(1, { message: "Por favor, selecciona una foto de perfil." }),
});

const loginSchema = z.object({
  email: z.string().email({ message: "Por favor, introduce una dirección de correo electrónico válida." }),
  password: z.string().min(6, { message: "La contraseña es necesaria." }),
});

type RegistrationSchemaType = z.infer<typeof registrationSchema>;
type LoginSchemaType = z.infer<typeof loginSchema>;

const steps = [
    { id: 1, fields: ['fullName', 'email', 'password'] },
    { id: 2, fields: ['center', 'ageRange', 'role', 'classCode'] },
    { id: 3, fields: ['avatar'] },
];

export default function AuthPage() {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const router = useRouter();
  const { firebaseUser } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [animationDirection, setAnimationDirection] = useState<'forward' | 'backward'>('forward');
  const [uploadedAvatarPreview, setUploadedAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if user is already logged in
  useEffect(() => {
    if (firebaseUser) {
      router.replace('/home');
    }
  }, [firebaseUser, router]);


  const form = useForm<RegistrationSchemaType>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      center: "",
      role: "student",
      classCode: "",
      avatar: PlaceHolderImages?.[0]?.imageUrl ?? '',
    },
  });

  const loginForm = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function goToNextStep() {
    const fieldsToValidate = steps[currentStep].fields as (keyof RegistrationSchemaType)[];
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setAnimationDirection('forward');
      setCurrentStep(prev => prev + 1);
    }
  }

  function goToPreviousStep() {
    setAnimationDirection('backward');
    setCurrentStep(prev => prev - 1);
  }

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setUploadedAvatarPreview(dataUrl);
        form.setValue("avatar", dataUrl, { shouldValidate: true }); 
      };
      reader.readAsDataURL(file);
    }
  };

  async function uploadAvatar(userId: string): Promise<string> {
    const storage = getStorage();
    const selectedAvatar = form.getValues("avatar");

    // Case 1: User uploaded a new file (from either the preview or a placeholder was clicked then a file was uploaded)
    if (avatarFile) {
        const filePath = `avatars/${userId}/${avatarFile.name}`;
        const fileRef = storageRef(storage, filePath);
        await uploadBytes(fileRef, avatarFile);
        return getDownloadURL(fileRef);
    }

    // Case 2: User selected a placeholder.
    // The value will be a URL from placehold.co or picsum.photos. No upload needed.
    if (selectedAvatar.startsWith('https://')) {
        return selectedAvatar;
    }
    
    // Fallback: This case should not be reached with proper validation,
    // but as a safeguard, we return a default image.
    return PlaceHolderImages?.[0]?.imageUrl ?? '';
  }
  

  async function onRegisterSubmit(values: RegistrationSchemaType) {
    setIsLoading(true);
    if (!auth || !firestore) {
        toast({ title: "Error", description: "Firebase no está inicializado.", variant: "destructive"});
        setIsLoading(false);
        return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const firebaseUser = userCredential.user;
      
      const finalAvatarUrl = await uploadAvatar(firebaseUser.uid);

      await updateProfile(firebaseUser, {
        displayName: values.fullName,
        photoURL: finalAvatarUrl,
      });

      // The user object that will be stored in Firestore
       const newUser: Omit<User, 'uid'> = {
          name: values.fullName,
          email: values.email,
          avatar: finalAvatarUrl,
          center: values.center,
          ageRange: values.ageRange,
          role: values.role,
          trophies: 0,
          tasks: 0,
          exams: 0,
          pending: 0,
          activities: 0,
      };

      await setDoc(doc(firestore, 'users', firebaseUser.uid), newUser);

    } catch (error: any) {
      console.error("Registration Error:", error);
      let errorMessage = "No se pudo crear la cuenta. Inténtalo de nuevo.";
      if (error.code === 'auth/email-already-in-use') {
          errorMessage = "Esta dirección de correo electrónico ya está en uso.";
      } else if (error.code === 'auth/weak-password') {
          errorMessage = 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
      } else if (error.code?.includes('storage')) {
          errorMessage = "No se pudo subir la imagen de perfil."
      }
      
      toast({
        title: "Error de Registro",
        description: `${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onLoginSubmit(values: LoginSchemaType) {
    setIsLoading(true);
    if (!auth) {
      toast({
        title: "Error de inicialización",
        description: "Firebase no está disponible. Por favor, recarga la página.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
  
    try {
      await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
    } catch (error: any) {
      console.error("Login Error:", error);
      let errorMessage = "No se pudo iniciar sesión. Por favor, intenta de nuevo.";
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        errorMessage = "El correo electrónico o la contraseña son incorrectos.";
      }
      toast({
        title: "Error de Inicio de Sesión",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const progress = ((currentStep + 1) / steps.length) * 100;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const getAnimationClass = (stepIndex: number) => {
    if (stepIndex !== currentStep) return 'hidden';
    return animationDirection === 'forward' ? 'animate-slide-in' : 'animate-slide-in-reverse';
  };
    
  const handleAuthModeChange = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    loginForm.reset();
    form.reset();
    setCurrentStep(0);
    setIsLoading(false);
    setUploadedAvatarPreview(null);
    setAvatarFile(null);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md shadow-2xl overflow-hidden">
        <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex items-center gap-2">
                <Logo className="h-8 w-8 text-primary" />
                <h1 className="text-xl font-bold tracking-tight">Dynamic Class</h1>
            </div>
            <CardTitle className="text-2xl font-headline">
                {authMode === 'register' ? 'Únete a la Clase' : 'Bienvenido de Nuevo'}
            </CardTitle>
            <CardDescription>
                {authMode === 'register' ? 'Crea tu cuenta para empezar a conectar.' : 'Inicia sesión para acceder a tu panel.'}
            </CardDescription>
        </CardHeader>
        <CardContent>
            {authMode === 'register' ? (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <div className="relative min-h-[380px] overflow-hidden">
                      {steps.map((step, index) => (
                        <div key={step.id} className={cn("absolute w-full", getAnimationClass(index))}>
                          {index === 0 && (
                            <div className="space-y-6">
                                <FormField control={form.control} name="fullName" render={({ field }) => (<FormItem><FormLabel>Nombre Completo</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Correo Electrónico</FormLabel><FormControl><Input type="email" placeholder="tu@ejemplo.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="password" render={({ field }) => (<FormItem><FormLabel>Contraseña</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                          )}
                          {index === 1 && (
                            <div className="space-y-6">
                                <FormField control={form.control} name="center" render={({ field }) => (<FormItem><FormLabel>Centro Educativo</FormLabel><FormControl><Input placeholder="Universidad de Springfield" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="ageRange" render={({ field }) => (<FormItem><FormLabel>Rango de Edad</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona tu rango de edad" /></SelectTrigger></FormControl><SelectContent><SelectItem value="12-15">12-15 años</SelectItem><SelectItem value="16-18">16-18 años</SelectItem><SelectItem value="19-22">19-22 años</SelectItem><SelectItem value="23+">23+ años</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="role" render={({ field }) => (<FormItem className="space-y-3"><FormLabel>Tu Rol</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="student" /></FormControl><FormLabel className="font-normal">Estudiante</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="teacher" /></FormControl><FormLabel className="font-normal">Profesor</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="classCode" render={({ field }) => (<FormItem><FormLabel>Código de Clase (Opcional)</FormLabel><FormControl><Input placeholder="Introduce el código para unirte" {...field} /></FormControl><FormDescription>Tu profesor te proporcionará este código.</FormDescription><FormMessage /></FormItem>)}/>
                            </div>
                          )}
                          {index === 2 && (
                            <FormField control={form.control} name="avatar" render={({ field }) => (
                                <FormItem className="space-y-4 text-center">
                                    <FormLabel className="text-base">Elige tu Foto de Perfil</FormLabel>
                                    <FormDescription>Selecciona un avatar o sube el tuyo.</FormDescription>
                                    <RadioGroup onValueChange={(value) => { field.onChange(value); setUploadedAvatarPreview(null); setAvatarFile(null); }} defaultValue={field.value} className="grid grid-cols-3 gap-4 pt-4">
                                    {PlaceHolderImages?.slice(0,5).map((img) => (
                                        <FormItem key={img.id} className="relative">
                                            <FormControl><RadioGroupItem value={img.imageUrl} className="sr-only" /></FormControl>
                                            <FormLabel className="cursor-pointer"><Image src={img.imageUrl} alt={img.description} width={80} height={80} className={`rounded-full aspect-square object-cover transition-all mx-auto ${field.value === img.imageUrl ? 'ring-4 ring-primary ring-offset-2' : 'opacity-60 hover:opacity-100'}`} /></FormLabel>
                                        </FormItem>
                                    ))}
                                    <FormItem className="relative">
                                        <FormControl><input type="file" accept="image/*" className="sr-only" ref={fileInputRef} onChange={handleAvatarUpload} /></FormControl>
                                        <FormLabel className="cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                            {uploadedAvatarPreview ? (
                                                <Image src={uploadedAvatarPreview} alt="Avatar subido" width={80} height={80} className="rounded-full aspect-square object-cover transition-all mx-auto ring-4 ring-primary ring-offset-2" />
                                            ) : (
                                                <div className="h-[80px] w-[80px] rounded-full flex flex-col items-center justify-center gap-1 border-2 border-dashed bg-muted hover:bg-muted/80 mx-auto"><Camera className="h-6 w-6" /><span className="text-xs">Subir</span></div>
                                            )}
                                        </FormLabel>
                                    </FormItem>
                                    </RadioGroup>
                                    <FormMessage className="pt-2" />
                                </FormItem>
                            )} />
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-2">
                        <Progress value={progress} className="h-2 mb-4" />
                        <div className="flex items-center gap-4">
                            <Button type="button" variant="outline" onClick={goToPreviousStep} disabled={isFirstStep || isLoading} className={cn(isFirstStep && 'invisible', 'transition-opacity')}><ArrowLeft className="mr-2 h-4 w-4" /> Atrás</Button>
                            <Button type={!isLastStep ? 'button' : 'submit'} onClick={!isLastStep ? goToNextStep : undefined} className="w-full" size="lg" disabled={isLoading}>
                                {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando Cuenta...</>) : isLastStep ? ("Crear Cuenta") : ("Siguiente")}
                            </Button>
                        </div>
                    </div>
                    </form>
                </Form>
            ) : (
                <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                        <FormField control={loginForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>Correo Electrónico</FormLabel><FormControl><Input type="email" placeholder="tu@ejemplo.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={loginForm.control} name="password" render={({ field }) => (<FormItem><FormLabel>Contraseña</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                            {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Iniciando Sesión...</>) : "Iniciar Sesión"}
                        </Button>
                    </form>
                </Form>
            )}

            <div className="mt-6 text-center text-sm">
                {authMode === 'register' ? (
                    <>¿Ya tienes una cuenta? <Button variant="link" className="p-0 h-auto" onClick={() => handleAuthModeChange('login')}>Inicia Sesión</Button></>
                ) : (
                    <>¿No tienes una cuenta? <Button variant="link" className="p-0 h-auto" onClick={() => handleAuthModeChange('register')}>Crea una</Button></>
                )}
            </div>

        </CardContent>
      </Card>
    </main>
  );
}
