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
      toast({ title: 'Topic Required', description: 'Please enter a topic to start the battle.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setError(null);
    setMessages([]); // Clear previous messages when a new topic is set

    try {
      const input: CognitiveBattleInput = { topic };
      const result = await cognitiveBattle(input);
      
      setMessages([{ 
        id: Date.now().toString(), 
        sender: 'ai', 
        text: result.question,
        evaluation: result.evaluation, // Initial evaluation might be generic
        feedback: result.feedback // Initial feedback might be generic
      }]);
      setPreviousAiResponse(result.question); // Store AI's question as previous response for next turn
      setIsTopicSet(true);
    } catch (err) {
      console.error(err);
      setError('Failed to start cognitive battle. Please try again.');
      toast({ title: 'Error', description: 'Failed to start cognitive battle.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentAnswer.trim()) {
      toast({ title: 'Answer Required', description: 'Please enter your answer.', variant: 'destructive' });
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
      setPreviousAiResponse(result.question); // Update previous AI response
    } catch (err) {
      console.error(err);
      setError('Failed to process your answer. Please try again.');
      const errorAiMessage: Message = {
        id: Date.now().toString() + '-error',
        sender: 'ai',
        text: "I encountered an error. Please try rephrasing or try again.",
      };
      setMessages(prev => [...prev, errorAiMessage]);
      toast({ title: 'Error', description: 'Failed to get AI response.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageTitle
        title="Cognitive Battle"
        description="Challenge your understanding. The AI will ask questions, evaluate your answers, and provide feedback to deepen your knowledge."
      />

      {!isTopicSet ? (
        <Card>
          <CardHeader>
            <CardTitle>Choose Your Battlefield</CardTitle>
            <CardDescription>Enter a topic to begin your cognitive battle.</CardDescription>
          </CardHeader>
          <form onSubmit={handleTopicSubmit}>
            <CardContent>
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Quantum Physics, Stoic Philosophy, Culinary Arts"
                disabled={isLoading}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading || !topic.trim()}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Start Battle
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Battle Arena: {topic}</CardTitle>
              <Button variant="outline" size="sm" onClick={() => { setIsTopicSet(false); setTopic(''); setMessages([]); setPreviousAiResponse(undefined);}} className="mt-2">
                Change Topic
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
                          <span className="font-semibold">{msg.sender === 'ai' ? 'CognaForge AI' : 'You'}</span>
                        </div>
                        <p className="text-sm">{msg.text}</p>
                        {msg.sender === 'ai' && msg.evaluation && (
                          <Card className="mt-2 bg-background/50">
                            <CardHeader className="p-2">
                              <CardTitle className="text-xs font-semibold">Evaluation</CardTitle>
                            </CardHeader>
                            <CardContent className="p-2 text-xs">
                              {msg.evaluation}
                            </CardContent>
                          </Card>
                        )}
                        {msg.sender === 'ai' && msg.feedback && (
                           <Card className="mt-2 bg-background/50">
                            <CardHeader className="p-2">
                              <CardTitle className="text-xs font-semibold">Feedback & Insights</CardTitle>
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
                          <span className="ml-2 text-sm text-muted-foreground">AI is thinking...</span>
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
                  placeholder="Type your answer..."
                  disabled={isLoading}
                  className="flex-grow"
                  rows={2}
                />
                <Button type="submit" disabled={isLoading || !currentAnswer.trim()} className="self-end">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
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
