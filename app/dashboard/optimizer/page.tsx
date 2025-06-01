"use client";
import { useState } from "react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function OptimizerPage() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [keywordGaps, setKeywordGaps] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState('');
  const [error, setError] = useState<string | null>(null);

  const supabase = createClientComponentClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleOptimize = async () => {
    setLoading(true);
    setError(null);
    setScore(null);
    setKeywordGaps([]);
    setSuggestions('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in to optimize your resume.');
        setLoading(false);
        return;
      }
      const formData = new FormData();
      if (resumeFile) {
        formData.append('resume', resumeFile);
      } else if (resumeText) {
        formData.append('resumeText', resumeText);
      } else {
        setError('Please upload a resume or paste resume text.');
        setLoading(false);
        return;
      }
      formData.append('jobDescription', jobDescription);
      formData.append('userId', user.id);

      const res = await fetch('/api/optimize-resume', {
        method: 'POST',
        body: formData,
      });

      let data = null;
      try {
        data = await res.json();
      } catch (e) {
        setError('Failed to parse server response.');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(data.error || 'Failed to optimize resume');
        setLoading(false);
        return;
      }

      // Redirect to result page with optimizationId
      if (data.optimizationId) {
        window.location.href = `/dashboard/optimizer/result?optimizationId=${data.optimizationId}`;
        return;
      }

      setScore(data.score);
      setKeywordGaps(data.keyword_gaps || []);
      setSuggestions(data.suggestions || '');
      toast.success('Resume optimized!');
    } catch (err) {
      setError('Failed to fetch. Please check your network connection or try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center pt-24 px-4">
      <div className="w-full max-w-3xl bg-[#18181b] rounded-2xl shadow-xl p-8 flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-white text-center">Résumé Optimizer</h2>

        <div className="space-y-6">
          {/* Resume Upload */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-300">Upload Resume (PDF, DOCX)</label>
            <Input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />

            <label className="text-sm font-medium text-gray-300">Or paste resume text</label>
            <Textarea
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400"
              placeholder="Paste your resume text here (optional if uploading)"
              rows={6}
            />
          </div>

          {/* Job Description Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Job Description</label>
            <Textarea
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400"
              placeholder="Paste the job description here"
              rows={6}
            />
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleOptimize}
              disabled={loading}
              className="bg-white text-black hover:bg-gray-200 transition-colors gap-2"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
              {loading ? 'Optimizing...' : 'Optimize Resume'}
            </Button>
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        {/* Results Section */}
        {(score !== null || keywordGaps.length > 0 || suggestions) && (
          <div className="bg-[#23232a] rounded-xl p-6 mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Results</h3>

            {score !== null && (
              <p>Score: <span className="font-bold text-green-400">{score}</span></p>
            )}

            {keywordGaps.length > 0 && (
              <div>
                <p className="font-semibold text-yellow-400">Keyword Gaps:</p>
                <ul className="list-disc list-inside text-yellow-300 mt-1 space-y-1">
                  {keywordGaps.map((kw, i) => (
                    <li key={i}>{kw}</li>
                  ))}
                </ul>
              </div>
            )}

            {suggestions && (
              <div>
                <p className="font-semibold text-white">Suggestions:</p>
                {/* Always render suggestions as a bullet list */}
                {(() => {
                  let items: string[] = [];
                  if (Array.isArray(suggestions)) {
                    items = suggestions;
                  } else if (typeof suggestions === 'string') {
                    try {
                      // Try to parse as JSON array
                      const parsed = JSON.parse(suggestions);
                      if (Array.isArray(parsed)) items = parsed;
                      else items = suggestions.split(/\n|\r|\d+\.|\-/).map(s => s.trim()).filter(Boolean);
                    } catch {
                      // Fallback: split by newlines or bullet points
                      items = suggestions.split(/\n|\r|\d+\.|\-/).map(s => s.trim()).filter(Boolean);
                    }
                  }
                  return (
                    <ul className="list-disc list-inside text-gray-100 mt-1 space-y-1">
                      {items.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
