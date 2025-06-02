'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, ArrowRight, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

const MotionCard = motion(Card);

interface ResumeData {
  basic_info: {
    name: string | null;
    email: string | null;
    phone: string | null;
    country: string | null;
    education: Array<{
      degree: string | null;
      institution: string | null;
      field_of_study: string | null;
      start_year: string | null;
      end_year: string | null;
    }>;
  };
  professional_info: {
    current_designation: string | null;
    skills: {
      technical_skills: string[];
      soft_skills: string[];
      languages: string[];
    };
    experience: Array<{
      company: string | null;
      designation: string | null;
      start_date: string | null;
      end_date: string | null;
      description: string | null;
    }>;
    certifications: Array<{
      name: string | null;
      issuer: string | null;
      year: string | null;
    }>;
    projects: Array<{
      title: string | null;
      description: string | null;
      technologies: string[];
    }>;
    linkedin_url: string | null;
    portfolio_url: string | null;
    resume_url: string | null;
  };
}

export default function ReviewPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchDraftData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        const { data, error } = await supabase
          .from('onboarding_drafts')
          .select('parsed_data')
          .eq('id', session.user.id)
          .single();

        console.log('Fetched onboarding_drafts data:', data);
        if (error) throw error;
        if (!data) {
          router.push('/onboarding');
          return;
        }

        console.log('Set resumeData:', data.parsed_data.structured);
        setResumeData(data.parsed_data.structured);
      } catch (error) {
        console.error('Error fetching draft data:', error);
        toast.error('Failed to load resume data');
        router.push('/onboarding');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDraftData();
  }, [router, supabase]);

  const handleInputChange = (
    path: string,
    field: string,
    value: string | string[],
    index?: number
  ) => {
    if (!resumeData) return;

    setResumeData(prev => {
      if (!prev) return prev;

      const newData = { ...prev };
      const pathParts = path.split('.');
      let current: any = newData;

      // Navigate to the nested object
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]];
      }

      const lastPart = pathParts[pathParts.length - 1];

      if (index !== undefined) {
        // Handle array updates
        current[lastPart][index] = {
          ...current[lastPart][index],
          [field]: value
        };
      } else {
        // Handle direct field updates
        current[lastPart] = {
          ...current[lastPart],
          [field]: value
        };
      }

      return newData;
    });
  };

  const addNewItem = (section: string, type: string) => {
    if (!resumeData) return;

    setResumeData(prev => {
      if (!prev) return prev;

      const newData = { ...prev };
      const pathParts = section.split('.');
      let current: any = newData;

      // Navigate to the nested object
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]];
      }

      const lastPart = pathParts[pathParts.length - 1];
      const newItem = getEmptyItem(type);
      current[lastPart].push(newItem);

      return newData;
    });
  };

  const removeItem = (section: string, index: number) => {
    if (!resumeData) return;

    setResumeData(prev => {
      if (!prev) return prev;

      const newData = { ...prev };
      const pathParts = section.split('.');
      let current: any = newData;

      // Navigate to the nested object
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]];
      }

      const lastPart = pathParts[pathParts.length - 1];
      current[lastPart].splice(index, 1);

      return newData;
    });
  };

  const getEmptyItem = (type: string) => {
    switch (type) {
      case 'education':
        return {
          degree: '',
          institution: '',
          field_of_study: '',
          start_year: '',
          end_year: ''
        };
      case 'experience':
        return {
          company: '',
          designation: '',
          start_date: '',
          end_date: '',
          description: ''
        };
      case 'project':
        return {
          title: '',
          description: '',
          technologies: []
        };
      case 'certification':
        return {
          name: '',
          issuer: '',
          year: ''
        };
      default:
        return {};
    }
  };

  const handleConfirm = async () => {
    if (!resumeData) return;

    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No session found');
      }

      const userId = session.user.id;
      console.log('Starting profile update process for user:', userId);

      // First save to onboarding_drafts
      const { error: draftError } = await supabase
        .from('onboarding_drafts')
        .upsert({
          id: userId,
          parsed_data: resumeData,
          created_at: new Date().toISOString()
        });

      if (draftError) {
        console.error('Error saving to onboarding_drafts:', draftError);
        throw new Error('Failed to save draft data');
      }

      // Prepare the profile data according to the actual schema
      const profileData = {
        id: userId,
        resume_data: resumeData,
        hasOnboarded: true,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
        // full_name: resumeData.basic_info.name || '',
        // email: resumeData.basic_info.email || '',
        linkedin_url: resumeData.professional_info.linkedin_url || '',
        resume_url: resumeData.professional_info.resume_url || '',
        onboarding_method: 'cv_upload'
      };

      console.log('Attempting database operation with data:', profileData);

      // First try to update
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId);

      if (updateError) {
        console.log('Update failed, attempting insert...', updateError);

        // If update fails, try insert
        const { data: insertData, error: insertError } = await supabase
          .from('profiles')
          .insert([profileData]);

        if (insertError) {
          console.error('Both update and insert failed:', {
            updateError,
            insertError,
            profileData
          });
          throw new Error(`Failed to save profile: ${insertError.message}`);
        }

        console.log('Insert successful:', insertData);
      } else {
        console.log('Update successful:', updateData);
      }

      toast.success('Profile updated successfully!');
      
      // Add a small delay to ensure the toast is visible
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use window.location for more reliable navigation
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error in handleConfirm:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      toast.error(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#18181b] via-[#101014] to-[#23232a]">
        <Loader2 className="h-8 w-8 text-white animate-spin" />
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#18181b] via-[#101014] to-[#23232a]">
        <div className="text-white text-center">
          <h2 className="text-xl font-semibold mb-2">No Resume Data Found</h2>
          <p className="text-gray-400 mb-4">Please complete the onboarding process first.</p>
          <Button
            variant="outline"
            className="flex items-center gap-2 bg-white/10 text-white border border-white/20 hover:bg-white/20 font-medium py-2 rounded-lg transition"
            onClick={() => router.push('/onboarding')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Onboarding
          </Button>
        </div>
      </div>
    );
  }

  console.log('Rendering ReviewPage with resumeData:', resumeData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18181b] via-[#101014] to-[#23232a] p-4">
      <div className="max-w-4xl mx-auto">
        <MotionCard
          className="w-full border-none bg-[#18181b]/90 rounded-2xl shadow-2xl backdrop-blur-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <CardContent className="p-8 space-y-7 text-white">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-white/10 text-white border border-white/20 hover:bg-white/20 font-medium py-2 rounded-lg transition"
                onClick={() => router.push('/onboarding')}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Upload
              </Button>
              <div className="flex items-center gap-2">
                <Image src="/logo.svg" alt="Brand Logo" width={32} height={32} />
                <h1 className="text-2xl font-semibold">Review Your Information</h1>
              </div>
            </div>

            {resumeData && (
              <div className="space-y-8">
                {/* Basic Information */}
                <section className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-white">Basic Information</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                      <Input
                        type="text"
                        value={resumeData.basic_info.name || ''}
                        onChange={(e) => handleInputChange('basic_info', 'name', e.target.value)}
                        className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                      <Input
                        type="email"
                        value={resumeData.basic_info.email || ''}
                        onChange={(e) => handleInputChange('basic_info', 'email', e.target.value)}
                        className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                      <Input
                        type="tel"
                        value={resumeData.basic_info.phone || ''}
                        onChange={(e) => handleInputChange('basic_info', 'phone', e.target.value)}
                        className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Country</label>
                      <Input
                        type="text"
                        value={resumeData.basic_info.country || ''}
                        onChange={(e) => handleInputChange('basic_info', 'country', e.target.value)}
                        className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </section>

                {/* Education */}
                <section className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-white">Education</h2>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 bg-white/10 text-white border border-white/20 hover:bg-white/20 font-medium py-2 rounded-lg transition"
                      onClick={() => addNewItem('basic_info.education', 'education')}
                    >
                      <Plus className="h-4 w-4" />
                      Add Education
                    </Button>
                  </div>
                  {resumeData.basic_info.education.map((edu, index) => (
                    <div key={index} className="bg-[#23232a] rounded-lg p-4 space-y-4 relative group">
                      <Button
                        variant="ghost"
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeItem('basic_info.education', index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Institution</label>
                          <Input
                            type="text"
                            value={edu.institution || ''}
                            onChange={(e) => handleInputChange('basic_info.education', 'institution', e.target.value, index)}
                            className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Degree</label>
                          <Input
                            type="text"
                            value={edu.degree || ''}
                            onChange={(e) => handleInputChange('basic_info.education', 'degree', e.target.value, index)}
                            className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Field of Study</label>
                          <Input
                            type="text"
                            value={edu.field_of_study || ''}
                            onChange={(e) => handleInputChange('basic_info.education', 'field_of_study', e.target.value, index)}
                            className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Start Year</label>
                            <Input
                              type="text"
                              value={edu.start_year || ''}
                              onChange={(e) => handleInputChange('basic_info.education', 'start_year', e.target.value, index)}
                              className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">End Year</label>
                            <Input
                              type="text"
                              value={edu.end_year || ''}
                              onChange={(e) => handleInputChange('basic_info.education', 'end_year', e.target.value, index)}
                              className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </section>

                {/* Experience */}
                <section className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-white">Experience</h2>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 bg-white/10 text-white border border-white/20 hover:bg-white/20 font-medium py-2 rounded-lg transition"
                      onClick={() => addNewItem('professional_info.experience', 'experience')}
                    >
                      <Plus className="h-4 w-4" />
                      Add Experience
                    </Button>
                  </div>
                  {resumeData.professional_info.experience.map((exp, index) => (
                    <div key={index} className="bg-[#23232a] rounded-lg p-4 space-y-4 relative group">
                      <Button
                        variant="ghost"
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeItem('professional_info.experience', index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Company</label>
                          <Input
                            type="text"
                            value={exp.company || ''}
                            onChange={(e) => handleInputChange('professional_info.experience', 'company', e.target.value, index)}
                            className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Designation</label>
                          <Input
                            type="text"
                            value={exp.designation || ''}
                            onChange={(e) => handleInputChange('professional_info.experience', 'designation', e.target.value, index)}
                            className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                            <Input
                              type="text"
                              value={exp.start_date || ''}
                              onChange={(e) => handleInputChange('professional_info.experience', 'start_date', e.target.value, index)}
                              className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                            <Input
                              type="text"
                              value={exp.end_date || ''}
                              onChange={(e) => handleInputChange('professional_info.experience', 'end_date', e.target.value, index)}
                              className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                          <textarea
                            value={exp.description || ''}
                            onChange={(e) => handleInputChange('professional_info.experience', 'description', e.target.value, index)}
                            className="w-full bg-[#23232a] border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 rounded-lg px-4 py-2 h-24"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </section>

                {/* Skills */}
                <section className="space-y-4">
                  <h2 className="text-xl font-semibold text-white">Skills</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Technical Skills</label>
                      <Input
                        type="text"
                        value={resumeData.professional_info.skills.technical_skills.join(', ')}
                        onChange={(e) => handleInputChange('professional_info.skills', 'technical_skills', e.target.value.split(',').map(s => s.trim()))}
                        className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Soft Skills</label>
                      <Input
                        type="text"
                        value={resumeData.professional_info.skills.soft_skills.join(', ')}
                        onChange={(e) => handleInputChange('professional_info.skills', 'soft_skills', e.target.value.split(',').map(s => s.trim()))}
                        className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Languages</label>
                      <Input
                        type="text"
                        value={resumeData.professional_info.skills.languages.join(', ')}
                        onChange={(e) => handleInputChange('professional_info.skills', 'languages', e.target.value.split(',').map(s => s.trim()))}
                        className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </section>

                {/* Projects */}
                <section className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-white">Projects</h2>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 bg-white/10 text-white border border-white/20 hover:bg-white/20 font-medium py-2 rounded-lg transition"
                      onClick={() => addNewItem('professional_info.projects', 'project')}
                    >
                      <Plus className="h-4 w-4" />
                      Add Project
                    </Button>
                  </div>
                  {resumeData.professional_info.projects.map((project, index) => (
                    <div key={index} className="bg-[#23232a] rounded-lg p-4 space-y-4 relative group">
                      <Button
                        variant="ghost"
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeItem('professional_info.projects', index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                          <Input
                            type="text"
                            value={project.title || ''}
                            onChange={(e) => handleInputChange('professional_info.projects', 'title', e.target.value, index)}
                            className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Technologies</label>
                          <Input
                            type="text"
                            value={project.technologies.join(', ')}
                            onChange={(e) => handleInputChange('professional_info.projects', 'technologies', e.target.value.split(',').map(s => s.trim()), index)}
                            className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                          <textarea
                            value={project.description || ''}
                            onChange={(e) => handleInputChange('professional_info.projects', 'description', e.target.value, index)}
                            className="w-full bg-[#23232a] border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 rounded-lg px-4 py-2 h-24"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </section>

                {/* Certifications */}
                <section className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-white">Certifications</h2>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 bg-white/10 text-white border border-white/20 hover:bg-white/20 font-medium py-2 rounded-lg transition"
                      onClick={() => addNewItem('professional_info.certifications', 'certification')}
                    >
                      <Plus className="h-4 w-4" />
                      Add Certification
                    </Button>
                  </div>
                  {resumeData.professional_info.certifications.map((cert, index) => (
                    <div key={index} className="bg-[#23232a] rounded-lg p-4 space-y-4 relative group">
                      <Button
                        variant="ghost"
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeItem('professional_info.certifications', index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                          <Input
                            type="text"
                            value={cert.name || ''}
                            onChange={(e) => handleInputChange('professional_info.certifications', 'name', e.target.value, index)}
                            className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Issuer</label>
                          <Input
                            type="text"
                            value={cert.issuer || ''}
                            onChange={(e) => handleInputChange('professional_info.certifications', 'issuer', e.target.value, index)}
                            className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Year</label>
                          <Input
                            type="text"
                            value={cert.year || ''}
                            onChange={(e) => handleInputChange('professional_info.certifications', 'year', e.target.value, index)}
                            className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </section>

                <div className="flex justify-end pt-4">
                  <Button
                    className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleConfirm}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Confirm and Continue
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </MotionCard>
      </div>
    </div>
  );
} 
