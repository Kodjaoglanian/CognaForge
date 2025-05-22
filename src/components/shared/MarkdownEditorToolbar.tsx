
'use client';

import type { Dispatch, SetStateAction, RefObject } from 'react';
import { Button } from '@/components/ui/button';
import {
  Bold, Italic, Link, Quote, List, ListOrdered, Code, FileCode, Heading1, Heading2, Heading3, Pilcrow // Added Pilcrow as a placeholder
} from 'lucide-react';

interface MarkdownEditorToolbarProps {
  content: string;
  setContent: Dispatch<SetStateAction<string>>;
  textareaRef: RefObject<HTMLTextAreaElement>;
}

type ToolbarAction =
  | 'bold' | 'italic' | 'link' | 'quote'
  | 'ul' | 'ol' | 'code' | 'codeBlock'
  | 'h1' | 'h2' | 'h3';

export function MarkdownEditorToolbar({ content, setContent, textareaRef }: MarkdownEditorToolbarProps) {
  const handleToolbarAction = (action: ToolbarAction) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let newContent = '';
    let prefix = '';
    let suffix = '';
    let newCursorPos = start;

    switch (action) {
      case 'bold':
        prefix = '**';
        suffix = '**';
        newCursorPos = start + prefix.length;
        break;
      case 'italic':
        prefix = '*';
        suffix = '*';
        newCursorPos = start + prefix.length;
        break;
      case 'link':
        const url = prompt('Digite a URL do link:', 'https://');
        if (url) {
          prefix = `[${selectedText || 'texto do link'}](${url})`;
          suffix = '';
          newContent = content.substring(0, start) + prefix + content.substring(end);
          setContent(newContent);
          setTimeout(() => { // Ensure focus and selection update after state change
            textarea.focus();
            textarea.setSelectionRange(start, start + prefix.length);
          }, 0);
          return;
        }
        return; // No URL provided
      case 'quote':
        // For multi-line selection, prepend > to each line
        if (selectedText.includes('\n')) {
            const lines = selectedText.split('\n');
            const quotedLines = lines.map(line => `> ${line}`).join('\n');
            newContent = content.substring(0, start) + quotedLines + content.substring(end);
            newCursorPos = end + lines.length; // Add 1 for each '>' and space
        } else {
            prefix = '> ';
            newCursorPos = start + prefix.length;
        }
        break;
      case 'ul':
         prefix = '- ';
         newCursorPos = start + prefix.length;
        // if multi-line selection, apply to each line
        if (selectedText.includes('\n')) {
            const lines = selectedText.split('\n');
            const listItems = lines.map(line => `- ${line}`).join('\n');
            newContent = content.substring(0, start) + listItems + content.substring(end);
            setContent(newContent);
            textarea.focus();
            textarea.setSelectionRange(start, start + listItems.length);
            return;
        }
        break;
      case 'ol':
        prefix = '1. ';
        newCursorPos = start + prefix.length;
        // if multi-line selection, apply to each line, basic numbering
         if (selectedText.includes('\n')) {
            const lines = selectedText.split('\n');
            const listItems = lines.map((line, index) => `${index + 1}. ${line}`).join('\n');
            newContent = content.substring(0, start) + listItems + content.substring(end);
            setContent(newContent);
            textarea.focus();
            textarea.setSelectionRange(start, start + listItems.length);
            return;
        }
        break;
      case 'code':
        prefix = '`';
        suffix = '`';
        newCursorPos = start + prefix.length;
        break;
      case 'codeBlock':
        prefix = '```\n';
        suffix = '\n```';
        newContent = content.substring(0, start) + prefix + selectedText + suffix + content.substring(end);
        setContent(newContent);
         setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
        }, 0);
        return;
      case 'h1':
        prefix = '# ';
        newCursorPos = start + prefix.length;
        break;
      case 'h2':
        prefix = '## ';
        newCursorPos = start + prefix.length;
        break;
      case 'h3':
        prefix = '### ';
        newCursorPos = start + prefix.length;
        break;
      default:
        return;
    }

    if (newContent === '') { // Default behavior for most single prefix/suffix actions
        newContent = content.substring(0, start) + prefix + selectedText + suffix + content.substring(end);
    }
    
    setContent(newContent);

    // Refocus and set cursor. Needs timeout to wait for state update.
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
      } else {
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const toolbarItems = [
    { action: 'bold', icon: Bold, label: 'Negrito' },
    { action: 'italic', icon: Italic, label: 'Itálico' },
    { action: 'link', icon: Link, label: 'Link' },
    { action: 'quote', icon: Quote, label: 'Citação' },
    { action: 'ul', icon: List, label: 'Lista (Marcadores)' },
    { action: 'ol', icon: ListOrdered, label: 'Lista (Numerada)' },
    { action: 'code', icon: Code, label: 'Código Inline' },
    { action: 'codeBlock', icon: FileCode, label: 'Bloco de Código' },
    { action: 'h1', icon: Heading1, label: 'Cabeçalho 1' },
    { action: 'h2', icon: Heading2, label: 'Cabeçalho 2' },
    { action: 'h3', icon: Heading3, label: 'Cabeçalho 3' },
  ];

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50 rounded-t-md">
      {toolbarItems.map(item => (
        <Button
          key={item.action}
          variant="ghost"
          size="icon"
          onClick={() => handleToolbarAction(item.action as ToolbarAction)}
          title={item.label}
          className="h-8 w-8"
        >
          <item.icon className="h-4 w-4" />
          <span className="sr-only">{item.label}</span>
        </Button>
      ))}
    </div>
  );
}
