
'use client';

import { useEffect, useState } from 'react';
import { PageTitle } from '@/components/shared/page-title';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter as UiCardFooter } from '@/components/ui/card';
import { NAV_ITEMS } from '@/lib/constants';
import Link from 'next/link';
import { ArrowRight, Lightbulb, Puzzle, Loader2, Brain, ClipboardCopy } from 'lucide-react';
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
        setDailyTeaser(null);
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
        description="Sua academia cognitiva pessoal turbinada por IA. Afie sua mente, desafie seus limites e construa novo conhecimento de forma interativa e engajadora."
      />

      {/* Daily Teaser Card */}
      <Card className="mb-8 shadow-lg border-primary/50">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Puzzle className="mr-2 h-6 w-6 text-accent" />
            Desafio Mental do Dia
          </CardTitle>
          <CardDescription>Um enigma rápido para aquecer seus neurônios!</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTeaser && (
            <div className="flex items-center justify-center h-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Gerando novo desafio...</p>
            </div>
          )}
          {dailyTeaser && !isLoadingTeaser && (
            <div className="space-y-3">
              <MarkdownRenderer content={dailyTeaser.teaser} className="text-lg"/>
              {showTeaserAnswer && (
                <Card className="bg-muted/50 p-3 mt-2">
                  <p className="font-semibold text-sm text-primary">Resposta:</p>
                  <MarkdownRenderer content={dailyTeaser.answer} />
                </Card>
              )}
            </div>
          )}
          {!dailyTeaser && !isLoadingTeaser && (
            <p className="text-muted-foreground text-center py-4">Não foi possível carregar o desafio no momento. Tente mais tarde!</p>
          )}
        </CardContent>
        <UiCardFooter className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <Button 
            onClick={() => setShowTeaserAnswer(!showTeaserAnswer)} 
            disabled={!dailyTeaser || isLoadingTeaser}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <Lightbulb className="mr-2 h-4 w-4" />
            {showTeaserAnswer ? 'Esconder Resposta' : 'Revelar Resposta'}
          </Button>
          <Button 
            onClick={async () => {
              setIsLoadingTeaser(true);
              setShowTeaserAnswer(false);
              setDailyTeaser(null);
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
            className="w-full sm:w-auto"
          >
            {isLoadingTeaser && !dailyTeaser ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Puzzle className="mr-2 h-4 w-4" />}
            Novo Desafio
          </Button>
        </UiCardFooter>
      </Card>
      
      <div className="mb-6 mt-10">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground flex items-center">
          <Brain className="mr-3 h-7 w-7 text-primary" />
          Explore Nossas Ferramentas de Aprendizagem
        </h2>
        <p className="text-muted-foreground mt-1">Cada ferramenta oferece uma mecânica única para impulsionar seu conhecimento.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {NAV_ITEMS.filter(item => item.href !== '/' && item.href !== '/settings').map((item) => (
          <Card key={item.href} className="flex flex-col hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
            <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold">{item.title}</CardTitle>
                <CardDescription className="text-xs">
                  {item.label}
                </CardDescription>
              </div>
              <div className="p-2 bg-primary/10 rounded-md">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">
                {getFeatureDescription(item.href)}
              </p>
            </CardContent>
            <div className="p-4 pt-0">
              <Link href={item.href} passHref>
                <Button className="w-full group">
                  Acessar {item.label || item.title}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-12 bg-gradient-to-br from-card to-muted/50">
        <CardHeader>
          <CardTitle className="text-xl">Sobre o CognaForge: Sua Mente, Amplificada</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-muted-foreground">
          <p>
            Cansado de aprendizado passivo? O CognaForge é sua plataforma de lançamento para um desenvolvimento intelectual ativo e engajador. Acreditamos que o verdadeiro conhecimento é forjado na prática, no desafio e na exploração.
          </p>
          <p>
            Com nossas ferramentas alimentadas por IA, você irá:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li><span className="font-semibold text-primary">Gerar</span> flashcards personalizados para qualquer tópico.</li>
            <li><span className="font-semibold text-primary">Desmistificar</span> conceitos complexos com explicações claras e analogias.</li>
            <li><span className="font-semibold text-primary">Navegar</span> e entender vieses cognitivos que afetam seu pensamento.</li>
            <li><span className="font-semibold text-primary">Debater</span> ideias e fortalecer sua argumentação em duelos com a IA.</li>
            <li><span className="font-semibold text-primary">Construir</span> mapas mentais e anotações personalizadas.</li>
            <li><span className="font-semibold text-primary">Simular</span> entrevistas para se preparar para desafios profissionais.</li>
            <li><span className="font-semibold text-primary">Superar</span> desafios de "nível chefão" que testam sua maestria.</li>
            <li><span className="font-semibold text-primary">Refletir</span> profundamente através de diálogos socráticos.</li>
          </ul>
          <p className="mt-3 font-medium">
            Prepare-se para desbloquear seu potencial máximo. O futuro do aprendizado é interativo, personalizado e desafiador. Bem-vindo ao CognaForge.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function getFeatureDescription(href: string): string {
  switch (href) {
    case '/ai-flashcard-generator':
      return 'Crie flashcards personalizados instantaneamente com IA para qualquer tópico de estudo.';
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
    case '/concept-clarifier':
      return 'Desvende termos e ideias complexas com explicações simples, analogias e pontos-chave gerados pela IA.';
    case '/cognitive-bias-navigator':
      return 'Identifique e compreenda vieses cognitivos comuns através de cenários interativos e análises.';
    default:
      return 'Explore esta funcionalidade para aprimorar sua jornada de aprendizado.';
  }
}

