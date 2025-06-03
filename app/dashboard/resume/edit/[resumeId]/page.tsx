'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp, Download, Save, CheckCircle, Plus, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="uppercase font-bold text-gray-900 tracking-wider text-lg mt-6 mb-2">
      {children}
    </div>
  );
}

export default function EditResumePage({ params }: { params: { resumeId: string } }) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resume, setResume] = useState<Resume | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize default resume content structure
  const defaultResumeContent: ResumeData = {
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
    skills: [],
    projects: [],
    certifications: [],
    awards: []
  };

  // Accordion state for each section
  const [openSections, setOpenSections] = useState({
    personal: false,
    experience: false,
    education: false,
    skills: false,
    projects: false,
    certifications: false,
    awards: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log('No session found, redirecting to login');
          router.push('/login');
          return;
        }

        console.log('Current session user:', session.user.id);
        console.log('Attempting to fetch resume with ID:', params.resumeId);

        // First check if the resume exists and belongs to the user
        const { data: resumeData, error } = await supabase
          .from('resumes')
          .select('*')
          .eq('id', params.resumeId)
          .eq('user_id', session.user.id)
          .is('deleted_at', null)
          .single();

        if (error) {
          console.error('Supabase error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          setError(`Error fetching resume: ${error.message}`);
          return;
        }

        if (!resumeData) {
          console.error('No resume found with ID:', params.resumeId);
          setError('Resume not found or you do not have permission to access it');
          return;
        }

        console.log('Raw resume data from database:', {
          id: resumeData.id,
          title: resumeData.title,
          content: resumeData.content,
          content_type: typeof resumeData.content,
          is_json: resumeData.content ? typeof resumeData.content === 'object' : false
        });

        // Ensure the resume content has the required structure
        let processedContent;
        try {
          // If content is a string, try to parse it as JSON
          if (typeof resumeData.content === 'string') {
            processedContent = JSON.parse(resumeData.content);
          } else {
            processedContent = resumeData.content;
          }

          // Ensure all required fields exist with default values
          processedContent = {
            personal: {
              name: processedContent?.personal?.name || '',
              title: processedContent?.personal?.title || '',
              email: processedContent?.personal?.email || '',
              phone: processedContent?.personal?.phone || '',
              location: processedContent?.personal?.location || '',
              summary: processedContent?.personal?.summary || ''
            },
            experience: Array.isArray(processedContent?.experience) ? processedContent.experience : [],
            education: Array.isArray(processedContent?.education) ? processedContent.education : [],
            skills: Array.isArray(processedContent?.skills) ? processedContent.skills : [],
            projects: Array.isArray(processedContent?.projects) ? processedContent.projects : [],
            certifications: Array.isArray(processedContent?.certifications) ? processedContent.certifications : [],
            awards: Array.isArray(processedContent?.awards) ? processedContent.awards : []
          };
        } catch (parseError) {
          console.error('Error parsing resume content:', parseError);
          processedContent = defaultResumeContent;
        }

        const processedResume = {
          ...resumeData,
          content: processedContent
        };

        console.log('Processed resume content:', {
          personal: processedResume.content.personal,
          experience: processedResume.content.experience,
          education: processedResume.content.education,
          skills: processedResume.content.skills
        });

        setResume(processedResume);
      } catch (error) {
        console.error('Unexpected error fetching resume:', error);
        setError(error instanceof Error ? error.message : 'Failed to load resume');
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, [params.resumeId, router, supabase]);

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
          <div className="text-lg font-semibold">Loading your resume...</div>
        </div>
      </div>
    );
  }

  if (!resume) {
    console.log('Resume is null, showing error state');
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

  console.log('Rendering resume with data:', {
    title: resume.title,
    hasContent: !!resume.content,
    personal: resume.content?.personal,
    experience: resume.content?.experience,
    education: resume.content?.education
  });

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mt-20">
        {/* Editor: 1/3 width, accordion layout */}
        <div className="w-full lg:col-span-1 flex flex-col space-y-6">
          {/* Personal Information Accordion */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between cursor-pointer select-none" onClick={() => toggleSection('personal')}>
              <CardTitle className="text-lg font-semibold text-white">Personal Information</CardTitle>
              {openSections.personal ? <ChevronUp /> : <ChevronDown />}
            </CardHeader>
            <motion.div
              initial={false}
              animate={{ height: openSections.personal ? 'auto' : 0, opacity: openSections.personal ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >
              {openSections.personal && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-200">Name</Label>
                      <Input 
                        value={resume.content.personal?.name || ''} 
                        onChange={(e) => handlePersonalChange('name', e.target.value)} 
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-200">Title</Label>
                      <Input 
                        value={resume.content.personal?.title || ''} 
                        onChange={(e) => handlePersonalChange('title', e.target.value)} 
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-200">Email</Label>
                      <Input 
                        value={resume.content.personal?.email || ''} 
                        onChange={(e) => handlePersonalChange('email', e.target.value)} 
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-200">Phone</Label>
                      <Input 
                        value={resume.content.personal?.phone || ''} 
                        onChange={(e) => handlePersonalChange('phone', e.target.value)} 
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-200">Location</Label>
                    <Input 
                      value={resume.content.personal?.location || ''} 
                      onChange={(e) => handlePersonalChange('location', e.target.value)} 
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-200">Summary</Label>
                    <Textarea 
                      value={resume.content.personal?.summary || ''} 
                      onChange={(e) => handlePersonalChange('summary', e.target.value)} 
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 min-h-[100px]" 
                    />
                  </div>
                </CardContent>
              )}
            </motion.div>
          </Card>
          {/* Experience Accordion */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between cursor-pointer select-none" onClick={() => toggleSection('experience')}>
              <CardTitle className="text-lg font-semibold text-white">Experience</CardTitle>
              {openSections.experience ? <ChevronUp /> : <ChevronDown />}
            </CardHeader>
            <motion.div
              initial={false}
              animate={{ height: openSections.experience ? 'auto' : 0, opacity: openSections.experience ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >
              {openSections.experience && (
                <CardContent className="space-y-6">
                  {resume.content.experience.map((exp, index) => (
                    <div key={index} className="space-y-4 p-4 bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-white">Experience {index + 1}</h3>
                        <Button variant="ghost" size="sm" onClick={() => removeExperience(index)} className="text-red-400 hover:text-red-300">Remove</Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-200">Company</Label>
                          <Input value={exp.company} onChange={(e) => handleExperienceChange(index, 'company', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-200">Position</Label>
                          <Input value={exp.position} onChange={(e) => handleExperienceChange(index, 'position', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-200">Start Date</Label>
                          <Input value={exp.startDate} onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-200">End Date</Label>
                          <Input value={exp.endDate} onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-200">Description</Label>
                        <Textarea value={exp.description} onChange={(e) => handleExperienceChange(index, 'description', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 min-h-[100px]" />
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" onClick={addExperience} className="text-gray-400 hover:text-white">Add Experience</Button>
                </CardContent>
              )}
            </motion.div>
          </Card>
          {/* Education Accordion */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between cursor-pointer select-none" onClick={() => toggleSection('education')}>
              <CardTitle className="text-lg font-semibold text-white">Education</CardTitle>
              {openSections.education ? <ChevronUp /> : <ChevronDown />}
            </CardHeader>
            <motion.div
              initial={false}
              animate={{ height: openSections.education ? 'auto' : 0, opacity: openSections.education ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >
              {openSections.education && (
                <CardContent className="space-y-6">
                  {resume.content.education.map((edu, index) => (
                    <div key={index} className="space-y-4 p-4 bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-white">Education {index + 1}</h3>
                        <Button variant="ghost" size="sm" onClick={() => removeEducation(index)} className="text-red-400 hover:text-red-300">Remove</Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-200">School</Label>
                          <Input value={edu.school} onChange={(e) => handleEducationChange(index, 'school', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-200">Degree</Label>
                          <Input value={edu.degree} onChange={(e) => handleEducationChange(index, 'degree', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-200">Field</Label>
                          <Input value={edu.field} onChange={(e) => handleEducationChange(index, 'field', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-200">Start Date</Label>
                          <Input value={edu.startDate} onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-200">End Date</Label>
                        <Input value={edu.endDate} onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" />
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" onClick={addEducation} className="text-gray-400 hover:text-white">Add Education</Button>
                </CardContent>
              )}
            </motion.div>
          </Card>
          {/* Skills Accordion */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between cursor-pointer select-none" onClick={() => toggleSection('skills')}>
              <CardTitle className="text-lg font-semibold text-white">Skills</CardTitle>
              {openSections.skills ? <ChevronUp /> : <ChevronDown />}
            </CardHeader>
            <motion.div
              initial={false}
              animate={{ height: openSections.skills ? 'auto' : 0, opacity: openSections.skills ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >
              {openSections.skills && (
                <CardContent>
                  <div className="space-y-2">
                    <Label className="text-gray-200">Skills (comma-separated)</Label>
                    <Textarea value={resume.content.skills.join(', ')} onChange={(e) => handleSkillsChange(e.target.value)} className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 min-h-[100px]" />
                  </div>
                </CardContent>
              )}
            </motion.div>
          </Card>
          {/* Projects Accordion */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between cursor-pointer select-none" onClick={() => toggleSection('projects')}>
              <CardTitle className="text-lg font-semibold text-white">Projects</CardTitle>
              {openSections.projects ? <ChevronUp /> : <ChevronDown />}
            </CardHeader>
            <motion.div
              initial={false}
              animate={{ height: openSections.projects ? 'auto' : 0, opacity: openSections.projects ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >
              {openSections.projects && (
                <CardContent className="space-y-4">
                  {(resume?.content.projects || []).map((project, index) => (
                    <div key={index} className="space-y-4 p-4 bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-white">Project {index + 1}</h3>
                        <Button variant="ghost" size="sm" onClick={() => removeProject(index)} className="text-red-400 hover:text-red-300">Remove</Button>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-200">Title</Label>
                        <Input value={project.title} onChange={(e) => handleProjectChange(index, 'title', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-200">Start Date</Label>
                          <Input value={project.startDate} onChange={(e) => handleProjectChange(index, 'startDate', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-200">End Date</Label>
                          <Input value={project.endDate} onChange={(e) => handleProjectChange(index, 'endDate', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-200">Description</Label>
                        <Textarea value={project.description} onChange={(e) => handleProjectChange(index, 'description', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 min-h-[100px]" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-200">Project URL (optional)</Label>
                        <Input value={project.url || ''} onChange={(e) => handleProjectChange(index, 'url', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" />
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" onClick={addProject} className="text-gray-400 hover:text-white"><Plus className="w-4 h-4" /> Add Project</Button>
                </CardContent>
              )}
            </motion.div>
          </Card>
          {/* Certifications Accordion */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between cursor-pointer select-none" onClick={() => toggleSection('certifications')}>
              <CardTitle className="text-lg font-semibold text-white">Certifications</CardTitle>
              {openSections.certifications ? <ChevronUp /> : <ChevronDown />}
            </CardHeader>
            <motion.div
              initial={false}
              animate={{ height: openSections.certifications ? 'auto' : 0, opacity: openSections.certifications ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >
              {openSections.certifications && (
                <CardContent className="space-y-4">
                  {(resume?.content.certifications || []).map((cert, index) => (
                    <div key={index} className="space-y-4 p-4 bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-white">Certification {index + 1}</h3>
                        <Button variant="ghost" size="sm" onClick={() => removeCertification(index)} className="text-red-400 hover:text-red-300">Remove</Button>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-200">Name</Label>
                        <Input value={cert.name} onChange={(e) => handleCertificationChange(index, 'name', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-200">Issuer</Label>
                        <Input value={cert.issuer} onChange={(e) => handleCertificationChange(index, 'issuer', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-200">Date</Label>
                        <Input value={cert.date} onChange={(e) => handleCertificationChange(index, 'date', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-200">Certificate URL (optional)</Label>
                        <Input value={cert.url || ''} onChange={(e) => handleCertificationChange(index, 'url', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" />
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" onClick={addCertification} className="text-gray-400 hover:text-white"><Plus className="w-4 h-4" /> Add Certification</Button>
                </CardContent>
              )}
            </motion.div>
          </Card>
          {/* Awards Accordion */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between cursor-pointer select-none" onClick={() => toggleSection('awards')}>
              <CardTitle className="text-lg font-semibold text-white">Awards</CardTitle>
              {openSections.awards ? <ChevronUp /> : <ChevronDown />}
            </CardHeader>
            <motion.div
              initial={false}
              animate={{ height: openSections.awards ? 'auto' : 0, opacity: openSections.awards ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >
              {openSections.awards && (
                <CardContent className="space-y-4">
                  {(resume?.content.awards || []).map((award, index) => (
                    <div key={index} className="space-y-4 p-4 bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-white">Award {index + 1}</h3>
                        <Button variant="ghost" size="sm" onClick={() => removeAward(index)} className="text-red-400 hover:text-red-300">Remove</Button>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-200">Award Name</Label>
                        <Input value={award.award} onChange={(e) => handleAwardChange(index, 'award', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-200">Description</Label>
                        <Textarea value={award.description} onChange={(e) => handleAwardChange(index, 'description', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 min-h-[100px]" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-200">Date</Label>
                        <Input value={award.date} onChange={(e) => handleAwardChange(index, 'date', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" />
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" onClick={addAward} className="text-gray-400 hover:text-white"><Plus className="w-4 h-4" /> Add Award</Button>
                </CardContent>
              )}
            </motion.div>
          </Card>
        </div>
        {/* Preview: 2/3 width */}
        <div className="w-full lg:col-span-2 flex flex-col h-full space-y-6 mt-20 lg:mt-0">
          <div className="relative flex-1 flex flex-col items-center justify-start bg-[#101014] rounded-2xl p-6" style={{ minHeight: 0 }}>
            <Card className="bg-gray-900 border-gray-800 flex flex-col h-full w-full max-w-3xl mx-auto shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between gap-2 sticky top-0 z-10 bg-gray-900 rounded-t-2xl">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/dashboard/resume')}
                    className="flex items-center gap-2 text-gray-400 hover:text-black"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                  </Button>
                </div>
                <div className="flex gap-2 ml-auto">
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
              </CardHeader>
              <CardContent className="flex-1 flex flex-col overflow-auto" style={{ minHeight: 0 }}>
                <div
                  className="flex justify-center items-start w-full"
                  style={{ minHeight: 0 }}
                >
                  <div className="bg-white text-black rounded-lg shadow-lg p-8 max-w-2xl mx-auto text-[15px] leading-relaxed">
                    {/* Header */}
                    <div className="text-center mb-2">
                      <h1 className="text-2xl font-extrabold">{resume?.content.personal.name || "Your Name"}</h1>
                      <div className="text-base">{resume?.content.personal.title}</div>
                      <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-700 mt-2">
                        <span>{resume?.content.personal.email}</span>
                        <span>•</span>
                        <span>{resume?.content.personal.location}</span>
                        {/* Add more: LinkedIn, GitHub, etc. */}
                      </div>
                    </div>
                    {/* Divider */}
                    <hr className="my-4 border-gray-300" />

                    {/* SUMMARY */}
                    <div className="uppercase font-bold text-gray-900 tracking-wider text-base mt-8 mb-2 border-b border-gray-300 pb-1">Summary</div>
                    <div className="mb-4 text-gray-800 text-[15px]">{resume?.content.personal.summary}</div>

                    {/* WORK EXPERIENCE */}
                    <div className="uppercase font-bold text-gray-900 tracking-wider text-base mt-8 mb-2 border-b border-gray-300 pb-1">Work Experience</div>
                    {resume?.content.experience?.map((exp, idx) => (
                      <div key={idx} className="flex justify-between mb-2">
                        <div>
                          <div className="font-semibold text-[15px]">{exp.position}</div>
                          <div className="text-gray-700 text-xs">{exp.company}</div>
                          <ul className="list-disc ml-5 text-gray-800 text-[15px]">
                            {exp.description.split('\n').map((line, i) => <li key={i}>{line}</li>)}
                          </ul>
                        </div>
                        <div className="text-xs text-gray-500 whitespace-nowrap">{exp.startDate} — {exp.endDate}</div>
                      </div>
                    ))}

                    {/* SKILLS */}
                    <div className="uppercase font-bold text-gray-900 tracking-wider text-base mt-8 mb-2 border-b border-gray-300 pb-1">Skills</div>
                    <div className="mb-4 text-gray-800 text-[15px]">
                      {Array.isArray(resume?.content.skills)
                        ? resume.content.skills.map((skill, idx) =>
                            typeof skill === 'string'
                              ? <span key={idx}>{skill}{idx < resume.content.skills.length - 1 ? ', ' : ''}</span>
                              : <div key={idx}>
                                  {Object.entries(skill).map(([cat, val]) => (
                                    <span key={cat}><span className="font-bold">{cat}:</span> {String(val)}; </span>
                                  ))}
                                </div>
                        )
                        : <span>{String(resume?.content.skills)}</span>
                      }
                    </div>

                    {/* PROJECTS */}
                    <div className="uppercase font-bold text-gray-900 tracking-wider text-base mt-8 mb-2 border-b border-gray-300 pb-1">Projects</div>
                    {resume?.content.projects?.map((project, idx) => (
                      <div key={idx} className="flex justify-between mb-2">
                        <div>
                          <div className="font-semibold text-[15px]">{project.title} <span className="text-blue-600 underline">{project.url && <a href={project.url} target="_blank" rel="noopener noreferrer">Link</a>}</span></div>
                          <ul className="list-disc ml-5 text-gray-800 text-[15px]">
                            {project.description.split('\n').map((line, i) => <li key={i}>{line}</li>)}
                          </ul>
                        </div>
                        <div className="text-xs text-gray-500 whitespace-nowrap">{project.startDate} — {project.endDate}</div>
                      </div>
                    ))}

                    {/* AWARDS & ACHIEVEMENTS */}
                    <div className="uppercase font-bold text-gray-900 tracking-wider text-base mt-8 mb-2 border-b border-gray-300 pb-1">Awards & Achievements</div>
                    {resume?.content.awards?.map((award, idx) => (
                      <div key={idx} className="mb-2">
                        <div className="font-semibold text-blue-700 underline text-[15px]">{award.award}</div>
                        <div className="text-xs text-gray-500">{award.date}</div>
                        <div className="text-[15px]">{award.description}</div>
                      </div>
                    ))}

                    {/* EDUCATION */}
                    <div className="uppercase font-bold text-gray-900 tracking-wider text-base mt-8 mb-2 border-b border-gray-300 pb-1">Education</div>
                    {resume?.content.education?.map((edu, idx) => (
                      <div key={idx} className="flex justify-between mb-2">
                        <div>
                          <div className="font-semibold text-[15px]">{edu.degree} in {edu.field}</div>
                          <div className="text-gray-700 text-xs">{edu.school}</div>
                        </div>
                        <div className="text-xs text-gray-500 whitespace-nowrap">{edu.startDate} — {edu.endDate}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 