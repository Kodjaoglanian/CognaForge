'use server';
/**
 * @fileOverview Fluxo de IA para batalhas cognitivas com feedback de avaliação.
 * 
 * Este fluxo permite que a IA faça perguntas ao usuário e avalie suas respostas,
 * fornecendo feedback sobre a correção e precisão das respostas.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Schema para a entrada - a resposta do usuário e o contexto da pergunta
const CognitiveBattleInputSchema = z.object({
  userAnswer: z.string().describe('A resposta fornecida pelo usuário à pergunta anterior.'),
  question: z.string().describe('A pergunta que foi feita ao usuário.'),
  topic: z.string().describe('O tópico ou assunto sendo testado na batalha cognitiva.'),
  previousExchanges: z.array(
    z.object({
      question: z.string(),
      userAnswer: z.string(),
      evaluation: z.string().optional(),
    })
  ).optional().describe('Histórico de perguntas e respostas anteriores nesta batalha.'),
});
export type CognitiveBattleInput = z.infer<typeof CognitiveBattleInputSchema>;

// Schema para a saída - avaliação da resposta e próxima pergunta
const CognitiveBattleOutputSchema = z.object({
  evaluation: z.string().describe('Avaliação detalhada da resposta do usuário, indicando se está correta, parcialmente correta ou incorreta, com explicações.'),
  isCorrect: z.boolean().describe('Indicação booleana se a resposta está correta ou não.'),
  correctAnswer: z.string().describe('A resposta correta ou mais completa para a pergunta, caso a resposta do usuário não esteja totalmente correta.'),
  nextQuestion: z.string().describe('A próxima pergunta para continuar a batalha cognitiva, relacionada ao mesmo tópico.'),
});
export type CognitiveBattleOutput = z.infer<typeof CognitiveBattleOutputSchema>;

// Função exportada para avaliação de respostas em batalhas cognitivas
export async function evaluateAnswerAndContinue(input: CognitiveBattleInput): Promise<CognitiveBattleOutput> {
  return cognitiveBattleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'cognitiveBattlePrompt',
  input: {schema: CognitiveBattleInputSchema},
  output: {schema: CognitiveBattleOutputSchema},
  prompt: `Você é um educador especializado em avaliar respostas e fazer perguntas sobre tópicos acadêmicos. Responda em português do Brasil.

TÓPICO: {{topic}}

PERGUNTA ANTERIOR: {{question}}

RESPOSTA DO USUÁRIO: {{userAnswer}}

{{#if previousExchanges}}
HISTÓRICO DE INTERAÇÕES:
{{#each previousExchanges}}
Q: {{this.question}}
R: {{this.userAnswer}}
{{#if this.evaluation}}AVALIAÇÃO: {{this.evaluation}}{{/if}}

{{/each}}
{{/if}}

Sua tarefa é:

1. **evaluation**: Avaliar a resposta do usuário de forma educativa. Indique claramente se a resposta está:
   - CORRETA: Quando a resposta contém todos os pontos principais e está precisa.
   - PARCIALMENTE CORRETA: Quando a resposta tem alguns elementos corretos mas está incompleta ou tem pequenos erros.
   - INCORRETA: Quando a resposta contém erros significativos ou está completamente equivocada.
   
   Sempre comece sua avaliação com "Sua resposta está [CORRETA/PARCIALMENTE CORRETA/INCORRETA]:" seguido de uma explicação educativa.

2. **isCorrect**: Determinar se a resposta está correta (true) ou não (false).

3. **correctAnswer**: Fornecer a resposta correta ou mais completa, especialmente se a resposta do usuário estiver parcialmente correta ou incorreta.

4. **nextQuestion**: Formular uma nova pergunta relacionada ao mesmo tópico para continuar a batalha cognitiva. A pergunta deve ser desafiadora mas respondível, e deve construir sobre o conhecimento já demonstrado.

IMPORTANTE: Sempre avalie a resposta do usuário, mesmo quando for apenas uma frase curta ou parecer sem sentido. Nunca deixe de fornecer feedback claro.
`,
});

const cognitiveBattleFlow = ai.defineFlow(
  {
    name: 'cognitiveBattleFlow',
    inputSchema: CognitiveBattleInputSchema,
    outputSchema: CognitiveBattleOutputSchema,
  },
  async (input: CognitiveBattleInput) => {
    const {output} = await prompt(input);
    
    // Ensure proper format for output values with fallbacks
    const formattedOutput: CognitiveBattleOutput = {
      evaluation: output?.evaluation || 'Não foi possível avaliar sua resposta neste momento.',
      isCorrect: output?.isCorrect || false,
      correctAnswer: output?.correctAnswer || 'A resposta correta não está disponível neste momento.',
      nextQuestion: output?.nextQuestion || `Vamos continuar explorando o tópico "${input.topic}". O que mais você sabe sobre isso?`
    };
    
    // Ensure evaluation starts with clear correctness indicator if not already present
    if (!formattedOutput.evaluation.includes('CORRETA')) {
      const correctnessPrefix = formattedOutput.isCorrect 
        ? 'Sua resposta está CORRETA: '
        : 'Sua resposta está PARCIALMENTE CORRETA/INCORRETA: ';
      formattedOutput.evaluation = correctnessPrefix + formattedOutput.evaluation;
    }
    
    return formattedOutput;
  }
);

// Função para iniciar uma nova batalha cognitiva em um tópico específico
export async function startCognitiveBattle(topic: string): Promise<{question: string}> {
  // Define o prompt para gerar a pergunta inicial
  const initialQuestionPrompt = ai.definePrompt({
    name: 'initialCognitiveBattleQuestion',
    input: {schema: z.object({
      topic: z.string()
    })},
    output: {schema: z.object({
      question: z.string()
    })},
    prompt: `Crie uma pergunta inicial desafiadora mas respondível sobre o tópico "{{topic}}". 
    A pergunta deve ser específica e exigir conhecimento além do senso comum, mas ainda assim ser acessível 
    para alguém com conhecimento moderado do assunto. Responda em português do Brasil.`
  });
  
  const {output} = await initialQuestionPrompt({topic});
  return {question: output?.question || `O que você sabe sobre ${topic}?`};
}
