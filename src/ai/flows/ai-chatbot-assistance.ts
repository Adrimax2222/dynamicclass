'use server';

/**
 * @fileOverview Minimal Viable Product for AI Chatbot Assistance.
 * This is a simplified version for debugging purposes.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// Simple input/output types for debugging
interface AIChatbotAssistanceInput {
  query: string;
}

interface AIChatbotAssistanceOutput {
  response: string;
}

/**
 * Processes a user query and returns a simple AI response.
 * Uses the 'gemini-1.5-flash' model with the v1 API.
 * 
 * @param input - An object containing the user's query.
 * @returns An object with the AI's response or an error message.
 */
export async function aiChatbotAssistance(input: AIChatbotAssistanceInput): Promise<AIChatbotAssistanceOutput> {
  // 1. Verify API Key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Falta la API Key en las variables de entorno');
  }

  try {
    // 2. Initialize Google AI Client
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 3. Get model and force v1 API
    const model = genAI.getGenerativeModel(
        { model: "gemini-1.5-flash" },
        { apiVersion: 'v1' }
    );

    // 4. Send the prompt and get the result
    const result = await model.generateContent(input.query);
    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new Error("La IA devolvió una respuesta vacía.");
    }
    
    return { response: text };

  } catch (error: any) {
    // 5. Critical server-side logging for debugging
    console.error('ERROR_REAL_AQUÍ:', error);
    
    // 6. Return the actual error message to the client for debugging
    return { response: `Error: ${error.message}` };
  }
}
