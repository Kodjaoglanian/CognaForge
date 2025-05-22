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
import { cognitiveBattle, type CognitiveBattleInput } from '@/ai/flows/cognitive-battle'; // Reusing cognitive battle flow
import { Bot, User, Loader2, AlertCircle, MessageCircleQuestion } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SocraticMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

export default function SocraticModePage() {
  const [topic, setTopic] = useState('');
  const [currentUserInput, setCurrentUserInput] = useState(''); // User's reflection or answer to AI's question
  const [messages, setMessages] = useState<SocraticMessage[]>([]);
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
      toast({ title: 'Topic Required', description: 'Please enter a topic to start the Socratic dialogue.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setError(null);
    setMessages([]);

    try {
      // Initial call to cognitiveBattle, AI should ask the first question.
      // We'll primarily use the 'question' part of the output for Socratic mode.
      const input: CognitiveBattleInput = { 
        topic,
        // Adding a hint for Socratic mode in user context if the AI flow considers it.
        // This is an attempt, actual AI behavior depends on the flow's prompt engineering.
        userAnswer: "Let's begin our Socratic dialogue. Please ask me a question to start."
      };
      const result = await cognitiveBattle(input);
      
      setMessages([{ 
        id: Date.now().toString(), 
        sender: 'ai', 
        text: result.question // Focus on the question
      }]);
      setPreviousAiResponse(result.question);
      setIsTopicSet(true);
    } catch (err) {
      console.error(err);
      setError('Failed to start Socratic dialogue. Please try again.');
      toast({ title: 'Error', description: 'Failed to start Socratic dialogue.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserInputSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUserInput.trim()) {
      toast({ title: 'Input Required', description: 'Please enter your thoughts or answer.', variant: 'destructive' });
      return;
    }

    const newUserMessage: SocraticMessage = { id: Date.now().toString() + '-user', sender: 'user', text: currentUserInput };
    setMessages(prev => [...prev, newUserMessage]);
    setCurrentUserInput('');
    setIsLoading(true);
    setError(null);

    try {
      const input: CognitiveBattleInput = { 
        topic, 
        userAnswer: currentUserInput,
        previousAiResponse: previousAiResponse,
      };
      const result = await cognitiveBattle(input);
      
      // In Socratic mode, we only care about the AI's next question.
      const newAiMessage: SocraticMessage = {
        id: Date.now().toString() + '-ai',
        sender: 'ai',
        text: result.question 
      };
      setMessages(prev => [...prev, newAiMessage]);
      setPreviousAiResponse(result.question);
    } catch (err) {
      console.error(err);
      setError('Failed to process your input. Please try again.');
      const errorAiMessage: SocraticMessage = {
        id: Date.now().toString() + '-error',
        sender: 'ai',
        text: "I encountered an error. Perhaps ponder this: what assumptions am I making? Or, simply try again.",
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
        title="Socratic Mode"
        description="Engage in deep reflection as the AI responds only with questions, guiding your thought process."
      />

      {!isTopicSet ? (
        <Card>
          <CardHeader>
            <CardTitle>Enter the Agora</CardTitle>
            <CardDescription>Choose a topic for your Socratic exploration.</CardDescription>
          </CardHeader>
          <form onSubmit={handleTopicSubmit}>
            <CardContent>
              <Label htmlFor="topic">Topic of Dialogue</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., The Nature of Justice, The Meaning of Art, Consciousness"
                disabled={isLoading}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading || !topic.trim()}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Begin Dialogue
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircleQuestion className="h-6 w-6 mr-2 text-accent"/>
                Socratic Dialogue: {topic}
              </CardTitle>
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
                          <span className="font-semibold">{msg.sender === 'ai' ? 'Socratic Guide' : 'You'}</span>
                        </div>
                        <p className="text-sm">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                   {isLoading && messages.length > 0 && messages[messages.length - 1].sender === 'user' && (
                     <div className="flex justify-start">
                        <div className="max-w-[75%] p-3 rounded-lg shadow bg-muted flex items-center">
                          <Bot className="h-5 w-5 mr-2 text-accent" />
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          <span className="ml-2 text-sm text-muted-foreground">Formulating question...</span>
                        </div>
                      </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <form onSubmit={handleUserInputSubmit} className="flex w-full gap-2">
                <Textarea
                  value={currentUserInput}
                  onChange={(e) => setCurrentUserInput(e.target.value)}
                  placeholder="Reflect and respond..."
                  disabled={isLoading}
                  className="flex-grow"
                  rows={2}
                />
                <Button type="submit" disabled={isLoading || !currentUserInput.trim()} className="self-end">
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
