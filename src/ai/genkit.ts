import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// No necesitas importar 'dotenv' en Next.js, ya lo gestiona el framework
export const ai = genkit({
  plugins: [
    googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY }),
  ],
  logLevel: 'debug',
  enableTracing: true,
});
