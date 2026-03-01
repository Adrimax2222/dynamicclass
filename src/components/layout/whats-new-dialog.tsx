
"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PartyPopper, Lightbulb, Rocket, GraduationCap, Monitor, Users, Coffee, Wrench, Palette, BrainCircuit, Sparkles } from "lucide-react";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";

const recentUpdates = [
    {
        icon: Users,
        text: "Foro reconstruido: una nueva experiencia con tópicos, filtros y un diseño más limpio para mejorar la interacción.",
        color: "text-indigo-500"
    },
    {
        icon: Coffee,
        text: "Modo 'Break': ahora puedes tomarte un descanso cronometrado durante tus sesiones de estudio para recargar energías.",
        color: "text-orange-500"
    },
    {
        icon: Wrench,
        text: "Solución de bugs y mejora de la IA: hemos corregido errores en los paneles de inicio y estabilizado la IA temporalmente.",
        color: "text-blue-500"
    },
    {
        icon: Palette,
        text: "Personalización de perfil mejorada: un nuevo sistema para elegir y personalizar tu avatar, incluyendo avatares de DiceBear.",
        color: "text-pink-500"
    },
];

const futureFeatures = [
    {
        icon: Monitor,
        text: "Dynamic Class para Escritorio: Una nueva interfaz completamente adaptada para ordenadores y pantallas horizontales.",
        color: "text-pink-500"
    },
    { 
        icon: BrainCircuit, 
        text: "IA tipo NotebookLM: podrás subir tus propios apuntes y chatear con una IA que solo usará tu información para responder.",
        color: "text-teal-500"
    },
    { 
        icon: GraduationCap, 
        text: "Lanzamiento de los Nuevos Cursos: la biblioteca de 'Dynamic Learning' se activará con decenas de cursos interactivos.",
        color: "text-primary"
    },
    { 
        icon: Sparkles, 
        text: "Personalización de avatares: más opciones para personalizar los avatares aleatorios con nuevos estilos y colores.",
        color: "text-purple-500"
    },
];


export function WhatsNewDialog({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="max-w-md w-[95vw]">
            <DialogHeader className="text-center items-center">
                <div className="bg-primary/10 p-3 rounded-full mb-2">
                    <PartyPopper className="h-8 w-8 text-primary" />
                </div>
                <DialogTitle className="text-2xl font-headline">Novedades y Futuro</DialogTitle>
                <DialogDescription className="text-center">
                    ¡Siempre estamos mejorando para ti!
                </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[60vh] -mx-6 px-6">
                <div className="space-y-6 text-sm py-4">
                    <div>
                        <h3 className="font-bold text-foreground mb-3 flex items-center gap-2"><Lightbulb className="h-5 w-5 text-yellow-500" /> Lo más Reciente</h3>
                        <div className="space-y-4">
                            {recentUpdates.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <div key={index} className="flex items-start gap-3">
                                        <Icon className={`h-5 w-5 ${feature.color} mt-0.5 shrink-0`}/>
                                        <p className="text-muted-foreground">{feature.text}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    
                    <Separator />

                    <div>
                        <h3 className="font-bold text-foreground mb-3 flex items-center gap-2"><Rocket className="h-5 w-5 text-purple-500" /> Próximamente...</h3>
                        <div className="space-y-4">
                            {futureFeatures.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <div key={index} className="flex items-start gap-3">
                                        <Icon className={`h-5 w-5 ${feature.color} mt-0.5 shrink-0`}/>
                                        <p className="text-muted-foreground">{feature.text}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </ScrollArea>
            
            <DialogFooter>
                <DialogClose asChild>
                    <Button className="w-full">
                        ¡Entendido!
                    </Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}
