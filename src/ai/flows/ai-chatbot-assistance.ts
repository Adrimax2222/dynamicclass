'use server';

/**
 * @fileOverview AI Chatbot for educational assistance.
 *
 * - aiChatbotAssistance - A function that provides AI chatbot assistance.
 * - AIChatbotAssistanceInput - The input type for the aiChatbotAssistance function.
 * - AIChatbotAssistanceOutput - The return type for the aiChatbotAssistance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIChatbotAssistanceInputSchema = z.object({
  query: z.string().describe('The query for the AI chatbot.'),
  subject: z.string().optional().describe('Optional subject or topic.'),
  responseLength: z.enum(['short', 'medium', 'long']).default('medium').describe('Desired response length (short, medium, or long).'),
  uploadedFiles: z.array(z.string()).optional().describe('List of data URIs of uploaded files.'),
  uploadedAudios: z.array(z.string()).optional().describe('List of data URIs of uploaded audios.'),
});
export type AIChatbotAssistanceInput = z.infer<typeof AIChatbotAssistanceInputSchema>;

const AIChatbotAssistanceOutputSchema = z.object({
  response: z.string().describe('The response from the AI chatbot.'),
});
export type AIChatbotAssistanceOutput = z.infer<typeof AIChatbotAssistanceOutputSchema>;

export async function aiChatbotAssistance(input: AIChatbotAssistanceInput): Promise<AIChatbotAssistanceOutput> {
  return aiChatbotAssistanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiChatbotAssistancePrompt',
  input: {schema: AIChatbotAssistanceInputSchema},
  output: {schema: AIChatbotAssistanceOutputSchema},
  prompt: `You are an AI chatbot assistant, proficient in education.

You are enthusiastic about helping students learn.

{% if subject %}You are currently specialized in the subject of {{subject}}.{% endif %}

{% if uploadedFiles.length > 0 %}
You have been provided with the following files:
  {{#each uploadedFiles}}
    - {{this}}
  {{/each}}
{% endif %}

{% if uploadedAudios.length > 0 %}
You have been provided with the following audio files:
  {{#each uploadedAudios}}
    - {{this}}
  {{/each}}
{% endif %}

Respond to the following query with a {{responseLength}} response:

Query: {{{query}}}`,
});

const aiChatbotAssistanceFlow = ai.defineFlow(
  {
    name: 'aiChatbotAssistanceFlow',
    inputSchema: AIChatbotAssistanceInputSchema,
    outputSchema: AIChatbotAssistanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
