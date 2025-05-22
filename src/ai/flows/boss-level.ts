'use server';
/**
 * @fileOverview Implementa o fluxo de geração de desafios de nível "chefão" (Boss Level).
 *
 * - generateBossLevelChallenge - Uma função que gera um desafio de nível chefão baseado no tópico do usuário.
 * - BossLevelInput - O tipo de entrada para a função generateBossLevelChallenge.
 * - BossLevelOutput - O tipo de retorno para a função generateBossLevelChallenge.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BossLevelInputSchema = z.object({
  topic: z.string().describe('O tópico para o qual gerar um desafio de Nível Desafiador.'),
  userContext: z
    .string()
    .describe('Contexto relevante do usuário para a geração do Nível Desafiador.'),
});
export type BossLevelInput = z.infer<typeof BossLevelInputSchema>;

const BossLevelOutputSchema = z.object({
  challenge: z.string().describe('O desafio de Nível Desafiador gerado.'),
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
  prompt: `Você é uma IA que gera questões desafiadoras de "Nível Desafiador" (Boss Level) para estudantes testarem seus conhecimentos sobre um determinado tópico. Responda em português do Brasil.

    Tópico: {{{topic}}}

    Contexto do Usuário: {{{userContext}}}

    Gere um desafio complexo, prático e aberto que exija que o aluno aplique seus conhecimentos e habilidades de pensamento crítico. O desafio deve ser envolvente e relevante para o tópico.

    Desafio:`,
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
