"use client";

import { Wrench, MessageSquare } from "lucide-react";

export default function DiscussionsPage() {
    return (
        <div className="p-4 sm:p-6 md:p-8">
            <div className="space-y-6">
                <div className="text-center">
                    <div className="mx-auto mb-4 w-fit rounded-lg bg-muted p-3">
                        <MessageSquare className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold font-headline tracking-tight">Discusiones</h2>
                    <p className="text-muted-foreground">Participa en conversaciones y resuelve tus dudas.</p>
                </div>
                <div className="text-center p-12 space-y-4 border-2 border-dashed rounded-lg max-w-lg mx-auto mt-8">
                    <Wrench className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="font-semibold text-xl">Próximamente</h3>
                    <p className="text-sm text-muted-foreground">
                        Estamos construyendo este espacio para que puedas debatir y preguntar. ¡Vuelve pronto!
                    </p>
                </div>
            </div>
        </div>
    );
}
