'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { PageTitle } from '@/components/shared/page-title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { generateBossLevelChallenge, type BossLevelInput, type BossLevelOutput } from '@/ai/flows/boss-level';
import { Loader2, AlertCircle, Trophy, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MarkdownRenderer } from '@/components/shared/markdown-renderer';

export default function BossLevelPage() {
  const [topic, setTopic] = useState('');
  const [userContext, setUserContext] = useState(''); // Could be pre-filled or entered by user
  
  const [challenge, setChallenge] = useState<BossLevelOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userResponse, setUserResponse] = useState(''); // For user to type their solution

  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast({ title: 'Topic Required', description: 'Please enter a topic for the Boss Level challenge.', variant: 'destructive' });
      return;
    }
     if (!userContext.trim()) {
      toast({ title: 'Context Required', description: 'Please provide some context for the Boss Level.', variant: 'destructive' });
      return;
    }


    setIsLoading(true);
    setError(null);
    setChallenge(null);
    setUserResponse(''); // Clear previous response

    try {
      const input: BossLevelInput = { topic, userContext };
      const result = await generateBossLevelChallenge(input);
      setChallenge(result);
      toast({ title: 'Boss Level Generated!', description: 'Your challenge awaits.', variant: 'default' });
    } catch (err) {
      console.error(err);
      setError('Failed to generate Boss Level challenge. Please try again.');
      toast({ title: 'Error', description: 'Failed to generate challenge.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageTitle
        title="Boss Level Challenge"
        description="Face the ultimate test! Apply your knowledge to solve complex, practical scenarios."
      />

      <Card className="mb-6">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Prepare for the Boss</CardTitle>
            <CardDescription>Enter the topic and any relevant context for your final challenge.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="topic">Challenge Topic / Module</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Advanced Calculus, Startup Pitch Deck, Ethical AI"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="userContext">User Context / Scenario Details</Label>
              <Textarea
                id="userContext"
                value={userContext}
                onChange={(e) => setUserContext(e.target.value)}
                placeholder="Describe the scenario, what you've learned, or specific skills to be tested. E.g., 'Learned about financial modeling, need to create a 5-year projection for a tech startup.'"
                rows={3}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading || !topic.trim() || !userContext.trim()}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Boss Challenge
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

      {challenge && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Trophy className="mr-2 h-7 w-7 text-yellow-400" />
              Your Boss Level Challenge: {topic}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-md">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <Zap className="mr-2 h-5 w-5 text-accent" /> Challenge Details
                </h3>
                <MarkdownRenderer content={challenge.challenge} />
            </div>
            <div>
              <Label htmlFor="userResponse" className="text-lg font-semibold">Your Response / Solution</Label>
              <Textarea
                id="userResponse"
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
                placeholder="Craft your comprehensive response here..."
                rows={10}
                className="mt-2"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-4">
            <Button disabled>
              Submit Response (Evaluation coming soon)
            </Button>
             <Button variant="outline" onClick={() => {setChallenge(null); setTopic(''); setUserContext(''); setUserResponse('');}}>
                Generate New Challenge
            </Button>
            <p className="text-sm text-muted-foreground">
              Note: AI evaluation of Boss Level responses is a feature planned for future updates. For now, use this to self-assess or discuss with peers.
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
