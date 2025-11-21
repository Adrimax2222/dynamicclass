'use server';

/**
 * @fileOverview Provides personalized course recommendations based on the student's current classes.
 *
 * - `getCourseRecommendations`: A function that takes the student's current classes as input and returns a list of recommended courses.
 * - `CourseRecommendationsInput`: The input type for the `getCourseRecommendations` function.
 * - `CourseRecommendationsOutput`: The return type for the `getCourseRecommendations` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CourseRecommendationsInputSchema = z.object({
  currentClasses: z.array(z.string()).describe('Lista de las clases actuales del estudiante.'),
});
export type CourseRecommendationsInput = z.infer<typeof CourseRecommendationsInputSchema>;

const CourseRecommendationsOutputSchema = z.object({
  recommendedCourses: z.array(z.string()).describe('Lista de cursos recomendados basada en las clases actuales del estudiante.'),
});
export type CourseRecommendationsOutput = z.infer<typeof CourseRecommendationsOutputSchema>;

export async function getCourseRecommendations(input: CourseRecommendationsInput): Promise<CourseRecommendationsOutput> {
  return personalizedCourseRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedCourseRecommendationsPrompt',
  input: {schema: CourseRecommendationsInputSchema},
  output: {schema: CourseRecommendationsOutputSchema},
  prompt: `Eres un asistente de IA diseñado para proporcionar recomendaciones de cursos personalizadas a estudiantes en función de sus clases actuales.

  Dada la siguiente lista de clases actuales:
  {{#each currentClasses}}
  - {{this}}
  {{/each}}

  Recomienda cursos que serían relevantes y útiles para que el estudiante amplíe sus conocimientos.
  Formatea la salida como una lista de nombres de cursos.
  `,
});

const personalizedCourseRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedCourseRecommendationsFlow',
    inputSchema: CourseRecommendationsInputSchema,
    outputSchema: CourseRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
