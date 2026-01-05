"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Wand2, BookText, GraduationCap, Sparkles, Check, 
  Copy, Languages, Download, Share2, Zap, MessageSquare,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Quote, Heading1, Heading2, Code, Link,
  Smile, ImageIcon, Table, Star, Globe, FileDown,
  Text, Pilcrow, Type, Brain, Bug, TextCursorInput
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


const MagicFloatingMenu = ({ 
  isVisible, 
  position 
}: { 
  isVisible: boolean;
  position: { top: number; left: number }; 
}) => {
  if (!isVisible) return null;

  return (
    <div 
      style={{ 
        position: 'fixed',
        top: `${position.top}px`, 
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
        zIndex: 10000
      }}
      className="animate-in fade-in slide-in-from-bottom-2 duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-1 bg-slate-900/80 text-white px-2 py-2 rounded-lg shadow-2xl border border-slate-700 backdrop-blur-sm">
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 h-8 px-3 text-xs">
          <Sparkles className="h-3.5 w-3.5 mr-1.5" />
          Mejorar
        </Button>
        <Separator orientation="vertical" className="h-6 bg-slate-600 mx-1" />
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 h-8 px-3 text-xs">
          <BookText className="h-3.5 w-3.5 mr-1.5" />
          Resumir
        </Button>
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 h-8 px-3 text-xs">
          <GraduationCap className="h-3.5 w-3.5 mr-1.5" />
          Simplificar
        </Button>
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 h-8 px-3 text-xs">
          <Globe className="h-3.5 w-3.5 mr-1.5" />
          Traducir
        </Button>
      </div>
    </div>
  );
};

