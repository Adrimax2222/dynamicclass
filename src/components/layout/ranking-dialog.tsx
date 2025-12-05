
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
import { ShieldAlert, Trophy, Gem, Medal, Infinity, ShoppingCart, Star, Sparkles, Zap, Atom } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

const ADMIN_EMAILS = ['anavarrod@iestorredelpalau.cat', 'lrotav@iestorredelpalau.cat'];

export function RankingDialog({ children, user }: { children: React.ReactNode; user: User }) {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-md w-[95vw] p-0">
                 <Tabs defaultValue="ranking" className="w-full">
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
    { id: 'cosmic', name: 'Amanecer Cósmico', price: 150, icon: Sparkles, gradient: 'from-purple-500 to-indigo-600' },
    { id: 'neon', name: 'Bosque Neón', price: 200, icon: Star, gradient: 'from-emerald-400 to-teal-600' },
    { id: 'sunset', name: 'Atardecer Vibrante', price: 120, icon: Zap, gradient: 'from-orange-400 to-rose-500' },
    { id: 'atomic', name: 'Energía Atómica', price: 250, icon: Atom, gradient: 'from-sky-400 to-blue-600' },
];

function ShopTab({ user }: { user: User }) {
    return (
         <div className="p-6 pt-2 space-y-6">
            <div className="text-center">
                 <p className="text-sm text-muted-foreground">Tus trofeos</p>
                 <div className="flex items-center justify-center gap-2">
                     <Trophy className="h-6 w-6 text-yellow-400"/>
                     <p className="text-2xl font-bold">{user.trophies}</p>
                 </div>
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {shopItems.map(item => (
                    <div key={item.id} className="relative rounded-lg overflow-hidden border group transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl">
                         <div className={cn("absolute inset-0 bg-gradient-to-br opacity-80", item.gradient)} />
                         <div className="relative p-4 flex flex-col justify-between h-32 text-white">
                             <div>
                                 <item.icon className="h-6 w-6 mb-2 opacity-70"/>
                                 <h4 className="font-bold text-sm">{item.name}</h4>
                             </div>
                             <div className="flex justify-end">
                                 <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm">
                                     <ShoppingCart className="h-4 w-4 mr-2"/>
                                     {item.price}
                                 </Button>
                             </div>
                         </div>
                    </div>
                 ))}
             </div>
             <p className="text-xs text-muted-foreground text-center pt-2">
                Las tarjetas de perfil son un elemento cosmético que estará disponible próximamente.
             </p>
        </div>
    )
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
                    {isAdmin ? <Infinity className="h-5 w-5" /> : user.trophies}
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
                    {isAdmin ? <Infinity className="h-5 w-5" /> : user.trophies}
                </span>
            </div>
        </div>
    );
}
