'use server';

/**
 * @fileOverview Server Action para procesar acciones del Editor Mágico usando @google/generative-ai.
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

// Define el esquema de entrada
const EditorActionInputSchema = z.object({
  text: z.string().describe('El texto del editor para procesar.'),
  actionType: ActionTypeSchema.describe('El tipo de acción a realizar.'),
  option: z.string().optional().describe('Una opción adicional, como el idioma o el tipo de resumen.'),
});

// Define el esquema de salida
const EditorActionOutputSchema = z.object({
  processedText: z.string().describe('El texto resultante después de la acción de la IA.'),
});

// Tipos inferidos de los esquemas
export type EditorActionInput = z.infer<typeof EditorActionInputSchema>;
export type EditorActionOutput = z.infer<typeof EditorActionOutputSchema>;

// --- Lógica de la IA con @google/generative-ai ---

// Inicializa la API con la clave desde las variables de entorno
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
if (!apiKey) {
  throw new Error("La clave de API de Google/Gemini no está configurada en las variables de entorno.");
}
const genAI = new GoogleGenerativeAI(apiKey);


// Un mapa para obtener el prompt correcto basado en el tipo de acción
const getPromptText = (actionType: z.infer<typeof ActionTypeSchema>, option?: string) => {
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
            return `Procesa el siguiente texto:`;
    }
}

/**
 * Server Action que se llama desde el cliente para procesar el texto del editor.
 * @param input - El objeto con el texto, tipo de acción y opción.
 * @returns El texto procesado por la IA.
 */
export async function processEditorAction(input: EditorActionInput): Promise<EditorActionOutput> {
  console.log('Processing editor action with @google/generative-ai:', input.actionType, 'with option:', input.option);
  try {
    // 1. Validar la entrada con Zod
    const { text, actionType, option } = EditorActionInputSchema.parse(input);

    // 2. Configura el modelo
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // 3. Construir el prompt dinámico
    const prompt = `${getPromptText(actionType, option)}\n\n---\n\n${text}`;

    // 4. Llamar a la IA
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const processedText = response.text();

    if (!processedText) {
      throw new Error("La IA no generó una respuesta válida.");
    }
    
    // 5. Devolver la salida en el formato esperado
    return { processedText: processedText.trim() };

  } catch (error: any) {
    console.error("[Server Action Error] Error in processEditorAction:", error);
    // Lanzar una excepción para que el cliente pueda manejarla en su bloque catch.
    throw new Error(error.message || "No se pudo procesar la solicitud de IA.");
  }
}
