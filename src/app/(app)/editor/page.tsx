"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Wand2, BookText, GraduationCap, Sparkles, Check, 
  Copy, Languages, Download, Share2, Zap, MessageSquare,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Quote, Heading1, Heading2, Code, Link,
  Smile, ImageIcon, Table, Star, Globe, FileDown,
  Text, Pilcrow, Type, Brain, Bug, TextCursorInput,
  Loader2, ChevronsUpDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WipDialog } from '@/components/layout/wip-dialog';
import { processEditorAction, type EditorActionInput } from './actions';


const ActionCard = ({
  icon: Icon,
  title,
  description,
  color,
  onClick,
  action,
  isProcessing,
  hasSelector,
  selectorOptions,
  selectorPlaceholder,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  onClick: (actionType: EditorActionInput['actionType'], option?: string) => void;
  action: EditorActionInput['actionType'];
  isProcessing: boolean;
  hasSelector?: boolean;
  selectorOptions?: { value: string; label: string }[];
  selectorPlaceholder?: string;
}) => {
  const [selectedValue, setSelectedValue] = useState("");

  return (
    <div className="group bg-white p-4 rounded-2xl border border-slate-200 hover:border-primary/20 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 w-full flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className={cn("p-3 rounded-xl flex-shrink-0 shadow-md", color)}>
            <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col gap-1">
            <h4 className="font-bold text-slate-900 text-base">{title}</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              {description}
            </p>
        </div>
      </div>
      
      <div className="flex-shrink-0">
        {hasSelector && selectorOptions ? (
          <div className="flex items-center gap-2">
            <Select value={selectedValue} onValueChange={setSelectedValue}>
              <SelectTrigger className="h-9 text-sm w-40">
                <SelectValue placeholder={selectorPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {selectorOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-sm">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              className="h-9 px-4"
              onClick={() => onClick(action, selectedValue)}
              disabled={isProcessing || !selectedValue}
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Aplicar'}
            </Button>
          </div>
        ) : (
          <Button size="sm" className="h-9 px-4" onClick={() => onClick(action)} disabled={isProcessing}>
             {isProcessing ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Aplicar'}
          </Button>
        )}
      </div>
    </div>
  );
};


export default function MagicEditorPage() {
  const [title, setTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [fontSize, setFontSize] = useState('16');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();
  
  useEffect(() => {
    const text = editorRef.current?.innerText || '';
    const words = text.trim().split(/\s+/).filter(Boolean);
    const wordCountValue = words.length === 1 && words[0] === '' ? 0 : words.length;
    
    setWordCount(wordCountValue);
    setCharCount(text.length);
    setReadingTime(Math.ceil(wordCountValue / 200));
  }, [editorContent]);
  
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== editorContent) {
        editorRef.current.innerHTML = editorContent;
    }
  }, [editorContent]);


  const handleCopy = () => {
    const text = editorRef.current?.innerText || '';
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast({ title: '✓ Copiado', description: 'Texto copiado al portapapeles.' });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleExport = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(title || 'Documento sin título', margin, margin);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const text = editorRef.current?.innerText || '';
      const splitText = doc.splitTextToSize(text, pageWidth - (margin * 2));
      doc.text(splitText, margin, margin + 15);

      doc.save(`${title.replace(/\s/g, '_') || 'documento'}.pdf`);
      toast({ title: '✓ Exportado', description: 'Documento guardado como PDF.' });

    } catch (error) {
      toast({ title: "Error", description: "No se pudo exportar el PDF.", variant: "destructive" });
    }
  };

  const handleShare = () => {
    const text = editorRef.current?.innerText || '';
    if (navigator.share && text) {
      navigator.share({ title: title || 'Mi documento', text: text }).catch(() => handleCopy());
    } else {
      handleCopy();
    }
  };

  const handleAiAction = async (actionType: EditorActionInput['actionType'], option?: string) => {
    const text = editorRef.current?.innerText || '';
    if (!text.trim() || isProcessing) return;

    setIsProcessing(true);
    toast({ title: 'Procesando con IA...', description: 'Tu texto está siendo mejorado.' });

    try {
        const result = await processEditorAction({
            text: text,
            actionType,
            option,
        });

        if (result && result.processedText) {
            setEditorContent(result.processedText);
            if (editorRef.current) {
                editorRef.current.innerHTML = result.processedText;
            }
            toast({ title: '¡Texto mejorado!', description: 'La IA ha procesado tu solicitud.' });
        } else {
             throw new Error("La IA no devolvió un resultado válido.");
        }

    } catch (error) {
        console.error('AI Action Failed:', error);
        toast({ title: 'Error de IA', description: 'No se pudo procesar la solicitud.', variant: 'destructive' });
    } finally {
        setIsProcessing(false);
    }
};

  const languages = [
    { value: 'Español', label: '🇪🇸 Español' },
    { value: 'Inglés', label: '🇬🇧 Inglés' },
    { value: 'Francés', label: '🇫🇷 Francés' },
    { value: 'Alemán', label: '🇩🇪 Alemán' },
    { value: 'Italiano', label: '🇮🇹 Italiano' },
    { value: 'Portugués', label: '🇵🇹 Portugués' },
    { value: 'Catalán', label: '🏴 Catalán' },
  ];
  
  const fontOptions = [
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Verdana, sans-serif', label: 'Verdana' },
    { value: '"Times New Roman", serif', label: 'Times New Roman' },
    { value: 'Garamond, serif', label: 'Garamond' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: '"Courier New", monospace', label: 'Courier New' },
    { value: '"Trebuchet MS", sans-serif', label: 'Trebuchet MS' }
  ];
  
 const fontSizeOptions = [
    { value: '12', label: '12' },
    { value: '14', label: '14' },
    { value: '16', label: '16' },
    { value: '18', label: '18' },
    { value: '24', label: '24' },
    { value: '36', label: '36' },
  ];

  const toneOptions = [
    { value: 'informal', label: 'Informal' },
    { value: 'profesional', label: 'Profesional' },
    { value: 'creativo', label: 'Creativo' },
    { value: 'academico', label: 'Académico' },
  ];

  const summaryOptions = [
    { value: 'puntos-clave', label: 'Puntos Clave' },
    { value: 'un párrafo corto', label: 'Párrafo Corto' },
    { value: 'resumen-extenso', label: 'Resumen Extenso' },
  ];

  const continuationOptions = [
    { value: 'un párrafo', label: 'Un párrafo' },
    { value: 'varios-parrafos', label: 'Varios párrafos' },
    { value: 'completar-idea', label: 'Completar idea' },
  ];

  const simplificationOptions = [
      { value: 'para un niño de 10 años', label: 'Para un niño' },
      { value: 'lenguaje más sencillo', label: 'Lenguaje sencillo' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md flex-shrink-0">
              <Wand2 className="h-4 w-4 text-white" />
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título"
              className="text-lg font-semibold text-slate-800 bg-transparent focus:outline-none rounded-lg px-3 py-1.5 transition-colors flex-1 min-w-0 h-10 border-0 focus:ring-0"
            />
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="ghost" size="sm" onClick={handleShare} className="h-10 hidden sm:flex">
              <Share2 className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Compartir</span>
            </Button>
            <Button onClick={handleExport} size="sm" className="h-10 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-transform hover:-translate-y-px">
              <FileDown className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Exportar PDF</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-6">
        
        <div className="mb-6 p-6 bg-gradient-to-r from-indigo-500/95 to-purple-600/95 rounded-2xl shadow-lg text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50"></div>
          <div className="relative flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm flex-shrink-0">
              <Wand2 className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold mb-1 font-serif">Modo Escritura Mágica</h2>
              <p className="text-sm text-white/90 leading-relaxed">
                Escribe, edita y da formato con facilidad. Utiliza las tarjetas de abajo para transformar tu contenido con IA.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg border border-slate-200/60 overflow-hidden mb-6">
          <div className="p-8">
             <div
              ref={editorRef}
              contentEditable={!isProcessing}
              onInput={(e) => setEditorContent(e.currentTarget.innerHTML)}
              className="w-full min-h-[30vh] max-h-[70vh] p-0 border-none focus:outline-none text-base text-slate-800 leading-relaxed font-serif overflow-y-auto"
              suppressContentEditableWarning={true}
              dangerouslySetInnerHTML={{ __html: editorContent }}
              placeholder="Empieza a escribir tu obra maestra..."
            />
          </div>

          <div className="border-t border-slate-200 px-6 py-3 flex items-center justify-between bg-slate-50/80 flex-wrap gap-4">
            <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold">{wordCount}</span>
                <span>palabras</span>
              </div>
              <Separator orientation="vertical" className="h-3" />
              <div className="flex items-center gap-1.5">
                <span className="font-semibold">{charCount}</span>
                <span>caracteres</span>
              </div>
              <Separator orientation="vertical" className="h-3" />
              <div className="flex items-center gap-1.5">
                <MessageSquare className="h-3 w-3" />
                <span>{readingTime} min lectura</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy} className="h-8 text-xs">
                {isCopied ? (
                  <>
                    <Check className="h-3 w-3 mr-1.5 text-green-500" />
                    <span className="text-green-600">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1.5" />
                    Copiar
                  </>
                )}
              </Button>
              <Button onClick={handleExport} size="sm" variant="outline" className="h-8 text-xs">
                <FileDown className="h-3.5 w-3.5 mr-1.5" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            <h3 className="text-base font-bold text-slate-800 uppercase tracking-wide">
              Herramientas Inteligentes
            </h3>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
             <ActionCard
              icon={Languages}
              title="Traducir Texto"
              description="Traduce instantáneamente a cualquier idioma."
              color="bg-gradient-to-br from-blue-500 to-blue-600"
              hasSelector
              selectorOptions={languages}
              selectorPlaceholder="Selecciona idioma"
              onClick={handleAiAction}
              action="translate"
              isProcessing={isProcessing}
            />
            
            <ActionCard
              icon={Wand2}
              title="Cambiar Tono"
              description="Adapta el texto a un tono más informal o creativo."
              color="bg-gradient-to-br from-orange-500 to-orange-600"
              hasSelector
              selectorOptions={toneOptions}
              selectorPlaceholder="Elige un tono"
              onClick={handleAiAction}
              action="tone"
              isProcessing={isProcessing}
            />
            
            <ActionCard
              icon={BookText}
              title="Generar Resumen"
              description="Crea resúmenes personalizados del contenido."
              color="bg-gradient-to-br from-purple-500 to-purple-600"
              hasSelector
              selectorOptions={summaryOptions}
              selectorPlaceholder="Tipo de resumen"
              onClick={handleAiAction}
              action="summarize"
              isProcessing={isProcessing}
            />

            <ActionCard
              icon={TextCursorInput}
              title="Continuar Escritura"
              description="La IA continúa el texto donde lo dejaste."
              color="bg-gradient-to-br from-green-500 to-green-600"
              hasSelector
              selectorOptions={continuationOptions}
              selectorPlaceholder="Longitud"
              onClick={handleAiAction}
              action="continue"
              isProcessing={isProcessing}
            />

            <ActionCard
              icon={Brain}
              title="Simplificar Texto"
              description="Reescribe el texto para que sea más fácil de entender."
              color="bg-gradient-to-br from-teal-500 to-teal-600"
              hasSelector
              selectorOptions={simplificationOptions}
              selectorPlaceholder="Nivel de simpleza"
              onClick={handleAiAction}
              action="simplify"
              isProcessing={isProcessing}
            />

            <ActionCard
              icon={Bug}
              title="Buscar Errores"
              description="Revisa la gramática y ortografía de tu documento."
              color="bg-gradient-to-br from-red-500 to-red-600"
              onClick={handleAiAction}
              action="fix"
              isProcessing={isProcessing}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
