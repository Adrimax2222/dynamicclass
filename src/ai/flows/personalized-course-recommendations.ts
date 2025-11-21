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
  currentClasses: z.array(z.string()).describe('List of the student\'s current classes.'),
});
export type CourseRecommendationsInput = z.infer<typeof CourseRecommendationsInputSchema>;

const CourseRecommendationsOutputSchema = z.object({
  recommendedCourses: z.array(z.string()).describe('List of recommended courses based on the student\'s current classes.'),
});
export type CourseRecommendationsOutput = z.infer<typeof CourseRecommendationsOutputSchema>;

export async function getCourseRecommendations(input: CourseRecommendationsInput): Promise<CourseRecommendationsOutput> {
  return personalizedCourseRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedCourseRecommendationsPrompt',
  input: {schema: CourseRecommendationsInputSchema},
  output: {schema: CourseRecommendationsOutputSchema},
  prompt: `You are an AI assistant designed to provide personalized course recommendations to students based on their current classes.

  Given the following list of current classes:
  {{#each currentClasses}}
  - {{this}}
  {{/each}}

  Recommend courses that would be relevant and helpful for the student to expand their knowledge.
  Format the output as a list of course names.
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
