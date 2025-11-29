
"use client";

import { useState } from "react";
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
import { Loader2, UserCheck } from "lucide-react";
import { SCHOOL_VERIFICATION_CODE } from "@/lib/constants";

const profileSchema = z.object({
  center: z.string().min(1, { message: "El código de centro es obligatorio." }),
  ageRange: z.string().min(1, { message: "Por favor, selecciona un rango de edad." }),
  course: z.string().min(1, { message: "Por favor, selecciona tu curso." }),
  className: z.string().min(1, { message: "Por favor, selecciona tu clase." }),
});

type ProfileSchema = z.infer<typeof profileSchema>;

interface CompleteProfileModalProps {
  user: User;
  onSave: (updatedData: Partial<User>) => void;
}

export default function CompleteProfileModal({ user, onSave }: CompleteProfileModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<ProfileSchema>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            center: "",
            ageRange: "",
            course: "",
            className: "",
        },
    });

    const onSubmit = (values: ProfileSchema) => {
        setIsLoading(true);
        // We just call the onSave function provided by the parent (HomePage)
        // It will handle updating Firestore and closing the modal.
        onSave(values);
        // We don't set loading to false here because the modal will be unmounted
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
                <FormField
                    control={form.control}
                    name="center"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Código de Centro Educativo</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej: 123-456" {...field} />
                            </FormControl>
                            <FormDescription>
                                Únete al grupo de tu centro. Si no tienes uno, usa <strong className="text-foreground">{SCHOOL_VERIFICATION_CODE}</strong> por ahora.
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
                                <FormLabel>Curso</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                <FormLabel>Clase</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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

    