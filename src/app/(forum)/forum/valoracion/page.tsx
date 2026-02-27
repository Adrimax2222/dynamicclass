
"use client";

import { useState, useMemo, useEffect } from "react";
import { useApp } from "@/lib/hooks/use-app";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, addDoc, serverTimestamp, type Timestamp, doc, updateDoc, deleteDoc } from "firebase/firestore";
import type { User, Review } from "@/lib/types";
import { Star, Plus, Send, Edit, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const noteColors = ['#FECACA', '#FDE68A', '#A7F3D0', '#BFDBFE', '#C7D2FE', '#E9D5FF'];

export default function ValoracionPage() {
    const { user } = useApp();
    const firestore = useFirestore();
    const { toast } = useToast();

    const reviewsCollection = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, "reviews"), orderBy("createdAt", "desc"));
    }, [firestore]);

    const { data: reviews = [], isLoading } = useCollection<Review>(reviewsCollection);
    
    const userReview = useMemo(() => reviews.find(review => review.authorId === user?.uid), [reviews, user]);
    
    const handleSaveReview = async (data: { comment: string, rating: number, isAnonymous: boolean, color: string }, reviewId?: string) => {
        if (!user || !firestore) return;
        
        setIsLoading(true);
        try {
            if (reviewId) { // Update existing review
                const reviewRef = doc(firestore, 'reviews', reviewId);
                await updateDoc(reviewRef, { ...data, updatedAt: serverTimestamp() });
                toast({ title: '¡Gracias!', description: 'Tu valoración ha sido actualizada.' });
            } else { // Add new review
                const newReview = {
                    ...data,
                    authorId: user.uid,
                    authorName: user.name,
                    authorAvatar: user.avatar,
                    createdAt: serverTimestamp(),
                };
                await addDoc(collection(firestore, 'reviews'), newReview);
                toast({ title: '¡Gracias!', description: 'Tu valoración ha sido enviada.' });
            }
        } catch (error) {
             toast({ title: 'Error', description: 'No se pudo guardar tu valoración.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDeleteReview = async (reviewId: string) => {
        if (!user || !firestore) return;
        try {
            await deleteDoc(doc(firestore, 'reviews', reviewId));
            toast({ title: 'Valoración Eliminada', description: 'Tu reseña ha sido eliminada.', variant: 'destructive' });
        } catch (error) {
            toast({ title: 'Error', description: 'No se pudo eliminar tu valoración.', variant: 'destructive' });
        }
    };

    return (
        <div className="relative min-h-full p-4 sm:p-6 md:p-8">
            <div className="space-y-6">
                <div className="text-center">
                    <div className="mx-auto mb-4 w-fit rounded-lg bg-muted p-3">
                        <Star className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold font-headline tracking-tight">Valoraciones de la Comunidad</h2>
                    <p className="text-muted-foreground">Lee lo que otros piensan y comparte tu propia experiencia.</p>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg max-w-lg mx-auto mt-8">
                        <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <h3 className="font-semibold text-xl mt-4">Sé el primero en opinar</h3>
                        <p className="text-sm text-muted-foreground">Aún no hay valoraciones. ¡Anímate a compartir la tuya!</p>
                    </div>
                ) : (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                        {reviews.map(review => (
                            <ReviewCard 
                                key={review.uid} 
                                review={review} 
                                isAuthor={user?.uid === review.authorId}
                                onSave={handleSaveReview}
                                onDelete={handleDeleteReview}
                                user={user}
                            />
                        ))}
                    </div>
                )}
            </div>
            
            {!isLoading && !userReview && user && (
                <div className="sticky bottom-6 right-6 flex justify-end mt-8">
                    <NewReviewDialog onSave={handleSaveReview} user={user} />
                </div>
            )}
        </div>
    );
}

const StarRating = ({ rating, size = 'md' }: { rating: number, size?: 'sm' | 'md' }) => {
    const starSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
    return (
        <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={cn(
                        starSize,
                        i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'
                    )}
                />
            ))}
        </div>
    );
};

