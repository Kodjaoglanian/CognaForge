'use server';

/**
 * @fileOverview Fluxo de IA para o modo socrático de diálogo, evitando repetição de perguntas.
 * 
 * Este fluxo implementa o método socrático de questionamento, onde a IA guia o usuário
 * através de uma série de perguntas que ajudam a aprofundar o pensamento sobre um tópico.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Esquema para a entrada do modo socrático
const SocraticModeInputSchema = z.object({
  topic: z.string().describe('O tópico ou conceito sendo explorado no diálogo socrático.'),
  userResponse: z.string().describe('A resposta mais recente do usuário à pergunta anterior.'),
  previousExchanges: z.array(
    z.object({
      question: z.string().describe('Pergunta feita pela IA.'),
      answer: z.string().describe('Resposta dada pelo usuário.')
    })
  ).optional().describe('Histórico de trocas anteriores no diálogo.'),
  currentQuestion: z.string().optional().describe('A pergunta atual que foi respondida pelo usuário.'),
});
export type SocraticModeInput = z.infer<typeof SocraticModeInputSchema>;

// Esquema para a saída do modo socrático
const SocraticModeOutputSchema = z.object({
  nextQuestion: z.string().describe('A próxima pergunta para aprofundar o diálogo socrático.'),
  analysis: z.string().describe('Análise interna da resposta do usuário (não mostrada ao usuário).'),
  dialogueStage: z.string().describe('Estágio atual do diálogo (ex: inicial, intermediário, avançado, conclusivo).'),
});
export type SocraticModeOutput = z.infer<typeof SocraticModeOutputSchema>;

// Função exportada para continuar um diálogo socrático
export async function continueSocraticDialogue(input: SocraticModeInput): Promise<SocraticModeOutput> {
  return socraticModeFlow(input);
}

// Função para iniciar um novo diálogo socrático
export async function startSocraticDialogue(topic: string): Promise<{question: string}> {
  const initialQuestionPrompt = ai.definePrompt({
    name: 'initialSocraticQuestion',
    input: {schema: z.object({topic: z.string()})},
    output: {schema: z.object({question: z.string()})},
    prompt: `Crie uma pergunta inicial provocativa e aberta no estilo socrático sobre o tópico "${topic}".
    A pergunta deve ser formulada para estimular o pensamento crítico e a reflexão profunda.
    Evite perguntas que possam ser respondidas com sim/não ou respostas simples.
    Responda em português do Brasil.`
  });
  
  const {output} = await initialQuestionPrompt({topic});
  return {question: output?.question || `O que você entende por '${topic}'?`};
}

const socraticPrompt = ai.definePrompt({
  name: 'socraticModePrompt',
  input: {schema: SocraticModeInputSchema},
  output: {schema: SocraticModeOutputSchema},
  prompt: `Você é um guia socrático especializado em estimular o pensamento crítico através de perguntas.
  Seu objetivo é conduzir um diálogo socrático sobre o tópico "{{topic}}" sem repetir perguntas.

  RESPOSTA ATUAL DO USUÁRIO: {{userResponse}}
  
  {{#if currentQuestion}}
  PERGUNTA ATUAL QUE GEROU ESTA RESPOSTA: {{currentQuestion}}
  {{/if}}

  {{#if previousExchanges}}
  HISTÓRICO DO DIÁLOGO:
  {{#each previousExchanges}}
  P: {{this.question}}
  R: {{this.answer}}
  
  {{/each}}
  {{/if}}

  Sua tarefa é:

  1. **analysis**: Analisar brevemente a resposta do usuário, identificando pressupostos, contradições, insights ou áreas que precisam ser mais exploradas.
  
  2. **nextQuestion**: Formular uma NOVA pergunta socrática (nunca repetir perguntas anteriores) que:
     - Aprofunde o raciocínio do usuário
     - Desafie pressupostos ou contradições
     - Explore implicações da perspectiva apresentada
     - Leve a uma compreensão mais profunda do tópico
  
  3. **dialogueStage**: Identificar o estágio atual do diálogo:
     - "inicial": Primeiras trocas, estabelecendo entendimento básico
     - "intermediário": Explorando contradições e nuances
     - "avançado": Aprofundando implicações e conexões
     - "conclusivo": Aproximando-se de insights finais ou síntese

  IMPORTANTE:
  - NUNCA repita uma pergunta já feita no diálogo.
  - Formule perguntas abertas e provocativas.
  - Adapte seu questionamento ao nível de sofisticação das respostas do usuário.
  - Mantenha o tom respeitoso e genuinamente inquisitivo.
  - Evite introduzir suas próprias opiniões ou conclusões.
  - Siga a tradição socrática de "parteira de ideias", ajudando o usuário a dar à luz suas próprias compreensões.
  `,
});

const socraticModeFlow = ai.defineFlow(
  {
    name: 'socraticModeFlow',
    inputSchema: SocraticModeInputSchema,
    outputSchema: SocraticModeOutputSchema,
  },
  async (input: SocraticModeInput) => {
    // Verifica se a próxima pergunta seria uma repetição
    const allPreviousQuestions = [
      ...(input.previousExchanges?.map(exchange => exchange.question) || []),
      input.currentQuestion
    ].filter(Boolean);
    
    // Tenta até 3 vezes obter uma pergunta não repetida
    let attempts = 0;
    let output;
    let result: SocraticModeOutput;
    
    while (attempts < 3) {
      output = await socraticPrompt(input);
      
      if (!output) {
        break; // Falha na geração, usar fallback
      }
      
      const nextQuestion = output.nextQuestion;
      
      // Verifica similaridade com perguntas anteriores
      const isRepetition = allPreviousQuestions.some(prevQuestion => {
        if (!prevQuestion) return false;
        
        // Calcula similaridade básica removendo pontuação e comparando palavras-chave
        const normalize = (str: string) => str.toLowerCase()
          .replace(/[.,?!;:]/g, '')
          .split(' ')
          .filter(word => word.length > 3)
          .sort()
          .join(' ');
          
        const normalizedPrev = normalize(prevQuestion);
        const normalizedNext = normalize(nextQuestion);
        
        // Se há 70% ou mais de palavras-chave semelhantes, considera repetição
        const similarity = normalizedPrev.split(' ')
          .filter(word => normalizedNext.includes(word)).length / 
          normalizedPrev.split(' ').length;
          
        return similarity > 0.7;
      });
      
      if (!isRepetition) {
        break; // Encontrou uma pergunta não repetida
      }
      
      // Adiciona instrução específica para evitar repetições
      input = {
        ...input,
        topic: `${input.topic} (IMPORTANTE: Evite perguntas similares a: "${nextQuestion}")`
      };
      
      attempts++;
    }
    
    // Se todas as tentativas falharam ou não foi possível gerar, use um fallback
    if (!output || attempts === 3) {
      const fallbackQuestions = [
        `De que outra perspectiva podemos analisar "${input.topic}"?`,
        `Quais consequências práticas você vê se aplicarmos este entendimento de "${input.topic}" ao mundo real?`,
        `Como sua visão sobre "${input.topic}" se relaciona com outros conceitos fundamentais?`,
        `O que seria necessário para mudar sua compreensão atual sobre "${input.topic}"?`,
        `Que evidências sustentam ou contradizem sua posição sobre "${input.topic}"?`
      ];
      
      // Escolhe uma pergunta aleatória do fallback
      const randomQuestion = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
      
      result = {
        nextQuestion: randomQuestion,
        analysis: "Utilizando pergunta de fallback devido à dificuldade em gerar uma pergunta não repetitiva.",
        dialogueStage: input.previousExchanges && input.previousExchanges.length > 5 ? "avançado" : "intermediário"
      };
    } else {
      result = output;
    }
    
    return result;
  }
);
