
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFirestore } from "@/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import type { User } from "@/lib/types";
import { SCHOOL_NAME, SCHOOL_VERIFICATION_CODE } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShieldAlert, Trophy, Gem, Medal, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";

const ADMIN_EMAILS = ['anavarrod@iestorredelpalau.cat', 'lrotav@iestorredelpalau.cat'];

export function RankingDialog({ children, user, openTo = "ranking" }: { children: React.ReactNode; user: User, openTo?: "ranking" | "shop" }) {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-md w-[95vw] p-0">
                 <Tabs defaultValue={openTo} className="w-full">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="flex items-center gap-2">
                            <Trophy className="text-yellow-400" />
                            Trofeos y Recompensas
                        </DialogTitle>
                        <DialogDescription>
                            Consulta tu posición en el ranking y canjea tus trofeos.
                        </DialogDescription>
                         <TabsList className="grid w-full grid-cols-2 mt-4">
                            <TabsTrigger value="ranking">Ranking</TabsTrigger>
                            <TabsTrigger value="shop">Tienda</TabsTrigger>
                        </TabsList>
                    </DialogHeader>
                   
                    <div className="max-h-[60vh] overflow-y-auto">
                        <TabsContent value="ranking">
                            <RankingTab user={user} />
                        </TabsContent>
                        <TabsContent value="shop">
                           <ShopTab user={user} />
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

function RankingTab({ user }: { user: User }) {
    const firestore = useFirestore();
    const [ranking, setRanking] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isInSchoolGroup = user.center === SCHOOL_VERIFICATION_CODE;

    const fetchRanking = async () => {
        setError("Para mantener la equidad en el lanzamiento oficial, el ranking de trofeos está desactivado durante la fase beta. ¡No te preocupes! Los trofeos que consigas se guardarán y todos los beta testers recibiréis una bonificación especial como agradecimiento por vuestra ayuda.");
        return;
    };

    useEffect(() => {
        fetchRanking();
    }, []);

    const top3 = ranking.slice(0, 3);
    const rest = ranking.slice(3);

    return (
        <div className="p-6 pt-2">
            {isLoading && (
                <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            )}
            {error && (
                <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg my-4 bg-yellow-500/5 border-yellow-500/30">
                    <ShieldAlert className="h-12 w-12 text-yellow-500 mb-4" />
                    <p className="font-semibold text-yellow-600 dark:text-yellow-400">Función Desactivada (Beta)</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                </div>
            )}
            {!isLoading && !error && (
                <div>
                    <div className="grid grid-cols-3 gap-2 text-center mb-8 items-end">
                        <PodiumPlace user={top3[1]} place={2} />
                        <PodiumPlace user={top3[0]} place={1} />
                        <PodiumPlace user={top3[2]} place={3} />
                    </div>
                    <div className="space-y-2">
                        {rest.map((rankedUser, index) => (
                            <RankingItem key={rankedUser.uid} user={rankedUser} rank={index + 4} isCurrentUser={rankedUser.uid === user.uid} />
                        ))}
                    </div>
                    {ranking.length === 0 && (
                        <p className="text-muted-foreground text-center p-8">Nadie tiene trofeos todavía. ¡Sé el primero!</p>
                    )}
                </div>
            )}
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

function ShopTab({ user }: { user: User }) {
    const TROPHIES_PER_EURO = 100;
    const isAdmin = ADMIN_EMAILS.includes(user.email);

    return (
         <div className="p-6 pt-2 space-y-6">
            <div className="text-center sticky top-0 bg-background/80 backdrop-blur-sm py-4 z-10">
                 <p className="text-sm text-muted-foreground">Tus trofeos</p>
                 <div className="flex items-center justify-center gap-2">
                     <Trophy className="h-6 w-6 text-yellow-400"/>
                     <p className="text-2xl font-bold">{isAdmin ? '∞' : user.trophies}</p>
                 </div>
                 <Badge variant="secondary" className="mt-2">Tienda Beta</Badge>
            </div>
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


function PodiumPlace({ user, place }: { user?: User; place: 1 | 2 | 3 }) {
    if (!user) return <div />;

    const isAdmin = ADMIN_EMAILS.includes(user.email);
    const placeStyles = {
        1: { icon: Gem, color: "text-amber-400", size: "h-32 w-32", text: "text-4xl", shadow: "shadow-amber-400/50" },
        2: { icon: Medal, color: "text-slate-400", size: "h-24 w-24", text: "text-3xl", shadow: "shadow-slate-400/50" },
        3: { icon: Medal, color: "text-orange-600", size: "h-20 w-20", text: "text-2xl", shadow: "shadow-orange-600/40" },
    };

    const style = placeStyles[place];
    const Icon = style.icon;

    return (
        <div className={cn("flex flex-col items-center gap-1", place === 1 ? "-mt-4" : "")}>
            <div className="relative">
                <Avatar className={cn(style.size, "ring-4 ring-offset-2 ring-offset-background", `ring-${style.color.replace('text-','').replace('-400','')}`)}>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className={cn("absolute -bottom-3 -right-2 rounded-full bg-background p-1 shadow-lg", style.shadow)}>
                     <Icon className={cn("h-6 w-6", style.color)} />
                </div>
            </div>
            <p className="font-bold text-sm truncate w-full">{user.name.split(' ')[0]}</p>
            <div className="flex items-center gap-1">
                 <Trophy className="h-4 w-4 text-yellow-400" />
                <span className="font-bold text-lg">
                    {user.trophies}
                </span>
            </div>
        </div>
    );
}


function RankingItem({ user, rank, isCurrentUser }: { user: User; rank: number; isCurrentUser: boolean }) {
    const isAdmin = ADMIN_EMAILS.includes(user.email);
    return (
        <div className={cn("flex items-center gap-4 rounded-lg p-3", isCurrentUser ? "bg-primary/10 border border-primary/50" : "bg-muted/50")}>
            <div className="text-lg font-bold text-muted-foreground w-6 text-center">{rank}</div>
            <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
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
