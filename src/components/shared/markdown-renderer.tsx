'use client';

import React from 'react';
// A proper Markdown library would be better for security and features.
// For now, this is a very basic renderer.
// It does not sanitize input, so only use with trusted Markdown sources.

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// This component will attempt to render basic markdown elements.
// It's not a full parser. For complex markdown, use a library.
// For now, it mainly styles preformatted text.
export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  // Basic replacements for demonstration. A real parser is needed for robustness.
  // This is highly simplified.
  const formattedContent = content
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold my-4">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold my-3">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold my-2">$1</h3>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
    .replace(/^- (.*$)/gim, '<li class="ml-6 list-disc">$1</li>') // Basic list item
    .replace(/\n/g, '<br />'); // Replace newlines with <br>

  return (
    <div
      className={`prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert max-w-none p-4 bg-card text-card-foreground rounded-md shadow ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: formattedContent || '<p>No content available.</p>' }}
    />
  );
}

// Fallback/Alternative if dangerouslySetInnerHTML is too risky or simple preformatted text is preferred:
/*
export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <pre className={`whitespace-pre-wrap p-4 bg-card text-card-foreground rounded-md shadow text-sm ${className || ''}`}>
      {content || 'No content available.'}
    </pre>
  );
}
*/
