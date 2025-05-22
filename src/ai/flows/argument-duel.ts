// Argument Duels
'use server';
/**
 * @fileOverview Implements argument duels where the AI takes an opposing stance to force the user to defend their position.
 *
 * - argumentDuel - A function that initiates and manages the argument duel process.
 * - ArgumentDuelInput - The input type for the argumentDuel function, including the topic and user's stance.
 * - ArgumentDuelOutput - The return type for the argumentDuel function, providing feedback and recommendations.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ArgumentDuelInputSchema = z.object({
  topic: z.string().describe('The topic of the argument duel.'),
  userStance: z.string().describe('The user\'s stance on the topic.'),
});
export type ArgumentDuelInput = z.infer<typeof ArgumentDuelInputSchema>;

const ArgumentDuelOutputSchema = z.object({
  aiCritique: z.string().describe('The AI\'s critique of the user\'s arguments, identifying flaws and weaknesses.'),
  reasoningFlaws: z.string().describe('A detailed analysis of the user\'s reasoning flaws during the duel.'),
  improvementRecommendations: z.string().describe('Specific recommendations for improving the user\'s argumentation skills.'),
});
export type ArgumentDuelOutput = z.infer<typeof ArgumentDuelOutputSchema>;

export async function argumentDuel(input: ArgumentDuelInput): Promise<ArgumentDuelOutput> {
  return argumentDuelFlow(input);
}

const prompt = ai.definePrompt({
  name: 'argumentDuelPrompt',
  input: {schema: ArgumentDuelInputSchema},
  output: {schema: ArgumentDuelOutputSchema},
  prompt: `You are an expert debater. Engage the user in an argument duel on the following topic: {{topic}}.
The user\'s stance is: {{userStance}}.

Your goal is to challenge the user\'s reasoning, identify flaws in their arguments, and provide specific recommendations for improvement.

After the debate, provide a critique of the user\'s arguments, a detailed analysis of their reasoning flaws, and recommendations for improving their argumentation skills.

Critique:
Reasoning Flaws:
Recommendations:`,
});

const argumentDuelFlow = ai.defineFlow(
  {
    name: 'argumentDuelFlow',
    inputSchema: ArgumentDuelInputSchema,
    outputSchema: ArgumentDuelOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
