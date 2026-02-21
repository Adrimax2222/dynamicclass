
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertTriangle, BookMarked } from 'lucide-react';
import { getQuoteOfTheDay } from '@/app/(app)/home/actions';

interface QuoteData {
    quote: string;
    author: string;
}

export function QuotePill() {
    const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchQuote = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const data = await getQuoteOfTheDay();
                setQuoteData(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load quote.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuote();
    }, []);

    const toggleOpen = () => {
        if (!isLoading && !error) {
            setIsOpen(prev => !prev);
        }
    };
    
    return (
        <div className="relative">
            <Button
                variant="outline"
                className="h-7 rounded-full bg-blue-100/60 border-blue-500/20 text-blue-600 dark:bg-blue-900/40 dark:border-blue-500/30 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-xs px-3"
                onClick={toggleOpen}
                disabled={isLoading}
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <>
                        <BookMarked className="h-4 w-4 mr-2" />
                        Frase del Día
                    </>
                )}
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="absolute top-full mt-2 w-full max-w-sm rounded-lg border bg-background p-4 shadow-lg z-10"
                    >
                        {error ? (
                            <div className="flex items-center gap-2 text-sm text-destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <span>{error}</span>
                            </div>
                        ) : quoteData ? (
                            <figure>
                                <blockquote className="italic text-foreground">
                                    “{quoteData.quote}”
                                </blockquote>
                                <figcaption className="mt-2 text-right text-sm font-semibold text-muted-foreground">
                                    — {quoteData.author}
                                </figcaption>
                            </figure>
                        ) : null}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
    