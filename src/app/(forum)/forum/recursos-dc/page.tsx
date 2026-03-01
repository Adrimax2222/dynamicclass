"use client";

import { useState, useMemo, useEffect } from "react";
import { useApp } from "@/lib/hooks/use-app";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, addDoc, serverTimestamp, type Timestamp, doc, updateDoc, deleteDoc } from "firebase/firestore";
import type { User, BugReport } from "@/lib/types";
import { Zap, Plus, Edit, Trash2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { AvatarDisplay } from "@/components/profile/avatar-creator";
import { Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

const noteColors = ['#FECACA', '#FDE68A', '#A7F3D0', '#BFDBFE', '#C7D2FE', '#E9D5FF'];

export default function RecursosDCPage() {
    const { user } = useApp();
    const firestore = useFirestore();
    const { toast } = useToast();

    const bugReportsCollection = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, "bugReports"), orderBy("createdAt", "desc"));
    }, [firestore]);

    const { data: bugReports = [], isLoading } = useCollection<BugReport>(bugReportsCollection);
    
    const handleSaveReport = async (data: { title: string, description: string, isAnonymous: boolean, color: string }, reportId?: string) => {
        if (!user || !firestore) return;
        
        try {
            if (reportId) { // Update existing report
                const reportRef = doc(firestore, 'bugReports', reportId);
                await updateDoc(reportRef, { ...data, updatedAt: serverTimestamp() });
                toast({ title: '¡Gracias!', description: 'Tu informe ha sido actualizado.' });
            } else { // Add new report
                const newReport = {
                    ...data,
                    authorId: user.uid,
                    authorName: user.name,
                    authorAvatar: user.avatar,
                    createdAt: serverTimestamp(),
                };
                await addDoc(collection(firestore, 'bugReports'), newReport);
                toast({ title: '¡Gracias!', description: 'Tu informe de error ha sido enviado.' });
            }
        } catch (error) {
             toast({ title: 'Error', description: 'No se pudo guardar tu informe.', variant: 'destructive' });
        }
    };
    
    const handleDeleteReport = async (reportId: string) => {
        if (!user || !firestore) return;
        try {
            await deleteDoc(doc(firestore, 'bugReports', reportId));
            toast({ title: 'Informe Eliminado', description: 'El informe de error ha sido eliminado.', variant: 'destructive' });
        } catch (error) {
            toast({ title: 'Error', description: 'No se pudo eliminar tu informe.', variant: 'destructive' });
        }
    };

    return (
        <div className="relative min-h-full p-4 sm:p-6 md:p-8">
            <div className="space-y-6">
                <div className="text-center">
                    <div className="mx-auto mb-4 w-fit rounded-lg bg-muted p-3">
                        <Zap className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold font-headline tracking-tight">Informes de la Comunidad</h2>
                    <p className="text-muted-foreground">Reporta errores y sugiere mejoras para Dynamic Class.</p>
                </div>

                <Alert className="mb-6 border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200">
                    <Wrench className="h-5 w-5 text-amber-500" />
                    <AlertTitle className="font-bold">¡Ayúdanos a Mejorar!</AlertTitle>
                    <AlertDescription>
                        Este es un espacio para que reportes cualquier error, fallo visual o sugerencia que tengas. No te cortes, ¡cada detalle nos ayuda a construir una mejor app para todos! El equipo de Dynamic Class leerá todos los informes.
                    </AlertDescription>
                </Alert>

                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                ) : bugReports.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg max-w-lg mx-auto mt-8">
                        <Wrench className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <h3 className="font-semibold text-xl">Todo en orden</h3>
                        <p className="text-sm text-muted-foreground">Aún no hay informes de errores. ¡Anímate a ser el primero si encuentras algo!</p>
                    </div>
                ) : (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                        {bugReports.map(report => (
                            <BugReportCard 
                                key={report.uid} 
                                report={report} 
                                isAuthor={user?.uid === report.authorId}
                                onSave={handleSaveReport}
                                onDelete={handleDeleteReport}
                                user={user}
                            />
                        ))}
                    </div>
                )}
            </div>
            
            {user && (
                <div className="sticky bottom-6 right-6 flex justify-end mt-8">
                    <NewBugReportDialog onSave={handleSaveReport} user={user} />
                </div>
            )}
        </div>
    );
}

