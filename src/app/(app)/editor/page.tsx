"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Wand2, BookText, GraduationCap, Globe, Sparkles, Languages, Check, FileDown, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

// Visual Simulation Component for the floating menu
const MagicFloatingMenu = () => {
    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 bg-slate-900 text-white p-2 rounded-2xl shadow-lg">
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
const ActionCard = ({ icon: Icon, title, description, color, isFeatured = false }: { icon: React.ElementType, title: string, description: string, color: string, isFeatured?: boolean }) => {
    return (
        <div className={cn("bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4 transition-all hover:shadow-md hover:-translate-y-0.5", isFeatured && "ring-2 ring-indigo-300/50")}>
            <div className={cn("p-3 rounded-xl", color)}>
                <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
                <h4 className="font-semibold text-slate-800">{title}</h4>
                <p className="text-sm text-slate-500">{description}</p>
            </div>
        </div>
    );
};


export default function MagicEditorPage() {
    const [title, setTitle] = useState('Documento sin título');
    const [text, setText] = useState('');
    const router = useRouter();

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [text]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Cabecera Fija */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-6">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-xl font-serif text-slate-800 bg-transparent focus:outline-none w-80 truncate"
                />
                <Button onClick={() => router.back()} size="sm">
                    Listo
                </Button>
            </header>

            {/* Banner Superior */}
            <div className="w-full text-center py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
                <p className="text-sm font-medium text-indigo-800">
                    ✨ Estás en el Modo Escritura Inteligente. Usa las herramientas para perfeccionar tu texto.
                </p>
            </div>
            
            {/* Contenedor principal con scroll */}
            <main className="flex-1 overflow-y-auto pb-20">
                <div className="max-w-3xl mx-auto w-full mt-4 relative">
                    
                    {/* Simulación del Menú Flotante */}
                    <MagicFloatingMenu />

                    {/* La Hoja */}
                    <div className="bg-white shadow-sm rounded-t-2xl min-h-full">
                        <div className="p-8">
                             {/* Título y cuerpo del texto */}
                            <input 
                                placeholder="Empieza a escribir el título..."
                                className="w-full text-3xl font-bold font-serif text-slate-900 focus:outline-none mb-8 bg-transparent"
                            />
                            <Textarea
                                ref={textareaRef}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Empieza a escribir aquí..."
                                className="w-full resize-none p-0 border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-lg text-slate-800 leading-relaxed"
                            />
                        </div>
                    </div>
                </div>

                {/* Panel de Herramientas Mágicas */}
                <div className="max-w-3xl mx-auto w-full mt-12 px-8">
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