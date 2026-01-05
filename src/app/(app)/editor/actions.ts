'use server';

/**
 * @fileOverview Server Action para procesar acciones del Editor Mágico usando @google/generative-ai.
 * Implementación robusta siguiendo las directrices del usuario para corregir errores 404.
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
  text: z.string().describe('El texto del editor para procesar.'),
  actionType: ActionTypeSchema.describe('El tipo de acción a realizar.'),
  option: z.string().optional().describe('Una opción adicional, como el idioma o el tipo de resumen.'),
});

// Tipos inferidos de los esquemas
export type EditorActionInput = z.infer<typeof EditorActionInputSchema>;

// --- Lógica de la IA con @google/generative-ai ---

// 1. Validación de la clave antes de cualquier ejecución
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
if (!apiKey) {
  console.error("CRÍTICO: La variable GEMINI_API_KEY o GOOGLE_GENAI_API_KEY no está definida en el entorno.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

// Un mapa para obtener el prompt correcto basado en el tipo de acción
const getPromptInstruction = (actionType: z.infer<typeof ActionTypeSchema>, option?: string) => {
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
            return `Continúa escribiendo a partir del siguiente texto, añadiendo ${option || 'un párrafo'}. Mantén el estilo y el tono originales. Devuelve solo la continuación, sin añadir introducciones:`;
        case 'simplify':
             if (option === 'para-ninos') {
                return `Simplifica el siguiente texto para que un niño de 10 años pueda entenderlo fácilmente. Devuelve solo el texto simplificado, sin añadir introducciones:`;
            }
            return `Reescribe el siguiente texto usando un lenguaje más sencillo y fácil de entender. Devuelve solo el texto simplificado, sin añadir introducciones:`;
        case 'fix':
            return `Corrige la gramática y la ortografía del siguiente texto. Devuelve solo el texto corregido, sin añadir introducciones y manteniendo el formato original tanto como sea posible:`;
        default:
            // Esto nunca debería ocurrir gracias a Zod, pero es una buena práctica tener un fallback.
            return `Procesa el siguiente texto:`;
    }
}


/**
 * Server Action que se llama desde el cliente para procesar el texto del editor.
 * @param input - El objeto con el texto, tipo de acción y opción.
 * @returns El texto procesado por la IA.
 */
export async function processEditorAction(input: EditorActionInput): Promise<{ processedText: string }> {
  // Validar la entrada con Zod para seguridad.
  const validation = EditorActionInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error("Entrada inválida para la acción del editor.");
  }
  const { text, actionType, option } = validation.data;
  
  if (!text) throw new Error("El texto es requerido.");
  if (!apiKey) throw new Error("Configuración de API ausente en el servidor.");

  const instruction = getPromptInstruction(actionType, option);
  const fullPrompt = `${instruction}\n\n---\n\n${text}`;

  try {
    // 2. Nombre de modelo estricto
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash" 
    });

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const processedText = response.text();

    if (!processedText) {
      throw new Error("La IA devolvió una respuesta vacía.");
    }
    
    return { processedText: processedText.trim() };

  } catch (error: any) {
    // 3. Captura detallada del error
    console.error("[GEMINI ERROR]:", error);
    
    // Propaga un mensaje de error útil al cliente
    throw new Error(
      error.message?.includes("not found") 
        ? "Modelo no disponible. Verifica que la API Key sea de AI Studio." 
        : "Error en el servicio de IA: " + error.message
    );
  }
}
