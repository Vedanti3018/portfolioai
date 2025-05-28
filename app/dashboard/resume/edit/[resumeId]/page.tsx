'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp, Download, Save, CheckCircle, Plus } from 'lucide-react';
import { use } from 'react';

interface ResumeData {
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
  projects: Array<{
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    url?: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    url?: string;
  }>;
  awards: Array<{
    award: string;
    description: string;
    date: string;
  }>;
}

interface Resume {
  id: string;
  title: string;
  content: ResumeData;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export default function EditResumePage({ params }: { params: Promise<{ resumeId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resume, setResume] = useState<Resume | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    experience: true,
    education: true,
    skills: true,
    projects: true,
    certifications: true,
    awards: true
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        const { data: resume, error } = await supabase
          .from('resumes')
          .select('*')
          .eq('id', resolvedParams.resumeId)
          .single();

        if (error) throw error;
        setResume(resume);
      } catch (error) {
        console.error('Error fetching resume:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, [resolvedParams.resumeId, router, supabase]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handlePersonalChange = (field: keyof ResumeData['personal'], value: string) => {
    if (!resume) return;
    setResume({
      ...resume,
      content: {
        ...resume.content,
        personal: {
          ...resume.content.personal,
          [field]: value
        }
      }
    });
  };

  const handleExperienceChange = (index: number, field: string, value: string) => {
    if (!resume) return;
    const newExperience = [...resume.content.experience];
    newExperience[index] = {
      ...newExperience[index],
      [field]: value
    };
    setResume({
      ...resume,
      content: {
        ...resume.content,
        experience: newExperience
      }
    });
  };

  const addExperience = () => {
    if (!resume) return;
    setResume({
      ...resume,
      content: {
        ...resume.content,
        experience: [
          ...resume.content.experience,
          {
            company: '',
            position: '',
            startDate: '',
            endDate: '',
            description: ''
          }
        ]
      }
    });
  };

  const removeExperience = (index: number) => {
    if (!resume) return;
    const newExperience = [...resume.content.experience];
    newExperience.splice(index, 1);
    setResume({
      ...resume,
      content: {
        ...resume.content,
        experience: newExperience
      }
    });
  };

  const handleEducationChange = (index: number, field: string, value: string) => {
    if (!resume) return;
    const newEducation = [...resume.content.education];
    newEducation[index] = {
      ...newEducation[index],
      [field]: value
    };
    setResume({
      ...resume,
      content: {
        ...resume.content,
        education: newEducation
      }
    });
  };

  const addEducation = () => {
    if (!resume) return;
    setResume({
      ...resume,
      content: {
        ...resume.content,
        education: [
          ...resume.content.education,
          {
            school: '',
            degree: '',
            field: '',
            startDate: '',
            endDate: ''
          }
        ]
      }
    });
  };

  const removeEducation = (index: number) => {
    if (!resume) return;
    const newEducation = [...resume.content.education];
    newEducation.splice(index, 1);
    setResume({
      ...resume,
      content: {
        ...resume.content,
        education: newEducation
      }
    });
  };

  const handleSkillsChange = (value: string) => {
    if (!resume) return;
    setResume({
      ...resume,
      content: {
        ...resume.content,
        skills: value.split(',').map(skill => skill.trim())
      }
    });
  };

  const handleProjectChange = (index: number, field: string, value: string) => {
    if (!resume) return;
    const newProjects = [...resume.content.projects || []];
    newProjects[index] = {
      ...newProjects[index],
      [field]: value
    };
    setResume({
      ...resume,
      content: {
        ...resume.content,
        projects: newProjects
      }
    });
  };

  const addProject = () => {
    if (!resume) return;
    setResume({
      ...resume,
      content: {
        ...resume.content,
        projects: [
          ...(resume.content.projects || []),
          {
            title: '',
            description: '',
            startDate: '',
            endDate: '',
            url: ''
          }
        ]
      }
    });
  };

  const removeProject = (index: number) => {
    if (!resume) return;
    const newProjects = [...resume.content.projects || []];
    newProjects.splice(index, 1);
    setResume({
      ...resume,
      content: {
        ...resume.content,
        projects: newProjects
      }
    });
  };

  const handleCertificationChange = (index: number, field: string, value: string) => {
    if (!resume) return;
    const newCertifications = [...resume.content.certifications || []];
    newCertifications[index] = {
      ...newCertifications[index],
      [field]: value
    };
    setResume({
      ...resume,
      content: {
        ...resume.content,
        certifications: newCertifications
      }
    });
  };

  const addCertification = () => {
    if (!resume) return;
    setResume({
      ...resume,
      content: {
        ...resume.content,
        certifications: [
          ...(resume.content.certifications || []),
          {
            name: '',
            issuer: '',
            date: '',
            url: ''
          }
        ]
      }
    });
  };

  const removeCertification = (index: number) => {
    if (!resume) return;
    const newCertifications = [...resume.content.certifications || []];
    newCertifications.splice(index, 1);
    setResume({
      ...resume,
      content: {
        ...resume.content,
        certifications: newCertifications
      }
    });
  };

  const handleAwardChange = (index: number, field: string, value: string) => {
    if (!resume) return;
    const newAwards = [...resume.content.awards || []];
    newAwards[index] = {
      ...newAwards[index],
      [field]: value
    };
    setResume({
      ...resume,
      content: {
        ...resume.content,
        awards: newAwards
      }
    });
  };

  const addAward = () => {
    if (!resume) return;
    setResume({
      ...resume,
      content: {
        ...resume.content,
        awards: [
          ...(resume.content.awards || []),
          {
            award: '',
            description: '',
            date: ''
          }
        ]
      }
    });
  };

  const removeAward = (index: number) => {
    if (!resume) return;
    const newAwards = [...resume.content.awards || []];
    newAwards.splice(index, 1);
    setResume({
      ...resume,
      content: {
        ...resume.content,
        awards: newAwards
      }
    });
  };

  const handleSave = async () => {
    if (!resume) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('resumes')
        .update({
          content: resume.content,
          updated_at: new Date().toISOString()
        })
        .eq('id', resume.id);

      if (error) throw error;
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    } catch (error) {
      console.error('Error saving resume:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if (!resume) return;
    try {
      const response = await fetch('/api/generate-resume-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeId: resume.id,
          content: resume.content
        }),
      });

      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resume.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading resume:', error);
    }
  };

