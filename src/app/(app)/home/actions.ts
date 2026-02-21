'use server';

interface ZenQuote {
    q: string; // quote
    a: string; // author
    h: string; // html formatted quote
}

interface MyMemoryResponse {
    responseData: {
        translatedText: string;
    };
}

interface QuoteResponse {
    quote: string;
    author: string;
}

const fallbackQuote: QuoteResponse = {
    quote: "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
    author: "Robert Collier",
};

export async function getQuoteOfTheDay(): Promise<QuoteResponse> {
    try {
        const response = await fetch('https://zenquotes.io/api/today', {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            console.error('Failed to fetch quote from ZenQuotes API, returning fallback.');
            return fallbackQuote;
        }

        const data: ZenQuote[] = await response.json();

        if (!data || data.length === 0) {
            console.error('No quote received from ZenQuotes API, returning fallback.');
            return fallbackQuote;
        }

        const { q, a } = data[0];

        // Now, try to translate the quote
        try {
            const encodedQuote = encodeURIComponent(q);
            const translationUrl = `https://api.mymemory.translated.net/get?q=${encodedQuote}&langpair=en|es`;
            
            const translationResponse = await fetch(translationUrl, {
                next: { revalidate: 3600 } // Cache translation for 1 hour
            });

            if (!translationResponse.ok) {
                // If translation fails, return the original English quote
                console.warn('Translation API failed, returning original quote.');
                return { quote: q, author: a };
            }

            const translationData: MyMemoryResponse = await translationResponse.json();
            const translatedText = translationData.responseData.translatedText;

            if (translatedText) {
                return { quote: translatedText, author: a };
            } else {
                 // If translation response is OK but text is empty, return original
                return { quote: q, author: a };
            }

        } catch (translationError) {
            console.warn('--- TRANSLATION API ERROR ---', translationError);
            // If translation fails for any reason, return the original English quote
            return { quote: q, author: a };
        }

    } catch (error) {
        console.error('--- QUOTE API ERROR ---', error);
        return fallbackQuote;
    }
}
