'use server';

/**
 * @fileOverview Gestor de conversaciones para el chatbot de IA usando el SDK de Google.
 *
 * - aiChatbotAssistance: Función principal que gestiona la lógica de la conversación con Gemini.
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, type ChatSession, type EnhancedGenerateContentResponse } from "@google/generative-ai";
import { z } from 'zod';

// --- Esquemas de Entrada y Salida (locales para este archivo) ---

const ChatHistoryItemSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
});

const AIChatbotAssistanceInputSchema = z.object({
  history: z.array(ChatHistoryItemSchema).optional().describe("Historial de la conversación para dar contexto al modelo."),
  query: z.string().min(1, { message: "La consulta no puede estar vacía." }).describe("La nueva pregunta del usuario."),
  subject: z.string().optional().describe("El tema principal de la conversación, ej: 'Matemáticas'."),
});

type AIChatbotAssistanceInput = z.infer<typeof AIChatbotAssistanceInputSchema>;

const AIChatbotAssistanceOutputSchema = z.object({
  response: z.string().describe("La respuesta generada por el asistente de IA."),
});

type AIChatbotAssistanceOutput = z.infer<typeof AIChatbotAssistanceOutputSchema>;


/**
 * Procesa la consulta de un usuario y devuelve una respuesta de la IA, manteniendo el contexto de la conversación.
 * Utiliza el modelo 'gemini-1.5-flash' y el SDK oficial de Google Generative AI.
 * 
 * @param input - Un objeto que contiene la consulta del usuario y el historial de chat.
 * @returns Un objeto con la respuesta de la IA o un mensaje de error controlado.
 */
export async function aiChatbotAssistance(input: AIChatbotAssistanceInput): Promise<AIChatbotAssistanceOutput> {
  // 1. Validar la entrada usando Zod.
  const validation = AIChatbotAssistanceInputSchema.safeParse(input);
  if (!validation.success) {
    const errorMessage = "Entrada inválida: " + validation.error.errors.map(e => e.message).join(', ');
    console.error(errorMessage);
    return { response: 'Error en el formato de la solicitud.' };
  }

  // 2. Cargar la API Key de forma segura desde las variables de entorno.
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("La variable de entorno GEMINI_API_KEY no está configurada.");
    // En producción, es mejor no exponer detalles del error al cliente.
    return { response: 'Error de configuración del servidor.' };
  }

  try {
    // 3. Inicializar el cliente de la IA de Google.
    const genAI = new GoogleGenerativeAI(apiKey);

    // 4. Configurar y obtener el modelo 'gemini-1.5-flash'.
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `Eres ADRIMAX AI, un asistente educativo experto, amigable y motivador. Tu misión es explicar conceptos de forma clara y accesible, adaptar tu respuesta al nivel del estudiante, usar ejemplos prácticos y analogías, y fomentar el pensamiento crítico. ${validation.data.subject ? `El tema principal de la conversación es ${validation.data.subject}.` : ''} Usa Markdown para formatear el texto (negritas, listas, etc.). Mantén siempre un tono educativo y positivo.`,
    });

    // 5. Formatear el historial para el SDK. El rol 'assistant' se mapea a 'model'.
    const chatHistory = validation.data.history?.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })).filter(msg => msg.role === 'user' || msg.role === 'model') ?? [];

    // 6. Iniciar una sesión de chat con el historial.
    const chat: ChatSession = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 2048,
      },
      safetySettings: [ // Configuración de seguridad para el Free Tier
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
    });

    // 7. Enviar el nuevo mensaje del usuario (la 'query') a la sesión de chat.
    const userQuery: string = validation.data.query;
    const result: EnhancedGenerateContentResponse = await chat.sendMessage(userQuery);
    
    // 8. Extraer la respuesta de texto.
    const response = result.response;
    const text = response.text();

    return { response: text };

  } catch (error) {
    // 9. Capturar errores (ej. límites de cuota, problemas de red) y devolver el mensaje solicitado.
    console.error("Error al llamar a la API de Google Generative AI:", error);
    return { response: 'Tu tutor digital necesita unos segundos para pensar. Vuelve a intentarlo en un momento.' };
  }
}
