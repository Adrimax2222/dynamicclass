"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, Settings, Search, Leaf, Lock, Filter, Sprout, Trees, Flower, Sun, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { WipDialog } from "@/components/layout/wip-dialog";
import { useApp } from "@/lib/hooks/use-app";

type Plant = {
    id: number;
    name: string;
    module: string;
    unlocked: boolean;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic';
    icon: React.ElementType;
};

const plantCollection: Plant[] = [
  { id: 1, name: 'Helecho Clásico', module: 'Módulo 1: Helechos', unlocked: true, rarity: 'common', icon: Sprout },
  { id: 2, name: 'Orquídea Fantasma', module: 'Módulo 4: Orquídeas', unlocked: false, rarity: 'epic', icon: Flower },
  { id: 3, name: 'Roble Ancestral', module: 'Módulo 2: Robles', unlocked: true, rarity: 'rare', icon: Trees },
  { id: 4, name: 'Girasol Radiante', module: 'Módulo 3: Flores', unlocked: true, rarity: 'uncommon', icon: Sun },
  { id: 5, name: 'Bonsái Sereno', module: 'Módulo 2: Robles', unlocked: false, rarity: 'rare', icon: Trees },
  { id: 6, name: 'Lirio Acuático', module: 'Módulo 3: Flores', unlocked: true, rarity: 'common', icon: Flower },
  { id: 7, name: 'Cactus del Desierto', module: 'Módulo 5: Suculentas', unlocked: false, rarity: 'uncommon', icon: Sprout },
  { id: 8, name: 'Planta Carnívora', module: 'Módulo 6: Exóticas', unlocked: true, rarity: 'epic', icon: Sprout },
];

const PlantCard = ({ plant }: { plant: Plant }) => {
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
            plant.unlocked ? rarityStyles[plant.rarity] : 'border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900'
        )}>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center aspect-square">
                {plant.unlocked ? (
                    <>
                        <plant.icon className={cn("w-16 h-16", rarityTextStyles[plant.rarity])} />
                        <p className="font-bold text-sm mt-4 text-foreground">{plant.name}</p>
                        <p className="text-xs text-muted-foreground">{plant.module}</p>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Lock className="w-10 h-10" />
                        <p className="font-semibold text-sm mt-2">Bloqueado</p>
                    </div>
                )}
            </CardContent>
            {plant.unlocked && <Badge variant="secondary" className={cn("absolute top-2 right-2 text-xs", rarityStyles[plant.rarity], rarityTextStyles[plant.rarity])}>{plant.rarity}</Badge>}
        </Card>
    );
};

export default function CollectionPage() {
    const router = useRouter();
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const { plantCount } = useApp();

    const filteredPlants = plantCollection.filter(plant => {
        const matchesFilter = filter === 'all' || (filter === 'unlocked' && plant.unlocked) || (filter === 'locked' && !plant.unlocked);
        const matchesSearch = plant.name.toLowerCase().includes(searchTerm.toLowerCase()) || plant.module.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

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
                            <p className="text-2xl font-bold">8 <span className="text-muted-foreground">/ 12</span></p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30 p-4 flex items-center gap-4">
                    <Leaf className="w-8 h-8 text-green-500"/>
                    <div className="flex-1">
                        <p className="text-xs text-green-600">Próximo Desbloqueo</p>
                        <p className="font-bold text-foreground">Fase 3: Árboles Ancestrales</p>
                    </div>
                    <Trees className="w-12 h-12 text-green-500 opacity-60"/>
                </Card>

                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Buscar planta o módulo..." 
                            className="bg-background border-input pl-10 focus:ring-primary"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Tabs defaultValue="all" onValueChange={setFilter}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="all">Todas</TabsTrigger>
                            <TabsTrigger value="unlocked">Desbloqueadas</TabsTrigger>
                            <TabsTrigger value="locked">Bloqueadas</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    {filteredPlants.map(plant => <PlantCard key={plant.id} plant={plant} />)}
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
