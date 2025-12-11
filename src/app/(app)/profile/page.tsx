
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SummaryCardData, User, CompletedItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Edit, Settings, Loader2, Trophy, NotebookText, FileCheck2, Medal, Flame, Clock, PawPrint, Rocket, Pizza, Gamepad2, Ghost, Palmtree, CheckCircle, LineChart, CaseUpper, Cat, Heart, History, Calendar, Snowflake } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/lib/hooks/use-app";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useMemo } from "react";
import { doc, updateDoc, arrayUnion, increment, collection, query, orderBy } from "firebase/firestore";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription as AlertDialogDescriptionComponent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { SCHOOL_NAME, SCHOOL_VERIFICATION_CODE } from "@/lib/constants";
import { RankingDialog } from "@/components/layout/ranking-dialog";
import { GradeCalculatorDialog } from "@/components/layout/grade-calculator-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const ADMIN_EMAILS = ['anavarrod@iestorredelpalau.cat', 'lrotav@iestorredelpalau.cat'];

export default function ProfilePage() {
  const { user } = useApp();

  if (!user) {
    return (
        <div className="container mx-auto max-w-4xl p-4 sm:p-6 space-y-8">
            <Skeleton className="h-8 w-1/2" />
            <Card className="mb-8 overflow-hidden shadow-lg">
                <Skeleton className="h-24 w-full" />
                <CardContent className="p-4 text-center -mt-16">
                    <Skeleton className="mx-auto h-24 w-24 rounded-full" />
                    <Skeleton className="mt-4 h-8 w-1/3 mx-auto" />
                    <Skeleton className="mt-2 h-4 w-1/2 mx-auto" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full col-span-2" />
                </CardContent>
            </Card>
        </div>
    );
  }

  const courseMap: Record<string, string> = {
    "1eso": "1º ESO",
    "2eso": "2º ESO",
    "3eso": "3º ESO",
    "4eso": "4º ESO",
    "1bach": "1º Bachillerato",
    "2bach": "2º Bachillerato",
  }
  
  const displayCenter = user.center === SCHOOL_VERIFICATION_CODE ? SCHOOL_NAME : user.center;

  const achievements = [
    { title: 'Tareas Completadas', value: user.tasks, icon: NotebookText, color: 'text-blue-400' },
    { title: 'Exámenes Superados', value: user.exams, icon: FileCheck2, color: 'text-green-400' },
  ];

  const isScheduleAvailable = user?.course === "4eso" && user?.className === "B";
  const streakCount = user.streak || 0;
  
  const formatStudyTime = (totalMinutes: number = 0) => {
    if (totalMinutes < 1) return "0m";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };


  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold font-headline tracking-tighter sm:text-3xl flex items-center gap-2">
          Mi Perfil
          <Snowflake className="h-6 w-6 text-primary" />
        </h1>
        <div className="flex items-center gap-2">
             <Link href="/study" className={cn("flex items-center gap-1 cursor-pointer hover:bg-muted p-1 rounded-full transition-colors", streakCount > 0 ? "bg-orange-100/50 dark:bg-orange-900/20" : "")}>
                <Flame className={cn("h-5 w-5", streakCount > 0 ? "text-orange-500" : "text-muted-foreground")} />
                <span className="font-bold text-sm">{streakCount}</span>
            </Link>
            <RankingDialog user={user}>
               <div className="flex items-center gap-1 cursor-pointer hover:bg-muted p-1 rounded-full transition-colors">
                   <Trophy className="h-5 w-5 text-yellow-400" />
                   <span className="font-bold text-sm">
                       {user.trophies}
                   </span>
               </div>
            </RankingDialog>
            <Button variant="ghost" size="icon" asChild>
                <Link href="/settings" aria-label="Ajustes">
                    <Settings />
                </Link>
            </Button>
        </div>
      </header>

      <Card className="mb-8 overflow-hidden shadow-lg">
        <div className="bg-muted/40 h-24" />
        <CardContent className="p-4 text-center -mt-16">
          <AvatarDisplay user={user} />
          <h2 className="mt-4 text-2xl font-bold">{user.name}</h2>
          {user.role === 'admin' && (
            <Badge variant="destructive" className="mt-2">Admin</Badge>
          )}
          <p className="text-muted-foreground mt-2">{displayCenter}</p>
          <EditProfileDialog />
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardHeader>
            <CardTitle className="text-base">Detalles</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
             <div>
                <p className="text-muted-foreground">Rol</p>
                <p className="font-bold">{user.role === 'student' ? 'Estudiante' : user.role === 'admin' ? 'Administrador' : 'Profesor'}</p>
            </div>
            <div>
                <p className="text-muted-foreground">Edad</p>
                <p className="font-bold">{user.ageRange}</p>
            </div>
            <div>
                <p className="text-muted-foreground">Curso</p>
                <p className="font-bold">{courseMap[user.course] || user.course}</p>
            </div>
            <div>
                <p className="text-muted-foreground">Clase</p>
                <p className="font-bold">{user.className}</p>
            </div>
            <div className="col-span-2">
                <p className="text-muted-foreground">Correo Electrónico</p>
                <p className="font-bold break-words">{user.email}</p>
            </div>
        </CardContent>
      </Card>
      
      <section>
        <h3 className="text-xl font-semibold font-headline mb-4">Logros</h3>
        <div className="grid grid-cols-2 gap-4">
            <RankingDialog user={user}>
              <Card className="hover:border-primary/50 transition-colors duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-lg cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Trofeos Ganados</CardTitle>
                  <Trophy className={cn("h-5 w-5 text-muted-foreground", "text-yellow-400")} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {user.trophies}
                  </div>
                </CardContent>
              </Card>
            </RankingDialog>
            
            <GradeCalculatorDialog isScheduleAvailable={isScheduleAvailable} user={user} openTo="report">
                <Card className="hover:border-primary/50 transition-colors duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-lg cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mi Evaluación</CardTitle>
                        <LineChart className="h-5 w-5 text-muted-foreground text-purple-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                           Ver Informe <span aria-hidden="true">→</span>
                        </div>
                    </CardContent>
                </Card>
            </GradeCalculatorDialog>
            
            <Link href="/study" className="cursor-pointer">
              <AchievementCard 
                  title="Tiempo de Estudio"
                  value={formatStudyTime(user.studyMinutes)}
                  icon={Clock}
                  color="text-teal-400"
              />
            </Link>

            <Link href="/study" className="cursor-pointer">
                <AchievementCard 
                    title="Racha de Estudio"
                    value={streakCount}
                    icon={Flame}
                    color={streakCount > 0 ? "text-orange-500" : "text-muted-foreground"}
                />
            </Link>

            {achievements.map(card => (
              <HistoryDialog key={card.title} user={user} card={card} />
            ))}
        </div>
      </section>
    </div>
  );
}

