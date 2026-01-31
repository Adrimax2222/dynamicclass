
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Settings, Search, Sprout, Trees, Flower, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { WipDialog } from "@/components/layout/wip-dialog";
import { useApp } from "@/lib/hooks/use-app";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { AvatarDisplay } from "@/components/profile/avatar-creator";

type Plant = {
    id: number;
    name: string;
    icon: React.ElementType;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic';
    unlocksAt: number; // number of plants needed
};

const allPlants: Plant[] = [
    { id: 1, name: 'Helecho Clásico', rarity: 'common', icon: Sprout, unlocksAt: 0 },
    { id: 2, name: 'Lirio Acuático', rarity: 'uncommon', icon: Flower, unlocksAt: 5 },
    { id: 3, name: 'Girasol Radiante', rarity: 'uncommon', icon: Sun, unlocksAt: 10 },
    { id: 4, name: 'Roble Ancestral', rarity: 'rare', icon: Trees, unlocksAt: 15 },
    { id: 5, name: 'Planta Carnívora', rarity: 'epic', icon: Sprout, unlocksAt: 20 },
];

const PlantCard = ({ plant, unlocked, phaseToUnlock }: { plant: Plant, unlocked: boolean, phaseToUnlock: number }) => {
    const rarityStyles = {
        common: "border-green-500/30 bg-green-500/5 text-green-600",
        uncommon: "border-blue-500/30 bg-blue-500/5 text-blue-600",
        rare: "border-purple-500/30 bg-purple-500/5 text-purple-600",
        epic: "border-amber-500/30 bg-amber-500/5 text-amber-600",
    };

    const Icon = plant.icon;

    return (
        <Card className={cn(
            "group relative overflow-hidden transition-all duration-300 transform hover:-translate-y-1 border-2",
            unlocked ? rarityStyles[plant.rarity] : 'border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900'
        )}>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center aspect-square">
                <Icon className={cn("w-16 h-16", unlocked ? rarityStyles[plant.rarity] : 'text-muted-foreground/50')} />
                {unlocked ? (
                    <p className="font-bold text-sm mt-4 text-foreground">{plant.name}</p>
                ) : (
                    <div className="mt-4 text-center">
                        <p className="font-semibold text-sm text-muted-foreground">Completa la Fase {phaseToUnlock}</p>
                        <p className="text-xs text-muted-foreground">para desbloquear</p>
                    </div>
                )}
            </CardContent>
            {unlocked && <Badge variant="secondary" className={cn("absolute top-2 right-2 text-xs", rarityStyles[plant.rarity])}>{plant.rarity}</Badge>}
        </Card>
    );
};


export default function CollectionPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const { user, plantCount } = useApp();

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
                <div className="grid grid-cols-2 gap-4">
                    <Card>
                        <CardContent className="p-3 text-center">
                            <p className="text-xs text-muted-foreground">Fase Actual</p>
                            <p className="text-2xl font-bold">{currentPhase}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-3 text-center">
                            <p className="text-xs text-muted-foreground">Progreso de Fase</p>
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
                        const phaseToUnlock = plant.unlocksAt / 5;
                        return (
                            <PlantCard 
                                key={plant.id} 
                                plant={plant} 
                                unlocked={isUnlocked} 
                                phaseToUnlock={phaseToUnlock} 
                            />
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
