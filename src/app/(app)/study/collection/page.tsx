
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Search, Sprout, Trees, Flower, Sun, Plus, TreePine, Rocket, Trophy, Clock, Info, Timer, BrainCircuit, Globe, Fish, Lock, Leaf, Waves, Sparkles, Users, ChevronRight, Loader2, ChevronsRight, CheckCircle, Scale, Dna, Gamepad2, Code, Briefcase, SmilePlus, Activity, Banknote, DollarSign, Lightbulb, ShoppingCart, Building, Mountain, Zap, User as UserIcon, Heart, Vote, Brain, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/hooks/use-app";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { AvatarDisplay } from "@/components/profile/avatar-creator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { WipDialog } from "@/components/layout/wip-dialog";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import type { User as AppUser } from "@/lib/types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { RankingDialog } from "@/components/layout/ranking-dialog";

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

const allFish: Plant[] = [
    { id: 13, name: 'Pez Payaso Común', rarity: 'Común', icon: Fish, unlocksAt: 60, description: "Famoso por su vibrante color naranja y blanco, el pez payaso vive en simbiosis con las anémonas, protegiéndose mutuamente de los depredadores.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Amphiprion_ocellaris_%28Clown_anemonefish%29_by_Nick_Hobgood.jpg" },
    { id: 14, name: 'Coral Cerebro', rarity: 'Común', icon: BrainCircuit, unlocksAt: 65, description: "Este tipo de coral duro forma colonias masivas que se asemejan a un cerebro humano. Son fundamentales para la construcción de los arrecifes de coral.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/29/Diploria_strigosa_y_Colpophyllia_natans.jpg" },
    { id: 15, name: 'Pez Cirujano Azul', rarity: 'Poco Común', icon: Fish, unlocksAt: 70, description: "Conocido por su papel en 'Buscando a Nemo', este pez tiene un cuerpo azul intenso y una cola amarilla. Posee espinas afiladas en la base de su cola para defenderse.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/25/Blue_tang_%28Paracanthurus_hepatus%29_02.jpg" },
    { id: 16, name: 'Caballito de Mar', rarity: 'Poco Común', icon: Fish, unlocksAt: 75, description: "Estas criaturas únicas nadan en posición vertical y son conocidas porque el macho es quien lleva los huevos en una bolsa incubadora hasta que eclosionan.", imageUrl: "https://content.nationalgeographic.com.es/medio/2023/01/05/son-expertos-en-camuflaje_76041f32_230105114745_2000x1500.jpg" },
    { id: 17, name: 'Medusa Luna', rarity: 'Raro', icon: Sparkles, unlocksAt: 80, description: "Una medusa translúcida y bioluminiscente que se encuentra en todos los océanos. Su suave pulsación y su brillo etéreo la convierten en un espectáculo hipnótico.", imageUrl: "https://cdn0.expertoanimal.com/es/razas/9/9/8/medusa-luna_899_0_orig.jpg" },
    { id: 18, name: 'Pez Mandarín', rarity: 'Raro', icon: Fish, unlocksAt: 85, description: "Considerado uno de los peces más coloridos del mundo, el pez mandarín exhibe un patrón psicodélico de azules, naranjas y verdes. Es tímido y difícil de avistar.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2d/Synchiropus_splendidus_2_Luc_Viatour.jpg" },
    { id: 19, name: 'Manta Gigante', rarity: 'Épico', icon: Waves, unlocksAt: 90, description: "Con una envergadura de hasta 7 metros, la manta gigante es el rey de las rayas. Son filtradores inteligentes que se alimentan de plancton y viajan grandes distancias.", imageUrl: "https://palmaaquarium.com/storage/app/uploads/public/677/e86/fe2/thumb_541_0_0_0_0_crop.webp" },
    { id: 20, name: 'Pulpo de Anillos Azules', rarity: 'Épico', icon: Sparkles, unlocksAt: 95, description: "Pequeño pero extremadamente venenoso. Cuando se siente amenazado, sus anillos azules iridiscentes parpadean como una advertencia antes de liberar su potente neurotoxina.", imageUrl: "https://cdn.nubika.es/wp-content/uploads/2022/08/pulpo-anillos-azules-caracteristicas-peculiaridades.jpg" },
    { id: 21, name: 'Dragón de Mar Foliado', rarity: 'Legendario', icon: Leaf, unlocksAt: 100, description: "Pariente del caballito de mar, este maestro del camuflaje tiene extensiones en forma de hoja por todo su cuerpo, lo que le permite mezclarse perfectamente con las algas.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/dc/Leafydragon.jpg" },
    { id: 22, name: 'Pez León', rarity: 'Legendario', icon: Fish, unlocksAt: 105, description: "Con sus aletas pectorales en forma de abanico y sus espinas venenosas, el pez león es una especie invasora hermosa pero destructiva en el Atlántico.", imageUrl: "https://palmaaquarium.com/storage/app/uploads/public/677/e86/fe2/thumb_541_0_0_0_0_crop.webp" },
    { id: 23, name: 'Tiburón Ballena', rarity: 'Legendario', icon: Waves, unlocksAt: 110, description: "El pez más grande del mundo. A pesar de su enorme tamaño, este gigante gentil es un filtrador que se alimenta principalmente de plancton, moviéndose lentamente por los océanos tropicales.", imageUrl: "https://media.es.wired.com/photos/68754280e5f49ae2052896bf/16:9/w_2560%2Cc_limit/tiburonballena.jpg" },
    { id: 24, name: 'Calamar Gigante', rarity: 'Legendario', icon: Sparkles, unlocksAt: 115, description: "Una criatura de las profundidades marinas envuelta en misterio. Con ojos del tamaño de un plato, es uno de los invertebrados más grandes, y sus batallas con los cachalotes son legendarias.", imageUrl: "https://e01-phantom-elmundo.uecdn.es/5b00b2632f094c0fdadb9e827bd63bf6/resize/1200/f/webp/assets/multimedia/imagenes/2022/10/20/16662629478420.jpg" },
];

