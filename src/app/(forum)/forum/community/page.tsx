"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GraduationCap, Wand2, User, HelpCircle, BookCopy, MessageSquare, Users, Zap } from "lucide-react";

export default function AboutForumPage() {
    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-8">
            <div className="text-center space-y-2">
                <Users className="mx-auto h-12 w-12 text-primary" />
                <h1 className="text-3xl font-bold font-headline tracking-tight">Bienvenido al Foro de la Comunidad</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">Un espacio para conectar, aprender y compartir con otros estudiantes de Dynamic Class.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>¿Qué es el Foro de la Comunidad?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <p>
                        El Foro de la Comunidad es un espacio seguro y moderado diseñado para que puedas interactuar con otros estudiantes. Aquí podrás resolver dudas, compartir recursos de estudio y colaborar en proyectos.
                    </p>
                    <p>
                        Creemos que el aprendizaje es más potente cuando se comparte. Este foro es tu lugar para crecer junto a la comunidad de Dynamic Class.
                    </p>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-green-500" />
                           Normas de la Comunidad
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                             <User className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                             <div>
                                <h4 className="font-semibold text-foreground">Sé Respetuoso</h4>
                                <p className="text-xs text-muted-foreground">Trata a todos con amabilidad. No se tolerará ningún tipo de acoso o discurso de odio.</p>
                             </div>
                        </div>
                         <div className="flex items-start gap-3">
                             <GraduationCap className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                             <div>
                                <h4 className="font-semibold text-foreground">Aporta y Ayuda</h4>
                                <p className="text-xs text-muted-foreground">Comparte tus conocimientos y ayuda a otros cuando puedas. Juntos aprendemos más.</p>
                             </div>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wand2 className="h-5 w-5 text-purple-500" />
                            Secciones Principales
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                             <MessageSquare className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                             <div>
                                <h4 className="font-semibold text-foreground">Discusiones</h4>
                                <p className="text-xs text-muted-foreground">Inicia debates, haz preguntas y participa en conversaciones sobre cualquier tema académico o de interés.</p>
                             </div>
                        </div>
                         <div className="flex items-start gap-3">
                             <BookCopy className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                             <div>
                                <h4 className="font-semibold text-foreground">Recursos</h4>
                                <p className="text-xs text-muted-foreground">Comparte y encuentra apuntes, resúmenes, enlaces útiles y otros materiales de estudio.</p>
                             </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>¿Cómo participar?</CardTitle>
                    <CardDescription>
                        Navega por las diferentes secciones para empezar a interactuar.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <MessageSquare className="h-8 w-8 mx-auto text-primary mb-2" />
                        <p className="font-semibold text-sm">Crea un Tema</p>
                        <p className="text-xs text-muted-foreground">En la sección de Discusiones, inicia un nuevo debate.</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <HelpCircle className="h-8 w-8 mx-auto text-primary mb-2" />
                        <p className="font-semibold text-sm">Responde a Dudas</p>
                        <p className="text-xs text-muted-foreground">Ayuda a otros compañeros con sus preguntas.</p>
                    </div>
                     <div className="p-4 bg-muted/50 rounded-lg">
                        <BookCopy className="h-8 w-8 mx-auto text-primary mb-2" />
                        <p className="font-semibold text-sm">Sube tus Apuntes</p>
                        <p className="text-xs text-muted-foreground">Comparte tus recursos en la sección correspondiente.</p>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
