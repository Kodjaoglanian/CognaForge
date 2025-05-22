
'use server';
/**
 * @fileOverview Simula uma entrevista de emprego com base no cargo e persona do entrevistador.
 *
 * - simulateInterview - Uma função que gerencia a simulação da entrevista.
 * - InterviewSimulatorInput - O tipo de entrada para a função simulateInterview.
 * - InterviewSimulatorOutput - O tipo de retorno para a função simulateInterview.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InterviewHistoryItemSchema = z.object({
  sender: z.enum(['user', 'ai']),
  message: z.string(),
});

const InterviewSimulatorInputSchema = z.object({
  jobRole: z.string().describe('O cargo para o qual o usuário está sendo entrevistado. Ex: Engenheiro de Software Pleno.'),
  interviewerPersona: z.string().describe('A persona do entrevistador. Ex: Técnico Detalhista, Gerente de Contratação Amigável.'),
  userAnswer: z.string().optional().describe('A resposta do usuário à pergunta anterior da IA. Omitir no primeiro turno da entrevista.'),
  interviewHistory: z.array(InterviewHistoryItemSchema).optional().describe('O histórico da conversa da entrevista até o momento. A IA deve fazer a próxima pergunta com base nisso.'),
});
export type InterviewSimulatorInput = z.infer<typeof InterviewSimulatorInputSchema>;

const InterviewSimulatorOutputSchema = z.object({
  aiQuestion: z.string().describe('A pergunta do entrevistador (IA) para o usuário.'),
  feedbackOnAnswer: z.string().optional().describe('Feedback construtivo sobre a última resposta do usuário. Pode ser omitido se for a primeira pergunta.'),
});
export type InterviewSimulatorOutput = z.infer<typeof InterviewSimulatorOutputSchema>;

export async function simulateInterview(input: InterviewSimulatorInput): Promise<InterviewSimulatorOutput> {
  return interviewSimulatorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'interviewSimulatorPrompt',
  input: {schema: InterviewSimulatorInputSchema},
  output: {schema: InterviewSimulatorOutputSchema},
  prompt: `Você é um sistema de IA que simula uma entrevista de emprego. Responda em português do Brasil.
Assuma a persona de um entrevistador para o cargo de "{{jobRole}}".
Sua persona como entrevistador é: "{{interviewerPersona}}".

Histórico da Entrevista até agora:
{{#if interviewHistory}}
{{#each interviewHistory}}
[{{this.sender}}]: {{this.message}}
{{/each}}
{{else}}
(Esta é a primeira pergunta da entrevista)
{{/if}}

{{#if userAnswer}}
Resposta anterior do usuário à sua última pergunta: "{{userAnswer}}"
Agora, forneça:
1.  **feedbackOnAnswer**: Um feedback conciso e construtivo sobre a resposta do usuário ("{{userAnswer}}"). Seja específico sobre pontos fortes e áreas de melhoria, considerando o cargo e a sua persona. Se for a primeira pergunta, omita o feedback.
2.  **aiQuestion**: Sua próxima pergunta para o usuário, relevante para o cargo, sua persona e o fluxo da conversa.
{{else}}
Agora, forneça:
1.  **aiQuestion**: Sua primeira pergunta para o usuário, relevante para o cargo e sua persona.
{{/if}}

Instruções para a IA:
-   No 'Histórico da Entrevista', [user]: precede a resposta do aluno, e [ai]: precede a sua pergunta (IA).
-   Faça perguntas abertas e específicas do cargo.
-   Adapte o tom e o tipo de pergunta à persona do entrevistador definida.
-   Se o usuário fornecer uma resposta, o feedback deve ser útil e acionável.
-   Evite perguntas genéricas demais.
-   Mantenha a entrevista focada e profissional.
-   O objetivo é ajudar o usuário a praticar e melhorar suas habilidades de entrevista.
-   Seja criativo com as perguntas, simulando um cenário real.
`,
});

const interviewSimulatorFlow = ai.defineFlow(
  {
    name: 'interviewSimulatorFlow',
    inputSchema: InterviewSimulatorInputSchema,
    outputSchema: InterviewSimulatorOutputSchema,
  },
  async (input: InterviewSimulatorInput) => {
    const {output} = await prompt(input);
    // Ensure feedbackOnAnswer is undefined if it's an empty string or if no user answer was provided.
    if (!input.userAnswer || output?.feedbackOnAnswer === '') {
        return { aiQuestion: output!.aiQuestion, feedbackOnAnswer: undefined };
    }
    return output!;
  }
);

