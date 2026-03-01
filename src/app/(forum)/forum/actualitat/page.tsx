"use client";

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Newspaper } from 'lucide-react';
import Image from 'next/image';

const fakeNews = [
    {
      title: "La sequera a Catalunya obliga a noves restriccions d'aigua a l'àrea de Barcelona.",
      imageUrl: "https://images.unsplash.com/photo-1559336197-ded8aaa24437?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      pubDate: "fa 2 hores",
    },
    {
      title: "El FC Barcelona presenta el nou disseny per al futur Camp Nou.",
      imageUrl: "https://images.unsplash.com/photo-1508084052338-79138c351053?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      pubDate: "fa 5 hores",
    },
    {
      title: "La Generalitat aprova un nou paquet d'ajudes per a joves emprenedors.",
      imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      pubDate: "fa 8 hores",
    },
    {
      title: "Les temperatures d'estiu arriben abans d'hora a la costa catalana.",
      imageUrl: "https://images.unsplash.com/photo-1601042879269-12c4d1d68a96?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      pubDate: "ahir",
    },
    {
      title: "El festival Sónar anuncia el cartell complet per a la seva pròxima edició.",
      imageUrl: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      pubDate: "ahir",
    },
    {
      title: "Descobreixen un nou jaciment romà a les afores de Tarragona.",
      imageUrl: "https://images.unsplash.com/photo-1555538965-055de2d1a387?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      pubDate: "fa 2 dies",
    },
];

const territoriOptions = [
    { value: 'catala', label: 'Catalunya' },
    { value: 'barcelona', label: 'Barcelona' },
    { value: 'girona', label: 'Girona' },
    { value: 'lleida', label: 'Lleida' },
    { value: 'tarragona', label: 'Tarragona' },
];

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {fakeNews.map((noticia, index) => (
                    <a key={index} href="#" target="_blank" rel="noopener noreferrer" className="block">
                        <Card className="h-full flex flex-col overflow-hidden rounded-3xl transition-all hover:-translate-y-1 hover:shadow-lg">
                            <CardHeader className="p-0">
                                <div className="aspect-video relative">
                                    <Image 
                                        src={noticia.imageUrl} 
                                        alt={noticia.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 flex-1">
                                <h3 className="font-semibold line-clamp-2">{noticia.title}</h3>
                            </CardContent>
                            <CardFooter className="p-4 pt-0">
                                <p className="text-xs font-bold text-primary">
                                    {noticia.pubDate}
                                </p>
                            </CardFooter>
                        </Card>
                    </a>
                ))}
             </div>
        </div>
    );
}
