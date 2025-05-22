
'use server';
/**
 * @fileOverview Fluxo de IA para analisar textos, gerando resumo, pontos-chave e palavras-chave.
 *
 * - analyzeText - Uma função que recebe um texto e retorna sua análise.
 * - TextAnalyzerInput - O tipo de entrada para a função analyzeText.
 * - TextAnalyzerOutput - O tipo de retorno para a função analyzeText.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TextAnalyzerInputSchema = z.object({
  textToAnalyze: z.string().min(50, { message: "O texto precisa ter pelo menos 50 caracteres." }).describe('O texto a ser analisado.'),
});
export type TextAnalyzerInput = z.infer<typeof TextAnalyzerInputSchema>;

const TextAnalyzerOutputSchema = z.object({
  summary: z.string().describe('Um resumo conciso do texto fornecido.'),
  keyPoints: z.array(z.string()).describe('Uma lista dos principais pontos-chave ou argumentos do texto.'),
  keywords: z.array(z.string()).describe('Uma lista das palavras-chave mais relevantes identificadas no texto.'),
});
export type TextAnalyzerOutput = z.infer<typeof TextAnalyzerOutputSchema>;

export async function analyzeText(input: TextAnalyzerInput): Promise<TextAnalyzerOutput> {
  return textAnalyzerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'textAnalyzerPrompt',
  input: {schema: TextAnalyzerInputSchema},
  output: {schema: TextAnalyzerOutputSchema},
  prompt: `Você é um assistente de IA especialista em análise e sumarização de textos. Responda em português do Brasil.
Analise o seguinte texto:
---
{{{textToAnalyze}}}
---

Sua tarefa é:
1.  **summary**: Gerar um resumo conciso e informativo do texto.
2.  **keyPoints**: Extrair os principais pontos-chave ou argumentos do texto. Apresente-os como um array de strings, onde cada string é um ponto principal.
3.  **keywords**: Identificar as palavras-chave mais relevantes do texto (entre 3 a 7 palavras-chave). Apresente-as como um array de strings.

Certifique-se de que a saída esteja estritamente no formato JSON especificado pelo outputSchema.
Os pontos-chave devem ser frases completas ou sentenças que capturem as ideias centrais.
As palavras-chave devem ser termos únicos ou bigramas significativos.`,
});

const textAnalyzerFlow = ai.defineFlow(
  {
    name: 'textAnalyzerFlow',
    inputSchema: TextAnalyzerInputSchema,
    outputSchema: TextAnalyzerOutputSchema,
  },
  async (input: TextAnalyzerInput) => {
    const {output} = await prompt(input);
    return output!;
  }
);
