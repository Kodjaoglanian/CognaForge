import { PageTitle } from '@/components/shared/page-title';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NAV_ITEMS } from '@/lib/constants';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div>
      <PageTitle
        title="Welcome to CognaForge"
        description="Your personal AI-powered cognitive gym. Sharpen your mind, challenge your limits, and forge new knowledge."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {NAV_ITEMS.filter(item => item.href !== '/').map((item) => (
          <Card key={item.href} className="flex flex-col_hover:shadow-lg transition-shadow duration-200">
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
                  Go to {item.label || item.title}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>About CognaForge</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            CognaForge is designed to transform learning into an active, engaging, and intellectually stimulating process.
            Instead of passive consumption of content, you'll engage in cognitive battles, debate with AI,
            co-create knowledge structures, and conquer challenging boss levels.
          </p>
          <p className="mt-4 text-muted-foreground">
            Our goal is to help you achieve new heights of reasoning, understanding, and mastery in any subject you choose.
            Welcome to the future of learning.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function getFeatureDescription(href: string): string {
  switch (href) {
    case '/cognitive-battle':
      return 'Engage in AI-driven Q&A sessions that adapt to your understanding, pushing your cognitive boundaries.';
    case '/argument-duel':
      return 'Sharpen your reasoning by defending your stance against an AI that plays devil\'s advocate.';
    case '/knowledge-construction':
      return 'Collaborate with AI to build dynamic mind maps and personalized smart notes for any topic.';
    case '/boss-level':
      return 'Test your mastery with complex, practical challenges designed to synthesize your learning.';
    case '/socratic-mode':
      return 'Deepen your reflection as the AI guides you with thought-provoking questions, Socratic style.';
    default:
      return 'Explore this feature to enhance your learning journey.';
  }
}
