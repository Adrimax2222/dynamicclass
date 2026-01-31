
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Settings, Search, Sprout, Trees, Flower, Sun, Plus, TreePine, Rocket, Trophy, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { WipDialog } from "@/components/layout/wip-dialog";
import { useApp } from "@/lib/hooks/use-app";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { AvatarDisplay } from "@/components/profile/avatar-creator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type Plant = {
    id: number;
    name: string;
    icon: React.ElementType;
    rarity: 'Común' | 'Poco Común' | 'Raro' | 'Épico';
    unlocksAt: number; // number of plants needed
    description: string;
};

const allPlants: Plant[] = [
    { id: 1, name: 'Helecho Clásico', rarity: 'Común', icon: Sprout, unlocksAt: 0, description: "Los helechos son plantas vasculares sin semilla, de las más antiguas del planeta. Se reproducen mediante esporas y son conocidos por sus frondosas hojas llamadas 'frondas'. Prefieren los ambientes húmedos y sombreados." },
    { id: 2, name: 'Lirio Acuático', rarity: 'Común', icon: Flower, unlocksAt: 5, description: "También conocidos como nenúfares, los lirios acuáticos flotan en la superficie de aguas tranquilas. Sus grandes hojas proporcionan sombra y refugio a la vida acuática, y sus flores son un símbolo de pureza y belleza en muchas culturas." },
    { id: 3, name: 'Girasol Radiante', rarity: 'Poco Común', icon: Sun, unlocksAt: 10, description: "Los girasoles son famosos por su heliotropismo, la capacidad de seguir el movimiento del sol a lo largo del día. Sus semillas no solo son un alimento nutritivo, sino también una fuente importante de aceite vegetal." },
    { id: 4, name: 'Roble Ancestral', rarity: 'Poco Común', icon: Trees, unlocksAt: 15, description: "El roble es un árbol longevo y robusto, símbolo de fuerza y resistencia. Su madera es muy apreciada en la carpintería y su fruto, la bellota, es un alimento vital para muchas especies de la fauna del bosque." },
    { id: 5, name: 'Planta Carnívora', rarity: 'Raro', icon: Sprout, unlocksAt: 20, description: "La 'Venus atrapamoscas' es la planta carnívora más conocida. Ha evolucionado para capturar insectos y arañas con sus hojas en forma de trampa, obteniendo así los nutrientes que no encuentra en su suelo pantanoso nativo." },
    { id: 6, name: 'Pino Místico', rarity: 'Raro', icon: TreePine, unlocksAt: 25, description: "Los pinos son árboles de hoja perenne que se caracterizan por sus conos (piñas) y sus hojas en forma de aguja. Son una fuente crucial de madera y resina, y sus bosques son ecosistemas vitales en todo el mundo." },
    { id: 7, name: 'Rosa Estelar', rarity: 'Épico', icon: Flower, unlocksAt: 30, description: "La rosa es una de las flores más cultivadas y apreciadas del mundo, un símbolo universal de amor y belleza. Existen miles de variedades, y sus pétalos se utilizan para producir aceites esenciales y perfumes." },
    { id: 8, name: 'Árbol Solar', rarity: 'Épico', icon: Sun, unlocksAt: 35, description: "Inspirado en el Baobab, conocido como 'el Árbol de la Vida'. Este árbol africano puede vivir miles de años y almacenar hasta 120,000 litros de agua en su tronco para sobrevivir a las sequías extremas, siendo un pilar de su ecosistema." },
];

const PlantInfoDialog = ({ plant, unlocked, plantCount, studyTime, phase, plantsInPhase, children }: { 
    plant: Plant; 
    unlocked: boolean; 
    plantCount: number; 
    studyTime: number; 
    phase: number; 
    plantsInPhase: number; 
    children: React.ReactNode;
}) => {
    const Icon = plant.icon;
    const rarityStyles = {
        'Común': "border-green-500/30 bg-green-500/5 text-green-600",
        'Poco Común': "border-blue-500/30 bg-blue-500/5 text-blue-600",
        'Raro': "border-purple-500/30 bg-purple-500/5 text-purple-600",
        'Épico': "border-amber-500/30 bg-amber-500/5 text-amber-600",
    };
    const formatStudyTime = (totalMinutes: number = 0) => {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours}h ${minutes}m`;
    };

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
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
                            <p className="text-xs font-semibold text-muted-foreground">Progreso Fase {phase}</p>
                            <p className="text-xs font-bold">{plantsInPhase} / 5</p>
                        </div>
                        <Progress value={(plantsInPhase / 5) * 100} />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">{plant.description}</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const PlantCard = ({ plant, unlocked, phaseToUnlock }: { plant: Plant, unlocked: boolean, phaseToUnlock: number }) => {
    const rarityStyles = {
        'Común': "border-green-500/30 bg-green-500/5 text-green-600",
        'Poco Común': "border-blue-500/30 bg-blue-500/5 text-blue-600",
        'Raro': "border-purple-500/30 bg-purple-500/5 text-purple-600",
        'Épico': "border-amber-500/30 bg-amber-500/5 text-amber-600",
    };

    const Icon = plant.icon;

    return (
        <Card className={cn(
            "group relative overflow-hidden transition-all duration-300 transform hover:-translate-y-1 border-2 cursor-pointer",
            unlocked ? rarityStyles[plant.rarity] : 'border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900'
        )}>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center aspect-square">
                <Icon className={cn("w-16 h-16", unlocked ? rarityStyles[plant.rarity] : 'text-muted-foreground/50')} />
                <div className="mt-4 text-center">
                    <p className={cn("font-bold text-sm", unlocked ? 'text-foreground' : 'text-muted-foreground')}>{plant.name}</p>
                    {!unlocked && <p className="text-xs text-muted-foreground mt-1">Completa la Fase {phaseToUnlock - 1} para desbloquear</p>}
                </div>
            </CardContent>
            <Badge variant="secondary" className={cn("absolute top-2 right-2 text-xs", unlocked ? rarityStyles[plant.rarity] : "bg-muted text-muted-foreground")}>{plant.rarity}</Badge>
        </Card>
    );
};

export default function CollectionPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const { user, plantCount, studyMinutes } = useApp();

    const filteredPlants = allPlants.filter(plant => 
        plant.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const currentPhase = Math.floor(plantCount / 5) + 1;
    const plantsInCurrentPhase = plantCount % 5;
    
    const nextPlant = allPlants.find(p => p.unlocksAt > plantCount);
    const progressToNext = nextPlant ? (plantsInCurrentPhase / 5) * 100 : 100;

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
                    <WipDialog>
                        <Button variant="ghost" size="icon">
                            <Settings />
                        </Button>
                    </WipDialog>
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
                            <p className="text-2xl font-bold">{currentPhase}</p>
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
                                    <nextPlant.icon className="h-6 w-6 text-primary"/>
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold">{nextPlant.name}</p>
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
                            <p className="text-xs text-muted-foreground">Has desbloqueado todas las plantas disponibles.</p>
                        </CardContent>
                    </Card>
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
                        const phaseToUnlock = (plant.unlocksAt / 5) + 1;
                        return (
                            <PlantInfoDialog 
                                key={plant.id} 
                                plant={plant} 
                                unlocked={isUnlocked} 
                                plantCount={plantCount} 
                                studyTime={user?.studyMinutes || 0}
                                phase={currentPhase} 
                                plantsInPhase={plantsInCurrentPhase}
                            >
                                <PlantCard 
                                    plant={plant} 
                                    unlocked={isUnlocked} 
                                    phaseToUnlock={phaseToUnlock} 
                                />
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

    