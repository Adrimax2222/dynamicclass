// src/ai/genkit.ts
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { config } from 'dotenv';

config();

// Asegúrate de tener la env var: GOOGLE_GENAI_API_KEY
// Esta configuración centraliza la inicialización de Genkit y la API de Google.
export const ai = genkit({
  plugins: [
    googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY ?? '' }),
  ],
  // Desactivamos los logs en producción para mayor rendimiento y seguridad.
  logLevel: 'silent',
  // Activamos el seguimiento de producción para un mejor monitoreo.
  enableTracing: true,
});
