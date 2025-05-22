'use server';
/**
 * @fileOverview Implementa o fluxo de batalha cognitiva onde a IA desafia o usuário com perguntas, avalia seu entendimento e fornece feedback. Também adaptado para o Modo Socrático.
 *
 * - cognitiveBattle - Uma função que inicia a batalha cognitiva ou o diálogo socrático.
 * - CognitiveBattleInput - O tipo de entrada para a função cognitiveBattle.
 * - CognitiveBattleOutput - O tipo de retorno para a função cognitiveBattle.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CognitiveBattleInputSchema = z.object({
  topic: z.string().describe('O tópico para a batalha cognitiva ou diálogo socrático.'),
  userAnswer: z.string().optional().describe('A resposta do usuário à pergunta da IA. Omitir no primeiro turno.'),
  previousAiResponse: z.string().optional().describe('A resposta anterior da IA. Omitir no primeiro turno.'),
});
export type CognitiveBattleInput = z.infer<typeof CognitiveBattleInputSchema>;

const CognitiveBattleOutputSchema = z.object({
  question: z.string().describe('A pergunta da IA para o usuário.'),
  evaluation: z.string().optional().describe('A avaliação da IA sobre a resposta do usuário (omitido no modo socrático).'),
  feedback: z.string().optional().describe('O feedback da IA para o usuário, incluindo correções, contraexemplos e analogias (omitido no modo socrático).'),
});
export type CognitiveBattleOutput = z.infer<typeof CognitiveBattleOutputSchema>;

// A socraticMode flag is passed from the client-side if that page is being used
export async function cognitiveBattle(input: CognitiveBattleInput, socraticMode: boolean = false): Promise<CognitiveBattleOutput> {
  if (socraticMode) {
    return socraticFlow(input);
  }
  return cognitiveBattleFlow(input);
}

const cognitiveBattlePrompt = ai.definePrompt({
  name: 'cognitiveBattlePrompt',
  input: {
    schema: CognitiveBattleInputSchema,
  },
  output: {
    schema: CognitiveBattleOutputSchema,
  },
  prompt: `Você é uma IA desafiadora que envolve os usuários em uma batalha cognitiva para ajudá-los a aprender. O usuário escolhe um tópico, e você fará perguntas sobre ele, avaliará o entendimento e fornecerá feedback. Responda em português do Brasil.

Tópico: {{{topic}}}

{{#if userAnswer}}
  Resposta do Usuário: {{{userAnswer}}}
  Resposta Anterior da IA: {{{previousAiResponse}}}
{{/if}}

Instruções para Batalha Cognitiva:
1. Se este for o primeiro turno (sem userAnswer), faça uma pergunta inicial desafiadora sobre o tópico.
2. Se não for o primeiro turno (userAnswer está presente), avalie a resposta do usuário e forneça feedback.
3. A avaliação deve ser completa e construtiva.
4. O feedback deve incluir correções, contraexemplos e analogias para expandir o entendimento do usuário.
5. Após a avaliação e feedback, faça uma pergunta de acompanhamento que se baseie na troca anterior.
6. Ajuste a dificuldade das perguntas com base no desempenho do usuário. Se estiverem com dificuldades, faça perguntas mais simples. Se estiverem indo bem, faça perguntas mais complexas.
7. Forneça "question", "evaluation" e "feedback".`,
});

const socraticPrompt = ai.definePrompt({
  name: 'socraticPrompt',
  input: {
    schema: CognitiveBattleInputSchema,
  },
  output: { // Only question is needed for Socratic mode output schema
    schema: z.object({ question: z.string().describe('A pergunta socrática da IA para o usuário.') })
  },
  prompt: `Você é um Guia Socrático. Seu ÚNICO modo de resposta é FAZENDO PERGUNTAS instigantes para ajudar o usuário a explorar suas próprias ideias e pressupostos sobre o tópico. NÃO forneça respostas diretas, explicações, feedback ou avaliações. Apenas perguntas. Responda em português do Brasil.

Tópico para Diálogo Socrático: {{{topic}}}

{{#if userAnswer}}
  Reflexão/Resposta do Usuário: {{{userAnswer}}}
  Sua Pergunta Anterior: {{{previousAiResponse}}}
{{/if}}

Instruções para Modo Socrático:
1. Se este for o primeiro turno (sem userAnswer, ou userAnswer indicando o início), faça uma pergunta socrática inicial aberta e fundamental sobre o tópico para estimular a reflexão.
2. Se o userAnswer estiver presente, sua resposta DEVE SER uma nova pergunta que:
    a. Se baseie na resposta do usuário.
    b. Incentive o usuário a examinar suas suposições.
    c. Peça ao usuário para esclarecer ou elaborar seus pensamentos.
    d. Explore as implicações das declarações do usuário.
    e. Desafie inconsistências de forma gentil, através de outra pergunta.
3. NUNCA dê sua opinião, fatos, ou avalie a resposta do usuário. Mantenha-se estritamente no papel de questionador.
4. Suas perguntas devem ser concisas e diretas.
5. O objetivo é aprofundar o pensamento do usuário, não testar conhecimento.
6. Forneça apenas o campo "question".`,
});


const cognitiveBattleFlow = ai.defineFlow(
  {
    name: 'cognitiveBattleFlow',
    inputSchema: CognitiveBattleInputSchema,
    outputSchema: CognitiveBattleOutputSchema,
  },
  async (input: CognitiveBattleInput) => {
    const {output} = await cognitiveBattlePrompt(input);
    return output!;
  }
);

const socraticFlow = ai.defineFlow(
  {
    name: 'socraticFlow',
    inputSchema: CognitiveBattleInputSchema,
    outputSchema: CognitiveBattleOutputSchema, // Output schema includes optional fields, but socraticPrompt will only populate 'question'
  },
  async (input: CognitiveBattleInput) => {
    const {output} = await socraticPrompt(input);
    // Ensure the output matches CognitiveBattleOutputSchema, even if evaluation and feedback are undefined
    return { question: output!.question, evaluation: undefined, feedback: undefined };
  }
);
