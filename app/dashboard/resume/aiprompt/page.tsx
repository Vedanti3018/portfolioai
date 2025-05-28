"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles } from 'lucide-react';

export default function AiPromptPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      const response = await fetch('/api/generate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, jobTitle: '', jobDescription: '' }),
      });
      if (!response.ok) throw new Error('Failed to generate resume');
      const { resumeId } = await response.json();
      router.push(`/dashboard/resume/edit/${resumeId}`);
    } catch (err) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-8">
        AI Resume Prompt
      </h1>
      <Card className="bg-[#18181b] border border-white/10 text-white max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Enter a Prompt
          </CardTitle>
          <CardDescription>
            Describe the type of resume you want. The AI will generate it for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label htmlFor="prompt" className="text-white">Prompt</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g. Senior Software Engineer resume for a fintech company, focus on leadership and Python."
              className="bg-[#23232a] border border-white/10 text-white h-32"
            />
          </div>
          <Button
            className="bg-blue-500 text-white hover:bg-blue-600 w-full"
            onClick={handleSubmit}
            disabled={!prompt || loading}
          >
            {loading ? 'Generating...' : 'Generate Resume'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 