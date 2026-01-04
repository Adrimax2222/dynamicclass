
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Sigma, GraduationCap, Languages, FileDown, Wand, BrainCircuit, Type, FileSignature, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { cn } from '@/lib/utils';
import { WipDialog } from '@/components/layout/wip-dialog';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

type Tone = 'student' | 'academic' | 'informative';

const PowerUpCard = ({ icon: Icon, title, description, isFeatured = false, isWip = true }: { icon: React.ElementType, title: string, description: string, isFeatured?: boolean, isWip?: boolean }) => {
    const cardContent = (
        <Card className={cn(
            "w-full text-left transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl",
            isFeatured 
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg" 
                : "bg-white hover:bg-slate-50 border-slate-200"
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

    return <button className="w-full">{cardContent}</button>;
};


export default function MagicEditorPage() {
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [wordCount, setWordCount] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
        const words = text.trim().split(/\s+/).filter(Boolean);
        setWordCount(words.length);
    }, [text]);

    const handleExportPdf = () => {
        if (!text.trim() && !title.trim()) {
            toast({ variant: 'destructive', title: 'Documento Vacío', description: 'No hay nada que exportar.' });
            return;
        }
        try {
            const doc = new jsPDF();
            doc.setFont('Inter', 'normal');
            
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
                y += 10;
            });

            doc.save(`${(title || 'documento').replace(/\s/g, '_')}.pdf`);
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error al exportar', description: 'No se pudo generar el PDF.' });
        }
    };


    return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex h-screen w-full flex-col overflow-hidden bg-[#f8fafc] font-sans text-slate-900"
        >
            {/* Header */}
            <header className="flex h-16 flex-shrink-0 items-center justify-between border-b bg-white px-6 py-3">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5"/>
                </Button>
                <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-slate-100 to-slate-200 px-3 py-1 text-sm font-medium text-slate-700">
                    ✨ MODO EDITOR
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={handleExportPdf}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Exportar
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Editor Canvas */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-12">
                     <div className="mx-auto max-w-4xl">
                        <div className="rounded-2xl bg-white p-8 shadow-2xl shadow-slate-200/50 md:p-12">
                             <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Documento sin título..."
                                className="w-full text-3xl font-bold bg-transparent border-none focus:ring-0 focus:outline-none font-serif text-slate-800 mb-8"
                            />
                            <Textarea
                                ref={textareaRef}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Empieza a escribir tu obra maestra aquí..."
                                className="w-full h-full min-h-[60vh] resize-none p-0 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-slate-700 text-lg leading-relaxed selection:bg-purple-200 font-body"
                            />
                        </div>
                     </div>
                </div>

                {/* Power-Ups Sidepanel */}
                <aside className="hidden w-80 flex-shrink-0 border-l bg-white/80 p-6 lg:block">
                     <div className="space-y-6">
                        <h3 className="font-semibold text-slate-600 tracking-wide uppercase">Power-Ups</h3>
                        <div className="space-y-4">
                            <PowerUpCard 
                                icon={Wand}
                                title="Perfeccionar Texto"
                                description="Limpieza total de estilo, comas y fluidez."
                                isFeatured
                            />
                            <PowerUpCard
                                icon={BookOpen}
                                title="Resumen Mágico"
                                description="Genera un resumen ejecutivo del texto."
                            />
                            <PowerUpCard
                                icon={BrainCircuit}
                                title="Expandir Concepto"
                                description="Busca datos extra sobre una palabra seleccionada."
                            />
                            <PowerUpCard
                                icon={Languages}
                                title="Traductor Contextual"
                                description="Traduce fragmentos manteniendo el sentido."
                            />
                        </div>
                    </div>
                </aside>
            </div>
        </motion.div>
    );
}
