// 'use server';
/**
 * @fileOverview Implements the boss level challenge generation flow.
 *
 * - generateBossLevelChallenge - A function that generates a boss level challenge based on the user's topic.
 * - BossLevelInput - The input type for the generateBossLevelChallenge function.
 * - BossLevelOutput - The return type for the generateBossLevelChallenge function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BossLevelInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate a boss level challenge.'),
  userContext: z
    .string() // Changed from data URI to string
    .describe('Relevant user context for boss level generation.'),
});
export type BossLevelInput = z.infer<typeof BossLevelInputSchema>;

const BossLevelOutputSchema = z.object({
  challenge: z.string().describe('The generated boss level challenge.'),
});
export type BossLevelOutput = z.infer<typeof BossLevelOutputSchema>;

export async function generateBossLevelChallenge(
  input: BossLevelInput
): Promise<BossLevelOutput> {
  return bossLevelFlow(input);
}

const prompt = ai.definePrompt({
  name: 'bossLevelPrompt',
  input: {schema: BossLevelInputSchema},
  output: {schema: BossLevelOutputSchema},
  prompt: `You are an AI that generates challenging "boss level" questions for students to test their knowledge of a given topic.

    Topic: {{{topic}}}

    User Context: {{{userContext}}}

    Generate a complex, practical, and open-ended boss level challenge that requires the student to apply their knowledge and critical thinking skills. The challenge should be engaging and relevant to the topic.

    Challenge:`,
});

const bossLevelFlow = ai.defineFlow(
  {
    name: 'bossLevelFlow',
    inputSchema: BossLevelInputSchema,
    outputSchema: BossLevelOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
