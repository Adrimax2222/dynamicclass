"use client";

import { Wrench } from "lucide-react";

export default function ClassmatesPage() {
    return (
        <div className="p-4 sm:p-6 md:p-8">
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold font-headline tracking-tight">Compañeros de Clase</h2>
                    <p className="text-muted-foreground">Conecta con los miembros de tu grupo.</p>
                </div>
                <div className="text-center p-12 space-y-4 border-2 border-dashed rounded-lg max-w-lg mx-auto mt-8">
                    <Wrench className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="font-semibold text-xl">Próximamente</h3>
                    <p className="text-sm text-muted-foreground">
                        Estamos trabajando en esta sección para que puedas conectar con tus compañeros de clase. ¡Vuelve pronto!
                    </p>
                </div>
            </div>
        </div>
    );
}
