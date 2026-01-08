
"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { User, Center } from "@/lib/types";
import { useFirestore } from "@/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
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
import { Loader2, UserCheck, User as UserIcon, CheckCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Label } from "../ui/label";
import { useToast } from "@/hooks/use-toast";


const createProfileSchema = (isCenterValidated: boolean) => z.object({
  center: z.string(),
  ageRange: z.string().min(1, { message: "Por favor, selecciona un rango de edad." }),
  course: z.string(),
  className: z.string(),
}).refine(data => {
    if (data.center === 'personal') return true;
    return isCenterValidated ? (data.course !== '' && data.className !== '') : false;
}, {
    message: "Valida el código o selecciona curso/clase.",
    path: ['center'],
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
    const [usePersonal, setUsePersonal] = useState(false);
    const [isCenterValidated, setIsCenterValidated] = useState(false);
    const [validatedCenter, setValidatedCenter] = useState<Center | null>(null);
    const { toast } = useToast();
    
    const firestore = useFirestore();

    const profileSchema = useMemo(() => createProfileSchema(isCenterValidated || usePersonal), [isCenterValidated, usePersonal]);

    const form = useForm<ProfileSchema>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            center: "",
            ageRange: "",
            course: "",
            className: "",
        },
    });
    
    const availableClasses = useMemo(() => {
        if (!validatedCenter || !validatedCenter.classes) return { courses: [], classNames: [] };

        const courses = new Set<string>();
        const classNames = new Set<string>();

        validatedCenter.classes.forEach(c => {
            const [course, className] = c.name.split('-');
            if (course) {
                const courseValue = course.toLowerCase().replace('º', '');
                courses.add(courseValue);
            }
            if (className) {
                classNames.add(className);
            }
        });

        return {
            courses: Array.from(courses),
            classNames: Array.from(classNames)
        };
    }, [validatedCenter]);

    useEffect(() => {
      if (usePersonal) {
        form.setValue('center', 'personal');
        form.setValue('course', 'personal');
        form.setValue('className', 'personal');
        setIsCenterValidated(false);
        setValidatedCenter(null);
      } else {
        form.setValue('center', '');
        form.setValue('course', '');
        form.setValue('className', '');
        setIsCenterValidated(false);
        setValidatedCenter(null);
      }
    }, [usePersonal, form]);


    const onSubmit = (values: ProfileSchema) => {
        setIsLoading(true);
        if (usePersonal) {
            onSave({
                center: 'personal',
                course: 'personal',
                className: 'personal',
                ageRange: values.ageRange,
            });
        } else {
            onSave(values);
        }
    };
    
    const formatAndSetCenterCode = (value: string) => {
        const digitsOnly = value.replace(/[^0-9]/g, '');
        let formatted = digitsOnly.slice(0, 6);
        if (digitsOnly.length > 3) {
            formatted = `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 6)}`;
        }
        form.setValue('center', formatted, { shouldValidate: true });
        setIsCenterValidated(false);
        setValidatedCenter(null);
    };
    
    const handleValidateCenter = async (checked: boolean) => {
        if (!checked) {
            setIsCenterValidated(false);
            setValidatedCenter(null);
            return;
        }

        if (!firestore) return;

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
                 <div className="flex items-center space-x-2 rounded-lg border p-3">
                    <Switch id="personal-use-switch" checked={usePersonal} onCheckedChange={setUsePersonal} />
                    <Label htmlFor="personal-use-switch" className="flex flex-col gap-1">
                      <span className="font-semibold flex items-center gap-2"><UserIcon className="h-4 w-4" />Prefiero el uso personal</span>
                    </Label>
                </div>

                <FormField
                    control={form.control}
                    name="center"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className={cn(usePersonal && 'text-muted-foreground/50')}>Código de Centro Educativo</FormLabel>
                            <div className="flex items-center gap-2">
                                <FormControl>
                                    <Input 
                                        placeholder="123-456" 
                                        {...field}
                                        onChange={(e) => formatAndSetCenterCode(e.target.value)}
                                        disabled={usePersonal}
                                        maxLength={7}
                                    />
                                </FormControl>
                                <Switch
                                    checked={isCenterValidated}
                                    onCheckedChange={handleValidateCenter}
                                    disabled={usePersonal || field.value.length !== 7}
                                />
                            </div>
                            <FormDescription>
                                Únete al grupo de tu centro. Si no tienes uno, selecciona la opción de uso personal.
                            </FormDescription>
                            {!usePersonal && validatedCenter && isCenterValidated && (
                                <FormDescription className="text-green-600 font-semibold flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    {validatedCenter.name}
                                </FormDescription>
                            )}
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="ageRange"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Rango de Edad</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Selecciona tu rango de edad" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="12-15">12-15 años</SelectItem>
                                    <SelectItem value="16-18">16-18 años</SelectItem>
                                    <SelectItem value="19-22">19-22 años</SelectItem>
                                    <SelectItem value="23+">23+ años</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="course"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className={cn((usePersonal || !isCenterValidated) && 'text-muted-foreground/50')}>Curso</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={usePersonal || !isCenterValidated}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Curso" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {courseOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value} disabled={!availableClasses.courses.includes(option.value)}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="className"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className={cn((usePersonal || !isCenterValidated) && 'text-muted-foreground/50')}>Clase</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={usePersonal || !isCenterValidated}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Clase" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {classOptions.map(option => (
                                        <SelectItem key={option} value={option} disabled={!availableClasses.classNames.includes(option)}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
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
