
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, Settings, Search, Leaf, Lock, Filter, Sprout, Trees, Flower, Sun, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { WipDialog } from "@/components/layout/wip-dialog";
import { useApp } from "@/lib/hooks/use-app";

type Plant = {
    id: number;
    name: string;
    icon: React.ElementType;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic';
};

type PlantModule = {
    name: string;
    unlocksAt: number;
    plants: Plant[];
};

const plantModules: PlantModule[] = [
    {
        name: 'Módulo 1: Básicos',
        unlocksAt: 0,
        plants: [{ id: 1, name: 'Helecho Clásico', rarity: 'common', icon: Sprout }]
    },
    {
        name: 'Módulo 2: Flores Acuáticas',
        unlocksAt: 5,
        plants: [{ id: 2, name: 'Lirio Acuático', rarity: 'uncommon', icon: Flower }]
    },
    {
        name: 'Módulo 3: Flores Solares',
        unlocksAt: 10,
        plants: [{ id: 3, name: 'Girasol Radiante', rarity: 'uncommon', icon: Sun }]
    },
    {
        name: 'Módulo 4: Foresta Ancestral',
        unlocksAt: 15,
        plants: [{ id: 4, name: 'Roble Ancestral', rarity: 'rare', icon: Trees }]
    },
    {
        name: 'Módulo 5: Especies Exóticas',
        unlocksAt: 20,
        plants: [{ id: 5, name: 'Planta Carnívora', rarity: 'epic', icon: Sprout }]
    },
    {
        name: 'Módulo 6: Flora Mística',
        unlocksAt: 25,
        plants: [{ id: 6, name: 'Orquídea Fantasma', rarity: 'epic', icon: Flower }]
    },
];

const PlantCard = ({ plant, unlocked }: { plant: Plant, unlocked: boolean }) => {
    const rarityStyles = {
        common: "border-green-500/30 bg-green-500/5",
        uncommon: "border-blue-500/30 bg-blue-500/5",
        rare: "border-purple-500/30 bg-purple-500/5",
        epic: "border-amber-500/30 bg-amber-500/5",
    };
    
    const rarityTextStyles = {
        common: "text-green-600",
        uncommon: "text-blue-600",
        rare: "text-purple-600",
        epic: "text-amber-600",
    }

    return (
        <Card className={cn(
            "group relative overflow-hidden transition-all duration-300 transform hover:-translate-y-1 border-2",
            unlocked ? rarityStyles[plant.rarity] : 'border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900'
        )}>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center aspect-square">
                {unlocked ? (
                    <>
                        <plant.icon className={cn("w-16 h-16", rarityTextStyles[plant.rarity])} />
                        <p className="font-bold text-sm mt-4 text-foreground">{plant.name}</p>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Lock className="w-10 h-10" />
                        <p className="font-semibold text-sm mt-2">Bloqueado</p>
                    </div>
                )}
            </CardContent>
            {unlocked && <Badge variant="secondary" className={cn("absolute top-2 right-2 text-xs", rarityStyles[plant.rarity], rarityTextStyles[plant.rarity])}>{plant.rarity}</Badge>}
        </Card>
    );
};

export default function CollectionPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const { plantCount } = useApp();

    const filteredModules = plantModules.filter(module => 
        module.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        module.plants.some(plant => plant.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="flex flex-col min-h-screen bg-muted/30">
            <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ChevronLeft />
                </Button>
                <h1 className="text-lg font-bold font-headline">Mi Jardín Botánico</h1>
                <WipDialog>
                    <Button variant="ghost" size="icon">
                        <Settings />
                    </Button>
                </WipDialog>
            </header>

            <main className="flex-1 p-4 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <Card>
                        <CardContent className="p-3 text-center">
                            <p className="text-xs text-muted-foreground">Plantas Totales</p>
                            <p className="text-2xl font-bold">{plantCount} <span className="text-muted-foreground">/ 50</span></p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-3 text-center">
                            <p className="text-xs text-muted-foreground">Módulos</p>
                            <p className="text-2xl font-bold">{Math.floor(plantCount / 5)} <span className="text-muted-foreground">/ {plantModules.length}</span></p>
                        </CardContent>
                    </Card>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Buscar planta o módulo..." 
                        className="bg-background border-input pl-10 focus:ring-primary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                {filteredModules.map((module, index) => {
                    const isUnlocked = plantCount >= module.unlocksAt;
                    const nextModule = plantModules[index + 1];
                    const isCompleted = nextModule ? plantCount >= nextModule.unlocksAt : false;
                    
                    return (
                        <div key={module.name}>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-lg">{module.name}</h3>
                                {isCompleted ? (
                                    <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                                        <Check className="h-3 w-3 mr-1"/> Completado
                                    </Badge>
                                ) : isUnlocked ? (
                                    <Badge variant="outline" className="border-blue-500/20 text-blue-600">En progreso</Badge>
                                ) : (
                                    <Badge variant="destructive">Bloqueado</Badge>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {module.plants.map(plant => (
                                    <PlantCard key={plant.id} plant={plant} unlocked={isUnlocked} />
                                ))}
                            </div>
                        </div>
                    );
                })}

                 {filteredModules.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <p className="font-semibold">No se encontraron plantas</p>
                        <p className="text-sm">Prueba a cambiar los filtros de búsqueda.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
