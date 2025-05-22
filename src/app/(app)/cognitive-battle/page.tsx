'use client';

import type { FormEvent } from 'react';
import { useState, useEffect, useRef } from 'react';
import { PageTitle } from '@/components/shared/page-title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cognitiveBattle, type CognitiveBattleInput, type CognitiveBattleOutput } from '@/ai/flows/cognitive-battle';
import { Bot, User, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  evaluation?: string;
  feedback?: string;
}

export default function CognitiveBattlePage() {
  const [topic, setTopic] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previousAiResponse, setPreviousAiResponse] = useState<string | undefined>(undefined);
  const [isTopicSet, setIsTopicSet] = useState(false);

  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleTopicSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast({ title: 'Tópico Necessário', description: 'Por favor, insira um tópico para iniciar a batalha.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setError(null);
    setMessages([]); 

    try {
      const input: CognitiveBattleInput = { topic };
      const result = await cognitiveBattle(input);
      
      setMessages([{ 
        id: Date.now().toString(), 
        sender: 'ai', 
        text: result.question,
        evaluation: result.evaluation, 
        feedback: result.feedback 
      }]);
      setPreviousAiResponse(result.question); 
      setIsTopicSet(true);
    } catch (err) {
      console.error(err);
      setError('Falha ao iniciar a batalha cognitiva. Por favor, tente novamente.');
      toast({ title: 'Erro', description: 'Falha ao iniciar a batalha cognitiva.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentAnswer.trim()) {
      toast({ title: 'Resposta Necessária', description: 'Por favor, insira sua resposta.', variant: 'destructive' });
      return;
    }

    const newUserMessage: Message = { id: Date.now().toString() + '-user', sender: 'user', text: currentAnswer };
    setMessages(prev => [...prev, newUserMessage]);
    setCurrentAnswer('');
    setIsLoading(true);
    setError(null);

    try {
      const input: CognitiveBattleInput = { 
        topic, 
        userAnswer: currentAnswer,
        previousAiResponse: previousAiResponse
      };
      const result = await cognitiveBattle(input);
      
      const newAiMessage: Message = {
        id: Date.now().toString() + '-ai',
        sender: 'ai',
        text: result.question,
        evaluation: result.evaluation,
        feedback: result.feedback
      };
      setMessages(prev => [...prev, newAiMessage]);
      setPreviousAiResponse(result.question); 
    } catch (err) {
      console.error(err);
      setError('Falha ao processar sua resposta. Por favor, tente novamente.');
      const errorAiMessage: Message = {
        id: Date.now().toString() + '-error',
        sender: 'ai',
        text: "Encontrei um erro. Por favor, tente reformular ou tente novamente.",
      };
      setMessages(prev => [...prev, errorAiMessage]);
      toast({ title: 'Erro', description: 'Falha ao obter resposta da IA.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageTitle
        title="Batalha Cognitiva"
        description="Desafie sua compreensão. A IA fará perguntas, avaliará suas respostas e fornecerá feedback para aprofundar seu conhecimento."
      />

      {!isTopicSet ? (
        <Card>
          <CardHeader>
            <CardTitle>Escolha Seu Campo de Batalha</CardTitle>
            <CardDescription>Insira um tópico para começar sua batalha cognitiva.</CardDescription>
          </CardHeader>
          <form onSubmit={handleTopicSubmit}>
            <CardContent>
              <Label htmlFor="topic">Tópico</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: Física Quântica, Filosofia Estoica, Artes Culinárias"
                disabled={isLoading}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading || !topic.trim()}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Iniciar Batalha
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Arena de Batalha: {topic}</CardTitle>
              <Button variant="outline" size="sm" onClick={() => { setIsTopicSet(false); setTopic(''); setMessages([]); setPreviousAiResponse(undefined);}} className="mt-2">
                Mudar Tópico
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] w-full pr-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] p-3 rounded-lg shadow ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <div className="flex items-center mb-1">
                          {msg.sender === 'ai' ? <Bot className="h-5 w-5 mr-2 text-accent" /> : <User className="h-5 w-5 mr-2 text-primary-foreground" />}
                          <span className="font-semibold">{msg.sender === 'ai' ? 'IA CognaForge' : 'Você'}</span>
                        </div>
                        <p className="text-sm">{msg.text}</p>
                        {msg.sender === 'ai' && msg.evaluation && (
                          <Card className="mt-2 bg-background/50">
                            <CardHeader className="p-2">
                              <CardTitle className="text-xs font-semibold">Avaliação</CardTitle>
                            </CardHeader>
                            <CardContent className="p-2 text-xs">
                              {msg.evaluation}
                            </CardContent>
                          </Card>
                        )}
                        {msg.sender === 'ai' && msg.feedback && (
                           <Card className="mt-2 bg-background/50">
                            <CardHeader className="p-2">
                              <CardTitle className="text-xs font-semibold">Feedback e Insights</CardTitle>
                            </CardHeader>
                            <CardContent className="p-2 text-xs">
                              {msg.feedback}
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && messages.length > 0 && messages[messages.length - 1].sender === 'user' && (
                     <div className="flex justify-start">
                        <div className="max-w-[75%] p-3 rounded-lg shadow bg-muted flex items-center">
                          <Bot className="h-5 w-5 mr-2 text-accent" />
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          <span className="ml-2 text-sm text-muted-foreground">IA pensando...</span>
                        </div>
                      </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <form onSubmit={handleAnswerSubmit} className="flex w-full gap-2">
                <Textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Digite sua resposta..."
                  disabled={isLoading}
                  className="flex-grow"
                  rows={2}
                />
                <Button type="submit" disabled={isLoading || !currentAnswer.trim()} className="self-end">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar'}
                </Button>
              </form>
            </CardFooter>
          </Card>
          {error && (
            <div className="text-destructive p-3 bg-destructive/10 rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" /> {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
