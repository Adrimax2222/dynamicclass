
'use server';

/**
 * @fileOverview Generates an image using the AI Stable Horde API.
 * - `generateStableHordeImage`: The function to call to generate an image.
 * - `StableHordeImageInput`: The input type.
 * - `StableHordeImageOutput`: The output type.
 */

import { z } from 'zod';

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
  const apiKey = process.env.STABLE_HORDE_API_KEY || 'pRtmb6M2waL_iXADAcsXqQ';
  
  if (!apiKey) {
    throw new Error('STABLE_HORDE_API_KEY is not defined in the environment variables.');
  }

  const STABLE_HORDE_API_URL = 'https://stablehorde.net/api';

  try {
    // Step 1: Request image generation asynchronously
    const generationRequestResponse = await fetch(`${STABLE_HORDE_API_URL}/v2/generate/async`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': apiKey,
            'Client-Agent': 'adrimax-studio-app:v1.0:github.com/google/studio'
        },
        body: JSON.stringify({
            prompt: input.prompt,
            params: {
                sampler_name: 'k_dpm_fast', 
                cfg_scale: 7.5,
                width: 512,
                height: 512,
                steps: 20
            }
        })
    });

    if (!generationRequestResponse.ok) {
        const errorText = await generationRequestResponse.text();
        throw new Error(`Failed to request image generation: ${generationRequestResponse.status} ${errorText}`);
    }

    const generationRequest = await generationRequestResponse.json();
    const generationId = generationRequest.id;

    if (!generationId) {
        throw new Error('Failed to get a generation ID from Stable Horde.');
    }

    // Step 2: Poll for the result
    let attempts = 0;
    const maxAttempts = 60; // 60 attempts * 5 seconds = 5 minutes timeout
    
    while (attempts < maxAttempts) {
      const checkResponse = await fetch(`${STABLE_HORDE_API_URL}/v2/generate/check/${generationId}`);
      
      if (!checkResponse.ok) {
          await sleep(5000);
          attempts++;
          continue;
      }

      const checkResult = await checkResponse.json();
      
      if (checkResult.done) {
        // Generation is complete, fetch the final status to get the image URL
        const finalStatusResponse = await fetch(`${STABLE_HORDE_API_URL}/v2/generate/status/${generationId}`);
        if (!finalStatusResponse.ok) {
            throw new Error('Failed to get final generation status.');
        }

        const finalStatus = await finalStatusResponse.json();

        if (finalStatus.generations && finalStatus.generations.length > 0) {
          const imageUrl = finalStatus.generations[0].img;
          if (imageUrl) {
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
