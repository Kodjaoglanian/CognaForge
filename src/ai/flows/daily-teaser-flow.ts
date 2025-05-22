'use server';
/**
 * @fileOverview Gera quebra-cabeças mentais diários.
 *
 * - generateDailyTeaser - Uma função que retorna um quebra-cabeça e sua resposta.
 * - DailyTeaserInput - O tipo de entrada (vazio por enquanto).
 * - DailyTeaserOutput - O tipo de retorno com o quebra-cabeça e a resposta.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DailyTeaserInputSchema = z.object({}); // Entrada vazia por enquanto
export type DailyTeaserInput = z.infer<typeof DailyTeaserInputSchema>;

const DailyTeaserOutputSchema = z.object({
  teaser: z.string().describe('Um quebra-cabeça curto e envolvente, charada ou desafio lógico em português.'),
  answer: z.string().describe('A resposta para o quebra-cabeça, em português.'),
});
export type DailyTeaserOutput = z.infer<typeof DailyTeaserOutputSchema>;

export async function generateDailyTeaser(input: DailyTeaserInput = {}): Promise<DailyTeaserOutput> {
  return dailyTeaserFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dailyTeaserPrompt',
  input: {schema: DailyTeaserInputSchema},
  output: {schema: DailyTeaserOutputSchema},
  prompt: `Você é uma IA especializada em criar quebra-cabeças e charadas curtas, divertidas e instigantes para exercitar o cérebro.
Forneça um quebra-cabeça (teaser) e sua respectiva resposta (answer).
O quebra-cabeça deve ser em português do Brasil.
A resposta também deve ser em português do Brasil.
Seja criativo e variado nos tipos de quebra-cabeça. Por exemplo: "O que tem cidades, mas não casas; florestas, mas não árvores; e água, mas não peixes?" Resposta: "Um mapa". Ou "Tenho chaves, mas não abro portas. Tenho espaço, mas não tenho quartos. Você pode entrar, mas não pode sair. O que sou eu?" Resposta: "Um teclado".`,
});

const dailyTeaserFlow = ai.defineFlow(
  {
    name: 'dailyTeaserFlow',
    inputSchema: DailyTeaserInputSchema,
    outputSchema: DailyTeaserOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
