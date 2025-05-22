'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { PageTitle } from '@/components/shared/page-title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { argumentDuel, type ArgumentDuelInput, type ArgumentDuelOutput } from '@/ai/flows/argument-duel';
import { Loader2, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MarkdownRenderer } from '@/components/shared/markdown-renderer';

export default function ArgumentDuelPage() {
  const [topic, setTopic] = useState('');
  const [userStance, setUserStance] = useState('');
  const [duelResult, setDuelResult] = useState<ArgumentDuelOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!topic.trim() || !userStance.trim()) {
      toast({ title: 'Missing Information', description: 'Please provide both a topic and your stance.', variant: 'destructive'});
      return;
    }

    setIsLoading(true);
    setError(null);
    setDuelResult(null);

    try {
      const input: ArgumentDuelInput = { topic, userStance };
      const result = await argumentDuel(input);
      setDuelResult(result);
      toast({ title: 'Duel Complete!', description: 'The AI has analyzed your arguments.', variant: 'default' });
    } catch (err) {
      console.error(err);
      setError('Failed to conduct argument duel. Please try again.');
      toast({ title: 'Error', description: 'Failed to conduct argument duel.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageTitle
        title="Argument Duel"
        description="Defend your position! The AI will challenge your stance and provide a detailed analysis of your argumentation."
      />

      <Card className="mb-6">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Set Up Your Duel</CardTitle>
            <CardDescription>Define the topic and your initial stance to begin the duel.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="topic">Topic of Debate</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Is technology making us less social?"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="userStance">Your Stance / Argument</Label>
              <Textarea
                id="userStance"
                value={userStance}
                onChange={(e) => setUserStance(e.target.value)}
                placeholder="e.g., I believe technology enhances social connections by..."
                rows={4}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading || !topic.trim() || !userStance.trim()}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Start Duel & Get Analysis
            </Button>
          </CardFooter>
        </form>
      </Card>

      {error && (
        <Card className="mb-6 border-destructive bg-destructive/10">
          <CardHeader className="flex-row items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-destructive" /> 
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground">{error}</p>
          </CardContent>
        </Card>
      )}

      {duelResult && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Sparkles className="mr-2 h-6 w-6 text-accent" />
              Duel Analysis & Feedback
            </CardTitle>
            <CardDescription>Here's the AI's breakdown of the argument.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-primary">AI's Critique</h3>
              <MarkdownRenderer content={duelResult.aiCritique} />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-primary">Reasoning Flaws Identified</h3>
              <MarkdownRenderer content={duelResult.reasoningFlaws} />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-primary">Improvement Recommendations</h3>
              <MarkdownRenderer content={duelResult.improvementRecommendations} />
            </div>
          </CardContent>
           <CardFooter>
            <Button variant="outline" onClick={() => {setDuelResult(null); setTopic(''); setUserStance('');}}>
                Start New Duel
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
