
"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { User, Center } from "@/lib/types";
import { useFirestore } from "@/firebase";
import { collection, getDocs, query, where, addDoc, serverTimestamp } from "firebase/firestore";

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
import { Loader2, UserCheck, User as UserIcon, CheckCircle, School, PlusCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Label } from "../ui/label";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

type RegistrationMode = 'join' | 'personal' | 'create';

const createProfileSchema = (mode: RegistrationMode, isCenterValidated: boolean) => z.object({
  center: z.string(),
  ageRange: z.string().min(1, { message: "Por favor, selecciona un rango de edad." }),
  course: z.string(),
  className: z.string(),
  newCenterName: z.string().optional(),
  newClassName: z.string().optional(),
}).refine(data => {
    if (mode === 'join') return isCenterValidated;
    return true;
}, {
    message: "Debes validar tu código de centro.",
    path: ['center'],
}).refine(data => {
    if (mode === 'create') return data.newCenterName && data.newCenterName.trim().length > 2;
    return true;
}, {
    message: "El nombre del centro es obligatorio.",
    path: ['newCenterName'],
}).refine(data => {
    if (mode === 'create') return data.newClassName && data.newClassName.trim().length > 1;
    return true;
}, {
    message: "El nombre de la clase es obligatorio.",
    path: ['newClassName'],
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
    const { toast } = useToast();
    
    const firestore = useFirestore();

    const profileSchema = useMemo(() => createProfileSchema(mode, isCenterValidated), [mode, isCenterValidated]);

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
    }, [mode, form]);

    const generateCode = () => `${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`;

    const onSubmit = async (values: ProfileSchema) => {
        setIsLoading(true);
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
            try {
                const newCode = generateCode();
                const newCenterRef = await addDoc(collection(firestore, "centers"), {
                    name: values.newCenterName,
                    code: newCode,
                    classes: [{ name: values.newClassName, schedule: { Lunes: [], Martes: [], Miércoles: [], Jueves: [], Viernes: [] } }],
                    createdAt: serverTimestamp(),
                });
                
                const [course, className] = values.newClassName.split('-');
                
                onSave({
                    center: newCode,
                    course: course.toLowerCase().replace('º',''),
                    className: className,
                    ageRange: values.ageRange,
                    organizationId: newCenterRef.id,
                    role: `admin-${values.newClassName}`
                });
                 toast({ title: "¡Centro Creado!", description: `"${values.newCenterName}" se ha creado con el código ${newCode}.` });

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
                toast({ title: "Centro validado", description: `Te has unido a ${centerData.name}.` });
            } else {
                setValidatedCenter(null);
                setIsCenterValidated(false);
                toast({ title: "Código no válido", description: "No se encontró ningún centro con ese código.", variant: "destructive" });
            }
        } catch (error) {
           console.error("Error validating center:", error);
           setIsCenterValidated(false);
           setValidatedCenter(null);
           toast({ title: "Error de validación", description: "No se pudo comprobar el código del centro.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

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
                    <Label className={cn("rounded-lg border p-3 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-accent/50", mode === 'join' && "bg-accent border-primary")}>
                        <School className="h-5 w-5"/> <span className="text-xs font-semibold">Unirse</span>
                        <RadioGroupItem value="join" className="sr-only"/>
                    </Label>
                    <Label className={cn("rounded-lg border p-3 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-accent/50", mode === 'create' && "bg-accent border-primary")}>
                        <PlusCircle className="h-5 w-5"/> <span className="text-xs font-semibold">Crear</span>
                        <RadioGroupItem value="create" className="sr-only"/>
                    </Label>
                    <Label className={cn("rounded-lg border p-3 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-accent/50", mode === 'personal' && "bg-accent border-primary")}>
                        <UserIcon className="h-5 w-5"/> <span className="text-xs font-semibold">Personal</span>
                        <RadioGroupItem value="personal" className="sr-only"/>
                    </Label>
                </RadioGroup>

                {mode === 'join' && (
                    <FormField control={form.control} name="center" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Código de Centro Educativo</FormLabel>
                            <div className="flex items-center gap-2">
                                <FormControl><Input placeholder="123-456" {...field} onChange={(e) => formatAndSetCenterCode(e.target.value)} disabled={isCenterValidated} /></FormControl>
                                <Button type="button" onClick={handleValidateCenter} disabled={field.value.length !== 7 || isLoading || isCenterValidated} variant={isCenterValidated ? "secondary" : "default"}>
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : isCenterValidated ? <CheckCircle className="h-4 w-4"/> : "Validar"}
                                </Button>
                            </div>
                            <FormDescription>Únete al grupo de tu centro.</FormDescription>
                            {validatedCenter && isCenterValidated && (
                                <FormDescription className="text-green-600 font-semibold flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4" />{validatedCenter.name}
                                </FormDescription>
                            )}
                            <FormMessage />
                        </FormItem>
                    )} />
                )}
                
                {mode === 'create' && (
                    <div className="space-y-4 p-3 border-l-4 border-primary bg-primary/5 rounded-r-lg">
                        <FormField control={form.control} name="newCenterName" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre del Nuevo Centro</FormLabel>
                                <FormControl><Input placeholder="Ej: Instituto Adrimax" {...field} /></FormControl>
                                <FormDescription>El nombre de tu institución educativa.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="newClassName" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre de tu Primera Clase</FormLabel>
                                <FormControl><Input placeholder="Ej: 4ESO-B" {...field} /></FormControl>
                                <FormDescription>Usa un formato como 'CURSO-LETRA'.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                )}
                
                {mode === 'join' && isCenterValidated && (
                     <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="course" render={({ field }) => (<FormItem><FormLabel>Curso</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Curso..." /></SelectTrigger></FormControl><SelectContent>{courseOptions.map(option => (<SelectItem key={option.value} value={option.value} disabled={!availableClasses.courses.includes(option.value)}>{option.label}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="className" render={({ field }) => (<FormItem><FormLabel>Clase</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Clase..." /></SelectTrigger></FormControl><SelectContent>{classOptions.map(option => (<SelectItem key={option} value={option} disabled={!availableClasses.classNames.includes(option)}>{option}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                    </div>
                )}

                 <FormField control={form.control} name="ageRange" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Rango de Edad</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Selecciona tu rango de edad" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="12-15">12-15 años</SelectItem>
                                <SelectItem value="16-18">16-18 años</SelectItem>
                                <SelectItem value="19-22">19-22 años</SelectItem>
                                <SelectItem value="23+">23+ años</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />

                 <DialogFooter className="pt-6">
                    <Button type="submit" className="w-full" disabled={isLoading}>
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
