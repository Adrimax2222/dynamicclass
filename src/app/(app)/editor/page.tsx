"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Wand2, BookText, GraduationCap, Globe, Sparkles, Languages, Check, FileDown, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';

// Visual Simulation Component for the floating menu
const MagicFloatingMenu = ({ position, isVisible }: { position: { top: number; left: number }, isVisible: boolean }) => {
    return (
        <div 
            style={{ 
                top: `${position.top}px`, 
                left: `${position.left}px`,
                display: isVisible ? 'flex' : 'none'
            }}
            className="absolute z-50 items-center gap-1 bg-slate-800/50 text-white p-2 rounded-2xl shadow-lg backdrop-blur-sm transition-opacity"
        >
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-8 w-8">
                <Sparkles className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-8 w-8">
                <BookText className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-8 w-8">
                <GraduationCap className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-8 w-8">
                <Globe className="h-4 w-4" />
            </Button>
        </div>
    );
};


// Action Card Component for the bottom tools
const ActionCard = ({ icon: Icon, title, description, color, isFeatured = false, onClick }: { icon: React.ElementType, title: string, description: string, color: string, isFeatured?: boolean, onClick?: () => void }) => {
    return (
        <button onClick={onClick} className={cn(
            "text-left bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4 transition-all hover:shadow-md hover:-translate-y-0.5 w-full",
            isFeatured && "ring-2 ring-indigo-300/50"
        )}>
            <div className={cn("p-3 rounded-xl", color)}>
                <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
                <h4 className="font-semibold text-slate-800">{title}</h4>
                <p className="text-sm text-slate-500">{description}</p>
            </div>
        </button>
    );
};


export default function MagicEditorPage() {
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [wordCount, setWordCount] = useState(0);
    const [charCount, setCharCount] = useState(0);
    const [isCopied, setIsCopied] = useState(false);
    
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    const router = useRouter();
    const { toast } = useToast();

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const editorContainerRef = useRef<HTMLDivElement>(null);

    // Auto-resize textarea and calculate stats
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
        toast({ title: '¡Copiado!', description: 'El texto ha sido copiado al portapapeles.' });
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleExport = () => {
        try {
            const doc = new jsPDF();
            doc.text(text, 10, 10);
            doc.save(`${title.replace(/\s/g, '_') || 'documento'}.pdf`);
            toast({ title: '¡Exportado!', description: 'Tu documento ha sido exportado como PDF.' });
        } catch (error) {
            console.error("Error exporting to PDF:", error);
            toast({ title: "Error", description: "No se pudo exportar el documento.", variant: "destructive" });
        }
    };
    
    const handleMouseUp = () => {
        const selection = window.getSelection();
        if (selection && selection.toString().trim().length > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            const containerRect = editorContainerRef.current?.getBoundingClientRect();
            if (!containerRect) return;

            setMenuPosition({
                top: rect.bottom + window.scrollY - containerRect.top,
                left: rect.left + rect.width / 2 - containerRect.left,
            });
            setIsMenuVisible(true);
        } else {
            setIsMenuVisible(false);
        }
    };

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isMenuVisible) {
                setIsMenuVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuVisible]);


    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Cabecera Fija */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 h-20 flex items-center justify-between px-6 gap-4">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Documento sin Título"
                    className="text-xl font-serif text-slate-800 bg-transparent focus:outline-none w-full max-w-md truncate rounded-lg px-3 py-1.5 h-9 border-2 border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500/50"
                />
                <Button onClick={handleExport} size="sm">
                    <FileDown className="h-4 w-4 mr-2" />
                    Exportar
                </Button>
            </header>
            
            {/* Contenedor principal con scroll */}
            <main className="flex-1 overflow-y-auto pb-20">
                <div className="max-w-3xl mx-auto w-full mt-8 relative px-4" ref={editorContainerRef} onMouseUp={handleMouseUp}>
                    
                    {/* Banner Superior */}
                    <div className="w-full text-center p-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl shadow-lg mb-8 text-white">
                        <h2 className="text-xl font-bold flex items-center justify-center gap-2">
                            <Sparkles className="h-5 w-5" />
                            Modo Escritura Mágica
                        </h2>
                        <p className="text-sm opacity-80 mt-1">Usa las herramientas de IA para perfeccionar tu texto.</p>
                    </div>

                    {/* Menú Flotante */}
                    <MagicFloatingMenu position={menuPosition} isVisible={isMenuVisible} />

                    {/* La Hoja */}
                    <div className="bg-white shadow-lg rounded-2xl">
                        <div className="p-8">
                             {/* Título y cuerpo del texto */}
                            <input 
                                placeholder="Título"
                                className="w-full text-3xl font-bold font-serif text-slate-900 focus:outline-none mb-8 bg-transparent"
                            />
                            <Textarea
                                ref={textareaRef}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Empieza a escribir aquí..."
                                className="w-full resize-none p-0 border-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none text-lg text-slate-800 leading-relaxed min-h-[20vh]"
                            />
                        </div>

                         {/* Bandeja de Herramientas */}
                        <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-slate-200 p-2 flex items-center justify-between rounded-b-2xl">
                           <div className="flex items-center gap-4 text-sm text-slate-500">
                                <span className="pl-2">{wordCount} palabras</span>
                                <Separator orientation="vertical" className="h-4" />
                                <span>{charCount} caracteres</span>
                           </div>
                           <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={handleCopy}>
                                    {isCopied ? <Check className="h-4 w-4 mr-2 text-green-500"/> : <Copy className="h-4 w-4 mr-2" />}
                                    Copiar
                                </Button>
                                <Button variant="ghost" size="sm" onClick={handleExport}>
                                    <FileDown className="h-4 w-4 mr-2" />
                                    Exportar
                                </Button>
                           </div>
                        </div>
                    </div>
                </div>

                {/* Panel de Herramientas Mágicas */}
                <div className="max-w-3xl mx-auto w-full mt-12 px-4">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Herramientas Recomendadas</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <ActionCard
                            icon={Wand2}
                            title="Perfeccionar Escritura"
                            description="Corrige gramática, estilo y fluidez con un clic."
                            color="bg-indigo-500"
                            isFeatured
                        />
                        <ActionCard
                            icon={BookText}
                            title="Resumen Ejecutivo"
                            description="Crea un resumen conciso de tu texto."
                            color="bg-blue-500"
                        />
                        <ActionCard
                            icon={GraduationCap}
                            title="Elevar Nivel Académico"
                            description="Adapta el texto a un tono más formal y riguroso."
                            color="bg-purple-500"
                        />
                         <ActionCard
                            icon={Languages}
                            title="Cambiar Tono"
                            description="Adapta el texto a un tono más informal o creativo."
                            color="bg-orange-500"
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
