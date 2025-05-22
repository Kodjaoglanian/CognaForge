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
1.  **actionPlan**: Criar um plano de ação prático e realista em formato Markdown para ajudar o usuário a atingir seu objetivo principal. Considere os eventos existentes ao sugerir horários ou blocos de tempo. O plano deve ser uma lista de tarefas ou sugestões de blocos de tempo. Seja específico e acionável.
2.  **motivationalQuote**: Fornecer uma citação motivacional curta, relevante e inspiradora para o dia.

Exemplo de Plano de Ação (formatação):

### Plano para Conquistar [objetivo do usuário]

*   **Bloco da Manhã (antes dos eventos, se houver):**
    *   [ ] Dedicar 1h30min para [atividade específica].
    *   [ ] Esboçar [outra atividade].
*   **Durante o dia (entre eventos, se aplicável):**
    *   [ ] Revisar [atividade] por 30min.
*   **Bloco da Tarde/Noite (após eventos, se houver):**
    *   [ ] Desenvolver [atividade] por 2h.
    *   [ ] Preparar [atividade].
*   **Lembretes:**
    *   Não se esqueça de fazer pausas curtas.
    *   Mantenha o foco no objetivo principal.

IMPORTANTE: O campo actionPlan deve conter o plano completo como uma única string formatada em Markdown. NÃO use variáveis de template como {{mainGoal}} na sua resposta.

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
    
    // Ensure proper format for output values
    const formattedOutput: DailyPlannerOutput = {
      actionPlan: '',
      motivationalQuote: ''
    };
    
    // Handle actionPlan - convert from array to string if needed
    if (output?.actionPlan) {
      if (Array.isArray(output.actionPlan)) {
        // Join array items with newlines to create proper markdown
        formattedOutput.actionPlan = `### Plano para Conquistar "${input.mainGoal}"\n\n` + 
          output.actionPlan.join('\n\n');
      } else if (typeof output.actionPlan === 'string') {
        // Fix common issues with actionPlan content
        let plan = output.actionPlan;
        
        // Replace escaped quotes and template variables
        plan = plan.replace(/\\"/g, '"')
                  .replace(/\\\\/g, '\\')
                  .replace(/\{\{mainGoal\}\}/g, input.mainGoal);
        
        // If plan looks truncated or malformed, add a basic structure
        if (plan.length < 50 || !plan.includes('Bloco')) {
          plan = `### Plano para Conquistar "${input.mainGoal}"\n\n` +
                 `*   **Tarefas para alcançar seu objetivo:**\n` +
                 `    *   [ ] Pesquisar sobre ${input.mainGoal}\n` +
                 `    *   [ ] Organizar recursos necessários\n` +
                 `    *   [ ] Executar as etapas principais\n` +
                 `    *   [ ] Revisar progresso\n\n` +
                 `*   **Lembretes:**\n` +
                 `    *   Faça pausas regulares\n` +
                 `    *   Mantenha o foco no objetivo principal`;
        }
        
        formattedOutput.actionPlan = plan;
      } else {
        // Fallback for unexpected type
        formattedOutput.actionPlan = `### Plano para Conquistar "${input.mainGoal}"\n\n` +
          "* Defina as etapas necessárias para alcançar seu objetivo\n" +
          "* Organize seu tempo considerando os eventos do dia\n" +
          "* Priorize as tarefas mais importantes\n" +
          "* Revisite seu progresso ao longo do dia";
      }
    } else {
      // Fallback if no actionPlan was provided
      formattedOutput.actionPlan = `### Plano para Conquistar "${input.mainGoal}"\n\n` +
        "* Defina as etapas necessárias para alcançar seu objetivo\n" +
        "* Organize seu tempo considerando os eventos do dia\n" +
        "* Priorize as tarefas mais importantes\n" +
        "* Revisite seu progresso ao longo do dia";
    }
    
    // Handle motivationalQuote
    if (output?.motivationalQuote) {
      formattedOutput.motivationalQuote = 
        typeof output.motivationalQuote === 'string' 
          ? output.motivationalQuote 
          : Array.isArray(output.motivationalQuote) 
            ? output.motivationalQuote.join(' ') 
            : String(output.motivationalQuote);
    } else {
      // Fallback quote if none provided
      formattedOutput.motivationalQuote = "Cada passo que você dá hoje é um investimento no seu futuro.";
    }
    
    return formattedOutput;
  }
);
