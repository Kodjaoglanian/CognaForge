'use server';
/**
 * @fileOverview Implementa duelos argumentativos onde a IA assume uma postura oposta para forçar o usuário a defender sua posição.
 *
 * - argumentDuel - Uma função que inicia e gerencia o processo de duelo argumentativo.
 * - ArgumentDuelInput - O tipo de entrada para a função argumentDuel, incluindo o tópico e a posição do usuário.
 * - ArgumentDuelOutput - O tipo de retorno para a função argumentDuel, fornecendo feedback e recomendações.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ArgumentDuelInputSchema = z.object({
  topic: z.string().describe('O tópico do duelo argumentativo.'),
  userStance: z.string().describe('A posição do usuário sobre o tópico.'),
});
export type ArgumentDuelInput = z.infer<typeof ArgumentDuelInputSchema>;

const ArgumentDuelOutputSchema = z.object({
  aiCritique: z.string().describe('A crítica da IA aos argumentos do usuário, identificando falhas e fraquezas.'),
  reasoningFlaws: z.string().describe('Uma análise detalhada das falhas de raciocínio do usuário durante o duelo.'),
  improvementRecommendations: z.string().describe('Recomendações específicas para melhorar as habilidades de argumentação do usuário.'),
});
export type ArgumentDuelOutput = z.infer<typeof ArgumentDuelOutputSchema>;

export async function argumentDuel(input: ArgumentDuelInput): Promise<ArgumentDuelOutput> {
  return argumentDuelFlow(input);
}

const prompt = ai.definePrompt({
  name: 'argumentDuelPrompt',
  input: {schema: ArgumentDuelInputSchema},
  output: {schema: ArgumentDuelOutputSchema},
  prompt: `Você é um debatedor especialista. Envolva o usuário em um duelo argumentativo sobre o seguinte tópico: {{topic}}.
A posição do usuário é: {{userStance}}.

Seu objetivo é desafiar o raciocínio do usuário, identificar falhas em seus argumentos e fornecer recomendações específicas para melhoria. Responda em português do Brasil.

Após o debate, forneça:
Crítica: [Crítica concisa e construtiva dos argumentos do usuário]
Falhas de Raciocínio: [Análise detalhada das falhas lógicas ou pontos fracos no raciocínio do usuário]
Recomendações: [Sugestões claras e acionáveis para o usuário aprimorar suas habilidades de argumentação]`,
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
