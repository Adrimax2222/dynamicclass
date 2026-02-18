'use server';

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';

// ============= SCHEMAS =============

const AIChatbotAssistanceInputSchema = z.object({
  query: z.string().min(1, 'La consulta no puede estar vacía.').max(4000),
  subject: z.string().optional().describe('El tema de la consulta, por ejemplo, "Matemáticas".'),
  responseLength: z.enum(['breve', 'normal', 'detallada']).default('normal').describe('La longitud deseada para la respuesta de la IA.'),
  context: z.string().optional().describe('El historial de la conversación para dar contexto.'),
});

// This internal schema includes the dynamically generated instruction.
const InternalPromptInputSchema = AIChatbotAssistanceInputSchema.extend({
    lengthInstruction: z.string().describe('La instrucción detallada sobre la longitud de la respuesta.')
});

const AIChatbotAssistanceOutputSchema = z.object({
  response: z.string().describe('La respuesta generada por el asistente de IA.'),
});

export type AIChatbotAssistanceInput = z.infer<typeof AIChatbotAssistanceInputSchema>;
export type AIChatbotAssistanceOutput = z.infer<typeof AIChatbotAssistanceOutputSchema>;


// ============= GENKIT PROMPT =============

const prompt = ai.definePrompt({
    name: 'aiChatbotAssistancePrompt',
    model: googleAI.model('gemini-1.0-pro'),
    input: { schema: InternalPromptInputSchema },
    output: { schema: AIChatbotAssistanceOutputSchema },
    prompt: `Eres ADRIMAX AI, un asistente educativo experto, amigable y motivador.

Tu misión:
- Explicar conceptos de forma clara y accesible
- Adaptar tu respuesta al nivel del estudiante
- Usar ejemplos prácticos y analogías
- Fomentar el pensamiento crítico

{{#if subject}}
Tema: {{{subject}}}
{{/if}}

{{#if context}}
Conversación previa:
{{{context}}}
{{/if}}

Pregunta del estudiante: {{{query}}}

{{{lengthInstruction}}}

Usa Markdown para formatear (negritas, listas, código si es necesario). Mantén un tono educativo positivo.
`,
});


// ============= GENKIT FLOW =============

const aiChatbotAssistanceFlow = ai.defineFlow(
  {
    name: 'aiChatbotAssistanceFlow',
    inputSchema: AIChatbotAssistanceInputSchema,
    outputSchema: AIChatbotAssistanceOutputSchema,
  },
  async (input) => {
    const lengthInstructions = {
      breve: 'Responde de forma concisa en máximo 3 párrafos.',
      normal: 'Responde con una explicación equilibrada y clara.',
      detallada: 'Responde de forma completa con ejemplos, analogías y ejercicios.'
    };
    const instruction = lengthInstructions[input.responseLength];

    const { output } = await prompt({
      ...input,
      lengthInstruction: instruction,
    });
    
    if (!output) {
      throw new Error("La IA no generó una respuesta válida.");
    }
    
    return output;
  }
);

// ============= MAIN FUNCTION =============

export async function aiChatbotAssistance(
  input: AIChatbotAssistanceInput
): Promise<AIChatbotAssistanceOutput> {
  const validatedInput = AIChatbotAssistanceInputSchema.parse(input);
  return aiChatbotAssistanceFlow(validatedInput);
}

// ============= UTILITY =============

export async function verifyAISetup(): Promise<{ success: boolean; message: string }> {
  try {
    const testResult = await aiChatbotAssistance({
      query: 'Hola, ¿estás funcionando?',
      responseLength: 'breve',
    });

    if (!testResult || !testResult.response || testResult.response.includes('Error') || testResult.response.includes('problema')) {
      return {
        success: false,
        message: `La IA respondió con un error: ${testResult?.response || 'respuesta vacía'}`,
      };
    }

    return {
      success: true,
      message: '✅ AI setup verificado correctamente',
    };
  } catch (error: any) {
    console.error(`❌ Error en verifyAISetup:`, error);
    return {
      success: false,
      message: `❌ Error en setup: ${error.message}`,
    };
  }
}
