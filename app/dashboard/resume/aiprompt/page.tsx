"use client";

import { useState, useEffect } from 'react';
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
  const [userInfo, setUserInfo] = useState<{ name: string; email: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchUserInfo = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setUserInfo({
          name: profile.full_name || '',
          email: profile.email || session.user.email || ''
        });
      }
    };

    fetchUserInfo();
  }, [supabase, router]);

  const handleSubmit = async () => {
    if (!prompt || !userInfo) return;
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      console.log('Submitting resume generation request:', {
        prompt,
        userId: session.user.id,
        userInfo
      });

      const response = await fetch(`${apiUrl}/generate-resume-from-prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt,
          userId: session.user.id,
          userInfo: {
            name: userInfo.name || '',
            email: userInfo.email || ''
          },
          source_type: 'prompt'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Resume generation failed:', errorData);
        throw new Error(errorData.error || 'Failed to generate resume');
      }

      const { resumeId } = await response.json();
      console.log('Resume generated successfully with ID:', resumeId);
      router.push(`/dashboard/resume/edit/${resumeId}`);
    } catch (err) {
      console.error('Error generating resume:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate resume');
    } finally {
      setLoading(false);
    }
  };

  if (!userInfo) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white/60">Loading user information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-8">
        AI Resume Generator
      </h1>
      <Card className="bg-[#18181b] border border-white/10 text-white max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Create Your Resume
          </CardTitle>
          <CardDescription>
            Describe your experience, skills, and achievements. The AI will craft a professional resume for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="prompt" className="text-white">Resume Goal</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Example: I have 5 years of experience in software development, specializing in React and Node.js. I led a team of 5 developers in building a large-scale e-commerce platform. I'm proficient in Python, JavaScript, and cloud technologies. I have a Master's in Computer Science and several AWS certifications."
                className="bg-[#23232a] border border-white/10 text-white h-48 mt-1"
              />
            </div>
            <div className="flex justify-center mt-4">
              <Button
                className="bg-white text-black hover:bg-white/90 w-fit px-4 py-2"
                onClick={handleSubmit}
                disabled={!prompt || loading}
              >
                {loading ? 'Generating...' : 'Generate Resume'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 