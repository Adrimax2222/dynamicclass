
"use server";

interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    imageUrl: string;
}

const FALLBACK_NEWS: NewsItem[] = [
    {
      title: "Benvingut a la Comunitat de Dynamic Class",
      link: "#",
      pubDate: "Ara mateix",
      imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Explora els nous recursos i eines d'IA",
      link: "#",
      pubDate: "Recent",
      imageUrl: "https://images.unsplash.com/photo-1508084052338-79138c351053?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Participa en les discussions i ajuda a altres estudiants",
      link: "#",
      pubDate: "Comunitat",
      imageUrl: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
];

export async function getNews(url: string): Promise<NewsItem[]> {
    try {
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, {
            next: { revalidate: 3600 } // Revalidate cada hora
        });

        if (!response.ok) {
            console.error("Failed to fetch RSS feed, returning fallback.");
            return FALLBACK_NEWS;
        }

        const data = await response.json();
        const text = data.contents;
        
        if (!text) {
             console.error("No content in RSS feed response, returning fallback.");
            return FALLBACK_NEWS;
        }

        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'application/xml');
        const items = Array.from(xml.querySelectorAll('item'));

        return items.slice(0, 12).map(item => {
            const title = item.querySelector('title')?.textContent ?? 'Sense títol';
            const link = item.querySelector('link')?.textContent ?? '#';
            const pubDate = item.querySelector('pubDate')?.textContent ?? '';
            
            const imageUrl = item.querySelector('enclosure')?.getAttribute('url') || 
                             item.querySelector('media\\:content')?.getAttribute('url') || 
                             '';

            return { title, link, pubDate, imageUrl };
        });

    } catch (error) {
        console.error("Error processing RSS feed:", error);
        return FALLBACK_NEWS;
    }
}
