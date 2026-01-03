
'use server';

/**
 * @fileOverview AI Chatbot for educational assistance.
 *
 * - aiChatbotAssistance - A function that provides AI chatbot assistance.
 * - AIChatbotAssistanceInput - The input type for the aiChatbotAssistance function.
 * - AIChatbotAssistanceOutput - The return type for the aiChatbotAssistance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIChatbotAssistanceInputSchema = z.object({
  query: z.string().describe('La consulta para el chatbot de IA.'),
  subject: z.string().optional().describe('Materia o tema opcional.'),
  responseLength: z.enum(['breve', 'normal', 'detallada']).optional().describe('La longitud deseada de la respuesta.'),
});
export type AIChatbotAssistanceInput = z.infer<typeof AIChatbotAssistanceInputSchema>;

const AIChatbotAssistanceOutputSchema = z.object({
  response: z.string().describe('La respuesta del chatbot de IA.'),
});
export type AIChatbotAssistanceOutput = z.infer<typeof AIChatbotAssistanceOutputSchema>;

export async function aiChatbotAssistance(input: AIChatbotAssistanceInput): Promise<AIChatbotAssistanceOutput> {
  return aiChatbotAssistanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiChatbotAssistancePrompt',
  model: 'googleai/gemini-1.5-flash',
  input: {schema: AIChatbotAssistanceInputSchema},
  output: {schema: AIChatbotAssistanceOutputSchema},
  prompt: `Eres un asistente de chatbot de IA, competente en educación. Eres entusiasta por ayudar a los estudiantes a aprender.
{{#if subject}}
Actualmente estás especializado en el tema de {{subject}}.
{{/if}}
{{#if responseLength}}
La respuesta debe ser de longitud {{responseLength}}.
{{/if}}
Al responder, formatea el texto para que sea claro y fácil de leer:
- **Usa negrita** para resaltar los conceptos más importantes.
- Estructura la respuesta en **párrafos separados** para no abrumar al usuario.
- No saludes al usuario, ve directamente a la respuesta.

Responde a la siguiente consulta: {{{query}}}`,
});

const aiChatbotAssistanceFlow = ai.defineFlow(
  {
    name: 'aiChatbotAssistanceFlow',
    inputSchema: AIChatbotAssistanceInputSchema,
    outputSchema: AIChatbotAssistanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
