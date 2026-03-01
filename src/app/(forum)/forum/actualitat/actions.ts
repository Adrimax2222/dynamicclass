'use server';

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    imageUrl: string;
    description: string;
}

const parseXML = (xmlString: string): NewsItem[] => {
    try {
        const items = xmlString.split('<item>').slice(1);
        return items.map(item => {
            const titleMatch = item.match(/<title><!\[CDATA\[(.*?)]]><\/title>/s);
            const linkMatch = item.match(/<link>(.*?)<\/link>/s);
            const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/s);
            const enclosureMatch = item.match(/<enclosure.*?url="(.*?)"/s);
            const descriptionMatch = item.match(/<description><!\[CDATA\[(.*?)]]><\/description>/s);

            // Clean up description
            let description = '';
            if (descriptionMatch && descriptionMatch[1]) {
                const tempDiv = `<div>${descriptionMatch[1]}</div>`;
                // This is a simplified server-side way; ideally, use a library if available.
                description = tempDiv.replace(/<[^>]*>?/gm, '').trim();
            }
            
            const pubDate = pubDateMatch ? new Date(pubDateMatch[1]) : new Date();

            return {
                title: titleMatch ? titleMatch[1] : 'Sense títol',
                link: linkMatch ? linkMatch[1] : '#',
                pubDate: formatDistanceToNow(pubDate, { addSuffix: true, locale: es }),
                imageUrl: enclosureMatch ? enclosureMatch[1] : 'https://via.placeholder.com/400x225.png?text=Sense+Imatge',
                description: description
            };
        });
    } catch (error) {
        console.error("Error parsing XML:", error);
        return [];
    }
};

const getFallbackNews = (): NewsItem[] => {
    return [
        {
            title: "Benvingut a Dynamic Class",
            link: "https://dynamicclass.app",
            pubDate: "fa uns segons",
            imageUrl: "https://framerusercontent.com/images/wnf3W920QzNmsS575YQww1kIhLU.png",
            description: "Explora totes les eines que tenim per a tu. Si el servei de notícies no respon, és possible que estigui en manteniment."
        },
        {
            title: "Organitza el teu estudi",
            link: "/study",
            pubDate: "fa un minut",
            imageUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1973&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            description: "Utilitza el nostre 'Modo Estudio' amb temporitzador pomodoro, música i eines per maximitzar la teva concentració."
        },
        {
            title: "Necessites ajuda?",
            link: "/forum/ayuda",
            pubDate: "fa dos minuts",
            imageUrl: "https://images.unsplash.com/photo-1559825481-12a05cc00344?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            description: "Visita el nostre centre d'ajuda o contacta amb nosaltres si trobes algun error o tens suggeriments."
        }
    ];
};

export async function getNews(territori: string): Promise<NewsItem[]> {
    const rssFeedUrl = `https://www.ccma.cat/multimedia/rss/324/${territori}/`;
    
    try {
        const response = await fetch(rssFeedUrl, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });
        
        if (!response.ok) {
            console.error(`Error fetching RSS feed: ${response.status}`);
            return getFallbackNews();
        }
        
        const xmlString = await response.text();
        const news = parseXML(xmlString);
        
        if (news.length === 0) {
            return getFallbackNews();
        }
        
        return news;
    } catch (error) {
        console.error('Failed to fetch or parse news:', error);
        return getFallbackNews();
    }
}
