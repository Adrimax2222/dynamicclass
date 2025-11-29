'use server';

/**
 * @fileOverview Generates an image using the Together AI API.
 * - `generateTogetherImage`: The function to call to generate an image.
 * - `TogetherImageInput`: The input type.
 * - `TogetherImageOutput`: The output type.
 */

import { z } from 'zod';
import Together from 'together-ai';

// Define input and output schemas for consistency, even though not a full Genkit flow.
const TogetherImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an image from.'),
});
export type TogetherImageInput = z.infer<typeof TogetherImageInputSchema>;

const TogetherImageOutputSchema = z.object({
  imageUrl: z.string().describe('The URL of the generated image.'),
});
export type TogetherImageOutput = z.infer<typeof TogetherImageOutputSchema>;

// This is a server action, not a true Genkit flow, but we export it like one.
export async function generateTogetherImage(input: TogetherImageInput): Promise<TogetherImageOutput> {
  if (!process.env.TOGETHER_API_KEY) {
    throw new Error('TOGETHER_API_KEY is not defined in the environment variables.');
  }

  const client = new Together({
    apiKey: process.env.TOGETHER_API_KEY,
  });

  try {
    const response = await client.images.create({
      model: 'black-forest-labs/FLUX.1-schnell',
      prompt: input.prompt,
      n: 1,
      // You can add other parameters like height, width, etc. if needed.
    });

    if (!response.data || response.data.length === 0 || !response.data[0].url) {
      throw new Error('Image generation failed: No image URL was returned.');
    }
    
    // IMPORTANT: The Together AI API returns a temporary URL.
    // For a real app, you would download this image and re-host it on your own storage (e.g., Firebase Storage)
    // because the URL will expire. For this demo, we'll use the temporary URL directly.
    const imageUrl = response.data[0].url;

    return { imageUrl };

  } catch (error: any) {
    console.error('Error generating image with Together AI:', error);
    // Rethrow a more user-friendly error
    throw new Error(`Failed to generate image: ${error.message}`);
  }
}
