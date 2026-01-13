
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFirestore } from "@/firebase";
import { useCollection } from "@/firebase/firestore/use-collection";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import type { User } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShieldAlert, Trophy, Gem, Medal, ShoppingCart, Users, GraduationCap, PawPrint, Gamepad2, Ghost, Palmtree, Rocket, Pizza, Cat, Heart, CaseUpper, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { useMemoFirebase } from "@/firebase/hooks";

const ADMIN_EMAILS = ['anavarrod@iestorredelpalau.cat', 'lrotav@iestorredelpalau.cat', 'adrimax.dev@gmail.com'];

const SHOP_AVATARS = [
    { id: 'paw', icon: PawPrint },
    { id: 'gamepad', icon: Gamepad2 },
    { id: 'ghost', icon: Ghost },
    { id: 'palmtree', icon: Palmtree },
    { id: 'rocket', icon: Rocket },
    { id: 'pizza', icon: Pizza },
    { id: 'cat', icon: Cat },
    { id: 'heart', icon: Heart },
];

const shopAvatarMap = new Map(SHOP_AVATARS.map(item => [item.id, item]));

function RankingAvatarDisplay({ user, className }: { user: User, className?: string }) {
    const { avatar: avatarUrl, name } = user;
    
    if (!avatarUrl || typeof avatarUrl !== 'string') {
        return (
            <Avatar className={className}>
                <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
        );
    }
    
    const parts = avatarUrl.split('_');
    const id = parts[0];
    let letter, color;
    
    if (id === 'letter') {
        letter = parts[1];
        color = parts[2];
    } else {
        color = parts[1];
    }

    const Icon = shopAvatarMap.get(id)?.icon;

    if (Icon || letter) {
        return (
            <div className={cn("relative inline-block", className)}>
                <Avatar className="w-full h-full">
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: color ? `#${color}` : '#737373' }}>
                        {letter ? (
                            <span className="font-bold text-4xl text-white">{letter}</span>
                        ) : Icon ? (
                            <Icon className="h-[60%] w-[60%] text-white" />
                        ) : (
                            <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        )}
                    </div>
                </Avatar>
            </div>
        );
    }
    
    return (
        <div className={cn("relative inline-block", className)}>
            <Avatar className="w-full h-full">
                <AvatarImage src={avatarUrl} alt={name} />
                <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
        </div>
    );
}

export function RankingDialog({ children, user, openTo = "ranking" }: { children: React.ReactNode; user: User, openTo?: "ranking" | "shop" }) {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-md w-[95vw] p-0 flex flex-col h-[80vh]">
                 <div className="absolute inset-0 bg-trophy-pattern opacity-5" style={{ backgroundSize: '100px 100px' }} />
                 <Tabs defaultValue={openTo} className="w-full h-full flex flex-col">
                    <DialogHeader className="p-6 pb-0 flex-shrink-0 z-10 bg-background/80 backdrop-blur-sm rounded-t-lg">
                        <div className="flex items-center gap-3">
                            <DialogTitle className="flex items-center gap-2">
                                <Trophy className="text-yellow-400" />
                                Trofeos y Recompensas
                            </DialogTitle>
                            <Badge variant="secondary">Beta</Badge>
                        </div>
                        <DialogDescription>
                            Consulta tu posición en el ranking y canjea tus trofeos.
                        </DialogDescription>
                         <TabsList className="grid w-full grid-cols-2 mt-4">
                            <TabsTrigger value="ranking">Ranking</TabsTrigger>
                            <TabsTrigger value="shop">Tienda</TabsTrigger>
                        </TabsList>
                    </DialogHeader>
                   
                    <div className="flex-1 overflow-y-auto min-h-0">
                        <TabsContent value="ranking" className="mt-0">
                            <RankingTab user={user} isOpen={isOpen} />
                        </TabsContent>
                        <TabsContent value="shop" className="mt-0">
                           <ShopTab user={user} />
                        </TabsContent>
                    </div>
                </Tabs>
                 <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-20">
                    <Trophy className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </DialogClose>
            </DialogContent>
        </Dialog>
    );
}

type RankingScope = "class" | "center";

