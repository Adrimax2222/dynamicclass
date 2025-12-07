
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
import { Logo } from "@/components/icons";
import { Wrench } from "lucide-react";

interface WipDialogProps {
  children: React.ReactNode;
}

export function WipDialog({ children }: WipDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-xs w-[90vw]">
        <DialogHeader className="text-center items-center">
            <div className="bg-primary/10 p-3 rounded-full mb-2">
                <Wrench className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-headline">Función en Desarrollo</DialogTitle>
            <DialogDescription className="text-center">
                Estamos trabajando duro para ofrecerte la mejor experiencia posible. ¡Esta función estará disponible muy pronto!
            </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button className="w-full">¡Entendido!</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    