const BugReportCard = ({ report, isAuthor, onSave, onDelete, user }: { report: BugReport, isAuthor: boolean, onSave: any, onDelete: any, user: User | null }) => {
    return (
        <div className="break-inside-avoid">
            <Dialog>
                <Card className="hover:shadow-lg transition-shadow flex flex-col" style={{ borderTop: `4px solid ${report.color || 'transparent'}`}}>
                    <DialogTrigger asChild>
                        <div className="cursor-pointer flex-1">
                            <CardHeader className="flex-row items-start gap-3 space-y-0">
                                <AvatarDisplay 
                                    user={{
                                        name: report.isAnonymous ? "Anónimo" : report.authorName,
                                        avatar: report.isAnonymous ? "letter_A_737373" : report.authorAvatar,
                                    }} 
                                    className="h-10 w-10 border"
                                />
                                <div>
                                    <CardTitle className="text-base">{report.title}</CardTitle>
                                    <p className="text-xs text-muted-foreground">
                                        por {report.isAnonymous ? "Anónimo" : report.authorName}
                                    </p>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="line-clamp-4 text-sm text-muted-foreground">
                                    {report.description}
                                </p>
                            </CardContent>
                        </div>
                    </DialogTrigger>
                    <CardFooter className="flex justify-between items-center mt-auto">
                        <p className="text-xs text-muted-foreground">
                           {report.createdAt ? formatDistanceToNow(report.createdAt.toDate(), { addSuffix: true, locale: es }) : ''}
                        </p>
                        {isAuthor && (
                            <div className="flex items-center">
                               <NewBugReportDialog onSave={onSave} user={user} report={report}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Edit className="h-4 w-4"/></Button>
                               </NewBugReportDialog>
                               <AlertDialog>
                                   <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/70 hover:text-destructive"><Trash2 className="h-4 w-4"/></Button>
                                   </AlertDialogTrigger>
                                   <AlertDialogContent>
                                       <AlertDialogHeader>
                                           <AlertDialogTitle>¿Eliminar este informe?</AlertDialogTitle>
                                           <AlertDialogDescription>Esta acción es permanente y no se puede deshacer.</AlertDialogDescription>
                                       </AlertDialogHeader>
                                       <AlertDialogFooter>
                                           <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                           <AlertDialogAction onClick={() => onDelete(report.uid)} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
                                       </AlertDialogFooter>
                                   </AlertDialogContent>
                               </AlertDialog>
                            </div>
                        )}
                    </CardFooter>
                </Card>

                <DialogContent className="max-w-lg">
                    <DialogHeader style={{ borderLeft: `4px solid ${report.color || 'transparent'}`, paddingLeft: '1rem' }}>
                        <DialogTitle>{report.title}</DialogTitle>
                        <DialogDescription>
                            Reportado por {report.isAnonymous ? "Anónimo" : report.authorName}
                            {' · '}
                            {report.createdAt ? formatDistanceToNow(report.createdAt.toDate(), { addSuffix: true, locale: es }) : ''}
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh] -mx-6 my-4">
                        <div className="px-6 whitespace-pre-wrap text-sm text-muted-foreground">
                            {report.description}
                        </div>
                    </ScrollArea>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cerrar</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

function NewBugReportDialog({ onSave, user, report, children }: { onSave: (data: { title: string, description: string, isAnonymous: boolean, color: string }, reportId?: string) => Promise<void>, user: User | null, report?: BugReport, children?: React.ReactNode }) {
    const isEditing = !!report;
    const [title, setTitle] = useState(report?.title || '');
    const [description, setDescription] = useState(report?.description || '');
    const [isAnonymous, setIsAnonymous] = useState(report?.isAnonymous || false);
    const [color, setColor] = useState(report?.color || noteColors[Math.floor(Math.random() * noteColors.length)]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTitle(report?.title || '');
            setDescription(report?.description || '');
            setIsAnonymous(report?.isAnonymous || false);
            setColor(report?.color || noteColors[0]);
        }
    }, [isOpen, report]);

    const handleSubmit = async () => {
        if (title.trim() && description.trim()) {
            setIsLoading(true);
            await onSave({ title, description, isAnonymous, color }, report?.uid);
            setIsLoading(false);
            setIsOpen(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children || (
                     <Button className="h-14 w-14 rounded-full shadow-lg">
                        <Plus className="h-6 w-6" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Informe' : 'Nuevo Informe de Error'}</DialogTitle>
                    <DialogDescription>
                        Describe el problema que has encontrado con el mayor detalle posible.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Título del Informe</Label>
                        <Input 
                            id="title" 
                            placeholder="Ej: El botón de guardar no funciona"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción detallada</Label>
                        <Textarea 
                            id="description" 
                            placeholder="Pasos para reproducir el error, qué esperabas que ocurriera y qué ocurrió en realidad." 
                            rows={5}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Color de la tarjeta</Label>
                        <div className="flex flex-wrap gap-3">
                            {noteColors.map(c => (
                                <button key={c} type="button" onClick={() => setColor(c)} className={cn('h-8 w-8 rounded-full border-2 transition-transform hover:scale-110', color === c ? 'border-ring ring-2 ring-offset-2 ring-primary' : 'border-slate-300')}>
                                    <div className="w-full h-full rounded-full" style={{backgroundColor: c}}/>
                                </button>
                            ))}
                        </div>
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-3">
                         <div className="flex items-center space-x-3">
                             <AvatarDisplay user={user || {}} className="h-9 w-9" />
                             <Label htmlFor="anonymous-switch" className="space-y-0.5">
                                 <span className="font-medium">Publicar como Anónimo</span>
                                 <p className="text-xs text-muted-foreground">
                                     Tu nombre y avatar no serán visibles.
                                 </p>
                             </Label>
                         </div>
                        <Switch id="anonymous-switch" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline" disabled={isLoading}>Cancelar</Button></DialogClose>
                    <Button onClick={handleSubmit} disabled={isLoading || !title.trim() || !description.trim()}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        {isEditing ? 'Guardar Cambios' : 'Enviar Informe'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}