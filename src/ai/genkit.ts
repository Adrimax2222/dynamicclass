// src/ai/genkit.ts
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { config } from 'dotenv';

// Cargar variables de entorno
config();

// Validar que la API key esté presente, buscando ambas variables
const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
  const errorMsg = 'No se encontró la API Key. Asegúrate de que GOOGLE_GENAI_API_KEY o GEMINI_API_KEY estén configuradas en tu archivo .env';
  console.error(`❌ ERROR CRÍTICO: ${errorMsg}`);
  throw new Error(errorMsg);
}

if (apiKey.startsWith('TU_') || apiKey === '') {
  const errorMsg = 'La API key no es válida. Reemplázala en el archivo .env';
  console.error(`❌ ERROR: ${errorMsg}`);
  throw new Error(errorMsg);
}

/**
 * Configuración centralizada de Genkit con Google AI
 * Usa Gemini 1.5 Flash para respuestas rápidas y económicas
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey,
      defaultModel: 'gemini-1.5-flash',
    }),
  ],
  // En producción: 'error', en desarrollo: 'debug'
  logLevel: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
  // Habilitar tracing para monitoreo
  enableTracingAndMetrics: true,
});

// Log de inicialización exitosa (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
  console.log('✅ Genkit inicializado correctamente con Google AI');
}
