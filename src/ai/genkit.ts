// src/ai/genkit.ts
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { config } from 'dotenv';

// Cargar variables de entorno
config();

// Validar que la API key esté presente
const apiKey = process.env.GOOGLE_GENAI_API_KEY;

if (!apiKey) {
  console.error('❌ ERROR CRÍTICO: GOOGLE_GENAI_API_KEY no está configurada');
  throw new Error('GOOGLE_GENAI_API_KEY no está configurada en las variables de entorno');
}

if (apiKey.startsWith('TU_') || apiKey === '') {
  console.error('❌ ERROR: La API key no es válida. Reemplázala en el archivo .env');
  throw new Error('API key no válida');
}

/**
 * Configuración centralizada de Genkit con Google AI
 * Usa Gemini 1.5 Flash para respuestas rápidas y económicas
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey,
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
