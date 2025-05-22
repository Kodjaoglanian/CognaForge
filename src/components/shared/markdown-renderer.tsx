'use client';

import React from 'react';
// Uma biblioteca Markdown adequada seria melhor para segurança e funcionalidades.
// Por enquanto, este é um renderizador muito básico.
// Ele não sanitiza a entrada, então use apenas com fontes Markdown confiáveis.

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Este componente tentará renderizar elementos básicos de markdown.
// Não é um parser completo. Para markdown complexo, use uma biblioteca.
// Por enquanto, ele estiliza principalmente texto pré-formatado.
export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  // Substituições básicas para demonstração. Um parser real é necessário para robustez.
  // Isto é altamente simplificado.
  // Regex para listas precisa ser melhorado para não quebrar em múltiplos itens.
  const formattedContent = content
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold my-4">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold my-3">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold my-2">$1</h3>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
    .replace(/^- (.*$)/gim, '<li class="ml-6 list-disc">$1</li>') // Item de lista básico
    .replace(/\n/g, '<br />'); // Substitui novas linhas por <br>

  return (
    <div
      className={`prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert max-w-none p-2 sm:p-4 bg-card text-card-foreground rounded-md ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: formattedContent || '<p>Nenhum conteúdo disponível.</p>' }}
    />
  );
}
