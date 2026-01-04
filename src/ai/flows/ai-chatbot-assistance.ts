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
    format: 'json' 
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

{{#if responseLength}}
{{#if (eq responseLength "breve")}}
**Formato:** Respuesta concisa (máximo 3 párrafos). Ve directo al punto.
{{/if}}
{{#if (eq responseLength "detallada")}}
**Formato:** Respuesta completa con:
- Explicación profunda del concepto
- Ejemplos prácticos y aplicaciones reales
- Analogías para facilitar la comprensión
- Ejercicios o preguntas para reflexionar
{{/if}}
{{#if (eq responseLength "normal")}}
**Formato:** Respuesta equilibrada y clara. Explica bien sin extenderte demasiado.
{{/if}}
{{else}}
**Formato:** Respuesta clara y equilibrada.
{{/if}}

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
  
  const startTime = Date.now();
  
  try {
    // 1. Validar entrada
    const validatedInput = AIChatbotAssistanceInputSchema.parse(input);
    
    console.log('📝 Procesando consulta:', {
      queryLength: validatedInput.query.length,
      responseLength: validatedInput.responseLength,
      hasContext: !!validatedInput.context,
      hasSubject: !!validatedInput.subject,
    });

    // 2. Llamar al modelo con retry logic
    let retries = 0;
    const maxRetries = 3;
    let lastError: Error | null = null;

    while (retries < maxRetries) {
      try {
        const result = await assistancePrompt(validatedInput);
        const output = result.output();

        if (!output || !output.response) {
          throw new Error('La IA no generó una respuesta válida (output vacío)');
        }

        const duration = Date.now() - startTime;
        console.log(`✅ Respuesta generada exitosamente en ${duration}ms`);

        return {
          response: output.response.trim(),
        };

      } catch (error) {
        lastError = error as Error;
        retries++;
        
        if (retries < maxRetries) {
          console.warn(`⚠️ Intento ${retries} falló, reintentando...`, error);
          // Espera exponencial: 1s, 2s, 4s
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries - 1)));
        }
      }
    }

    // Si llegamos aquí, todos los reintentos fallaron
    throw lastError || new Error('Error desconocido después de reintentos');

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Error en aiChatbotAssistance después de ${duration}ms:`, error);

    // Determinar mensaje de error específico
    let errorMessage = 'Lo siento, he encontrado un problema al procesar tu solicitud.';

    if (error instanceof z.ZodError) {
      errorMessage = 'La consulta no es válida: ' + error.errors[0].message;
    } else if ((error as Error).message?.includes('API key')) {
      errorMessage = 'Error de configuración: La API key no es válida. Contacta al administrador.';
    } else if ((error as Error).message?.includes('quota')) {
      errorMessage = 'Se ha alcanzado el límite de uso de la API. Por favor, intenta más tarde.';
    } else if ((error as Error).message?.includes('timeout')) {
      errorMessage = 'La solicitud tardó demasiado. Por favor, intenta con una consulta más corta.';
    }

    return {
      response: `${errorMessage}\n\n*Si el problema persiste, por favor contacta al soporte técnico.*`,
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
        message: 'La IA respondió pero con errores',
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