
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
import type { SummaryCardData, User, CompletedItem, Center } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Edit, Settings, Loader2, Trophy, NotebookText, FileCheck2, Medal, Flame, Clock, PawPrint, Rocket, Pizza, Gamepad2, Ghost, Palmtree, CheckCircle, LineChart, CaseUpper, Cat, Heart, History, Calendar, Gift, User as UserIcon, AlertCircle, GraduationCap, School, PlusCircle, Search, Copy, Check, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/lib/hooks/use-app";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useMemo } from "react";
import { doc, updateDoc, arrayUnion, increment, collection, query, orderBy, getDocs, addDoc, serverTimestamp, where } from "firebase/firestore";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { SCHOOL_NAME, SCHOOL_VERIFICATION_CODE } from "@/lib/constants";
import { RankingDialog } from "@/components/layout/ranking-dialog";
import { GradeCalculatorDialog } from "@/components/layout/grade-calculator-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Switch } from "@/components/ui/switch";
import { AvatarDisplay } from "@/components/profile/avatar-creator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const ADMIN_EMAILS = ['anavarrod@iestorredelpalau.cat', 'lrotav@iestorredelpalau.cat', 'adrimax.dev@gmail.com'];

export default function ProfilePage() {
  const { user } = useApp();
  const firestore = useFirestore();
  const centersCollection = useMemoFirebase(() => firestore ? collection(firestore, 'centers') : null, [firestore]);
  const { data: centers = [] } = useCollection<Center>(centersCollection);


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
    "personal": "No especificado"
  }
  
  const userCenter = centers.find(c => c.code === user.center);
  const isCenterCodeValid = !!userCenter || user.course === 'default'; // valid if a center is found or if user is unassigned
  const displayCenter = user.center === 'personal' ? 'Uso Personal' : (isCenterCodeValid ? userCenter?.name : 'Código de centro obsoleto');


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
          <AvatarDisplay user={user} className="mx-auto h-24 w-24 ring-4 ring-background" />
          <h2 className="mt-4 text-2xl font-bold">{user.name}</h2>
          <div className="mt-2 flex items-center justify-center gap-2">
            {user.role === 'admin' && (
                <Badge variant="destructive">Admin Global</Badge>
            )}
            {user.role === 'center-admin' && (
                <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/20">Admin Centro</Badge>
            )}
            {user.role.startsWith('admin-') && user.role !== 'admin' && user.role !== 'center-admin' && (
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">Admin Clase</Badge>
            )}
          </div>
          <p className={cn("text-muted-foreground mt-2", !isCenterCodeValid && user.center !== 'personal' && "text-red-500 font-bold")}>{displayCenter}</p>
          <EditProfileDialog allCenters={centers} />
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
                <p className="font-bold">{user.ageRange === 'personal' ? 'No especificado' : user.ageRange}</p>
            </div>
            <div>
                <p className="text-muted-foreground">Curso</p>
                <p className="font-bold">{courseMap[user.course] || user.course}</p>
            </div>
            <div>
                <p className="text-muted-foreground">Clase</p>
                <p className="font-bold">{user.className === 'personal' ? 'N/A' : user.className}</p>
            </div>
            <div className="col-span-2">
                <p className="text-muted-foreground">Correo Electrónico</p>
                <p className="font-bold break-words">{user.email}</p>
            </div>
        </CardContent>
      </Card>

      <Card className="mb-8 bg-blue-500/5 border-blue-500/20">
          <CardHeader>
              <CardTitle className="flex items-center gap-3">
                  <GraduationCap className="h-6 w-6 text-blue-500" />
                  <span>Modo Profesor</span>
                  <Badge variant="outline">Próximamente</Badge>
              </CardTitle>
              <CardDescription>
                  Estamos desarrollando herramientas exclusivas para que los educadores gestionen sus clases y se comuniquen con los estudiantes de manera más eficaz.
              </CardDescription>
          </CardHeader>
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

interface EditableAvatar {
    id: string;
    color: string;
}

