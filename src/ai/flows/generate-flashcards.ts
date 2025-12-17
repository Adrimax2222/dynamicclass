
'use server';

/**
 * @fileOverview Generates flashcards from a chat history.
 *
 * - generateFlashcards - A function that takes a chat history and returns a list of flashcards.
 * - GenerateFlashcardsInput - The input type for the generateFlashcards function.
 * - GenerateFlashcardsOutput - The return type for the generateFlashcards function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateFlashcardsInputSchema = z.object({
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })).describe('El historial de la conversación del chat.'),
});
export type GenerateFlashcardsInput = z.infer<typeof GenerateFlashcardsInputSchema>;

const FlashcardSchema = z.object({
  question: z.string().describe('La pregunta o el anverso de la tarjeta.'),
  answer: z.string().describe('La respuesta o el reverso de la tarjeta.'),
});

const GenerateFlashcardsOutputSchema = z.object({
  flashcards: z.array(FlashcardSchema).describe('Una lista de tarjetas didácticas generadas a partir del chat.'),
});
export type GenerateFlashcardsOutput = z.infer<typeof GenerateFlashcardsOutputSchema>;

export async function generateFlashcards(input: GenerateFlashcardsInput): Promise<GenerateFlashcardsOutput> {
  return generateFlashcardsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFlashcardsPrompt',
  model: 'googleai/gemini-pro',
  input: {schema: GenerateFlashcardsInputSchema},
  output: {schema: GenerateFlashcardsOutputSchema},
  prompt: `
    Analiza el siguiente historial de chat y extrae los conceptos clave, definiciones y preguntas importantes.
    Genera una lista de tarjetas didácticas (flashcards) basadas en esta información. Cada tarjeta debe tener una pregunta clara y una respuesta concisa.
    Concéntrate en la información educativa y omite los saludos o conversaciones triviales.

    Historial del Chat:
    {{#each chatHistory}}
      {{role}}: {{{content}}}
    {{/each}}
  `,
});

const generateFlashcardsFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFlow',
    inputSchema: GenerateFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
