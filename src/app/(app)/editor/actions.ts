'use server';

/**
 * @fileOverview Server Action para procesar acciones del Editor Mágico usando el SDK de Google AI directamente.
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

// Obtener la API Key de las variables de entorno
const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error('No se encontró la API Key de Google/Gemini en las variables de entorno.');
}

// Inicializar el SDK de Google
const genAI = new GoogleGenerativeAI(apiKey);

// Un mapa para obtener el prompt correcto basado en el tipo de acción
const getPrompt = (text: string, actionType: z.infer<typeof ActionTypeSchema>, option?: string) => {
    switch (actionType) {
        case 'translate':
            return `Traduce el siguiente texto al ${option || 'inglés'}. Devuelve solo el texto traducido, sin añadir introducciones. Mantén el formato original (saltos de línea, etc.):\n\n${text}`;
        case 'tone':
            return `Reescribe el siguiente texto con un tono ${option || 'profesional'}. Devuelve solo el texto reescrito, sin añadir introducciones. Mantén el formato original:\n\n${text}`;
        case 'summarize':
            if (option === 'puntos-clave') {
                return `Extrae los puntos clave del siguiente texto en una lista de viñetas. Devuelve solo la lista, sin añadir introducciones:\n\n${text}`;
            }
            return `Crea un resumen en ${option || 'un párrafo corto'} del siguiente texto. Devuelve solo el resumen, sin añadir introducciones:\n\n${text}`;
        case 'continue':
            return `Continúa escribiendo a partir del siguiente texto, añadiendo ${option || 'un párrafo'}. Mantén el estilo y el tono originales. Devuelve solo la continuación, sin añadir introducciones:\n\n${text}`;
        case 'simplify':
             if (option === 'para-ninos') {
                return `Simplifica el siguiente texto para que un niño de 10 años pueda entenderlo fácilmente. Devuelve solo el texto simplificado, sin añadir introducciones:\n\n${text}`;
            }
            return `Reescribe el siguiente texto usando un lenguaje más sencillo y fácil de entender. Devuelve solo el texto simplificado, sin añadir introducciones:\n\n${text}`;
        case 'fix':
            return `Corrige la gramática y la ortografía del siguiente texto. Devuelve solo el texto corregido, sin añadir introducciones y manteniendo el formato original tanto como sea posible:\n\n${text}`;
        default:
            // Esto no debería ocurrir debido a la validación de Zod
            return `Procesa el siguiente texto: ${text}`;
    }
}

/**
 * Server Action que se llama desde el cliente para procesar el texto del editor.
 * @param input - El objeto con el texto, tipo de acción y opción.
 * @returns El texto procesado por la IA.
 */
export async function processEditorAction(input: EditorActionInput): Promise<EditorActionOutput> {
  console.log('Processing editor action with Google AI SDK:', input.actionType, 'with option:', input.option);
  try {
    // 1. Validar la entrada con Zod
    EditorActionInputSchema.parse(input);
    
    // 2. Configurar el modelo
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // 3. Construir el prompt
    const prompt = getPrompt(input.text, input.actionType, input.option);

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