const allPlanets: Plant[] = [
    { id: 25, name: 'Mercurio', rarity: 'Común', icon: Globe, unlocksAt: 120, description: "El planeta más cercano al Sol. Tiene una superficie llena de cráteres, similar a la Luna, y experimenta las temperaturas más extremas del sistema solar.", imageUrl: "https://framerusercontent.com/images/3V9s9o6S3vG4s7a9d3c9m9Q.jpg" },
    { id: 26, name: 'Venus', rarity: 'Común', icon: Globe, unlocksAt: 125, description: "Un planeta con una atmósfera tóxica y un efecto invernadero descontrolado. Su superficie es tan caliente que podría derretir plomo.", imageUrl: "https://framerusercontent.com/images/k8R4N7p0c9E7t9x8f6W5B0A.jpg" },
    { id: 27, name: 'Tierra', rarity: 'Poco Común', icon: Globe, unlocksAt: 130, description: "Nuestro hogar. El único planeta conocido con vida, océanos de agua líquida en su superficie y una atmósfera rica en oxígeno.", imageUrl: "https://framerusercontent.com/images/d3f7e6c9b1a5d2c4e8i7o6p.jpg" },
    { id: 28, name: 'Marte', rarity: 'Poco Común', icon: Globe, unlocksAt: 135, description: "Conocido como el Planeta Rojo por su óxido de hierro. Tiene casquetes polares, volcanes gigantes y cañones inmensos. Es el objetivo principal de la exploración humana.", imageUrl: "https://framerusercontent.com/images/m3b1c0d9e8f7a6b5c4d3e2f.jpg" },
    { id: 29, name: 'Júpiter', rarity: 'Raro', icon: Globe, unlocksAt: 140, description: "El gigante gaseoso. Es tan masivo que podría contener a todos los demás planetas del sistema solar. Su Gran Mancha Roja es una tormenta más grande que la Tierra.", imageUrl: "https://framerusercontent.com/images/j8g7h6i5f4e3d2c1b0a9z8y.jpg" },
    { id: 30, name: 'Saturno', rarity: 'Raro', icon: Globe, unlocksAt: 145, description: "Famoso por su espectacular sistema de anillos, compuestos de hielo y roca. A pesar de su tamaño, es el planeta menos denso; podría flotar en el agua.", imageUrl: "https://framerusercontent.com/images/s1a2b3c4d5e6f7g8h9i0j1k.jpg" },
    { id: 31, name: 'Urano', rarity: 'Épico', icon: Globe, unlocksAt: 150, description: "Un gigante de hielo que rota de lado, con sus anillos orientados verticalmente. Su atmósfera de metano le da un característico color azul verdoso.", imageUrl: "https://framerusercontent.com/images/u6r5a4n3i2o1p0q9r8s7t6u.jpg" },
    { id: 32, name: 'Neptuno', rarity: 'Épico', icon: Globe, unlocksAt: 155, description: "El planeta más alejado del Sol. Un mundo oscuro, frío y azotado por vientos supersónicos, con una atmósfera de un azul intenso y tormentas gigantes.", imageUrl: "https://framerusercontent.com/images/n1e2p3t4u5n6e7p8t9u0n1e.jpg" },
    { id: 33, name: 'Plutón', rarity: 'Legendario', icon: Globe, unlocksAt: 160, description: "El planeta enano más famoso. Tiene una órbita excéntrica, montañas de hielo y un 'corazón' de nitrógeno congelado en su superficie.", imageUrl: "https://framerusercontent.com/images/p1l2u3t4o5n6e7x8y9z0a1b.jpg" },
    { id: 34, name: 'Ceres', rarity: 'Legendario', icon: Globe, unlocksAt: 165, description: "El objeto más grande del cinturón de asteroides. Se cree que bajo su corteza helada podría albergar un océano de agua salada.", imageUrl: "https://framerusercontent.com/images/c3e2r1e0s9z8y7x6w5v4u3t.jpg" },
    { id: 35, name: 'Kepler-186f', rarity: 'Legendario', icon: Globe, unlocksAt: 170, description: "El primer exoplaneta de tamaño similar a la Tierra descubierto en la zona habitable de otra estrella. Podría tener agua líquida en su superficie.", imageUrl: "https://framerusercontent.com/images/k1e8p6l3e2r1f0a9b8c7d6e.jpg" },
    { id: 36, name: 'TRAPPIST-1e', rarity: 'Legendario', icon: Globe, unlocksAt: 175, description: "Considerado uno de los exoplanetas potencialmente habitables más prometedores. Orbita una estrella enana ultrafría y tiene un tamaño y masa muy similares a los de la Tierra.", imageUrl: "https://framerusercontent.com/images/t1r0a9p8p7i6s5t4e3d2c1b.jpg" },
];


