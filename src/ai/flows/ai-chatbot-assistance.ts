'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

// Validar API key
const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_KEY;
if (!apiKey) {
  throw new Error('GOOGLE_GENAI_API_KEY no está configurada');
}

// Inicializar Google AI
const genAI = new GoogleGenerativeAI(apiKey);

// ============= SCHEMAS =============

const AIChatbotAssistanceInputSchema = z.object({
  query: z.string().min(1).max(4000),
  subject: z.string().optional(),
  responseLength: z.enum(['breve', 'normal', 'detallada']).default('normal'),
  context: z.string().optional(),
});

const AIChatbotAssistanceOutputSchema = z.object({
  response: z.string(),
});

export type AIChatbotAssistanceInput = z.infer<typeof AIChatbotAssistanceInputSchema>;
export type AIChatbotAssistanceOutput = z.infer<typeof AIChatbotAssistanceOutputSchema>;

// ============= MAIN FUNCTION =============

export async function aiChatbotAssistance(
  input: AIChatbotAssistanceInput
): Promise<AIChatbotAssistanceOutput> {
  try {
    const validatedInput = AIChatbotAssistanceInputSchema.parse(input);

    // Construir el prompt
    let prompt = `Eres ADRIMAX AI, un asistente educativo experto, amigable y motivador.

Tu misión:
- Explicar conceptos de forma clara y accesible
- Adaptar tu respuesta al nivel del estudiante
- Usar ejemplos prácticos y analogías
- Fomentar el pensamiento crítico

`;

    if (validatedInput.subject) {
      prompt += `Tema: ${validatedInput.subject}\n\n`;
    }

    if (validatedInput.context) {
      prompt += `Conversación previa:\n${validatedInput.context}\n\n`;
    }

    prompt += `Pregunta del estudiante: ${validatedInput.query}\n\n`;

    const lengthInstructions = {
      breve: 'Responde de forma concisa en máximo 3 párrafos.',
      normal: 'Responde con una explicación equilibrada y clara.',
      detallada: 'Responde de forma completa con ejemplos, analogías y ejercicios.'
    };

    prompt += lengthInstructions[validatedInput.responseLength] + '\n\n';
    prompt += 'Usa Markdown para formatear (negritas, listas, código si es necesario). Mantén un tono educativo positivo.';

    // Llamar a la API de Gemini
    const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash-latest' });
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    if (!text || text.trim() === '') {
      throw new Error('La IA no generó una respuesta válida.');
    }

    return {
      response: text.trim(),
    };
  } catch (error) {
    // Log the full error for server-side debugging
    console.error(`❌ Error en aiChatbotAssistance:`, error);
    
    // Throw the original error message to be displayed on the client for better debugging
    if (error instanceof Error) {
        throw new Error(error.message);
    }
    
    // Fallback for non-Error objects
    throw new Error('Lo siento, he encontrado un problema al procesar tu solicitud.');
  }
}

// ============= UTILITY =============

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
      message: '✅ AI setup verificado correctamente',
    };
  } catch (error) {
    return {
      success: false,
      message: `❌ Error en setup: ${(error as Error).message}`,
    };
  }
}
