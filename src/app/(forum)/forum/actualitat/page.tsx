"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Newspaper } from 'lucide-react';
import { getNews, type NewsItem } from './actions';
import { Skeleton } from '@/components/ui/skeleton';

const territoriOptions = [
    { value: 'catala', label: 'Catalunya' },
    { value: 'barcelona', label: 'Barcelona' },
    { value: 'girona', label: 'Girona' },
    { value: 'lleida', label: 'Lleida' },
    { value: 'tarragona', label: 'Tarragona' },
];

export default function ActualitatPage() {
    const [noticies, setNoticies] = useState<NewsItem[]>([]);
    const [territori, setTerritori] = useState<string>('catala');
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchNoticies = useCallback(async (selectedTerritori: string) => {
        setIsLoading(true);
        const newsData = await getNews(selectedTerritori);
        setNoticies(newsData);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchNoticies(territori);
    }, [territori, fetchNoticies]);
    
    const NewsSkeleton = () => (
        <Card className="h-full flex flex-col overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-1/2 mt-1" />
            </CardHeader>
            <CardFooter>
                 <Skeleton className="h-4 w-1/4" />
            </CardFooter>
        </Card>
    );

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    [...Array(6)].map((_, index) => <NewsSkeleton key={index} />)
                ) : (
                    noticies.map((noticia, index) => (
                        <a key={index} href={noticia.link} target="_blank" rel="noopener noreferrer" className="block">
                            <Card className="h-full flex flex-col overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
                                <CardHeader className="p-0">
                                    <div className="aspect-video relative">
                                        <img 
                                            src={noticia.imageUrl} 
                                            alt={noticia.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.onerror = null;
                                                target.src = 'https://via.placeholder.com/400x225.png?text=Imatge+no+disponible';
                                            }}
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 flex-1">
                                    <h3 className="font-semibold line-clamp-2">{noticia.title}</h3>
                                </CardContent>
                                <CardFooter className="p-4 pt-0">
                                    <p className="text-xs text-muted-foreground">
                                        {noticia.pubDate}
                                    </p>
                                </CardFooter>
                            </Card>
                        </a>
                    ))
                )}
             </div>
        </div>
    );
}
