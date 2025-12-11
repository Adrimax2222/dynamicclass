
"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PartyPopper, CheckCircle, Bug, History, Award } from "lucide-react";
import { Badge } from "../ui/badge";

interface UpdateNotificationModalProps {
  onClose: () => void;
}

const updateFeatures = [
    { 
        icon: Award, 
        text: "¡Hemos añadido dos nuevos Easter Eggs! Los más curiosos podrán encontrar hasta 125 trofeos de recompensa.",
        color: "text-amber-500"
    },
    { 
        icon: CheckCircle, 
        text: "Mejoramos y detallamos nuestras Políticas de Privacidad para mayor transparencia.",
        color: "text-green-500"
    },
    { 
        icon: Bug, 
        text: "Solucionamos errores importantes en el guardado de cálculos e informes de notas.",
        color: "text-blue-500"
    },
    { 
        icon: History, 
        text: "¡Nuevo modo historial! Ahora puedes ver un registro de todas las tareas y exámenes completados desde tu perfil.",
        color: "text-purple-500"
    },
];

export default function UpdateNotificationModal({ onClose }: UpdateNotificationModalProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md w-[95vw]">
        <DialogHeader className="text-center items-center">
            <div className="bg-primary/10 p-3 rounded-full mb-2">
                <PartyPopper className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-headline">¡Novedades en Dynamic Class!</DialogTitle>
            <DialogDescription className="text-center">
                Hemos estado trabajando para mejorar tu experiencia.
            </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm py-4 max-h-[50vh] overflow-y-auto px-2">
           {updateFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                    <div key={index} className="flex items-start gap-3">
                        <Icon className={`h-5 w-5 ${feature.color} mt-0.5 shrink-0`}/>
                        <p className="text-muted-foreground">{feature.text}</p>
                    </div>
                )
           })}
        </div>
        
        <DialogFooter>
            <Button onClick={handleClose} className="w-full">
                ¡Genial!
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
