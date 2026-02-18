'use server';

/**
 * @fileOverview Generador de Flashcards de alto rendimiento.
 */

import {ai} from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import {z} from 'genkit';

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
  hint: z.string().describe('Información clave para el campo "Para Recordar".'),
});

const GenerateFlashcardsOutputSchema = z.object({
  flashcards: z.array(FlashcardSchema).describe('Lista de tarjetas generadas.'),
});

export type GenerateFlashcardsOutput = z.infer<typeof GenerateFlashcardsOutputSchema>;

export async function generateFlashcards(input: GenerateFlashcardsInput): Promise<GenerateFlashcardsOutput> {
  return generateFlashcardsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFlashcardsPrompt',
  model: googleAI.model('gemini-1.0-pro'), 
  input: {schema: GenerateFlashcardsInputSchema},
  output: {schema: GenerateFlashcardsOutputSchema},
  prompt: `
    Actúa como un tutor experto. Tu misión es transformar la conversación en un set de estudio eficaz.
    
    REGLAS:
    1. Extrae los conceptos más importantes del chat.
    2. Crea tarjetas con preguntas claras y respuestas que ayuden a entender el "por qué" de las cosas.
    3. Para el campo 'hint', genera una pista mnemotécnica o un dato curioso que ayude al estudiante cuando pulse "Repasar".
    
    HISTORIAL A ANALIZAR:
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
