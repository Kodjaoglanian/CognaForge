
'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { PageTitle } from '@/components/shared/page-title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { summarizeNote, type SummarizeNoteInput, type SummarizeNoteOutput } from '@/ai/flows/summarize-note-flow';
import { Loader2, AlertCircle, PlusCircle, Save, FileText, Trash2, StickyNote, Lightbulb, Wand2 } from 'lucide-react';
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

  const { toast } = useToast();

  useEffect(() => {
    // Load notes from localStorage on initial render
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
      // Optionally clear corrupted data
      // localStorage.removeItem('ai-notes-data');
    }
  }, []);

  useEffect(() => {
    // Save notes to localStorage whenever notes array changes
    // Only save if notes have been loaded or explicitly modified to avoid overwriting with empty array on init
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
    setError(null);
  };

  const handleSelectNote = (noteId: string) => {
    if (isLoading || isSummarizing) return;
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setSelectedNoteId(note.id);
      setCurrentTitle(note.title);
      setCurrentContent(note.content);
      setCurrentSummary(note.summary);
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
    if (!noteId || isLoading || isSummarizing) return;
    setIsLoading(true);
    setNotes(prev => prev.filter(n => n.id !== noteId));
    if (selectedNoteId === noteId) {
      setSelectedNoteId(null);
      setCurrentTitle('');
      setCurrentContent('');
      setCurrentSummary(undefined);
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
      // Update the summary in the main notes array as well
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
  
  const selectedNote = notes.find(n => n.id === selectedNoteId);

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]"> {/* Adjust height as needed */}
      <PageTitle
        title="Caderno IA de Anotações"
        description="Crie, edite e organize suas anotações com formatação Markdown. Use a IA para gerar resumos inteligentes do seu conteúdo."
      />

      <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
        {/* Notes List Pane */}
        <Card className="md:col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Minhas Anotações
              <Button size="sm" onClick={handleNewNote} disabled={isLoading || isSummarizing}>
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
                        isLoading || isSummarizing
                            ? "opacity-60 cursor-not-allowed"
                            : "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        selectedNoteId === note.id
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : isLoading || isSummarizing ? "bg-transparent text-foreground" : "hover:bg-accent hover:text-accent-foreground bg-transparent text-foreground"
                      )}
                      onClick={isLoading || isSummarizing ? undefined : () => handleSelectNote(note.id)}
                      onKeyDown={isLoading || isSummarizing ? undefined : (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleSelectNote(note.id);
                          }
                      }}
                      role="button"
                      tabIndex={isLoading || isSummarizing ? -1 : 0}
                      aria-disabled={isLoading || isSummarizing}
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
                          if (isLoading || isSummarizing) return;
                          handleDeleteNote(note.id); 
                      }}
                      disabled={isLoading || isSummarizing}
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

        {/* Editor/Preview Pane */}
        <Card className="md:col-span-2 flex flex-col">
          {!selectedNoteId ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                <StickyNote className="h-16 w-16 mb-4" />
                <h2 className="text-xl font-semibold">Selecione uma anotação para editar</h2>
                <p>Ou crie uma nova para começar a escrever.</p>
            </div>
          ) : (
            <>
              <CardHeader>
                <Label htmlFor="note-title" className="sr-only">Título da Anotação</Label>
                <Input
                  id="note-title"
                  value={currentTitle}
                  onChange={(e) => setCurrentTitle(e.target.value)}
                  placeholder="Título da sua anotação..."
                  className="text-xl font-semibold border-0 shadow-none focus-visible:ring-0 px-1"
                  disabled={isLoading || isSummarizing}
                />
              </CardHeader>
              <CardContent className="flex-grow grid grid-rows-2 gap-4 overflow-hidden">
                <div className="row-span-1 flex flex-col">
                  <Label htmlFor="note-content" className="mb-1 text-sm font-medium">Conteúdo (Markdown)</Label>
                  <Textarea
                    id="note-content"
                    value={currentContent}
                    onChange={(e) => setCurrentContent(e.target.value)}
                    placeholder="Escreva sua anotação aqui usando Markdown..."
                    className="flex-grow resize-none text-base"
                    disabled={isLoading || isSummarizing}
                  />
                </div>
                <div className="row-span-1 flex flex-col overflow-y-auto">
                    <Label className="mb-1 text-sm font-medium">Pré-visualização</Label>
                    <ScrollArea className="flex-grow border rounded-md p-1">
                         <MarkdownRenderer content={currentContent || "Comece a digitar para ver a pré-visualização..."} className="bg-muted/30 shadow-none" />
                    </ScrollArea>
                </div>
              </CardContent>
              <CardFooter className="flex-col items-start space-y-4 pt-4 border-t">
                {currentSummary && (
                    <Card className="w-full bg-primary/10 p-4">
                        <CardTitle className="text-base mb-2 flex items-center text-primary-foreground"><Lightbulb className="mr-2 h-5 w-5"/> Resumo da IA</CardTitle>
                        <MarkdownRenderer content={currentSummary} className="text-sm bg-transparent p-0 shadow-none text-primary-foreground/90"/>
                    </Card>
                )}
                 {error && (
                    <div className="text-sm text-destructive p-2 bg-destructive/10 rounded-md flex items-center w-full">
                        <AlertCircle className="h-4 w-4 mr-2" /> {error}
                    </div>
                )}
                <div className="flex flex-wrap gap-2">
                    <Button onClick={handleSaveNote} disabled={isLoading || isSummarizing || !currentTitle.trim()}>
                      {isLoading && !isSummarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Salvar Anotação
                    </Button>
                    <Button onClick={handleSummarize} variant="outline" disabled={isSummarizing || isLoading || !currentContent.trim() || currentContent.trim().length < 20}>
                      {isSummarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                      Resumir com IA
                    </Button>
                </div>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

