
'use server';

/**
 * @fileOverview Generates an image using the AI Stable Horde API.
 * - `generateStableHordeImage`: The function to call to generate an image.
 * - `StableHordeImageInput`: The input type.
 * - `StableHordeImageOutput`: The output type.
 */

import { z } from 'zod';
import AIHorde from 'aihorde';

const StableHordeImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an image from.'),
});
export type StableHordeImageInput = z.infer<typeof StableHordeImageInputSchema>;

const StableHordeImageOutputSchema = z.object({
  imageUrl: z.string().describe('The URL of the generated image.'),
});
export type StableHordeImageOutput = z.infer<typeof StableHordeImageOutputSchema>;

// Helper function to delay execution
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generateStableHordeImage(input: StableHordeImageInput): Promise<StableHordeImageOutput> {
  const apiKey = process.env.STABLE_HORDE_API_KEY || '0000000000';
  
  if (!apiKey || apiKey === '0000000000') {
    throw new Error('STABLE_HORDE_API_KEY is not defined in the environment variables.');
  }

  const aihorde = new AIHorde({
    client_agent: 'adrimax-studio-app:v1.0:github.com/google/studio',
    default_token: apiKey,
  });

  try {
    // Step 1: Request image generation asynchronously
    const generationRequest = await aihorde.postAsyncImageGenerate({
      prompt: input.prompt,
      params: {
        // Using a common, fast model.
        // You can find more models via aihorde.getModels()
        'sampler_name': 'k_dpm_fast', 
        'cfg_scale': 7.5,
        'width': 512,
        'height': 512,
        'steps': 20
      },
    });

    if (!generationRequest.id) {
        throw new Error('Failed to get a generation ID from Stable Horde.');
    }

    const generationId = generationRequest.id;

    // Step 2: Poll for the result
    let attempts = 0;
    const maxAttempts = 60; // 60 attempts * 5 seconds = 5 minutes timeout
    
    while (attempts < maxAttempts) {
      const checkResult = await aihorde.getImageGenerationCheck(generationId);
      
      if (checkResult.done) {
        // Generation is complete, find the image
        const finalStatus = await aihorde.getImageGenerationStatus(generationId);
        if (finalStatus.generations && finalStatus.generations.length > 0) {
          const imageUrl = finalStatus.generations[0].img;
          if (imageUrl) {
            // The API sometimes returns a WebP image, which is fine for browsers
            return { imageUrl };
          }
        }
        throw new Error('Image generation completed, but no image URL was found.');
      }

      // If not done, wait for a bit before checking again
      await sleep(5000); // Wait 5 seconds
      attempts++;
    }

    throw new Error('Image generation timed out. The AI Horde is busy. Please try again later.');

  } catch (error: any) {
    console.error('Error generating image with AI Stable Horde:', error);
    // Rethrow a more user-friendly error
    throw new Error(`Failed to generate image: ${error.message || 'Unknown error'}`);
  }
}
