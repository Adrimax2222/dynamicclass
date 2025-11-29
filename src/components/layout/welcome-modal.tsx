
"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/icons";
import { Badge } from "../ui/badge";
import { ShieldCheck, School, Package, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { SCHOOL_VERIFICATION_CODE } from "@/lib/constants";

interface WelcomeModalProps {
  onClose: () => void;
}

export default function WelcomeModal({ onClose }: WelcomeModalProps) {
  return (
    <Dialog open={true} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg w-[95vw]">
        <DialogHeader className="text-center items-center">
            <Logo className="h-14 w-14 text-primary" />
            <DialogTitle className="text-2xl font-headline pt-2">¡Bienvenido a Dynamic Class!</DialogTitle>
            <DialogDescription className="text-center">
                Estamos encantados de tenerte a bordo.
            </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm text-muted-foreground py-4">
            <div className="flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0"/>
                <div>
                    <h3 className="font-semibold text-foreground mb-1">Estás en Modo Beta</h3>
                    <p>
                        Es posible que algunas funciones no operen como se espera. Si encuentras algún problema, por favor contacta con nosotros a través de la sección de <strong className="text-foreground">Soporte</strong> en <strong className="text-foreground">Ajustes</strong>.
                    </p>
                </div>
            </div>

             <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-green-500 mt-0.5 shrink-0"/>
                <div>
                    <h3 className="font-semibold text-foreground mb-1">Seguridad de tus Datos</h3>
                    <p>
                        Tu información está segura. Todos tus datos están cifrados de extremo a extremo utilizando los robustos servicios de seguridad de Google.
                    </p>
                </div>
            </div>

            <div className="flex items-start gap-3">
                <School className="h-5 w-5 text-blue-500 mt-0.5 shrink-0"/>
                <div>
                    <h3 className="font-semibold text-foreground mb-1">Tu Centro Educativo</h3>
                    <div className="text-muted-foreground">
                        Para acceder a contenido exclusivo de tu centro, asegúrate de haberte registrado con el código oficial proporcionado por tu institución.
                    </div>
                </div>
            </div>
           
            <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-purple-500 mt-0.5 shrink-0"/>
                <div>
                    <h3 className="font-semibold text-foreground mb-1">Nuevas Funcionalidades</h3>
                    <p>
                        Estamos trabajando constantemente para mejorar tu experiencia. En los próximos días, implementaremos nuevas herramientas y funcionalidades en fase beta. ¡Mantente atento!
                    </p>
                </div>
            </div>
        </div>

        <DialogFooter className="flex-col items-center gap-4">
            <Button onClick={onClose} className="w-full sm:w-auto">¡Entendido!</Button>
            <div className="text-center text-xs text-muted-foreground">
                <Link href="https://proyectoadrimax.framer.website/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    Impulsado por <span className="font-semibold">Proyecto Adrimax</span>
                </Link>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
