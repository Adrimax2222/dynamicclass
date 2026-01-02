
"use client";

import { useState, useEffect, useMemo } from "react";
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
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import type { User } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShieldAlert, Trophy, Gem, Medal, ShoppingCart, Users, GraduationCap, PawPrint, Gamepad2, Ghost, Palmtree, Rocket, Pizza, Cat, Heart, CaseUpper, Snowflake, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";

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

function SantaHat() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="512" zoomAndPan="magnify" viewBox="0 0 384 383.999986" height="512" preserveAspectRatio="xMidYMid meet" version="1.0"
            className="absolute -top-[50%] -right-[40%] w-[120%] h-[120%] transform rotate-[15deg] z-10 pointer-events-none"
            style={{ filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.2))' }}
        >
            <defs><clipPath id="13dd563cf7"><path d="M 38.398438 78.617188 L 345.898438 78.617188 L 345.898438 305.117188 L 38.398438 305.117188 Z M 38.398438 78.617188 " clipRule="nonzero"/></clipPath></defs><g clipPath="url(#13dd563cf7)"><path fill="#0b0a06" d="M 268.265625 213.375 C 266.941406 225.953125 264.011719 237.097656 257.148438 246.871094 C 256.15625 248.285156 256.394531 249.511719 257.03125 251.039062 C 261.191406 260.996094 258.742188 269.433594 250.621094 276.238281 C 248.457031 278.058594 247.523438 280.105469 246.800781 282.753906 C 243.289062 295.65625 230.90625 302.707031 217.839844 299.457031 C 209.832031 297.476562 202.992188 293.136719 196.386719 288.4375 C 170.8125 270.207031 145.371094 251.726562 117.445312 237.148438 C 97.113281 226.542969 76.351562 216.746094 55.765625 206.617188 C 47.339844 202.476562 40.339844 197.179688 38.9375 187.027344 C 37.746094 178.402344 40.710938 171.59375 47.726562 166.484375 C 49.3125 165.332031 51.074219 164.789062 51.410156 162.089844 C 53.542969 144.90625 63.96875 137.066406 81.421875 139.371094 C 83.632812 139.664062 85.222656 139.882812 86.753906 137.832031 C 105.222656 113.144531 130.792969 98.4375 158.863281 87.554688 C 180.480469 79.167969 202.933594 75.835938 225.839844 81.273438 C 251.640625 87.410156 270.765625 103.4375 285.996094 124.359375 C 302.113281 146.496094 310.058594 171.714844 312.722656 198.746094 C 313.921875 210.917969 314.535156 223.132812 313.601562 235.316406 C 313.289062 239.410156 314.21875 240.679688 318.171875 241.539062 C 331.152344 244.355469 340.023438 252.273438 344.050781 264.921875 C 349.855469 283.09375 339.109375 299.757812 319.058594 304.238281 C 299.960938 308.5 280.980469 296.765625 277.335938 278.277344 C 275.195312 267.433594 278.566406 258.078125 286.582031 250.75 C 289.683594 247.914062 290.003906 245.5 288.808594 241.949219 C 284.996094 230.660156 279.175781 220.839844 268.265625 213.375 Z M 268.265625 213.375 " fillOpacity="1" fillRule="nonzero"/></g><path fill="#dd3a39" d="M 306.230469 221.925781 C 306.230469 226.808594 305.878906 231.730469 306.328125 236.574219 C 306.808594 241.835938 302.886719 241.53125 299.847656 242.519531 C 296.027344 243.742188 296.003906 240.632812 295.359375 238.421875 C 291.515625 225.203125 283.355469 215.167969 272.203125 207.472656 C 269.726562 205.761719 268.484375 204.046875 268.691406 201.085938 C 268.996094 196.738281 268.117188 192.480469 267.367188 188.230469 C 267.035156 186.351562 266.167969 184.265625 263.902344 184.480469 C 261.273438 184.738281 261.730469 187.214844 261.835938 188.972656 C 262.660156 202.582031 261.835938 216.003906 257.414062 229.03125 C 257.355469 229.207031 257.296875 229.386719 257.238281 229.566406 C 252.414062 243.992188 249.765625 244.910156 236.988281 236.816406 C 235.332031 235.761719 234.949219 234.226562 234.339844 232.6875 C 227.8125 215.960938 210.53125 203.777344 192.378906 203.613281 C 188.152344 203.570312 186.417969 202.09375 184.511719 198.382812 C 177.8125 185.371094 166.523438 179.058594 152.007812 178.875 C 148.085938 178.820312 146.046875 177.746094 144.21875 174.1875 C 138.5 163.011719 129.023438 156.988281 116.445312 157.335938 C 110.464844 157.503906 106.15625 156.453125 102.664062 151.3125 C 100.835938 148.625 97.8125 146.585938 94.996094 144.769531 C 92.28125 143.015625 92.570312 141.816406 94.449219 139.601562 C 108.996094 122.488281 127.230469 110.398438 147.371094 101.019531 C 163.464844 93.523438 180.0625 87.882812 198.121094 86.8125 C 223.078125 85.324219 244.304688 93.402344 262.625 109.867188 C 289.113281 133.65625 300.703125 164.558594 304.976562 198.90625 C 305.890625 206.554688 306.308594 214.226562 306.230469 221.925781 Z M 306.230469 221.925781 " fillOpacity="1" fillRule="nonzero"/><path fill="#fdfdfd" d="M 76.617188 146.214844 C 87.007812 146.742188 96.1875 151.085938 102.019531 161.019531 C 104.050781 164.488281 106.1875 165.375 110.242188 164.527344 C 123.996094 161.640625 135.691406 168.316406 139.957031 181.378906 C 141.242188 185.34375 142.914062 186.648438 147.214844 186.101562 C 163.179688 184.089844 175.175781 191.535156 180.492188 206.527344 C 181.816406 210.246094 184.1875 210.492188 187.515625 210.28125 C 201.199219 209.472656 212.402344 214.832031 221.722656 224.554688 C 225.320312 228.304688 227.945312 232.65625 228.644531 237.824219 C 229.132812 241.457031 230.910156 243.078125 234.40625 243.441406 C 238.050781 243.808594 241.273438 245.367188 244.273438 247.363281 C 254.183594 253.972656 254.367188 265.246094 244.425781 271.816406 C 241.488281 273.753906 240.140625 275.507812 239.894531 279.25 C 239.230469 289.164062 227.644531 295.367188 217.105469 291.777344 C 208.992188 289.007812 202.289062 283.75 195.429688 278.824219 C 170.238281 260.730469 144.921875 242.808594 117.171875 228.734375 C 99.082031 219.5625 80.667969 211.046875 62.445312 202.125 C 58.914062 200.398438 55.324219 198.597656 52.230469 196.226562 C 42.703125 188.921875 43.710938 176.28125 54.382812 170.941406 C 57.601562 169.332031 58.058594 167.558594 57.949219 164.425781 C 57.578125 153.65625 64.867188 146.351562 76.617188 146.214844 Z M 76.617188 146.214844 " fillOpacity="1" fillRule="nonzero"/><path fill="#fdfdfd" d="M 311.578125 297.285156 C 294.417969 297.203125 282.597656 285.136719 284.8125 269.171875 C 285.570312 263.695312 286.085938 256.851562 294.296875 256.238281 C 294.726562 256.203125 295.324219 255.628906 295.484375 255.183594 C 298.246094 247.449219 305.054688 247.503906 311.257812 247.6875 C 328.875 248.199219 342.007812 265.691406 336.679688 280.996094 C 333.140625 291.160156 323.621094 297.335938 311.578125 297.285156 Z M 311.578125 297.285156 " fillOpacity="1" fillRule="nonzero"/></svg>
    )
}

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
                <SantaHat />
            </div>
        );
    }
    
    return (
        <div className={cn("relative inline-block", className)}>
            <Avatar className="w-full h-full">
                <AvatarImage src={avatarUrl} alt={name} />
                <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <SantaHat />
        </div>
    );
}

