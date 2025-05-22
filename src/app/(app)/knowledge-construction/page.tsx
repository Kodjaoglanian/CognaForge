'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { PageTitle } from '@/components/shared/page-title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { knowledgeConstruction, type KnowledgeConstructionInput, type KnowledgeConstructionOutput } from '@/ai/flows/knowledge-construction';
import { Loader2, AlertCircle, BookOpen, BrainCog } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MarkdownRenderer } from '@/components/shared/markdown-renderer';

export default function KnowledgeConstructionPage() {
  const [topic, setTopic] = useState('');
  const [learningStyle, setLearningStyle] = useState('');
  const [pace, setPace] = useState('');
  const [retentionCapacity, setRetentionCapacity] = useState('');
  
  const [constructionResult, setConstructionResult] = useState<KnowledgeConstructionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast({ title: 'Tópico Necessário', description: 'Por favor, insira um tópico para construir conhecimento.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setError(null);
    setConstructionResult(null);

    try {
      const input: KnowledgeConstructionInput = { 
        topic,
        learningStyle: learningStyle || undefined, 
        pace: pace || undefined,
        retentionCapacity: retentionCapacity || undefined,
      };
      const result = await knowledgeConstruction(input);
      setConstructionResult(result);
      toast({ title: 'Conhecimento Construído!', description: 'Mapa mental e anotações inteligentes estão prontos.', variant: 'default' });
    } catch (err) {
      console.error(err);
      setError('Falha ao construir conhecimento. Por favor, tente novamente.');
      toast({ title: 'Erro', description: 'Falha ao construir conhecimento.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const learningStyles = [
    { value: "Visual", label: "Visual" },
    { value: "Auditory", label: "Auditivo" },
    { value: "Kinesthetic", label: "Cinestésico" },
    { value: "Reading/Writing", label: "Leitura/Escrita" }
  ];
  const paces = [
    { value: "Fast", label: "Rápido" },
    { value: "Medium", label: "Médio" },
    { value: "Slow", label: "Lento" }
  ];
  const retentionCapacities = [
    { value: "High", label: "Alta" },
    { value: "Medium", label: "Média" },
    { value: "Low", label: "Baixa" }
  ];

  return (
    <div>
      <PageTitle
        title="Construção de Conhecimento"
        description="Cocrie mapas mentais dinâmicos e anotações inteligentes com a IA, adaptados às suas preferências de aprendizado."
      />

      <Card className="mb-6">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Defina Seu Plano de Aprendizagem</CardTitle>
            <CardDescription>Forneça um tópico e, opcionalmente, suas preferências de aprendizado para uma experiência personalizada.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="topic">Tópico para Construção</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: O Renascimento, Fundamentos de Machine Learning, Energia Sustentável"
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="learningStyle">Estilo de Aprendizagem (Opcional)</Label>
                <Select value={learningStyle} onValueChange={setLearningStyle} disabled={isLoading}>
                  <SelectTrigger id="learningStyle"><SelectValue placeholder="Selecione estilo" /></SelectTrigger>
                  <SelectContent>
                    {learningStyles.map(style => <SelectItem key={style.value} value={style.value}>{style.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="pace">Ritmo de Aprendizagem (Opcional)</Label>
                <Select value={pace} onValueChange={setPace} disabled={isLoading}>
                  <SelectTrigger id="pace"><SelectValue placeholder="Selecione ritmo" /></SelectTrigger>
                  <SelectContent>
                    {paces.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="retentionCapacity">Capacidade de Retenção (Opcional)</Label>
                <Select value={retentionCapacity} onValueChange={setRetentionCapacity} disabled={isLoading}>
                  <SelectTrigger id="retentionCapacity"><SelectValue placeholder="Selecione capacidade" /></SelectTrigger>
                  <SelectContent>
                    {retentionCapacities.map(rc => <SelectItem key={rc.value} value={rc.value}>{rc.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading || !topic.trim()}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Construir Conhecimento
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

      {constructionResult && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <BrainCog className="mr-2 h-6 w-6 text-accent" />
                Mapa Mental Dinâmico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownRenderer content={constructionResult.mindMap} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <BookOpen className="mr-2 h-6 w-6 text-accent" />
                Anotações Inteligentes Personalizadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownRenderer content={constructionResult.smartNotes} />
            </CardContent>
          </Card>
           <div className="text-center mt-4">
             <Button variant="outline" onClick={() => {setConstructionResult(null); setTopic(''); setLearningStyle(''); setPace(''); setRetentionCapacity('');}}>
                Construir Novo Conhecimento
            </Button>
           </div>
        </div>
      )}
    </div>
  );
}