type RegistrationMode = 'join' | 'personal' | 'create';

const courseOptions = [
    { value: '1eso', label: '1º ESO' },
    { value: '2eso', label: '2º ESO' },
    { value: '3eso', label: '3º ESO' },
    { value: '4eso', label: '4º ESO' },
    { value: '1bach', label: '1º Bachillerato' },
    { value: '2bach', label: '2º Bachillerato' },
];

const classOptions = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

function EditProfileDialog({ allCenters }: { allCenters: Center[] }) {
  const { user, updateUser } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [editableAvatar, setEditableAvatar] = useState<EditableAvatar>({ id: 'letter_A', color: 'A78BFA'});
  
  const [name, setName] = useState(user?.name || "");
  const [center, setCenter] = useState(user?.center === 'personal' ? '' : user?.center || "");
  const [ageRange, setAgeRange] = useState(user?.ageRange || "");
  const [course, setCourse] = useState(user?.course || "");
  const [className, setClassName] = useState(user?.className || "");
  const [newCenterName, setNewCenterName] = useState('');
  const [newClassName, setNewClassName] = useState('');
  
  const [mode, setMode] = useState<RegistrationMode>(user?.center === 'personal' ? 'personal' : 'join');
  const [isCenterValidated, setIsCenterValidated] = useState(user?.center !== 'personal' && user?.center !== 'default');
  const [validatedCenter, setValidatedCenter] = useState<Center | null>(null);
  const [isCenterNameValidated, setIsCenterNameValidated] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isCodeCopied, setIsCodeCopied] = useState(false);
  
  const firestore = useFirestore();
  const { toast } = useToast();

  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

  const initializeState = () => {
    if (user) {
        const isPersonal = user.center === 'personal' || user.center === 'default';
        setMode(isPersonal ? 'personal' : 'join');
        setName(user.name);
        setCenter(isPersonal ? '' : user.center || "");
        setAgeRange(user.ageRange === 'default' ? '' : user.ageRange);
        setCourse(isPersonal ? '' : user.course || '');
        setClassName(isPersonal ? '' : user.className || '');
        
        const [id, id_extra, color] = user.avatar.split('_');
        
        if (id === 'letter') {
             setEditableAvatar({ id: `letter_${id_extra}`, color: color || '737373' });
        } else if (shopAvatarMap.has(id)) {
             setEditableAvatar({ id: id, color: id_extra || '737373' });
        } else {
             const initial = user.name.charAt(0).toUpperCase() || 'A';
             setEditableAvatar({ id: `letter_${initial}`, color: 'A78BFA' });
        }
        
        if (!isPersonal && user.center) {
            const currentCenter = allCenters.find(c => c.code === user.center);
            if (currentCenter) {
                setValidatedCenter(currentCenter);
                setIsCenterValidated(true);
            }
        }
    }
  };
  
  useEffect(() => {
    if (isOpen) {
        initializeState();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user, allCenters]);

  const availableClasses = useMemo(() => {
    if (!validatedCenter || !validatedCenter.classes) return { courses: [], classNames: [] };

    const courses = new Set<string>();
    const classNames = new Set<string>();

    validatedCenter.classes.forEach(c => {
        const [course, className] = c.name.split('-');
        if (course) {
            const courseValue = course.toLowerCase().replace('º', '');
            courses.add(courseValue);
        }
        if (className) {
            classNames.add(className);
        }
    });

    return {
        courses: Array.from(courses),
        classNames: Array.from(classNames)
    };
  }, [validatedCenter]);
  
  
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

  const formatAndSetCenterCode = (value: string) => {
    const digitsOnly = value.replace(/[^0-9]/g, '');
    let formatted = digitsOnly.slice(0, 6);
    if (formatted.length > 3) {
      formatted = `${formatted.slice(0, 3)}-${formatted.slice(3)}`;
    }
    setCenter(formatted);
  };
  
    const generateNewCode = () => `${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`;

    const handleGenerateCode = () => {
      const code = generateNewCode();
      setGeneratedCode(code);
    }

    const handleCopyCode = () => {
        if (!generatedCode) return;
        navigator.clipboard.writeText(generatedCode);
        setIsCodeCopied(true);
        toast({ title: "Código copiado" });
        setTimeout(() => setIsCodeCopied(false), 2000);
    }
    
  const handleValidateCenter = async () => {
    if (!firestore) return;
    setIsLoading(true);
    const q = query(collection(firestore, 'centers'), where('code', '==', center));
    try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const centerDoc = querySnapshot.docs[0];
            const centerData = { uid: centerDoc.id, ...centerDoc.data() } as Center;
            setValidatedCenter(centerData);
            setIsCenterValidated(true);
            toast({ title: "Centro validado", description: `Te has unido a ${centerData.name}.` });
        } else {
            setValidatedCenter(null);
            setIsCenterValidated(false);
            toast({ title: "Error", description: "No se encontró ningún centro con ese código.", variant: "destructive" });
        }
    } catch (error) {
       console.error("Error validating center:", error);
       setIsCenterValidated(false);
       setValidatedCenter(null);
       toast({ title: "Error", description: "No se pudo comprobar el código del centro.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  const handleCheckCenterName = async () => {
    if (!allCenters || !newCenterName || newCenterName.length < 3) {
      toast({ title: "Error", description: "El nombre debe tener al menos 3 caracteres.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    const normalize = (str: string) => str.toLowerCase().replace(/^(ies|ins|institut|colegio|escuela|centro)\s+/i, '').trim();
    const normalizedInput = normalize(newCenterName);
    const exists = allCenters.some(c => normalize(c.name) === normalizedInput);

    if (exists) {
        setIsCenterNameValidated(false);
        toast({ title: "Nombre no disponible", description: "Este centro ya existe. Por favor, únete a él usando su código.", variant: "destructive" });
    } else {
        setIsCenterNameValidated(true);
        toast({ title: "Nombre Disponible", description: "Puedes crear un centro con este nombre." });
    }
    setIsLoading(false);
  };
  
const handleSaveChanges = async () => {
    if (!firestore || !user) return;
    setIsLoading(true);

    const finalAvatarString = editableAvatar.id.startsWith('letter')
        ? `${editableAvatar.id}_${editableAvatar.color}`
        : `${editableAvatar.id}_${editableAvatar.color}`;

    let updatedData: Partial<User> = {
        name,
        avatar: finalAvatarString,
        ageRange,
    };

    try {
        if (mode === 'personal') {
            updatedData = {
                ...updatedData,
                center: 'personal',
                course: 'personal',
                className: 'personal',
                role: user.role === 'admin' ? 'admin' : 'student',
                organizationId: '',
            };
        } else if (mode === 'join') {
            if (!isCenterValidated || !validatedCenter) {
                toast({ title: "Error", description: "Debes validar el código del centro.", variant: "destructive" });
                setIsLoading(false);
                return;
            }
             updatedData = {
                ...updatedData,
                center: center,
                course: course,
                className: className,
                role: user.role === 'admin' ? 'admin' : 'student',
                organizationId: validatedCenter.uid,
            };
        } else if (mode === 'create') {
            if (!isCenterNameValidated || !newClassName || !generatedCode) {
                toast({ title: "Error", description: "Completa todos los campos para crear el centro.", variant: "destructive" });
                setIsLoading(false);
                return;
            }
            
            const newCenterRef = await addDoc(collection(firestore, "centers"), {
                name: newCenterName,
                code: generatedCode,
                classes: [{ name: newClassName, icalUrl: '', schedule: { Lunes: [], Martes: [], Miércoles: [], Jueves: [], Viernes: [] } }],
                createdAt: serverTimestamp(),
            });
            
            const [newCourse, newClass] = newClassName.split('-');

            updatedData = {
                ...updatedData,
                center: generatedCode,
                course: newCourse.toLowerCase().replace('º',''),
                className: newClass,
                role: 'center-admin',
                organizationId: newCenterRef.id,
            };

            toast({ title: "¡Centro Creado!", description: `"${newCenterName}" se ha creado con el código ${generatedCode}.` });
        }
        
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
    
    if (editableAvatar.id.startsWith('letter_')) {
        return false;
    }
    
    if (shopItem) {
        const isOwned = user.ownedAvatars?.includes(shopItem.id);
        if (shopItem.price > 0 && !isOwned) return true;
    }

    return false;
  }, [editableAvatar.id, user.ownedAvatars, isLoading]);
  
  const registrationModeInfo = {
    join: { title: "Unirse a un Centro", description: "Introduce el código proporcionado por tu centro educativo." },
    create: { title: "Crear un Centro", description: "Si tu centro no está, créalo y compártelo." },
    personal: { title: "Uso Personal", description: "Usa la app de forma individual." },
  }

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
                <AvatarDisplay 
                    user={{ avatar: `${editableAvatar.id}_${editableAvatar.color}`, name: user.name }}
                    className="h-24 w-24 ring-4 ring-primary ring-offset-2" 
                />
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
                                                    <AlertDialogDescription>
                                                        ¿Quieres comprar este avatar por {avatar.price} trofeos? Tus trofeos actuales son {user.trophies}.
                                                    </AlertDialogDescription>
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
                <Label>Datos Personales</Label>
                <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="ageRange">Rango de Edad</Label>
                    <Select onValueChange={setAgeRange} value={ageRange === 'personal' ? '' : ageRange}>
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
            </div>

             <div className="space-y-4 pt-6 border-t">
                <Label>Datos del Centro</Label>
                <RadioGroup value={mode} onValueChange={(v) => setMode(v as RegistrationMode)} className="grid grid-cols-3 gap-2">
                    <Label className={cn("rounded-lg border-2 p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors hover:bg-accent/50", mode === 'join' ? "border-primary text-primary bg-primary/10" : "border-transparent text-muted-foreground")}>
                        <School className="h-5 w-5"/> <span className="text-xs font-semibold">{registrationModeInfo.join.title.split(' ')[0]}</span>
                        <RadioGroupItem value='join' className="sr-only"/>
                    </Label>
                     <Label className={cn("rounded-lg border-2 p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors hover:bg-accent/50", mode === 'create' ? "border-primary text-primary bg-primary/10" : "border-transparent text-muted-foreground", user.role === 'center-admin' && "cursor-not-allowed opacity-50")}>
                        <PlusCircle className="h-5 w-5"/> <span className="text-xs font-semibold">{registrationModeInfo.create.title.split(' ')[0]}</span>
                        <RadioGroupItem value='create' className="sr-only" disabled={user.role === 'center-admin'}/>
                    </Label>
                    <Label className={cn("rounded-lg border-2 p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors hover:bg-accent/50", mode === 'personal' ? "border-primary text-primary bg-primary/10" : "border-transparent text-muted-foreground")}>
                        <UserIcon className="h-5 w-5"/> <span className="text-xs font-semibold">{registrationModeInfo.personal.title.split(' ')[0]}</span>
                        <RadioGroupItem value='personal' className="sr-only"/>
                    </Label>
                </RadioGroup>
                
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                    <h4 className="font-semibold text-sm">{registrationModeInfo[mode].title}</h4>
                    <p className="text-xs text-muted-foreground">{registrationModeInfo[mode].description}</p>
                </div>

                {mode === 'join' && (
                  <div className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="center-code">Código de Centro</Label>
                        <div className="flex items-center gap-2">
                            <Input id="center-code" value={center} onChange={e => formatAndSetCenterCode(e.target.value)} placeholder="123-456" disabled={isCenterValidated} />
                             <Button type="button" onClick={handleValidateCenter} disabled={center.length < 7 || isLoading || isCenterValidated} variant={isCenterValidated ? "secondary" : "default"}>
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : isCenterValidated ? <CheckCircle className="h-4 w-4"/> : "Validar"}
                            </Button>
                        </div>
                        {validatedCenter && <p className="text-sm font-semibold text-green-600 flex items-center gap-2"><CheckCircle className="h-4 w-4"/> {validatedCenter.name}</p>}
                     </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="course" className={cn(!isCenterValidated && 'text-muted-foreground/50')}>Curso</Label>
                            <Select onValueChange={setCourse} value={course} disabled={!isCenterValidated}>
                                <SelectTrigger id="course"><SelectValue placeholder="Curso..." /></SelectTrigger>
                                <SelectContent>{courseOptions.map(option => (<SelectItem key={option.value} value={option.value} disabled={!availableClasses.courses.includes(option.value)}>{option.label}</SelectItem>))}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="className" className={cn(!isCenterValidated && 'text-muted-foreground/50')}>Clase</Label>
                            <Select onValueChange={setClassName} value={className} disabled={!isCenterValidated}>
                                <SelectTrigger id="className"><SelectValue placeholder="Clase..." /></SelectTrigger>
                                <SelectContent>{classOptions.map(option => (<SelectItem key={option} value={option} disabled={!availableClasses.classNames.includes(option)}>{option}</SelectItem>))}</SelectContent>
                            </Select>
                        </div>
                    </div>
                  </div>
                )}
                
                {mode === 'create' && (
                    <div className="space-y-4">
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="link" className="text-xs p-0 h-auto">¿Estás seguro de que tu centro no existe?</Button></AlertDialogTrigger>
                        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Comprobación</AlertDialogTitle><AlertDialogDescription>Antes de crear un centro, asegúrate de que no exista ya en la plataforma para evitar duplicados.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogAction>Entendido</AlertDialogAction></AlertDialogContent>
                      </AlertDialog>
                      <div className="space-y-2">
                          <Label>Nombre del Nuevo Centro</Label>
                          <div className="flex items-center gap-2">
                            <Input placeholder="Ej: Instituto Adrimax" value={newCenterName} onChange={e => setNewCenterName(e.target.value)} disabled={isCenterNameValidated} />
                            <Button type="button" onClick={handleCheckCenterName} disabled={!newCenterName || isLoading || isCenterNameValidated} variant={isCenterNameValidated ? "secondary" : "default"}>
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : isCenterNameValidated ? <CheckCircle className="h-4 w-4"/> : <Search className="h-4 w-4"/>}
                            </Button>
                          </div>
                      </div>
                      {isCenterNameValidated && (
                         <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nombre de la Primera Clase</Label>
                                <Input placeholder="Ej: 4ESO-B" value={newClassName} onChange={e => setNewClassName(e.target.value)} />
                                <p className="text-xs text-muted-foreground">Formato: 'CURSO-LETRA' (1eso-A, 2bach-C, etc.)</p>
                            </div>
                            <div className="space-y-2 p-3 border rounded-lg bg-muted/30">
                                <Label>Código de Acceso del Centro</Label>
                                <p className="text-xs text-muted-foreground">Este será el código para que otros se unan. Guárdalo bien.</p>
                                {generatedCode ? (
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-base font-bold tracking-widest">{generatedCode}</Badge>
                                        <Button type="button" variant="ghost" size="icon" onClick={handleCopyCode} className="h-7 w-7">
                                            {isCodeCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                                        </Button>
                                    </div>
                                ) : (
                                    <Button type="button" onClick={handleGenerateCode} className="w-full"><RefreshCw className="mr-2 h-4 w-4"/>Generar Código</Button>
                                )}
                            </div>
                         </div>
                      )}
                    </div>
                )}
             </div>

            <div className="space-y-2 pt-6 border-t">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" value={user.email} disabled />
                <p className="text-xs text-muted-foreground">El correo electrónico no se puede cambiar.</p>
            </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSaveChanges} disabled={isSaveDisabled || isLoading}>
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
                <div key={`${item.id}-${item.completedAt.seconds}`} className="flex items-center gap-4 rounded-lg border p-3 bg-muted/50">
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

    