
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, Eye, EyeOff, MailCheck, User as UserIcon, CheckCircle, School, PlusCircle, AlertTriangle, Search, Copy, Check } from "lucide-react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { doc, setDoc, getDoc, collection, getDocs, query, where, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";

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
import { Logo } from "@/components/icons";
import { useState, useEffect, useMemo } from "react";
import { useAuth, useFirestore, useCollection } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import type { User, Center } from "@/lib/types";
import LoadingScreen from "@/components/layout/loading-screen";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertTitle } from "../ui/alert";
import { Badge } from "@/components/ui/badge";

type RegistrationMode = 'join' | 'personal' | 'create';

const createRegistrationSchema = (mode: RegistrationMode, isCenterValidated: boolean, isCenterNameValidated: boolean, isCodeGenerated: boolean) => z.object({
  fullName: z.string().min(2, { message: "El nombre completo debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, introduce una dirección de correo electrónico válida." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  confirmPassword: z.string().min(6, { message: "La confirmación de contraseña debe tener al menos 6 caracteres." }),
  center: z.string(),
  ageRange: z.string().min(1, { message: "Por favor, selecciona un rango de edad." }),
  course: z.string(),
  className: z.string(),
  newCenterName: z.string().optional(),
  newClassName: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
}).refine(data => {
    if (mode === 'join') return data.center.trim() !== '';
    return true;
}, {
    message: "El código de centro es obligatorio.",
    path: ["center"],
}).refine(data => {
    if (mode === 'join') return isCenterValidated;
    return true;
}, {
    message: "Debes validar tu código de centro.",
    path: ["center"],
}).refine(data => {
    if (mode === 'join' && isCenterValidated) return data.course.trim() !== '';
    return true;
}, {
    message: "Debes seleccionar un curso.",
    path: ["course"],
}).refine(data => {
    if (mode === 'join' && isCenterValidated) return data.className.trim() !== '';
    return true;
}, {
    message: "Debes seleccionar una clase.",
    path: ["className"],
}).refine(data => {
    if (mode === 'create') return isCenterNameValidated;
    return true;
}, {
    message: "Debes comprobar la disponibilidad del nombre del centro.",
    path: ["newCenterName"],
}).refine(data => {
    if (mode === 'create' && isCenterNameValidated) {
        if (!data.newClassName || data.newClassName.trim().length < 2) return false;
        const regex = /^[1-4](eso|bach)-[a-g]$/i;
        return regex.test(data.newClassName);
    }
    return true;
}, {
    message: "El formato debe ser 'CURSO-LETRA' (ej: 4ESO-B, 1bach-A).",
    path: ["newClassName"],
}).refine(data => {
    if (mode === 'create') return isCodeGenerated;
    return true;
}, {
    message: "Debes generar un código para el centro.",
    path: ["newCenterName"], // Associate error with a visible field
});


const loginSchema = z.object({
  email: z.string().email({ message: "Por favor, introduce una dirección de correo electrónico válida." }),
  password: z.string().min(6, { message: "La contraseña es necesaria." }),
});

type RegistrationSchemaType = z.infer<ReturnType<typeof createRegistrationSchema>>;
type LoginSchemaType = z.infer<typeof loginSchema>;

const steps = [
    { id: 1, fields: ['fullName', 'email', 'password', 'confirmPassword'] },
    { id: 2, fields: ['center', 'ageRange', 'course', 'className', 'role', 'newCenterName', 'newClassName'] },
];

const courseOptions = [
    { value: '1eso', label: '1º ESO' },
    { value: '2eso', label: '2º ESO' },
    { value: '3eso', label: '3º ESO' },
    { value: '4eso', label: '4º ESO' },
    { value: '1bach', label: '1º Bachillerato' },
    { value: '2bach', label: '2º Bachillerato' },
];

const classOptions = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        width="24px"
        height="24px"
        {...props}
      >
        <path
          fill="#FFC107"
          d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
        />
        <path
          fill="#FF3D00"
          d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
        />
        <path
          fill="#4CAF50"
          d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.28-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
        />
        <path
          fill="#1976D2"
          d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.712,34.406,44,28.096,44,20C44,22.659,43.862,21.35,43.611,20.083z"
        />
      </svg>
    );
}

