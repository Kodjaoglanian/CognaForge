
'use client';

import { useEffect, useState } from 'react';
import { PageTitle } from '@/components/shared/page-title';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter as UiCardFooter } from '@/components/ui/card';
import { NAV_ITEMS } from '@/lib/constants';
import Link from 'next/link';
import { ArrowRight, Lightbulb, Puzzle, Loader2, Brain, FileText, Zap, Swords, ClipboardCopy, StickyNote } from 'lucide-react'; // Added StickyNote
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
          <Zap className="mr-3 h-7 w-7 text-primary" />
          Explore Nossas Ferramentas de Aprendizagem
        </h2>
        <p className="text-muted-foreground mt-1">Cada ferramenta oferece uma mecânica única para impulsionar seu conhecimento e pensamento crítico.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {NAV_ITEMS.filter(item => item.href !== '/' && item.href !== '/settings').map((item) => (
          <Card key={item.href} className="flex flex-col hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1 bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <item.icon className="mr-3 h-6 w-6 text-primary" />
                  {item.title}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow pt-0">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {getFeatureDescription(item.href)}
              </p>
            </CardContent>
            <UiCardFooter className="pt-3">
              <Link href={item.href} passHref className="w-full">
                <Button className="w-full group">
                  Acessar {item.label || item.title}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </UiCardFooter>
          </Card>
        ))}
      </div>

      <Card className="mt-12 bg-gradient-to-br from-card to-muted/30 border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Brain className="mr-2 h-6 w-6 text-accent" />
            CognaForge: Sua Mente, Amplificada
          </CardTitle>
          <CardDescription>Mais que uma plataforma, uma jornada de autodescoberta intelectual.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            No CognaForge, acreditamos que o aprendizado é uma aventura contínua, uma forja onde suas habilidades intelectuais são moldadas e fortalecidas. Cansado de métodos passivos? Mergulhe em experiências interativas projetadas para desafiar, engajar e expandir sua capacidade de pensar, argumentar e criar.
          </p>
          <p>
            Nossas ferramentas, impulsionadas por inteligência artificial de ponta, são seus parceiros nesta jornada:
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 list-inside">
            <li className="flex items-start"><StickyNote className="h-5 w-5 mr-2 mt-0.5 text-primary flex-shrink-0"/> <span className="font-medium text-foreground/90">Organize</span> suas ideias e <span className="font-medium text-foreground/90">resuma</span> com o Caderno IA.</li>
            <li className="flex items-start"><Lightbulb className="h-5 w-5 mr-2 mt-0.5 text-primary flex-shrink-0"/> <span className="font-medium text-foreground/90">Clarifique</span> o complexo e <span className="font-medium text-foreground/90">desmistifique</span> o obscuro.</li>
            <li className="flex items-start"><FileText className="h-5 w-5 mr-2 mt-0.5 text-primary flex-shrink-0"/> <span className="font-medium text-foreground/90">Analise</span> textos profundos e <span className="font-medium text-foreground/90">extraia</span> a essência.</li>
            <li className="flex items-start"><Puzzle className="h-5 w-5 mr-2 mt-0.5 text-primary flex-shrink-0"/> <span className="font-medium text-foreground/90">Construa</span> conhecimento com mapas mentais e anotações inteligentes.</li>
            <li className="flex items-start"><Swords className="h-5 w-5 mr-2 mt-0.5 text-primary flex-shrink-0"/> <span className="font-medium text-foreground/90">Desafie</span> suas convicções em duelos argumentativos.</li>
            <li className="flex items-start"><Brain className="h-5 w-5 mr-2 mt-0.5 text-primary flex-shrink-0"/> <span className="font-medium text-foreground/90">Navegue</span> pelos vieses cognitivos e <span className="font-medium text-foreground/90">afie</span> seu julgamento.</li>
            <li className="flex items-start"><ClipboardCopy className="h-5 w-5 mr-2 mt-0.5 text-primary flex-shrink-0"/> <span className="font-medium text-foreground/90">Memorize</span> com flashcards gerados sob medida.</li>
            {/* Adicione mais aqui conforme novas ferramentas surgem */}
          </ul>
          <p className="mt-4 font-semibold text-foreground/90">
            A cada desafio, a cada conceito desvendado, a cada entrevista simulada, você não está apenas aprendendo – você está forjando uma mente mais ágil, crítica e poderosa. Prepare-se para desbloquear seu potencial máximo.
          </p>
        </CardContent>
         <UiCardFooter>
            <p className="text-xs text-muted-foreground">CognaForge - Afiando mentes, um desafio de IA por vez.</p>
          </UiCardFooter>
      </Card>
    </div>
  );
}

function getFeatureDescription(href: string): string {
  switch (href) {
    case '/ai-notes':
      return 'Crie e organize anotações com formatação Markdown. Use a IA para gerar resumos inteligentes do seu conteúdo.';
    case '/ai-flashcard-generator':
      return 'Crie flashcards personalizados instantaneamente com IA para qualquer tópico de estudo, facilitando a memorização.';
    case '/cognitive-battle':
      return 'Participe de sessões de P&R com IA que se adaptam à sua compreensão, expandindo seus limites cognitivos.';
    case '/argument-duel':
      return 'Afie seu raciocínio e habilidades de debate defendendo sua posição contra uma IA que atua como "advogado do diabo".';
    case '/knowledge-construction':
      return 'Colabore com a IA para construir mapas mentais dinâmicos e anotações inteligentes personalizadas ao seu estilo.';
    case '/boss-level':
      return 'Teste sua maestria com desafios práticos e complexos, projetados para sintetizar e aplicar seu aprendizado.';
    case '/socratic-mode':
      return 'Aprofunde sua reflexão e autoconhecimento enquanto a IA o guia com perguntas instigantes, no estilo socrático.';
    case '/interview-simulator':
      return 'Simule entrevistas de emprego com uma IA que assume diferentes personas de entrevistadores e fornece feedback valioso.';
    case '/concept-clarifier':
      return 'Desvende termos e ideias complexas com explicações simples, analogias e pontos-chave gerados pela IA.';
    case '/cognitive-bias-navigator':
      return 'Identifique e compreenda vieses cognitivos comuns através de cenários interativos e análises para aprimorar seu julgamento.';
    case '/text-analyzer':
      return 'Cole textos longos e obtenha resumos concisos, pontos-chave e palavras-chave relevantes instantaneamente.';
    default:
      return 'Explore esta funcionalidade para aprimorar sua jornada de aprendizado e pensamento crítico.';
  }
}
