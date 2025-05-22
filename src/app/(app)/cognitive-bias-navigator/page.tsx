
'use client';

import { useState } from 'react';
import { PageTitle } from '@/components/shared/page-title';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { navigateCognitiveBias, type CognitiveBiasNavigatorOutput } from '@/ai/flows/cognitive-bias-navigator-flow';
import { Loader2, AlertCircle, BrainCircuit, Lightbulb, Search, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MarkdownRenderer } from '@/components/shared/markdown-renderer';
import { Separator } from '@/components/ui/separator';

export default function CognitiveBiasNavigatorPage() {
  const [biasData, setBiasData] = useState<CognitiveBiasNavigatorOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisRevealed, setAnalysisRevealed] = useState(false);

  const { toast } = useToast();

  const handleNewScenario = async () => {
    setIsLoading(true);
    setError(null);
    setBiasData(null);
    setAnalysisRevealed(false);

    try {
      const result = await navigateCognitiveBias({});
      setBiasData(result);
      toast({ title: 'Novo Cenário Gerado!', description: 'Analise a situação e prepare-se para descobrir o viés.', variant: 'default' });
    } catch (err) {
      console.error(err);
      setError('Falha ao gerar novo cenário de viés. Por favor, tente novamente.');
      toast({ title: 'Erro', description: 'Não foi possível gerar um novo cenário.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageTitle
        title="Navegador de Vieses Cognitivos"
        description="Explore cenários, identifique armadilhas do pensamento e aprimore seu raciocínio crítico."
      >
        <Button onClick={handleNewScenario} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="mr-2 h-4 w-4" />
          )}
          Novo Cenário de Viés
        </Button>
      </PageTitle>

      {error && (
        <Card className="mb-6 border-destructive bg-destructive/10">
          <CardHeader className="flex-row items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-destructive" />
            <CardTitle className="text-destructive">Erro ao Gerar Cenário</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground">{error}</p>
          </CardContent>
        </Card>
      )}

      {!biasData && !isLoading && !error && (
        <Card className="text-center py-10">
            <CardHeader>
                <BrainCircuit className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <CardTitle>Bem-vindo ao Navegador de Vieses!</CardTitle>
            </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Clique em "Novo Cenário de Viés" para começar a explorar como nossa mente pode nos pregar peças.</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !biasData && (
         <Card className="text-center py-10">
          <CardContent>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Gerando um novo desafio para sua mente...</p>
          </CardContent>
        </Card>
      )}

      {biasData && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Search className="mr-2 h-5 w-5 text-primary" />
              Cenário para Análise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-md">
              <MarkdownRenderer content={biasData.scenario} />
            </div>
            <div className="p-4 border border-dashed border-accent/50 rounded-md">
              <p className="font-semibold text-accent-foreground mb-2">Reflita sobre isso:</p>
              <MarkdownRenderer content={biasData.initialQuestion} className="bg-transparent shadow-none p-0"/>
            </div>

            {!analysisRevealed && (
              <div className="text-center pt-4">
                <Button onClick={() => setAnalysisRevealed(true)}>
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Revelar Análise do Viés
                </Button>
              </div>
            )}

            {analysisRevealed && (
              <div className="space-y-6 pt-4">
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center text-primary">
                    <BrainCircuit className="mr-2 h-5 w-5" /> Viés Cognitivo Identificado
                  </h3>
                  <Card className="bg-primary/10 p-3">
                    <CardTitle className="text-base text-primary-foreground">{biasData.biasName}</CardTitle>
                  </Card>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    Explicação do Viés
                  </h3>
                  <div className="p-4 border rounded-md bg-muted/50">
                    <MarkdownRenderer content={biasData.biasExplanation} />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    Para Sua Reflexão Adicional
                  </h3>
                   <div className="p-4 border rounded-md bg-muted/50">
                    <MarkdownRenderer content={biasData.reflectionPrompt} />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
             <Button variant="outline" onClick={handleNewScenario} disabled={isLoading}>
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <RotateCcw className="mr-2 h-4 w-4" />
                )}
                Gerar Outro Cenário
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
