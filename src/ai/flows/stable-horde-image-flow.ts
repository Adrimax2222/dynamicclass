
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
          sampler_name: "k_euler_a", // Using a common sampler
          width: 512,
          height: 512,
          steps: 25,
          cfg_scale: 7.5,
      },
      models: ["stable_diffusion"], // Using a more common base model
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
            'Accept': 'application/json',
            'Client-Agent': 'adrimax-studio-app:v1.0:github.com/google/studio'
          },
          body: JSON.stringify(bodyData)
      });

      if (!response.ok) {
          const errorText = await response.text();
          console.error(`HTTP Error ${response.status}: ${errorText}`);
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
  const statusUrl = `https://stablehorde.net/api/v2/generate/status/${taskId}`;
  
  console.log(`Waiting for task to finish... ID: ${taskId}`);

  for (let i = 0; i < 30; i++) { // Max ~2.5 minutes
      try {
          await sleep(5000); // Wait 5 seconds
          const checkResponse = await fetch(checkUrl);
          const checkResult = await checkResponse.json();
          
          if (checkResult.faulted) {
              console.error("Error: The task faulted or was rejected by the network.");
              return null;
          }

          if (checkResult.done) {
              console.log("Generation process 'done'. Fetching final status...");
              const statusResponse = await fetch(statusUrl);
              const statusResult = await statusResponse.json();

              if (statusResult.generations && statusResult.generations.length > 0) {
                  const imageUrl = statusResult.generations[0].img;
                  console.log("Generation completed! Image URL found.");
                  return imageUrl;
              } else {
                  console.error("Error: Task finished, but no image was generated.", statusResult);
                  return null;
              }
          }

          const wait_time = checkResult.wait_time || 0;
          const queue_position = checkResult.queue_position || 0;
          console.log(`   - Attempt ${i+1}/30. In queue: ${queue_position}. Est. wait: ${wait_time.toFixed(1)}s.`);

      } catch (error: any) {
          console.error(`Error checking result on attempt ${i+1}:`, error.message);
          // Don't exit on a single failed check, allow retries
      }
  }

  console.error("Error: Generation timed out after multiple checks.");
  return null;
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
