
'use server';
/**
 * @fileOverview Fluxo de IA para clarificar conceitos complexos.
 *
 * - clarifyConcept - Uma função que recebe um conceito e retorna uma explicação simplificada, analogia, pontos-chave e uma pergunta.
 * - ConceptClarifierInput - O tipo de entrada para a função clarifyConcept.
 * - ConceptClarifierOutput - O tipo de retorno para a função clarifyConcept.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConceptClarifierInputSchema = z.object({
  concept: z.string().describe('O conceito, termo ou ideia que o usuário deseja clarificar.'),
});
export type ConceptClarifierInput = z.infer<typeof ConceptClarifierInputSchema>;

const ConceptClarifierOutputSchema = z.object({
  simplifiedExplanation: z.string().describe('Uma explicação clara e concisa do conceito, em linguagem simples.'),
  analogy: z.string().describe('Uma analogia ou metáfora para ajudar a entender o conceito de forma intuitiva.'),
  keyPoints: z.array(z.string()).describe('Uma lista dos 3-5 pontos mais importantes sobre o conceito.'),
  understandingQuestion: z.string().describe('Uma pergunta formulada para o usuário verificar sua compreensão inicial do conceito.'),
});
export type ConceptClarifierOutput = z.infer<typeof ConceptClarifierOutputSchema>;

export async function clarifyConcept(input: ConceptClarifierInput): Promise<ConceptClarifierOutput> {
  return conceptClarifierFlow(input);
}

const prompt = ai.definePrompt({
  name: 'conceptClarifierPrompt',
  input: {schema: ConceptClarifierInputSchema},
  output: {schema: ConceptClarifierOutputSchema},
  prompt: `Você é um educador especialista em simplificar conceitos complexos. Responda em português do Brasil.
O usuário fornecerá um conceito que eles acham difícil de entender.
Seu objetivo é clarificar este conceito da seguinte forma:

Conceito Fornecido: {{{concept}}}

1.  **Explicação Simplificada**: Descreva o conceito de forma clara, concisa e usando linguagem acessível. Evite jargões desnecessários.
2.  **Analogia**: Crie uma analogia ou metáfora poderosa que torne o conceito mais intuitivo e relacionável.
3.  **Pontos-Chave**: Liste de 3 a 5 pontos essenciais que resumem os aspectos mais importantes do conceito.
4.  **Pergunta para Compreensão**: Formule uma pergunta aberta e reflexiva que ajude o usuário a pensar sobre o conceito e verificar se ele entendeu a ideia principal. Não deve ser uma pergunta de "sim/não" ou de múltipla escolha.

Certifique-se de que todas as partes da sua resposta sejam úteis e contribuam para uma melhor compreensão do "{{concept}}".
Organize a resposta nos campos definidos: simplifiedExplanation, analogy, keyPoints (como um array de strings), understandingQuestion.`,
});

const conceptClarifierFlow = ai.defineFlow(
  {
    name: 'conceptClarifierFlow',
    inputSchema: ConceptClarifierInputSchema,
    outputSchema: ConceptClarifierOutputSchema,
  },
  async (input: ConceptClarifierInput) => {
    const {output} = await prompt(input);
    return output!;
  }
);

