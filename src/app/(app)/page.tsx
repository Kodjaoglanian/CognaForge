'use client';

import { useEffect, useState } from 'react';
import { PageTitle } from '@/components/shared/page-title';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter as UiCardFooter } from '@/components/ui/card'; // Renamed CardFooter to avoid conflict
import { NAV_ITEMS } from '@/lib/constants';
import Link from 'next/link';
import { ArrowRight, Lightbulb, Puzzle, Loader2 } from 'lucide-react';
import { generateDailyTeaser, type DailyTeaserOutput } from '@/ai/flows/daily-teaser-flow';
import { useToast } from '@/hooks/use-toast';
import { MarkdownRenderer } from '@/components/shared/markdown-renderer';

export default function DashboardPage() {
  const [dailyTeaser, setDailyTeaser] = useState<DailyTeaserOutput | null>(null);
  const [showTeaserAnswer, setShowTeaserAnswer] = useState(false);
  const [isLoadingTeaser, setIsLoadingTeaser] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchTeaser() {
      setIsLoadingTeaser(true);
      setShowTeaserAnswer(false);
      try {
        const teaserResult = await generateDailyTeaser({});
        setDailyTeaser(teaserResult);
      } catch (error) {
        console.error("Falha ao buscar o desafio mental:", error);
        toast({
          title: "Erro ao Carregar Desafio",
          description: "Não foi possível carregar o desafio mental diário. Tente novamente mais tarde.",
          variant: "destructive",
        });
        setDailyTeaser(null); // Clear previous teaser on error
      } finally {
        setIsLoadingTeaser(false);
      }
    }
    fetchTeaser();
  }, [toast]);


  return (
    <div>
      <PageTitle
        title="Bem-vindo ao CognaForge"
        description="Sua academia cognitiva pessoal turbinada por IA. Afie sua mente, desafie seus limites e construa novo conhecimento."
      />

      {/* Daily Teaser Card */}
      <Card className="mb-8 shadow-lg border-primary/50">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Puzzle className="mr-2 h-6 w-6 text-accent" />
            Desafio Mental do Dia
          </CardTitle>
          <CardDescription>Teste sua sagacidade com este enigma rápido!</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTeaser && (
            <div className="flex items-center justify-center h-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Gerando desafio...</p>
            </div>
          )}
          {dailyTeaser && !isLoadingTeaser && (
            <div className="space-y-3">
              <MarkdownRenderer content={dailyTeaser.teaser} className="text-lg"/>
              {showTeaserAnswer && (
                <Card className="bg-muted/50 p-3">
                  <p className="font-semibold text-sm">Resposta:</p>
                  <MarkdownRenderer content={dailyTeaser.answer} />
                </Card>
              )}
            </div>
          )}
          {!dailyTeaser && !isLoadingTeaser && (
            <p className="text-muted-foreground">Não foi possível carregar o desafio no momento.</p>
          )}
        </CardContent>
        <UiCardFooter className="flex justify-between items-center">
          <Button 
            onClick={() => setShowTeaserAnswer(!showTeaserAnswer)} 
            disabled={!dailyTeaser || isLoadingTeaser}
            variant="outline"
          >
            <Lightbulb className="mr-2 h-4 w-4" />
            {showTeaserAnswer ? 'Esconder Resposta' : 'Revelar Resposta'}
          </Button>
          <Button 
            onClick={async () => {
              setIsLoadingTeaser(true);
              setShowTeaserAnswer(false);
              try {
                const teaserResult = await generateDailyTeaser({});
                setDailyTeaser(teaserResult);
              } catch (error) {
                 console.error("Falha ao buscar novo desafio:", error);
                 toast({
                  title: "Erro",
                  description: "Não foi possível carregar um novo desafio.",
                  variant: "destructive",
                });
              } finally {
                setIsLoadingTeaser(false);
              }
            }} 
            disabled={isLoadingTeaser}
          >
            {isLoadingTeaser && dailyTeaser ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
            Novo Desafio
          </Button>
        </UiCardFooter>
      </Card>
      
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Explore as Ferramentas</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {NAV_ITEMS.filter(item => item.href !== '/' && item.href !== '/settings').map((item) => (
          <Card key={item.href} className="flex flex-col hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">{item.title}</CardTitle>
              <item.icon className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>
                {getFeatureDescription(item.href)}
              </CardDescription>
            </CardContent>
            <div className="p-6 pt-0">
              <Link href={item.href} passHref>
                <Button className="w-full">
                  Ir para {item.label || item.title}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Sobre o CognaForge</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            O CognaForge foi projetado para transformar o aprendizado em um processo ativo, envolvente e intelectualmente estimulante.
            Em vez do consumo passivo de conteúdo, você participará de batalhas cognitivas, debaterá com a IA,
            cocriará estruturas de conhecimento, simulará entrevistas e conquistará níveis desafiadores.
          </p>
          <p className="mt-4 text-muted-foreground">
            Nosso objetivo é ajudá-lo a alcançar novos patamares de raciocínio, comunicação, compreensão e maestria em qualquer assunto que escolher.
            Bem-vindo ao futuro do aprendizado.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function getFeatureDescription(href: string): string {
  switch (href) {
    case '/cognitive-battle':
      return 'Participe de sessões de P&R com IA que se adaptam à sua compreensão, expandindo seus limites cognitivos.';
    case '/argument-duel':
      return 'Afie seu raciocínio defendendo sua posição contra uma IA que atua como "advogado do diabo".';
    case '/knowledge-construction':
      return 'Colabore com a IA para construir mapas mentais dinâmicos e anotações inteligentes personalizadas.';
    case '/boss-level':
      return 'Teste sua maestria com desafios práticos e complexos, projetados para sintetizar seu aprendizado.';
    case '/socratic-mode':
      return 'Aprofunde sua reflexão enquanto a IA o guia com perguntas instigantes, no estilo socrático.';
    case '/interview-simulator':
      return 'Simule entrevistas de emprego com uma IA que assume diferentes personas de entrevistadores e fornece feedback.';
    default:
      return 'Explore esta funcionalidade para aprimorar sua jornada de aprendizado.';
  }
}
