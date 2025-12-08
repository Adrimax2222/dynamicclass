
"use client";

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
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

export function TeacherInfoDialog() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="text-muted-foreground hover:text-primary transition-colors">
            <Info className="h-3.5 w-3.5" />
            <span className="sr-only">Información sobre datos del profesorado</span>
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ℹ️ Aviso Importante: Datos del Profesorado</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 pt-2 text-left">
            <p>
              Esta aplicación es un desarrollo independiente y <strong>no oficial</strong> del
              centro.
            </p>
            <p>
              Las abreviaturas de los nombres de los docentes que aparecen en
              este calendario se han incluido de forma temporal únicamente con
              fines de testeo interno de la funcionalidad del horario.
            </p>
            <p>
              Antes de la publicación oficial en Google Play, este sistema será
              modificado para garantizar el <strong>total anonimato</strong> y el cumplimiento
              estricto del Reglamento General de Protección de Datos (RGPD). El
              sistema final utilizará nombres genéricos o permitirá la
              personalización local por parte del usuario.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>Entendido</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