  // Helper to check if resume content is empty
  function isResumeContentEmpty(content: ResumeData) {
    return (
      (!content.personal.name || content.personal.name.trim() === '') &&
      (!content.personal.title || content.personal.title.trim() === '') &&
      (!content.personal.email || content.personal.email.trim() === '') &&
      (!content.personal.phone || content.personal.phone.trim() === '') &&
      (!content.personal.location || content.personal.location.trim() === '') &&
      (!content.personal.summary || content.personal.summary.trim() === '') &&
      (!content.experience || content.experience.length === 0) &&
      (!content.education || content.education.length === 0) &&
      (!content.skills || content.skills.length === 0) &&
      (!content.projects || content.projects.length === 0) &&
      (!content.certifications || content.certifications.length === 0) &&
      (!content.awards || content.awards.length === 0)
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-10 w-10 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <div className="text-lg font-semibold">Extracting your resume...</div>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Resume not found</h1>
          <Button onClick={() => router.push('/dashboard/resume')}>
            Back to Resumes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Edit Resume</h1>
          <div className="flex gap-4">
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

        {error && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {showSuccess && (
          <div className="mb-4 p-4 bg-green-900/50 border border-green-500 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
            <p className="text-green-200">Resume saved successfully!</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-6">
            {/* Personal Information */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold text-white">Personal Information</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection('personal')}
                  className="text-gray-400 hover:text-white"
                >
                  {expandedSections.personal ? <ChevronUp /> : <ChevronDown />}
                </Button>
              </CardHeader>
              {expandedSections.personal && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-200">Name</Label>
                      <Input
                        value={resume.content.personal.name}
                        onChange={(e) => handlePersonalChange('name', e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-200">Title</Label>
                      <Input
                        value={resume.content.personal.title}
                        onChange={(e) => handlePersonalChange('title', e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-200">Email</Label>
                      <Input
                        value={resume.content.personal.email}
                        onChange={(e) => handlePersonalChange('email', e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-200">Phone</Label>
                      <Input
                        value={resume.content.personal.phone}
                        onChange={(e) => handlePersonalChange('phone', e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-200">Location</Label>
                    <Input
                      value={resume.content.personal.location}
                      onChange={(e) => handlePersonalChange('location', e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-200">Summary</Label>
                    <Textarea
                      value={resume.content.personal.summary}
                      onChange={(e) => handlePersonalChange('summary', e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 min-h-[100px]"
                    />
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Experience Section */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold text-white">Experience</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addExperience}
                    className="text-gray-400 hover:text-white"
                  >
                    Add
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection('experience')}
                    className="text-gray-400 hover:text-white"
                  >
                    {expandedSections.experience ? <ChevronUp /> : <ChevronDown />}
                  </Button>
                </div>
              </CardHeader>
              {expandedSections.experience && (
                <CardContent className="space-y-6">
                  {resume.content.experience.map((exp, index) => (
                    <div key={index} className="space-y-4 p-4 bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-white">Experience {index + 1}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExperience(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-200">Company</Label>
                          <Input
                            value={exp.company}
                            onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-200">Position</Label>
                          <Input
                            value={exp.position}
                            onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-200">Start Date</Label>
                          <Input
                            value={exp.startDate}
                            onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-200">End Date</Label>
                          <Input
                            value={exp.endDate}
                            onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-200">Description</Label>
                        <Textarea
                          value={exp.description}
                          onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 min-h-[100px]"
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>

            {/* Education Section */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold text-white">Education</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addEducation}
                    className="text-gray-400 hover:text-white"
                  >
                    Add
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection('education')}
                    className="text-gray-400 hover:text-white"
                  >
                    {expandedSections.education ? <ChevronUp /> : <ChevronDown />}
                  </Button>
                </div>
              </CardHeader>
              {expandedSections.education && (
                <CardContent className="space-y-6">
                  {resume.content.education.map((edu, index) => (
                    <div key={index} className="space-y-4 p-4 bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-white">Education {index + 1}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEducation(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-200">School</Label>
                          <Input
                            value={edu.school}
                            onChange={(e) => handleEducationChange(index, 'school', e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-200">Degree</Label>
                          <Input
                            value={edu.degree}
                            onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-200">Field</Label>
                          <Input
                            value={edu.field}
                            onChange={(e) => handleEducationChange(index, 'field', e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-200">Start Date</Label>
                          <Input
                            value={edu.startDate}
                            onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-200">End Date</Label>
                        <Input
                          value={edu.endDate}
                          onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>

            {/* Skills Section */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold text-white">Skills</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection('skills')}
                  className="text-gray-400 hover:text-white"
                >
                  {expandedSections.skills ? <ChevronUp /> : <ChevronDown />}
                </Button>
              </CardHeader>
              {expandedSections.skills && (
                <CardContent>
                  <div className="space-y-2">
                    <Label className="text-gray-200">Skills (comma-separated)</Label>
                    <Textarea
                      value={resume.content.skills.join(', ')}
                      onChange={(e) => handleSkillsChange(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 min-h-[100px]"
                    />
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Projects Section */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold text-white">Projects</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection('projects')}
                    className="text-gray-400 hover:text-white"
                  >
                    {expandedSections.projects ? <ChevronUp /> : <ChevronDown />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addProject}
                    className="text-gray-400 hover:text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              {expandedSections.projects && (
                <CardContent className="space-y-4">
                  {(resume?.content.projects || []).map((project, index) => (
                    <div key={index} className="space-y-4 p-4 bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-white">Project {index + 1}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProject(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-200">Title</Label>
                        <Input
                          value={project.title}
                          onChange={(e) => handleProjectChange(index, 'title', e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-200">Start Date</Label>
                          <Input
                            value={project.startDate}
                            onChange={(e) => handleProjectChange(index, 'startDate', e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-200">End Date</Label>
                          <Input
                            value={project.endDate}
                            onChange={(e) => handleProjectChange(index, 'endDate', e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-200">Description</Label>
                        <Textarea
                          value={project.description}
                          onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 min-h-[100px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-200">Project URL (optional)</Label>
                        <Input
                          value={project.url || ''}
                          onChange={(e) => handleProjectChange(index, 'url', e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>

            {/* Certifications Section */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold text-white">Certifications</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection('certifications')}
                    className="text-gray-400 hover:text-white"
                  >
                    {expandedSections.certifications ? <ChevronUp /> : <ChevronDown />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addCertification}
                    className="text-gray-400 hover:text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              {expandedSections.certifications && (
                <CardContent className="space-y-4">
                  {(resume?.content.certifications || []).map((cert, index) => (
                    <div key={index} className="space-y-4 p-4 bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-white">Certification {index + 1}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCertification(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-200">Name</Label>
                        <Input
                          value={cert.name}
                          onChange={(e) => handleCertificationChange(index, 'name', e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-200">Issuer</Label>
                        <Input
                          value={cert.issuer}
                          onChange={(e) => handleCertificationChange(index, 'issuer', e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-200">Date</Label>
                        <Input
                          value={cert.date}
                          onChange={(e) => handleCertificationChange(index, 'date', e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-200">Certificate URL (optional)</Label>
                        <Input
                          value={cert.url || ''}
                          onChange={(e) => handleCertificationChange(index, 'url', e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>

            {/* Awards Section */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold text-white">Awards</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection('awards')}
                    className="text-gray-400 hover:text-white"
                  >
                    {expandedSections.awards ? <ChevronUp /> : <ChevronDown />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addAward}
                    className="text-gray-400 hover:text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              {expandedSections.awards && (
                <CardContent className="space-y-4">
                  {(resume?.content.awards || []).map((award, index) => (
                    <div key={index} className="space-y-4 p-4 bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-white">Award {index + 1}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAward(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-200">Award Name</Label>
                        <Input
                          value={award.award}
                          onChange={(e) => handleAwardChange(index, 'award', e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-200">Description</Label>
                        <Textarea
                          value={award.description}
                          onChange={(e) => handleAwardChange(index, 'description', e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 min-h-[100px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-200">Date</Label>
                        <Input
                          value={award.date}
                          onChange={(e) => handleAwardChange(index, 'date', e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          </div>

          {/* Right Column - Preview */}
          <div className="flex flex-col h-full space-y-6">
            <Card className="bg-gray-900 border-gray-800 flex flex-col h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold text-white">Preview</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="bg-white text-black p-8 rounded-lg shadow-lg flex-1">
                  {isResumeContentEmpty(resume?.content) ? (
                    <div className="text-center text-gray-500 text-lg py-16">
                      No extracted information found for this resume.<br />
                      Please try uploading again or select a different file.
                    </div>
                  ) : (
                    <>
                      <h1 className="text-2xl font-bold mb-2">{resume?.content.personal.name || "Your Name"}</h1>
                      <p className="text-gray-700 mb-2">{resume?.content.personal.title || "Title"}</p>
                      <div className="text-sm text-gray-600 mb-4">
                        <p>{resume?.content.personal.email}</p>
                        <p>{resume?.content.personal.phone}</p>
                        <p>{resume?.content.personal.location}</p>
                      </div>
                      <div className="mb-4">
                        <h2 className="text-lg font-semibold mb-1">Summary</h2>
                        <p className="text-gray-700">{resume?.content.personal.summary || "No summary provided."}</p>
                      </div>
                      <div className="mb-4">
                        <h2 className="text-lg font-semibold mb-1">Experience</h2>
                        {resume?.content.experience && resume.content.experience.length > 0 ? (
                          resume.content.experience.map((exp, idx) => (
                            <div key={idx} className="mb-2">
                              <div className="font-semibold">{exp.position} at {exp.company}</div>
                              <div className="text-xs text-gray-500">{exp.startDate} - {exp.endDate}</div>
                              <div>{exp.description}</div>
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-400">No experience added.</div>
                        )}
                      </div>
                      <div className="mb-4">
                        <h2 className="text-lg font-semibold mb-1">Education</h2>
                        {resume?.content.education && resume.content.education.length > 0 ? (
                          resume.content.education.map((edu, idx) => (
                            <div key={idx} className="mb-2">
                              <div className="font-semibold">{edu.degree} in {edu.field}</div>
                              <div className="text-xs text-gray-500">{edu.school} ({edu.startDate} - {edu.endDate})</div>
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-400">No education added.</div>
                        )}
                      </div>
                      <div className="mb-4">
                        <h2 className="text-lg font-semibold mb-1">Projects</h2>
                        {resume?.content.projects && resume.content.projects.length > 0 ? (
                          resume.content.projects.map((project, idx) => (
                            <div key={idx} className="mb-2">
                              <div className="font-semibold">{project.title}</div>
                              <div className="text-xs text-gray-500">{project.startDate} - {project.endDate}</div>
                              <div>{project.description}</div>
                              {project.url && (
                                <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  View Project
                                </a>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-400">No projects added.</div>
                        )}
                      </div>
                      <div className="mb-4">
                        <h2 className="text-lg font-semibold mb-1">Certifications</h2>
                        {resume?.content.certifications && resume.content.certifications.length > 0 ? (
                          resume.content.certifications.map((cert, idx) => (
                            <div key={idx} className="mb-2">
                              <div className="font-semibold">{cert.name}</div>
                              <div className="text-xs text-gray-500">{cert.issuer} - {cert.date}</div>
                              {cert.url && (
                                <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  View Certificate
                                </a>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-400">No certifications added.</div>
                        )}
                      </div>
                      <div className="mb-4">
                        <h2 className="text-lg font-semibold mb-1">Awards</h2>
                        {resume?.content.awards && resume.content.awards.length > 0 ? (
                          resume.content.awards.map((award, idx) => (
                            <div key={idx} className="mb-2">
                              <div className="font-semibold">{award.award}</div>
                              <div className="text-xs text-gray-500">{award.date}</div>
                              <div>{award.description}</div>
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-400">No awards added.</div>
                        )}
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold mb-1">Skills</h2>
                        <div>{resume?.content.skills && resume.content.skills.length > 0 ? resume.content.skills.join(', ') : "No skills added."}</div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 