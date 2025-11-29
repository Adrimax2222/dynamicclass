
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

async function requestGeneration(prompt: string, apiKey: string): Promise<string | null> {
  console.log(`Requesting generation for: "${prompt}"...`);
  const url = "https://stablehorde.net/api/v2/generate/async";
  
  const bodyData = {
      prompt: prompt,
      params: {
          sampler_name: "k_euler",
          width: 512,
          height: 512,
          steps: 25
      },
      models: ["stable_diffusion_xl"],
      nsfw: false,
      censor_nsfw: true,
      shared: true,
      client_agent: "adrimax-studio-app:v1.0:github.com/google/studio",
      apikey: apiKey 
  };

  try {
      const response = await fetch(url, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bodyData)
      });

      if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      const taskId = result.id;
      
      console.log(`Task started with ID: ${taskId}`);
      return taskId;
      
  } catch (error: any) {
      console.error("Error requesting generation:", error.message);
      return null;
  }
}

async function checkResult(taskId: string): Promise<string | null> {
  const checkUrl = `https://stablehorde.net/api/v2/generate/check/${taskId}`;
  const interval = 5000; // 5-second interval
  
  console.log(`Waiting for task to finish...`);

  while (true) {
      try {
          const response = await fetch(checkUrl);
          const result = await response.json();
          
          if (result.done) {
              const statusResponse = await fetch(`https://stablehorde.net/api/v2/generate/status/${taskId}`);
              const statusResult = await statusResponse.json();

              if (statusResult.generations && statusResult.generations.length > 0) {
                  const imageUrl = statusResult.generations[0].img;
                  console.log("Generation completed!");
                  return imageUrl;
              } else {
                  console.error("Error: Task finished, but no image was generated.");
                  return null;
              }
          }

          if (result.faulted) {
              console.error("Error: The task faulted or was rejected by the network.");
              return null;
          }

          const wait_time = result.wait_time || 0;
          console.log(`   - Estimated remaining: ${wait_time.toFixed(1)} seconds.`);
          await sleep(interval); 

      } catch (error: any) {
          console.error("Error checking result:", error.message);
          return null;
      }
  }
}

export async function generateStableHordeImage(input: StableHordeImageInput): Promise<StableHordeImageOutput> {
  const apiKey = process.env.STABLE_HORDE_API_KEY || 'pRtmb6M2waL_iXADAcsXqQ';
  
  if (!apiKey) {
    throw new Error('STABLE_HORDE_API_KEY is not defined in the environment variables.');
  }

  const taskId = await requestGeneration(input.prompt, apiKey);

  if (taskId) {
      const imageUrl = await checkResult(taskId);
      if (imageUrl) {
          return { imageUrl };
      }
  }
  
  throw new Error('Failed to generate image with AI Stable Horde. Please try again later.');
}
