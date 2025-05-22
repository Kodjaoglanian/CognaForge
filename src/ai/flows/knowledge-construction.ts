// use server'

/**
 * @fileOverview AI flow for co-creating dynamic mind maps and smart notes.
 *
 * - knowledgeConstruction - A function that orchestrates the knowledge construction process.
 * - KnowledgeConstructionInput - The input type for the knowledgeConstruction function.
 * - KnowledgeConstructionOutput - The return type for the knowledgeConstruction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const KnowledgeConstructionInputSchema = z.object({
  topic: z.string().describe('The topic for knowledge construction.'),
  learningStyle: z
    .string()
    .optional()
    .describe(
      'The preferred learning style of the user (e.g., visual, auditory, kinesthetic).'
    ),
  pace: z.string().optional().describe('The desired learning pace (e.g., fast, medium, slow).'),
  retentionCapacity: z
    .string()
    .optional()
    .describe('The user’s retention capacity (e.g., high, medium, low).'),
});
export type KnowledgeConstructionInput = z.infer<typeof KnowledgeConstructionInputSchema>;

const KnowledgeConstructionOutputSchema = z.object({
  mindMap: z
    .string()
    .describe(
      'A dynamic mind map outlining key concepts, relationships, and practical applications related to the topic.'
    ),
  smartNotes: z
    .string()
    .describe(
      'Smart notes with definitions, explanations, practical examples, and key questions, personalized to the user’s learning style, pace, and retention capacity.'
    ),
});
export type KnowledgeConstructionOutput = z.infer<typeof KnowledgeConstructionOutputSchema>;

export async function knowledgeConstruction(
  input: KnowledgeConstructionInput
): Promise<KnowledgeConstructionOutput> {
  return knowledgeConstructionFlow(input);
}

const knowledgeConstructionPrompt = ai.definePrompt({
  name: 'knowledgeConstructionPrompt',
  input: {schema: KnowledgeConstructionInputSchema},
  output: {schema: KnowledgeConstructionOutputSchema},
  prompt: `You are an AI assistant helping students construct knowledge.

  Based on the topic, learning style, pace, and retention capacity, generate a dynamic mind map and smart notes.

  Topic: {{{topic}}}
  Learning Style: {{{learningStyle}}}
  Pace: {{{pace}}}
  Retention Capacity: {{{retentionCapacity}}}

  Mind Map:
  - Outline key concepts
  - Show relationships between concepts
  - Include practical applications

  Smart Notes:
  - Provide definitions
  - Give explanations
  - Offer practical examples
  - Pose key questions
  - Personalize to the user’s learning style, pace, and retention capacity.

  Ensure that the mind map and smart notes are well-organized, informative, and tailored to the user’s individual needs.
  The mindmap should be in markdown format.
  The smart notes should be in markdown format.
  `,
});

const knowledgeConstructionFlow = ai.defineFlow(
  {
    name: 'knowledgeConstructionFlow',
    inputSchema: KnowledgeConstructionInputSchema,
    outputSchema: KnowledgeConstructionOutputSchema,
  },
  async input => {
    const {output} = await knowledgeConstructionPrompt(input);
    return output!;
  }
);

