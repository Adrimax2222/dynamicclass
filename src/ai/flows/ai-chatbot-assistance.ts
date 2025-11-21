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
  responseLength: z.enum(['short', 'medium', 'long']).optional().describe('Longitud de respuesta deseada (corta, media o larga).'),
  uploadedFiles: z.array(z.string()).optional().describe('Lista de URIs de datos de archivos subidos.'),
  uploadedAudios: z.array(z.string()).optional().describe('Lista de URIs de datos de audios subidos.'),
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
  input: {schema: AIChatbotAssistanceInputSchema},
  output: {schema: AIChatbotAssistanceOutputSchema},
  prompt: `Eres un asistente de chatbot de IA, competente en educación.

Eres entusiasta por ayudar a los estudiantes a aprender.

{% if subject %}Actualmente estás especializado en el tema de {{subject}}.{% endif %}

{% if uploadedFiles.length > 0 %}
Se te han proporcionado los siguientes archivos:
  {{#each uploadedFiles}}
    - {{this}}
  {{/each}}
{% endif %}

{% if uploadedAudios.length > 0 %}
Se te han proporcionado los siguientes archivos de audio:
  {{#each uploadedAudios}}
    - {{this}}
  {{/each}}
{% endif %}

Responde a la siguiente consulta con una respuesta de longitud {{responseLength || 'media'}}:

Consulta: {{{query}}}`,
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
