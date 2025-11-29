
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
import { useFirestore } from "@/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import type { User } from "@/lib/types";
import { SCHOOL_NAME, SCHOOL_VERIFICATION_CODE } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShieldAlert, Trophy, Gem, Medal } from "lucide-react";
import { cn } from "@/lib/utils";


export function RankingDialog({ children, user }: { children: React.ReactNode; user: User }) {
    const [isOpen, setIsOpen] = useState(false);
    const firestore = useFirestore();
    const [ranking, setRanking] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isInSchoolGroup = user.center === SCHOOL_VERIFICATION_CODE;

    const fetchRanking = async () => {
        // Temporarily disable ranking and show error message
        setError("Debes estar en el grupo del centro para ver el ranking. Añade el código de centro en tu perfil.");
        return;

        /*
        if (!isInSchoolGroup) {
            setError("Debes estar en el grupo del centro para ver el ranking. Añade el código de centro en tu perfil.");
            return;
        }

        if (!firestore) return;
        setIsLoading(true);
        setError(null);
        try {
            const usersRef = collection(firestore, "users");
            const q = query(usersRef, where("center", "==", SCHOOL_VERIFICATION_CODE), orderBy("trophies", "desc"));
            const querySnapshot = await getDocs(q);
            const usersList = querySnapshot.docs.map(doc => doc.data() as User);
            setRanking(usersList);
        } catch (err) {
            console.error(err);
            setError("No se pudo cargar el ranking. Inténtalo de nuevo.");
        } finally {
            setIsLoading(false);
        }
        */
    };

    useEffect(() => {
        if (isOpen) {
            fetchRanking();
        }
    }, [isOpen]);

    const top3 = ranking.slice(0, 3);
    const rest = ranking.slice(3);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-md w-[95vw]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Trophy className="text-yellow-400" />
                        Ranking de Trofeos
                    </DialogTitle>
                    <DialogDescription>
                        Clasificación de {SCHOOL_NAME}
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto pr-4">
                    {isLoading && (
                        <div className="space-y-4">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    )}
                    {error && (
                         <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg my-4 bg-destructive/10 border-destructive/50">
                            <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
                            <p className="font-semibold text-destructive">Acceso Denegado</p>
                            <p className="text-sm text-destructive/80">
                               {error}
                            </p>
                        </div>
                    )}
                    {!isLoading && !error && (
                        <div>
                             {/* Podium */}
                            <div className="grid grid-cols-3 gap-2 text-center mb-8 items-end">
                                <PodiumPlace user={top3[1]} place={2} />
                                <PodiumPlace user={top3[0]} place={1} />
                                <PodiumPlace user={top3[2]} place={3} />
                            </div>

                            {/* Rest of the list */}
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
            </DialogContent>
        </Dialog>
    );
}

function PodiumPlace({ user, place }: { user?: User; place: 1 | 2 | 3 }) {
    if (!user) return <div />;

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
                <span className="font-bold text-lg">{user.trophies}</span>
            </div>
        </div>
    );
}


function RankingItem({ user, rank, isCurrentUser }: { user: User; rank: number; isCurrentUser: boolean }) {
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
                <span>{user.trophies}</span>
            </div>
        </div>
    );
}