const SHOP_AVATARS = [
    { id: 'paw', icon: PawPrint, price: 5 },
    { id: 'gamepad', icon: Gamepad2, price: 12 },
    { id: 'ghost', icon: Ghost, price: 8 },
    { id: 'palmtree', icon: Palmtree, price: 0 },
    { id: 'rocket', icon: Rocket, price: 10 },
    { id: 'pizza', icon: Pizza, price: 15 },
    { id: 'cat', icon: Cat, price: 7 },
    { id: 'heart', icon: Heart, price: 9 },
];

const shopAvatarMap = new Map(SHOP_AVATARS.map(item => [item.id, item]));

const AVATAR_COLORS = [
    { name: 'Gris', value: '737373' },
    { name: 'Rojo', value: 'F87171' },
    { name: 'Verde', value: '34D399' },
    { name: 'Azul', value: '60A5FA' },
    { name: 'Rosa', value: 'F472B6' },
    { name: 'Morado', value: 'A78BFA' },
    { name: 'Amarillo', value: 'FBBF24' },
    { name: 'Naranja', value: 'F97316' },
    { name: 'Cian', value: '2DD4BF' },
];

function SantaHat() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="512" zoomAndPan="magnify" viewBox="0 0 384 383.999986" height="512" preserveAspectRatio="xMidYMid meet" version="1.0"
            className="absolute -top-[50px] -right-[40px] w-[120px] h-[120px] transform rotate-[15deg] z-10 pointer-events-none"
            style={{ filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.2))' }}
        >
            <defs><clipPath id="13dd563cf7"><path d="M 38.398438 78.617188 L 345.898438 78.617188 L 345.898438 305.117188 L 38.398438 305.117188 Z M 38.398438 78.617188 " clipRule="nonzero"/></clipPath></defs><g clipPath="url(#13dd563cf7)"><path fill="#0b0a06" d="M 268.265625 213.375 C 266.941406 225.953125 264.011719 237.097656 257.148438 246.871094 C 256.15625 248.285156 256.394531 249.511719 257.03125 251.039062 C 261.191406 260.996094 258.742188 269.433594 250.621094 276.238281 C 248.457031 278.058594 247.523438 280.105469 246.800781 282.753906 C 243.289062 295.65625 230.90625 302.707031 217.839844 299.457031 C 209.832031 297.476562 202.992188 293.136719 196.386719 288.4375 C 170.8125 270.207031 145.371094 251.726562 117.445312 237.148438 C 97.113281 226.542969 76.351562 216.746094 55.765625 206.617188 C 47.339844 202.476562 40.339844 197.179688 38.9375 187.027344 C 37.746094 178.402344 40.710938 171.59375 47.726562 166.484375 C 49.3125 165.332031 51.074219 164.789062 51.410156 162.089844 C 53.542969 144.90625 63.96875 137.066406 81.421875 139.371094 C 83.632812 139.664062 85.222656 139.882812 86.753906 137.832031 C 105.222656 113.144531 130.792969 98.4375 158.863281 87.554688 C 180.480469 79.167969 202.933594 75.835938 225.839844 81.273438 C 251.640625 87.410156 270.765625 103.4375 285.996094 124.359375 C 302.113281 146.496094 310.058594 171.714844 312.722656 198.746094 C 313.921875 210.917969 314.535156 223.132812 313.601562 235.316406 C 313.289062 239.410156 314.21875 240.679688 318.171875 241.539062 C 331.152344 244.355469 340.023438 252.273438 344.050781 264.921875 C 349.855469 283.09375 339.109375 299.757812 319.058594 304.238281 C 299.960938 308.5 280.980469 296.765625 277.335938 278.277344 C 275.195312 267.433594 278.566406 258.078125 286.582031 250.75 C 289.683594 247.914062 290.003906 245.5 288.808594 241.949219 C 284.996094 230.660156 279.175781 220.839844 268.265625 213.375 Z M 268.265625 213.375 " fillOpacity="1" fillRule="nonzero"/></g><path fill="#dd3a39" d="M 306.230469 221.925781 C 306.230469 226.808594 305.878906 231.730469 306.328125 236.574219 C 306.808594 241.835938 302.886719 241.53125 299.847656 242.519531 C 296.027344 243.742188 296.003906 240.632812 295.359375 238.421875 C 291.515625 225.203125 283.355469 215.167969 272.203125 207.472656 C 269.726562 205.761719 268.484375 204.046875 268.691406 201.085938 C 268.996094 196.738281 268.117188 192.480469 267.367188 188.230469 C 267.035156 186.351562 266.167969 184.265625 263.902344 184.480469 C 261.273438 184.738281 261.730469 187.214844 261.835938 188.972656 C 262.660156 202.582031 261.835938 216.003906 257.414062 229.03125 C 257.355469 229.207031 257.296875 229.386719 257.238281 229.566406 C 252.414062 243.992188 249.765625 244.910156 236.988281 236.816406 C 235.332031 235.761719 234.949219 234.226562 234.339844 232.6875 C 227.8125 215.960938 210.53125 203.777344 192.378906 203.613281 C 188.152344 203.570312 186.417969 202.09375 184.511719 198.382812 C 177.8125 185.371094 166.523438 179.058594 152.007812 178.875 C 148.085938 178.820312 146.046875 177.746094 144.21875 174.1875 C 138.5 163.011719 129.023438 156.988281 116.445312 157.335938 C 110.464844 157.503906 106.15625 156.453125 102.664062 151.3125 C 100.835938 148.625 97.8125 146.585938 94.996094 144.769531 C 92.28125 143.015625 92.570312 141.816406 94.449219 139.601562 C 108.996094 122.488281 127.230469 110.398438 147.371094 101.019531 C 163.464844 93.523438 180.0625 87.882812 198.121094 86.8125 C 223.078125 85.324219 244.304688 93.402344 262.625 109.867188 C 289.113281 133.65625 300.703125 164.558594 304.976562 198.90625 C 305.890625 206.554688 306.308594 214.226562 306.230469 221.925781 Z M 306.230469 221.925781 " fillOpacity="1" fillRule="nonzero"/><path fill="#fdfdfd" d="M 76.617188 146.214844 C 87.007812 146.742188 96.1875 151.085938 102.019531 161.019531 C 104.050781 164.488281 106.1875 165.375 110.242188 164.527344 C 123.996094 161.640625 135.691406 168.316406 139.957031 181.378906 C 141.242188 185.34375 142.914062 186.648438 147.214844 186.101562 C 163.179688 184.089844 175.175781 191.535156 180.492188 206.527344 C 181.816406 210.246094 184.1875 210.492188 187.515625 210.28125 C 201.199219 209.472656 212.402344 214.832031 221.722656 224.554688 C 225.320312 228.304688 227.945312 232.65625 228.644531 237.824219 C 229.132812 241.457031 230.910156 243.078125 234.40625 243.441406 C 238.050781 243.808594 241.273438 245.367188 244.273438 247.363281 C 254.183594 253.972656 254.367188 265.246094 244.425781 271.816406 C 241.488281 273.753906 240.140625 275.507812 239.894531 279.25 C 239.230469 289.164062 227.644531 295.367188 217.105469 291.777344 C 208.992188 289.007812 202.289062 283.75 195.429688 278.824219 C 170.238281 260.730469 144.921875 242.808594 117.171875 228.734375 C 99.082031 219.5625 80.667969 211.046875 62.445312 202.125 C 58.914062 200.398438 55.324219 198.597656 52.230469 196.226562 C 42.703125 188.921875 43.710938 176.28125 54.382812 170.941406 C 57.601562 169.332031 58.058594 167.558594 57.949219 164.425781 C 57.578125 153.65625 64.867188 146.351562 76.617188 146.214844 Z M 76.617188 146.214844 " fillOpacity="1" fillRule="nonzero"/><path fill="#fdfdfd" d="M 311.578125 297.285156 C 294.417969 297.203125 282.597656 285.136719 284.8125 269.171875 C 285.570312 263.695312 286.085938 256.851562 294.296875 256.238281 C 294.726562 256.203125 295.324219 255.628906 295.484375 255.183594 C 298.246094 247.449219 305.054688 247.503906 311.257812 247.6875 C 328.875 248.199219 342.007812 265.691406 336.679688 280.996094 C 333.140625 291.160156 323.621094 297.335938 311.578125 297.285156 Z M 311.578125 297.285156 " fillOpacity="1" fillRule="nonzero"/></svg>
    )
}

