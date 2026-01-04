"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Languages, FileDown, Wand, BrainCircuit, Type, FileSignature, X, ArrowLeft, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { cn } from '@/lib/utils';
import { WipDialog } from '@/components/layout/wip-dialog';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';

type Tone = 'student' | 'academic' | 'informative';

const PowerUpCard = ({ icon: Icon, title, description, isFeatured = false, isWip = true, onClick, className }: { icon: React.ElementType, title: string, description: string, isFeatured?: boolean, isWip?: boolean, onClick?: () => void, className?: string }) => {
    const cardContent = (
        <Card className={cn(
            "w-full text-left transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl h-full",
            isFeatured 
                ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg" 
                : "bg-white hover:bg-slate-50",
            className
        )}>
            <CardHeader className="p-4">
                <div className="flex items-center gap-3 mb-1">
                    <div className={cn("p-1.5 rounded-md", isFeatured ? "bg-white/20" : "bg-slate-100")}>
                        <Icon className={cn("h-5 w-5", isFeatured ? "text-white" : "text-slate-600")} />
                    </div>
                    <h4 className="font-semibold">{title}</h4>
                </div>
                <p className={cn("text-xs", isFeatured ? "text-white/80" : "text-slate-500")}>{description}</p>
            </CardHeader>
        </Card>
    );

    if (isWip) {
        return <WipDialog>{cardContent}</WipDialog>;
    }

    return <button onClick={onClick} className="w-full h-full">{cardContent}</button>;
};

export default function MagicEditorPage() {
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [wordCount, setWordCount] = useState(0);
    const [charCount, setCharCount] = useState(0);
    const [tone, setTone] = useState<Tone>('student');
    const [isCopied, setIsCopied] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
        const words = text.trim().split(/\s+/).filter(Boolean);
        setWordCount(words.length === 1 && words[0] === '' ? 0 : words.length);
        setCharCount(text.length);
    }, [text]);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setIsCopied(true);
        toast({ title: 'Copiado', description: 'El texto ha sido copiado al portapapeles.' });
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleExportPdf = () => {
        if (!text.trim() && !title.trim()) {
            toast({ variant: 'destructive', title: 'Documento Vacío', description: 'No hay nada que exportar.' });
            return;
        }
        try {
            const doc = new jsPDF();
            doc.setFont('Helvetica', 'normal');
            
            doc.setFontSize(24);
            doc.text(title || 'Documento sin título', 20, 30);

            doc.setFontSize(12);
            const margin = 20;
            const pageHeight = doc.internal.pageSize.getHeight();
            const textWidth = doc.internal.pageSize.getWidth() - margin * 2;
            const lines = doc.splitTextToSize(text, textWidth);
            
            let y = 50;
            lines.forEach((line: string) => {
                if (y > pageHeight - margin) {
                    doc.addPage();
                    y = margin;
                }
                doc.text(line, margin, y);
                y += 7; // Line spacing
            });

            doc.save(`${(title || 'documento').replace(/\s/g, '_')}.pdf`);
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error al exportar', description: 'No se pudo generar el PDF.' });
        }
    };
    
    const handleToneChange = (selectedTone: Tone) => {
        setTone(selectedTone);
        // Future logic for AI tone change
    };

    return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="min-h-screen w-full bg-slate-50 font-sans text-slate-900"
        >
            {/* Header */}
            <header className="sticky top-0 z-20 flex h-16 flex-shrink-0 items-center justify-between border-b bg-white/80 backdrop-blur-sm px-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5"/>
                </Button>
                <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-slate-100 to-slate-200 px-3 py-1 text-sm font-medium text-slate-700">
                    ✨ MODO EDITOR
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={handleExportPdf} variant="default">
                        <FileDown className="mr-2 h-4 w-4" />
                        Exportar
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </header>
            
            <main className="p-4 sm:p-8">
                 <div className="mx-auto max-w-4xl">
                     {/* Informative Banner */}
                     <div className="mb-8 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6 text-center shadow-sm border border-slate-200/80">
                        <div className="flex items-center justify-center gap-2">
                            <Sparkles className="h-5 w-5 text-indigo-500"/>
                            <h1 className="text-xl font-bold text-slate-800">
                                Editor Mágico: Tu compañero de redacción
                            </h1>
                        </div>
                        <p className="text-slate-600 mt-1 text-sm">
                            Mejora la coherencia, corrige la gramática y expande tus ideas con un solo clic.
                        </p>
                    </div>

                    {/* Editor Canvas */}
                    <div className="rounded-2xl bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
                         <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Documento sin título..."
                            className="w-full text-3xl font-bold bg-transparent border-none focus:ring-0 focus:outline-none font-serif text-slate-800 p-8 sm:p-12"
                        />
                        <Textarea
                            ref={textareaRef}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Empieza a escribir tu obra maestra aquí..."
                            className="w-full h-auto min-h-[20vh] resize-none p-8 sm:p-12 pt-0 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-slate-700 text-lg leading-relaxed selection:bg-purple-200"
                        />
                         <div className="bg-slate-50/70 border-t border-slate-200/80 px-4 py-2 flex items-center justify-between text-xs text-slate-500 font-mono">
                            <div className="flex items-center gap-4">
                                <span>{wordCount} {wordCount === 1 ? 'palabra' : 'palabras'}</span>
                                <span>{charCount} caracteres</span>
                            </div>
                            <div className="flex items-center gap-2">
                                 <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 text-xs">
                                    {isCopied ? <Check className="h-4 w-4 mr-1 text-green-500"/> : <Copy className="h-3 w-3 mr-1"/>}
                                    Copiar
                                </Button>
                                <Button variant="ghost" size="sm" onClick={handleExportPdf} className="h-7 text-xs">
                                    <FileDown className="h-3 w-3 mr-1"/>
                                    Exportar
                                </Button>
                            </div>
                        </div>
                    </div>
                    
                    <Separator className="my-8" />

                    {/* Power-Ups Section */}
                    <div className="space-y-6">
                        <h3 className="font-semibold text-slate-600 tracking-wide uppercase text-center">Power-Ups de IA</h3>
                        <div className="space-y-4">
                             <PowerUpCard 
                                icon={Wand}
                                title="Perfeccionar Texto"
                                description="Limpieza total de estilo, comas y fluidez."
                                isFeatured
                                isWip
                            />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <PowerUpCard
                                    icon={BookOpen}
                                    title="Resumen Mágico"
                                    description="Genera un resumen ejecutivo del texto."
                                    isWip
                                />
                                 <PowerUpCard
                                    icon={BrainCircuit}
                                    title="Expandir Concepto"
                                    description="Busca datos extra sobre una palabra seleccionada."
                                    isWip
                                />
                                <PowerUpCard
                                    icon={Languages}
                                    title="Traductor Contextual"
                                    description="Traduce fragmentos manteniendo el sentido."
                                    isWip
                                />
                            </div>
                             <Card className="p-4 bg-white col-span-1 md:col-span-2 lg:col-span-1">
                                <Label htmlFor="tone-select" className="text-sm font-semibold text-slate-600">Cambio de Tono</Label>
                                 <div className="flex flex-wrap gap-2 mt-2">
                                   <Button onClick={() => handleToneChange('student')} variant={tone === 'student' ? 'default' : 'outline'} size="sm" className="flex-1">Estudiante</Button>
                                   <Button onClick={() => handleToneChange('academic')} variant={tone === 'academic' ? 'default' : 'outline'} size="sm" className="flex-1">Académico</Button>
                                 </div>
                            </Card>
                        </div>
                    </div>
                 </div>
            </main>
        </motion.div>
    );
}
