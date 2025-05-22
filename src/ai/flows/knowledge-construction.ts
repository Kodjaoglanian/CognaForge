'use server'; // Corrected directive placement

/**
 * @fileOverview Fluxo de IA para cocriação de mapas mentais dinâmicos e anotações inteligentes.
 *
 * - knowledgeConstruction - Uma função que orquestra o processo de construção do conhecimento.
 * - KnowledgeConstructionInput - O tipo de entrada para a função knowledgeConstruction.
 * - KnowledgeConstructionOutput - O tipo de retorno para a função knowledgeConstruction.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const KnowledgeConstructionInputSchema = z.object({
  topic: z.string().describe('O tópico para a construção do conhecimento.'),
  learningStyle: z
    .string()
    .optional()
    .describe(
      'O estilo de aprendizado preferido do usuário (ex: Visual, Auditivo, Cinestésico, Leitura/Escrita).'
    ),
  pace: z.string().optional().describe('O ritmo de aprendizado desejado (ex: Rápido, Médio, Lento).'),
  retentionCapacity: z
    .string()
    .optional()
    .describe('A capacidade de retenção do usuário (ex: Alta, Média, Baixa).'),
});
export type KnowledgeConstructionInput = z.infer<typeof KnowledgeConstructionInputSchema>;

const KnowledgeConstructionOutputSchema = z.object({
  mindMap: z
    .string()
    .describe(
      'Um mapa mental dinâmico em formato Markdown, delineando conceitos-chave, relações e aplicações práticas relacionadas ao tópico.'
    ),
  smartNotes: z
    .string()
    .describe(
      'Anotações inteligentes em formato Markdown com definições, explicações, exemplos práticos e questões-chave, personalizadas ao estilo de aprendizado, ritmo e capacidade de retenção do usuário.'
    ),
});
export type KnowledgeConstructionOutput = z.infer<typeof KnowledgeConstructionOutputSchema>;

export async function knowledgeConstruction(
  input: KnowledgeConstructionInput
): Promise<KnowledgeConstructionOutput> {
  return knowledgeConstructionFlow(input);
}

const knowledgeConstructionPrompt = ai.definePrompt({
  name: 'knowledgeConstructionPrompt',
  input: {schema: KnowledgeConstructionInputSchema},
  output: {schema: KnowledgeConstructionOutputSchema},
  prompt: `Você é um assistente de IA ajudando estudantes a construir conhecimento. Responda em português do Brasil.

  Com base no tópico, estilo de aprendizado, ritmo e capacidade de retenção, gere um mapa mental dinâmico e anotações inteligentes.

  Tópico: {{{topic}}}
  Estilo de Aprendizagem: {{#if learningStyle}}{{{learningStyle}}}{{else}}Não especificado{{/if}}
  Ritmo: {{#if pace}}{{{pace}}}{{else}}Não especificado{{/if}}
  Capacidade de Retenção: {{#if retentionCapacity}}{{{retentionCapacity}}}{{else}}Não especificada{{/if}}

  FORMATO DE RESPOSTA:
  Para o campo "mindMap", crie um mapa mental organizado com a seguinte estrutura:

  # [Título do Tópico]
  
  ## Conceitos-Chave
  - Conceito 1
  - Conceito 2
  
  ## Relações entre Conceitos
  - Relação 1
  - Relação 2
  
  ## Aplicações Práticas
  - Aplicação 1
  - Aplicação 2

  Para o campo "smartNotes", crie anotações inteligentes com a seguinte estrutura:

  # Anotações sobre [Título do Tópico]
  
  ## Definições
  **Termo 1**: Explicação do termo 1
  **Termo 2**: Explicação do termo 2
  
  ## Exemplos Práticos
  1. Primeiro exemplo
  2. Segundo exemplo
  
  ## Questões para Reflexão
  - Questão 1?
  - Questão 2?

  IMPORTANTE: 
  - Use apenas formatação Markdown válida
  - NÃO inclua caracteres '[' ou ']' isolados no início de linhas
  - NÃO use caracteres '\\n' literais - use quebras de linha reais
  - Formate corretamente os títulos com espaço após # (ex: "# Título" e não "#Título")
  - Use listas com espaço após o marcador (ex: "- Item" e não "-Item")
  
  Certifique-se de que o mapa mental e as anotações inteligentes sejam bem organizados, informativos e adaptados às necessidades individuais do usuário.
  `,
});

const knowledgeConstructionFlow = ai.defineFlow(
  {
    name: 'knowledgeConstructionFlow',
    inputSchema: KnowledgeConstructionInputSchema,
    outputSchema: KnowledgeConstructionOutputSchema,
  },
  async input => {
    const {output} = await knowledgeConstructionPrompt(input);
    
    // Ensure proper formatting of the output
    const formattedOutput: KnowledgeConstructionOutput = {
      mindMap: '',
      smartNotes: ''
    };
    
    // Process mindMap - convert escape sequences to actual line breaks
    if (output?.mindMap) {
      formattedOutput.mindMap = processMarkdown(output.mindMap);
    }
    
    // Process smartNotes - convert escape sequences to actual line breaks
    if (output?.smartNotes) {
      formattedOutput.smartNotes = processMarkdown(output.smartNotes);
    }
    
    return formattedOutput;
  }
);

// Helper function to process markdown with literal escape sequences
function processMarkdown(text: string): string {
  if (!text) return '';
  
  // Remove any JSON artifacts like square brackets at start/end
  let processed = text.trim()
    .replace(/^\s*\[\s*/, '')  // Remove leading [
    .replace(/\s*\]\s*$/, '')  // Remove trailing ]
    .replace(/\\n/g, '\n')     // Replace literal \n with actual line breaks
    .replace(/\\"/g, '"')      // Replace escaped quotes
    .replace(/\\\\/g, '\\');   // Replace double backslashes
  
  // Remove any JSON escape artifacts
  processed = processed.replace(/\\([^\\])/g, '$1');
  
  // Ensure proper markdown headers (add space after #)
  processed = processed.replace(/^(#+)([^\s#])/gm, '$1 $2');
  
  // Ensure proper markdown list items (add space after - or *)
  processed = processed.replace(/^([*-])([^\s*-])/gm, '$1 $2');
  
  // Add proper formatting for titles if missing
  if (!processed.trim().startsWith('#')) {
    const lines = processed.trim().split('\n');
    const firstLine = lines[0];
    if (firstLine && firstLine.length > 0) {
      processed = `# ${firstLine}\n\n${lines.slice(1).join('\n')}`;
    }
  }
  
  // Fix common formatting issues
  processed = processed
    // Fix double line breaks
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    // Remove isolated brackets
    .replace(/^\s*\[\s*$/gm, '')
    .replace(/^\s*\]\s*$/gm, '');
  
  return processed;
}
