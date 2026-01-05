
'use server';

/**
 * @fileOverview Server Action para procesar acciones del Editor Mágico usando @google/generative-ai.
 * Implementación robusta que inicializa el SDK en tiempo de ejecución para asegurar la carga de la API key.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from 'zod';

// Define los tipos de acción que puede procesar la IA
const ActionTypeSchema = z.enum([
  'translate',
  'tone',
  'summarize',
  'continue',
  'simplify',
  'fix',
]);

// Define el esquema de entrada para la validación en el cliente
const EditorActionInputSchema = z.object({
  text: z.string().min(1, 'El texto no puede estar vacío.'),
  actionType: ActionTypeSchema,
  option: z.string().optional(),
});

// Tipos inferidos de los esquemas
export type EditorActionInput = z.infer<typeof EditorActionInputSchema>;


/**
 * Genera el prompt adecuado para la IA basado en la acción solicitada.
 */
const getPromptInstruction = (actionType: EditorActionInput['actionType'], option?: string) => {
    switch (actionType) {
        case 'translate':
            return `Traduce el siguiente texto al ${option || 'inglés'}. Devuelve solo el texto traducido, sin añadir introducciones. Mantén el formato original (saltos de línea, etc.):`;
        case 'tone':
            return `Reescribe el siguiente texto con un tono ${option || 'profesional'}. Devuelve solo el texto reescrito, sin añadir introducciones. Mantén el formato original:`;
        case 'summarize':
            if (option === 'puntos-clave') {
                return `Extrae los puntos clave del siguiente texto en una lista de viñetas. Devuelve solo la lista, sin añadir introducciones:`;
            }
            return `Crea un resumen en ${option || 'un párrafo corto'} del siguiente texto. Devuelve solo el resumen, sin añadir introducciones:`;
        case 'continue':
            return `Continúa escribiendo a partir del siguiente texto, añadiendo ${option || 'un párrafo'}. Mantén el estilo y el tono originales. Devuelve solo la continuación, sin añadir introduciones:`;
        case 'simplify':
             if (option === 'para-ninos') {
                return `Simplifica el siguiente texto para que un niño de 10 años pueda entenderlo fácilmente. Devuelve solo el texto simplificado, sin añadir introducciones:`;
            }
            return `Reescribe el siguiente texto usando un lenguaje más sencillo y fácil de entender. Devuelve solo el texto simplificado, sin añadir introducciones:`;
        case 'fix':
            return `Corrige la gramática y la ortografía del siguiente texto. Devuelve solo el texto corregido, sin añadir introducciones y manteniendo el formato original tanto como sea posible:`;
        default:
            // Fallback por si se añade una acción no contemplada
            return `Procesa el siguiente texto:`;
    }
}

/**
 * Procesa el texto del editor usando la API de Google Gemini.
 * @param input - El objeto con el texto, tipo de acción y opción.
 * @returns El texto procesado por la IA.
 */
export async function processEditorAction(input: EditorActionInput): Promise<{ processedText: string }> {
  // 1. Validar la entrada del cliente
  const validation = EditorActionInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Entrada inválida: ${validation.error.errors.map(e => e.message).join(', ')}`);
  }
  const { text, actionType, option } = validation.data;

  try {
    // 2. Validar la API Key en tiempo de ejecución
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      throw new Error('La variable de entorno GEMINI_API_KEY no está configurada en el servidor.');
    }

    // 3. Inicializar el cliente de IA dentro de la función
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash" 
    });

    // 4. Construir el prompt completo
    const instruction = getPromptInstruction(actionType, option);
    const fullPrompt = `${instruction}\n\n---\n\n${text}`;

    // 5. Llamar a la API
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const processedText = response.text();

    if (!processedText) {
      throw new Error("La IA devolvió una respuesta vacía.");
    }
    
    return { processedText: processedText.trim() };

  } catch (error: any) {
    // 6. Lanzar el error para que el cliente lo capture
    console.error("[Editor Action Error]:", error);
    throw new Error(error.message || "Error desconocido al procesar la solicitud de IA.");
  }
}
