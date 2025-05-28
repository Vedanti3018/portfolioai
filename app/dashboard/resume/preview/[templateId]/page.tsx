'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Download, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    experience: true,
    education: true,
    skills: true
  });

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

  const handlePersonalInfoChange = (field: keyof ResumeData['content']['personal'], value: string) => {
    setResumeData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        personal: {
          ...prev.content.personal,
          [field]: value
        }
      }
    }));
  };

  const handleExperienceChange = (index: number, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        experience: prev.content.experience.map((exp, i) => 
          i === index ? { ...exp, [field]: value } : exp
        )
      }
    }));
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        experience: [
          ...prev.content.experience,
          {
            company: '',
            position: '',
            startDate: '',
            endDate: '',
            description: ''
          }
        ]
      }
    }));
  };

  const removeExperience = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        experience: prev.content.experience.filter((_, i) => i !== index)
      }
    }));
  };

  const handleEducationChange = (index: number, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        education: prev.content.education.map((edu, i) => 
          i === index ? { ...edu, [field]: value } : edu
        )
      }
    }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        education: [
          ...prev.content.education,
          {
            school: '',
            degree: '',
            field: '',
            startDate: '',
            endDate: ''
          }
        ]
      }
    }));
  };

  const removeEducation = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        education: prev.content.education.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSkillsChange = (skills: string) => {
    setResumeData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        skills: skills.split(',').map(skill => skill.trim()).filter(Boolean)
      }
    }));
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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
            
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <button
                  onClick={() => toggleSection('personal')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h3 className="text-lg font-medium text-white">Personal Information</h3>
                  {expandedSections.personal ? (
                    <ChevronUp className="h-5 w-5 text-white/60" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-white/60" />
                  )}
                </button>
                {expandedSections.personal && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white">Full Name</Label>
                      <Input
                        id="name"
                        value={resumeData.content.personal.name}
                        onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-white">Professional Title</Label>
                      <Input
                        id="title"
                        value={resumeData.content.personal.title}
                        onChange={(e) => handlePersonalInfoChange('title', e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={resumeData.content.personal.email}
                        onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-white">Phone</Label>
                      <Input
                        id="phone"
                        value={resumeData.content.personal.phone}
                        onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-white">Location</Label>
                      <Input
                        id="location"
                        value={resumeData.content.personal.location}
                        onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                      />
                    </div>
                  </div>
                )}
                {expandedSections.personal && (
                  <div className="space-y-2">
                    <Label htmlFor="summary" className="text-white">Professional Summary</Label>
                    <Textarea
                      id="summary"
                      value={resumeData.content.personal.summary}
                      onChange={(e) => handlePersonalInfoChange('summary', e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[100px]"
                    />
                  </div>
                )}
              </div>

              {/* Experience */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => toggleSection('experience')}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <h3 className="text-lg font-medium text-white">Experience</h3>
                    {expandedSections.experience ? (
                      <ChevronUp className="h-5 w-5 text-white/60" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-white/60" />
                    )}
                  </button>
                  {expandedSections.experience && (
                    <Button
                      onClick={addExperience}
                      variant="ghost"
                      className="text-white hover:text-white/80"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Experience
                    </Button>
                  )}
                </div>
                {expandedSections.experience && resumeData.content.experience.map((exp, index) => (
                  <div key={index} className="space-y-4 p-4 border border-white/10 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="grid grid-cols-2 gap-4 flex-1">
                        <div className="space-y-2">
                          <Label className="text-white">Position</Label>
                          <Input
                            value={exp.position}
                            onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Company</Label>
                          <Input
                            value={exp.company}
                            onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Start Date</Label>
                          <Input
                            value={exp.startDate}
                            onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">End Date</Label>
                          <Input
                            value={exp.endDate}
                            onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={() => removeExperience(index)}
                        variant="ghost"
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Description</Label>
                      <Textarea
                        value={exp.description}
                        onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[100px]"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Education */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => toggleSection('education')}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <h3 className="text-lg font-medium text-white">Education</h3>
                    {expandedSections.education ? (
                      <ChevronUp className="h-5 w-5 text-white/60" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-white/60" />
                    )}
                  </button>
                  {expandedSections.education && (
                    <Button
                      onClick={addEducation}
                      variant="ghost"
                      className="text-white hover:text-white/80"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Education
                    </Button>
                  )}
                </div>
                {expandedSections.education && resumeData.content.education.map((edu, index) => (
                  <div key={index} className="space-y-4 p-4 border border-white/10 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="grid grid-cols-2 gap-4 flex-1">
                        <div className="space-y-2">
                          <Label className="text-white">School</Label>
                          <Input
                            value={edu.school}
                            onChange={(e) => handleEducationChange(index, 'school', e.target.value)}
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Degree</Label>
                          <Input
                            value={edu.degree}
                            onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Field of Study</Label>
                          <Input
                            value={edu.field}
                            onChange={(e) => handleEducationChange(index, 'field', e.target.value)}
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-white">Start Date</Label>
                            <Input
                              value={edu.startDate}
                              onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                              className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white">End Date</Label>
                            <Input
                              value={edu.endDate}
                              onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                              className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                            />
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => removeEducation(index)}
                        variant="ghost"
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Skills */}
              <div className="space-y-4">
                <button
                  onClick={() => toggleSection('skills')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h3 className="text-lg font-medium text-white">Skills</h3>
                  {expandedSections.skills ? (
                    <ChevronUp className="h-5 w-5 text-white/60" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-white/60" />
                  )}
                </button>
                {expandedSections.skills && (
                  <div className="space-y-2">
                    <Label className="text-white">Skills (comma-separated)</Label>
                    <Textarea
                      value={resumeData.content.skills.join(', ')}
                      onChange={(e) => handleSkillsChange(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[100px]"
                      placeholder="e.g., JavaScript, React, Node.js, Python"
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Preview Panel */}
          <Card className="border-none bg-[#18181b]/90 rounded-2xl shadow-2xl backdrop-blur-md p-6">
            <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Preview
            </h2>
            <div className="bg-white rounded-lg p-8">
              <iframe
                src={`/api/preview-resume?templateId=${resolvedParams.templateId}&resumeData=${encodeURIComponent(JSON.stringify(resumeData))}`}
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