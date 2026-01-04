'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AIChatbotAssistanceInputSchema = z.object({
  query: z.string().min(1),
  subject: z.string().optional(),
  responseLength: z.enum(['breve', 'normal', 'detallada']).optional(),
  context: z.string().optional(),
});

const AIChatbotAssistanceOutputSchema = z.object({
  response: z.string(),
});

export async function aiChatbotAssistance(input: any) {
  try {
    const validatedInput = AIChatbotAssistanceInputSchema.parse(input);
    
    // Ejecución directa para evitar fallos de definición de prompt en caliente
    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: `Eres ADRIMAX AI, un asistente educativo. Responde a: ${validatedInput.query}`,
    });

    return { response: response.text };
  } catch (error) {
    console.error('Error en el flujo:', error);
    return {
      response: 'Lo siento, he encontrado un problema al procesar tu solicitud.'
    };
  }
}
