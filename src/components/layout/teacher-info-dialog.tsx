
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
          <AlertDialogDescription asChild>
            <div className="space-y-3 pt-2 text-left">
                <p>
                    Dynamic Class es un desarrollo independiente donde el administrador de cada clase actúa como responsable único de la introducción y gestión de los datos de su grupo.
                </p>
                <p>
                    La plataforma no contiene datos precargados; toda la información sobre profesorado es gestionada de forma autónoma para el funcionamiento del horario y calendario.
                </p>
                <p>
                    Estos registros pueden ser modificados en cualquier momento desde el panel de control, siendo responsabilidad del administrador garantizar el estricto cumplimiento del Reglament General de Protecció de Dades (RGPD) en su entorno local.
                </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>Entendido</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
