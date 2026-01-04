
'use server';

/**
 * @fileOverview Flujo de IA para el chatbot de asistencia educativa.
 * Exporta la función `aiChatbotAssistance` que interactúa con el modelo de IA.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Esquema de entrada para la función del chatbot.
const AIChatbotAssistanceInputSchema = z.object({
  query: z.string().min(1, { message: 'La consulta no puede estar vacía.' }),
  subject: z.string().optional(),
  responseLength: z.enum(['breve', 'normal', 'detallada']).optional(),
  context: z.string().optional(),
});

// Esquema de salida que la IA debe seguir.
const AIChatbotAssistanceOutputSchema = z.object({
  response: z.string().describe('La respuesta directa a la consulta del usuario.'),
});

// Tipos inferidos de los esquemas para uso en TypeScript.
export type AIChatbotAssistanceInput = z.infer<typeof AIChatbotAssistanceInputSchema>;
export type AIChatbotAssistanceOutput = z.infer<typeof AIChatbotAssistanceOutputSchema>;

// Prompt de Genkit que define la interacción con el modelo de IA.
const assistancePrompt = ai.definePrompt({
    name: 'chatbotAssistancePrompt',
    // Usamos el modelo gemini-1.5-flash para un balance óptimo entre coste y rendimiento.
    model: 'googleai/gemini-1.5-flash',
    input: { schema: AIChatbotAssistanceInputSchema },
    output: { schema: AIChatbotAssistanceOutputSchema },
    // El prompt usa la sintaxis de Handlebars para inyectar los datos de entrada.
    prompt: `
        Eres un asistente educativo claro, preciso y amigable llamado ADRIMAX AI.
        Tu misión es ayudar a estudiantes a entender conceptos complejos de forma sencilla.

        {{#if subject}}
        El tema principal de la consulta es: {{subject}}.
        {{/if}}

        {{#if context}}
        Contexto adicional de la conversación:
        {{{context}}}
        {{/if}}

        Pregunta del alumno:
        {{{query}}}

        {{#if responseLength}}
            {{#if (eq responseLength "breve")}}
            Por favor, proporciona una respuesta concisa y directa.
            {{/if}}
            {{#if (eq responseLength "detallada")}}
            Ofrece una respuesta con explicaciones profundas, ejemplos y analogías.
            {{/if}}
            {{#if (eq responseLength "normal")}}
            Da una respuesta equilibrada, clara y fácil de entender.
            {{/if}}
        {{else}}
            Da una respuesta equilibrada y clara.
        {{/if}}
    `,
});

/**
 * Función principal (Server Action) que se invoca desde el cliente.
 * Orquesta la llamada al prompt de la IA y maneja los errores.
 */
export async function aiChatbotAssistance(
  input: AIChatbotAssistanceInput
): Promise<AIChatbotAssistanceOutput> {
  try {
    // 1. Validamos la entrada usando el esquema de Zod.
    const validatedInput = AIChatbotAssistanceInputSchema.parse(input);

    // 2. Invocamos el prompt de Genkit con la entrada validada.
    const result = await assistancePrompt(validatedInput);
    const output = result.output();

    // 3. Si no hay salida, lanzamos un error.
    if (!output) {
      throw new Error('La IA no generó una respuesta válida.');
    }

    // 4. Devolvemos la salida, que ya cumple con el esquema de Zod.
    return output;

  } catch (error) {
    console.error('❌ Error en el flujo de aiChatbotAssistance:', error);
    // En caso de error, devolvemos una respuesta controlada para el usuario.
    return {
      response:
        'Lo siento, he encontrado un problema al procesar tu solicitud. Por favor, revisa la configuración o inténtalo de nuevo.',
    };
  }
}
