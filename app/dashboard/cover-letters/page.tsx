"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';

export default function CoverLettersPage() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState(''); // For future: select from existing resumes
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [fields, setFields] = useState({
    fullName: '',
    address: '',
    phone: '',
    email: '',
    date: '',
    hiringManager: '',
    hiringTitle: '',
    company: '',
    companyAddress: '',
  });
  const today = new Date().toLocaleDateString();
  const coverLetterRef = useRef(coverLetter);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    console.log('[CoverLetter] Component mounted');
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error('[CoverLetter] Error fetching user:', userError);
          return;
        }
        
        if (user) {
          console.log('[CoverLetter] Fetching profile for user:', user.id);
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', user.id)
            .single();
            
          if (error) {
            console.error('[CoverLetter] Error fetching profile:', error);
            return;
          }
          
          if (data) {
            console.log('[CoverLetter] Profile data:', data);
            setProfile(data);
            setFields(f => ({
              ...f,
              fullName: data.full_name || '',
              email: data.email || '',
              date: today,
            }));
          }
        }
      } catch (err) {
        console.error('[CoverLetter] Unexpected error in fetchProfile:', err);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    setFields(f => ({ ...f, date: today }));
  }, [today]);

  // TODO: Implement resume selection from Supabase

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    console.log('[CoverLetter] Generate button clicked');
    setLoading(true);
    setError(null);
    setCoverLetter('');

    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in to generate a cover letter');
        setLoading(false);
        return;
      }
      console.log('[CoverLetter] Current user:', user);

      if (resumeFile) {
        const formData = new FormData();
        formData.append('resumeFile', resumeFile);
        formData.append('jobDescription', jobDescription);
        formData.append('fullName', fields.fullName);
        formData.append('email', fields.email);
        formData.append('address', fields.address);
        formData.append('phone', fields.phone);
        formData.append('date', fields.date);
        formData.append('hiringManager', fields.hiringManager);
        formData.append('hiringTitle', fields.hiringTitle);
        formData.append('company', fields.company);
        formData.append('companyAddress', fields.companyAddress);

        // Debug: print all FormData entries
        for (let [key, value] of formData.entries()) {
          console.log('[CoverLetter] FormData entry:', key, value);
        }
        console.log('[CoverLetter] Sending FormData with file:', resumeFile.name);

        const res = await fetch(`${apiUrl}/generate-cover-letter`, {
          method: 'POST',
          body: formData,
        });

        let data = null;
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            data = await res.json();
          } catch (e) {
            console.error('[CoverLetter] Failed to parse JSON response:', e);
            setError('Failed to parse server response.');
            setLoading(false);
            return;
          }
        } else {
          const text = await res.text();
          console.error('[CoverLetter] Received non-JSON response:', text);
          setError('Server returned an invalid response format.');
          setLoading(false);
          return;
        }

        if (!res.ok) {
          console.error('[CoverLetter] Server error:', data);
          setError(data?.detail || data?.error || 'Failed to generate cover letter');
          setLoading(false);
          return;
        }

        // Save the cover letter to Supabase
        try {
          const { error: saveError } = await supabase
            .from('cover_letters')
            .insert({
              user_id: user.id,
              title: `Cover Letter for ${fields.company || 'Job'}`,
              content: data.cover_letter,
              job_title: fields.hiringTitle,
              company: fields.company,
              job_description: jobDescription,
              source_type: 'upload',
              status: 'generated'
            });

          if (saveError) {
            console.error('[CoverLetter] Error saving cover letter:', saveError);
            // Don't show error to user since the cover letter was generated successfully
          }
        } catch (saveErr) {
          console.error('[CoverLetter] Error saving cover letter:', saveErr);
          // Don't show error to user since the cover letter was generated successfully
        }

        setCoverLetter(data.cover_letter);
        toast.success('Cover letter generated!');
        setLoading(false);
        return;
      }

      // If no file is uploaded, use the text input
      if (!resumeText) {
        setError('Please provide a resume (upload or paste text).');
        setLoading(false);
        return;
      }

      if (!jobDescription) {
        setError('Please enter a job description.');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('jobDescription', jobDescription);
      formData.append('fullName', fields.fullName);
      formData.append('email', fields.email);
      formData.append('address', fields.address);
      formData.append('phone', fields.phone);
      formData.append('date', fields.date);
      formData.append('hiringManager', fields.hiringManager);
      formData.append('hiringTitle', fields.hiringTitle);
      formData.append('company', fields.company);
      formData.append('companyAddress', fields.companyAddress);

      const res = await fetch(`${apiUrl}/generate-cover-letter`, {
        method: 'POST',
        body: formData,
      });

      let data = null;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch (e) {
          console.error('[CoverLetter] Failed to parse JSON response:', e);
          setError('Failed to parse server response.');
          setLoading(false);
          return;
        }
      } else {
        const text = await res.text();
        console.error('[CoverLetter] Received non-JSON response:', text);
        setError('Server returned an invalid response format.');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        console.error('[CoverLetter] Server error:', data);
        setError(data?.detail || data?.error || 'Failed to generate cover letter');
        setLoading(false);
        return;
      }

      // Save the cover letter to Supabase
      try {
        const { error: saveError } = await supabase
          .from('cover_letters')
          .insert({
            user_id: user.id,
            title: `Cover Letter for ${fields.company || 'Job'}`,
            content: data.cover_letter,
            job_title: fields.hiringTitle,
            company: fields.company,
            job_description: jobDescription,
            source_type: 'text',
            status: 'generated'
          });

        if (saveError) {
          console.error('[CoverLetter] Error saving cover letter:', saveError);
          // Don't show error to user since the cover letter was generated successfully
        }
      } catch (saveErr) {
        console.error('[CoverLetter] Error saving cover letter:', saveErr);
        // Don't show error to user since the cover letter was generated successfully
      }

      setCoverLetter(data.cover_letter);
      toast.success('Cover letter generated!');
    } catch (err) {
      console.error('[CoverLetter] Unexpected error:', err);
      setError('Failed to fetch. Please check your network connection or try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!coverLetter) return;
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(coverLetter, 180);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(lines, 15, 20);
    doc.save('cover_letter.pdf');
  };

  const handleEdit = () => setEditMode(true);
  const handleCancelEdit = () => setEditMode(false);
  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };
  const handleSaveEdit = () => {
    setEditMode(false);
    // Replace placeholders in cover letter
    let updated = coverLetter;
    updated = updated.replace(/\[Your Name\]/g, fields.fullName || '[Your Name]');
    updated = updated.replace(/\[Your Address\]/g, fields.address || '[Your Address]');
    updated = updated.replace(/\[Your Phone Number\]/g, fields.phone || '[Your Phone Number]');
    updated = updated.replace(/\[Your Email\]/g, fields.email || '[Your Email]');
    updated = updated.replace(/\[Date\]/g, fields.date || today);
    updated = updated.replace(/\[Hiring Manager Name\]/g, fields.hiringManager || '[Hiring Manager Name]');
    updated = updated.replace(/\[Hiring Manager Title\]/g, fields.hiringTitle || '[Hiring Manager Title]');
    updated = updated.replace(/\[Company X\]/g, fields.company || '[Company X]');
    updated = updated.replace(/\[Company Address\]/g, fields.companyAddress || '[Company Address]');
    setCoverLetter(updated);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col lg:flex-row">
      {/* Left Panel: Input */}
      <aside className={cn(
        'transition-all duration-300 lg:w-1/3 w-full p-6 bg-black border-r border-white/10 overflow-y-auto pt-24',
        'max-w-lg'
      )}>
        <h2 className="text-2xl font-bold mb-6">Cover Letter Generator</h2>
        <div className="space-y-6">
          {/* Resume Upload/Select */}
          <section className="space-y-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">Upload Resume (PDF, DOCX)</label>
            <Input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
            {/* TODO: Add select from existing resumes */}
            <label className="block text-sm font-medium text-gray-300 mb-1 mt-4">Or paste resume text</label>
            <Textarea
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400"
              placeholder="Paste your resume text here (optional if uploading)"
              rows={6}
            />
          </section>
          {/* Job Description */}
          <section className="space-y-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">Job Description</label>
            <Textarea
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400"
              placeholder="Paste the job description here"
              rows={6}
            />
          </section>
          {/* Generate Button */}
          <Button
            className="w-full bg-green-600 text-white hover:bg-green-700 font-semibold py-3 px-6 rounded-md flex items-center justify-center gap-2"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            {loading ? 'Generating...' : 'Generate with AI'}
          </Button>
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        </div>
      </aside>
      {/* Right Panel: Output */}
      <main className={cn(
        'transition-all duration-300 p-8 pt-24 flex-1 flex flex-col',
        'items-center justify-start'
      )}>
        <div className="w-full max-w-2xl bg-[#18181b] rounded-2xl shadow-xl p-8 min-h-[400px] flex flex-col">
          <div className="flex flex-row items-center justify-between mb-4">
            <div className="flex flex-row gap-2">
              <button
                className="bg-[#23232a] text-white border border-white/10 rounded-lg px-3 py-1 shadow hover:bg-[#23232a]/80 transition-colors font-semibold flex items-center gap-2"
                onClick={() => router.back()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back
              </button>
              <button
                className="bg-blue-700 text-white border border-blue-700 rounded-lg px-3 py-1 shadow hover:bg-blue-800 transition-colors font-semibold flex items-center gap-2"
                onClick={handleEdit}
                disabled={editMode}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232a2.5 2.5 0 113.536 3.536L7.5 20.036l-4 1 1-4 11.268-11.268z" /></svg>
                Edit
              </button>
            </div>
            <h3 className="text-xl font-semibold">Generated Cover Letter</h3>
          </div>
          {editMode ? (
            <form className="space-y-4 bg-[#23232a] p-4 rounded-lg mb-4">
              <div className="flex gap-4">
                <input name="fullName" value={fields.fullName} onChange={handleFieldChange} placeholder="Your Name" className="flex-1 bg-[#18181b] border border-white/10 rounded px-3 py-2 text-white" />
                <input name="date" value={fields.date} onChange={handleFieldChange} placeholder="Date" className="flex-1 bg-[#18181b] border border-white/10 rounded px-3 py-2 text-white" />
              </div>
              <input name="address" value={fields.address} onChange={handleFieldChange} placeholder="Your Address" className="w-full bg-[#18181b] border border-white/10 rounded px-3 py-2 text-white" />
              <div className="flex gap-4">
                <input name="phone" value={fields.phone} onChange={handleFieldChange} placeholder="Your Phone Number" className="flex-1 bg-[#18181b] border border-white/10 rounded px-3 py-2 text-white" />
                <input name="email" value={fields.email} onChange={handleFieldChange} placeholder="Your Email" className="flex-1 bg-[#18181b] border border-white/10 rounded px-3 py-2 text-white" />
              </div>
              <input name="hiringManager" value={fields.hiringManager} onChange={handleFieldChange} placeholder="Hiring Manager Name" className="w-full bg-[#18181b] border border-white/10 rounded px-3 py-2 text-white" />
              <input name="hiringTitle" value={fields.hiringTitle} onChange={handleFieldChange} placeholder="Hiring Manager Title" className="w-full bg-[#18181b] border border-white/10 rounded px-3 py-2 text-white" />
              <input name="company" value={fields.company} onChange={handleFieldChange} placeholder="Company X" className="w-full bg-[#18181b] border border-white/10 rounded px-3 py-2 text-white" />
              <input name="companyAddress" value={fields.companyAddress} onChange={handleFieldChange} placeholder="Company Address" className="w-full bg-[#18181b] border border-white/10 rounded px-3 py-2 text-white" />
              <div className="flex gap-4 mt-2">
                <button type="button" onClick={handleSaveEdit} className="flex-1 bg-green-700 hover:bg-green-800 text-white font-semibold py-2 rounded">Save</button>
                <button type="button" onClick={handleCancelEdit} className="flex-1 bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 rounded">Cancel</button>
              </div>
            </form>
          ) : null}
          <div className="flex-1 overflow-y-auto whitespace-pre-line text-gray-100 text-base font-normal" style={{ minHeight: 200 }}>
            {coverLetter ? coverLetter : <span className="text-gray-500">Your generated cover letter will appear here.</span>}
          </div>
          <div className="mt-8 w-full flex flex-row gap-4">
            <Button
              className="flex-1 bg-blue-700 text-white hover:bg-blue-800 font-semibold py-3 px-6 rounded-md flex items-center justify-center gap-2"
              onClick={handleGenerate}
              disabled={loading || !coverLetter}
              variant="secondary"
            >
              <RefreshCw className="h-5 w-5" />
              Regenerate
            </Button>
            <Button
              className="flex-1 bg-green-700 text-white hover:bg-green-800 font-semibold py-3 px-6 rounded-md flex items-center justify-center gap-2"
              onClick={handleDownloadPDF}
              disabled={!coverLetter}
              variant="secondary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Download as PDF
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
} 
