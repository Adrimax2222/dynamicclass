'use server';

/**
 * @fileOverview Server Action para procesar acciones del Editor Mágico usando Genkit.
 */

import { ai } from '@/ai/genkit';
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

// Define el esquema de entrada para el flujo de Genkit
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


// Un mapa para obtener el prompt correcto basado en el tipo de acción
const getPrompt = (actionType: z.infer<typeof ActionTypeSchema>, option?: string) => {
    switch (actionType) {
        case 'translate':
            return `Traduce el siguiente texto al ${option || 'inglés'}. Mantén el formato original (saltos de línea, etc.):\n\n{{{text}}}`;
        case 'tone':
            return `Reescribe el siguiente texto con un tono ${option || 'profesional'}. Mantén el formato original:\n\n{{{text}}}`;
        case 'summarize':
            if (option === 'puntos-clave') {
                return `Extrae los puntos clave del siguiente texto en una lista de viñetas:\n\n{{{text}}}`;
            }
            return `Crea un resumen en ${option || 'un párrafo corto'} del siguiente texto:\n\n{{{text}}}`;
        case 'continue':
            return `Continúa escribiendo a partir del siguiente texto, añadiendo ${option || 'un párrafo'}. Mantén el estilo y el tono originales:\n\n{{{text}}}`;
        case 'simplify':
             if (option === 'para-ninos') {
                return `Simplifica el siguiente texto para que un niño de 10 años pueda entenderlo fácilmente:\n\n{{{text}}}`;
            }
            return `Reescribe el siguiente texto usando un lenguaje más sencillo y fácil de entender:\n\n{{{text}}}`;
        case 'fix':
            return `Corrige la gramática y la ortografía del siguiente texto. Devuelve solo el texto corregido, manteniendo el formato original tanto como sea posible:\n\n{{{text}}}`;
        default:
            return 'Procesa el siguiente texto: {{{text}}}';
    }
}


// Definición del prompt dinámico de Genkit
const editorActionPrompt = ai.definePrompt({
    name: 'editorActionPrompt',
    model: 'googleai/gemini-1.5-flash-latest',
    input: { schema: EditorActionInputSchema },
    output: { schema: EditorActionOutputSchema },
    prompt: (input) => getPrompt(input.actionType, input.option),
    config: {
        temperature: 0.5,
        safetySettings: [
            {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_ONLY_HIGH',
            },
        ],
    },
});

// Definición del flujo principal de Genkit
const editorActionFlow = ai.defineFlow(
  {
    name: 'editorActionFlow',
    inputSchema: EditorActionInputSchema,
    outputSchema: EditorActionOutputSchema,
  },
  async (input) => {
    const { output } = await editorActionPrompt(input);
    if (!output?.processedText) {
      throw new Error("La respuesta de la IA no fue válida o estaba vacía.");
    }
    return { processedText: output.processedText.trim() };
  }
);


/**
 * Server Action que se llama desde el cliente para procesar el texto del editor.
 * @param input - El objeto con el texto, tipo de acción y opción.
 * @returns El texto procesado por la IA.
 */
export async function processEditorAction(input: EditorActionInput): Promise<EditorActionOutput> {
  console.log('Processing editor action:', input.actionType, 'with option:', input.option);
  try {
    // Validar la entrada con Zod antes de llamar al flujo
    EditorActionInputSchema.parse(input);
    const result = await editorActionFlow(input);
    return result;
  } catch (error: any) {
    console.error("[Server Action Error] Error in processEditorAction:", error);
    // Lanzar una excepción para que el cliente pueda manejarla en su bloque catch.
    throw new Error(error.message || "No se pudo procesar la solicitud de IA.");
  }
}