function AvatarDisplay({ user }: { user: User }) {
    const { avatar: avatarUrl, name } = user;
    
    if (!avatarUrl || typeof avatarUrl !== 'string') {
        return (
             <div className="relative inline-block">
                <Avatar className="mx-auto h-24 w-24 ring-4 ring-background">
                    <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <SantaHat />
             </div>
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
            <div className="relative inline-block">
                <Avatar className="mx-auto h-24 w-24 ring-4 ring-background">
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: color ? `#${color}` : '#737373' }}>
                        {letter ? (
                            <span className="font-bold text-4xl text-white">{letter}</span>
                        ) : Icon ? (
                            <Icon className="h-12 w-12 text-white" />
                        ) : (
                            <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        )}
                    </div>
                </Avatar>
                <SantaHat />
            </div>
        );
    }
    
    // Fallback for original URL-based avatars from Google Sign In
    return (
        <div className="relative inline-block">
            <Avatar className="mx-auto h-24 w-24 ring-4 ring-background">
                <AvatarImage src={avatarUrl} alt={name} />
                <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <SantaHat />
        </div>
    );
}

interface EditableAvatar {
    id: string;
    color: string;
}

function AvatarDisplayPreview({ avatar }: { avatar: EditableAvatar }) {
    const isLetter = avatar.id.startsWith('letter');
    const Icon = !isLetter ? shopAvatarMap.get(avatar.id)?.icon : null;
    const letter = isLetter ? avatar.id.split('_')[1] : null;

    return (
        <div className="relative inline-block">
            <Avatar className="h-24 w-24 ring-4 ring-primary ring-offset-2">
                <div 
                  className="w-full h-full flex items-center justify-center" 
                  style={{ backgroundColor: `#${avatar.color}` }}
                >
                   {letter ? (
                        <span className="font-bold text-4xl text-white">{letter}</span>
                    ) : Icon ? (
                        <Icon className="h-12 w-12 text-white" />
                    ) : (
                       <AvatarFallback>?</AvatarFallback>
                    )}
                </div>
            </Avatar>
            <SantaHat />
        </div>
    );
}


