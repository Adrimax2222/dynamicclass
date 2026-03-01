import { NextRequest, NextResponse } from 'next/server';

interface Rss2JsonItem {
    title: string;
    link: string;
    pubDate: string;
    enclosure: {
        link: string;
        [key: string]: any;
    };
    thumbnail: string;
}

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

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const territori = searchParams.get('territori') || 'catala';

    const rssUrl = FEED_URLS[territori] || FEED_URLS['catala'];
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

    try {
        const response = await fetch(apiUrl, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            throw new Error(`Error de xarxa: ${response.status}`);
        }

        const data = await response.json();

        if (data.status !== 'ok') {
            throw new Error('La API de notícies ha retornat un error.');
        }

        const newsItems: NewsItem[] = data.items.slice(0, 12).map((item: Rss2JsonItem) => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            imageUrl: item.enclosure?.link || item.thumbnail || '',
        }));

        return NextResponse.json(newsItems);

    } catch (error: any) {
        console.error("Error a l'API de notícies:", error);
        return NextResponse.json({ error: error.message || 'Error de connexió amb el servidor de notícies.' }, { status: 500 });
    }
}
