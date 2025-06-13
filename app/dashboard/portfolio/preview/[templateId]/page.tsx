'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Download, Plus, Trash2, Sparkles, ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { PostgrestError } from '@supabase/supabase-js';

const MotionCard = motion(Card);

// Define templates centrally if possible, for now keep a local copy
const templates = [
  {
    id: 'tech-developer',
    name: 'Tech Developer',
    fileName: 'tech-developer.html',
    thumbnail: '/templates/tech-developer.png',
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    fileName: 'minimalist.html',
    thumbnail: '/templates/minimalist.png',
  },
  {
    id: 'creative',
    name: 'Creative',
    fileName: 'creative.html',
    thumbnail: '/templates/creative-professional.png',
  },
  {
    id: 'professional',
    name: 'Professional',
    fileName: 'professional.html',
    thumbnail: '/templates/professional.png',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    fileName: 'cyberpunk.html',
    thumbnail: '/templates/cyberpunk.png',
  },
  {
    id: 'dark',
    name: 'Dark',
    fileName: 'dark.html',
    thumbnail: '/templates/dark.png',
  }
];

// Update the interfaces to match the database schema
interface BasicInfo {
  name: string;
  email: string;
  phone: string;
  country: string;
  current_designation: string;
}

interface Skills {
  technical_skills: string[];
  soft_skills: string[];
  languages: string[];
}

interface Education {
  id?: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  description: string;
}

interface Experience {
  id?: string;
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  description: string;
}

interface Project {
  id?: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  url: string;
}

interface Certification {
  id?: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
}

interface Testimonial {
  id?: string;
  name: string;
  photo: string;
  date: string;
  rating: number;
  text: string;
}

interface PortfolioData {
  id?: string;
  user_id?: string;
  title: string;
  description: string;
  published: boolean;
  theme: string;
  custom_domain: string | null;
  basic_info: BasicInfo;
  education: Education[];
  experience: Experience[];
  skills: Skills;
  projects: Project[];
  certifications: Certification[];
  testimonials: Testimonial[];
  template_style: string;
  template_name: string;
  linkedin_url?: string;
  github_url?: string;
  download_count?: number;
  last_downloaded_at?: string;
}

// Ensure all fields are initialized with defined empty values
const emptyPortfolioData: PortfolioData = {
  title: '',
  description: '',
  published: false,
  theme: 'dark',
  custom_domain: null, // null is acceptable for nullable fields
  basic_info: {
    name: '',
    email: '',
    phone: '',
    country: '',
    current_designation: '',
  },
  skills: {
    technical_skills: [],
    soft_skills: [],
    languages: []
  },
  education: [],
  experience: [],
  projects: [],
  certifications: [],
  testimonials: [],
  template_style: 'Professional',
  template_name: 'Modern Black & White',
  linkedin_url: '',
  github_url: '',
};

// Helper function to ensure all fields have defined values
const ensureDefinedPortfolioData = (data: any): PortfolioData => ({
  id: data?.id || undefined, // Keep id as optional/undefined if not present
  user_id: data?.user_id || undefined, // Keep user_id as optional/undefined if not present
  title: data?.title || '',
  description: data?.description || '',
  published: data?.published ?? false, // Use ?? for boolean default
  theme: data?.theme || 'dark',
  custom_domain: data?.custom_domain ?? null, // Use ?? for nullable default
  basic_info: {
    name: data?.basic_info?.name || '',
    email: data?.basic_info?.email || '',
    phone: data?.basic_info?.phone || '',
    country: data?.basic_info?.country || '',
    current_designation: data?.basic_info?.current_designation || '',
  },
  skills: {
    technical_skills: data?.skills?.technical_skills || [],
    soft_skills: data?.skills?.soft_skills || [],
    languages: data?.skills?.languages || []
  },
  education: data?.education?.map((item: any) => ({
    id: item?.id || crypto.randomUUID(), // Ensure each item has a temporary ID
    institution: item?.institution || '',
    degree: item?.degree || '',
    field_of_study: item?.field_of_study || '',
    start_date: item?.start_date || '',
    end_date: item?.end_date || '',
    description: item?.description || '',
  })) || [],
  experience: data?.experience?.map((item: any) => ({
    id: item?.id || crypto.randomUUID(), // Ensure each item has a temporary ID
    company: item?.company || '',
    position: item?.position || '',
    start_date: item?.start_date || '',
    end_date: item?.end_date || '',
    description: item?.description || '',
  })) || [],
  projects: data?.projects?.map((item: any) => ({
    id: item?.id || crypto.randomUUID(), // Ensure each item has a temporary ID
    name: item?.name || '',
    description: item?.description || '',
    start_date: item?.start_date || '',
    end_date: item?.end_date || '',
    url: item?.url || '',
  })) || [],
  certifications: data?.certifications?.map((item: any) => ({
    id: item?.id || crypto.randomUUID(), // Ensure each item has a temporary ID
    name: item?.name || '',
    issuer: item?.issuer || '',
    date: item?.date || '',
    url: item?.url || '',
  })) || [],
  testimonials: Array.isArray(data?.testimonials)
    ? data.testimonials.map((t: any) => ({
        id: t?.id || crypto.randomUUID(),
        name: t?.name || '',
        photo: t?.photo || '',
        date: t?.date || '',
        rating: typeof t?.rating === 'number' ? t.rating : 5,
        text: t?.text || '',
      }))
    : [],
  template_style: data?.template_style || 'Professional',
  template_name: data?.template_name || 'Modern Black & White',
  linkedin_url: data?.linkedin_url || '',
  github_url: data?.github_url || '',
  download_count: data?.download_count || 0,
  last_downloaded_at: data?.last_downloaded_at || '',
});

