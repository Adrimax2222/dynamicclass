"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { GraduationCap, Wand2, User, Star, Clock, Users, BarChart, Zap, DollarSign, KeyRound } from "lucide-react";

export default function AboutLearningHubPage() {
    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-8">
            <div className="text-center space-y-2">
                <GraduationCap className="mx-auto h-12 w-12 text-primary" />
                <h1 className="text-3xl font-bold font-headline tracking-tight">Bienvenido a Dynamic Learning</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">Tu centro de conocimiento personalizado, diseñado para despertar tu curiosidad y potenciar tus habilidades.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>¿Qué es Dynamic Learning?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <p>
                        Dynamic Learning es un espacio de aprendizaje en constante evolución, con una biblioteca de <strong>67 cursos</strong> que cubren desde tecnología y finanzas hasta creatividad y bienestar personal. Nuestra misión es ofrecerte conocimientos prácticos y relevantes de una forma accesible y atractiva.
                    </p>
                    <p>
                        Creemos que el aprendizaje debe ser una aventura, no una obligación. Por eso, hemos diseñado esta sección para que puedas explorar temas que realmente te interesan a tu propio ritmo.
                    </p>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wand2 className="h-5 w-5 text-purple-500" />
                            Tipos de Cursos
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                             <User className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                             <div>
                                <h4 className="font-semibold text-foreground">Cursos Creados por Personas</h4>
                                <p className="text-xs text-muted-foreground">La mayoría de nuestros cursos son diseñados por expertos en cada materia para garantizar una experiencia de aprendizaje de alta calidad. ¡Busca este icono en la tarjeta del curso!</p>
                             </div>
                        </div>
                         <div className="flex items-start gap-3">
                             <Wand2 className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                             <div>
                                <h4 className="font-semibold text-foreground">Cursos Generados por IA</h4>
                                <p className="text-xs text-muted-foreground">Para temas muy específicos o novedosos, utilizamos IA avanzada para generar contenido. Estos cursos están señalizados y te ofrecen una visión rápida sobre temas de vanguardia.</p>
                             </div>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-green-500" />
                           Acceso y Precios
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                             <GraduationCap className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                             <div>
                                <h4 className="font-semibold text-foreground">Cursos Gratuitos</h4>
                                <p className="text-xs text-muted-foreground">La gran mayoría de nuestros cursos son <strong>100% gratuitos</strong>. Queremos que el conocimiento sea accesible para todos.</p>
                             </div>
                        </div>
                         <div className="flex items-start gap-3">
                             <DollarSign className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                             <div>
                                <h4 className="font-semibold text-foreground">Cursos Premium</h4>
                                <p className="text-xs text-muted-foreground">Algunos cursos especializados o con contenido muy extenso pueden ser de pago. Estos estarán siempre <strong>claramente indicados</strong> para que no haya sorpresas.</p>
                             </div>
                        </div>
                        <div className="flex items-start gap-3">
                             <KeyRound className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                             <div>
                                <h4 className="font-semibold text-foreground">Llave de Curso</h4>
                                <p className="text-xs text-muted-foreground">Puedes canjear tus trofeos o plantas en la tienda por una <strong>Llave de Curso Premium</strong>, que te permite desbloquear cualquier curso de pago a tu elección.</p>
                             </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>¿Cómo funciona?</CardTitle>
                    <CardDescription>
                        Cada curso está diseñado para que sepas todo lo que necesitas antes de empezar.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <BarChart className="h-8 w-8 mx-auto text-primary mb-2" />
                        <p className="font-semibold text-sm">Nivel de Dificultad</p>
                        <p className="text-xs text-muted-foreground">Desde principiante hasta experto.</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <Clock className="h-8 w-8 mx-auto text-primary mb-2" />
                        <p className="font-semibold text-sm">Tiempo Estimado</p>
                        <p className="text-xs text-muted-foreground">Sabrás cuánto tardarás en completarlo.</p>
                    </div>
                     <div className="p-4 bg-muted/50 rounded-lg">
                        <Users className="h-8 w-8 mx-auto text-primary mb-2" />
                        <p className="font-semibold text-sm">Popularidad</p>
                        <p className="text-xs text-muted-foreground">Mira cuánta gente está haciendo el curso.</p>
                    </div>
                     <div className="p-4 bg-muted/50 rounded-lg">
                        <Star className="h-8 w-8 mx-auto text-primary mb-2" />
                        <p className="font-semibold text-sm">Valoraciones</p>
                        <p className="text-xs text-muted-foreground">Opiniones de otros estudiantes sobre 5 estrellas.</p>
                    </div>
                </CardContent>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center">
                        Para completar un curso, deberás avanzar por sus lecciones y superar los cuestionarios o proyectos finales. ¡Tu progreso se guardará automáticamente!
                    </p>
                </CardContent>
            </Card>

        </div>
    );
}
