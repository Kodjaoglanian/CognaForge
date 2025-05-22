'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { PageTitle } from '@/components/shared/page-title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { knowledgeConstruction, type KnowledgeConstructionInput, type KnowledgeConstructionOutput } from '@/ai/flows/knowledge-construction';
import { Loader2, AlertCircle, BookOpen, BrainCog } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MarkdownRenderer } from '@/components/shared/markdown-renderer';

export default function KnowledgeConstructionPage() {
  const [topic, setTopic] = useState('');
  const [learningStyle, setLearningStyle] = useState('');
  const [pace, setPace] = useState('');
  const [retentionCapacity, setRetentionCapacity] = useState('');
  
  const [constructionResult, setConstructionResult] = useState<KnowledgeConstructionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast({ title: 'Topic Required', description: 'Please enter a topic to construct knowledge.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setError(null);
    setConstructionResult(null);

    try {
      const input: KnowledgeConstructionInput = { 
        topic,
        learningStyle: learningStyle || undefined, // Send undefined if empty
        pace: pace || undefined,
        retentionCapacity: retentionCapacity || undefined,
      };
      const result = await knowledgeConstruction(input);
      setConstructionResult(result);
      toast({ title: 'Knowledge Constructed!', description: 'Mind map and smart notes are ready.', variant: 'default' });
    } catch (err) {
      console.error(err);
      setError('Failed to construct knowledge. Please try again.');
      toast({ title: 'Error', description: 'Failed to construct knowledge.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const learningStyles = ["Visual", "Auditory", "Kinesthetic", "Reading/Writing"];
  const paces = ["Fast", "Medium", "Slow"];
  const retentionCapacities = ["High", "Medium", "Low"];

  return (
    <div>
      <PageTitle
        title="Knowledge Construction"
        description="Co-create dynamic mind maps and smart notes with the AI, tailored to your learning preferences."
      />

      <Card className="mb-6">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Define Your Learning Blueprint</CardTitle>
            <CardDescription>Provide a topic and optionally your learning preferences for a personalized experience.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="topic">Topic for Construction</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., The Renaissance, Machine Learning Basics, Sustainable Energy"
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="learningStyle">Learning Style (Optional)</Label>
                <Select value={learningStyle} onValueChange={setLearningStyle} disabled={isLoading}>
                  <SelectTrigger id="learningStyle"><SelectValue placeholder="Select style" /></SelectTrigger>
                  <SelectContent>
                    {learningStyles.map(style => <SelectItem key={style} value={style}>{style}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="pace">Learning Pace (Optional)</Label>
                <Select value={pace} onValueChange={setPace} disabled={isLoading}>
                  <SelectTrigger id="pace"><SelectValue placeholder="Select pace" /></SelectTrigger>
                  <SelectContent>
                    {paces.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="retentionCapacity">Retention Capacity (Optional)</Label>
                <Select value={retentionCapacity} onValueChange={setRetentionCapacity} disabled={isLoading}>
                  <SelectTrigger id="retentionCapacity"><SelectValue placeholder="Select capacity" /></SelectTrigger>
                  <SelectContent>
                    {retentionCapacities.map(rc => <SelectItem key={rc} value={rc}>{rc}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading || !topic.trim()}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Construct Knowledge
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

      {constructionResult && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <BrainCog className="mr-2 h-6 w-6 text-accent" />
                Dynamic Mind Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownRenderer content={constructionResult.mindMap} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <BookOpen className="mr-2 h-6 w-6 text-accent" />
                Personalized Smart Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownRenderer content={constructionResult.smartNotes} />
            </CardContent>
          </Card>
           <div className="text-center mt-4">
             <Button variant="outline" onClick={() => {setConstructionResult(null); setTopic(''); setLearningStyle(''); setPace(''); setRetentionCapacity('');}}>
                Construct New Knowledge
            </Button>
           </div>
        </div>
      )}
    </div>
  );
}
