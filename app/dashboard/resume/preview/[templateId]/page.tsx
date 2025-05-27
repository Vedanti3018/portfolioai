'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Download } from 'lucide-react';
import { toast } from 'sonner';

interface ResumeData {
  id?: string;
  user_id?: string;
  title: string;
  content: {
    personal: {
      name: string;
      title: string;
      email: string;
      phone: string;
      location: string;
      summary: string;
    };
    experience: Array<{
      company: string;
      position: string;
      startDate: string;
      endDate: string;
      description: string;
    }>;
    education: Array<{
      school: string;
      degree: string;
      field: string;
      startDate: string;
      endDate: string;
    }>;
    skills: string[];
  };
  is_primary: boolean;
  created_at?: string;
  updated_at?: string;
}

const defaultResumeData: ResumeData = {
  title: 'My Resume',
  content: {
    personal: {
      name: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      summary: ''
    },
    experience: [],
    education: [],
    skills: []
  },
  is_primary: false
};

export default function ResumePreviewPage({ params }: { params: Promise<{ templateId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }
        await loadResumeData();
      } catch (err) {
        console.error('Error checking auth:', err);
        setError('Failed to verify authentication');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, supabase]);

  const loadResumeData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_primary', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setResumeData(data);
      }
    } catch (err) {
      console.error('Error loading resume:', err);
      toast.error('Failed to load resume data');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const resumeToSave = {
        ...resumeData,
        user_id: session.user.id,
        updated_at: new Date().toISOString()
      };

      if (resumeData.id) {
        const { error } = await supabase
          .from('resumes')
          .update(resumeToSave)
          .eq('id', resumeData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('resumes')
          .insert([{ ...resumeToSave, created_at: new Date().toISOString() }]);

        if (error) throw error;
      }

      toast.success('Resume saved successfully');
    } catch (err) {
      console.error('Error saving resume:', err);
      toast.error('Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch('/api/generate-resume-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: resolvedParams.templateId,
          resumeData
        }),
      });

      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resumeData.title.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading resume:', err);
      toast.error('Failed to download resume');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] text-white p-8">
        <Card className="w-full max-w-md border-none bg-[#18181b]/90 rounded-2xl shadow-2xl backdrop-blur-md text-center p-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-red-500">Error</h2>
            <p className="text-gray-400">{error}</p>
            <Button onClick={() => router.push('/login')}>Back to Login</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Resume Editor
            </h1>
            <p className="text-gray-400">
              Template: {resolvedParams.templateId.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              className="bg-white/10 text-white hover:bg-white/20 border border-white/20"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Resume
            </Button>
            <Button
              className="bg-white/10 text-white hover:bg-white/20 border border-white/20"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Panel */}
          <Card className="border-none bg-[#18181b]/90 rounded-2xl shadow-2xl backdrop-blur-md p-6">
            <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Edit Resume
            </h2>
            {/* Add your form components here */}
          </Card>

          {/* Preview Panel */}
          <Card className="border-none bg-[#18181b]/90 rounded-2xl shadow-2xl backdrop-blur-md p-6">
            <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Preview
            </h2>
            <div className="bg-white rounded-lg p-8">
              <iframe
                src={`/api/preview-resume?templateId=${resolvedParams.templateId}`}
                className="w-full h-[800px] border-none"
                title="Resume Preview"
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 