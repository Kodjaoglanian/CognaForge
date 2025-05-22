'use server';
/**
 * @fileOverview Implements the cognitive battle flow where the AI challenges the user with questions, evaluates their understanding, and provides feedback.
 *
 * - cognitiveBattle - A function that initiates the cognitive battle.
 * - CognitiveBattleInput - The input type for the cognitiveBattle function.
 * - CognitiveBattleOutput - The return type for the cognitiveBattle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CognitiveBattleInputSchema = z.object({
  topic: z.string().describe('The topic for the cognitive battle.'),
  userAnswer: z.string().optional().describe('The user\u0027s answer to the AI\u0027s question.  Omit for the first turn.'),
  previousAiResponse: z.string().optional().describe('The AI\u0027s previous response.  Omit for the first turn.'),
});
export type CognitiveBattleInput = z.infer<typeof CognitiveBattleInputSchema>;

const CognitiveBattleOutputSchema = z.object({
  question: z.string().describe('The AI\u0027s question for the user.'),
  evaluation: z.string().describe('The AI\u0027s evaluation of the user\u0027s answer.'),
  feedback: z.string().describe('The AI\u0027s feedback to the user, including corrections, counter-examples, and analogies.'),
});
export type CognitiveBattleOutput = z.infer<typeof CognitiveBattleOutputSchema>;

export async function cognitiveBattle(input: CognitiveBattleInput): Promise<CognitiveBattleOutput> {
  return cognitiveBattleFlow(input);
}

const cognitiveBattlePrompt = ai.definePrompt({
  name: 'cognitiveBattlePrompt',
  input: {
    schema: CognitiveBattleInputSchema,
  },
  output: {
    schema: CognitiveBattleOutputSchema,
  },
  prompt: `You are a challenging AI that engages users in a cognitive battle to help them learn.  The user chooses a topic, and you will ask them questions about it, evaluate their understanding, and provide feedback.

Topic: {{{topic}}}

{{#if userAnswer}}
  User Answer: {{{userAnswer}}}
  Previous AI Response: {{{previousAiResponse}}}
{{/if}}

Instructions:
1.  If this is the first turn (no userAnswer), ask an initial challenging question about the topic.
2.  If this is not the first turn (userAnswer is present), evaluate the user\u0027s answer and provide feedback.
3.  The evaluation should be thorough and constructive.
4.  The feedback should include corrections, counter-examples, and analogies to expand the user\u0027s understanding.
5.  After the evaluation and feedback, ask a follow-up question that builds upon the previous exchange.
6.  Adjust the difficulty of the questions based on the user\u0027s performance. If they are struggling, ask simpler questions. If they are doing well, ask more complex questions.
`,
});

const cognitiveBattleFlow = ai.defineFlow(
  {
    name: 'cognitiveBattleFlow',
    inputSchema: CognitiveBattleInputSchema,
    outputSchema: CognitiveBattleOutputSchema,
  },
  async input => {
    const {output} = await cognitiveBattlePrompt(input);
    return output!;
  }
);
