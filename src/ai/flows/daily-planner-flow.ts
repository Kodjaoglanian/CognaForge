
'use server';
/**
 * @fileOverview Fluxo de IA para auxiliar no planejamento diário.
 *
 * - planDayWithAI - Uma função que recebe a data, objetivo do dia e eventos, e retorna um plano e uma citação.
 * - DailyPlannerInput - O tipo de entrada para a função planDayWithAI.
 * - DailyPlannerOutput - O tipo de retorno para a função planDayWithAI.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EventSchema = z.object({
  id: z.string(),
  time: z.string().describe("Hora do evento, ex: 09:00, 14:30."),
  title: z.string().describe("Título ou nome do evento."),
  description: z.string().optional().describe("Descrição opcional do evento."),
});

const DailyPlannerInputSchema = z.object({
  date: z.string().describe('A data para a qual o planejamento está sendo feito (ex: 2024-05-25).'),
  mainGoal: z.string().describe('O objetivo principal definido pelo usuário para este dia.'),
  existingEvents: z.array(EventSchema).optional().describe('Uma lista de eventos já agendados para este dia.'),
});
export type DailyPlannerInput = z.infer<typeof DailyPlannerInputSchema>;

const DailyPlannerOutputSchema = z.object({
  actionPlan: z.string().describe('Um plano de ação sugerido em formato Markdown, com tarefas e possíveis blocos de tempo para atingir o objetivo principal, considerando os eventos existentes.'),
  motivationalQuote: z.string().describe('Uma citação motivacional curta e inspiradora para o dia.'),
});
export type DailyPlannerOutput = z.infer<typeof DailyPlannerOutputSchema>;

export async function planDayWithAI(input: DailyPlannerInput): Promise<DailyPlannerOutput> {
  return dailyPlannerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dailyPlannerPrompt',
  input: {schema: DailyPlannerInputSchema},
  output: {schema: DailyPlannerOutputSchema},
  prompt: `Você é um assistente de planejamento e produtividade altamente eficaz. Responda em português do Brasil.
O usuário deseja planejar o dia {{date}}.
O objetivo principal para hoje é: "{{mainGoal}}".

{{#if existingEvents}}
Eventos já agendados para hoje:
{{#each existingEvents}}
- {{this.time}}: {{this.title}}{{#if this.description}} ({{this.description}}){{/if}}
{{/each}}
{{else}}
Não há eventos pré-agendados para hoje.
{{/if}}

Sua tarefa é:
1.  **actionPlan**: Criar um plano de ação prático e realista em formato Markdown para ajudar o usuário a atingir seu objetivo principal ("{{mainGoal}}"). Considere os eventos existentes ao sugerir horários ou blocos de tempo. O plano deve ser uma lista de tarefas ou sugestões de blocos de tempo. Seja específico e acionável.
2.  **motivationalQuote**: Fornecer uma citação motivacional curta, relevante e inspiradora para o dia.

Exemplo de Plano de Ação (Markdown):
\`\`\`markdown
### Plano para Conquistar "{{mainGoal}}"

*   **Bloco da Manhã (antes dos eventos, se houver):**
    *   [ ] Dedicar 1h30min para pesquisa inicial sobre X.
    *   [ ] Esboçar os primeiros tópicos de Y.
*   **Durante o dia (entre eventos, se aplicável):**
    *   [ ] Revisar anotações Z por 30min.
*   **Bloco da Tarde/Noite (após eventos, se houver):**
    *   [ ] Desenvolver o protótipo W por 2h.
    *   [ ] Preparar a apresentação para amanhã.
*   **Lembretes:**
    *   Não se esqueça de fazer pausas curtas.
    *   Mantenha o foco no objetivo principal.
\`\`\`

Se não houver eventos, crie um plano focado inteiramente no objetivo principal.
Adapte a estrutura do plano conforme necessário.
O plano deve ser útil e encorajador.
`,
});

const dailyPlannerFlow = ai.defineFlow(
  {
    name: 'dailyPlannerFlow',
    inputSchema: DailyPlannerInputSchema,
    outputSchema: DailyPlannerOutputSchema,
  },
  async (input: DailyPlannerInput) => {
    const {output} = await prompt(input);
    return output!;
  }
);