function RankingTab({ user, isOpen }: { user: User; isOpen: boolean }) {
    const firestore = useFirestore();
    const [ranking, setRanking] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [scope, setScope] = useState<RankingScope>("class");

    const isPersonalUser = user.center === 'personal';

    const rankingQuery = useMemoFirebase(() => {
        if (!firestore || isPersonalUser || !isOpen) return null;
        if (scope === 'class') {
            return query(
                collection(firestore, "users"),
                where("center", "==", user.center),
                where("course", "==", user.course),
                where("className", "==", user.className),
                orderBy("trophies", "desc"),
                limit(50)
            );
        } else { // scope === 'center'
            return query(
                collection(firestore, "users"),
                where("center", "==", user.center),
                orderBy("trophies", "desc"),
                limit(50)
            );
        }
    }, [firestore, user, scope, isOpen, isPersonalUser]);

    const { data: rankingData, isLoading: isRankingLoading } = useCollection<User>(rankingQuery);

    useEffect(() => {
        setIsLoading(isRankingLoading);
        if (rankingData) {
            const filteredList = rankingData.filter(u => u.role !== 'admin');
            setRanking(filteredList);
        }
    }, [rankingData, isRankingLoading]);
    
    if (isPersonalUser) {
         return (
            <div className="p-6">
                <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg bg-muted/30">
                    <ShieldAlert className="h-12 w-12 text-muted-foreground/70 mb-4" />
                    <p className="font-semibold">Función no disponible</p>
                    <p className="text-sm text-muted-foreground">El ranking es una función exclusiva para usuarios que pertenecen a un centro educativo.</p>
                </div>
            </div>
        );
    }

    const top3 = ranking.slice(0, 3);
    const rest = ranking.slice(3);
    const userRank = ranking.findIndex(u => u.uid === user.uid) + 1;

    return (
        <div className="p-6 pt-4 space-y-6">
            <Select onValueChange={(value: RankingScope) => setScope(value)} value={scope}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Ver ranking de..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="class">
                        <div className="flex items-center gap-2">
                           <GraduationCap className="h-4 w-4" /> Mi Clase
                        </div>
                    </SelectItem>
                     <SelectItem value="center">
                        <div className="flex items-center gap-2">
                           <Users className="h-4 w-4" /> Mi Centro
                        </div>
                    </SelectItem>
                </SelectContent>
            </Select>

            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            ) : ranking.length > 0 ? (
                <div>
                     <div className="relative grid grid-cols-3 gap-2 text-center items-end h-56 mb-8">
                        <PodiumPlace user={top3[1]} place={2} scope={scope} />
                        <PodiumPlace user={top3[0]} place={1} scope={scope} />
                        <PodiumPlace user={top3[2]} place={3} scope={scope} />
                    </div>
                    <div className="space-y-2">
                        {rest.map((rankedUser, index) => (
                            <RankingItem key={rankedUser.uid || index} user={rankedUser} rank={index + 4} isCurrentUser={rankedUser.uid === user.uid} scope={scope} />
                        ))}
                    </div>
                     {userRank > 0 && (
                        <Card className={cn("mt-6 p-3 flex items-center justify-between", scope === 'class' ? "bg-primary/10 border-primary/50" : "bg-blue-500/10 border-blue-500/50")}>
                            <p className={cn("text-sm font-bold", scope === 'class' ? "text-primary" : "text-blue-500")}>Tu posición</p>
                            <div className="flex items-center gap-2">
                               <div className="font-bold text-lg">#{userRank}</div>
                                <div className="flex items-center gap-1 font-bold">
                                    <Trophy className="h-4 w-4 text-yellow-500" />
                                    <span>{user.trophies}</span>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    <p className="font-semibold">Aún no hay ranking</p>
                    <p className="text-sm">Nadie en este grupo tiene trofeos todavía. ¡Sé el primero!</p>
                </div>
            )}
        </div>
    );
}

