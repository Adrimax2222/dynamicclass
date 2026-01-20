'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, FileText, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const [isBrowser, setIsBrowser] = React.useState(false);

  React.useEffect(() => {
    setIsBrowser(true);
  }, []);
  
  if (!isBrowser) {
    return null;
  }

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="glass-effect relative w-full max-w-sm rounded-2xl p-6 text-foreground shadow-2xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
                scale: 1, 
                opacity: 1,
                rotate: [0, -1, 1, -1, 1, 0],
            }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
                scale: { type: 'spring', stiffness: 400, damping: 25 },
                rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 h-8 w-8 rounded-full"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
            
            <h2 className="text-xl font-bold mb-2">Centro de Ayuda</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Si tienes algún problema o duda, aquí tienes cómo contactarnos.
            </p>

            <div className="space-y-3">
              <a href="https://proyectoadrimax.framer.website/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-white/20">
                <div className="flex items-center gap-4">
                  <Globe className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-semibold">Web Oficial</p>
                    <p className="text-xs text-muted-foreground">Visita nuestra página.</p>
                  </div>
                </div>
              </a>
              <a href="https://form.jotform.com/230622014643040" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-white/20">
                <div className="flex items-center gap-4">
                  <FileText className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-semibold">Formulario de Asistencia</p>
                    <p className="text-xs text-muted-foreground">Para dudas y problemas técnicos.</p>
                  </div>
                </div>
              </a>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <Mail className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-semibold">Correo de Soporte</p>
                    <p className="text-xs text-muted-foreground">info.dynamicclass@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
  
  return createPortal(modalContent, document.body);
}
