
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trash2, FileDown, TextQuote, BookOpen, Scaling, Bot, Wand, Info, Sigma } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WipDialog } from '@/components/layout/wip-dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

type Tone = 'academic' | 'creative' | 'simple';

const BlurryBlob = ({ className, animationDelay }: { className: string, animationDelay: string }) => {
    return (
        <div 
            className={cn("absolute rounded-full mix-blend-hard-light filter blur-3xl opacity-20", className)}
            style={{ animation: `float-blob 20s infinite ease-in-out ${animationDelay}` }}
        />
    )
}

export default function MagicEditorPage() {
    const [text, setText] = useState('');
    const [wordCount, setWordCount] = useState(0);
    const [readingTime, setReadingTime] = useState(0);
    const [tone, setTone] = useState<Tone>('academic');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }

        const words = text.trim().split(/\s+/).filter(Boolean);
        setWordCount(words.length);
        setReadingTime(Math.ceil(words.length / 200));

    }, [text]);

    const handleClearText = () => {
        setText('');
    };

    const handleExportPdf = () => {
        if (!text.trim()) {
            toast({
                variant: 'destructive',
                title: 'Texto Vacío',
                description: 'No hay nada que exportar.'
            });
            return;
        }
        try {
            const doc = new jsPDF();
            doc.setFont('times', 'normal');
            doc.setFontSize(12);
            
            // Set margins
            const margin = 15;
            const pageHeight = doc.internal.pageSize.getHeight();
            const pageWidth = doc.internal.pageSize.getWidth();
            const textWidth = pageWidth - margin * 2;
            
            // Split text into lines that fit the page width
            const lines = doc.splitTextToSize(text, textWidth);
            
            let y = margin;

            lines.forEach((line: string) => {
                if (y > pageHeight - margin) {
                    doc.addPage();
                    y = margin;
                }
                doc.text(line, margin, y);
                y += 7; // Line height
            });

            doc.save('apuntes-magicos.pdf');
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Error al exportar',
                description: 'No se pudo generar el PDF.'
            });
        }
    };
    
    // Placeholder for AI action
    const handlePerfectText = async () => {
       toast({
           title: "✨ Próximamente",
           description: "La función para perfeccionar texto con IA estará disponible pronto."
       });
    };

    return (
        <div className="relative min-h-screen w-full bg-slate-950 overflow-hidden font-sans text-white">
            {/* Blurry Blobs Background */}
            <div className="absolute inset-0 z-0">
                <BlurryBlob className="top-0 left-0 h-96 w-96 bg-purple-600" animationDelay="0s" />
                <BlurryBlob className="bottom-0 right-0 h-96 w-96 bg-indigo-600" animationDelay="5s" />
                <BlurryBlob className="top-1/4 right-1/4 h-80 w-80 bg-pink-600" animationDelay="10s" />
            </div>

            <style jsx global>{`
                @keyframes float-blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -40px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .font-serif {
                    font-family: 'Georgia', 'Times New Roman', serif;
                }
            `}</style>

            <div className="relative z-10 flex h-full min-h-screen">
                <motion.main
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8"
                >
                    <div className="w-full max-w-4xl h-full flex flex-col">
                        {/* Toolbar */}
                         <div className="flex-shrink-0 mb-6 flex items-center justify-between gap-2 p-2 rounded-xl bg-black/10 backdrop-blur-sm border border-white/10">
                            <div className="flex items-center gap-2">
                                <Button onClick={handleClearText} variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
                                    <Trash2 className="h-4 w-4 mr-2" /> Limpiar
                                </Button>
                                <Button onClick={handleExportPdf} variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
                                    <FileDown className="h-4 w-4 mr-2" /> Exportar PDF
                                </Button>
                            </div>
                            <div className="flex items-center gap-2">
                                 <Select value={tone} onValueChange={(value: Tone) => setTone(value)}>
                                    <SelectTrigger className="w-[150px] bg-transparent border-white/20 text-white h-9">
                                        <div className="flex items-center gap-2">
                                            <TextQuote className="h-4 w-4" />
                                            <SelectValue placeholder="Tono" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 text-white border-slate-700">
                                        <SelectItem value="academic">Académico</SelectItem>
                                        <SelectItem value="creative">Creativo</SelectItem>
                                        <SelectItem value="simple">Simple</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Editor Canvas */}
                        <div className="flex-1 flex rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
                            <Textarea
                                ref={textareaRef}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Empieza a escribir tus ideas aquí..."
                                className="w-full h-full resize-none p-8 md:p-12 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-white/90 font-serif text-lg leading-relaxed selection:bg-purple-500/50 caret-purple-400"
                            />
                        </div>

                        {/* Footer */}
                         <div className="flex-shrink-0 mt-4 flex items-center justify-between text-sm text-white/50">
                            <div>
                                <span className="font-semibold">{wordCount}</span> palabras · <span className="font-semibold">{readingTime}</span> min de lectura
                            </div>
                            <Button variant="link" size="sm" asChild>
                                <a href="/home" className="text-white/50 hover:text-white">Volver</a>
                            </Button>
                        </div>
                    </div>
                </motion.main>

                {/* Magic Insights Panel */}
                <aside className="hidden lg:block w-80 flex-shrink-0 p-8">
                     <div className="space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Sparkles className="text-purple-400"/>
                            Magic Insights
                        </h2>
                        
                        <WipDialog>
                          <Card className="bg-white/5 border-white/10 hover:border-white/20 transition-colors cursor-pointer">
                              <CardHeader>
                                  <CardTitle className="text-base flex items-center gap-2 text-purple-300">
                                      <Sigma className="h-5 w-5"/> Corrector Inteligente
                                  </CardTitle>
                              </CardHeader>
                              <CardContent>
                                  <p className="text-xs text-white/60">Resalta sugerencias de gramática y estilo mientras escribes.</p>
                                  <div className="mt-4 text-xs">
                                      <span className="inline-block px-2 py-1 rounded bg-purple-500/20 text-purple-300">próximamente</span>
                                  </div>
                              </CardContent>
                          </Card>
                        </WipDialog>

                        <WipDialog>
                           <Card className="bg-white/5 border-white/10 hover:border-white/20 transition-colors cursor-pointer">
                              <CardHeader>
                                  <CardTitle className="text-base flex items-center gap-2 text-indigo-300">
                                      <BookOpen className="h-5 w-5"/> Resumen Mágico
                                  </CardTitle>
                              </CardHeader>
                              <CardContent>
                                  <p className="text-xs text-white/60">Genera un resumen ejecutivo de tu texto con un solo clic.</p>
                                   <div className="mt-4 text-xs">
                                      <span className="inline-block px-2 py-1 rounded bg-indigo-500/20 text-indigo-300">próximamente</span>
                                  </div>
                              </CardContent>
                          </Card>
                        </WipDialog>

                         <WipDialog>
                           <Card className="bg-white/5 border-white/10 hover:border-white/20 transition-colors cursor-pointer">
                              <CardHeader>
                                  <CardTitle className="text-base flex items-center gap-2 text-pink-300">
                                      <Scaling className="h-5 w-5"/> Expandir Concepto
                                  </CardTitle>
                              </CardHeader>
                              <CardContent>
                                  <p className="text-xs text-white/60">Selecciona una palabra y la IA buscará información relevante.</p>
                                   <div className="mt-4 text-xs">
                                      <span className="inline-block px-2 py-1 rounded bg-pink-500/20 text-pink-300">próximamente</span>
                                  </div>
                              </CardContent>
                          </Card>
                        </WipDialog>
                     </div>
                </aside>
            </div>
            
             {/* Floating Action Button */}
            <div className="absolute bottom-8 right-8 z-20">
                <Button 
                    size="lg"
                    onClick={handlePerfectText}
                    className="rounded-full shadow-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white hover:scale-105 transition-transform"
                >
                    <Wand className="h-5 w-5 mr-2" />
                    Perfeccionar Texto
                </Button>
            </div>
        </div>
    );
}
