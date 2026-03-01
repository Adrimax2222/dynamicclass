
"use client";

import { useState, useEffect, useMemo, Suspense } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Newspaper, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { getNews } from './actions';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    imageUrl: string;
}

const territoriOptions = [
    { value: 'catala', label: 'Catalunya', url: 'https://www.ccma.cat/multimedia/rss/324/catala/' },
    { value: 'barcelona', label: 'Barcelona', url: 'https://www.ccma.cat/multimedia/rss/324/barcelona/' },
    { value: 'girona', label: 'Girona', url: 'https://www.ccma.cat/multimedia/rss/324/girona/' },
    { value: 'lleida', label: 'Lleida', url: 'https://www.ccma.cat/multimedia/rss/324/lleida/' },
    { value: 'tarragona', label: 'Tarragona', url: 'https://www.ccma.cat/multimedia/rss/324/tarragona/' },
];

function NewsSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="aspect-video bg-muted rounded-t-3xl" />
            <div className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
            </div>
            <div className="p-4 pt-0">
                 <div className="h-3 bg-muted rounded w-1/4" />
            </div>
        </div>
    );
}

function NewsContent({ territori }: { territori: string }) {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const selectedUrl = useMemo(() => {
        return territoriOptions.find(t => t.value === territori)?.url || territoriOptions[0].url;
    }, [territori]);

    useEffect(() => {
        const fetchNews = async () => {
            setIsLoading(true);
            const fetchedNews = await getNews(selectedUrl);
            setNews(fetchedNews);
            setIsLoading(false);
        };
        fetchNews();
    }, [selectedUrl]);
    
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                    <Card key={index} className="rounded-3xl overflow-hidden">
                        <NewsSkeleton />
                    </Card>
                ))}
            </div>
        );
    }
    
    const formatNewsDate = (dateString: string) => {
        if (!dateString) return "Recent";
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: es });
        } catch {
            return "Recent";
        }
    };
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((noticia, index) => (
                <a key={index} href={noticia.link} target="_blank" rel="noopener noreferrer" className="block">
                    <Card className="h-full flex flex-col overflow-hidden rounded-3xl transition-all hover:-translate-y-1 hover:shadow-lg">
                        <div className="aspect-video relative overflow-hidden">
                            {noticia.imageUrl ? (
                                <Image 
                                    src={noticia.imageUrl} 
                                    alt={noticia.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                                    <Newspaper className="h-12 w-12 text-white/50" />
                                </div>
                            )}
                        </div>
                        <CardContent className="p-4 flex-1">
                            <h3 className="font-semibold line-clamp-2">{noticia.title}</h3>
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                            <p className="text-xs font-bold text-primary">
                                {formatNewsDate(noticia.pubDate)}
                            </p>
                        </CardFooter>
                    </Card>
                </a>
            ))}
         </div>
    )
}

export default function ActualitatPage() {
    const [territori, setTerritori] = useState<string>('catala');

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-8 bg-gray-50 pb-40">
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
                    <SelectTrigger className="w-full max-w-xs rounded-xl bg-background border-border/50">
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

            <Suspense fallback={
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, index) => (
                        <Card key={index} className="rounded-3xl overflow-hidden">
                            <NewsSkeleton />
                        </Card>
                    ))}
                </div>
            }>
                <NewsContent territori={territori} />
            </Suspense>
        </div>
    );
}
