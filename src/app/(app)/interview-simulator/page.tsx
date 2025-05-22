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
import { simulateInterview, type InterviewSimulatorInput, type InterviewSimulatorOutput } from '@/ai/flows/interview-simulator-flow';
import { Bot, User, Loader2, AlertCircle, Briefcase, UserCog } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MarkdownRenderer } from '@/components/shared/markdown-renderer';

interface InterviewMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  feedback?: string;
}

export default function InterviewSimulatorPage() {
  const [jobRole, setJobRole] = useState('');
  const [interviewerPersona, setInterviewerPersona] = useState('');
  const [currentUserAnswer, setCurrentUserAnswer] = useState('');
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);

  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleStartInterview = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!jobRole.trim()) {
      toast({ title: 'Cargo Necessário', description: 'Por favor, defina o cargo para a simulação.', variant: 'destructive' });
      return;
    }
    if (!interviewerPersona.trim()) {
      toast({ title: 'Persona Necessária', description: 'Por favor, defina a persona do entrevistador.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessages([]);
    setCurrentUserAnswer('');

    try {
      const input: InterviewSimulatorInput = { jobRole, interviewerPersona, interviewHistory: [] };
      const result = await simulateInterview(input);
      
      setMessages([{ 
        id: Date.now().toString(), 
        sender: 'ai', 
        text: result.aiQuestion,
      }]);
      setIsInterviewStarted(true);
      toast({ title: 'Entrevista Iniciada!', description: `Simulando entrevista para ${jobRole}.`, variant: 'default' });
    } catch (err) {
      console.error(err);
      setError('Falha ao iniciar a simulação da entrevista. Por favor, tente novamente.');
      toast({ title: 'Erro', description: 'Falha ao iniciar a simulação.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUserAnswer.trim()) {
      toast({ title: 'Resposta Necessária', description: 'Por favor, insira sua resposta.', variant: 'destructive' });
      return;
    }

    const newUserMessage: InterviewMessage = { id: Date.now().toString() + '-user', sender: 'user', text: currentUserAnswer };
    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
    setCurrentUserAnswer('');
    setIsLoading(true);
    setError(null);

    try {
      const historyForGenkit = newMessages.map(msg => ({sender: msg.sender, message: msg.text}));
      const input: InterviewSimulatorInput = { 
        jobRole, 
        interviewerPersona,
        userAnswer: currentUserAnswer,
        interviewHistory: historyForGenkit.slice(0, -1), // Pass history BEFORE current user answer
      };
      const result = await simulateInterview(input);
      
      const newAiMessage: InterviewMessage = {
        id: Date.now().toString() + '-ai',
        sender: 'ai',
        text: result.aiQuestion,
        feedback: result.feedbackOnAnswer
      };
      setMessages(prev => [...prev, newAiMessage]);
    } catch (err) {
      console.error(err);
      setError('Falha ao processar sua resposta. Por favor, tente novamente.');
      const errorAiMessage: InterviewMessage = {
        id: Date.now().toString() + '-error',
        sender: 'ai',
        text: "Desculpe, encontrei um problema ao processar sua resposta. Poderia tentar reformular ou prosseguir?",
      };
      setMessages(prev => [...prev, errorAiMessage]);
      toast({ title: 'Erro', description: 'Falha ao obter resposta da IA.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const restartInterview = () => {
    setIsInterviewStarted(false);
    setJobRole('');
    setInterviewerPersona('');
    setMessages([]);
    setError(null);
    setCurrentUserAnswer('');
  }

  return (
    <div>
      <PageTitle
        title="Simulador de Entrevistas com IA"
        description="Prepare-se para entrevistas reais! Defina o cargo, a persona do entrevistador e pratique suas respostas com feedback da IA."
      />

      {!isInterviewStarted ? (
        <Card>
          <form onSubmit={handleStartInterview}>
            <CardHeader>
              <CardTitle>Configurar Simulação</CardTitle>
              <CardDescription>Defina os parâmetros para sua entrevista simulada.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="jobRole"><Briefcase className="inline h-4 w-4 mr-1 mb-0.5"/> Cargo Almejado</Label>
                <Input
                  id="jobRole"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  placeholder="Ex: Engenheiro de Software Pleno, Gerente de Produto Sênior"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="interviewerPersona"><UserCog className="inline h-4 w-4 mr-1 mb-0.5"/> Persona do Entrevistador</Label>
                <Input
                  id="interviewerPersona"
                  value={interviewerPersona}
                  onChange={(e) => setInterviewerPersona(e.target.value)}
                  placeholder="Ex: Técnico Detalhista, Recrutador Amigável, Diretor Exigente"
                  disabled={isLoading}
                />
                 <p className="text-xs text-muted-foreground mt-1">
                    Descreva o estilo do entrevistador (ex: amigável, técnico, direto, focado em cultura, etc.).
                  </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading || !jobRole.trim() || !interviewerPersona.trim()}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Iniciar Simulação
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="h-6 w-6 mr-2 text-primary"/>
                Simulação para: {jobRole}
              </CardTitle>
              <CardDescription>Entrevistador: {interviewerPersona}</CardDescription>
              <Button variant="outline" size="sm" onClick={restartInterview} className="mt-2">
                Nova Simulação / Mudar Configurações
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[450px] w-full pr-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-lg shadow-md ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <div className="flex items-start mb-1">
                          {msg.sender === 'ai' ? <Bot className="h-5 w-5 mr-2 text-accent flex-shrink-0" /> : <User className="h-5 w-5 mr-2 text-primary-foreground flex-shrink-0" />}
                          <span className="font-semibold">{msg.sender === 'ai' ? `Entrevistador IA (${interviewerPersona})` : 'Você'}</span>
                        </div>
                        <MarkdownRenderer content={msg.text} className="text-sm bg-transparent p-0 shadow-none" />
                        {msg.sender === 'ai' && msg.feedback && (
                          <Card className="mt-3 bg-accent/10 border-accent/30">
                            <CardHeader className="p-2">
                              <CardTitle className="text-xs font-semibold text-accent-foreground/90">Feedback sobre sua resposta:</CardTitle>
                            </CardHeader>
                            <CardContent className="p-2 pt-0">
                              <MarkdownRenderer content={msg.feedback} className="text-xs bg-transparent p-0 shadow-none" />
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && messages.length > 0 && messages[messages.length - 1].sender === 'user' && (
                     <div className="flex justify-start">
                        <div className="max-w-[85%] p-3 rounded-lg shadow-md bg-muted flex items-center">
                          <Bot className="h-5 w-5 mr-2 text-accent flex-shrink-0" />
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          <span className="ml-2 text-sm text-muted-foreground">A IA está formulando a próxima pergunta/feedback...</span>
                        </div>
                      </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <form onSubmit={handleAnswerSubmit} className="flex w-full gap-2 items-end">
                <Textarea
                  value={currentUserAnswer}
                  onChange={(e) => setCurrentUserAnswer(e.target.value)}
                  placeholder="Digite sua resposta aqui..."
                  disabled={isLoading}
                  className="flex-grow"
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (!isLoading && currentUserAnswer.trim()) {
                        handleAnswerSubmit(e as any);
                      }
                    }
                  }}
                />
                <Button type="submit" disabled={isLoading || !currentUserAnswer.trim()}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar Resposta'}
                </Button>
              </form>
            </CardFooter>
          </Card>
          {error && (
            <Card className="border-destructive bg-destructive/10">
              <CardHeader className="flex-row items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-destructive" /> 
                <CardTitle className="text-destructive text-base">Erro na Simulação</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-destructive-foreground">{error}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
