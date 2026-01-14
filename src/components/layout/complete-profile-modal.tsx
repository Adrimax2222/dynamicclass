
"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { User, Center } from "@/lib/types";
import { useFirestore, useCollection } from "@/firebase";
import { collection, getDocs, query, where, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, UserCheck, User as UserIcon, CheckCircle, School, PlusCircle, AlertTriangle, Search, Copy, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Label } from "../ui/label";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Alert, AlertTitle } from "../ui/alert";
import { Badge } from "../ui/badge";

type RegistrationMode = 'join' | 'personal' | 'create';

const createProfileSchema = (mode: RegistrationMode, isCenterValidated: boolean, isCenterNameValidated: boolean, isCodeGenerated: boolean) => z.object({
  center: z.string(),
  ageRange: z.string().min(1, { message: "Por favor, selecciona un rango de edad." }),
  course: z.string(),
  className: z.string(),
  newCenterName: z.string().optional(),
  newClassName: z.string().optional(),
}).refine(data => {
    if (mode === 'join') return data.center.trim() !== '';
    return true;
}, {
    message: "El código de centro es obligatorio.",
    path: ['center'],
}).refine(data => {
    if (mode === 'join') return isCenterValidated;
    return true;
}, {
    message: "Debes validar tu código de centro.",
    path: ['center'],
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
    path: ['newCenterName'],
}).refine(data => {
    if (mode === 'create' && isCenterNameValidated) {
        if (!data.newClassName || data.newClassName.trim().length < 2) return false;
        const regex = /^[1-4](eso|bach)-[a-e]$/i;
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

type ProfileSchema = z.infer<ReturnType<typeof createProfileSchema>>;

interface CompleteProfileModalProps {
  user: User;
  onSave: (updatedData: Partial<User>) => void;
}

const courseOptions = [
    { value: '1eso', label: '1º ESO' },
    { value: '2eso', label: '2º ESO' },
    { value: '3eso', label: '3º ESO' },
    { value: '4eso', label: '4º ESO' },
    { value: '1bach', label: '1º Bachillerato' },
    { value: '2bach', label: '2º Bachillerato' },
];

const classOptions = ['A', 'B', 'C', 'D', 'E'];

export default function CompleteProfileModal({ user, onSave }: CompleteProfileModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<RegistrationMode>('join');
    const [isCenterValidated, setIsCenterValidated] = useState(false);
    const [validatedCenter, setValidatedCenter] = useState<Center | null>(null);
    const [isCenterNameValidated, setIsCenterNameValidated] = useState(false);
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [isCodeCopied, setIsCodeCopied] = useState(false);
    const { toast } = useToast();
    
    const firestore = useFirestore();
    const centersCollection = useMemo(() => firestore ? collection(firestore, 'centers') : null, [firestore]);
    const { data: allCenters } = useCollection<Center>(centersCollection, { listen: false });

    const profileSchema = useMemo(() => createProfileSchema(mode, isCenterValidated, isCenterNameValidated, !!generatedCode), [mode, isCenterValidated, isCenterNameValidated, generatedCode]);

    const form = useForm<ProfileSchema>({
        resolver: zodResolver(profileSchema),
        mode: "onChange",
        defaultValues: {
            center: "",
            ageRange: "",
            course: "",
            className: "",
            newCenterName: "",
            newClassName: ""
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
        form.reset();
        setIsCenterValidated(false);
        setValidatedCenter(null);
        setIsCenterNameValidated(false);
        setGeneratedCode(null);
    }, [mode, form]);

    const generateNewCode = () => `${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`;

    const onSubmit = async (values: ProfileSchema) => {
        setIsLoading(true);
        if (mode === 'create' && !isCenterNameValidated) {
          form.setError('newCenterName', { type: 'manual', message: 'Debes comprobar la disponibilidad del nombre del centro.' });
          setIsLoading(false);
          return;
        }

        if (mode === 'personal') {
            onSave({ center: 'personal', course: 'personal', className: 'personal', ageRange: values.ageRange });
        } else if (mode === 'join' && isCenterValidated) {
            onSave({
                center: values.center,
                course: values.course,
                className: values.className,
                ageRange: values.ageRange,
                organizationId: validatedCenter?.uid
            });
        } else if (mode === 'create') {
            if (!firestore || !values.newCenterName || !values.newClassName) {
                toast({ title: "Error", description: "Faltan datos para crear el centro.", variant: "destructive" });
                setIsLoading(false);
                return;
            }
             if (!generatedCode) {
                toast({ title: "Error", description: "Debes generar un código para el nuevo centro.", variant: "destructive"});
                setIsLoading(false);
                return;
            }
            try {
                const newCenterRef = await addDoc(collection(firestore, "centers"), {
                    name: values.newCenterName,
                    code: generatedCode,
                    classes: [{ name: values.newClassName, icalUrl: '', schedule: { Lunes: [], Martes: [], Miércoles: [], Jueves: [], Viernes: [] } }],
                    createdAt: serverTimestamp(),
                });
                
                const [course, className] = values.newClassName.split('-');
                
                // First save with 'student' role
                await onSave({
                    center: generatedCode,
                    course: course.toLowerCase().replace('º',''),
                    className: className,
                    ageRange: values.ageRange,
                    organizationId: newCenterRef.id,
                    role: 'student', // Save as student first
                });
                
                // Then, update the role to admin
                if (firestore && user) {
                    const userDocRef = doc(firestore, 'users', user.uid);
                    await updateDoc(userDocRef, {
                        role: `admin-${values.newClassName}`
                    });
                }
                
                toast({ title: "¡Centro Creado!", description: `"${values.newCenterName}" se ha creado con el código ${generatedCode}.` });

            } catch (err) {
                 toast({ title: "Error", description: "No se pudo crear el nuevo centro.", variant: "destructive" });
            }
        }
        setIsLoading(false);
    };
    
    const formatAndSetCenterCode = (value: string) => {
        const digitsOnly = value.replace(/[^0-9]/g, '');
        let formatted = digitsOnly.slice(0, 6);
        if (formatted.length > 3) formatted = `${formatted.slice(0, 3)}-${formatted.slice(3)}`;
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
                toast({ title: "Centro validado", description: `Te has unido a ${centerData.name}.` });
            } else {
                setValidatedCenter(null);
                setIsCenterValidated(false);
                form.setError('center', { type: "manual", message: "No se encontró ningún centro con ese código." });
            }
        } catch (error) {
           console.error("Error validating center:", error);
           setIsCenterValidated(false);
           setValidatedCenter(null);
           form.setError('center', { type: "manual", message: "No se pudo comprobar el código del centro." });
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

  return (
    <Dialog open={true} >
      <DialogContent className="max-w-md w-[95vw]" hideCloseButton={true}>
        <DialogHeader className="text-center items-center">
            <div className="bg-primary/10 p-3 rounded-full mb-2">
                <UserCheck className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-headline">Completa tu Perfil</DialogTitle>
            <DialogDescription className="text-center">
                ¡Bienvenido! Solo necesitamos unos pocos detalles más para configurar tu cuenta.
            </DialogDescription>
        </DialogHeader>

        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                 <RadioGroup value={mode} onValueChange={(v) => setMode(v as RegistrationMode)} className="grid grid-cols-3 gap-2">
                    <Label className={cn("rounded-lg border-2 p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors hover:bg-accent/50", mode === 'join' ? "border-primary text-primary bg-primary/10" : "border-transparent text-muted-foreground")}>
                        <School className="h-5 w-5"/> <span className="text-xs font-semibold">Unirse</span>
                        <RadioGroupItem value="join" className="sr-only"/>
                    </Label>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                             <Label className={cn("rounded-lg border-2 p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors hover:bg-accent/50", mode === 'create' ? "border-primary text-primary bg-primary/10" : "border-transparent text-muted-foreground")}>
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
                                <AlertDialogAction onClick={() => setMode('create')}>Sí, crear</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <Label className={cn("rounded-lg border-2 p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors hover:bg-accent/50", mode === 'personal' ? "border-primary text-primary bg-primary/10" : "border-transparent text-muted-foreground")}>
                        <UserIcon className="h-5 w-5"/> <span className="text-xs font-semibold">Personal</span>
                        <RadioGroupItem value="personal" className="sr-only"/>
                    </Label>
                </RadioGroup>
                
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                    <h4 className="font-semibold text-sm">{registrationModeInfo[mode].title}</h4>
                    <p className="text-xs text-muted-foreground">{registrationModeInfo[mode].description}</p>
                </div>


                {mode === 'join' && (
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
                
                {mode === 'create' && (
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
                
                <div className={cn("space-y-4", (mode === 'join' && !isCenterValidated) || (mode === 'create' && !isCenterNameValidated) ? "hidden" : "block")}>
                    {mode === 'join' && (
                      <div className="grid grid-cols-2 gap-4">
                          <FormField control={form.control} name="course" render={({ field }) => (<FormItem><FormLabel>Curso</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Curso..." /></SelectTrigger></FormControl><SelectContent>{courseOptions.map(option => (<SelectItem key={option.value} value={option.value} disabled={!availableClasses.courses.includes(option.value)}>{option.label}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                          <FormField control={form.control} name="className" render={({ field }) => (<FormItem><FormLabel>Clase</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Clase..." /></SelectTrigger></FormControl><SelectContent>{classOptions.map(option => (<SelectItem key={option} value={option} disabled={!availableClasses.classNames.includes(option)}>{option}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                      </div>
                    )}
                    <FormField control={form.control} name="ageRange" render={({ field }) => (<FormItem><FormLabel>Rango de Edad</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona tu rango de edad" /></SelectTrigger></FormControl><SelectContent><SelectItem value="12-15">12-15 años</SelectItem><SelectItem value="16-18">16-18 años</SelectItem><SelectItem value="19-22">19-22 años</SelectItem><SelectItem value="23+">23+ años</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                </div>

                 <DialogFooter className="pt-6">
                    <Button type="submit" className="w-full" disabled={isLoading || !form.formState.isValid}>
                         {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar y Continuar
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
