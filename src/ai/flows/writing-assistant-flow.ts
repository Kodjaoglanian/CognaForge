
'use server';
/**
 * @fileOverview Fluxo de IA para auxiliar na escrita de notas.
 *
 * - writingAssistant - Uma função que recebe o contexto da nota e um prompt do usuário para gerar sugestões de texto.
 * - WritingAssistantInput - O tipo de entrada para a função writingAssistant.
 * - WritingAssistantOutput - O tipo de retorno para a função writingAssistant.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WritingAssistantInputSchema = z.object({
  noteContext: z.string().describe('O conteúdo atual da nota que serve de contexto para a IA.'),
  userPrompt: z.string().describe('O comando ou pedido do usuário para o assistente de escrita (ex: "Continue esta ideia:", "Crie 3 pontos sobre...").'),
});
export type WritingAssistantInput = z.infer<typeof WritingAssistantInputSchema>;

const WritingAssistantOutputSchema = z.object({
  suggestedText: z.string().describe('O texto sugerido pela IA com base no contexto da nota e no prompt do usuário.'),
});
export type WritingAssistantOutput = z.infer<typeof WritingAssistantOutputSchema>;

export async function writingAssistant(input: WritingAssistantInput): Promise<WritingAssistantOutput> {
  return writingAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'writingAssistantPrompt',
  input: {schema: WritingAssistantInputSchema},
  output: {schema: WritingAssistantOutputSchema},
  prompt: `Você é um assistente de escrita IA prestativo e criativo. Responda em português do Brasil.
O usuário está escrevendo uma nota e precisa da sua ajuda.

Contexto da Nota Atual:
---
{{{noteContext}}}
---

Pedido do Usuário: "{{userPrompt}}"

Com base no contexto da nota e no pedido do usuário, gere uma sugestão de texto relevante e útil.
Se o pedido for para continuar o texto, faça-o de forma coerente.
Se for para criar pontos, liste-os claramente.
Se for para reescrever, mantenha o significado original, mas aplique as alterações solicitadas.
Mantenha o tom apropriado para uma anotação.

Texto Sugerido:`,
});

const writingAssistantFlow = ai.defineFlow(
  {
    name: 'writingAssistantFlow',
    inputSchema: WritingAssistantInputSchema,
    outputSchema: WritingAssistantOutputSchema,
  },
  async (input: WritingAssistantInput) => {
    const {output} = await prompt(input);
    return output!;
  }
);
