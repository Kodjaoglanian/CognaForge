
'use server';
/**
 * @fileOverview Fluxo de IA para resumir o conteúdo de uma nota.
 *
 * - summarizeNote - Uma função que recebe o conteúdo de uma nota e retorna um resumo.
 * - SummarizeNoteInput - O tipo de entrada para a função summarizeNote.
 * - SummarizeNoteOutput - O tipo de retorno para a função summarizeNote.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeNoteInputSchema = z.object({
  noteContent: z.string().min(20, { message: "O conteúdo da nota precisa ter pelo menos 20 caracteres." }).describe('O conteúdo Markdown da nota a ser resumida.'),
});
export type SummarizeNoteInput = z.infer<typeof SummarizeNoteInputSchema>;

const SummarizeNoteOutputSchema = z.object({
  summary: z.string().describe('Um resumo conciso do conteúdo da nota fornecido.'),
});
export type SummarizeNoteOutput = z.infer<typeof SummarizeNoteOutputSchema>;

export async function summarizeNote(input: SummarizeNoteInput): Promise<SummarizeNoteOutput> {
  return summarizeNoteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeNotePrompt',
  input: {schema: SummarizeNoteInputSchema},
  output: {schema: SummarizeNoteOutputSchema},
  prompt: `Você é um assistente de IA especialista em resumir textos de forma eficaz. Responda em português do Brasil.
Por favor, gere um resumo conciso e informativo para o seguinte conteúdo de uma nota:

---
{{{noteContent}}}
---

O resumo deve capturar as ideias principais e os pontos mais importantes do texto.
Seja claro e direto ao ponto.`,
});

const summarizeNoteFlow = ai.defineFlow(
  {
    name: 'summarizeNoteFlow',
    inputSchema: SummarizeNoteInputSchema,
    outputSchema: SummarizeNoteOutputSchema,
  },
  async (input: SummarizeNoteInput) => {
    const {output} = await prompt(input);
    return output!;
  }
);
