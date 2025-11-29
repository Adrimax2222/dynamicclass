'use server';

/**
 * @fileOverview Generates an image using the Fal AI API.
 * - `generateFalImage`: The function to call to generate an image.
 * - `FalImageInput`: The input type.
 * - `FalImageOutput`: The output type.
 */

import * as fal from '@fal-ai/client';
import { z } from 'zod';

// Ensure the API key is set in the environment variables
if (!process.env.FAL_AI_KEY) {
  throw new Error('FAL_AI_KEY environment variable is not set.');
}

const FalImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an image from.'),
});
export type FalImageInput = z.infer<typeof FalImageInputSchema>;

const FalImageOutputSchema = z.object({
  imageUrl: z.string().describe('The URL of the generated image.'),
});
export type FalImageOutput = z.infer<typeof FalImageOutputSchema>;

export async function generateFalImage(
  input: FalImageInput
): Promise<FalImageOutput> {
  try {
    const result: any = await fal.subscribe('fal-ai/flux/dev', {
      input: {
        prompt: input.prompt,
      },
      logs: true, // Enable logs for debugging
      onQueueUpdate(update) {
        console.log('Queue update:', update);
      },
    });

    if (!result || !result.images || result.images.length === 0) {
      throw new Error('Fal AI did not return any images.');
    }

    // Assuming the first image is the one we want
    const imageUrl = result.images[0].url;
    return { imageUrl };

  } catch (error: any) {
    console.error('Error generating image with Fal AI:', error);
    throw new Error(`Failed to generate image with Fal AI: ${error.message}`);
  }
}
