
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
import { PartyPopper, Lightbulb, Rocket, GraduationCap, Monitor, MailCheck, CheckCircle, BrainCircuit, Globe, ShieldCheck } from "lucide-react";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";

const recentUpdates = [
    { 
        icon: ShieldCheck, 
        text: "Nuevo sistema de administradores para que los delegados puedan gestionar sus clases directamente desde la app.",
        color: "text-blue-500"
    },
    { 
        icon: Globe, 
        text: "Ampliación de la infraestructura para dar soporte a múltiples centros educativos y escalabilidad a nivel mundial.",
        color: "text-indigo-500"
    },
    { 
        icon: BrainCircuit, 
        text: "Mejoras fundamentales en el Modo Estudio, incluyendo música de Spotify, sonidos ambientales y una interfaz renovada.",
        color: "text-teal-500"
    },
    { 
        icon: ShieldCheck, 
        text: "Actualización de la política de privacidad (RGPD) para mayor transparencia.",
        color: "text-green-500"
    },
];

const futureFeatures = [
    { 
        icon: GraduationCap, 
        text: "Modo Profesorado: Herramientas exclusivas para que los educadores gestionen sus clases de manera más eficaz.",
        color: "text-primary"
    },
    { 
        icon: Monitor, 
        text: "Dynamic Class para Escritorio: Una nueva interfaz completamente adaptada para ordenadores y pantallas horizontales.",
        color: "text-pink-500"
    },
    { 
        icon: MailCheck, 
        text: "Resúmenes Semanales: Recibe en tu correo un informe de tu rendimiento y las tareas de la próxima semana.",
        color: "text-red-500"
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
