'use server';

interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    imageUrl: string;
}

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


export async function getNews(url: string): Promise<NewsItem[]> {
    try {
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, {
            next: { revalidate: 3600 } // Revalidate cada hora
        });

        if (!response.ok) {
            throw new Error('Error de connexió amb el servidor de notícies.');
        }

        const data = await response.json();
        const text = data.contents;
        
        if (!text) {
             throw new Error('No s\'ha rebut contingut del servidor de notícies.');
        }

        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        const items = text.match(itemRegex) || [];

        if (items.length === 0) {
            return [];
        }

        return items.slice(0, 12).map((itemXml: string) => {
            const title = extractContent(itemXml, 'title');
            const link = extractContent(itemXml, 'link');
            const pubDate = extractContent(itemXml, 'pubDate');
            
            const imageUrl = extractAttribute(itemXml, 'enclosure', 'url') || 
                             extractAttribute(itemXml, 'media:content', 'url') || 
                             '';

            return { title, link, pubDate, imageUrl };
        });

    } catch (error) {
        console.error("Error processing RSS feed:", error);
        // Propagate the error to be handled by the client component
        throw new Error('Error de connexió amb el servidor de notícies.');
    }
}
