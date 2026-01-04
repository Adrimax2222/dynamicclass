
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Sigma, GraduationCap, Languages, FileDown, Wand, BrainCircuit, Type, FileSignature } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { cn } from '@/lib/utils';
import { WipDialog } from '@/components/layout/wip-dialog';
import { Label } from '@/components/ui/label';

type Tone = 'student' | 'academic' | 'informative';

// Component for each Power-Up button
const PowerUpButton = ({ icon: Icon, title, description, isFeatured = false, onClick }: { icon: React.ElementType, title: string, description: string, isFeatured?: boolean, onClick?: () => void }) => (
    <WipDialog>
        <button 
            onClick={onClick}
            className={cn(
                "w-full text-left p-4 rounded-lg border transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl",
                isFeatured 
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg" 
                    : "bg-white hover:bg-slate-50 border-slate-200"
            )}
        >
            <div className="flex items-center gap-3 mb-1">
                <div className={cn("p-1.5 rounded-md", isFeatured ? "bg-white/20" : "bg-slate-100")}>
                    <Icon className={cn("h-5 w-5", isFeatured ? "text-white" : "text-slate-600")} />
                </div>
                <h4 className="font-semibold">{title}</h4>
            </div>
            <p className={cn("text-xs", isFeatured ? "text-white/80" : "text-slate-500")}>{description}</p>
        </button>
    </WipDialog>
);

export default function MagicEditorPage() {
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [wordCount, setWordCount] = useState(0);
    const [readability, setReadability] = useState<'Baja' | 'Media' | 'Alta'>('Baja');
    const [tone, setTone] = useState<Tone>('student');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { toast } = useToast();

    // Auto-resize textarea and calculate stats
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }

        const words = text.trim().split(/\s+/).filter(Boolean);
        setWordCount(words.length);

        // Simple readability logic
        if (words.length > 200) setReadability('Alta');
        else if (words.length > 50) setReadability('Media');
        else setReadability('Baja');

    }, [text]);

    const handleExportPdf = () => {
        if (!text.trim()) {
            toast({ variant: 'destructive', title: 'Texto Vacío', description: 'No hay nada que exportar.' });
            return;
        }
        try {
            const doc = new jsPDF();
            doc.setFont('times', 'normal');
            
            // Title
            doc.setFontSize(22);
            doc.text(title || 'Documento sin título', 15, 20);

            // Body
            doc.setFontSize(12);
            const margin = 15;
            const pageHeight = doc.internal.pageSize.getHeight();
            const pageWidth = doc.internal.pageSize.getWidth();
            const textWidth = pageWidth - margin * 2;
            const lines = doc.splitTextToSize(text, textWidth);
            
            let y = 40;
            lines.forEach((line: string) => {
                if (y > pageHeight - margin) {
                    doc.addPage();
                    y = margin;
                }
                doc.text(line, margin, y);
                y += 8; // Line height
            });

            doc.save(`${(title || 'documento').replace(/\s/g, '_')}.pdf`);
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error al exportar', description: 'No se pudo generar el PDF.' });
        }
    };

    const handleToneChange = (newTone: Tone) => {
        setTone(newTone);
        toast({ title: 'Tono Cambiado', description: `El tono se ha ajustado a: ${newTone}` });
    };

    return (
        <div className="min-h-screen w-full bg-slate-50 font-sans text-slate-900">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="p-4 sm:p-8 space-y-6"
            >
                {/* Header Banner */}
                <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-100 p-6 text-center shadow-sm">
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
                        ✨ Editor Mágico: <span className="text-indigo-600">Tu compañero de redacción</span>
                    </h1>
                    <p className="text-slate-600 mt-1">
                        Mejora la coherencia, corrige gramática y expande tus ideas con un solo clic.
                    </p>
                </div>
                
                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* Writing Canvas */}
                    <div className="lg:col-span-2 space-y-4">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Documento sin título..."
                            className="w-full text-4xl font-bold bg-transparent border-none focus:ring-0 focus:outline-none font-serif text-slate-800"
                        />
                        <Card className="shadow-xl rounded-xl">
                            <div className="p-8 sm:p-12">
                                <Textarea
                                    ref={textareaRef}
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Empieza a escribir tu obra maestra aquí..."
                                    className="w-full h-full min-h-[50vh] resize-none p-0 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-slate-700 text-lg leading-relaxed selection:bg-purple-200"
                                />
                            </div>
                        </Card>
                    </div>

                    {/* Power-Ups Sidepanel */}
                    <aside className="space-y-4 sticky top-8">
                        <h3 className="font-semibold text-slate-500 tracking-wider uppercase">Power-Ups</h3>
                        <PowerUpButton 
                            icon={Wand}
                            title="Perfeccionar Texto"
                            description="Limpieza total de estilo, comas y fluidez."
                            isFeatured
                        />
                        <PowerUpButton
                            icon={BookOpen}
                            title="Explicar Concepto"
                            description="Añade una nota al pie con la definición de una palabra."
                        />
                         <PowerUpButton
                            icon={BrainCircuit}
                            title="Generar Esquema"
                            description="Crea una lista de puntos clave basada en el texto."
                        />
                        <PowerUpButton
                            icon={Languages}
                            title="Traductor Contextual"
                            description="Traduce fragmentos manteniendo el sentido académico."
                        />
                        <Card className="p-4 bg-white">
                            <Label htmlFor="tone-select" className="text-sm font-semibold text-slate-600">Cambio de Tono</Label>
                             <div className="flex gap-2 mt-2">
                               <Button onClick={() => handleToneChange('student')} variant={tone === 'student' ? 'default' : 'outline'} size="sm" className="flex-1">Estudiante</Button>
                               <Button onClick={() => handleToneChange('academic')} variant={tone === 'academic' ? 'default' : 'outline'} size="sm" className="flex-1">Académico</Button>
                               <Button onClick={() => handleToneChange('informative')} variant={tone === 'informative' ? 'default' : 'outline'} size="sm" className="flex-1">Divulgativo</Button>
                            </div>
                        </Card>
                    </aside>
                </div>
            </motion.div>

            {/* Floating Format Toolbar */}
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: text ? 0 : 100, opacity: text ? 1 : 0 }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                className="sticky bottom-4 mx-auto w-fit"
            >
                <Card className="flex items-center gap-6 p-2 px-4 rounded-full shadow-2xl border-slate-200">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Type className="h-4 w-4"/>
                        <span className="font-semibold">{wordCount}</span> palabras
                    </div>
                     <div className="flex items-center gap-2 text-sm text-slate-600">
                        <div className={cn(
                            "h-2 w-2 rounded-full",
                            readability === 'Alta' && 'bg-green-500',
                            readability === 'Media' && 'bg-yellow-500',
                            readability === 'Baja' && 'bg-red-500',
                        )} />
                        <span>Legibilidad:</span>
                        <span className="font-semibold">{readability}</span>
                    </div>
                    <Button onClick={handleExportPdf} variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                        <FileDown className="h-4 w-4 mr-2" /> Exportar PDF
                    </Button>
                </Card>
            </motion.div>
        </div>
    );
}
