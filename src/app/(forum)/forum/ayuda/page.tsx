"use client";

import { Wrench, HelpCircle, Globe, FileText, Mail, MessageSquareWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function AyudaPage() {
    const { toast } = useToast();

    const handleCopy = (email: string) => {
        navigator.clipboard.writeText(email);
        toast({
            title: "Copiado",
            description: `El correo ${email} ha sido copiado.`,
        });
    };

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <div className="space-y-8 max-w-2xl mx-auto">
                <div className="text-center">
                     <div className="mx-auto mb-4 w-fit rounded-lg bg-muted p-3">
                        <HelpCircle className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold font-headline tracking-tight">Centro de Ayuda</h2>
                    <p className="text-muted-foreground">Encuentra respuestas a tus preguntas o contacta con nuestro equipo.</p>
                </div>

                <div className="space-y-4">
                    <Link href="/forum/recursos-dc" passHref>
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                            <CardHeader className="flex-row items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-lg">
                                    <MessageSquareWarning className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Reportar un Bug o Sugerencia</CardTitle>
                                    <CardDescription>¿Has encontrado un error? ¿Tienes una idea? Compártela con nosotros aquí.</CardDescription>
                                </div>
                            </CardHeader>
                        </Card>
                    </Link>

                     <a href="https://form.jotform.com/230622014643040" target="_blank" rel="noopener noreferrer">
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                            <CardHeader className="flex-row items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-lg">
                                    <FileText className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Formulario de Asistencia</CardTitle>
                                    <CardDescription>Para dudas generales, problemas técnicos o consultas sobre tu cuenta.</CardDescription>
                                </div>
                            </CardHeader>
                        </Card>
                    </a>

                    <a href="https://proyectoadrimax.framer.website/" target="_blank" rel="noopener noreferrer">
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                             <CardHeader className="flex-row items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-lg">
                                    <Globe className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Web Oficial</CardTitle>
                                    <CardDescription>Visita la página de Proyecto Adrimax para conocer más sobre nosotros.</CardDescription>
                                </div>
                            </CardHeader>
                        </Card>
                    </a>

                    <Card>
                        <CardHeader className="flex-row items-center gap-4">
                             <div className="p-3 bg-primary/10 rounded-lg">
                                <Mail className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Contacto Directo</CardTitle>
                                <CardDescription>Para consultas urgentes, puedes escribirnos a nuestro correo de soporte.</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                             <div className="flex items-center justify-between rounded-md border bg-muted p-3">
                                <p className="text-sm font-semibold text-muted-foreground">info.dynamicclass@gmail.com</p>
                                <Button size="sm" onClick={() => handleCopy('info.dynamicclass@gmail.com')}>Copiar</Button>
                            </div>
                            <div className="flex items-center justify-between rounded-md border bg-muted p-3">
                                <p className="text-sm font-semibold text-muted-foreground">proyecto.adrimax@gmail.com</p>
                                <Button size="sm" onClick={() => handleCopy('proyecto.adrimax@gmail.com')}>Copiar</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
