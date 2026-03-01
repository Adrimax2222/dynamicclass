"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Newspaper, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Noticia {
    title: string;
    pubDate: string;
    link: string;
    enclosure: {
        link: string;
    };
    description: string;
}

const territoriOptions = [
    { value: 'catala', label: 'Catalunya' },
    { value: 'barcelona', label: 'Barcelona' },
    { value: 'girona', label: 'Girona' },
    { value: 'lleida', label: 'Lleida' },
    { value: 'tarragona', label: 'Tarragona' },
];

export default function ActualitatPage() {
    const [noticies, setNoticies] = useState<Noticia[]>([]);
    const [territori, setTerritori] = useState<string>('catala');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNoticies = useCallback(async (territori: string) => {
        setIsLoading(true);
        setError(null);
        setNoticies([]);
        try {
            const rssFeedUrl = `https://www.ccma.cat/multimedia/rss/324/${territori}/`;
            const apiUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssFeedUrl)}`;
            
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('No s\'ha pogut carregar les notícies.');
            }
            
            const data = await response.json();
             if (!data.contents) {
                throw new Error('La resposta de l\'API no té contingut.');
            }
            
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data.contents, "application/xml");
            const items = xmlDoc.querySelectorAll("item");

            if (items.length === 0) {
                 setNoticies([]);
                 return;
            }

            const parsedNoticies: Noticia[] = Array.from(items).map(item => {
                const enclosure = item.querySelector("enclosure");
                const imageUrl = enclosure ? enclosure.getAttribute("url") || '' : '';

                const descriptionHtml = item.querySelector("description")?.textContent || '';
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = descriptionHtml;
                const descriptionText = tempDiv.textContent || tempDiv.innerText || "";


                return {
                    title: item.querySelector("title")?.textContent || 'Sense títol',
                    pubDate: item.querySelector("pubDate")?.textContent || new Date().toISOString(),
                    link: item.querySelector("link")?.textContent || '#',
                    enclosure: {
                        link: imageUrl
                    },
                    description: descriptionText
                };
            });

            setNoticies(parsedNoticies);

        } catch (err) {
            console.error("Fetch error: ", err);
            setError(err instanceof Error ? err.message : 'Un error desconegut ha ocorregut.');
        } finally {
            setIsLoading(false);
        }
    }, []);


    useEffect(() => {
        fetchNoticies(territori);
    }, [territori, fetchNoticies]);
    
    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tighter flex items-center justify-center gap-3">
                    Actualitat <span className="text-primary">⚡</span>
                </h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    L'última hora a Catalunya en un minut.
                </p>
            </div>

            <div className="flex justify-center">
                 <Select onValueChange={setTerritori} defaultValue={territori}>
                    <SelectTrigger className="w-full max-w-xs rounded-xl bg-muted/50 border-border/50">
                        <SelectValue placeholder="Selecciona un territori" />
                    </SelectTrigger>
                    <SelectContent>
                        {territoriOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {isLoading && (
                <div className="flex flex-col items-center justify-center text-center p-12 space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="font-semibold">Carregant notícies...</p>
                </div>
            )}
            
            {error && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, index) => (
                           <Card key={index} className="h-full flex flex-col overflow-hidden animate-pulse">
                                <div className="aspect-video relative bg-muted" />
                                <div className="p-4 flex-1">
                                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                                    <div className="h-4 bg-muted rounded w-full" />
                                </div>
                                <div className="p-4 pt-0">
                                     <div className="h-3 bg-muted rounded w-1/4" />
                                </div>
                            </Card>
                        ))}
                    </div>
                     <div className="text-center mt-8">
                        <Button onClick={() => fetchNoticies(territori)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            Reintentar
                        </Button>
                    </div>
                </>
            )}

            {!isLoading && !error && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {noticies.map((noticia, index) => (
                        <a key={index} href={noticia.link} target="_blank" rel="noopener noreferrer" className="block">
                            <Card className="h-full flex flex-col overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
                                <CardHeader className="p-0">
                                    <div className="aspect-video relative">
                                        <img 
                                            src={noticia.enclosure.link} 
                                            alt={noticia.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 flex-1">
                                    <h3 className="font-semibold line-clamp-2">{noticia.title}</h3>
                                </CardContent>
                                <CardFooter className="p-4 pt-0">
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(noticia.pubDate), { addSuffix: true, locale: es })}
                                    </p>
                                </CardFooter>
                            </Card>
                        </a>
                    ))}
                 </div>
            )}
        </div>
    );
}
