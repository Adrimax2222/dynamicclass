
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Sparkles, BookText, GraduationCap, Globe, Languages, Wand2, FileDown, 
  Copy, Check, File as FileIcon, Trash2, RotateCw, Crop, Palette, X, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Menú flotante que aparece al seleccionar texto
const MagicFloatingMenu = ({ isVisible, position }: { isVisible: boolean; position: { top: number; left: number; }}) => {
  if (!isVisible) {
    return null;
  }
  
  return (
    <div
      className="fixed z-50 transition-opacity duration-300"
      style={{ top: `${position.top}px`, left: `${position.left}px`, transform: 'translateX(-50%)' }}
    >
       <div className="flex items-center gap-1 rounded-full bg-slate-900/80 p-1.5 shadow-2xl backdrop-blur-md border border-slate-700">
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
    </div>
  );
};


// Tarjeta de herramienta mejorada
const AIToolCard = ({ 
  icon: Icon, 
  title, 
  description, 
  color, 
  onClick,
  hasSelector,
  selectorOptions,
  selectorPlaceholder
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
  color: string; 
  onClick?: (value?: string) => void;
  hasSelector?: boolean;
  selectorOptions?: { value: string; label: string }[];
  selectorPlaceholder?: string;
}) => {
  const [selectedValue, setSelectedValue] = useState<string>('');

  return (
    <div className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-primary/20 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col">
      <div className="flex items-start gap-4 mb-4">
        <div className={cn("p-3 rounded-xl flex-shrink-0 shadow-md transition-transform group-hover:scale-110", color)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h4 className="font-bold text-slate-900 text-base mb-1">{title}</h4>
        </div>
      </div>
      
      <div className="flex-grow">
          <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-100">
        {hasSelector && selectorOptions ? (
          <div className="flex gap-2">
            <Select value={selectedValue} onValueChange={setSelectedValue}>
              <SelectTrigger className="h-9 text-sm flex-1">
                <SelectValue placeholder={selectorPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {selectorOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value} className="text-sm">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              size="sm" 
              className="h-9 px-4"
              onClick={() => onClick?.(selectedValue)}
              disabled={!selectedValue}
            >
              Aplicar
            </Button>
          </div>
        ) : (
          <Button 
            size="sm" 
            className="h-9 w-full"
            onClick={() => onClick?.()}
          >
            Aplicar
          </Button>
        )}
      </div>
    </div>
  );
};


export default function MagicEditorPage() {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 10,
        left: rect.left + rect.width / 2,
      });
      setIsMenuVisible(true);
    } else {
      setIsMenuVisible(false);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      setIsMenuVisible(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
    const words = text.trim().split(/\s+/).filter(Boolean);
    const wordCountValue = words.length === 1 && words[0] === '' ? 0 : words.length;
    setWordCount(wordCountValue);
    setCharCount(text.length);
  }, [text]);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast({ title: '✓ Copiado', description: 'El texto ha sido copiado al portapapeles.' });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      
      const content = `${title}\n\n${text}`;
      const lines = doc.splitTextToSize(content, 180);
      doc.text(lines, 15, 20);
      
      doc.save(`${title.replace(/\s/g, '_') || 'documento'}.pdf`);
      toast({ title: '✓ Exportado', description: 'Tu documento se ha guardado como PDF.' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'No se pudo exportar el documento.', variant: 'destructive' });
    }
  };
  
  const languages = [
    { value: 'es', label: '🇪🇸 Español' },
    { value: 'en', label: '🇬🇧 Inglés' },
    { value: 'fr', label: '🇫🇷 Francés' },
    { value: 'de', label: '🇩🇪 Alemán' },
    { value: 'it', label: '🇮🇹 Italiano' },
    { value: 'pt', label: '🇵🇹 Portugués' },
    { value: 'ca', label: '🏴 Catalán' },
  ];

  const tones = [
    { value: 'formal', label: 'Formal y profesional' },
    { value: 'casual', label: 'Casual y amigable' },
    { value: 'academic', label: 'Académico y técnico' },
    { value: 'creative', label: 'Creativo y original' },
    { value: 'persuasive', label: 'Persuasivo y convincente' },
  ];

  const summaryTypes = [
    { value: 'short', label: 'Resumen corto (3-4 líneas)' },
    { value: 'medium', label: 'Resumen medio (1 párrafo)' },
    { value: 'detailed', label: 'Resumen detallado' },
    { value: 'bullets', label: 'Puntos clave' },
  ];

  const handleAIAction = (action: string, value?: string) => {
    const message = value ? `${action} (${value})` : action;
    toast({ 
      title: '🎨 Función en desarrollo', 
      description: `"${message}" estará disponible pronto.` 
    });
  };

  return (
    <div className="min-h-screen bg-slate-50" onMouseUp={handleMouseUp}>
        <MagicFloatingMenu isVisible={isMenuVisible} position={menuPosition} />
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
            <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título del documento"
                  className="text-2xl font-serif text-slate-800 bg-transparent focus:outline-none w-full p-2 border-2 border-indigo-500/50 rounded-lg h-12 focus:ring-2 focus:ring-indigo-500/50"
                />
                <Button onClick={handleExportPDF} size="lg" className="h-12 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-md hover:shadow-lg transition-shadow">
                    <FileDown className="h-5 w-5 mr-2" />
                    Exportar
                </Button>
            </div>
        </header>

        <main className="max-w-3xl mx-auto w-full px-4 sm:px-6">
            <div className="mt-8 mb-6 p-6 bg-gradient-to-r from-indigo-500/95 to-purple-600/95 rounded-2xl shadow-xl text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50"></div>
                <div className="relative z-10 text-center">
                    <h2 className="text-2xl font-bold mb-1 font-serif">Modo Escritura Mágica</h2>
                    <p className="text-sm text-white/90 max-w-lg mx-auto">
                        Usa las herramientas de IA para refinar, resumir o traducir tu texto. Selecciona cualquier palabra para empezar.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-t-2xl shadow-lg border-x border-t border-slate-200/80 overflow-hidden">
                <div className="p-8 sm:p-12">
                     <Textarea
                        ref={textareaRef}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Empieza a escribir aquí..."
                        className="w-full resize-none p-0 border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-lg text-slate-800 leading-relaxed min-h-[40vh] bg-transparent font-serif"
                    />
                </div>
            </div>
            
            <div className="sticky bottom-0 z-30">
                <div className="h-4 bg-gradient-to-b from-white/0 via-slate-50/80 to-slate-50"></div>
                <div className="bg-white/80 backdrop-blur-md rounded-b-2xl border-x border-b border-slate-200/80 shadow-lg p-3 flex items-center justify-between text-sm text-slate-600">
                    <div className="flex items-center gap-4">
                        <span><strong className="text-slate-800">{wordCount}</strong> palabras</span>
                        <span><strong className="text-slate-800">{charCount}</strong> caracteres</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8">
                            {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleExportPDF} className="h-8">
                            <FileDown className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </main>
        
        <section className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-12">
            <div className="space-y-6">
                 <h3 className="text-lg font-bold text-slate-800 text-center">Herramientas Inteligentes</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <AIToolCard
                        icon={Wand2}
                        title="Perfeccionar Texto"
                        description="Mejora la gramática, claridad y estilo de tu escritura."
                        color="bg-gradient-to-br from-green-500 to-green-600"
                        onClick={() => handleAIAction('Mejorar escritura')}
                    />
                    <AIToolCard
                        icon={BookText}
                        title="Generar Resumen"
                        description="Crea resúmenes personalizados del contenido."
                        color="bg-gradient-to-br from-blue-500 to-blue-600"
                        hasSelector
                        selectorOptions={summaryTypes}
                        selectorPlaceholder="Tipo de resumen"
                        onClick={(value) => handleAIAction('Resumen', value)}
                    />
                    <AIToolCard
                        icon={GraduationCap}
                        title="Tono Académico"
                        description="Adapta el texto para un entorno formal y académico."
                        color="bg-gradient-to-br from-red-500 to-red-600"
                        onClick={() => handleAIAction('Tono Académico')}
                    />
                    <AIToolCard
                        icon={Languages}
                        title="Traducir Texto"
                        description="Traduce instantáneamente a cualquier idioma."
                        color="bg-gradient-to-br from-sky-500 to-sky-600"
                        hasSelector
                        selectorOptions={languages}
                        selectorPlaceholder="Selecciona idioma"
                        onClick={(value) => handleAIAction('Traducir', value)}
                    />
                     <AIToolCard
                        icon={Wand2}
                        title="Cambiar Tono"
                        description="Ajusta el estilo y personalidad de tu texto."
                        color="bg-gradient-to-br from-purple-500 to-purple-600"
                        hasSelector
                        selectorOptions={tones}
                        selectorPlaceholder="Selecciona tono"
                        onClick={(value) => handleAIAction('Cambiar tono', value)}
                    />
                    <AIToolCard
                        icon={Sparkles}
                        title="Expandir Texto"
                        description="Desarrolla tus ideas con mayor profundidad y detalle."
                        color="bg-gradient-to-br from-orange-500 to-orange-600"
                        onClick={() => handleAIAction('Expandir texto')}
                    />
                 </div>
            </div>
        </section>
    </div>
  );
}
