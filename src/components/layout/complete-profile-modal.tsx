
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { User } from "@/lib/types";

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
import { Loader2, UserCheck, User as UserIcon } from "lucide-react";
import { SCHOOL_VERIFICATION_CODE } from "@/lib/constants";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const profileSchema = z.object({
  center: z.string(),
  ageRange: z.string().min(1, { message: "Por favor, selecciona un rango de edad." }),
  course: z.string(),
  className: z.string(),
}).refine(data => {
    // If center is 'personal', then course and className must also be 'personal'.
    // Otherwise, center, course, and className must be non-empty.
    if (data.center === 'personal') {
        return data.course === 'personal' && data.className === 'personal';
    }
    return data.center.trim() !== '' && data.course.trim() !== '' && data.className.trim() !== '';
}, {
    message: "Debes rellenar todos los campos del centro o seleccionar 'Uso Personal'.",
    path: ['center'], // you can point to a specific field
});


type ProfileSchema = z.infer<typeof profileSchema>;

interface CompleteProfileModalProps {
  user: User;
  onSave: (updatedData: Partial<User>) => void;
}

export default function CompleteProfileModal({ user, onSave }: CompleteProfileModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [usePersonal, setUsePersonal] = useState(false);

    const form = useForm<ProfileSchema>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            center: "",
            ageRange: "",
            course: "",
            className: "",
        },
    });

    useEffect(() => {
      if (usePersonal) {
        form.setValue('center', 'personal');
        form.setValue('course', 'personal');
        form.setValue('className', 'personal');
      } else {
        form.setValue('center', '');
        form.setValue('course', '');
        form.setValue('className', '');
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
                            <FormControl>
                                <Input placeholder="Ej: 123-456" {...field} disabled={usePersonal}/>
                            </FormControl>
                            <FormDescription>
                                Únete al grupo de tu centro. Si no tienes uno, selecciona la opción de uso personal.
                            </FormDescription>
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
                                <FormLabel className={cn(usePersonal && 'text-muted-foreground/50')}>Curso</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={usePersonal}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Curso" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="1eso">1º ESO</SelectItem>
                                    <SelectItem value="2eso">2º ESO</SelectItem>
                                    <SelectItem value="3eso">3º ESO</SelectItem>
                                    <SelectItem value="4eso">4º ESO</SelectItem>
                                    <SelectItem value="1bach">1º Bachillerato</SelectItem>
                                    <SelectItem value="2bach">2º Bachillerato</SelectItem>
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
                                <FormLabel className={cn(usePersonal && 'text-muted-foreground/50')}>Clase</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={usePersonal}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Clase" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="A">A</SelectItem>
                                    <SelectItem value="B">B</SelectItem>
                                    <SelectItem value="C">C</SelectItem>
                                    <SelectItem value="D">D</SelectItem>
                                    <SelectItem value="E">E</SelectItem>
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
