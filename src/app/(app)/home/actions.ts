'use server';

interface Quote {
    q: string; // quote
    a: string; // author
    h: string; // html formatted quote
}

interface QuoteResponse {
    quote: string;
    author: string;
}

export async function getQuoteOfTheDay(): Promise<QuoteResponse> {
    try {
        const response = await fetch('https://zenquotes.io/api/today', {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            throw new Error('Failed to fetch quote from ZenQuotes API.');
        }

        const data: Quote[] = await response.json();

        if (!data || data.length === 0) {
            throw new Error('No quote received from the API.');
        }

        const { q, a } = data[0];

        return { quote: q, author: a };

    } catch (error) {
        console.error('--- QUOTE API ERROR ---', error);
        throw new Error('Could not retrieve the quote of the day.');
    }
}
