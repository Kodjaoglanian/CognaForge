'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { PageTitle } from '@/components/shared/page-title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { argumentDuel, type ArgumentDuelInput, type ArgumentDuelOutput } from '@/ai/flows/argument-duel';
import { Loader2, AlertCircle, Sparkles } from 'lucide-react'; // CheckCircle removed as it wasn't used
import { useToast } from '@/hooks/use-toast';
import { MarkdownRenderer } from '@/components/shared/markdown-renderer';

export default function ArgumentDuelPage() {
  const [topic, setTopic] = useState('');
  const [userStance, setUserStance] = useState('');
  const [duelResult, setDuelResult] = useState<ArgumentDuelOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!topic.trim() || !userStance.trim()) {
      toast({ title: 'Informações Faltando', description: 'Por favor, forneça um tópico e sua posição.', variant: 'destructive'});
      return;
    }

    setIsLoading(true);
    setError(null);
    setDuelResult(null);

    try {
      const input: ArgumentDuelInput = { topic, userStance };
      const result = await argumentDuel(input);
      setDuelResult(result);
      toast({ title: 'Duelo Concluído!', description: 'A IA analisou seus argumentos.', variant: 'default' });
    } catch (err) {
      console.error(err);
      setError('Falha ao conduzir o duelo argumentativo. Por favor, tente novamente.');
      toast({ title: 'Erro', description: 'Falha ao conduzir o duelo argumentativo.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageTitle
        title="Duelo Argumentativo"
        description="Defenda sua posição! A IA desafiará seu ponto de vista e fornecerá uma análise detalhada da sua argumentação."
      />

      <Card className="mb-6">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Prepare Seu Duelo</CardTitle>
            <CardDescription>Defina o tópico e sua posição inicial para começar o duelo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="topic">Tópico do Debate</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: A tecnologia está nos tornando menos sociais?"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="userStance">Sua Posição / Argumento</Label>
              <Textarea
                id="userStance"
                value={userStance}
                onChange={(e) => setUserStance(e.target.value)}
                placeholder="Ex: Acredito que a tecnologia melhora as conexões sociais ao..."
                rows={4}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading || !topic.trim() || !userStance.trim()}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Iniciar Duelo & Obter Análise
            </Button>
          </CardFooter>
        </form>
      </Card>

      {error && (
        <Card className="mb-6 border-destructive bg-destructive/10">
          <CardHeader className="flex-row items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-destructive" /> 
            <CardTitle className="text-destructive">Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground">{error}</p>
          </CardContent>
        </Card>
      )}

      {duelResult && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Sparkles className="mr-2 h-6 w-6 text-accent" />
              Análise & Feedback do Duelo
            </CardTitle>
            <CardDescription>Aqui está a análise da IA sobre a argumentação.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-primary">Crítica da IA</h3>
              <MarkdownRenderer content={duelResult.aiCritique} />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-primary">Falhas de Raciocínio Identificadas</h3>
              <MarkdownRenderer content={duelResult.reasoningFlaws} />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-primary">Recomendações de Melhoria</h3>
              <MarkdownRenderer content={duelResult.improvementRecommendations} />
            </div>
          </CardContent>
           <CardFooter>
            <Button variant="outline" onClick={() => {setDuelResult(null); setTopic(''); setUserStance('');}}>
                Iniciar Novo Duelo
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
