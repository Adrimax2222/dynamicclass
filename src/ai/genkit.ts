import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import { GEMINI_API_KEY } from './config';

export const ai = genkit({
  plugins: [googleAI({apiKey: GEMINI_API_KEY})],
  model: 'googleai/gemini-2.5-flash',
});
