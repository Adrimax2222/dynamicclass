
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Search, Sprout, Trees, Flower, Sun, Plus, TreePine, Rocket, Trophy, Clock, Info, Timer, BrainCircuit, Globe, Fish, Lock, Leaf, Waves, Sparkles, Users, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/hooks/use-app";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { AvatarDisplay } from "@/components/profile/avatar-creator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { WipDialog } from "@/components/layout/wip-dialog";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import type { User as AppUser } from "@/lib/types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

type Plant = {
    id: number;
    name: string;
    icon: React.ElementType;
    rarity: 'Común' | 'Poco Común' | 'Raro' | 'Épico' | 'Legendario';
    unlocksAt: number; // number of plants needed
    description: string;
    imageUrl: string;
};

const allPlants: Plant[] = [
    { id: 1, name: 'Helecho Clásico', rarity: 'Común', icon: Sprout, unlocksAt: 0, description: "Los helechos son plantas vasculares sin semilla, de las más antiguas del planeta. Se reproducen mediante esporas y son conocidos por sus frondosas hojas llamadas 'frondas'. Prefieren los ambientes húmedos y sombreados.", imageUrl: "https://dejardines.com/wp-content/uploads/2-HR-Helechos-herbaceos-011.jpg" },
    { id: 2, name: 'Lirio Acuático', rarity: 'Común', icon: Flower, unlocksAt: 5, description: "También conocidos como nenúfares, los lirios acuáticos flotan en la superficie de aguas tranquilas. Sus grandes hojas proporcionan sombra y refugio a la vida acuática, y sus flores son un símbolo de pureza y belleza en muchas culturas.", imageUrl: "https://kuali.com.mx/portal/wp-content/uploads/2015/10/resized/lirio-615x300@2x.jpg" },
    { id: 3, name: 'Girasol Radiante', rarity: 'Poco Común', icon: Sun, unlocksAt: 10, description: "Los girasoles son famosos por su heliotropismo, la capacidad de seguir el movimiento del sol a lo largo del día. Sus semillas no solo son un alimento nutritivo, sino también una fuente importante de aceite vegetal.", imageUrl: "https://cdn.pixabay.com/photo/2015/09/19/20/00/sun-flower-947636_1280.jpg" },
    { id: 4, name: 'Roble Ancestral', rarity: 'Poco Común', icon: Trees, unlocksAt: 15, description: "El roble es un árbol longevo y robusto, símbolo de fuerza y resistencia. Su madera es muy apreciada en la carpintería y su fruto, la bellota, es un alimento vital para muchas especies de la fauna del bosque.", imageUrl: "https://www.tannins.org/wp-content/uploads/2019/05/quercia-tannino.jpg" },
    { id: 5, name: 'Planta Carnívora', rarity: 'Raro', icon: Sprout, unlocksAt: 20, description: "La 'Venus atrapamoscas' es la planta carnívora más conocida. Ha evolucionado para capturar insectos y arañas con sus hojas en forma de trampa, obteniendo así los nutrientes que no encuentra en su suelo pantanoso nativo.", imageUrl: "https://res.cloudinary.com/fronda/image/upload/f_auto,q_auto/prod/build/shop/images/blog/aprender/guia-cuidados-plantas-carnivoras/plantas.9b5952b8.jpg" },
    { id: 6, name: 'Pino Místico', rarity: 'Raro', icon: TreePine, unlocksAt: 25, description: "Los pinos son árboles de hoja perenne que se caracterizan por sus conos (piñas) y sus hojas en forma de aguja. Son una fuente crucial de madera y resina, y sus bosques son ecosistemas vitales en todo el mundo.", imageUrl: "https://vivergil.es/2874-large_default/pino-pinoneropinus-pinea-c-20.jpg" },
    { id: 7, name: 'Rosa Estelar', rarity: 'Épico', icon: Flower, unlocksAt: 30, description: "La rosa es una de las flores más cultivadas y apreciadas del mundo, un símbolo universal de amor y belleza. Existen miles de variedades, y sus pétalos se utilizan para producir aceites esenciales y perfumes.", imageUrl: "https://mamabruja.com/wp-content/uploads/2021/10/ivan-jevtic-p7mo8-CG5Gs-unsplash-2-scaled.jpg" },
    { id: 8, name: 'Árbol Solar', rarity: 'Épico', icon: Sun, unlocksAt: 35, description: "Inspirado en el Baobab, conocido como 'el Árbol de la Vida'. Este árbol africano puede vivir miles de años y almacenar hasta 120,000 litros de agua en su tronco para sobrevivir a las sequías extremas, siendo un pilar de su ecosistema.", imageUrl: "https://images.unsplash.com/photo-1692303366685-390f3e039bf9?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8JUMzJUExcmJvbCUyMGRlJTIwbGElMjB2aWRhfGVufDB8fDB8fHww" },
    { id: 9, name: 'Flor de Luna', rarity: 'Legendario', icon: Sparkles, unlocksAt: 40, description: "La 'Kadupul', o Flor de Luna, es un cactus de Sri Lanka que florece solo por la noche. Sus delicadas flores blancas se abren después del anochecer y se marchitan antes del amanecer, un evento tan raro que es casi imposible de presenciar.", imageUrl: "https://media.admagazine.com/photos/64d340ad06e371aed0700663/master/pass/flor-de-luna.jpg" },
    { id: 10, name: 'Sangre de Dragón', rarity: 'Legendario', icon: Leaf, unlocksAt: 45, description: "El árbol de Sangre de Dragón, nativo del archipiélago de Socotra, es famoso por su savia de color rojo intenso. Su forma de paraguas es una adaptación para sobrevivir en condiciones áridas, optimizando la captura de humedad.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/83/Socotra_dragon_tree.JPG" },
    { id: 11, name: 'Rafflesia Gigante', rarity: 'Legendario', icon: Flower, unlocksAt: 50, description: "La Rafflesia arnoldii es una planta parásita que produce la flor individual más grande del mundo. No tiene hojas ni raíces visibles y emite un olor fétido para atraer insectos polinizadores.", imageUrl: "https://content.nationalgeographic.com.es/medio/2025/07/23/nationalgeographic_1516877_00000000_5b2768ae_250723130504_1280x740.webp" },
    { id: 12, name: 'Pino Longevo', rarity: 'Legendario', icon: TreePine, unlocksAt: 55, description: "El Pinus longaeva es una de las especies de árboles más antiguas de la Tierra. Algunos ejemplares vivos superan los 4.800 años, sobreviviendo en condiciones extremas en las montañas del oeste de Estados Unidos.", imageUrl: "https://ichef.bbci.co.uk/ace/ws/640/amz/worldservice/live/assets/images/2016/05/02/160502122238_ciencia_matusalen_arbol_mas_viejo_mundo_624x415_rickgoldwaterwikimediacommons.jpg.webp" },
];


