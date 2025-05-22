
'use server';
/**
 * @fileOverview Fluxo de IA para gerar flashcards sobre um tópico específico.
 *
 * - generateFlashcards - Uma função que gera um conjunto de flashcards (frente e verso).
 * - FlashcardGeneratorInput - O tipo de entrada para a função generateFlashcards.
 * - FlashcardGeneratorOutput - O tipo de retorno para a função generateFlashcards.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FlashcardSchema = z.object({
  front: z.string().describe("O texto da frente do flashcard (termo, pergunta curta, conceito)."),
  back: z.string().describe("O texto do verso do flashcard (definição concisa, resposta, explicação)."),
});

const FlashcardGeneratorInputSchema = z.object({
  topic: z.string().describe('O tópico principal para o qual os flashcards serão gerados.'),
  numberOfCards: z.number().min(1).max(20).describe('O número de flashcards a serem gerados (mínimo 1, máximo 20).'),
});
export type FlashcardGeneratorInput = z.infer<typeof FlashcardGeneratorInputSchema>;

const FlashcardGeneratorOutputSchema = z.object({
  flashcards: z.array(FlashcardSchema).describe('Uma lista dos flashcards gerados, cada um com uma frente e um verso.'),
});
export type FlashcardGeneratorOutput = z.infer<typeof FlashcardGeneratorOutputSchema>;

export async function generateFlashcards(input: FlashcardGeneratorInput): Promise<FlashcardGeneratorOutput> {
  return flashcardGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'flashcardGeneratorPrompt',
  input: {schema: FlashcardGeneratorInputSchema},
  output: {schema: FlashcardGeneratorOutputSchema},
  prompt: `Você é um assistente de IA especialista em criar materiais de estudo eficazes. Responda em português do Brasil.
Sua tarefa é gerar {{numberOfCards}} flashcards distintos e informativos sobre o tópico: "{{topic}}".

Para cada flashcard, forneça:
1.  **front**: Um termo-chave, um conceito fundamental, ou uma pergunta clara e direta relacionada ao tópico.
2.  **back**: A definição correspondente, uma explicação concisa do conceito, ou a resposta direta à pergunta da frente.

Instruções Adicionais:
-   Os flashcards devem ser atomicamente focados (um conceito principal por card).
-   A linguagem deve ser clara, precisa e adequada para estudo.
-   Evite informações excessivamente longas ou complexas no verso; priorize a concisão.
-   Varie o formato dos flashcards (perguntas, termos, etc.) se possível, dentro do contexto do tópico.
-   Certifique-se de que o conteúdo da frente e do verso esteja diretamente relacionado.

Formate a saída como um objeto JSON contendo uma chave "flashcards", que é um array de objetos. Cada objeto no array deve ter as chaves "front" e "back" com os respectivos textos.`,
});

const flashcardGeneratorFlow = ai.defineFlow(
  {
    name: 'flashcardGeneratorFlow',
    inputSchema: FlashcardGeneratorInputSchema,
    outputSchema: FlashcardGeneratorOutputSchema,
  },
  async (input: FlashcardGeneratorInput) => {
    const {output} = await prompt(input);
    return output!;
  }
);
