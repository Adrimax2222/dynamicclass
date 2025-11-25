
'use server';

/**
 * @fileOverview Generates an image from a text prompt using Genkit.
 *
 * - generateImage - A function that takes a prompt and returns a data URI for the generated image.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import { z } from 'genkit';
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('El texto para la generación de la imagen.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageDataUri: z.string().describe('La URI de datos de la imagen generada.'),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;


export const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async ({ prompt }) => {
    try {
      const { media } = await ai.generate({
        model: googleAI.model('imagen-4.0-fast-generate-001'),
        prompt: `Genera una imagen fotorrealista de alta calidad de: ${prompt}`,
      });
      
      const imageUrl = media.url;
      if (!imageUrl) {
        console.error('La generación de imágenes falló: La respuesta de la IA no contenía una URL de medios.');
        throw new Error('La generación de imágenes no pudo producir una URI de datos.');
      }

      return {
        imageDataUri: imageUrl,
      };

    } catch (error) {
      console.error('Error durante el flujo de generación de imágenes:', error);
      throw new Error('No se pudo generar la imagen debido a un error interno.');
    }
  }
);


export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}