export function RankingDialog({ children, user, openTo = "ranking" }: { children: React.ReactNode; user: User, openTo?: "ranking" | "shop" }) {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-md w-[95vw] p-0 flex flex-col h-[80vh] bg-card/90 backdrop-blur-xl">
                <div className="absolute inset-0 bg-repeat bg-center opacity-[0.02]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 100 100\'%3E%3Cpath d=\'M27.5 55.5C27.5 53.0147 25.4853 51 23 51C20.5147 51 18.5 53.0147 18.5 55.5V70.5C18.5 72.9853 20.5147 75 23 75C25.4853 75 27.5 72.9853 27.5 70.5V55.5ZM72.5 55.5C72.5 53.0147 70.4853 51 68 51C65.5147 51 63.5 53.0147 63.5 55.5V70.5C63.5 72.9853 65.5147 75 68 75C70.4853 75 72.5 72.9853 72.5 70.5V55.5ZM45.5 25C56.8284 25 66 34.1716 66 45.5C66 56.8284 56.8284 66 45.5 66C34.1716 66 25 56.8284 25 45.5C25 34.1716 34.1716 25 45.5 25ZM45.5 30C54.0604 30 61 36.9396 61 45.5C61 54.0604 54.0604 61 45.5 61C36.9396 61 30 54.0604 30 45.5C30 36.9396 36.9396 30 45.5 30Z\' fill=\'%23a0aec0\'/%3E%3C/svg%3E")' }}></div>
                 <Tabs defaultValue={openTo} className="w-full h-full flex flex-col z-10">
                    <DialogHeader className="p-6 pb-0 flex-shrink-0">
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

    useEffect(() => {
        if (!isOpen || !firestore || isPersonalUser) {
            if (isPersonalUser) setIsLoading(false);
            return;
        }

        const fetchRanking = async () => {
            setIsLoading(true);
            
            let usersQuery;
            if (scope === 'class') {
                usersQuery = query(
                    collection(firestore, "users"),
                    where("center", "==", user.center),
                    where("course", "==", user.course),
                    where("className", "==", user.className),
                    orderBy("trophies", "desc"),
                    limit(50)
                );
            } else { // scope === 'center'
                usersQuery = query(
                    collection(firestore, "users"),
                    where("center", "==", user.center),
                    orderBy("trophies", "desc"),
                    limit(50)
                );
            }

            try {
                const querySnapshot = await getDocs(usersQuery);
                const usersList = querySnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as User));
                const filteredList = usersList.filter(u => u.role !== 'admin');
                setRanking(filteredList);
            } catch (error) {
                console.error("Error fetching ranking:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRanking();
    }, [firestore, user, scope, isOpen, isPersonalUser]);
    
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
                     <div className="relative grid grid-cols-3 gap-2 text-center items-end h-40 mb-8">
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
        1: { icon: Gem, color: "text-amber-400", size: "h-14 w-14", ring: "ring-amber-400/50", podiumHeight: "h-24", podiumColor: "bg-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.6)]" },
        2: { icon: Medal, color: "text-slate-400", size: "h-12 w-12", ring: "ring-slate-400/50", podiumHeight: "h-16", podiumColor: "bg-slate-400/80 shadow-[0_0_15px_rgba(148,163,184,0.5)]" },
        3: { icon: Medal, color: "text-orange-600", size: "h-12 w-12", ring: "ring-orange-600/50", podiumHeight: "h-12", podiumColor: "bg-orange-600/70 shadow-[0_0_15px_rgba(234,88,12,0.5)]" },
    };

    const centerStyles = {
        1: { icon: Gem, color: "text-blue-400", size: "h-14 w-14", ring: "ring-blue-400/50", podiumHeight: "h-24", podiumColor: "bg-blue-500/80 shadow-[0_0_15px_rgba(59,130,246,0.6)]" },
        2: { icon: Medal, color: "text-sky-400", size: "h-12 w-12", ring: "ring-sky-400/50", podiumHeight: "h-16", podiumColor: "bg-sky-500/80 shadow-[0_0_15px_rgba(14,165,233,0.5)]" },
        3: { icon: Medal, color: "text-cyan-400", size: "h-12 w-12", ring: "ring-cyan-400/50", podiumHeight: "h-12", podiumColor: "bg-cyan-500/70 shadow-[0_0_15px_rgba(6,182,212,0.5)]" },
    };

    const styles = scope === 'class' ? classStyles : centerStyles;
    
    if (!user) return <div className={cn("flex flex-col items-center justify-end w-full", styles[place].podiumHeight)} />;

    const style = styles[place];
    const Icon = style.icon;

    return (
        <div className="flex flex-col items-center justify-end h-full w-full">
             <div className="relative">
                <RankingAvatarDisplay user={user} className={cn(style.size, "ring-4 ring-offset-2 ring-offset-background dark:ring-offset-slate-900", style.ring)} />
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

    return (
        <div className={cn("flex items-center gap-4 rounded-lg p-2 transition-colors", isCurrentUser ? colors[scope] : "bg-muted/50 border")}>
            <div 
                className="flex items-center justify-center font-bold text-xs"
                style={{
                    width: '32px',
                    height: '32px',
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                    backgroundColor: isCurrentUser ? (scope === 'class' ? 'hsl(var(--primary) / 0.2)' : 'hsl(221, 83%, 53%, 0.2)') : 'hsl(var(--muted))'
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
