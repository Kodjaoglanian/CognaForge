
'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { PageTitle } from '@/components/shared/page-title';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { analyzeText, type TextAnalyzerInput, type TextAnalyzerOutput } from '@/ai/flows/text-analyzer-flow';
import { Loader2, AlertCircle, FileText, ListChecks, Tags, AlignLeft, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MarkdownRenderer } from '@/components/shared/markdown-renderer';
import { Badge } from '@/components/ui/badge';

export default function TextAnalyzerPage() {
  const [textToAnalyze, setTextToAnalyze] = useState('');
  const [analysisResult, setAnalysisResult] = useState<TextAnalyzerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (textToAnalyze.trim().length < 50) {
      toast({ title: 'Texto Muito Curto', description: 'Por favor, insira um texto com pelo menos 50 caracteres para análise.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const input: TextAnalyzerInput = { textToAnalyze };
      const result = await analyzeText(input);
      setAnalysisResult(result);
      toast({ title: 'Análise Concluída!', description: 'Resumo, pontos-chave e palavras-chave gerados.', variant: 'default' });
    } catch (err) {
      console.error(err);
      setError('Falha ao analisar o texto. Por favor, tente novamente.');
      toast({ title: 'Erro na Análise', description: 'Não foi possível obter a análise da IA.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageTitle
        title="Analisador de Textos com IA"
        description="Cole um texto e obtenha um resumo conciso, os principais pontos-chave e palavras-chave relevantes instantaneamente."
      />

      <Card className="mb-6">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Analisar Texto</CardTitle>
            <CardDescription>Cole o texto que você deseja que a IA analise abaixo.</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="textToAnalyze" className="sr-only">Texto para Análise</Label>
              <Textarea
                id="textToAnalyze"
                value={textToAnalyze}
                onChange={(e) => setTextToAnalyze(e.target.value)}
                placeholder="Cole seu texto aqui... (mínimo 50 caracteres)"
                rows={10}
                disabled={isLoading}
                className="text-base"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading || textToAnalyze.trim().length < 50}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Analisar Texto
            </Button>
          </CardFooter>
        </form>
      </Card>

      {error && (
        <Card className="mb-6 border-destructive bg-destructive/10">
          <CardHeader className="flex-row items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-destructive" /> 
            <CardTitle className="text-destructive">Erro na Análise</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground">{error}</p>
          </CardContent>
        </Card>
      )}

      {analysisResult && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Sparkles className="mr-3 h-7 w-7 text-primary" />
              Resultados da Análise do Texto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <section>
              <h3 className="text-xl font-semibold mb-3 flex items-center text-primary">
                <AlignLeft className="mr-2 h-5 w-5" /> Resumo Conciso
              </h3>
              <Card className="p-4 bg-muted/50">
                 <MarkdownRenderer content={analysisResult.summary} />
              </Card>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3 flex items-center text-primary">
                <ListChecks className="mr-2 h-5 w-5" /> Pontos-Chave Principais
              </h3>
              <Card className="p-4 bg-muted/50">
                {analysisResult.keyPoints.length > 0 ? (
                  <ul className="space-y-2">
                    {analysisResult.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start">
                        <FileText className="h-4 w-4 mr-2 mt-1 text-accent flex-shrink-0" />
                        <MarkdownRenderer content={point} className="p-0 bg-transparent shadow-none"/>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">Nenhum ponto-chave extraído.</p>
                )}
              </Card>
            </section>
            
            <section>
              <h3 className="text-xl font-semibold mb-3 flex items-center text-primary">
                <Tags className="mr-2 h-5 w-5" /> Palavras-Chave Relevantes
              </h3>
              <Card className="p-4 bg-muted/50">
                {analysisResult.keywords.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="text-sm px-3 py-1">{keyword}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhuma palavra-chave extraída.</p>
                )}
              </Card>
            </section>
          </CardContent>
           <CardFooter>
            <Button variant="outline" onClick={() => {setAnalysisResult(null); setTextToAnalyze('');}}>
                Analisar Novo Texto
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
