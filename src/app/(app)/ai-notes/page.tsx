
'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { PageTitle } from '@/components/shared/page-title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { summarizeNote, type SummarizeNoteInput } from '@/ai/flows/summarize-note-flow';
import { writingAssistant, type WritingAssistantInput } from '@/ai/flows/writing-assistant-flow'; // Importando o novo fluxo
import { Loader2, AlertCircle, PlusCircle, Save, FileText, Trash2, StickyNote, Lightbulb, Wand2, MessageSquarePlus, Copy, CornerDownLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MarkdownRenderer } from '@/components/shared/markdown-renderer';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface Note {
  id: string;
  title: string;
  content: string;
  summary?: string;
  createdAt: number;
}

export default function AINotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentContent, setCurrentContent] = useState('');
  const [currentSummary, setCurrentSummary] = useState<string | undefined>(undefined);

  const [isLoading, setIsLoading] = useState(false); // General loading for save/delete
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para o Assistente de Escrita
  const [writingPrompt, setWritingPrompt] = useState('');
  const [assistantSuggestion, setAssistantSuggestion] = useState<string | undefined>(undefined);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem('ai-notes-data');
      if (savedNotes) {
        const parsedNotes = JSON.parse(savedNotes);
        if (Array.isArray(parsedNotes)) {
          setNotes(parsedNotes.sort((a,b) => b.createdAt - a.createdAt));
        }
      }
    } catch (e) {
      console.error("Failed to load notes from localStorage", e);
    }
  }, []);

  useEffect(() => {
    if (notes.length > 0 || localStorage.getItem('ai-notes-data') !== null) {
        try {
            localStorage.setItem('ai-notes-data', JSON.stringify(notes));
        } catch (e) {
            console.error("Failed to save notes to localStorage", e);
        }
    }
  }, [notes]);

  const handleNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Nova Anotação',
      content: `# Comece a escrever sua anotação aqui...\n\nUse **Markdown** para formatar seu texto.`,
      createdAt: Date.now(),
    };
    setNotes(prev => [newNote, ...prev].sort((a,b) => b.createdAt - a.createdAt));
    setSelectedNoteId(newNote.id);
    setCurrentTitle(newNote.title);
    setCurrentContent(newNote.content);
    setCurrentSummary(undefined);
    setAssistantSuggestion(undefined);
    setWritingPrompt('');
    setError(null);
  };

  const handleSelectNote = (noteId: string) => {
    if (isLoading || isSummarizing || isGeneratingSuggestion) return;
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setSelectedNoteId(note.id);
      setCurrentTitle(note.title);
      setCurrentContent(note.content);
      setCurrentSummary(note.summary);
      setAssistantSuggestion(undefined);
      setWritingPrompt('');
      setError(null);
    }
  };

  const handleSaveNote = () => {
    if (!selectedNoteId) return;
    if (!currentTitle.trim()) {
        toast({ title: 'Título Necessário', description: 'Sua anotação precisa de um título.', variant: 'destructive'});
        return;
    }
    setIsLoading(true);
    setNotes(prev => 
      prev.map(n => 
        n.id === selectedNoteId ? { ...n, title: currentTitle, content: currentContent, summary: currentSummary } : n
      ).sort((a,b) => b.createdAt - a.createdAt)
    );
    toast({ title: 'Anotação Salva!', description: `"${currentTitle}" foi salva com sucesso.`, variant: 'default' });
    setIsLoading(false);
  };

  const handleDeleteNote = (noteId: string) => {
    if (!noteId || isLoading || isSummarizing || isGeneratingSuggestion) return;
    setIsLoading(true);
    setNotes(prev => prev.filter(n => n.id !== noteId));
    if (selectedNoteId === noteId) {
      setSelectedNoteId(null);
      setCurrentTitle('');
      setCurrentContent('');
      setCurrentSummary(undefined);
      setAssistantSuggestion(undefined);
      setWritingPrompt('');
    }
    toast({ title: 'Anotação Excluída!', variant: 'default' });
    setIsLoading(false);
  };

  const handleSummarize = async () => {
    if (!selectedNoteId || !currentContent.trim()) {
      toast({ title: 'Conteúdo Necessário', description: 'Escreva algo na anotação antes de resumir.', variant: 'destructive' });
      return;
    }
    if (currentContent.trim().length < 20) {
      toast({ title: 'Conteúdo Muito Curto', description: 'O conteúdo da nota precisa ter pelo menos 20 caracteres para ser resumido.', variant: 'destructive' });
      return;
    }

    setIsSummarizing(true);
    setError(null);
    try {
      const input: SummarizeNoteInput = { noteContent: currentContent };
      const result = await summarizeNote(input);
      setCurrentSummary(result.summary);
      setNotes(prev => 
        prev.map(n => 
          n.id === selectedNoteId ? { ...n, summary: result.summary } : n
        )
      );
      toast({ title: 'Resumo Gerado!', description: 'A IA criou um resumo para sua anotação.', variant: 'default' });
    } catch (err) {
      console.error("Erro ao resumir:", err);
      setError('Falha ao gerar o resumo. Tente novamente.');
      toast({ title: 'Erro no Resumo', description: 'A IA não conseguiu gerar um resumo.', variant: 'destructive' });
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleGenerateSuggestion = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedNoteId || !writingPrompt.trim()) {
      toast({ title: 'Comando Necessário', description: 'Diga à IA o que você quer que ela faça.', variant: 'destructive' });
      return;
    }
    setIsGeneratingSuggestion(true);
    setError(null);
    setAssistantSuggestion(undefined);
    try {
      const input: WritingAssistantInput = { noteContext: currentContent, userPrompt: writingPrompt };
      const result = await writingAssistant(input);
      setAssistantSuggestion(result.suggestedText);
      toast({ title: 'Sugestão Gerada!', description: 'A IA preparou uma sugestão para você.', variant: 'default' });
    } catch (err) {
      console.error("Erro ao gerar sugestão:", err);
      setError('Falha ao gerar sugestão. Tente novamente.');
      toast({ title: 'Erro na Sugestão', description: 'A IA não conseguiu gerar uma sugestão.', variant: 'destructive' });
    } finally {
      setIsGeneratingSuggestion(false);
    }
  };

  const handleCopySuggestion = () => {
    if (assistantSuggestion) {
      navigator.clipboard.writeText(assistantSuggestion);
      toast({ title: 'Copiado!', description: 'Sugestão da IA copiada para a área de transferência.' });
    }
  };

  const handleAppendSuggestion = () => {
    if (assistantSuggestion) {
      setCurrentContent(prev => `${prev}\n\n${assistantSuggestion}`);
      setAssistantSuggestion(undefined); // Limpa a sugestão após anexar
      toast({ title: 'Anexado!', description: 'Sugestão da IA adicionada ao final da sua nota.' });
    }
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]"> {/* Ajustado para dar mais espaço, ex: 8rem */}
      <PageTitle
        title="Caderno IA de Anotações"
        description="Crie, edite e organize suas anotações. Use a IA para resumos e assistência de escrita."
      />

      <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
        <Card className="md:col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Minhas Anotações
              <Button size="sm" onClick={handleNewNote} disabled={isLoading || isSummarizing || isGeneratingSuggestion}>
                <PlusCircle className="mr-2 h-4 w-4" /> Nova
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-y-auto p-0">
            <ScrollArea className="h-full">
              {notes.length === 0 && (
                <div className="p-6 text-center text-muted-foreground">
                  <StickyNote className="mx-auto h-12 w-12 mb-2" />
                  Nenhuma anotação ainda. Clique em "Nova" para começar!
                </div>
              )}
              <ul className="p-2 space-y-1">
                {notes.map(note => (
                  <li key={note.id}
                      className={cn(
                        "w-full text-left h-auto py-2 px-3 rounded-md flex items-center transition-colors group",
                        isLoading || isSummarizing || isGeneratingSuggestion
                            ? "opacity-60 cursor-not-allowed"
                            : "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        selectedNoteId === note.id
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : isLoading || isSummarizing || isGeneratingSuggestion ? "bg-transparent text-foreground" : "hover:bg-accent hover:text-accent-foreground bg-transparent text-foreground"
                      )}
                      onClick={isLoading || isSummarizing || isGeneratingSuggestion ? undefined : () => handleSelectNote(note.id)}
                      onKeyDown={isLoading || isSummarizing || isGeneratingSuggestion ? undefined : (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleSelectNote(note.id);
                          }
                      }}
                      role="button"
                      tabIndex={isLoading || isSummarizing || isGeneratingSuggestion ? -1 : 0}
                      aria-disabled={isLoading || isSummarizing || isGeneratingSuggestion}
                      aria-current={selectedNoteId === note.id ? "page" : undefined}
                  >
                    <FileText className={cn("mr-2 h-4 w-4 flex-shrink-0", selectedNoteId === note.id ? "text-primary-foreground/80" : "text-muted-foreground group-hover:text-accent-foreground")} />
                    <span className="truncate flex-grow mr-2">{note.title}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-6 w-6 ml-auto text-muted-foreground hover:text-destructive flex-shrink-0 p-1 opacity-50 group-hover:opacity-100 focus:opacity-100",
                        selectedNoteId === note.id && "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-destructive"
                      )}
                      onClick={(e) => { 
                          e.stopPropagation();
                          if (isLoading || isSummarizing || isGeneratingSuggestion) return;
                          handleDeleteNote(note.id); 
                      }}
                      disabled={isLoading || isSummarizing || isGeneratingSuggestion}
                      aria-label={`Excluir anotação ${note.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 flex flex-col h-full overflow-hidden">
          {!selectedNoteId ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                <StickyNote className="h-16 w-16 mb-4" />
                <h2 className="text-xl font-semibold">Selecione uma anotação</h2>
                <p>Ou crie uma nova para começar a escrever.</p>
            </div>
          ) : (
            <>
              <CardHeader className="flex-shrink-0">
                <Label htmlFor="note-title" className="sr-only">Título</Label>
                <Input
                  id="note-title"
                  value={currentTitle}
                  onChange={(e) => setCurrentTitle(e.target.value)}
                  placeholder="Título da sua anotação..."
                  className="text-xl font-semibold border-0 shadow-none focus-visible:ring-0 px-1"
                  disabled={isLoading || isSummarizing || isGeneratingSuggestion}
                />
              </CardHeader>
              
              <CardContent className="flex-grow flex flex-col gap-4 overflow-y-auto p-6">
                <div className="flex flex-col flex-grow min-h-[200px]"> {/* Editor com altura mínima e crescimento */}
                  <Label htmlFor="note-content" className="mb-1 text-sm font-medium">Conteúdo (Markdown)</Label>
                  <Textarea
                    id="note-content"
                    value={currentContent}
                    onChange={(e) => setCurrentContent(e.target.value)}
                    placeholder="Escreva sua anotação aqui usando Markdown..."
                    className="flex-grow resize-none text-base"
                    disabled={isLoading || isSummarizing || isGeneratingSuggestion}
                  />
                </div>
                
                <div className="flex flex-col flex-grow min-h-[200px]"> {/* Preview com altura mínima e crescimento */}
                    <Label className="mb-1 text-sm font-medium">Pré-visualização</Label>
                    <ScrollArea className="flex-grow border rounded-md p-1 bg-muted/30 shadow-inner">
                         <MarkdownRenderer content={currentContent || "Comece a digitar para ver a pré-visualização..."} className="bg-transparent shadow-none" />
                    </ScrollArea>
                </div>

                {currentSummary && (
                    <Card className="w-full bg-primary/10 p-3 flex-shrink-0">
                        <CardTitle className="text-base mb-1 flex items-center text-primary"><Lightbulb className="mr-2 h-4 w-4"/> Resumo da IA</CardTitle>
                        <ScrollArea className="max-h-32">
                           <MarkdownRenderer content={currentSummary} className="text-sm bg-transparent p-0 shadow-none text-primary/90"/>
                        </ScrollArea>
                    </Card>
                )}

                {/* Seção do Assistente de Escrita */}
                <form onSubmit={handleGenerateSuggestion} className="space-y-3 flex-shrink-0">
                   <Separator/>
                   <Label htmlFor="writing-prompt" className="text-sm font-medium flex items-center"><MessageSquarePlus className="mr-2 h-4 w-4 text-accent"/>Assistente de Escrita IA</Label>
                   <Input
                     id="writing-prompt"
                     value={writingPrompt}
                     onChange={(e) => setWritingPrompt(e.target.value)}
                     placeholder="Peça ajuda à IA (ex: Continue esta ideia, Crie 3 pontos sobre...)"
                     disabled={isLoading || isSummarizing || isGeneratingSuggestion}
                   />
                   <Button type="submit" variant="outline" size="sm" disabled={isGeneratingSuggestion || isLoading || isSummarizing || !writingPrompt.trim()}>
                     {isGeneratingSuggestion ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                     Gerar Sugestão
                   </Button>
                </form>

                {assistantSuggestion && (
                    <Card className="w-full bg-accent/10 p-3 flex-shrink-0">
                        <CardTitle className="text-base mb-1 flex items-center text-accent-foreground"><Lightbulb className="mr-2 h-4 w-4"/> Sugestão da IA</CardTitle>
                        <ScrollArea className="max-h-40">
                            <MarkdownRenderer content={assistantSuggestion} className="text-sm bg-transparent p-0 shadow-none"/>
                        </ScrollArea>
                        <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="ghost" onClick={handleCopySuggestion}><Copy className="mr-1 h-3 w-3"/>Copiar</Button>
                            <Button size="sm" variant="ghost" onClick={handleAppendSuggestion}><CornerDownLeft className="mr-1 h-3 w-3"/>Anexar à Nota</Button>
                        </div>
                    </Card>
                )}
                
                 {error && (
                    <div className="text-sm text-destructive p-2 bg-destructive/10 rounded-md flex items-center w-full flex-shrink-0">
                        <AlertCircle className="h-4 w-4 mr-2" /> {error}
                    </div>
                )}
              </CardContent>

              <CardFooter className="flex-shrink-0 border-t pt-4 flex flex-wrap gap-2 justify-start">
                    <Button onClick={handleSaveNote} disabled={isLoading || isSummarizing || isGeneratingSuggestion || !currentTitle.trim()}>
                      {isLoading && !isSummarizing && !isGeneratingSuggestion ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Salvar Anotação
                    </Button>
                    <Button onClick={handleSummarize} variant="outline" disabled={isSummarizing || isLoading || isGeneratingSuggestion || !currentContent.trim() || currentContent.trim().length < 20}>
                      {isSummarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
                      Resumir com IA
                    </Button>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}


    