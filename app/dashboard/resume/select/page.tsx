"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText, Upload, ArrowLeft } from 'lucide-react';

interface Resume {
  id: string;
  title: string;
  content: any;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface Draft {
  id: string;
  user_id: string;
  name?: string;
  email?: string;
  phone?: string;
  content?: any;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export default function SelectResumePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [showExistingModal, setShowExistingModal] = useState(false);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [showTargetPrompt, setShowTargetPrompt] = useState(false);
  const [targetTitle, setTargetTitle] = useState('');
  const [targetDescription, setTargetDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);

  useEffect(() => {
    const fetchResumesAndDrafts = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      // Fetch resumes
      const { data: resumesData, error: resumesError } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', session.user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      // Fetch onboarding drafts
      const { data: draftsData, error: draftsError } = await supabase
        .from('onboarding_drafts')
        .select('*')
        .eq('user_id', session.user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      // Filter resumes
      const filteredResumes = (resumesData || []).filter(r =>
        (r.content && (
          (r.content.personal && r.content.personal.name && r.content.personal.name.trim() !== '') ||
          (r.content.experience && r.content.experience.length > 0)
        ))
      );
      // Filter drafts
      const filteredDrafts = (draftsData || []).filter(d =>
        (d.name && d.name.trim() !== '') || (d.content && d.content.personal && d.content.personal.name && d.content.personal.name.trim() !== '')
      );
      setResumes(filteredResumes);
      setDrafts(filteredDrafts);
      setLoading(false);
    };
    fetchResumesAndDrafts();
  }, [supabase, router]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not logged in');
      const { data: resume, error } = await supabase
        .from('resumes')
        .insert([
          {
            user_id: session.user.id,
            title: file.name,
            content: {
              personal: {
                name: '',
                title: '',
                email: '',
                phone: '',
                location: '',
                summary: '',
              },
              experience: [],
              education: [],
              skills: [],
            },
            is_primary: false,
            source_type: 'existing',
            file_url: null,
            original_filename: file.name,
            downloaded: false,
            deleted_at: null
          }
        ])
        .select()
        .single();
      if (error) throw error;
      setSelectedResume(resume);
      setShowTargetPrompt(true);
    } catch (err) {
      // Handle error
    } finally {
      setUploading(false);
    }
  };

  const handleExistingClick = () => {
    setShowExistingModal(true);
  };

  const handleResumeSelect = (resume: Resume) => {
    setSelectedResume(resume);
    setShowExistingModal(false);
    setShowTargetPrompt(true);
  };

  const handleTargetSubmit = async () => {
    if (!selectedResume) return;
    await supabase
      .from('resumes')
      .update({
        target_title: targetTitle,
        target_description: targetDescription
      })
      .eq('id', selectedResume.id);
    router.push(`/dashboard/resume/edit/${selectedResume.id}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f0f0f] text-white px-4">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard/resume')}
          className="flex items-center gap-2 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Select Resume</h1>
      </div>
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-3xl justify-center items-center">
        <Card
          className="bg-[#18181b] border border-white/10 text-white cursor-pointer hover:shadow-2xl hover:border-blue-500 transition-all p-8 flex flex-col items-center justify-center min-h-[180px] w-full md:w-1/2"
          onClick={handleUploadClick}
        >
          <Upload className="w-8 h-8 text-blue-400 mb-4" />
          <CardTitle className="text-lg font-semibold mb-2 text-center">Upload Resume</CardTitle>
          <CardDescription className="text-gray-400 text-base text-center">Upload a new resume (PDF/DOCX)</CardDescription>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            ref={fileInputRef}
            onChange={handleUpload}
            disabled={uploading}
          />
        </Card>
        <Card
          className="bg-[#18181b] border border-white/10 text-white cursor-pointer hover:shadow-2xl hover:border-green-500 transition-all p-8 flex flex-col items-center justify-center min-h-[180px] w-full md:w-1/2"
          onClick={handleExistingClick}
        >
          <FileText className="w-8 h-8 text-green-400 mb-4" />
          <CardTitle className="text-lg font-semibold mb-2 text-center">Select Existing Resume</CardTitle>
          <CardDescription className="text-gray-400 text-base text-center">Choose from your previously saved resumes</CardDescription>
        </Card>
      </div>
      {/* Existing Resume Modal */}
      {showExistingModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#18181b] border border-white/10 rounded-lg p-8 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-white text-center">Select a Resume</h2>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {loading ? (
                <div className="text-gray-400">Loading...</div>
              ) : resumes.length === 0 && drafts.length === 0 ? (
                <div className="text-gray-400">No resumes or drafts found.</div>
              ) : (
                [...resumes, ...drafts].map(item => (
                  <Card
                    key={item.id}
                    className="flex items-center justify-between px-4 py-3 cursor-pointer border border-white/10 bg-[#23232a] text-white hover:border-blue-400"
                    onClick={() => handleResumeSelect(item as Resume)}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <span>{'title' in item ? item.title : item.name}</span>
                    </div>
                  </Card>
                ))
              )}
            </div>
            <div className="flex justify-end mt-6">
              <Button
                variant="outline"
                className="bg-[#23232a] text-white border border-white/10"
                onClick={() => setShowExistingModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Target Prompt Modal */}
      {showTargetPrompt && selectedResume && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#18181b] border border-white/10 rounded-lg p-8 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-white">Add Desired Job Details</h2>
            <div className="mb-4">
              <Label htmlFor="targetTitle" className="text-white">Target Job Title</Label>
              <Input
                id="targetTitle"
                value={targetTitle}
                onChange={e => setTargetTitle(e.target.value)}
                placeholder="Search a job by title or industry"
                className="bg-[#23232a] border border-white/10 text-white"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="targetDescription" className="text-white">Target Job Description</Label>
              <Textarea
                id="targetDescription"
                value={targetDescription}
                onChange={e => setTargetDescription(e.target.value)}
                placeholder="Paste your job details here..."
                className="bg-[#23232a] border border-white/10 text-white"
              />
            </div>
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                className="bg-[#23232a] text-white border border-white/10"
                onClick={() => setShowTargetPrompt(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-500 text-white hover:bg-blue-600"
                onClick={handleTargetSubmit}
                disabled={!targetTitle || !targetDescription}
              >
                Next Step
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 