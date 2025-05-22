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

  Mapa Mental (Formato Markdown):
  - Delineie conceitos-chave.
  - Mostre relações entre conceitos.
  - Inclua aplicações práticas.
  - Use títulos Markdown (#, ##, ###) para estrutura e listas (- ou *) para itens.

  Anotações Inteligentes (Formato Markdown):
  - Forneça definições claras.
  - Dê explicações detalhadas.
  - Ofereça exemplos práticos e relevantes.
  - Apresente questões-chave para estimular o pensamento.
  - Personalize para o estilo de aprendizado, ritmo e capacidade de retenção do usuário, se especificados.
  - Use títulos Markdown, negrito (**exemplo**), itálico (*exemplo*) e listas para melhor organização.

  Certifique-se de que o mapa mental e as anotações inteligentes sejam bem organizados, informativos e adaptados às necessidades individuais do usuário.
  Ambos devem estar em formato Markdown e em português do Brasil.
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
    return output!;
  }
);