function ShopTab({ user }: { user: User }) {
    const TROPHIES_PER_EURO = 100;
    const isAdmin = ADMIN_EMAILS.includes(user.email);

    return (
         <div className="p-6 pt-2 space-y-6">
            <Card className="text-center sticky top-0 bg-background/95 backdrop-blur-sm py-4 z-10 shadow-sm">
                 <p className="text-sm text-muted-foreground">Tus trofeos</p>
                 <div className="flex items-center justify-center gap-2">
                     <Trophy className="h-6 w-6 text-yellow-400"/>
                     <p className="text-2xl font-bold">{isAdmin ? '∞' : user.trophies}</p>
                 </div>
            </Card>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {shopItems.map(item => (
                    <ShopItemCard 
                        key={item.id} 
                        item={item} 
                        trophiesPerEuro={TROPHIES_PER_EURO} 
                        userTrophies={user.trophies}
                    />
                 ))}
             </div>
             <p className="text-xs text-muted-foreground text-center pt-2">
                Las recompensas son gestionadas externamente. El equipo se pondrá en contacto contigo tras el canjeo.
             </p>
        </div>
    )
}

function ShopItemCard({ item, trophiesPerEuro, userTrophies }: { item: typeof shopItems[0], trophiesPerEuro: number, userTrophies: number }) {
    const [selectedValue, setSelectedValue] = useState(item.values[0].toString());
    const cost = parseInt(selectedValue) * trophiesPerEuro;
    const canAfford = userTrophies >= cost;

    return (
        <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
            <div className="aspect-video relative flex-shrink-0 bg-gradient-to-br from-muted/30 to-background p-4 flex items-center justify-center shadow-inner rounded-t-lg">
                 <img src={item.imageUrl} alt={item.name} className="max-w-full max-h-24 object-contain" />
            </div>
            <div className="flex-1 p-3 flex flex-col justify-between bg-card">
                <div className="space-y-2">
                    <h4 className="font-bold text-sm truncate">{`Tarjeta ${item.name}`}</h4>
                    <div className="flex items-center gap-2">
                         <Select onValueChange={setSelectedValue} defaultValue={selectedValue}>
                            <SelectTrigger className="flex-1 h-8 text-xs">
                                <SelectValue placeholder="Valor" />
                            </SelectTrigger>
                            <SelectContent>
                                {item.values.map(value => (
                                    <SelectItem key={value} value={value.toString()}>{`${value}€`}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex items-center gap-1 font-bold text-sm text-yellow-500">
                            <Trophy className="h-4 w-4" />
                            <span>{cost}</span>
                        </div>
                    </div>
                </div>
                <Button size="sm" className="w-full mt-3 h-8" disabled>
                    No Disponible
                </Button>
            </div>
        </Card>
    );
}

function PodiumPlace({ user, place, scope }: { user?: User; place: 1 | 2 | 3; scope: RankingScope }) {
    const classStyles = {
        1: { icon: Gem, color: "text-amber-400", ring: "ring-amber-400/50", podiumHeight: "h-32", podiumColor: "bg-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.6)]", avatarSize: "h-16 w-16" },
        2: { icon: Medal, color: "text-slate-400", ring: "ring-slate-400/50", podiumHeight: "h-24", podiumColor: "bg-slate-400/80 shadow-[0_0_15px_rgba(148,163,184,0.5)]", avatarSize: "h-14 w-14" },
        3: { icon: Medal, color: "text-orange-600", ring: "ring-orange-600/50", podiumHeight: "h-20", podiumColor: "bg-orange-600/70 shadow-[0_0_15px_rgba(234,88,12,0.5)]", avatarSize: "h-14 w-14" },
    };

    const centerStyles = {
        1: { icon: Gem, color: "text-blue-400", ring: "ring-blue-400/50", podiumHeight: "h-32", podiumColor: "bg-blue-500/80 shadow-[0_0_15px_rgba(59,130,246,0.6)]", avatarSize: "h-16 w-16" },
        2: { icon: Medal, color: "text-sky-400", ring: "ring-sky-400/50", podiumHeight: "h-24", podiumColor: "bg-sky-500/80 shadow-[0_0_15px_rgba(14,165,233,0.5)]", avatarSize: "h-14 w-14" },
        3: { icon: Medal, color: "text-cyan-400", ring: "ring-cyan-400/50", podiumHeight: "h-20", podiumColor: "bg-cyan-500/70 shadow-[0_0_15px_rgba(6,182,212,0.5)]", avatarSize: "h-14 w-14" },
    };

    const styles = scope === 'class' ? classStyles : centerStyles;
    
    if (!user) return <div className={cn("flex flex-col items-center justify-end w-full", styles[place].podiumHeight)} />;

    const style = styles[place];
    const Icon = style.icon;

    return (
        <div className="flex flex-col items-center justify-end h-full w-full">
             <div className="relative">
                <RankingAvatarDisplay user={user} className={cn(style.avatarSize, "ring-4 ring-offset-2 ring-offset-background dark:ring-offset-slate-900 rounded-full", style.ring)} />
                <div className="absolute -bottom-2 -right-2 rounded-full bg-background/80 p-1.5 shadow-lg">
                     <Icon className={cn("h-5 w-5", style.color)} />
                </div>
            </div>
            <p className="font-bold text-sm truncate w-full mt-2">{user.name.split(' ')[0]}</p>
            <div className="flex items-center gap-1">
                 <Trophy className="h-4 w-4 text-yellow-400" />
                <span className="font-semibold text-sm">{user.trophies}</span>
            </div>
            <div className={cn(
                "w-[90%] rounded-t-md mt-2 transition-all", 
                style.podiumHeight, 
                style.podiumColor
            )}></div>
        </div>
    );
}

function RankingItem({ user, rank, isCurrentUser, scope }: { user: User; rank: number; isCurrentUser: boolean; scope: RankingScope }) {
    const colors = {
        class: "bg-primary/10 border-primary/50",
        center: "bg-blue-500/10 border-blue-500/50"
    };
    
    const hexColors = {
        class: "hsl(var(--primary) / 0.2)",
        center: "hsl(221, 83%, 53%, 0.2)"
    }

    return (
        <div className={cn("flex items-center gap-4 rounded-lg p-2 transition-colors", isCurrentUser ? colors[scope] : "bg-muted/50 border")}>
            <div 
                className="flex items-center justify-center font-bold text-xs"
                style={{
                    width: '32px',
                    height: '32px',
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                    backgroundColor: isCurrentUser ? hexColors[scope] : 'hsl(var(--muted))'
                }}
            >
                {rank}
            </div>
            <RankingAvatarDisplay user={user} className="h-10 w-10" />
            <p className="flex-1 font-medium truncate">{user.name}</p>
            <div className="flex items-center gap-1.5 font-bold">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span>
                    {user.trophies}
                </span>
            </div>
        </div>
    );
}

const shopItems = [
    { id: 'amazon', name: 'Amazon', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', values: [5, 10] },
    { id: 'game', name: 'GAME', imageUrl: 'https://www.cclasrosas.es/wp-content/uploads/2017/12/logo-game.jpg', values: [5, 10] },
    { id: 'shein', name: 'Shein', imageUrl: 'https://e01-elmundo.uecdn.es/assets/multimedia/imagenes/2023/11/28/17011685734882.png', values: [5, 10, 15] },
    { id: 'druni', name: 'Druni', imageUrl: 'https://sevilla.secompraonline.com/wp-content/uploads/sites/5/2023/06/354068035_638603531636870_8081465420058888362_n.png', values: [5, 10, 15] },
    { id: 'inditex', name: 'Inditex', imageUrl: 'https://www.inditex.com/itxcomweb/api/media/bfc0fb15-b15c-47bf-b467-8ec4aea4169f/inditex.png?t=1657543184830', values: [5, 10, 15, 20, 25] },
    { id: 'abacus', name: 'Abacus', imageUrl: 'https://www.baricentro.es/wp-content/uploads/sites/8//Abacus-logo.png', values: [5, 10, 15, 20] },
    { id: 'bureau-vallee', name: 'Bureau Vallée', imageUrl: 'https://www.uvimark.com/wp-content/uploads/2024/10/Logo-bureau-vallee-2021.png', values: [5, 10, 15, 20] },
    { id: 'cinesa', name: 'Cinesa', imageUrl: 'https://www.cclasrosas.es/wp-content/uploads/2017/12/logo-cinesa.jpg', values: [5, 10, 15, 20] },
];

    