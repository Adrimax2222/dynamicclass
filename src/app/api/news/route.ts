import { NextRequest, NextResponse } from 'next/server';

interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    imageUrl: string;
}

const FEED_URLS: Record<string, string> = {
    'catala': 'https://www.ccma.cat/multimedia/rss/324/catala/',
    'barcelona': 'https://www.ccma.cat/multimedia/rss/324/barcelona/',
    'girona': 'https://www.ccma.cat/multimedia/rss/324/girona/',
    'lleida': 'https://www.ccma.cat/multimedia/rss/324/lleida/',
    'tarragona': 'https://www.ccma.cat/multimedia/rss/324/tarragona/',
};

// Helper to extract content from an XML tag
function extractContent(xml: string, tag: string): string {
    const match = xml.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tag}>`));
    return match ? match[1].trim() : '';
}

// Helper to extract an attribute from a tag
function extractAttribute(xml: string, tag: string, attr: string): string {
    const match = xml.match(new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`));
    return match ? match[1] : '';
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const territori = searchParams.get('territori') || 'catala';
    const rssUrl = FEED_URLS[territori] || FEED_URLS['catala'];
    const apiUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;

    try {
        const response = await fetch(apiUrl, {
            next: { revalidate: 3600 } // Revalidate cada hora
        });

        if (!response.ok) {
            throw new Error(`Error de xarxa en contactar allorigins: ${response.status}`);
        }

        const data = await response.json();
        const text = data.contents;
        
        if (!text) {
             throw new Error('No s\'ha rebut contingut del servidor de notícies.');
        }

        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        const items = text.match(itemRegex) || [];

        if (items.length === 0) {
            return NextResponse.json([]);
        }

        const newsItems: NewsItem[] = items.slice(0, 12).map((itemXml: string) => {
            const title = extractContent(itemXml, 'title');
            const link = extractContent(itemXml, 'link');
            const pubDate = extractContent(itemXml, 'pubDate');
            
            const imageUrl = extractAttribute(itemXml, 'enclosure', 'url') || 
                             extractAttribute(itemXml, 'media:content', 'url') || 
                             '';

            return { title, link, pubDate, imageUrl };
        });

        return NextResponse.json(newsItems);

    } catch (error) {
        console.error("Error processant el feed RSS:", error);
        // En cas d'error, retorna una llista buida per no trencar el client.
        return NextResponse.json([]);
    }
}
