
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

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt for image generation.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageDataUri: z.string().describe('The data URI of the generated image.'),
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
      // Use Genkit's built-in generate function with the correct model and configuration
      // to explicitly request an image.
      const { media } = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        prompt: `Generate a high-quality, photorealistic image of: ${prompt}`,
        config: {
            // This is the critical part: it tells the model to output an image.
            responseModalities: ['IMAGE'],
        }
      });
      
      if (!media || !media.url) {
        console.error('Image generation failed: The AI response did not contain a media URL.');
        throw new Error('Image generation failed to produce a data URI.');
      }

      return {
        imageDataUri: media.url,
      };

    } catch (error) {
      console.error('Error during image generation flow:', error);
      // It's better to throw a more generic error to the user for security.
      throw new Error('Failed to generate image due to an internal error.');
    }
  }
);


export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}
