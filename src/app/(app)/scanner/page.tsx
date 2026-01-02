
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, FileText, Download, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ScannedDocument } from '@/lib/types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';

function ScannerHistoryClient() {
    const [documents, setDocuments] = useState<ScannedDocument[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setIsMounted(true);
        try {
            const savedDocs = localStorage.getItem('scannedDocuments');
            if (savedDocs) {
                setDocuments(JSON.parse(savedDocs).sort((a: ScannedDocument, b: ScannedDocument) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
            }
        } catch (error) {
            console.error("Failed to load scanned documents from localStorage", error);
        }
    }, []);

    const deleteDocument = (id: number) => {
        const updatedDocuments = documents.filter(doc => doc.id !== id);
        setDocuments(updatedDocuments);
        localStorage.setItem('scannedDocuments', JSON.stringify(updatedDocuments));
        toast({
            title: 'Documento Eliminado',
            description: 'El documento ha sido eliminado de tu historial.',
            variant: 'destructive',
        });
    };

    const downloadPdf = async (doc: ScannedDocument) => {
        try {
            const pdf = new jsPDF();
            for (let i = 0; i < doc.pages.length; i++) {
                if (i > 0) pdf.addPage();
                const img = new Image();
                img.src = doc.pages[i];
                await new Promise(resolve => { img.onload = resolve; });
                
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const ratio = Math.min(pdfWidth / img.width, pdfHeight / img.height);
                const imgWidth = img.width * ratio;
                const imgHeight = img.height * ratio;
                const x = (pdfWidth - imgWidth) / 2;
                const y = (pdfHeight - imgHeight) / 2;
                
                pdf.addImage(img, 'JPEG', x, y, imgWidth, imgHeight);
            }
            pdf.save(doc.name);
        } catch (error) {
            console.error("Error creating PDF:", error);
            toast({ title: "Error al descargar", description: "No se pudo generar el PDF.", variant: "destructive" });
        }
    };


    if (!isMounted) {
        return <div className="text-center p-8">Cargando documentos...</div>;
    }

    if (documents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg mt-8">
                <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold">Tu historial está vacío</h3>
                <p className="text-muted-foreground mt-2">
                    Usa el escáner en el Modo Estudio para empezar a guardar tus apuntes.
                </p>
            </div>
        );
    }

    return (
        <div className="columns-1 sm:columns-2 gap-4 space-y-4">
            {documents.map(doc => (
                <div key={doc.id} className="break-inside-avoid">
                    <Card className="overflow-hidden group relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                        <img src={doc.thumbnail} alt={doc.name} className="w-full h-auto object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                            <div className="text-right">
                               <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="icon" className="h-8 w-8 rounded-full">
                                            <Trash2 className="h-4 w-4"/>
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Eliminar este documento?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta acción es irreversible y eliminará "{doc.name}" de tu historial.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => deleteDocument(doc.id)} className="bg-destructive hover:bg-destructive/90">
                                                Sí, eliminar
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>

                            <div className="space-y-2">
                                <p className="font-bold text-white text-sm drop-shadow-md">{doc.name}</p>
                                <div className="flex items-center gap-2">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="secondary" size="sm" className="flex-1 h-8">
                                                <Eye className="h-4 w-4 mr-2"/>
                                                Ver
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-3xl w-[95vw] h-[90vh] flex flex-col p-2 sm:p-4">
                                            <DialogHeader className="p-2">
                                                <DialogTitle className="truncate">{doc.name}</DialogTitle>
                                            </DialogHeader>
                                            <Carousel className="w-full h-full flex-1">
                                                <CarouselContent className="h-full">
                                                    {doc.pages.map((pageSrc, i) => (
                                                        <CarouselItem key={i} className="h-full flex items-center justify-center p-4">
                                                            <img src={pageSrc} alt={`Página ${i + 1}`} className="max-w-full max-h-full object-contain shadow-lg rounded-md" />
                                                        </CarouselItem>
                                                    ))}
                                                </CarouselContent>
                                                 {doc.pages.length > 1 && (
                                                    <>
                                                        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                                                        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
                                                    </>
                                                )}
                                            </Carousel>
                                             <DialogClose asChild>
                                                <Button variant="outline" className="mt-4">Cerrar</Button>
                                            </DialogClose>
                                        </DialogContent>
                                    </Dialog>
                                    <Button onClick={() => downloadPdf(doc)} size="sm" className="flex-1 h-8">
                                        <Download className="h-4 w-4 mr-2"/>
                                        PDF
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <Badge variant="secondary" className="absolute top-2 left-2">
                            {format(new Date(doc.timestamp), "d MMM yyyy", { locale: es })}
                        </Badge>
                    </Card>
                </div>
            ))}
        </div>
    );
}


export default function ScannerHistoryPage() {
    const router = useRouter();

    return (
        <div className="container mx-auto max-w-4xl p-4 sm:p-6">
            <header className="mb-8 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ChevronLeft />
                </Button>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold font-headline tracking-tighter sm:text-3xl">
                    Archivos Escaneados
                  </h1>
                </div>
            </header>
            
            <Card className="mb-8 bg-muted/30 border-dashed">
                <CardHeader className="flex flex-row items-center gap-4">
                     <div className="p-3 bg-primary/10 rounded-lg">
                        <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="font-semibold">Tu Biblioteca Digital</h2>
                        <CardDescription>
                            Aquí encontrarás todos los documentos que has creado con el escáner.
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>

            <main>
                <ScannerHistoryClient />
            </main>
        </div>
    );
}
