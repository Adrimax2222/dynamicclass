"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/icons";

export default function RecursosPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-muted/20 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="text-center items-center">
            <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-xl mb-4">
                <Logo className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-headline">Guía de Recursos para Estudiantes</CardTitle>
            <CardDescription>
              Estás a punto de acceder a una guía completa de recursos públicos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border border-amber-500/30 bg-amber-500/10 p-4 rounded-lg text-amber-800 dark:text-amber-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-bold mb-1">Aviso Importante</h3>
                  <p className="text-xs">
                    Dynamic Class <strong>no es un portal oficial</strong> de la Generalitat de Catalunya. Todo el contenido aquí mostrado es de carácter público y se ofrece a través de esta app para facilitar su propagación entre la juventud.
                  </p>
                </div>
              </div>
            </div>
            
            <Link href="https://web.gencat.cat" target="_blank" rel="noopener noreferrer">
              <div className="w-full text-sm flex items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                Visitar el portal oficial de Gencat <ExternalLink className="h-4 w-4" />
              </div>
            </Link>
            
          </CardContent>
          <CardContent>
             <Button
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-px"
              onClick={() => router.push('/forum/resources/visor')}
            >
              Acceder a la Guía de Orientación
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
