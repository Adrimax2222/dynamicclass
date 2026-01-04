
'use server';

/**
 * Flujo de IA para el chatbot educativo ADRIMAX AI
 * Usa Gemini 1.5 Flash para respuestas rápidas y precisas
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// ============= SCHEMAS =============

const AIChatbotAssistanceInputSchema = z.object({
  query: z.string().min(1, { message: 'La consulta no puede estar vacía.' }).max(4000, { message: 'La consulta es demasiado larga.' }),
  subject: z.string().optional(),
  responseLength: z.enum(['breve', 'normal', 'detallada']).default('normal'),
  context: z.string().optional(),
});

const AIChatbotAssistanceOutputSchema = z.object({
  response: z.string().describe('La respuesta educativa clara y precisa a la consulta del usuario.'),
});

// ============= TYPES =============

export type AIChatbotAssistanceInput = z.infer<typeof AIChatbotAssistanceInputSchema>;
export type AIChatbotAssistanceOutput = z.infer<typeof AIChatbotAssistanceOutputSchema>;

// ============= PROMPT DEFINITION =============

const assistancePrompt = ai.definePrompt({
  name: 'chatbotAssistancePrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: AIChatbotAssistanceInputSchema },
  output: {
    schema: AIChatbotAssistanceOutputSchema,
  },
  config: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048,
  },
  prompt: `
Eres ADRIMAX AI, un asistente educativo experto, amigable y motivador.

**Tu misión:**
- Explicar conceptos de forma clara y accesible
- Adaptar tu respuesta al nivel del estudiante
- Usar ejemplos prácticos y analogías
- Fomentar el pensamiento crítico
- Ser preciso pero nunca condescendiente

{{#if subject}}
**Tema principal:** {{subject}}
{{/if}}

{{#if context}}
**Contexto de la conversación:**
{{{context}}}
{{/if}}

**Pregunta del estudiante:**
{{{query}}}

**Formato de respuesta:**
Ajusta la longitud según el parámetro "{{responseLength}}":
- Si es "breve": Respuesta concisa (máximo 3 párrafos). Ve directo al punto.
- Si es "detallada": Respuesta completa con explicación profunda, ejemplos prácticos, analogías y ejercicios.
- Si es "normal" o vacío: Respuesta equilibrada y clara.

**Instrucciones importantes:**
1. Usa Markdown para formatear (negritas, listas, código si es necesario)
2. Si la pregunta es ambigua, da la mejor interpretación posible
3. Si no tienes información suficiente, admítelo con honestidad
4. Siempre mantén un tono educativo positivo y motivador
5. Evita jerga innecesaria, pero usa términos técnicos cuando sea apropiado

Proporciona tu respuesta en formato JSON con la clave "response".
`,
});

// ============= MAIN FUNCTION =============

/**
 * Función principal del chatbot educativo
 * Procesa la consulta del estudiante y genera una respuesta con IA
 */
export async function aiChatbotAssistance(
  input: AIChatbotAssistanceInput
): Promise<AIChatbotAssistanceOutput> {
  try {
    const validatedInput = AIChatbotAssistanceInputSchema.parse(input);

    const result = await assistancePrompt(validatedInput);
    const output = result.output();

    if (!output || !output.response) {
      throw new Error('La IA no generó una respuesta válida.');
    }

    return {
      response: output.response.trim(),
    };
  } catch (error) {
    console.error(`❌ Error en aiChatbotAssistance:`, error);

    let userMessage = 'Lo siento, he encontrado un problema al procesar tu solicitud.';
    if (error instanceof z.ZodError) {
        userMessage = 'La consulta no es válida: ' + error.errors[0].message;
    } else if (error instanceof Error) {
        if (error.message.includes('API key') || error.message.includes('API_KEY')) {
            userMessage = 'Error de configuración. Contacta al administrador.';
        } else if (error.message.includes('quota') || error.message.includes('exceeded')) {
            userMessage = 'Se ha alcanzado el límite de uso de la API. Por favor, intenta más tarde.';
        } else if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
            userMessage = 'La solicitud tardó demasiado. Por favor, intenta con una consulta más corta.';
        }
    }
    
    // Devolver siempre una respuesta con el formato esperado
    return {
      response: `${userMessage}\n\n*Si el problema persiste, por favor contacta al soporte técnico.*`,
    };
  }
}

// ============= UTILITY FUNCTIONS =============

/**
 * Verifica que la configuración de la IA esté lista
 * Útil para llamar en el inicio de la aplicación
 */
export async function verifyAISetup(): Promise<{ success: boolean; message: string }> {
  try {
    const testResult = await aiChatbotAssistance({
      query: 'Hola, ¿estás funcionando?',
      responseLength: 'breve',
    });

    if (testResult.response.includes('Error') || testResult.response.includes('problema')) {
      return {
        success: false,
        message: `La IA respondió con un error: ${testResult.response}`,
      };
    }

    return {
      success: true,
      message: 'AI setup verificado correctamente',
    };
  } catch (error) {
    return {
      success: false,
      message: `Error en setup: ${(error as Error).message}`,
    };
  }
}
