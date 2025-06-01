"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import jsPDF from 'jspdf';

export default function OptimizerResultPage() {
  const searchParams = useSearchParams();
  const optimizationId = searchParams.get('optimizationId');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedResume, setEditedResume] = useState('');
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchResult = async () => {
      if (!optimizationId) {
        setError('No optimization ID provided.');
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('resume_optimizations')
        .select('*')
        .eq('id', optimizationId)
        .single();
      if (error) {
        setError('Failed to fetch optimization result.');
        setLoading(false);
        return;
      }
      setResult(data);
      setEditedResume(data.resume_text || '');
      setLoading(false);
    };
    fetchResult();
  }, [optimizationId, supabase]);

  const handleDownloadPDF = () => {
    if (!editedResume) return;
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(editedResume, 180);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(lines, 15, 20);
    doc.save('optimized_resume.pdf');
  };

  const handleSave = async () => {
    if (!optimizationId) return;
    setLoading(true);
    const { error } = await supabase
      .from('resume_optimizations')
      .update({ resume_text: editedResume })
      .eq('id', optimizationId);
    setLoading(false);
    if (error) {
      setError('Failed to save changes.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] text-white">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center pt-24 px-4">
      <div className="w-full max-w-3xl bg-[#18181b] rounded-2xl shadow-xl p-8 flex flex-col gap-8">
        <h2 className="text-2xl font-bold text-white text-center mb-2">Résumé Optimization Result</h2>
        {/* Analysis and Suggestions */}
        <div className="bg-[#23232a] rounded-xl p-6 space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Analysis & Suggestions</h3>
          {result?.score !== null && (
            <p>Score: <span className="font-bold text-green-400">{result.score}</span></p>
          )}
          {result?.keyword_gaps?.length > 0 && (
            <div>
              <p className="font-semibold text-yellow-400">Keyword Gaps:</p>
              <ul className="list-disc list-inside text-yellow-300 mt-1 space-y-1">
                {result.keyword_gaps.map((kw: string, i: number) => (
                  <li key={i}>{kw}</li>
                ))}
              </ul>
            </div>
          )}
          {result?.suggestions && (
            <div>
              <p className="font-semibold text-white">Suggestions:</p>
              <ul className="list-disc list-inside text-gray-100 whitespace-pre-line mt-1 space-y-1">
                {Array.isArray(result.suggestions)
                    ? result.suggestions.map((s: string, i: number) => <li key={i}>{s}</li>)
                    : result.suggestions
                        .split(/\n|•|-|•/) // handle newlines or bullet points
                        .filter(line => line.trim() !== '')
                        .map((s: string, i: number) => <li key={i}>{s.trim()}</li>)}
                </ul>
            </div>

          )}
        </div>
        <div className="flex justify-center">
          <Button
            onClick={() => {
              if (optimizationId) window.location.href = `/dashboard/optimizer/edit/${optimizationId}`;
            }}
            className="bg-blue-600 text-white hover:bg-green-700 font-semibold py-3 px-6 rounded-md flex items-center justify-center gap-2"
          >
            Generate Optimized Resume
          </Button>
        </div>
      </div>
    </div>
  );
} 