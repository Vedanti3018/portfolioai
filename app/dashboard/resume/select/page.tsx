"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText, Upload, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

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
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
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

  const fetchResumesAndDrafts = useCallback(async () => {
    setLoading(true);
    try {
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
        .select('parsed_data')
        .eq('id', session.user.id)
        .single();
      // Filter resumes
      const filteredResumes = (resumesData || []).filter(r =>
        (r.content && (
          (r.content.personal && r.content.personal.name && r.content.personal.name.trim() !== '') ||
          (r.content.experience && r.content.experience.length > 0)
        ))
      );
      // Filter drafts
      const filteredDrafts = draftsData && draftsData.parsed_data
        ? [{
            id: session.user.id,
            user_id: session.user.id,
            ...draftsData.parsed_data
          }].filter(d =>
            d.name?.trim() ||
            (d.content?.personal?.name?.trim())
          )
        : [];
      setResumes(filteredResumes);
      setDrafts(filteredDrafts);
    } catch (error) {
      console.error('Error fetching resumes and drafts:', error);
      toast.error('Failed to load resumes and drafts');
    } finally {
      setLoading(false);
    }
  }, [supabase, router]);

  useEffect(() => {
    fetchResumesAndDrafts();
  }, [fetchResumesAndDrafts]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not logged in');

      // First upload the file to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);

      // Create the resume record
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
            file_url: publicUrl,
            original_filename: file.name,
            downloaded: false,
            deleted_at: null
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Call the API to parse the resume
      const formData = new FormData();
      formData.append('file', file);
      formData.append('file_url', publicUrl);
      formData.append('resume_id', resume.id);

      const response = await fetch('/api/onboarding/parse-cv', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to parse resume');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to parse resume');
      }

      // Update the resume with parsed data
      const { error: updateError } = await supabase
        .from('resumes')
        .update({
          content: data.structured,
          updated_at: new Date().toISOString()
        })
        .eq('id', resume.id);

      if (updateError) throw updateError;

      setSelectedResume(resume);
      setShowTargetPrompt(true);
      toast.success('Resume uploaded and parsed successfully!');
    } catch (err) {
      console.error('Error uploading resume:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  }, [supabase]);

  const handleExistingClick = useCallback(() => {
    setShowExistingModal(true);
  }, []);

  const handleResumeSelect = useCallback((item: Resume | Draft) => {
    if ('title' in item) {
      // It's a Resume
      setSelectedResume(item as Resume);
    } else {
      // It's a Draft - create a new resume from the draft
      const draftResume: Resume = {
        id: item.id,
        title: item.name || 'Untitled Resume',
        content: item.content || {
          personal: {
            name: item.name || '',
            title: '',
            email: item.email || '',
            phone: item.phone || '',
            location: '',
            summary: '',
          },
          experience: [],
          education: [],
          skills: [],
        },
        is_primary: false,
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString(),
        deleted_at: null
      };
      setSelectedResume(draftResume);
    }
    setShowExistingModal(false);
    setShowTargetPrompt(true);
  }, []);

  const handleTargetSubmit = useCallback(async () => {
    if (!selectedResume) return;
    try {
      await supabase
        .from('resumes')
        .update({
          target_title: targetTitle,
          target_description: targetDescription
        })
        .eq('id', selectedResume.id);
      router.push(`/dashboard/resume/edit/${selectedResume.id}`);
    } catch (error) {
      console.error('Error updating resume:', error);
      toast.error('Failed to update resume');
    }
  }, [selectedResume, targetTitle, targetDescription, supabase, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f0f0f] text-white px-4">
      <div className="flex items-center gap-4 mb-8">
        
        <h1 className="text-3xl font-bold">Select Resume</h1>
      </div>
      {loading ? (
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-10 w-10 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <div className="text-lg font-semibold">Loading...</div>
        </div>
      ) : (
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
      )}
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
                    onClick={() => handleResumeSelect(item as Resume | Draft)}
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