const rarityStyles = {
    'Común': "border-green-500/30 bg-green-500/5 text-green-600",
    'Poco Común': "border-blue-500/30 bg-blue-500/5 text-blue-600",
    'Raro': "border-purple-500/30 bg-purple-500/5 text-purple-600",
    'Épico': "border-amber-500/30 bg-amber-500/5 text-amber-600",
    'Legendario': "border-pink-500/30 bg-pink-500/5 text-pink-600",
};


const PlantInfoDialog = ({ plant, unlocked, plantCount, studyTime, children }: { 
    plant: Plant; 
    unlocked: boolean; 
    plantCount: number; 
    studyTime: number; 
    children: React.ReactNode;
}) => {
    const Icon = plant.icon;
    const formatStudyTime = (totalMinutes: number = 0) => {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours}h ${minutes}m`;
    };

    const plantPhaseNumber = Math.floor(plant.unlocksAt / 5) + 1;
    const userPhaseNumber = Math.floor(plantCount / 5) + 1;

    let progressInPhaseToShow = 0;

    if (plantPhaseNumber < userPhaseNumber) {
        progressInPhaseToShow = 5;
    } else if (plantPhaseNumber === userPhaseNumber) {
        progressInPhaseToShow = plantCount % 5;
    }


    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-xs w-full">
                <DialogHeader className="text-center items-center">
                    <div className={cn("p-4 rounded-full w-fit mb-2", unlocked ? rarityStyles[plant.rarity] : 'bg-muted')}>
                       <Icon className={cn("h-12 w-12", unlocked ? rarityStyles[plant.rarity] : 'text-muted-foreground')} />
                    </div>
                    <DialogTitle>{plant.name}</DialogTitle>
                    <DialogDescription>
                        <Badge variant="secondary" className={cn("text-xs", unlocked ? rarityStyles[plant.rarity] : "bg-muted text-muted-foreground")}>
                            {plant.rarity}
                        </Badge>
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-2 bg-muted/50 rounded-md">
                            <p className="text-xs font-semibold text-muted-foreground">Tiempo de Estudio</p>
                            <div className="flex items-center justify-center gap-1.5">
                                <Clock className="h-4 w-4 text-primary" />
                                <p className="font-bold text-sm">{formatStudyTime(studyTime)}</p>
                            </div>
                        </div>
                        <div className="p-2 bg-muted/50 rounded-md">
                            <p className="text-xs font-semibold text-muted-foreground">Plantas Totales</p>
                             <div className="flex items-center justify-center gap-1.5">
                                <TreePine className="h-4 w-4 text-primary" />
                                <p className="font-bold text-sm">{plantCount}</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <p className="text-xs font-semibold text-muted-foreground">Progreso Fase {plantPhaseNumber}</p>
                            <p className="text-xs font-bold">{progressInPhaseToShow} / 5</p>
                        </div>
                        <Progress value={(progressInPhaseToShow / 5) * 100} />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">{plant.description}</p>
                        {plant.imageUrl && (
                            <img
                                src={plant.imageUrl}
                                alt={plant.name}
                                className="mt-4 w-full h-auto rounded-lg object-cover shadow-md"
                            />
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default function CollectionPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const { user, plantCount } = useApp();
    
    const isPersonalUser = user?.center === 'personal' || user?.center === 'default';

    const firestore = useFirestore();
    const classmatesQuery = useMemoFirebase(() => {
        if (!firestore || !user || isPersonalUser) return null;
        return query(
            collection(firestore, "users"),
            where("organizationId", "==", user.organizationId),
            where("course", "==", user.course),
            where("className", "==", user.className)
        );
    }, [firestore, user, isPersonalUser]);

    const { data: classmatesData, isLoading: isLoadingClassmates } = useCollection<AppUser>(classmatesQuery);

    const sortedClassmates = useMemo(() => {
        if (!classmatesData) return [];
        // Filter out the current user and sort
        return classmatesData
            .filter(c => c.uid !== user?.uid)
            .sort((a, b) => (b.plantCount || 0) - (a.plantCount || 0));
    }, [classmatesData, user]);


    const filteredPlants = allPlants.filter(plant => 
        plant.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const currentPhase = Math.floor(plantCount / 5) + 1;
    const plantsInCurrentPhase = plantCount % 5;
    
    const nextPlant = allPlants.find(p => p.unlocksAt > plantCount);
    const progressToNext = nextPlant ? (plantsInCurrentPhase / 5) * 100 : 100;
    const isTerrestrialComplete = plantCount >= allPlants.length;

    const lastUnlockedPlant = allPlants.slice().reverse().find(p => plantCount >= p.unlocksAt);
    const CurrentPhaseIcon = lastUnlockedPlant ? lastUnlockedPlant.icon : Sprout;

    return (
        <div className="flex flex-col min-h-screen bg-muted/30">
            <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ChevronLeft />
                    </Button>
                    <h1 className="text-lg font-bold font-headline">Mi Jardín Botánico</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Info className="h-5 w-5"/>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <TreePine className="h-6 w-6 text-primary" />
                                    ¿Cómo funciona el Jardín?
                                </DialogTitle>
                                <DialogDescription>
                                    Una guía rápida para hacer crecer tu colección.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-4 text-sm">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg mt-1"><Timer className="h-5 w-5 text-primary" /></div>
                                    <div>
                                        <h4 className="font-semibold">Completa Sesiones de Estudio</h4>
                                        <p className="text-muted-foreground">Cada vez que completas una sesión de enfoque en el "Modo Estudio", ganas una nueva planta para tu jardín.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg mt-1"><Rocket className="h-5 w-5 text-primary" /></div>
                                    <div>
                                        <h4 className="font-semibold">Avanza por Fases</h4>
                                        <p className="text-muted-foreground">Tu colección se divide en fases. Cada 5 plantas que consigues, completas una fase y avanzas a la siguiente.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg mt-1"><Flower className="h-5 w-5 text-primary" /></div>
                                    <div>
                                        <h4 className="font-semibold">Desbloquea Nuevas Especies</h4>
                                        <p className="text-muted-foreground">Al completar una fase, desbloqueas la siguiente planta de la colección, que será cada vez más exótica y rara.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg mt-1"><BrainCircuit className="h-5 w-5 text-primary" /></div>
                                    <div>
                                        <h4 className="font-semibold">Aprende y Explora</h4>
                                        <p className="text-muted-foreground">Haz clic en cada planta (¡incluso en las bloqueadas!) para ver tus estadísticas, el progreso de la fase y aprender datos reales y curiosos sobre cada especie.</p>
                                    </div>
                                </div>
                            </div>
                            <DialogClose asChild>
                                <Button className="w-full">¡Entendido!</Button>
                            </DialogClose>
                        </DialogContent>
                    </Dialog>
                    {user && (
                        <Link href="/profile">
                            <AvatarDisplay user={user} className="h-9 w-9" />
                        </Link>
                    )}
                </div>
            </header>

            <main className="flex-1 p-4 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                    <Card className="bg-green-500/10 border-green-500/30">
                        <CardContent className="p-3 text-center">
                            <p className="text-xs text-green-700 dark:text-green-300 font-semibold">Plantas</p>
                            <div className="flex items-center justify-center gap-1">
                                <TreePine className="h-5 w-5 text-green-600" />
                                <p className="text-2xl font-bold">{plantCount}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-3 text-center">
                            <p className="text-xs text-muted-foreground">Fase Actual</p>
                             <div className="flex items-center justify-center gap-2">
                                <CurrentPhaseIcon className="h-6 w-6 text-primary"/>
                                <p className="text-2xl font-bold">{currentPhase}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-3 text-center">
                            <p className="text-xs text-muted-foreground">Progreso</p>
                            <p className="text-2xl font-bold">{plantsInCurrentPhase} <span className="text-muted-foreground">/ 5</span></p>
                        </CardContent>
                    </Card>
                </div>
                
                {nextPlant ? (
                    <Card>
                        <CardHeader className="p-3">
                            <p className="text-xs text-muted-foreground text-center">Siguiente Desbloqueo</p>
                        </CardHeader>
                        <CardContent className="p-3 pt-0 space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-muted rounded-lg">
                                    <nextPlant.icon className="h-6 w-6 text-muted-foreground"/>
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-muted-foreground">{nextPlant.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Progreso: {plantsInCurrentPhase} / 5
                                    </p>
                                </div>
                            </div>
                            <Progress value={progressToNext} className="h-2" />
                        </CardContent>
                    </Card>
                ) : (
                     <Card className="bg-green-500/10 border-green-500/30">
                        <CardContent className="p-4 text-center">
                            <p className="font-bold text-green-700">¡Colección Completa!</p>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between p-4">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <TreePine className="h-5 w-5 text-green-600"/>
                                Camino Terrestre
                            </CardTitle>
                            <CardDescription>Explora las diferentes sendas de conocimiento.</CardDescription>
                        </div>
                        <PathsDialog isTerrestrialComplete={isTerrestrialComplete}>
                            <Button variant="outline">
                                Ver Caminos
                            </Button>
                        </PathsDialog>
                    </CardHeader>
                </Card>

                {!isPersonalUser && (
                     <Collapsible className="w-full">
                        <CollapsibleTrigger asChild>
                            <div className="group flex w-full cursor-pointer items-center justify-between rounded-lg border bg-muted/50 p-4 transition-all hover:bg-muted">
                                <div className="flex items-center gap-3">
                                    <Users className="h-5 w-5 text-primary" />
                                    <h3 className="font-semibold">Jardín de Compañeros</h3>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-data-[state=open]:rotate-90" />
                            </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                            <div className="py-4">
                                {isLoadingClassmates ? (
                                    <div className="p-4 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                        <p className="text-sm text-muted-foreground mt-2">Cargando compañeros...</p>
                                    </div>
                                ) : sortedClassmates.length > 0 ? (
                                    <Carousel
                                        opts={{
                                            align: "start",
                                            loop: false,
                                        }}
                                        className="w-full"
                                    >
                                        <CarouselContent className="-ml-2">
                                            {sortedClassmates.map((classmate) => {
                                                const classmatePlantCount = classmate.plantCount || 0;
                                                const classmatePhase = Math.floor(classmatePlantCount / 5) + 1;
                                                return (
                                                    <CarouselItem key={classmate.uid} className="pl-2 basis-1/2 md:basis-1/3">
                                                        <div className="p-1">
                                                            <Card>
                                                                <CardContent className="flex flex-col items-center justify-center p-3 sm:p-4 aspect-[4/5]">
                                                                    <AvatarDisplay user={classmate} className="h-12 w-12 sm:h-16 sm:w-16 mb-2" />
                                                                    <p className="font-bold text-sm text-center truncate w-full">{classmate.name}</p>
                                                                    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-2">
                                                                        <div className="flex items-center gap-1">
                                                                            <TreePine className="h-3 w-3 text-green-500" />
                                                                            <span>{classmatePlantCount}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            <Sprout className="h-3 w-3 text-blue-500" />
                                                                            <span>Fase {classmatePhase}</span>
                                                                        </div>
                                                                    </div>
                                                                    <Badge variant="outline" className="mt-2 text-xs">Terrestre</Badge>
                                                                </CardContent>
                                                            </Card>
                                                        </div>
                                                    </CarouselItem>
                                                );
                                            })}
                                        </CarouselContent>
                                        <CarouselPrevious className="hidden sm:flex" />
                                        <CarouselNext className="hidden sm:flex" />
                                    </Carousel>
                                ) : (
                                    <div className="text-center text-sm text-muted-foreground p-4 border-dashed border-2 rounded-lg">
                                        Aún no hay compañeros en tu clase.
                                    </div>
                                )}
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                )}


                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Buscar planta..." 
                        className="bg-background border-input pl-10 focus:ring-primary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    {filteredPlants.map((plant) => {
                        const isUnlocked = plantCount >= plant.unlocksAt;
                        const isPlaceholder = plant.name === 'Próximamente';

                        const isLegendaryPlant = plant.rarity === 'Legendario';
                        const isLegendaryPathUnlocked = plantCount >= 30; // After completing phase 6 (5 plants/phase * 6 phases)

                        if (isLegendaryPlant && !isLegendaryPathUnlocked) {
                            return (
                                <Card key={plant.id} className="border-dashed bg-muted/50 flex flex-col items-center justify-center text-center aspect-square p-4">
                                    <Lock className="h-10 w-10 text-muted-foreground/50 mb-3" />
                                    <p className="text-sm font-semibold text-muted-foreground">Camino Legendario</p>
                                    <p className="text-xs text-muted-foreground mt-1">Completa 30 plantas para desbloquear.</p>
                                </Card>
                            )
                        }

                        if (isPlaceholder) {
                            return (
                                <Card key={plant.id} className="border-dashed bg-muted/50 flex flex-col items-center justify-center text-center aspect-square p-4">
                                    <Lock className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                    <p className="text-sm font-semibold text-muted-foreground">Próximamente...</p>
                                    <p className="text-xs text-muted-foreground mt-1">{plant.description}</p>
                                </Card>
                            )
                        }
                        
                        return (
                             <PlantInfoDialog 
                                key={plant.id} 
                                plant={plant} 
                                unlocked={isUnlocked}
                                plantCount={plantCount} 
                                studyTime={user?.studyMinutes || 0}
                            >
                                <Card className={cn(
                                    "group relative overflow-hidden transition-all duration-300 transform hover:-translate-y-1 border-2 cursor-pointer",
                                    isUnlocked ? rarityStyles[plant.rarity] : 'border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900'
                                )}>
                                    <CardContent className="p-4 flex flex-col items-center justify-center text-center aspect-square">
                                        <plant.icon className={cn("w-16 h-16", isUnlocked ? rarityStyles[plant.rarity] : 'text-muted-foreground/50')} />
                                        <div className="mt-4 text-center">
                                            <p className={cn("font-bold text-sm", isUnlocked ? 'text-foreground' : 'text-muted-foreground')}>{plant.name}</p>
                                            {!isUnlocked && (
                                                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-1">
                                                    <Lock className="h-3 w-3" />
                                                    <span>Fase {Math.floor(plant.unlocksAt / 5) + 1}</span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                    <Badge variant="secondary" className={cn("absolute top-2 right-2 text-xs", isUnlocked ? rarityStyles[plant.rarity] : "bg-muted text-muted-foreground")}>{plant.rarity}</Badge>
                                </Card>
                            </PlantInfoDialog>
                        )
                    })}
                </div>

                 {filteredPlants.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <p className="font-semibold">No se encontraron plantas</p>
                        <p className="text-sm">Prueba a cambiar los filtros de búsqueda.</p>
                    </div>
                )}
            </main>
        </div>
    );
}

function PathsDialog({ children, isTerrestrialComplete }: { children: React.ReactNode, isTerrestrialComplete: boolean }) {
    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Elige tu Camino de Conocimiento</DialogTitle>
                    <DialogDescription>
                        Completa un camino para desbloquear el siguiente. Cada sesión de estudio te acerca a tu meta.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {/* Terrestrial Path */}
                    <Card className="relative overflow-hidden border-2 border-green-500/30 bg-green-500 dark:bg-green-950">
                        <Leaf className="absolute -top-2 -left-2 h-10 w-10 text-green-500/10 rotate-12" />
                        <Sprout className="absolute -bottom-2 -right-2 h-10 w-10 text-green-500/10 -rotate-12" />
                        <div className="relative z-10">
                            <CardHeader className="flex flex-row items-center gap-4">
                                <div className="p-3 rounded-lg bg-green-600/10"><TreePine className="h-8 w-8 text-green-600" /></div>
                                <div>
                                    <CardTitle className="text-base text-green-800 dark:text-green-200">Camino Terrestre</CardTitle>
                                    <CardDescription className="text-green-700/80 dark:text-green-300/80">Explora la flora de nuestro planeta.</CardDescription>
                                </div>
                            </CardHeader>
                            <CardFooter>
                                <Button className="w-full bg-green-600 hover:bg-green-700">Seleccionado</Button>
                            </CardFooter>
                        </div>
                    </Card>

                    {/* Underwater Path */}
                    <Card className={cn("relative overflow-hidden", !isTerrestrialComplete && "opacity-60")}>
                        <div className="absolute inset-0 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-500/30" />
                        <Fish className="absolute top-2 right-2 h-10 w-10 text-blue-500/10 rotate-12" />
                        <Waves className="absolute bottom-1 left-4 h-10 w-10 text-blue-500/10" />
                        <div className="relative z-10">
                            <CardHeader className="flex flex-row items-center gap-4">
                                <div className="p-3 rounded-lg bg-blue-600/10"><Fish className="h-8 w-8 text-blue-600" /></div>
                                <div>
                                    <CardTitle className="text-base text-blue-800 dark:text-blue-200">Camino Submarino</CardTitle>
                                    <CardDescription className="text-blue-700/80 dark:text-blue-300/80">Descubre las especies marinas y los secretos del océano.</CardDescription>
                                </div>
                            </CardHeader>
                        </div>
                         {!isTerrestrialComplete && (
                            <div className="absolute top-2 right-2 flex items-center gap-1.5 rounded-full bg-background/80 px-2 py-1 text-xs font-semibold text-muted-foreground border shadow-sm z-20">
                                <Lock className="h-3 w-3"/>
                                Bloqueado
                            </div>
                        )}
                    </Card>
                    
                    {/* Spatial Path */}
                    <Card className={cn("relative overflow-hidden", !isTerrestrialComplete && "opacity-60")}>
                         <div className="absolute inset-0 bg-indigo-50 dark:bg-indigo-950 rounded-lg border border-indigo-500/30" />
                         <Sparkles className="absolute top-2 left-2 h-10 w-10 text-indigo-500/10 rotate-[-30deg]" />
                        <Rocket className="absolute bottom-2 right-2 h-10 w-10 text-indigo-500/10 rotate-[20deg]" />
                        <div className="relative z-10">
                            <CardHeader className="flex flex-row items-center gap-4">
                                <div className="p-3 rounded-lg bg-indigo-600/10"><Rocket className="h-8 w-8 text-indigo-600" /></div>
                                <div>
                                    <CardTitle className="text-base text-indigo-800 dark:text-indigo-200">Camino Espacial</CardTitle>
                                    <CardDescription className="text-indigo-700/80 dark:text-indigo-300/80">Viaja por el cosmos y explora planetas lejanos.</CardDescription>
                                </div>
                            </CardHeader>
                        </div>
                         {!isTerrestrialComplete && (
                            <div className="absolute top-2 right-2 flex items-center gap-1.5 rounded-full bg-background/80 px-2 py-1 text-xs font-semibold text-muted-foreground border shadow-sm z-20">
                                <Lock className="h-3 w-3"/>
                                Bloqueado
                            </div>
                        )}
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    )
}

    