const ReviewCard = ({ review, isAuthor, onSave, onDelete, user }: { review: Review, isAuthor: boolean, onSave: any, onDelete: any, user: User | null }) => {
    return (
        <div className="break-inside-avoid">
            <Card className="hover:shadow-lg transition-shadow" style={{ borderTop: `4px solid ${review.color || 'transparent'}`}}>
                <CardHeader className="flex-row items-start gap-3 space-y-0">
                    <AvatarDisplay 
                        user={{
                            name: review.isAnonymous ? "Anónimo" : review.authorName,
                            avatar: review.isAnonymous ? "letter_A_737373" : review.authorAvatar,
                        }} 
                        className="h-10 w-10 border"
                    />
                    <div>
                        <CardTitle className="text-sm">{review.isAnonymous ? "Anónimo" : review.authorName}</CardTitle>
                        <StarRating rating={review.rating} size="sm" />
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="line-clamp-4 text-sm text-muted-foreground">
                        {review.comment}
                    </p>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                       {review.createdAt ? formatDistanceToNow(review.createdAt.toDate(), { addSuffix: true, locale: es }) : ''}
                    </p>
                    {isAuthor && (
                        <div className="flex items-center">
                           <NewReviewDialog onSave={onSave} user={user} review={review}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Edit className="h-4 w-4"/></Button>
                           </NewReviewDialog>
                           <AlertDialog>
                               <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/70 hover:text-destructive"><Trash2 className="h-4 w-4"/></Button>
                               </AlertDialogTrigger>
                               <AlertDialogContent>
                                   <AlertDialogHeader>
                                       <AlertDialogTitle>¿Eliminar tu valoración?</AlertDialogTitle>
                                       <AlertDialogDescription>Esta acción es permanente y no se puede deshacer.</AlertDialogDescription>
                                   </AlertDialogHeader>
                                   <AlertDialogFooter>
                                       <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                       <AlertDialogAction onClick={() => onDelete(review.uid)} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
                                   </AlertDialogFooter>
                               </AlertDialogContent>
                           </AlertDialog>
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}

function NewReviewDialog({ onSave, user, review, children }: { onSave: (data: { comment: string, rating: number, isAnonymous: boolean, color: string }, reviewId?: string) => Promise<void>, user: User | null, review?: Review, children?: React.ReactNode }) {
    const isEditing = !!review;
    const [rating, setRating] = useState(review?.rating || 0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState(review?.comment || '');
    const [isAnonymous, setIsAnonymous] = useState(review?.isAnonymous || false);
    const [color, setColor] = useState(review?.color || noteColors[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setRating(review?.rating || 0);
            setComment(review?.comment || '');
            setIsAnonymous(review?.isAnonymous || false);
            setColor(review?.color || noteColors[0]);
        }
    }, [isOpen, review]);

    const handleSubmit = async () => {
        if (comment.trim() && rating > 0) {
            setIsLoading(true);
            await onSave({ comment, rating, isAnonymous, color }, review?.uid);
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
                    <DialogTitle>{isEditing ? 'Editar Valoración' : 'Comparte tu Opinión'}</DialogTitle>
                    <DialogDescription>
                        Tu feedback nos ayuda a mejorar Dynamic Class para todos.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Tu valoración</Label>
                        <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
                            {[...Array(5)].map((_, i) => {
                                const ratingValue = i + 1;
                                return (
                                    <button
                                        key={ratingValue}
                                        type="button"
                                        onClick={() => setRating(ratingValue)}
                                        onMouseEnter={() => setHoverRating(ratingValue)}
                                    >
                                        <Star className={cn("h-8 w-8 transition-colors", ratingValue <= (hoverRating || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30')} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="comment">Tu comentario</Label>
                        <Textarea 
                            id="comment" 
                            placeholder="¿Qué te ha parecido la aplicación?" 
                            rows={5}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
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
                    <Button onClick={handleSubmit} disabled={isLoading || !comment.trim() || rating === 0}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        {isEditing ? 'Guardar Cambios' : 'Enviar Valoración'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

