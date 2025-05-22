
'use server';
/**
 * @fileOverview Fluxo de IA para ajudar usuários a identificar e entender vieses cognitivos.
 *
 * - navigateCognitiveBias - Uma função que gera um cenário, pergunta inicial, e depois revela e explica um viés cognitivo.
 * - CognitiveBiasNavigatorInput - O tipo de entrada (vazio por enquanto).
 * - CognitiveBiasNavigatorOutput - O tipo de retorno com cenário, pergunta, nome do viés, explicação e prompt de reflexão.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CognitiveBiasNavigatorInputSchema = z.object({
  // Poderíamos adicionar aqui um tema ou tipo de viés no futuro, se desejado.
  // Por enquanto, a IA escolherá um viés e cenário.
});
export type CognitiveBiasNavigatorInput = z.infer<typeof CognitiveBiasNavigatorInputSchema>;

const CognitiveBiasNavigatorOutputSchema = z.object({
  scenario: z.string().describe('Um breve cenário ou problema onde um viés cognitivo pode surgir.'),
  initialQuestion: z.string().describe('Uma pergunta para o usuário refletir sobre o cenário antes de revelar o viés.'),
  biasName: z.string().describe('O nome do principal viés cognitivo identificado no cenário (ex: "Viés de Confirmação").'),
  biasExplanation: z.string().describe('Uma explicação clara do viés, como ele se manifesta no cenário e em geral.'),
  reflectionPrompt: z.string().describe('Uma pergunta ou sugestão para o usuário refletir sobre como o viés pode impactar seu pensamento ou decisões.'),
});
export type CognitiveBiasNavigatorOutput = z.infer<typeof CognitiveBiasNavigatorOutputSchema>;

export async function navigateCognitiveBias(input: CognitiveBiasNavigatorInput = {}): Promise<CognitiveBiasNavigatorOutput> {
  return cognitiveBiasNavigatorFlow(input);
}

const commonBiases = [
  "Viés de Confirmação", "Viés de Ancoragem", "Heurística da Disponibilidade", "Efeito Dunning-Kruger",
  "Viés Retrospectivo (Hindsight Bias)", "Viés de Auto-conveniência (Self-serving Bias)", "Efeito Forer (Barnum Effect)",
  "Viés de Negatividade", "Viés de Otimismo", "Falácia do Custo Irrecuperável (Sunk Cost Fallacy)",
  "Viés de Sobrevivência", "Viés de Ator-Observador", "Efeito Halo", "Pensamento de Grupo (Groupthink)",
  "Viés de Projeção"
];

const prompt = ai.definePrompt({
  name: 'cognitiveBiasNavigatorPrompt',
  input: {schema: CognitiveBiasNavigatorInputSchema},
  output: {schema: CognitiveBiasNavigatorOutputSchema},
  prompt: `Você é um especialista em psicologia cognitiva e vieses de pensamento. Responda em português do Brasil.
Sua tarefa é ajudar o usuário a entender um viés cognitivo específico.

1.  **Escolha um Viés:** Selecione um dos seguintes vieses cognitivos para focar: ${commonBiases.join(', ')}. Varie o viés escolhido a cada vez.
2.  **Crie um Cenário (scenario):** Desenvolva um cenário curto, cotidiano e relacionável (1-3 frases) onde o viés escolhido provavelmente influenciaria o julgamento ou a decisão de uma pessoa.
3.  **Formule uma Pergunta Inicial (initialQuestion):** Com base no cenário, faça uma pergunta aberta para o usuário refletir sobre como ele agiria ou o que pensaria na situação descrita, ANTES de você revelar o viés.
4.  **Nomeie o Viés (biasName):** Indique claramente o nome do viés escolhido.
5.  **Explique o Viés (biasExplanation):** Explique o que é o viés de forma concisa e clara. Descreva como ele se manifesta no cenário que você criou e forneça uma breve explicação geral do viés.
6.  **Crie um Prompt de Reflexão (reflectionPrompt):** Formule uma pergunta ou uma sugestão para o usuário pensar sobre como esse viés pode ter afetado suas próprias decisões no passado, ou como ele pode estar ciente dele no futuro.

Exemplo para "Viés de Confirmação":
Scenario: "Ana leu um artigo online que diz que dietas low-carb são as melhores para perder peso. Agora, ela só procura por outros artigos e depoimentos que confirmam essa ideia, ignorando estudos que mostram outros resultados."
InitialQuestion: "Se você fosse Ana e quisesse pesquisar sobre a melhor dieta, como você abordaria sua pesquisa para garantir uma visão equilibrada?"
BiasName: "Viés de Confirmação"
BiasExplanation: "O Viés de Confirmação é a tendência de buscar, interpretar, favorecer e recordar informações de uma maneira que confirme ou apoie crenças ou valores preexistentes. No cenário, Ana está ativamente buscando informações que validam sua crença inicial sobre dietas low-carb e descartando informações contrárias, o que a impede de ter uma visão completa e objetiva."
ReflectionPrompt: "Você consegue se lembrar de alguma situação em que buscou apenas informações que confirmassem algo que já acreditava? Como isso pode ter limitado sua perspectiva?"

Certifique-se de que todos os campos (scenario, initialQuestion, biasName, biasExplanation, reflectionPrompt) sejam preenchidos.
Mantenha o tom educativo e acessível.`,
});

const cognitiveBiasNavigatorFlow = ai.defineFlow(
  {
    name: 'cognitiveBiasNavigatorFlow',
    inputSchema: CognitiveBiasNavigatorInputSchema,
    outputSchema: CognitiveBiasNavigatorOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