const ActionCard = ({ 
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
  const [selectedValue, setSelectedValue] = useState('');

  const cardContent = (
    <div className="group bg-white p-4 rounded-2xl border border-slate-200 hover:border-primary/20 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 w-full flex items-center gap-5">
      <div className={cn("p-3 rounded-xl flex-shrink-0 shadow-md", color)}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-slate-900 text-base">{title}</h4>
        <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
      </div>
      <div className="flex-shrink-0">
        {hasSelector && selectorOptions ? (
          <div className="flex gap-2 items-center">
            <Select value={selectedValue} onValueChange={setSelectedValue}>
              <SelectTrigger className="h-9 text-sm w-40">
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
            className="h-9"
            onClick={() => onClick?.()}
          >
            Aplicar
          </Button>
        )}
      </div>
    </div>
  );

  return onClick ? cardContent : <WipDialog>{cardContent}</WipDialog>;
};

export default function MagicEditorPage() {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const { toast } = useToast();

  useEffect(() => {
    // Strip HTML for accurate counts
    const plainText = text.replace(/<[^>]*>?/gm, '');
    const words = plainText.trim().split(/\s+/).filter(Boolean);
    const wordCountValue = words.length === 1 && words[0] === '' ? 0 : words.length;
    
    setWordCount(wordCountValue);
    setCharCount(plainText.length);
    setReadingTime(Math.ceil(wordCountValue / 200));
  }, [text]);

  const handleCopy = () => {
    const plainText = text.replace(/<[^>]*>?/gm, '');
    navigator.clipboard.writeText(plainText);
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
      
      doc.html(text, {
        x: margin,
        y: margin + 15,
        width: pageWidth - (margin * 2),
        windowWidth: pageWidth - (margin * 2),
        callback: (doc) => {
          doc.save(`${title.replace(/\s/g, '_') || 'documento'}.pdf`);
          toast({ title: '✓ Exportado', description: 'Documento guardado como PDF.' });
        }
      });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo exportar el PDF.", variant: "destructive" });
    }
  };

  const handleShare = () => {
    const plainText = text.replace(/<[^>]*>?/gm, '');
    if (navigator.share && plainText) {
      navigator.share({ title: title || 'Mi documento', text: plainText }).catch(() => handleCopy());
    } else {
      handleCopy();
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + rect.width / 2,
      });
      setIsMenuVisible(true);
    } else {
      setIsMenuVisible(false);
    }
  };

  const handleFormatAction = (action: string, value?: string) => {
    const editor = document.getElementById('main-editor');
    if (editor) editor.focus();

    switch(action) {
        case 'bold': document.execCommand('bold', false); break;
        case 'italic': document.execCommand('italic', false); break;
        case 'underline': document.execCommand('underline', false); break;
        case 'list': document.execCommand('insertUnorderedList', false); break;
        case 'orderedList': document.execCommand('insertOrderedList', false); break;
        case 'quote': document.execCommand('formatBlock', false, '<blockquote>'); break;
        case 'formatBlock':
            if (value) document.execCommand('formatBlock', false, `<${value}>`);
            break;
        case 'fontSize':
            if (value) {
                document.execCommand('fontSize', false, value);
                const fontElements = document.getElementById('main-editor')?.getElementsByTagName('font');
                if (fontElements) {
                    for (let i = 0; i < fontElements.length; i++) {
                        const element = fontElements[i];
                        if (element.size) {
                            const newSize = (parseInt(element.size) * 4) + 'px';
                            element.style.fontSize = newSize;
                            element.removeAttribute('size');
                        }
                    }
                }
            }
            break;
        case 'fontName':
            if (value) document.execCommand('fontName', false, value);
            break;
        default: break;
    }
    toast({ title: 'Formato aplicado', description: `Estilo ${action} actualizado.` });
};


  useEffect(() => {
    const handleClickOutside = () => {
      if (isMenuVisible) {
        setTimeout(() => {
            const selection = window.getSelection();
            if (!selection || selection.toString().trim().length === 0) {
                 setIsMenuVisible(false);
            }
        }, 200);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuVisible]);

  const languages = [
    { value: 'es', label: '🇪🇸 Español' },
    { value: 'en', label: '🇬🇧 Inglés' },
    { value: 'fr', label: '🇫🇷 Francés' },
    { value: 'de', label: '🇩🇪 Alemán' },
    { value: 'it', label: '🇮🇹 Italiano' },
    { value: 'pt', label: '🇵🇹 Portugués' },
    { value: 'ca', label: '🏴 Catalán' },
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
    { value: '1', label: '12' },
    { value: '2', label: '14' },
    { value: '3', label: '16' },
    { value: '4', label: '18' },
    { value: '5', label: '24' },
    { value: '6', label: '36' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Header */}
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
        
        {/* Banner */}
        <div className="mb-6 p-6 bg-gradient-to-r from-indigo-500/95 to-purple-600/95 rounded-2xl shadow-lg text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50"></div>
          <div className="relative flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm flex-shrink-0">
              <Wand2 className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold mb-1 font-serif">Modo Escritura Mágica</h2>
              <p className="text-sm text-white/90 leading-relaxed">
                Escribe, edita y da formato con facilidad. Selecciona texto para revelar herramientas de IA o usa las tarjetas de abajo para transformar tu contenido.
              </p>
            </div>
          </div>
        </div>
        
        <MagicFloatingMenu position={menuPosition} isVisible={isMenuVisible} />

        {/* Editor */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200/60 overflow-hidden mb-6">
          {/* Barra de formato */}
           <div className="border-b border-slate-200 px-4 py-2 flex items-center gap-1 bg-slate-50/80 flex-wrap">
             <Select onValueChange={(value) => handleFormatAction('fontSize', value)}>
                <SelectTrigger className="w-[80px] h-8 text-xs font-semibold">
                    <SelectValue placeholder="Tamaño" />
                </SelectTrigger>
                <SelectContent>
                    {fontSizeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select onValueChange={(value) => handleFormatAction('fontName', value)}>
                <SelectTrigger className="w-[140px] h-8 text-xs font-semibold">
                    <SelectValue placeholder="Fuente" />
                </SelectTrigger>
                <SelectContent>
                    {fontOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Negrita" onClick={() => handleFormatAction('bold')}>
              <Bold className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Cursiva" onClick={() => handleFormatAction('italic')}>
              <Italic className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Subrayado" onClick={() => handleFormatAction('underline')}>
              <Underline className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6 mx-1" />
            
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Lista" onClick={() => handleFormatAction('list')}>
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Lista numerada" onClick={() => handleFormatAction('orderedList')}>
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Cita" onClick={() => handleFormatAction('quote')}>
              <Quote className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-8">
            <div 
              id="main-editor"
              contentEditable
              className="w-full min-h-[30vh] max-h-[70vh] p-0 border-none focus:outline-none text-base text-slate-800 leading-relaxed font-serif overflow-y-auto focus-visible:ring-0 focus-visible:ring-offset-0"
              onInput={(e) => setText(e.currentTarget.innerHTML)}
              onMouseUp={handleTextSelection}
            />
          </div>

          {/* Footer Bandeja de Herramientas */}
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

        {/* Herramientas Inteligentes */}
        <div className="space-y-5">
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
            />
            
            <ActionCard
              icon={Wand2}
              title="Cambiar Tono"
              description="Adapta el texto a un tono más informal o creativo."
              color="bg-gradient-to-br from-orange-500 to-orange-600"
            />
            
            <ActionCard
              icon={BookText}
              title="Generar Resumen"
              description="Crea resúmenes personalizados del contenido."
              color="bg-gradient-to-br from-purple-500 to-purple-600"
            />

            <ActionCard
              icon={TextCursorInput}
              title="Continuar Escritura"
              description="La IA continúa el texto donde lo dejaste."
              color="bg-gradient-to-br from-green-500 to-green-600"
            />

            <ActionCard
              icon={Brain}
              title="Simplificar Texto"
              description="Reescribe el texto para que sea más fácil de entender."
              color="bg-gradient-to-br from-teal-500 to-teal-600"
            />

            <ActionCard
              icon={Bug}
              title="Buscar Errores"
              description="Revisa la gramática y ortografía de tu documento."
              color="bg-gradient-to-br from-red-500 to-red-600"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
