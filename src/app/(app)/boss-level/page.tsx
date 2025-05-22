'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { PageTitle } from '@/components/shared/page-title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { generateBossLevelChallenge, type BossLevelInput, type BossLevelOutput } from '@/ai/flows/boss-level';
import { Loader2, AlertCircle, Trophy, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MarkdownRenderer } from '@/components/shared/markdown-renderer';

export default function BossLevelPage() {
  const [topic, setTopic] = useState('');
  const [userContext, setUserContext] = useState('');
  
  const [challenge, setChallenge] = useState<BossLevelOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userResponse, setUserResponse] = useState('');

  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast({ title: 'Tópico Necessário', description: 'Por favor, insira um tópico para o Nível Desafiador.', variant: 'destructive' });
      return;
    }
     if (!userContext.trim()) {
      toast({ title: 'Contexto Necessário', description: 'Por favor, forneça algum contexto para o Nível Desafiador.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setError(null);
    setChallenge(null);
    setUserResponse('');

    try {
      const input: BossLevelInput = { topic, userContext };
      const result = await generateBossLevelChallenge(input);
      setChallenge(result);
      toast({ title: 'Nível Desafiador Gerado!', description: 'Seu desafio o aguarda.', variant: 'default' });
    } catch (err) {
      console.error(err);
      setError('Falha ao gerar o Nível Desafiador. Por favor, tente novamente.');
      toast({ title: 'Erro', description: 'Falha ao gerar o desafio.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageTitle
        title="Nível Desafiador (Boss Level)"
        description="Encare o teste supremo! Aplique seu conhecimento para resolver cenários práticos e complexos."
      />

      <Card className="mb-6">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Prepare-se para o Chefão</CardTitle>
            <CardDescription>Insira o tópico e qualquer contexto relevante para seu desafio final.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="topic">Tópico / Módulo do Desafio</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: Cálculo Avançado, Pitch de Startup, IA Ética"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="userContext">Contexto do Usuário / Detalhes do Cenário</Label>
              <Textarea
                id="userContext"
                value={userContext}
                onChange={(e) => setUserContext(e.target.value)}
                placeholder="Descreva o cenário, o que você aprendeu ou habilidades específicas a serem testadas. Ex: 'Aprendi modelagem financeira, preciso criar uma projeção de 5 anos para uma startup de tecnologia.'"
                rows={3}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading || !topic.trim() || !userContext.trim()}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Gerar Desafio Final
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

      {challenge && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Trophy className="mr-2 h-7 w-7 text-yellow-400" />
              Seu Nível Desafiador: {topic}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-md">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <Zap className="mr-2 h-5 w-5 text-accent" /> Detalhes do Desafio
                </h3>
                <MarkdownRenderer content={challenge.challenge} />
            </div>
            <div>
              <Label htmlFor="userResponse" className="text-lg font-semibold">Sua Resposta / Solução</Label>
              <Textarea
                id="userResponse"
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
                placeholder="Elabore sua resposta completa aqui..."
                rows={10}
                className="mt-2"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-4">
            <Button disabled>
              Enviar Resposta (Avaliação em breve)
            </Button>
             <Button variant="outline" onClick={() => {setChallenge(null); setTopic(''); setUserContext(''); setUserResponse('');}}>
                Gerar Novo Desafio
            </Button>
            <p className="text-sm text-muted-foreground">
              Nota: A avaliação por IA das respostas dos Níveis Desafiadores é uma funcionalidade planejada para futuras atualizações. Por enquanto, use isso para autoavaliação ou discussão com colegas.
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
