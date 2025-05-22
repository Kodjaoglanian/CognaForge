
'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { PageTitle } from '@/components/shared/page-title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { clarifyConcept, type ConceptClarifierInput, type ConceptClarifierOutput } from '@/ai/flows/concept-clarifier-flow';
import { Loader2, AlertCircle, GraduationCap, Lightbulb, ListChecks, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MarkdownRenderer } from '@/components/shared/markdown-renderer';

export default function ConceptClarifierPage() {
  const [concept, setConcept] = useState('');
  const [clarification, setClarification] = useState<ConceptClarifierOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!concept.trim()) {
      toast({ title: 'Conceito Necessário', description: 'Por favor, insira o conceito que deseja clarificar.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setError(null);
    setClarification(null);

    try {
      const input: ConceptClarifierInput = { concept };
      const result = await clarifyConcept(input);
      setClarification(result);
      toast({ title: 'Conceito Clarificado!', description: 'A IA preparou uma explicação para você.', variant: 'default' });
    } catch (err) {
      console.error(err);
      setError('Falha ao clarificar o conceito. Por favor, tente novamente.');
      toast({ title: 'Erro', description: 'Falha ao obter clarificação da IA.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageTitle
        title="Clarificador de Conceitos"
        description="Tem algum termo ou ideia que parece complexa demais? Deixe a IA desmistificá-lo para você!"
      />

      <Card className="mb-6">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>O Que Você Quer Entender Melhor?</CardTitle>
            <CardDescription>Insira o conceito, termo ou ideia que está te confundindo.</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="concept-input">Conceito a ser Clarificado</Label>
              <Input
                id="concept-input"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="Ex: Mecânica Quântica, Teoria da Relatividade, Blockchain, Amor Fati"
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading || !concept.trim()}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Clarificar Conceito
            </Button>
          </CardFooter>
        </form>
      </Card>

      {error && (
        <Card className="mb-6 border-destructive bg-destructive/10">
          <CardHeader className="flex-row items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-destructive" /> 
            <CardTitle className="text-destructive">Erro ao Clarificar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground">{error}</p>
          </CardContent>
        </Card>
      )}

      {clarification && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <GraduationCap className="mr-3 h-7 w-7 text-primary" />
              Entendendo: {concept}
            </CardTitle>
            <CardDescription>Aqui está a explicação da IA para o conceito solicitado.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 border rounded-md bg-muted/30">
              <h3 className="text-lg font-semibold mb-2 flex items-center text-primary">
                <Lightbulb className="mr-2 h-5 w-5" /> Explicação Simplificada
              </h3>
              <MarkdownRenderer content={clarification.simplifiedExplanation} />
            </div>

            <div className="p-4 border rounded-md bg-muted/30">
              <h3 className="text-lg font-semibold mb-2 flex items-center text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m12 13.5.518.518a2.65 2.65 0 0 0 3.747-3.747l.518.518m-4.265-4.265-.518-.518a2.65 2.65 0 0 0-3.747 3.747L7.5 9m8.735 8.735.518.518a2.65 2.65 0 0 0 3.747-3.747l.518.518M7.5 15l-.518-.518a2.65 2.65 0 0 0-3.747 3.747l-.518-.518M9 7.5l.518-.518A2.65 2.65 0 0 0 5.77 3.235L5.252 2.717m13.98 13.981.518.518a2.65 2.65 0 0 0 3.747-3.747l.518.518M3.232 5.77.518 8.482m0 0A2.65 2.65 0 0 0 2.717 12l2.218-2.218m13.98 4.436L21.482 12a2.65 2.65 0 0 0-3.747-3.747l-2.714 2.714"/></svg>
                Analogia
              </h3>
              <MarkdownRenderer content={clarification.analogy} />
            </div>

            <div className="p-4 border rounded-md bg-muted/30">
              <h3 className="text-lg font-semibold mb-2 flex items-center text-primary">
                <ListChecks className="mr-2 h-5 w-5" /> Pontos-Chave
              </h3>
              <ul className="list-disc space-y-1 pl-5">
                {clarification.keyPoints.map((point, index) => (
                  <li key={index}><MarkdownRenderer content={point} className="p-0 bg-transparent shadow-none" /></li>
                ))}
              </ul>
            </div>
            
            <div className="p-4 border rounded-md bg-primary/10">
              <h3 className="text-lg font-semibold mb-2 flex items-center text-primary-foreground">
                <HelpCircle className="mr-2 h-5 w-5" /> Para Sua Reflexão
              </h3>
              <MarkdownRenderer content={clarification.understandingQuestion} className="text-primary-foreground bg-transparent p-0 shadow-none" />
              <Textarea placeholder="Anote seus pensamentos aqui..." rows={3} className="mt-3 bg-background/80 text-foreground" />
            </div>

          </CardContent>
           <CardFooter>
            <Button variant="outline" onClick={() => {setClarification(null); setConcept('');}}>
                Clarificar Outro Conceito
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