export default function PortfolioEditorPage() {
  const params = useParams();
  const templateId = params?.templateId as string;
  const router = useRouter();
   const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [portfolioData, setPortfolioData] = useState<PortfolioData>(emptyPortfolioData);
  const [error, setError] = useState<string | null>(null);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(true);

  const fetchPortfolioData = useCallback(async () => {
    if (!templateId || typeof templateId !== 'string') {
      setError('Invalid template ID');
      setLoading(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in to edit your portfolio');
        router.push('/login');
        return;
      }

      const userId = session.user.id;

      // 1. Try to fetch existing portfolio data for this user
      const { data: portfolio, error: fetchError } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching portfolio data:', fetchError);
        throw new Error(typeof fetchError === 'string' ? fetchError : 'Failed to fetch portfolio data');
      }

      if (portfolio) {
        // If portfolio exists, ensure defined values before setting state
        setPortfolioData(ensureDefinedPortfolioData(portfolio));
      } else {
        // If no portfolio exists, fetch initial data from profiles
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('resume_data, full_name, email')
          .eq('id', userId)
          .single();

        if (profileError || !profile?.resume_data) {
           // Handle cases where profile or resume_data is missing
           console.warn('Profile or resume_data missing, starting with empty form.', profileError);
           // Ensure empty form data also has defined values
           setPortfolioData(emptyPortfolioData); // emptyPortfolioData is already ensured
        } else {
            // Map initial data from profiles, ensuring defined values
            const initialDataFromProfile = {
                // Note: basic_info.name could potentially come from full_name or resume_data
                basic_info: {
                    name: profile.full_name || profile.resume_data.basic_info?.name || '',
                    email: profile.email || profile.resume_data.basic_info?.email || '',
                    phone: profile.resume_data.basic_info?.phone || '',
                    country: profile.resume_data.basic_info?.country || '',
                    current_designation: profile.resume_data.professional_info?.current_designation || '',
                },
                title: `${profile.full_name || 'My'} Portfolio`, // Default title
                description: profile.resume_data.professional_info?.description || '', // Use description from resume_data
                // Map other sections, ensuring default empty arrays/objects
                skills: profile.resume_data.professional_info?.skills || { technical_skills: [], soft_skills: [], languages: [] },
                education: profile.resume_data.professional_info?.education || [],
                experience: profile.resume_data.professional_info?.experience || [],
                projects: profile.resume_data.professional_info?.projects || [],
                certifications: profile.resume_data.professional_info?.certifications || [],
                // Set default values for other PortfolioData fields
                published: false,
                theme: 'dark',
                custom_domain: null,
            };
            // Ensure defined values before setting state from profile data
            setPortfolioData(ensureDefinedPortfolioData(initialDataFromProfile));
        }
      }

    } catch (err) {
      console.error('Error in fetchPortfolioData:', err);
      setError(err instanceof Error ? err.message : 'Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  }, [templateId, router, supabase]);

  useEffect(() => {
    fetchPortfolioData();
  }, [fetchPortfolioData]); // Depend on fetchPortfolioData

  // Handlers for updating nested state
   const handleBasicInfoChange = (field: keyof PortfolioData['basic_info'], value: string) => {
     setPortfolioData(prev => ({
       ...prev,
       basic_info: {
         ...prev.basic_info,
         [field]: value
       }
     }));
   };

   const handleSkillsChange = (skillType: keyof Skills, value: string) => {
     setPortfolioData(prev => ({
       ...prev,
       skills: {
         ...prev.skills,
         [skillType]: value.split(',').map(s => s.trim())
       }
     }));
   };

  const addItem = (section: 'education' | 'experience' | 'projects' | 'certifications' | 'testimonials') => {
    const newItem = {
      id: crypto.randomUUID(),
      ...(section === 'education' && { institution: '', degree: '', field_of_study: '', start_date: '', end_date: '', description: '' }),
      ...(section === 'experience' && { company: '', position: '', start_date: '', end_date: '', description: '' }),
      ...(section === 'projects' && { name: '', description: '', start_date: '', end_date: '', url: '' }),
      ...(section === 'certifications' && { name: '', issuer: '', date: '', url: '' }),
      ...(section === 'testimonials' && { name: '', photo: '', date: '', rating: 5, text: '' }),
    };
    setPortfolioData(prev => ({
      ...prev,
      [section]: [...(prev[section] as any), newItem]
    }));
  };

  const removeItem = (section: 'education' | 'experience' | 'projects' | 'certifications' | 'testimonials', id: string) => {
    setPortfolioData(prev => ({
      ...prev,
      [section]: (prev[section] as any).filter((item: any) => item.id !== id)
    }));
  };

  const updateItem = (
    section: 'education' | 'experience' | 'projects' | 'certifications' | 'testimonials',
    id: string,
    field: string,
    value: string | number
  ) => {
    setPortfolioData(prev => ({
      ...prev,
      [section]: (prev[section] as any).map((item: any) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };


  // Function to trigger preview update (will implement later)
  const updatePreview = useCallback(() => {
    console.log('Updating preview with data:', portfolioData);

    const selectedTemplate = templates.find(t => t.id === templateId);
    if (!selectedTemplate) {
      console.error('Template not found for preview:', templateId);
      setGeneratedHtml('<div style="color: red; padding: 20px;">Error: Selected template not found.</div>');
      return;
    }

    // Update the fetch call to include the required data
    fetch(`/api/generate-portfolio?template=${selectedTemplate.fileName}&preview=true`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        portfolioData: portfolioData,
        templateId: templateId
      })
    })
    .then(res => res.text())
    .then(html => setGeneratedHtml(html))
    .catch(err => {
      console.error('Failed to update preview:', err);
      setGeneratedHtml(`<div style="color: red; padding: 20px;">Error generating preview: ${err.message}</div>`);
    });

  }, [portfolioData, templateId]);

   // Update preview whenever portfolioData changes (after initial load)
   useEffect(() => {
     if (!loading) {
        // Debounce this in a real app for performance
       updatePreview();
     }
   }, [portfolioData, loading, updatePreview]);



  const handleGenerateSummary = async () => {
    setGeneratingSummary(true);
    try {
      // Log the data being sent for summary generation
      console.log('Sending data for summary generation:', {
        education: portfolioData.education,
        experience: portfolioData.experience,
        projects: portfolioData.projects,
        certifications: portfolioData.certifications,
      });

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/generate-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolio_data: {
            education: portfolioData.education,
            experience: portfolioData.experience,
            projects: portfolioData.projects,
            certifications: portfolioData.certifications,
          }
        }),
      });

      // Log the raw response
      console.log('Summary generation response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        ok: response.ok
      });

      if (!response.ok) {
        let errorMessage = 'Failed to generate summary';
        let errorDetails = {};

        try {
          // Try to get the error response as JSON
          const errorData = await response.json();
          console.error('Summary generation error response:', {
            errorData,
            type: typeof errorData,
            keys: Object.keys(errorData),
            status: response.status,
            statusText: response.statusText
          });
          errorDetails = errorData;
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          // If JSON parsing fails, try to get the text
          console.error('Failed to parse error response as JSON:', parseError);
          try {
            const errorText = await response.text();
            console.error('Raw error response text:', errorText);
            errorMessage = errorText || errorMessage;
          } catch (textError) {
            console.error('Failed to get error response text:', textError);
          }
        }

        // Log the final error details
        console.error('Summary generation failed:', {
          status: response.status,
          statusText: response.statusText,
          errorMessage,
          errorDetails
        });

        throw new Error(errorMessage);
      }

      let summary;
      try {
        const data = await response.json();
        console.log('Summary generation successful response:', {
          data,
          type: typeof data,
          keys: Object.keys(data)
        });
        summary = data.summary;
      } catch (parseError) {
        console.error('Failed to parse success response:', {
          error: parseError,
          type: typeof parseError,
          message: parseError instanceof Error ? parseError.message : 'Unknown error'
        });
        throw new Error('Failed to parse summary response');
      }

      if (!summary) {
        console.error('No summary in response data');
        throw new Error('No summary generated');
      }

      setPortfolioData(prev => ({ ...prev, description: summary }));
      toast.success('Summary generated successfully!');

    } catch (err: unknown) {
      const error = err as Error;
      console.error('Error in handleGenerateSummary:', {
        error,
        type: typeof error,
        message: error?.message,
        stack: error?.stack
      });
      toast.error(error?.message || 'Failed to generate summary');
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in to save your portfolio');
        router.push('/login');
        return;
      }

      const userId = session.user.id;

      // Log the current portfolio data for debugging
      console.log('Current portfolio data before saving:', portfolioData);

      // Prepare data for upserting into the portfolios table with default values
      const dataToSave = {
        ...portfolioData,
        user_id: userId,
        // Set default title and description if missing
        title: portfolioData.title || `${portfolioData.basic_info?.name || 'My'} Portfolio`,
        description: portfolioData.description || `Professional portfolio of ${portfolioData.basic_info?.name || 'a skilled professional'} showcasing expertise in ${portfolioData.skills?.technical_skills?.join(', ') || 'various fields'}.`,
        // Don't include the local `id` if it's from the initial empty state or profile data
        ...(portfolioData.id && { id: portfolioData.id }) // Only include ID if it exists (updating)
      };

      // Remove local-only IDs from nested items before saving
      const cleanDataToSave = {
        ...dataToSave,
        education: dataToSave.education.map(({ id, ...rest }) => rest),
        experience: dataToSave.experience.map(({ id, ...rest }) => rest),
        projects: dataToSave.projects.map(({ id, ...rest }) => rest),
        certifications: dataToSave.certifications.map(({ id, ...rest }) => rest),
        testimonials: dataToSave.testimonials.map(({ id, ...rest }) => rest),
      };

      // Log the cleaned data being saved
      console.log('Cleaned data to save:', cleanDataToSave);

      // Log the Supabase request
      console.log('Attempting to save to Supabase with data:', {
        table: 'portfolios',
        data: cleanDataToSave,
        userId: userId
      });

      try {
        // Try to save the portfolio with more detailed error handling
        const { data, error: saveError, status, statusText } = await supabase
          .from('portfolios')
          .upsert([cleanDataToSave], {
            onConflict: 'user_id',
            ignoreDuplicates: false
          })
          .select();

        // Log the complete response
        console.log('Complete Supabase response:', {
          data,
          error: saveError,
          status,
          statusText,
          hasError: !!saveError,
          errorType: saveError ? typeof saveError : 'none',
          errorKeys: saveError ? Object.keys(saveError) : []
        });

        if (saveError) {
          console.error('Supabase error details:', {
            error: saveError,
            fullResponse: { data, error: saveError, status, statusText },
            errorType: typeof saveError,
            errorKeys: Object.keys(saveError),
            code: saveError?.code,
            message: saveError?.message,
            details: saveError?.details,
            hint: saveError?.hint,
            status,
            statusText,
            data: cleanDataToSave
          });
          if (Object.keys(saveError).length === 0) {
            console.error('Supabase returned an empty error object. Check your table schema and network connection.');
          }
          if (saveError.code === '23505') {
            throw new Error('A portfolio already exists for this user. Please update your existing portfolio instead.');
          } else if (saveError.code === '23503') {
            throw new Error('Invalid user ID or template ID. Please try again.');
          } else if (saveError.code === '22P02') {
            throw new Error('Invalid data format. Please check your input and try again.');
          } else {
            throw new Error(saveError.message || 'Failed to save portfolio data. Please try again.');
          }
        }

        if (!data || data.length === 0) {
          console.error('No data returned from save operation');
          toast.error('Failed to save portfolio: No data returned');
          return;
        }

        // Log successful save
        console.log('Successfully saved portfolio data:', data);

        // Update local state with the new portfolio ID if it was an insert
        if (data && data.length > 0 && !portfolioData.id) {
          setPortfolioData(prev => ({ ...prev, id: data[0].id }));
          console.log('Updated local portfolio ID:', data[0].id);
        }

        toast.success('Portfolio saved successfully!');

      } catch (supabaseError: unknown) {
        // Handle any unexpected errors during the Supabase operation
        const error = supabaseError as Error;
        console.error('Unexpected error during Supabase operation:', {
          error,
          errorType: typeof error,
          errorKeys: error ? Object.keys(error) : [],
          message: error?.message,
          stack: error?.stack,
          name: error?.name,
          cause: error?.cause
        });
        toast.error('An unexpected error occurred while saving to the database');
      }

    } catch (err: unknown) {
      const error = err as Error;
      console.error('Unexpected error in handleSave:', {
        error,
        errorType: typeof error,
        errorKeys: error ? Object.keys(error) : [],
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
        cause: error?.cause
      });
      toast.error('An unexpected error occurred while saving the portfolio');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if (!templateId || typeof templateId !== 'string') {
      toast.error('Invalid template ID for download');
      return;
    }

    const selectedTemplate = templates.find(t => t.id === templateId);
    if (!selectedTemplate) {
      toast.error('Template not found for download');
      return;
    }

    try {
      // First save the portfolio data
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in to download your portfolio');
        router.push('/login');
        return;
      }

      const userId = session.user.id;

      // Check if portfolio data has been saved
      if (!portfolioData.id) {
        toast.error('Please save your portfolio data first before downloading');
        return;
      }

      // Check if required fields are filled
      if (!portfolioData.title || !portfolioData.description) {
        toast.error('Please fill in the title and description before downloading');
        return;
      }

      // Prepare data for saving with default values if missing
      const dataToSave = {
        ...portfolioData,
        user_id: userId,
        template_id: templateId,
        last_downloaded_at: new Date().toISOString(),
        download_count: (portfolioData.download_count || 0) + 1,
      };

      // Remove local-only IDs from nested items before saving
      const cleanDataToSave = {
        ...dataToSave,
        education: dataToSave.education.map(({ id, ...rest }) => rest),
        experience: dataToSave.experience.map(({ id, ...rest }) => rest),
        projects: dataToSave.projects.map(({ id, ...rest }) => rest),
        certifications: dataToSave.certifications.map(({ id, ...rest }) => rest),
        testimonials: dataToSave.testimonials.map(({ id, ...rest }) => rest),
      };

      // Log the data being saved for debugging
      console.log('[Download] Attempting to save portfolio data:', cleanDataToSave);

      // Save portfolio data first
      const { data: savedPortfolio, error: saveError } = await supabase
        .from('portfolios')
        .upsert([cleanDataToSave], { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (saveError) {
        console.error('[Download] Error saving portfolio:', saveError);
        if (saveError.code === '23505') {
          throw new Error('A portfolio already exists for this user. Please update your existing portfolio instead.');
        } else if (saveError.code === '23503') {
          throw new Error('Invalid user ID or template ID. Please try again.');
        } else if (saveError.code === '22P02') {
          throw new Error('Invalid data format. Please check your input and try again.');
        } else {
          throw new Error(saveError.message || 'Failed to save portfolio data. Please try again.');
        }
      }

      if (!savedPortfolio) {
        throw new Error('[Download] Failed to save portfolio data. No data was returned from the server.');
      }

      // Call the backend API to get the zip file for download
      console.log('[Download] Sending POST to /api/generate-portfolio with template:', selectedTemplate.fileName);
      const response = await fetch(`/api/generate-portfolio`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          portfolioData: savedPortfolio,
          templateId: selectedTemplate.fileName.replace('.html', '')
        })
      });
      console.log('[Download] Response status:', response.status, response.statusText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: 'Unknown error, could not parse response as JSON.' };
        }
        console.error('[Download] Error response from API:', errorData);
        throw new Error(errorData.error || 'Failed to generate portfolio for download');
      }

      const blob = await response.blob();
      console.log('[Download] Received blob:', blob);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio-${templateId}-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      console.log('[Download] Download triggered.');

      // Update download count in the database
      const { error: downloadCountError } = await supabase
        .from('portfolio_downloads')
        .insert([{
          portfolio_id: savedPortfolio.id,
          user_id: userId,
          template_id: templateId,
          downloaded_at: new Date().toISOString()
        }]);

      if (downloadCountError) {
        console.warn('[Download] Failed to update download count:', downloadCountError);
      }

      toast.success('Portfolio downloaded successfully!');
    } catch (err) {
      console.error('[Download] Error downloading portfolio:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to download portfolio');
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
         <MotionCard
            className="w-full max-w-md border-none bg-[#18181b]/90 rounded-2xl shadow-2xl backdrop-blur-md text-center p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
           <CardContent className="space-y-4">
              <h2 className="text-xl font-semibold text-red-500">Error loading portfolio</h2>
              <p className="text-gray-400">{error}</p>
              <Button onClick={() => router.push('/dashboard/portfolio')}>Back to Templates</Button>
           </CardContent>
         </MotionCard>
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col lg:flex-row">
       {/* Sidebar (Editor) */}
       <aside 
         className={cn(
           "transition-all duration-300 lg:w-1/3 w-full p-6 bg-black border-r border-white/10 overflow-y-auto pt-24",
           editorOpen ? "max-w-lg" : "max-w-[60px] min-w-[60px] p-2 pt-24"
         )}
       >
         <div
           className="flex items-center justify-between cursor-pointer mb-6"
           onClick={() => setEditorOpen((open) => !open)}
           title={editorOpen ? 'Collapse Editor' : 'Expand Editor'}
         >
           <h2 className="text-2xl font-bold">{editorOpen ? 'Portfolio Editor' : ''}</h2>
           <button
             className="rounded-full bg-white/10 p-2 hover:bg-white/20 transition"
             aria-label={editorOpen ? 'Collapse Editor' : 'Expand Editor'}
           >
             <svg 
               width="24" 
               height="24" 
               fill="none" 
               className={cn(
                 "transition-transform duration-300",
                 editorOpen ? "rotate-180" : ""
               )}
             >
               <path d="M9 5l7 7-7 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
           </button>
         </div>

         {editorOpen && (
           <div className="space-y-6">
             {/* Basic Info */}
             <section className="space-y-4">
                 <h3 className="text-xl font-semibold text-white">Basic Information</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                    <Input
                      type="text"
                      value={portfolioData.basic_info?.name || ''}
                      onChange={(e) => handleBasicInfoChange('name', e.target.value)}
                      className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-300 mb-1">Headline</label>
                     <Input
                       type="text"
                       value={portfolioData.basic_info?.current_designation || ''}
                       onChange={(e) => handleBasicInfoChange('current_designation', e.target.value)}
                       className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400"
                       placeholder="e.g., Software Engineer"
                     />
                   </div>
                    <div>
                     <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                     <Input
                       type="email"
                       value={portfolioData.basic_info?.email || ''}
                       onChange={(e) => handleBasicInfoChange('email', e.target.value)}
                       className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400"
                       placeholder="your.email@example.com"
                     />
                   </div>
                    <div>
                     <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                     <Input
                       type="tel"
                       value={portfolioData.basic_info?.phone || ''}
                       onChange={(e) => handleBasicInfoChange('phone', e.target.value)}
                       className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400"
                       placeholder="+1 (555) 000-0000"
                     />
                   </div>
                    <div>
                     <label className="block text-sm font-medium text-gray-300 mb-1">Country</label>
                     <Input
                       type="text"
                       value={portfolioData.basic_info?.country || ''}
                       onChange={(e) => handleBasicInfoChange('country', e.target.value)}
                       className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400"
                       placeholder="Your country"
                     />
                   </div>
             </section>

              {/* Overall Portfolio Description/About - different from basic info description */}
             <section className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">Summary</h3>
                   <div className="flex items-center gap-2">
                     <label htmlFor="portfolio-description" className="block text-sm font-medium text-gray-300">Portfolio Description</label>
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={handleGenerateSummary}
                       disabled={saving || generatingSummary}
                       className="bg-white/10 text-white border border-white/20 hover:bg-white/20 flex items-center gap-1"
                     >
                       {generatingSummary ? (
                          <Loader2 className="h-4 w-6 animate-spin" />
                       ) : (
                         <>
                            <Sparkles className="h-4 w-4" />
                            Generate with AI
                         </>
                       )}
                     </Button>
                   </div>
                     <Textarea
                       id="portfolio-description"
                       value={portfolioData.description || ''}
                       onChange={(e) => setPortfolioData(prev => ({ ...prev, description: e.target.value }))}
                       className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400"
                       placeholder="A brief overview for your portfolio homepage."
                       rows={4}
                     />
              </section>

             {/* Skills */}
             <section className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">Skills</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Technical Skills (comma-separated)</label>
                    <Input
                      type="text"
                      value={portfolioData.skills?.technical_skills?.join(', ') || ''}
                      onChange={(e) => handleSkillsChange('technical_skills', e.target.value)}
                      className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400"
                      placeholder="e.g., JavaScript, Python, React"
                    />
                  </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-300 mb-1">Soft Skills (comma-separated)</label>
                     <Input
                       type="text"
                       value={portfolioData.skills?.soft_skills?.join(', ') || ''}
                       onChange={(e) => handleSkillsChange('soft_skills', e.target.value)}
                       className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400"
                       placeholder="e.g., Communication, Leadership"
                     />
                   </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Languages (comma-separated)</label>
                      <Input
                        type="text"
                        value={portfolioData.skills?.languages?.join(', ') || ''}
                        onChange={(e) => handleSkillsChange('languages', e.target.value)}
                        className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400"
                        placeholder="e.g., English, Spanish"
                      />
                    </div>
             </section>

             {/* Education */}
             <section className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-white">Education</h3>
                   <Button variant="outline" className="flex items-center gap-1 bg-white/10 text-white border border-white/20 hover:bg-white/20" onClick={() => addItem('education')}>
                     <Plus className="h-4 w-4" /> Add
                   </Button>
                </div>
                 {portfolioData.education.map((edu, index) => (
                   <Card key={edu.id || index} className="bg-[#23232a] border border-white/10 p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Institution</label>
                            <Input type="text" value={edu.institution || ''} onChange={(e) => updateItem('education', edu.id!, 'institution', e.target.value)} className="bg-[#18181b] border border-white/10 text-white" placeholder="Institution" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Degree</label>
                            <Input type="text" value={edu.degree || ''} onChange={(e) => updateItem('education', edu.id!, 'degree', e.target.value)} className="bg-[#18181b] border border-white/10 text-white" placeholder="Degree" />
                          </div>
                          <div>
                             <label className="block text-sm font-medium text-gray-300 mb-1">Field of Study</label>
                              <Input type="text" value={edu?.field_of_study || ''} onChange={(e) => updateItem('education', edu.id!, 'field_of_study', e.target.value)} className="bg-[#18181b] border border-white/10 text-white" placeholder="Field of Study" />
                          </div>
                           <div className="grid grid-cols-2 gap-2">
                             <div>
                               <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                                <Input type="date" value={edu.start_date || ''} onChange={(e) => updateItem('education', edu.id!, 'start_date', e.target.value)} className="bg-[#18181b] border border-white/10 text-white" />
                             </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                                <Input type="date" value={edu?.end_date || ''} onChange={(e) => updateItem('education', edu.id!, 'end_date', e.target.value)} className="bg-[#18181b] border border-white/10 text-white" />
                              </div>
                           </div>
                        </div>
                         <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => removeItem('education', edu.id!)}>
                           <Trash2 className="h-4 w-4" />
                         </Button>
                      </div>
                       <div>
                         <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                          <Textarea value={edu?.description || ''} onChange={(e) => updateItem('education', edu.id!, 'description', e.target.value)} className="bg-[#18181b] border border-white/10 text-white" placeholder="Description" rows={3} />
                       </div>
                   </Card>
                 ))}
             </section>

            {/* Experience */}
             <section className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-white">Experience</h3>
                   <Button variant="outline" className="flex items-center gap-1 bg-white/10 text-white border border-white/20 hover:bg-white/20" onClick={() => addItem('experience')}>
                     <Plus className="h-4 w-4" /> Add
                   </Button>
                </div>
                 {portfolioData.experience.map((exp, index) => (
                   <Card key={exp.id || index} className="bg-[#23232a] border border-white/10 p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Company</label>
                            <Input type="text" value={exp?.company || ''} onChange={(e) => updateItem('experience', exp.id!, 'company', e.target.value)} className="bg-[#18181b] border border-white/10 text-white" placeholder="Company" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Position</label>
                            <Input type="text" value={exp?.position || ''} onChange={(e) => updateItem('experience', exp.id!, 'position', e.target.value)} className="bg-[#18181b] border border-white/10 text-white" placeholder="Position" />
                          </div>
                           <div className="grid grid-cols-2 gap-2">
                             <div>
                               <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                                <Input type="date" value={exp?.start_date || ''} onChange={(e) => updateItem('experience', exp.id!, 'start_date', e.target.value)} className="bg-[#18181b] border border-white/10 text-white" />
                             </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                                <Input type="date" value={exp?.end_date || ''} onChange={(e) => updateItem('experience', exp.id!, 'end_date', e.target.value)} className="bg-[#18181b] border border-white/10 text-white" />
                              </div>
                           </div>
                        </div>
                         <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => removeItem('experience', exp.id!)}>
                           <Trash2 className="h-4 w-4" />
                         </Button>
                      </div>
                       <div>
                         <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                          <Textarea value={exp?.description || ''} onChange={(e) => updateItem('experience', exp.id!, 'description', e.target.value)} className="bg-[#18181b] border border-white/10 text-white" placeholder="Description" rows={3} />
                       </div>
                   </Card>
                 ))}
             </section>

            {/* Projects */}
             <section className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-white">Projects</h3>
                   <Button variant="outline" className="flex items-center gap-1 bg-white/10 text-white border border-white/20 hover:bg-white/20" onClick={() => addItem('projects')}>
                     <Plus className="h-4 w-4" /> Add
                   </Button>
                </div>
                 {portfolioData.projects.map((project, index) => (
                   <Card key={project.id || index} className="bg-[#23232a] border border-white/10 p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                            <Input type="text" value={project?.name || ''} onChange={(e) => updateItem('projects', project.id!, 'name', e.target.value)} className="bg-[#18181b] border border-white/10 text-white" placeholder="Project Name" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">URL</label>
                            <Input type="text" value={project?.url || ''} onChange={(e) => updateItem('projects', project.id!, 'url', e.target.value)} className="bg-[#18181b] border border-white/10 text-white" placeholder="URL" />
                          </div>
                           <div className="grid grid-cols-2 gap-2">
                             <div>
                               <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                                <Input type="date" value={project?.start_date || ''} onChange={(e) => updateItem('projects', project.id!, 'start_date', e.target.value)} className="bg-[#18181b] border border-white/10 text-white" />
                             </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                                <Input type="date" value={project?.end_date || ''} onChange={(e) => updateItem('projects', project.id!, 'end_date', e.target.value)} className="bg-[#18181b] border border-white/10 text-white" />
                              </div>
                           </div>
                        </div>
                         <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => removeItem('projects', project.id!)}>
                           <Trash2 className="h-4 w-4" />
                         </Button>
                      </div>
                       <div>
                         <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                          <Textarea value={project?.description || ''} onChange={(e) => updateItem('projects', project.id!, 'description', e.target.value)} className="bg-[#18181b] border border-white/10 text-white" placeholder="Description" rows={3} />
                       </div>
                   </Card>
                 ))}
             </section>

            {/* Certifications */}
             <section className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-white">Certifications</h3>
                   <Button variant="outline" className="flex items-center gap-1 bg-white/10 text-white border border-white/20 hover:bg-white/20" onClick={() => addItem('certifications')}>
                     <Plus className="h-4 w-4" /> Add
                   </Button>
                </div>
                 {portfolioData.certifications.map((cert, index) => (
                   <Card key={cert.id || index} className="bg-[#23232a] border border-white/10 p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                            <Input type="text" value={cert?.name || ''} onChange={(e) => updateItem('certifications', cert.id!, 'name', e.target.value)} className="bg-[#18181b] border border-white/10 text-white" placeholder="Certification Name" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Issuer</label>
                            <Input type="text" value={cert?.issuer || ''} onChange={(e) => updateItem('certifications', cert.id!, 'issuer', e.target.value)} className="bg-[#18181b] border border-white/10 text-white" placeholder="Issuer" />
                          </div>
                          <div>
                             <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                              <Input type="date" value={cert?.date || ''} onChange={(e) => updateItem('certifications', cert.id!, 'date', e.target.value)} className="bg-[#18181b] border border-white/10 text-white" />
                          </div>
                           <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">URL</label>
                             <Input type="text" value={cert?.url || ''} onChange={(e) => updateItem('certifications', cert.id!, 'url', e.target.value)} className="bg-[#18181b] border border-white/10 text-white" placeholder="URL" />
                           </div>
                        </div>
                         <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => removeItem('certifications', cert.id!)}>
                           <Trash2 className="h-4 w-4" />
                         </Button>
                      </div>
                   </Card>
                 ))}
             </section>

            {/* Testimonials */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white" >Client Testimonials</h3>
                <Button variant="outline" className="flex items-center gap-1 bg-white/10 text-white border border-white/20 hover:bg-white/20" onClick={() => addItem('testimonials')}>
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
              {portfolioData.testimonials.map((t, idx) => (
                <Card key={t.id || idx} className="bg-[#23232a] border border-white/10 p-4 space-y-4">
                  <div className="flex gap-4 items-center">
                    <Input
                      type="text"
                      value={t.name || ''}
                      onChange={e => updateItem('testimonials', t.id!, 'name', e.target.value)}
                      placeholder="Client Name"
                    />
                    <Input
                      type="text"
                      value={t.photo || ''}
                      onChange={e => updateItem('testimonials', t.id!, 'photo', e.target.value)}
                      placeholder="Photo URL"
                    />
                    <Input
                      type="date"
                      value={t.date || ''}
                      onChange={e => updateItem('testimonials', t.id!, 'date', e.target.value)}
                    />
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={t.rating || 5}
                      onChange={e => updateItem('testimonials', t.id!, 'rating', Number(e.target.value))}
                      placeholder="Rating"
                    />
                  </div>
                  <Textarea
                    value={t.text || ''}
                    onChange={e => updateItem('testimonials', t.id!, 'text', e.target.value)}
                    placeholder="Testimonial text"
                    rows={3}
                  />
                  <Button variant="ghost" onClick={() => removeItem('testimonials', t.id!)} className="text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
            </section>

             {/* Social Links */}
             <section className="space-y-4">
               <h3 className="text-xl font-semibold text-white">Social Links</h3>
               <div>
                 <label className="block text-sm font-medium text-gray-300 mb-1">LinkedIn URL</label>
                 <Input
                   type="url"
                   value={portfolioData.linkedin_url || ''}
                   onChange={e => setPortfolioData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                   placeholder="https://linkedin.com/in/yourprofile"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-300 mb-1">GitHub URL</label>
                 <Input
                   type="url"
                   value={portfolioData.github_url || ''}
                   onChange={e => setPortfolioData(prev => ({ ...prev, github_url: e.target.value }))}
                   placeholder="https://github.com/yourusername"
                 />
               </div>
             </section>

             {/* Save Button */}
             <div className="mt-8">
                 <Button
                    className="w-full bg-green-600 text-white hover:bg-green-700 font-semibold py-3 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    onClick={handleSave}
                    disabled={saving}
                 >
                   {saving ? (
                      <>
                         <Loader2 className="h-5 w-5 animate-spin" /> Saving...
                      </>
                   ) : (
                      'Save Portfolio Data'
                   )}
                 </Button>
             </div>
           </div>
         )}
       </aside>

       {/* Main Content (Preview) */}
       <main 
         className={cn(
           "transition-all duration-300 p-8 pt-24",
           editorOpen ? "flex-1" : "w-full max-w-[1400px] mx-auto"
         )}
       >
         {/* Sticky Preview Header */}
         <div className="sticky top-16 z-10 bg-gray-900 rounded-t-2xl shadow-lg mb-4 p-4 flex justify-between items-center">
           <Button
             variant="ghost"
             size="sm"
             onClick={() => router.push('/dashboard/portfolio')}
             className="flex items-center gap-2 text-gray-400 hover:text-black"
           >
             <ArrowLeft className="w-5 h-5" />
             Back
           </Button>
           <div className="flex gap-2">
             <Button
               onClick={handleSave}
               disabled={saving}
               className="bg-gray-800 hover:bg-gray-700 text-white"
             >
               <Save className="w-4 h-4 mr-2" />
               {saving ? 'Saving...' : 'Save'}
             </Button>
             <Button
               onClick={handleDownload}
               className="bg-gray-800 hover:bg-gray-700 text-white"
             >
               <Download className="w-4 h-4 mr-2" />
               Download
             </Button>
           </div>
         </div>
         <div className="flex justify-center">
           <div className="bg-white rounded-lg overflow-hidden shadow-xl mb-8 w-full max-w-3xl" style={{ height: '600px' }}>
              {/* Use an iframe to display the generated HTML safely */}
              {generatedHtml && (
                <iframe
                  srcDoc={generatedHtml}
                  title="Portfolio Preview"
                  className="w-full h-full border-none"
                  sandbox="allow-scripts"
                ></iframe>
              )}
           </div>
         </div>
       </main>
    </div>
  );
} 