const rarityStyles = {
    'Común': "border-green-500/30 bg-green-500/5 text-green-600",
    'Poco Común': "border-blue-500/30 bg-blue-500/5 text-blue-600",
    'Raro': "border-purple-500/30 bg-purple-500/5 text-purple-600",
    'Épico': "border-amber-500/30 bg-amber-500/5 text-amber-600",
    'Legendario': "border-pink-500/30 bg-pink-500/5 text-pink-600",
};

const PlantInfoDialog = ({ plant, unlocked, plantCount, studyTime, children, path }: { 
    plant: Plant; 
    unlocked: boolean; 
    plantCount: number; 
    studyTime: number; 
    children: React.ReactNode;
    path: 'terrestrial' | 'aquatic' | 'space';
}) => {
    const Icon = plant.icon;
    const formatStudyTime = (totalMinutes: number = 0) => {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours}h ${minutes}m`;
    };

    let unlockOffset = 0;
    let phaseOffset = 0;
    
    if (path === 'aquatic') {
        unlockOffset = 60;
        phaseOffset = 12;
    } else if (path === 'space') {
        unlockOffset = 120;
        phaseOffset = 24;
    }

    const plantPhaseNumber = Math.floor((plant.unlocksAt - unlockOffset) / 5) + 1 + phaseOffset;
    const currentPathCount = plantCount - unlockOffset;
    const userPhaseNumber = Math.floor(currentPathCount / 5) + 1 + phaseOffset;
    
    let progressInPhaseToShow = 0;
    if (plantPhaseNumber < userPhaseNumber) {
        progressInPhaseToShow = 5;
    } else if (plantPhaseNumber === userPhaseNumber) {
        progressInPhaseToShow = currentPathCount % 5;
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
                            <p className="text-xs font-semibold text-muted-foreground">Total Recolectado</p>
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
    const [viewingPath, setViewingPath] = useState<'terrestrial' | 'aquatic' | 'space'>('terrestrial');
    
    useEffect(() => {
        if (plantCount >= 120) {
            setViewingPath('space');
        } else if (plantCount >= 60) {
            setViewingPath('aquatic');
        } else {
            setViewingPath('terrestrial');
        }
    }, [plantCount]);
    
    const isAquaticUnlocked = plantCount >= 60;
    const isSpaceUnlocked = plantCount >= 120;
    
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
        return classmatesData
            .filter(c => c.uid !== user?.uid)
            .sort((a, b) => (b.plantCount || 0) - (a.plantCount || 0));
    }, [classmatesData, user]);
    
    const handlePathSwitch = () => {
        setViewingPath(prev => {
            if (prev === 'terrestrial') return isAquaticUnlocked ? 'aquatic' : 'terrestrial';
            if (prev === 'aquatic') return isSpaceUnlocked ? 'space' : 'terrestrial';
            return 'terrestrial';
        });
    };

    // Dynamic data based on path
    const activePathData = viewingPath === 'space' ? allPlanets : viewingPath === 'aquatic' ? allFish : allPlants;
    let currentPathCount, phaseOffset, unlockOffset;
    if (viewingPath === 'space') {
        currentPathCount = plantCount - 120;
        phaseOffset = 24;
        unlockOffset = 120;
    } else if (viewingPath === 'aquatic') {
        currentPathCount = plantCount - 60;
        phaseOffset = 12;
        unlockOffset = 60;
    } else {
        currentPathCount = plantCount;
        phaseOffset = 0;
        unlockOffset = 0;
    }

    const filteredPlants = activePathData.filter(plant => 
        plant.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const currentPhase = Math.floor(currentPathCount / 5) + 1 + phaseOffset;
    const plantsInCurrentPhase = currentPathCount % 5;
    
    const nextItem = activePathData.find(p => (p.unlocksAt - unlockOffset) > currentPathCount);
    const progressToNext = nextItem ? (plantsInCurrentPhase / 5) * 100 : 100;

    const isTerrestrialComplete = plantCount >= 60;
    const isAquaticComplete = plantCount >= 120;
    const isSpaceComplete = plantCount >= 180;

    const lastUnlockedItem = activePathData.slice().reverse().find(p => currentPathCount >= (p.unlocksAt - unlockOffset));
    const CurrentPhaseIcon = lastUnlockedItem ? lastUnlockedItem.icon :
                             viewingPath === 'space' ? Rocket :
                             viewingPath === 'aquatic' ? Fish : Sprout;

    const pageTitle = viewingPath === 'space' ? 'Mi Universo' : viewingPath === 'aquatic' ? 'Mi Acuario Exótico' : 'Mi Jardín Botánico';
    const PageIcon = viewingPath === 'space' ? Rocket : viewingPath === 'aquatic' ? Waves : TreePine;
    const themeColor = viewingPath === 'space' ? 'purple' : viewingPath === 'aquatic' ? 'blue' : 'green';
    const totalPathIcon = viewingPath === 'space' ? Globe : PageIcon;

    return (
        <div className={cn("flex flex-col min-h-screen", 
            viewingPath === 'terrestrial' && 'bg-muted/30',
            viewingPath === 'aquatic' && 'bg-blue-500/5',
            viewingPath === 'space' && 'bg-space-pattern text-white'
        )}>
            <header className={cn("p-4 flex items-center justify-between sticky top-0 z-10 border-b", viewingPath === 'space' ? 'bg-black/80 backdrop-blur-sm' : 'bg-background/80 backdrop-blur-sm')}>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ChevronLeft />
                    </Button>
                    <h1 className="text-lg font-bold font-headline flex items-center gap-2">
                        <PageIcon className={cn("h-5 w-5", `text-${themeColor}-600`)} />
                        {pageTitle}
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    {user && (
                        <RankingDialog user={user} openTo="shop">
                            <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
                                <ShoppingCart className="h-5 w-5 text-primary"/>
                            </Button>
                        </RankingDialog>
                    )}
                    {isAquaticUnlocked && (
                         <Button variant="outline" size="icon" onClick={handlePathSwitch}>
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    )}
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
                                        <p className="text-muted-foreground">Cada vez que completas una sesión de enfoque de al menos 7 minutos en el "Modo Estudio", ganas una nueva planta para tu jardín.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg mt-1"><Rocket className="h-5 w-5 text-primary" /></div>
                                    <div>
                                        <h4 className="font-semibold">Avanza por Fases</h4>
                                        <p className="text-muted-foreground">Tu colección se divide en fases. Cada 5 plantas/peces que consigues, completas una fase y avanzas a la siguiente.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg mt-1"><Flower className="h-5 w-5 text-primary" /></div>
                                    <div>
                                        <h4 className="font-semibold">Desbloquea Nuevas Especies</h4>
                                        <p className="text-muted-foreground">Al completar una fase, desbloqueas la siguiente especie de la colección, que será cada vez más exótica y rara.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg mt-1"><BrainCircuit className="h-5 w-5 text-primary" /></div>
                                    <div>
                                        <h4 className="font-semibold">Aprende y Explora</h4>
                                        <p className="text-muted-foreground">Haz clic en cada especie para ver tus estadísticas, el progreso de la fase y aprender datos reales y curiosos.</p>
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
                    <Card className={cn(
                        viewingPath === 'terrestrial' && 'bg-green-500/10 border-green-500/30',
                        viewingPath === 'aquatic' && 'bg-blue-500/10 border-blue-500/30',
                        viewingPath === 'space' && 'bg-purple-500/10 border-purple-500/30',
                    )}>
                        <CardContent className="p-3 text-center">
                            <p className={cn("text-xs font-semibold", 
                                viewingPath === 'terrestrial' && 'text-green-700 dark:text-green-300',
                                viewingPath === 'aquatic' && 'text-blue-700 dark:text-blue-300',
                                viewingPath === 'space' && 'text-purple-700 dark:text-purple-300',
                            )}>Total</p>
                            <div className="flex items-center justify-center gap-1">
                                <totalPathIcon className={cn("h-5 w-5", 
                                    viewingPath === 'terrestrial' && 'text-green-600',
                                    viewingPath === 'aquatic' && 'text-blue-600',
                                    viewingPath === 'space' && 'text-purple-600',
                                )} />
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
                
                 {plantCount >= 115 && plantCount < 120 ? (
                    <Card className="bg-gradient-to-tr from-purple-500 to-pink-500 text-white shadow-lg animate-pulse-slow">
                        <CardHeader className="p-3">
                             <p className="text-xs text-white/80 text-center">Siguiente Desbloqueo</p>
                        </CardHeader>
                        <CardContent className="p-3 pt-0 space-y-2 text-center">
                            <Rocket className="h-8 w-8 mx-auto" />
                            <p className="font-bold">¡A las Estrellas!</p>
                            <Progress value={progressToNext} className="h-2 [&>div]:bg-white/80" />
                        </CardContent>
                    </Card>
                ) : nextItem ? (
                    <Card>
                        <CardHeader className="p-3">
                            <p className="text-xs text-muted-foreground text-center">Siguiente Desbloqueo</p>
                        </CardHeader>
                        <CardContent className="p-3 pt-0 space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-muted rounded-lg">
                                    <nextItem.icon className="h-6 w-6 text-muted-foreground"/>
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-muted-foreground">{nextItem.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Progreso: {plantsInCurrentPhase} / 5
                                    </p>
                                </div>
                            </div>
                            <Progress value={progressToNext} className="h-2" />
                        </CardContent>
                    </Card>
                ) : (
                     <Card className={cn("border-dashed", 
                        viewingPath === 'terrestrial' && "bg-green-500/10 border-green-500/30",
                        viewingPath === 'aquatic' && "bg-blue-500/10 border-blue-500/30",
                        viewingPath === 'space' && "bg-purple-500/10 border-purple-500/30"
                     )}>
                        <CardContent className="p-4 text-center">
                            <p className={cn("font-bold", 
                                viewingPath === 'terrestrial' && "text-green-700",
                                viewingPath === 'aquatic' && "text-blue-700",
                                viewingPath === 'space' && "text-purple-700"
                            )}>
                                ¡Felicidades! Has completado el {pageTitle}.
                            </p>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between p-4">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Globe className="h-5 w-5 text-primary"/>
                                Caminos de Conocimiento
                            </CardTitle>
                            <CardDescription>Explora las diferentes sendas.</CardDescription>
                        </div>
                        <PathsDialog isTerrestrialComplete={isTerrestrialComplete} isAquaticComplete={isAquaticComplete} isSpaceComplete={isSpaceComplete}>
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
                                                const classmatePath = classmatePlantCount >= 120 ? 'Espacial' : classmatePlantCount >= 60 ? 'Acuático' : 'Terrestre';
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
                                                                    <Badge variant="outline" className={cn(
                                                                        "mt-2 text-xs", 
                                                                        classmatePath === 'Acuático' && 'border-blue-500/50 bg-blue-500/10 text-blue-600',
                                                                        classmatePath === 'Espacial' && 'border-purple-500/50 bg-purple-500/10 text-purple-600'
                                                                    )}>{classmatePath}</Badge>
                                                                </CardContent>
                                                            </Card>
                                                        </div>
                                                    </CarouselItem>
                                                );
                                            })}
                                        </CarouselContent>
                                        <div className="flex justify-center gap-4 pt-4">
                                          <CarouselPrevious className="static translate-y-0" />
                                          <CarouselNext className="static translate-y-0" />
                                        </div>
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
                        placeholder="Buscar especie..." 
                        className="bg-background border-input pl-10 focus:ring-primary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    {filteredPlants.map((plant) => {
                        const isUnlocked = plantCount >= plant.unlocksAt;
                        
                        return (
                             <PlantInfoDialog 
                                key={plant.id} 
                                plant={plant} 
                                unlocked={isUnlocked}
                                plantCount={plantCount} 
                                studyTime={user?.studyMinutes || 0}
                                path={viewingPath}
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
                                                    <span>Fase {Math.floor((plant.unlocksAt - unlockOffset) / 5) + 1 + phaseOffset}</span>
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
                        <p className="font-semibold">No se encontraron especies</p>
                        <p className="text-sm">Prueba a cambiar los filtros de búsqueda.</p>
                    </div>
                )}
            </main>
        </div>
    );
}

function PathsDialog({ children, isTerrestrialComplete, isAquaticComplete, isSpaceComplete }: { children: React.ReactNode, isTerrestrialComplete: boolean, isAquaticComplete: boolean, isSpaceComplete: boolean }) {
    
    const pathsData = [
      {
        sectionTitle: "Caminos Naturales",
        sectionIcon: Globe,
        paths: [
          {
            title: "Camino Terrestre",
            icon: TreePine,
            description: "Explora la flora de nuestro planeta.",
            status: isTerrestrialComplete ? 'completed' : 'active'
          },
          {
            title: "Camino Submarino",
            icon: Waves,
            description: "Descubre las especies marinas y los secretos del océano.",
            status: isTerrestrialComplete ? (isAquaticComplete ? 'completed' : 'active') : 'locked'
          },
          {
            title: "Camino Espacial",
            icon: Rocket,
            description: "Viaja por el cosmos y explora planetas lejanos.",
            status: isAquaticComplete ? (isSpaceComplete ? 'completed' : 'active') : 'locked'
          },
        ],
      },
      {
        sectionTitle: "Caminos Globales",
        sectionIcon: Users,
        paths: [
          { title: "América", icon: Globe, description: "Culturas, historia y paisajes del continente americano.", status: 'locked' },
          { title: "Europa", icon: Globe, description: "Desde la antigua Grecia hasta la innovación moderna.", status: 'locked' },
          { title: "África", icon: Globe, description: "La cuna de la humanidad, llena de diversidad y riqueza.", status: 'locked' },
          { title: "Asia", icon: Globe, description: "Tradiciones milenarias y el auge del futuro tecnológico.", status: 'locked' },
          { title: "Oceanía", icon: Globe, description: "Islas paradisíacas y ecosistemas únicos en el mundo.", status: 'locked' },
          { title: "Antártida", icon: Globe, description: "El continente helado, un laboratorio natural extremo.", status: 'locked' },
        ]
      },
      {
        sectionTitle: "Caminos Tecnológicos",
        sectionIcon: BrainCircuit,
        paths: [
            { title: "El Futuro del Yo", icon: Dna, description: "Biotecnología, wearables y cómo la tecnología nos modifica.", status: 'locked' },
            { title: "Mundos Virtuales", icon: Gamepad2, description: "Gaming, metaverso y realidad aumentada.", status: 'locked' },
            { title: "Inteligencia y Automatización", icon: BrainCircuit, description: "IA, robots y cómo las máquinas aprenden a 'pensar' y trabajar por nosotros.", status: 'locked' },
            { title: "Creación Digital", icon: Code, description: "Programación, diseño y arquitectura de nuevas herramientas.", status: 'locked' },
        ]
      },
      {
        sectionTitle: "Política y Sociedad",
        sectionIcon: Scale,
        paths: [
            { title: "Impacto Social", icon: Users, description: "Activismo, ayuda comunitaria y cómo las acciones individuales afectan al colectivo.", status: 'locked' },
            { title: "El Planeta en Juego", icon: Leaf, description: "Ecologismo, sostenibilidad y la política ambiental desde una visión joven.", status: 'locked' },
            { title: "Poder y Ciudadanía", icon: Vote, description: "Cómo funcionan las instituciones, los derechos humanos y cómo se puede influir en las reglas del juego (voto, protestas, leyes).", status: 'locked' },
            { title: "Economía y Futuro", icon: Briefcase, description: "El dinero, el trabajo, el acceso a la vivienda y cómo se distribuye la riqueza en la sociedad actual.", status: 'locked' },
        ]
      },
      {
          sectionTitle: "Bienestar y Salud Mental",
          sectionIcon: Brain,
          paths: [
              { title: "Gestión Emocional", icon: SmilePlus, description: "Herramientas para entender la ansiedad, estrés y autoestima.", status: 'locked' },
              { title: "Relaciones y Vínculos", icon: Heart, description: "Construir relaciones sanas y responsabilidad afectiva.", status: 'locked' },
              { title: "Autoconocimiento", icon: UserIcon, description: "Psicología aplicada, meditación y entender 'por qué soy como soy'.", status: 'locked' },
              { title: "Cuerpo y Mente", icon: Activity, description: "Conexión entre alimentación, sueño, deporte y equilibrio mental.", status: 'locked' },
          ]
      },
      {
          sectionTitle: "Autonomía y Finanzas",
          sectionIcon: TrendingUp,
          paths: [
              { title: "Survival Kit Económico", icon: Banknote, description: "Educación financiera básica (ahorro, impuestos, bancos) explicada de forma humana.", status: 'locked' },
              { title: "Nuevas Economías", icon: DollarSign, description: "Inversiones, cripto, economía colaborativa y cómo generar ingresos por internet.", status: 'locked' },
              { title: "Emprendimiento y Proyectos", icon: Lightbulb, description: "Cómo convertir una idea en algo real, desde un podcast hasta una marca de ropa.", status: 'locked' },
              { title: "Carreras del Futuro", icon: Rocket, description: "Orientación sobre trabajos que aún no existen y cómo formarse de manera autodidacta.", status: 'locked' },
          ]
      },
      {
          sectionTitle: "Sostenibilidad y Planeta",
          sectionIcon: Leaf,
          paths: [
              { title: "Consumo Consciente", icon: ShoppingCart, description: "Guías sobre qué comprar, a quién apoyar y cómo reducir el rastro que dejamos.", status: 'locked' },
              { title: "Vivienda y Entorno", icon: Building, description: "Ciudades sostenibles y nomadismo digital.", status: 'locked' },
              { title: "Naturaleza y Aventura", icon: Mountain, description: "Reconexión con el medio ambiente y viajes de bajo impacto.", status: 'locked' },
              { title: "Innovación Ecológica", icon: Zap, description: "Bio-materiales, energías limpias y soluciones creativas a los residuos.", status: 'locked' },
          ]
      }
    ];

    const statusConfig = {
      completed: { label: 'Completado', color: 'bg-green-500 text-white', icon: CheckCircle },
      active: { label: 'Activo', color: 'bg-primary text-white', icon: CheckCircle },
      locked: { label: 'Bloqueado', color: 'bg-muted text-muted-foreground', icon: Lock }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-lg w-[95vw] h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-2 border-b">
                    <DialogTitle>Caminos de Conocimiento</DialogTitle>
                    <DialogDescription>
                        Completa un camino para desbloquear el siguiente. ¡El conocimiento es una aventura!
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-1">
                    <div className="p-6 space-y-6">
                        {pathsData.map((section, sectionIndex) => (
                            <div key={section.sectionTitle}>
                                {sectionIndex > 0 && <Separator className="mb-6" />}
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <section.sectionIcon className="h-4 w-4" />
                                    {section.sectionTitle}
                                </h3>
                                <div className="space-y-3">
                                    {section.paths.map((path) => {
                                        const { label, color, icon: StatusIcon } = statusConfig[path.status as keyof typeof statusConfig];
                                        return (
                                            <Card key={path.title} className={cn("relative overflow-hidden", path.status === 'locked' && 'bg-muted/50')}>
                                                <CardHeader className="flex flex-row items-center gap-4 p-4">
                                                    <div className={cn("p-3 rounded-lg", path.status === 'locked' ? 'bg-muted' : 'bg-primary/10')}>
                                                        <path.icon className={cn("h-6 w-6", path.status === 'locked' ? 'text-muted-foreground' : 'text-primary')} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <CardTitle className="text-base">{path.title}</CardTitle>
                                                        <CardDescription className="text-xs">{path.description}</CardDescription>
                                                    </div>
                                                    <div className={cn("absolute top-2 right-2 flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold", color)}>
                                                        <StatusIcon className="h-3 w-3"/>
                                                        <span>{label}</span>
                                                    </div>
                                                </CardHeader>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                         <p className="text-center text-xs text-muted-foreground pt-4">
                           Próximamente más caminos por descubrir en Dynamic Class.
                        </p>
                    </div>
                </ScrollArea>
                 <DialogFooter className="p-4 border-t">
                    <DialogClose asChild>
                        <Button variant="outline">Cerrar</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

```
  </change>
  <change>
    <file>src/app/globals.css</file>
    <content><![CDATA[@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 194 100% 97%;
    --foreground: 222.2 84% 4.9%;

    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;

    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;

    --primary: 221 100% 59%;
    --primary-foreground: 210 40% 98%;

    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;

    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;

    --accent: 257 100% 65%;
    --accent-foreground: 210 40% 98%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221 100% 59%;

    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;

    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;

    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;

    --primary: 221 100% 59%;
    --primary-foreground: 210 40% 98%;

    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;

    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;

    --accent: 257 100% 65%;
    --accent-foreground: 210 40% 98%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;

    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 221 100% 59%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

@layer utilities {
  .glass-effect {
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    background-color: rgba(255, 255, 255, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  }

  .dark .glass-effect {
    background-color: rgba(23, 23, 31, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .bg-chat-pattern {
    background-image: radial-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px);
    background-size: 16px 16px;
  }

  .bg-space-pattern {
    background-color: #000000;
    background-image:  radial-gradient(#ffffff 0.5px, transparent 0.5px), radial-gradient(#ffffff 0.5px, #000000 0.5px);
    background-size: 20px 20px, 30px 30px;
    background-position: 0 0, 10px 10px;
  }
    
  @keyframes slide-out {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(-100%);
      opacity: 0;
    }
  }

  @keyframes slide-in {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slide-out-reverse {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  @keyframes slide-in-reverse {
    from {
      transform: translateX(-100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes float-icons {
    0% {
        transform: translateY(0px);
    }
    50% {
        transform: translateY(-15px);
    }
    100% {
        transform: translateY(0px);
    }
  }
  
  @keyframes float-logo {
    0%, 100% {
        transform: translateY(0px);
    }
    50% {
        transform: translateY(-10px);
    }
  }

  @keyframes pulse-slow {
      0%, 100% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.05);
        opacity: 0.9;
      }
  }

  /* Nuevas animaciones para el chatbot */
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-slide-out {
    animation: slide-out 0.3s ease-in-out forwards;
  }
  .animate-slide-in {
    animation: slide-in 0.3s ease-in-out forwards;
  }
   .animate-slide-out-reverse {
    animation: slide-out-reverse 0.3s ease-in-out forwards;
  }
  .animate-slide-in-reverse {
    animation: slide-in-reverse 0.3s ease-in-out forwards;
  }
  .animate-float-icons {
    animation: float-icons 3s ease-in-out infinite;
  }
  .animate-pulse-slow {
      animation: pulse-slow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  .animate-shimmer {
    animation: shimmer 2s ease-in-out infinite;
  }
  .message-enter {
    animation: fadeInUp 0.3s ease-out;
  }
  .smooth-scroll {
    scroll-behavior: smooth;
  }
}
