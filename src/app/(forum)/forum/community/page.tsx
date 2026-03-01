"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { 
    Users, 
    Newspaper, 
    MessageSquare, 
    BookCopy, 
    Star, 
    Wrench, 
    Sparkles, 
    HelpCircle 
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const communitySections = [
    {
        href: "/forum/actualitat",
        icon: Newspaper,
        title: "Actualitat",
        description: "Notícies de Catalunya en temps real per estar sempre informat.",
        isWip: false,
    },
    {
        href: "/forum/discussions",
        icon: MessageSquare,
        title: "Discussions",
        description: "Inicia debats, fes preguntes i participa en converses sobre qualsevol tema.",
        isWip: true,
    },
    {
        href: "/forum/resources",
        icon: BookCopy,
        title: "Recursos",
        description: "Accedeix a la guia completa de recursos públics per a estudiants de la Generalitat.",
        isWip: false,
    },
    {
        href: "/forum/valoracion",
        icon: Star,
        title: "Valoracions",
        description: "Llegeix les opinions d'altres usuaris i comparteix la teva experiència amb l'app.",
        isWip: false,
    },
    {
        href: "/forum/recursos-dc",
        icon: Wrench,
        title: "Dynamic Class",
        description: "Reporta errors, suggereix millores i ajuda'ns a construir una millor aplicació per a tots.",
        isWip: false,
    },
    {
        href: "/forum/ia",
        icon: Sparkles,
        title: "Eines IA",
        description: "Explora el directori més complet d'eines d'Intel·ligència Artificial gratuïtes.",
        isWip: false,
    },
    {
        href: "/forum/ayuda",
        icon: HelpCircle,
        title: "Ajuda",
        description: "Troba respostes a les teves preguntes o contacta directament amb el nostre equip de suport.",
        isWip: false,
    },
];

export default function CommunityPage() {
    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-8">
            <div className="text-center space-y-2">
                <Users className="mx-auto h-12 w-12 text-primary" />
                <h1 className="text-3xl font-bold font-headline tracking-tight">Fòrum de la Comunitat</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">Un espai per connectar, aprendre i compartir amb altres estudiants de Dynamic Class.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {communitySections.map((section) => {
                    const Icon = section.icon;
                    return (
                        <Link href={section.href} key={section.title} className="flex">
                            <Card className="w-full hover:bg-muted/50 hover:border-primary/20 transition-colors cursor-pointer flex flex-col">
                                <CardHeader className="flex-row items-start gap-4 space-y-0">
                                    <div className="p-3 bg-primary/10 rounded-lg">
                                        <Icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            {section.title}
                                            {section.isWip && <Badge variant="secondary">Pròximament</Badge>}
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1">
                                     <CardDescription>{section.description}</CardDescription>
                                </CardContent>
                            </Card>
                        </Link>
                    )
                })}
            </div>
        </div>
    );
}