export default function AuthPage() {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const router = useRouter();
  const { user } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [animationDirection, setAnimationDirection] = useState<'forward' | 'backward'>('forward');
  const [showPassword, setShowPassword] = useState(false);
  const [registrationMode, setRegistrationMode] = useState<RegistrationMode>('join');
  const [isCenterValidated, setIsCenterValidated] = useState(false);
  const [validatedCenter, setValidatedCenter] = useState<Center | null>(null);
  const [isCenterNameValidated, setIsCenterNameValidated] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isCodeCopied, setIsCodeCopied] = useState(false);
  
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const centersCollection = useMemo(() => firestore ? collection(firestore, 'centers') : null, [firestore]);
  const { data: allCenters } = useCollection<Center>(centersCollection, { listen: false });

  // This effect will redirect the user if they are already logged in.
  useEffect(() => {
    if (user) {
      router.replace('/home');
    }
  }, [user, router]);
  
  const registrationSchema = useMemo(() => createRegistrationSchema(registrationMode, isCenterValidated, isCenterNameValidated, !!generatedCode), [registrationMode, isCenterValidated, isCenterNameValidated, generatedCode]);

  const form = useForm<RegistrationSchemaType>({
    resolver: zodResolver(registrationSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "", email: "", password: "", confirmPassword: "", center: "",
      ageRange: "", course: "", className: "",
      newCenterName: "", newClassName: "",
    },
  });

  const availableClasses = useMemo(() => {
    if (!validatedCenter || !validatedCenter.classes) return { courses: [], classNames: [] };
    const courses = new Set<string>();
    const classNames = new Set<string>();
    validatedCenter.classes.forEach(c => {
        const [course, className] = c.name.split('-');
        if (course) courses.add(course.toLowerCase().replace('º', ''));
        if (className) classNames.add(className);
    });
    return { courses: Array.from(courses), classNames: Array.from(classNames) };
  }, [validatedCenter]);

  useEffect(() => {
    form.reset({
      fullName: form.getValues('fullName'),
      email: form.getValues('email'),
      password: form.getValues('password'),
      confirmPassword: form.getValues('confirmPassword'),
      ageRange: '',
      center: '',
      course: '',
      className: '',
      newCenterName: '',
      newClassName: ''
    });
    setIsCenterValidated(false);
    setValidatedCenter(null);
    setIsCenterNameValidated(false);
    setGeneratedCode(null);
  }, [registrationMode, form]);

  const loginForm = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function goToNextStep() {
    const fieldsToValidate = steps[currentStep].fields as (keyof RegistrationSchemaType)[];
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      if (currentStep === 1 && registrationMode === 'create' && !isCenterNameValidated) {
        form.setError('newCenterName', { type: 'manual', message: 'Debes comprobar la disponibilidad del nombre del centro.' });
        return;
      }
      setAnimationDirection('forward');
      setCurrentStep(prev => prev + 1);
    }
  }

  function goToPreviousStep() {
    setAnimationDirection('backward');
    setCurrentStep(prev => prev - 1);
  }
  
  const generateNewCode = () => `${''}${Math.floor(100 + Math.random() * 900)}-${''}${Math.floor(100 + Math.random() * 900)}`;

  async function onRegisterSubmit(values: RegistrationSchemaType) {
    setIsLoading(true);
    if (!auth || !firestore) {
        toast({ title: "Error", description: "Firebase no está inicializado.", variant: "destructive"});
        setIsLoading(false);
        return;
    }
    
    if (registrationMode === 'create' && !generatedCode) {
        toast({ title: "Error", description: "Debes generar un código para el nuevo centro.", variant: "destructive"});
        setIsLoading(false);
        return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const firebaseUser = userCredential.user;
      
      const firstInitial = values.fullName.charAt(0).toUpperCase() || 'A';
      const defaultAvatarUrl = `letter_${''}${firstInitial}_A78BFA`;
      await updateProfile(firebaseUser, { displayName: values.fullName, photoURL: defaultAvatarUrl });
      
      const userDocRef = doc(firestore, 'users', firebaseUser.uid);
      let userData: Omit<User, 'uid'>;

      if (registrationMode === 'create' && values.newCenterName && values.newClassName && generatedCode) {
        const newCenterRef = await addDoc(collection(firestore, "centers"), {
            name: values.newCenterName,
            code: generatedCode,
            classes: [{ name: values.newClassName, icalUrl: '', schedule: { Lunes: [], Martes: [], Miércoles: [], Jueves: [], Viernes: [] } }],
            createdAt: new Date(),
        });
        const [course, className] = values.newClassName!.split('-');
        
        userData = {
            name: values.fullName, email: values.email, avatar: defaultAvatarUrl,
            center: generatedCode, ageRange: values.ageRange,
            course: course.toLowerCase().replace('º',''), className: className, 
            role: 'center-admin', // Assign center-admin role
            organizationId: newCenterRef.id, trophies: 0, tasks: 0, exams: 0, pending: 0, activities: 0,
            isNewUser: true, studyMinutes: 0, streak: 0, lastStudyDay: '', ownedAvatars: [],
        };
        toast({ title: "¡Centro Creado!", description: `"${''}${values.newCenterName}" se ha creado con el código ${''}${generatedCode}.` });

      } else {
         userData = {
            name: values.fullName, email: values.email, avatar: defaultAvatarUrl,
            center: registrationMode === 'personal' ? 'personal' : values.center,
            ageRange: values.ageRange,
            course: registrationMode === 'personal' ? 'personal' : values.course,
            className: registrationMode === 'personal' ? 'personal' : values.className,
            role: 'student', 
            organizationId: registrationMode === 'join' ? validatedCenter?.uid : undefined,
            trophies: 0, tasks: 0, exams: 0, pending: 0, activities: 0,
            isNewUser: true, studyMinutes: 0, streak: 0, lastStudyDay: '', ownedAvatars: [],
        };
      }
      
      await setDoc(userDocRef, userData);
      await sendEmailVerification(firebaseUser);
      setRegistrationSuccess(true);
      
    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            toast({ title: "Error de Registro", description: "Esta dirección de correo electrónico ya está en uso. Por favor, inicia sesión.", variant: "destructive" });
        } else {
            console.error("Registration Error:", error);
            let errorMessage = "No se pudo crear la cuenta. Inténtalo de nuevo.";
            if (error.code === 'auth/weak-password') errorMessage = 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
            toast({ title: "Error de Registro", description: errorMessage, variant: "destructive" });
        }
    } finally {
        setIsLoading(false);
    }
  }

  async function onLoginSubmit(values: LoginSchemaType) {
    setIsLoading(true);
    if (!auth) {
      toast({ title: "Error de inicialización", description: "Firebase no disponible.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
  
    const ADMIN_EMAILS = ['anavarrod@iestorredelpalau.cat', 'lrotav@iestorredelpalau.cat', 'adrimax.dev@gmail.com'];
    const isAdmin = ADMIN_EMAILS.includes(values.email);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      await userCredential.user.reload();
      const freshUser = auth.currentUser;

      if (freshUser && !freshUser.emailVerified && !isAdmin) {
        toast({ title: "Verificación Requerida", description: "Verifica tu correo para iniciar sesión.", variant: "destructive" });
        await signOut(auth);
        setIsLoading(false);
        return;
      }
      router.push('/home');
    } catch (error: any) {
      console.error("Login Error:", error);
      let errorMessage = "No se pudo iniciar sesión. Intenta de nuevo.";
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        errorMessage = "El correo o la contraseña son incorrectos.";
      }
      toast({ title: "Error de Inicio de Sesión", description: errorMessage, variant: "destructive" });
    } finally {
        setIsLoading(false); 
    }
  }
  
  async function handleGoogleSignIn() {
    if (!auth || !firestore) {
      toast({ title: "Error", description: "Firebase no inicializado.", variant: "destructive" });
      return;
    }
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      const userDocRef = doc(firestore, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        const firstInitial = firebaseUser.displayName?.charAt(0).toUpperCase() || 'A';
        const newUser: Omit<User, 'uid'> = {
            name: firebaseUser.displayName || 'Usuario', email: firebaseUser.email!,
            avatar: `letter_${''}${firstInitial}_A78BFA`, center: 'default', ageRange: 'default', 
            course: 'default', className: 'default', role: 'student',
            trophies: 0, tasks: 0, exams: 0, pending: 0, activities: 0,
            isNewUser: true, studyMinutes: 0, streak: 0, lastStudyDay: '', ownedAvatars: [],
        };
        await setDoc(userDocRef, newUser);
      }
      router.push('/home');
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      let errorMessage = "No se pudo iniciar sesión con Google. Inténtalo de nuevo.";
      if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = "Ya existe una cuenta con este correo pero con otro método de inicio de sesión.";
      }
      toast({ title: "Error de Inicio de Sesión con Google", description: errorMessage, variant: "destructive" });
    } finally {
      setIsGoogleLoading(false);
    }
  }

  const progress = ((currentStep + 1) / steps.length) * 100;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === 1;

  const getAnimationClass = (stepIndex: number) => {
    if (stepIndex !== currentStep) return 'hidden';
    return animationDirection === 'forward' ? 'animate-slide-in' : 'animate-slide-in-reverse';
  };
    
  const handleAuthModeChange = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setRegistrationSuccess(false);
    loginForm.reset();
    form.reset();
    setCurrentStep(0);
    setIsLoading(false);
    setRegistrationMode('join');
    setIsCenterValidated(false);
    setValidatedCenter(null);
  }

  const formatAndSetCenterCode = (value: string) => {
    const digitsOnly = value.replace(/[^0-9]/g, '');
    let formatted = digitsOnly.slice(0, 6);
    if (formatted.length > 3) formatted = `${''}${formatted.slice(0, 3)}-${''}${formatted.slice(3)}`;
    form.setValue('center', formatted, { shouldValidate: true });
    if (isCenterValidated && formatted !== validatedCenter?.code) {
        setIsCenterValidated(false);
        setValidatedCenter(null);
        form.trigger('center');
    }
  };

  const handleValidateCenter = async () => {
      if (!firestore) return;
      setIsLoading(true);
      const centerCode = form.getValues('center');
      const q = query(collection(firestore, 'centers'), where('code', '==', centerCode));
      try {
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
              const centerDoc = querySnapshot.docs[0];
              const centerData = { uid: centerDoc.id, ...centerDoc.data() } as Center;
              setValidatedCenter(centerData);
              setIsCenterValidated(true);
              form.clearErrors('center');
              toast({ title: "Centro validado", description: `Te has unido a ${''}${centerData.name}.` });
          } else {
              setValidatedCenter(null);
              setIsCenterValidated(false);
              form.setError('center', {type: 'manual', message: 'No se encontró centro con ese código.'});
          }
      } catch (error) {
          console.error("Error validating center:", error);
          setIsCenterValidated(false);
          setValidatedCenter(null);
          form.setError('center', {type: 'manual', message: 'No se pudo comprobar el código.'});
      } finally {
          setIsLoading(false);
      }
  };
  
  const handleCheckCenterName = async () => {
    const name = form.getValues('newCenterName');
    if (!allCenters || !name || name.length < 3) {
        form.setError('newCenterName', { type: 'manual', message: 'El nombre debe tener al menos 3 caracteres.' });
        return;
    }
    setIsLoading(true);

    const normalize = (str: string) => {
        return str
            .toLowerCase()
            .replace(/^(ies|ins|institut|colegio|escuela|centro)\s+/i, '')
            .trim();
    };

    const normalizedInput = normalize(name);

    const exists = allCenters.some(center => normalize(center.name) === normalizedInput);
    
    if (exists) {
        setIsCenterNameValidated(false);
        form.setError('newCenterName', { type: 'manual', message: 'Este centro ya existe. Por favor, únete a él.' });
    } else {
        setIsCenterNameValidated(true);
        form.clearErrors('newCenterName');
        toast({ title: "Nombre Disponible", description: "Puedes crear un centro con este nombre." });
    }
    setIsLoading(false);
  };
  
  const handleNewClassNameChange = (value: string) => {
    form.setValue('newClassName', value, { shouldValidate: true });
    const match = value.match(/^([1-4](?:eso|bach))/i);
    if (match) {
        form.setValue('course', match[1].toLowerCase().replace('º',''), { shouldValidate: true });
    } else {
        form.setValue('course', '', { shouldValidate: true });
    }
  };
  
  const handleGenerateCode = () => {
      const code = generateNewCode();
      setGeneratedCode(code);
      form.setValue('center', code, { shouldValidate: true });
  }

  const handleCopyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setIsCodeCopied(true);
    toast({ title: "Código copiado" });
    setTimeout(() => setIsCodeCopied(false), 2000);
  }

  const registrationModeInfo = {
    join: { title: "Unirse a un Centro", description: "Introduce el código proporcionado por tu centro educativo para acceder a sus horarios, anuncios y clasificaciones." },
    create: { title: "Crear un Centro", description: "Si tu centro no está en Dynamic Class, puedes crearlo aquí. Te convertirás en el administrador y recibirás un código para compartir." },
    personal: { title: "Uso Personal", description: "Utiliza la aplicación de forma individual sin unirte a ningún centro. Ideal para gestionar tus propios horarios y notas." },
  }

  if (user) return <LoadingScreen />;

  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-muted/20 p-4 sm:pt-8 sm:justify-center">
      <Card className="my-8 w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex items-center justify-center gap-3">
                <Logo className="h-10 w-10 text-primary" />
                <h1 className="text-xl font-bold tracking-tight">Dynamic Class</h1>
            </div>
            {registrationSuccess ? (
                 <CardTitle className="text-2xl font-headline">¡Un último paso!</CardTitle>
            ) : (
                <>
                    <CardTitle className="text-2xl font-headline">
                        {authMode === 'register' ? 'Únete a la Clase' : 'Bienvenido de Nuevo'}
                    </CardTitle>
                    <CardDescription>
                        {authMode === 'register' ? 'Crea tu cuenta para empezar.' : 'Inicia sesión para acceder a tu panel.'}
                    </CardDescription>
                </>
            )}
        </CardHeader>
        <CardContent>
            {registrationSuccess ? (
                <div className="text-center space-y-4">
                    <MailCheck className="h-16 w-16 text-green-500 mx-auto animate-pulse-slow" />
                    <p className="text-foreground">¡Gracias por registrarte!</p>
                    <p className="text-muted-foreground text-sm">
                        Te hemos enviado un correo. Haz clic en el enlace de verificación para activar tu cuenta.
                    </p>
                    <p className="text-sm font-semibold text-muted-foreground">
                        (Si no lo ves, ¡revisa tu carpeta de spam!)
                    </p>
                    <Button onClick={() => handleAuthModeChange('login')} className="w-full mt-4">
                        Volver a Inicio de Sesión
                    </Button>
                </div>
            ) : authMode === 'register' ? (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <div className="relative overflow-hidden min-h-[450px]">
                      {steps.map((step, index) => (
                        <div key={step.id} className={cn("w-full absolute top-0", getAnimationClass(index))}>
                          {index === 0 && (
                            <div className="space-y-6">
                                <FormField control={form.control} name="fullName" render={({ field }) => (<FormItem><FormLabel>Nombre Completo</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Correo Electrónico</FormLabel><FormControl><Input type="email" placeholder="tu@ejemplo.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="password" render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Contraseña</FormLabel>
                                      <div className="relative">
                                        <FormControl><Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} className="pr-10" /></FormControl>
                                        <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                      </div>
                                      <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Repetir Contraseña</FormLabel>
                                      <div className="relative">
                                        <FormControl><Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} className="pr-10" /></FormControl>
                                        <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                      </div>
                                      <FormMessage />
                                    </FormItem>
                                )}/>
                            </div>
                          )}
                          {index === 1 && (
                            <ScrollArea className="h-[450px] pr-4">
                              <div className="space-y-4">
                                  <RadioGroup value={registrationMode} onValueChange={(v) => setRegistrationMode(v as RegistrationMode)} className="grid grid-cols-3 gap-2">
                                      <Label className={cn("rounded-lg border-2 p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors hover:bg-accent/50", registrationMode === 'join' ? "border-primary text-primary bg-primary/10" : "border-transparent text-muted-foreground")}>
                                          <School className="h-5 w-5"/> <span className="text-xs font-semibold">Unirse</span>
                                          <RadioGroupItem value="join" className="sr-only"/>
                                      </Label>
                                       <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Label className={cn("rounded-lg border-2 p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors hover:bg-accent/50", registrationMode === 'create' ? "border-primary text-primary bg-primary/10" : "border-transparent text-muted-foreground")}>
                                                    <PlusCircle className="h-5 w-5"/> <span className="text-xs font-semibold">Crear</span>
                                                </Label>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>¿Crear un nuevo centro?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Asegúrate de que tu centro no exista ya en Dynamic Class para evitar duplicados. Si creas un centro, serás su administrador.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => setRegistrationMode('create')}>Sí, crear</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                      <Label className={cn("rounded-lg border-2 p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors hover:bg-accent/50", registrationMode === 'personal' ? "border-primary text-primary bg-primary/10" : "border-transparent text-muted-foreground")}>
                                          <UserIcon className="h-5 w-5"/> <span className="text-xs font-semibold">Personal</span>
                                          <RadioGroupItem value="personal" className="sr-only"/>
                                      </Label>
                                  </RadioGroup>

                                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                                        <h4 className="font-semibold text-sm">{registrationModeInfo[registrationMode].title}</h4>
                                        <p className="text-xs text-muted-foreground">{registrationModeInfo[registrationMode].description}</p>
                                    </div>

                                  {registrationMode === 'join' && (
                                    <FormField control={form.control} name="center" render={({ field, fieldState }) => (
                                      <FormItem>
                                        <FormLabel className={cn(fieldState.invalid && !isCenterValidated && 'text-destructive')}>Código de Centro Educativo</FormLabel>
                                        <div className="flex items-center gap-2">
                                          <FormControl><Input placeholder="123-456" {...field} onChange={(e) => formatAndSetCenterCode(e.target.value)} disabled={isCenterValidated} /></FormControl>
                                          <Button type="button" onClick={handleValidateCenter} disabled={field.value.length !== 7 || isLoading || isCenterValidated} variant={isCenterValidated ? "secondary" : "default"}>
                                              {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : isCenterValidated ? <CheckCircle className="h-4 w-4"/> : "Validar"}
                                          </Button>
                                        </div>
                                        {validatedCenter && isCenterValidated ? (
                                          <FormDescription className="text-green-600 font-semibold flex items-center gap-2">
                                              <CheckCircle className="h-4 w-4" />{validatedCenter.name}
                                          </FormDescription>
                                        ) : fieldState.error ? (
                                           <FormMessage />
                                        ) : null}
                                      </FormItem>
                                    )} />
                                  )}
                                  
                                  {registrationMode === 'create' && (
                                    <div className="space-y-4">
                                      <FormField control={form.control} name="newCenterName" render={({ field, fieldState }) => (
                                          <FormItem>
                                              <FormLabel className={cn(fieldState.invalid && !isCenterNameValidated && 'text-destructive')}>Nombre del Nuevo Centro</FormLabel>
                                              <div className="flex items-center gap-2">
                                                  <FormControl>
                                                      <Input placeholder="Ej: Instituto Adrimax" {...field} disabled={isCenterNameValidated} />
                                                  </FormControl>
                                                  <Button type="button" onClick={handleCheckCenterName} disabled={!field.value || isLoading || isCenterNameValidated} variant={isCenterNameValidated ? "secondary" : "default"}>
                                                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : isCenterNameValidated ? <CheckCircle className="h-4 w-4"/> : "Comprobar"}
                                                  </Button>
                                              </div>
                                              <FormMessage />
                                          </FormItem>
                                      )} />
                                      {isCenterNameValidated && (
                                        <>
                                          <FormField control={form.control} name="newClassName" render={({ field }) => (
                                              <FormItem>
                                                  <FormLabel>Nombre de tu Primera Clase</FormLabel>
                                                  <FormControl><Input placeholder="Ej: 4ESO-B" {...field} onChange={(e) => handleNewClassNameChange(e.target.value)} /></FormControl>
                                                  <FormDescription>Usa un formato como 'CURSO-LETRA'.</FormDescription>
                                                  <FormMessage />
                                              </FormItem>
                                          )} />
                                          {form.getValues('newClassName') && !form.formState.errors.newClassName && (
                                            <div className="space-y-2 p-3 border rounded-lg bg-muted/30">
                                              <Label>Código de Acceso del Centro</Label>
                                              <p className="text-xs text-muted-foreground">Este será el código que otros usuarios necesitarán para unirse a tu centro. Guárdalo bien.</p>
                                              {generatedCode ? (
                                                  <div className="flex items-center gap-2">
                                                      <Badge variant="outline" className="text-base font-bold tracking-widest">{generatedCode}</Badge>
                                                      <Button type="button" variant="ghost" size="icon" onClick={handleCopyCode} className="h-7 w-7">
                                                          {isCodeCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                                                      </Button>
                                                  </div>
                                              ) : (
                                                  <Button type="button" onClick={handleGenerateCode} className="w-full">Generar Código</Button>
                                              )}
                                            </div>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  )}
                                  
                                  <div className={cn("space-y-4", (registrationMode === 'join' && !isCenterValidated) || (registrationMode === 'create' && !isCenterNameValidated) ? "hidden" : "block")}>
                                      {registrationMode === 'join' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField control={form.control} name="course" render={({ field }) => (<FormItem><FormLabel>Curso</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Curso..." /></SelectTrigger></FormControl><SelectContent>{courseOptions.map(option => (<SelectItem key={option.value} value={option.value} disabled={!availableClasses.courses.includes(option.value)}>{option.label}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="className" render={({ field }) => (<FormItem><FormLabel>Clase</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Clase..." /></SelectTrigger></FormControl><SelectContent>{classOptions.map(option => (<SelectItem key={option} value={option} disabled={!availableClasses.classNames.includes(option)}>{option}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                                        </div>
                                      )}
                                      <FormField control={form.control} name="ageRange" render={({ field }) => (<FormItem><FormLabel>Rango de Edad</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona tu rango de edad" /></SelectTrigger></FormControl><SelectContent><SelectItem value="12-15">12-15 años</SelectItem><SelectItem value="16-18">16-18 años</SelectItem><SelectItem value="19-22">19-22 años</SelectItem><SelectItem value="23+">23+ años</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                  </div>
                              </div>
                            </ScrollArea>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-4">
                        <Progress value={progress} className="h-2 mb-4" />
                        <div className="flex items-center gap-4">
                             <Button type="button" variant="outline" onClick={goToPreviousStep} disabled={isLoading || isGoogleLoading} className={cn(isFirstStep && 'invisible')}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Atrás
                            </Button>
                            <Button 
                                type={isLastStep ? "submit" : "button"}
                                onClick={isLastStep ? undefined : goToNextStep}
                                className="w-full" 
                                size="lg" 
                                disabled={isLoading || isGoogleLoading || (isLastStep && !form.formState.isValid)}>
                                {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...</>) : isLastStep ? ("Crear Cuenta") : ("Siguiente")}
                            </Button>
                        </div>
                    </div>
                    </form>
                </Form>
            ) : (
                <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                        <FormField control={loginForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>Correo Electrónico</FormLabel><FormControl><Input type="email" placeholder="tu@ejemplo.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={loginForm.control} name="password" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contraseña</FormLabel>
                              <div className="relative">
                                <FormControl><Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} className="pr-10" /></FormControl>
                                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                              <FormMessage />
                            </FormItem>
                        )}/>
                        <Button type="submit" className="w-full" size="lg" disabled={isLoading || isGoogleLoading}>
                            {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Iniciando...</>) : "Iniciar Sesión"}
                        </Button>
                    </form>
                </Form>
            )}

           {!registrationSuccess && (
            <>
                <div className="relative my-6"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">O continúa con</span></div></div>
                <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading}>
                    {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-5 w-5" />}
                    Google
                </Button>
                <div className="mt-6 text-center text-sm">
                    {authMode === 'register' ? (<>¿Ya tienes cuenta? <Button variant="link" className="p-0 h-auto" onClick={() => handleAuthModeChange('login')}>Inicia Sesión</Button></>) : (<>¿No tienes cuenta? <Button variant="link" className="p-0 h-auto" onClick={() => handleAuthModeChange('register')}>Crea una</Button></>)}
                </div>
            </>
           )}
            <div className="mt-8 text-center text-sm text-muted-foreground">
                <Link href="https://proyectoadrimax.framer.website/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    Impulsado por <span className="font-semibold">Proyecto Adrimax</span>
                </Link>
            </div>
        </CardContent>
      </Card>
    </main>
  );
}

    