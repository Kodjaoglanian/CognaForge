
'use client';

import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  if (typeof content !== 'string') {
    return <div className={`prose dark:prose-invert max-w-none ${className || ''}`}><p>Conteúdo inválido.</p></div>;
  }

  let html = content;

  // Code blocks (```lang\ncode\n``` or ```\ncode\n```) - process first to avoid conflicts
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const languageClass = lang ? `language-${lang}` : '';
    // Basic escaping for < and > within code blocks for safety
    const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<pre class="bg-muted p-2 rounded-md overflow-x-auto text-sm shadow-inner"><code class="${languageClass}">${escapedCode.trim()}</code></pre>`;
  });
  
  // Headings (H1, H2, H3)
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold my-2">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold my-3">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold my-4">$1</h1>');

  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 py-1 my-2 italic text-muted-foreground">$1</blockquote>');
  // Handle multi-line blockquotes by replacing subsequent lines if they don't have >
  // This is tricky with regex alone and might need a more robust parser for perfect results.
  // A simple approach for now: if a blockquote is followed by non-empty lines not starting with markdown,
  // they are considered part of it. A more robust parser would handle this better.
  html = html.replace(/<\/blockquote>\n<br \/>(?!<[h1-3]>|<[uo]l>|<li>|<pre>|<blockquote>)(.*)/gim, '</blockquote><br /><span class="italic text-muted-foreground">$1</span>');


  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>');
  
  // Bold and Italic (combined and separate)
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>'); // Bold + Italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');       // Bold
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');                 // Italic
  
  // Strikethrough
  html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');

  // Unordered lists
  html = html.replace(/^\s*[-*+] (.*$)/gim, '<li class="ml-6 list-disc">$1</li>');
  html = html.replace(/(<li>.*<\/li>\s*)+/gim, '<ul>$&</ul>'); // Wrap <li> groups in <ul>
  
  // Ordered lists
  html = html.replace(/^\s*\d+\. (.*$)/gim, '<li class="ml-6 list-decimal">$1</li>');
  html = html.replace(/(<li class="ml-6 list-decimal">.*<\/li>\s*)+/gim, '<ol>$&</ol>'); // Wrap <li> groups in <ol>

  // Inline code `code`
  html = html.replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>');
  
  // Paragraphs (wrap remaining lines that are not part of other elements)
  // This is a very basic way to handle paragraphs and might need refinement.
  // It wraps lines that don't seem to be part of other structures.
  // We will do this after other replacements.
  // First, ensure <ul> and <ol> are not wrapped again.
  html = html.split('\n').map(line => {
    if (line.trim() === '') return '<br />'; // Keep empty lines as breaks for spacing
    if (line.match(/^<(ul|ol|li|h[1-6]|blockquote|pre|code|del|strong|em|a)/i)) {
      return line; // Don't wrap already structured lines
    }
    return `<p class="my-1.5">${line}</p>`; // Wrap other lines in <p>
  }).join('');

  // Clean up potentially multiple <br /> tags from paragraph logic and original newlines
  html = html.replace(/(<br \/>\s*){2,}/g, '<br /><br />'); // Max two consecutive breaks for paragraph-like spacing
  html = html.replace(/^<br \/>|<br \/>$/g, ''); // Remove leading/trailing breaks


  return (
    <div
      className={`prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert max-w-none p-2 sm:p-4 ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: html || '<p class="text-muted-foreground">Comece a digitar para ver a pré-visualização...</p>' }}
    />
  );
}