function EditProfileDialog() {
  const { user, updateUser } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [editableAvatar, setEditableAvatar] = useState<EditableAvatar>({ id: 'letter_A', color: 'A78BFA'});
  
  const [name, setName] = useState(user?.name || "");
  const [center, setCenter] = useState(user?.center || "");
  const [ageRange, setAgeRange] = useState(user?.ageRange || "");
  const [course, setCourse] = useState(user?.course || "");
  const [className, setClassName] = useState(user?.className || "");
  
  const firestore = useFirestore();
  const { toast } = useToast();

  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

  const initializeState = () => {
    if (user) {
        setName(user.name);
        setCenter(user.center);
        setAgeRange(user.ageRange);
        setCourse(user.course);
        setClassName(user.className);
        
        const [id, id_extra, color] = user.avatar.split('_');
        
        if (id === 'letter') {
             setEditableAvatar({ id: `letter_${id_extra}`, color: color || '737373' });
        } else if (shopAvatarMap.has(id)) {
             setEditableAvatar({ id: id, color: id_extra || '737373' });
        } else {
             // Fallback for old URL-based avatars
             const initial = user.name.charAt(0).toUpperCase() || 'A';
             setEditableAvatar({ id: `letter_${initial}`, color: 'A78BFA' });
        }
    }
  };
  
  useEffect(() => {
    if (isOpen) {
        initializeState();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isOpen]);
  
  const handleLetterSelect = (letter: string) => {
    setEditableAvatar(prev => ({ ...prev, id: `letter_${letter}` }));
  };
  
  const handleColorClick = (color: string) => {
    setEditableAvatar(prev => ({ ...prev, color: color }));
  };

  const handleSelectShopAvatar = (avatarId: string) => {
     setEditableAvatar(prev => ({ ...prev, id: avatarId }));
  };

  const handlePurchaseAvatar = async (avatar: typeof SHOP_AVATARS[0]) => {
     if (!firestore || !user || user.trophies < avatar.price) {
        toast({ title: "Fondos insuficientes", description: "No tienes suficientes trofeos para comprar este avatar.", variant: "destructive"});
        return;
     }
     
     setIsLoading(true);
     try {
        const userDocRef = doc(firestore, 'users', user.uid);
        
        await updateDoc(userDocRef, {
            trophies: increment(-avatar.price),
            ownedAvatars: arrayUnion(avatar.id),
        });

        const updatedLocalAvatars = [...(user.ownedAvatars || []), avatar.id];
        updateUser({ 
            trophies: user.trophies - avatar.price, 
            ownedAvatars: updatedLocalAvatars 
        });

        toast({ title: "¡Compra realizada!", description: `Has adquirido el avatar de ${avatar.id}.`});
     } catch (error) {
        console.error("Error purchasing avatar:", error);
        toast({ title: "Error", description: "No se pudo completar la compra.", variant: "destructive"});
     } finally {
        setIsLoading(false);
     }
  }
  
  if (!user) return null;
  
  const handleSaveChanges = async () => {
    if (!firestore || !user) return;
    
    const finalAvatarString = editableAvatar.id.startsWith('letter') 
        ? `${editableAvatar.id}_${editableAvatar.color}`
        : `${editableAvatar.id}_${editableAvatar.color}`;

    setIsLoading(true);

    try {
        const updatedData: Partial<User> = {
            name,
            center,
            ageRange,
            course,
            className,
            avatar: finalAvatarString,
        };

        const userDocRef = doc(firestore, 'users', user.uid);
        await updateDoc(userDocRef, updatedData);
      
        updateUser(updatedData);

        toast({
            title: "¡Perfil actualizado!",
            description: "Tu información ha sido guardada correctamente.",
        });
        setIsOpen(false); 
    } catch (error) {
        console.error("Error updating profile:", error);
        toast({
            title: "Error",
            description: "No se pudo actualizar tu perfil. Inténtalo de nuevo.",
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  };
  
  const isLetterSelectorDisabled = useMemo(() => {
    return editableAvatar.id.startsWith('letter') ? false : true;
  }, [editableAvatar.id]);
  
  const isSaveDisabled = useMemo(() => {
    if (isLoading) return true;
    
    const selectedId = editableAvatar.id.startsWith('letter') ? editableAvatar.id.split('_')[0] : editableAvatar.id;
    const shopItem = shopAvatarMap.get(selectedId);
    
    // This is for the special letter avatar
    if (editableAvatar.id.startsWith('letter_')) {
        return false;
    }
    
    if (shopItem) {
        const isOwned = user.ownedAvatars?.includes(shopItem.id);
        
        if (shopItem.price > 0 && !isOwned) {
            return true;
        }
    }

    return false;
  }, [editableAvatar.id, user.ownedAvatars, isLoading]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mt-4">
          <Edit className="h-4 w-4 mr-2" />
          Editar Perfil
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-[95vw]">
        <DialogHeader>
          <DialogTitle>Editor</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto px-1 pr-4">
            
            <div className="flex justify-center py-4">
               <AvatarDisplayPreview avatar={editableAvatar} />
            </div>

            <div className="space-y-4 pt-4 border-t">
                <Label>Avatar</Label>
                 <div className="grid grid-cols-4 gap-4">
                    {SHOP_AVATARS.map((avatar) => {
                        const isOwned = user.ownedAvatars?.includes(avatar.id);
                        const isSelected = editableAvatar.id === avatar.id;
                        const Icon = avatar.icon;
                        const isFree = avatar.price === 0;

                        return (
                            <div key={avatar.id} className="relative group flex flex-col items-center gap-2">
                                <button 
                                    type="button" 
                                    onClick={() => handleSelectShopAvatar(avatar.id)}
                                    className={cn("w-full aspect-square rounded-lg flex items-center justify-center bg-muted transition-all transform hover:scale-105", isSelected && "ring-4 ring-primary ring-offset-2")}
                                >
                                   <div className="w-full h-full flex items-center justify-center">
                                        <Icon className="h-8 w-8 text-muted-foreground" />
                                   </div>
                                </button>
                                <div className="text-center">
                                    {isOwned || isFree ? (
                                        <Badge variant="secondary" className="flex items-center gap-1">
                                            {isFree && !isOwned ? (
                                                'Gratis'
                                            ) : (
                                                <><CheckCircle className="h-3 w-3 text-green-500" /> Adquirido</>
                                            )}
                                        </Badge>
                                    ) : (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="sm" variant="outline" className="h-8 w-full" disabled={isLoading}>
                                                    <Trophy className="h-4 w-4 mr-1 text-yellow-400" />
                                                    {avatar.price}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Confirmar Compra</AlertDialogTitle>
                                                    <AlertDialogDescriptionComponent>
                                                        ¿Quieres comprar este avatar por {avatar.price} trofeos? Tus trofeos actuales son {user.trophies}.
                                                    </AlertDialogDescriptionComponent>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handlePurchaseAvatar(avatar)}>Comprar</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                     <div className="relative group flex flex-col items-center gap-2">
                        <div
                            className={cn(
                                "w-full aspect-square rounded-lg flex flex-col items-center justify-center bg-muted transition-all",
                                editableAvatar.id.startsWith('letter') && "ring-4 ring-primary ring-offset-2"
                            )}
                        >
                            <CaseUpper className="h-8 w-8 text-muted-foreground mb-2" />
                            <Select
                                onValueChange={handleLetterSelect}
                                value={editableAvatar.id.startsWith('letter') ? editableAvatar.id.split('_')[1] : ''}
                                onOpenChange={(isOpen) => {
                                  if (isOpen) {
                                    const currentLetter = editableAvatar.id.startsWith('letter') ? editableAvatar.id.split('_')[1] : 'A';
                                    setEditableAvatar(prev => ({...prev, id: `letter_${currentLetter}`}))
                                  }
                                }}
                            >
                                <SelectTrigger className="w-20 h-8 text-xs">
                                    <SelectValue placeholder="Letra" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ALPHABET.map(letter => (
                                        <SelectItem key={letter} value={letter}>{letter}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                     </div>
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
                <Label>Color de Fondo</Label>
                <div className="flex flex-wrap gap-3">
                    {AVATAR_COLORS.map(color => (
                        <button
                            key={color.value}
                            type="button"
                            onClick={() => handleColorClick(color.value)}
                            className={cn(
                                "h-8 w-8 rounded-full border-2 transition-transform hover:scale-110",
                                editableAvatar.color === color.value ? 'border-ring' : 'border-transparent'
                            )}
                            style={{ backgroundColor: `#${color.value}` }}
                            aria-label={`Seleccionar color ${color.name}`}
                        />
                    ))}
                </div>
            </div>
            
            <div className="space-y-4 pt-6 border-t">
                 <Label>Editor de Perfil</Label>
                <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="center">Código de Centro Educativo</Label>
                    <Input id="center" value={center} onChange={(e) => setCenter(e.target.value)} placeholder="123-456" />
                     <p className="text-xs text-muted-foreground">
                        Introduce el código proporcionado por tu centro para unirte a su grupo.
                    </p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="ageRange">Rango de Edad</Label>
                    <Select onValueChange={setAgeRange} value={ageRange}>
                        <SelectTrigger id="ageRange">
                            <SelectValue placeholder="Selecciona tu rango de edad" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="12-15">12-15 años</SelectItem>
                            <SelectItem value="16-18">16-18 años</SelectItem>
                            <SelectItem value="19-22">19-22 años</SelectItem>
                            <SelectItem value="23+">23+ años</SelectItem>
                            <SelectItem value="No especificado">No especificado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="course">Curso</Label>
                        <Select onValueChange={setCourse} value={course}>
                            <SelectTrigger id="course"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1eso">1º ESO</SelectItem>
                                <SelectItem value="2eso">2º ESO</SelectItem>
                                <SelectItem value="3eso">3º ESO</SelectItem>
                                <SelectItem value="4eso">4º ESO</SelectItem>
                                <SelectItem value="1bach">1º Bachillerato</SelectItem>
                                <SelectItem value="2bach">2º Bachillerato</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="className">Clase</Label>
                        <Select onValueChange={setClassName} value={className}>
                            <SelectTrigger id="className"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="A">A</SelectItem>
                                <SelectItem value="B">B</SelectItem>
                                <SelectItem value="C">C</SelectItem>
                                <SelectItem value="D">D</SelectItem>
                                <SelectItem value="E">E</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input id="email" value={user.email} disabled />
                    <p className="text-xs text-muted-foreground">El correo electrónico no se puede cambiar.</p>
                </div>
            </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSaveChanges} disabled={isSaveDisabled}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


function AchievementCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: React.ElementType; color: string; }) {
    return (
      <Card className="hover:border-primary/50 transition-colors duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className={cn("h-5 w-5 text-muted-foreground", color)} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
        </CardContent>
      </Card>
    );
  }

function HistoryDialog({ user, card }: { user: User; card: Omit<SummaryCardData, 'isAnnouncement'>; }) {
    const firestore = useFirestore();
    const defaultTab = card.title.includes('Tareas') ? 'tasks' : 'exams';

    const completedItemsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(
            collection(firestore, `users/${user.uid}/completedItems`),
            orderBy('completedAt', 'desc')
        );
    }, [firestore, user]);

    const { data: completedItems = [], isLoading } = useCollection<CompletedItem>(completedItemsQuery);

    const filteredItems = (type: 'task' | 'exam') => {
        return completedItems.filter(item => item.type === type);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="cursor-pointer">
                    <AchievementCard {...card} />
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-md w-[95vw] p-0 flex flex-col h-[70vh]">
                <DialogHeader className="p-6 pb-4">
                    <DialogTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Historial de Logros
                    </DialogTitle>
                    <DialogDescription>
                        Aquí tienes un registro de tus tareas y exámenes completados.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue={defaultTab} className="w-full flex-1 flex flex-col min-h-0">
                    <div className="px-6">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="tasks"><NotebookText className="h-4 w-4 mr-2" />Tareas</TabsTrigger>
                            <TabsTrigger value="exams"><FileCheck2 className="h-4 w-4 mr-2" />Exámenes</TabsTrigger>
                        </TabsList>
                    </div>

                    <ScrollArea className="flex-1 px-2 py-4">
                        <TabsContent value="tasks" className="m-0 px-4">
                            <HistoryList items={filteredItems('task')} isLoading={isLoading} type="task" />
                        </TabsContent>
                        <TabsContent value="exams" className="m-0 px-4">
                            <HistoryList items={filteredItems('exam')} isLoading={isLoading} type="exam" />
                        </TabsContent>
                    </ScrollArea>
                </Tabs>
                
                <DialogFooter className="p-4 border-t">
                    <DialogClose asChild>
                        <Button variant="outline">Cerrar</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function HistoryList({ items, isLoading, type }: { items: CompletedItem[], isLoading: boolean, type: 'task' | 'exam' }) {
    if (isLoading) {
        return (
            <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[200px]">
                <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="font-semibold">Sin historial</p>
                <p className="text-sm text-muted-foreground">
                    Aún no has completado ningún {type === 'task' ? 'tarea' : 'examen'}. ¡Sigue así!
                </p>
            </div>
        );
    }
    
    const formatTimestamp = (timestamp: { seconds: number }) => {
        if (!timestamp) return "";
        return format(new Date(timestamp.seconds * 1000), "d 'de' MMMM, yyyy", { locale: es });
    };

    return (
        <div className="space-y-3">
            {items.map(item => (
                <div key={item.id} className="flex items-center gap-4 rounded-lg border p-3 bg-muted/50">
                    <div className={cn("p-2 rounded-full", type === 'task' ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-green-100 dark:bg-green-900/50')}>
                       {type === 'task' ? 
                         <NotebookText className="h-5 w-5 text-blue-500" /> : 
                         <FileCheck2 className="h-5 w-5 text-green-500" />
                       }
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-sm line-clamp-1">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                            {formatTimestamp(item.completedAt)}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

    



    

    
