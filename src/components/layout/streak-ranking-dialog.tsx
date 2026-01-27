
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
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, limit, where } from "firebase/firestore";
import type { User } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Medal, Gem, Users, GraduationCap, ShieldAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card } from "../ui/card";
import { useMemoFirebase } from "@/firebase/hooks";
import { AvatarDisplay } from "../profile/avatar-creator";

export function StreakRankingDialog({ children, user }: { children: React.ReactNode; user: User }) {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-md w-[95vw] p-0 flex flex-col h-[80vh]">
                 <div className="absolute inset-0 bg-trophy-pattern opacity-5 pointer-events-none" style={{ backgroundSize: '100px 100px' }} />
                 <div className="p-6 pb-4 flex-shrink-0 z-10 bg-background/80 backdrop-blur-sm rounded-t-lg">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <DialogTitle className="flex items-center gap-2">
                                <Flame className="text-orange-500" />
                                Ranking de Rachas
                            </DialogTitle>
                        </div>
                        <DialogDescription>
                            Compara tu racha de estudio con la de tus compañeros.
                        </DialogDescription>
                    </DialogHeader>
                 </div>
                
                <div className="flex-1 overflow-y-auto min-h-0">
                    <RankingTab user={user} isOpen={isOpen} />
                </div>

                 <DialogClose asChild>
                    <button className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-20">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </button>
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
                orderBy("streak", "desc"),
                limit(50)
            );
        } else { // scope === 'center'
            return query(
                collection(firestore, "users"),
                where("center", "==", user.center),
                orderBy("streak", "desc"),
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
                        <PodiumPlace user={top3[1]} place={2} />
                        <PodiumPlace user={top3[0]} place={1} />
                        <PodiumPlace user={top3[2]} place={3} />
                    </div>
                    <div className="space-y-2">
                        {rest.map((rankedUser, index) => (
                            <RankingItem key={rankedUser.uid || index} user={rankedUser} rank={index + 4} isCurrentUser={rankedUser.uid === user.uid} />
                        ))}
                    </div>
                     {userRank > 0 && (
                        <Card className="mt-6 p-3 flex items-center justify-between bg-orange-500/10 border-orange-500/50">
                            <p className="text-sm font-bold text-orange-600">Tu posición</p>
                            <div className="flex items-center gap-2">
                               <div className="font-bold text-lg">#{userRank}</div>
                                <div className="flex items-center gap-1 font-bold">
                                    <Flame className="h-4 w-4 text-orange-500" />
                                    <span>{user.streak || 0}</span>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    <p className="font-semibold">Aún no hay ranking de rachas</p>
                    <p className="text-sm">¡Usa el modo estudio para empezar tu racha!</p>
                </div>
            )}
        </div>
    );
}


function PodiumPlace({ user, place }: { user?: User; place: 1 | 2 | 3 }) {
    const styles = {
        1: { icon: Gem, color: "text-red-500", ring: "ring-red-500/50", podiumHeight: "h-32", podiumColor: "bg-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.6)]", avatarSize: "h-16 w-16" },
        2: { icon: Medal, color: "text-orange-500", ring: "ring-orange-500/50", podiumHeight: "h-24", podiumColor: "bg-orange-500/80 shadow-[0_0_15px_rgba(249,115,22,0.5)]", avatarSize: "h-14 w-14" },
        3: { icon: Medal, color: "text-yellow-500", ring: "ring-yellow-500/50", podiumHeight: "h-20", podiumColor: "bg-yellow-500/70 shadow-[0_0_15px_rgba(234,179,8,0.5)]", avatarSize: "h-14 w-14" },
    };
    
    if (!user) return <div className={cn("flex flex-col items-center justify-end w-full", styles[place].podiumHeight)} />;

    const style = styles[place];
    const Icon = style.icon;

    return (
        <div className="flex flex-col items-center justify-end h-full w-full">
             <div className="relative">
                <AvatarDisplay user={user} className={cn(style.avatarSize, "ring-4 ring-offset-2 ring-offset-background dark:ring-offset-slate-900 rounded-full", style.ring)} />
                <div className="absolute -bottom-2 -right-2 rounded-full bg-background/80 p-1.5 shadow-lg">
                     <Icon className={cn("h-5 w-5", style.color)} />
                </div>
            </div>
            <p className="font-bold text-sm truncate w-full mt-2">{user.name.split(' ')[0]}</p>
            <div className="flex items-center gap-1">
                 <Flame className="h-4 w-4 text-orange-500" />
                <span className="font-semibold text-sm">{user.streak || 0}</span>
            </div>
            <div className={cn(
                "w-[90%] rounded-t-md mt-2 transition-all", 
                style.podiumHeight, 
                style.podiumColor
            )}></div>
        </div>
    );
}

function RankingItem({ user, rank, isCurrentUser }: { user: User; rank: number; isCurrentUser: boolean }) {
    
    return (
        <div className={cn("flex items-center gap-4 rounded-lg p-2 transition-colors", isCurrentUser ? "bg-orange-500/10 border-orange-500/50" : "bg-muted/50 border")}>
            <div 
                className="flex items-center justify-center font-bold text-xs"
                style={{
                    width: '32px',
                    height: '32px',
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                    backgroundColor: isCurrentUser ? 'hsl(24, 95%, 53%, 0.2)' : 'hsl(var(--muted))'
                }}
            >
                {rank}
            </div>
            <AvatarDisplay user={user} className="h-10 w-10" />
            <p className="flex-1 font-medium truncate">{user.name}</p>
            <div className="flex items-center gap-1.5 font-bold">
                <Flame className="h-4 w-4 text-orange-500" />
                <span>
                    {user.streak || 0}
                </span>
            </div>
        </div>
    );
}

    