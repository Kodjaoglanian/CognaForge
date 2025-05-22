
'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { PageTitle } from '@/components/shared/page-title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { generateFlashcards, type FlashcardGeneratorInput, type FlashcardGeneratorOutput } from '@/ai/flows/ai-flashcard-generator-flow';
import { Loader2, AlertCircle, FlipHorizontal, ChevronLeft, ChevronRight, ClipboardCopy, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MarkdownRenderer } from '@/components/shared/markdown-renderer';

interface Flashcard {
  front: string;
  back: string;
}

export default function AIFlashcardGeneratorPage() {
  const [topic, setTopic] = useState('');
  const [numberOfCards, setNumberOfCards] = useState('10'); // Default to 10, as string for input
  
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const numCards = parseInt(numberOfCards, 10);

    if (!topic.trim()) {
      toast({ title: 'Tópico Necessário', description: 'Por favor, insira um tópico para gerar os flashcards.', variant: 'destructive' });
      return;
    }
    if (isNaN(numCards) || numCards < 1 || numCards > 20) {
      toast({ title: 'Número Inválido', description: 'Por favor, insira um número de flashcards entre 1 e 20.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setError(null);
    setFlashcards([]);
    setCurrentCardIndex(0);
    setIsFlipped(false);

    try {
      const input: FlashcardGeneratorInput = { topic, numberOfCards: numCards };
      const result = await generateFlashcards(input);
      if (result.flashcards && result.flashcards.length > 0) {
        setFlashcards(result.flashcards);
        toast({ title: 'Flashcards Gerados!', description: `${result.flashcards.length} flashcards prontos para estudo.`, variant: 'default' });
      } else {
        toast({ title: 'Nenhum Flashcard Gerado', description: 'A IA não conseguiu gerar flashcards para este tópico. Tente refinar o tópico.', variant: 'default' });
      }
    } catch (err) {
      console.error(err);
      setError('Falha ao gerar os flashcards. Por favor, tente novamente.');
      toast({ title: 'Erro', description: 'Falha ao obter flashcards da IA.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePreviousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleNewSet = () => {
    setFlashcards([]);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    // Optionally clear topic and numberOfCards or keep them for quick regeneration
    // setTopic(''); 
    // setNumberOfCards('10');
  }

  return (
    <div>
      <PageTitle
        title="Gerador de Flashcards com IA"
        description="Crie flashcards personalizados para qualquer tópico instantaneamente. Defina o assunto, a quantidade e comece a estudar!"
      />

      <Card className="mb-6">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Configurar Gerador</CardTitle>
            <CardDescription>Informe o tópico e quantos flashcards deseja.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="topic">Tópico dos Flashcards</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: História do Brasil Colônia, Fundamentos de Python"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="numberOfCards">Número de Flashcards (1-20)</Label>
              <Input
                id="numberOfCards"
                type="number"
                value={numberOfCards}
                onChange={(e) => setNumberOfCards(e.target.value)}
                min="1"
                max="20"
                placeholder="Ex: 10"
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading || !topic.trim()}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Gerar Flashcards
            </Button>
          </CardFooter>
        </form>
      </Card>

      {error && (
        <Card className="mb-6 border-destructive bg-destructive/10">
          <CardHeader className="flex-row items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-destructive" /> 
            <CardTitle className="text-destructive">Erro ao Gerar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground">{error}</p>
          </CardContent>
        </Card>
      )}

      {flashcards.length > 0 && (
        <>
          <CardHeader className="px-0">
            <CardTitle className="flex items-center text-2xl">
              <ClipboardCopy className="mr-3 h-7 w-7 text-primary" />
              Estudando: {topic}
            </CardTitle>
            <CardDescription>
              Carta {currentCardIndex + 1} de {flashcards.length}
            </CardDescription>
          </CardHeader>
        
          <Card className="shadow-lg w-full max-w-2xl mx-auto min-h-[300px] flex flex-col">
            <CardContent className="flex-grow flex items-center justify-center p-6 text-center">
              <MarkdownRenderer 
                content={isFlipped ? flashcards[currentCardIndex].back : flashcards[currentCardIndex].front} 
                className="text-xl"
              />
            </CardContent>
            <CardFooter className="grid grid-cols-3 gap-2 border-t pt-4">
              <Button variant="outline" onClick={handlePreviousCard} disabled={currentCardIndex === 0 || isLoading}>
                <ChevronLeft className="mr-1 h-4 w-4" /> Anterior
              </Button>
              <Button onClick={handleFlipCard} disabled={isLoading}>
                <FlipHorizontal className="mr-2 h-4 w-4" /> Virar Carta
              </Button>
              <Button variant="outline" onClick={handleNextCard} disabled={currentCardIndex === flashcards.length - 1 || isLoading}>
                Próxima <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
          <div className="mt-6 text-center">
            <Button variant="secondary" onClick={handleNewSet} disabled={isLoading}>
              <Zap className="mr-2 h-4 w-4"/> Gerar Novo Conjunto (Mesmo Tema)
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
