
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
        common: "border-green-500/20",
        uncommon: "border-blue-500/20",
        rare: "border-purple-500/20",
        epic: "border-amber-500/20",
    };

    return (
        <Card className={cn(
            "group relative overflow-hidden transition-all duration-300 transform hover:-translate-y-1 bg-slate-800/50 border-2",
            plant.unlocked ? rarityStyles[plant.rarity] : 'border-slate-700'
        )}>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center aspect-square">
                {plant.unlocked ? (
                    <>
                        <plant.icon className="w-16 h-16 text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
                        <p className="font-bold text-sm mt-4 text-white">{plant.name}</p>
                        <p className="text-xs text-slate-400">{plant.module}</p>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center text-slate-500">
                        <Lock className="w-10 h-10" />
                        <p className="font-semibold text-sm mt-2">Bloqueado</p>
                    </div>
                )}
            </CardContent>
            {plant.unlocked && <Badge variant="secondary" className={cn("absolute top-2 right-2 text-xs", rarityStyles[plant.rarity])}>{plant.rarity}</Badge>}
        </Card>
    );
};

export default function CollectionPage() {
    const router = useRouter();
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPlants = plantCollection.filter(plant => {
        const matchesFilter = filter === 'all' || (filter === 'unlocked' && plant.unlocked) || (filter === 'locked' && !plant.unlocked);
        const matchesSearch = plant.name.toLowerCase().includes(searchTerm.toLowerCase()) || plant.module.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="flex flex-col min-h-screen bg-slate-900 text-slate-200">
            <header className="p-4 flex items-center justify-between sticky top-0 bg-slate-900/80 backdrop-blur-sm z-10 border-b border-slate-800">
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
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-3 text-center">
                            <p className="text-xs text-slate-400">Plantas Totales</p>
                            <p className="text-2xl font-bold">27 <span className="text-slate-500">/ 50</span></p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-3 text-center">
                            <p className="text-xs text-slate-400">Módulos</p>
                            <p className="text-2xl font-bold">8 <span className="text-slate-500">/ 12</span></p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30 p-4 flex items-center gap-4">
                    <Leaf className="w-8 h-8 text-green-400"/>
                    <div className="flex-1">
                        <p className="text-xs text-green-300">Próximo Desbloqueo</p>
                        <p className="font-bold text-white">Fase 3: Árboles Ancestrales</p>
                    </div>
                    <Trees className="w-12 h-12 text-green-400 opacity-60"/>
                </Card>

                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input 
                            placeholder="Buscar planta o módulo..." 
                            className="bg-slate-800 border-slate-700 pl-10 focus:ring-green-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Tabs defaultValue="all" onValueChange={setFilter}>
                        <TabsList className="grid w-full grid-cols-3 bg-slate-800">
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
                    <div className="text-center py-12 text-slate-500">
                        <p className="font-semibold">No se encontraron plantas</p>
                        <p className="text-sm">Prueba a cambiar los filtros de búsqueda.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
