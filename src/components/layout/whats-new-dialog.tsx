
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
import { PartyPopper, Lightbulb, Rocket, Bot, Wand2, ScanSearch, CheckCircle, Bug, History } from "lucide-react";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";

const recentUpdates = [
    { 
        icon: CheckCircle, 
        text: "Mejora en la validación de códigos de centro para una experiencia de registro más fluida y sin errores.",
        color: "text-green-500"
    },
    { 
        icon: Bug, 
        text: "Solucionado un error interno de Firestore que causaba bloqueos intermitentes en la aplicación.",
        color: "text-blue-500"
    },
    { 
        icon: History, 
        text: "¡Nuevo modo historial! Ahora puedes ver un registro de todas las tareas y exámenes completados desde tu perfil.",
        color: "text-purple-500"
    },
];

const futureFeatures = [
    { 
        icon: Rocket, 
        text: "Generador de Exámenes con IA: Crea exámenes personalizados a partir de tus apuntes con un solo clic.",
        color: "text-red-500"
    },
    { 
        icon: Bot, 
        text: "ADRIMAX AI v2.0: Una versión mejorada de nuestro asistente de IA, con más memoria, más rápido y capaz de entender imágenes.",
        color: "text-primary"
    },
    { 
        icon: ScanSearch, 
        text: "Digitalización Avanzada: Escanea documentos y obtén resúmenes, puntos clave y tarjetas de estudio generadas por IA al instante.",
        color: "text-orange-500"
    },
    { 
        icon: Wand2, 
        text: "Personalización Extrema: Más avatares, temas de colores para la app y nuevos easter eggs con recompensas.",
        color: "text-pink-500"
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

    