'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, ArrowRight, Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

const MotionCard = motion(Card);

interface Skills {
  technical_skills: string[];
  soft_skills: string[];
  languages: string[];
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  description: string;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  description: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  url: string;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
}

interface ManualEntryData {
  basic_info: {
    name: string;
    email: string;
    phone: string;
    country: string;
  };
  professional_info: {
    current_designation: string;
    company_name: string;
    start_date: string;
    end_date: string;
    description: string;
    skills: Skills;
    education: Education[];
    experience: Experience[];
    projects: Project[];
    certifications: Certification[];
  };
}

export default function ManualEntryPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ManualEntryData>({
    basic_info: {
      name: '',
      email: '',
      phone: '',
      country: ''
    },
    professional_info: {
      current_designation: '',
      company_name: '',
      start_date: '',
      end_date: '',
      description: '',
      skills: {
        technical_skills: [],
        soft_skills: [],
        languages: []
      },
      education: [],
      experience: [],
      projects: [],
      certifications: []
    }
  });

  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleInputChange = (section: keyof ManualEntryData, field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSkillsChange = (skillType: keyof Skills, value: string) => {
    setFormData(prev => ({
      ...prev,
      professional_info: {
        ...prev.professional_info,
        skills: {
          ...prev.professional_info.skills,
          [skillType]: value.split(',').map(s => s.trim())
        }
      }
    }));
  };

  const addItem = (section: 'education' | 'experience' | 'projects' | 'certifications') => {
    const newItem = {
      id: crypto.randomUUID(),
      ...(section === 'education' && {
        institution: '',
        degree: '',
        field_of_study: '',
        start_date: '',
        end_date: '',
        description: ''
      }),
      ...(section === 'experience' && {
        company: '',
        position: '',
        start_date: '',
        end_date: '',
        description: ''
      }),
      ...(section === 'projects' && {
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        url: ''
      }),
      ...(section === 'certifications' && {
        name: '',
        issuer: '',
        date: '',
        url: ''
      })
    };

    setFormData(prev => ({
      ...prev,
      professional_info: {
        ...prev.professional_info,
        [section]: [...prev.professional_info[section], newItem]
      }
    }));
  };

  const removeItem = (section: 'education' | 'experience' | 'projects' | 'certifications', id: string) => {
    setFormData(prev => ({
      ...prev,
      professional_info: {
        ...prev.professional_info,
        [section]: prev.professional_info[section].filter(item => item.id !== id)
      }
    }));
  };

  const updateItem = (
    section: 'education' | 'experience' | 'projects' | 'certifications',
    id: string,
    field: string,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      professional_info: {
        ...prev.professional_info,
        [section]: prev.professional_info[section].map(item =>
          item.id === id ? { ...item, [field]: value } : item
        )
      }
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // Create the full resume data structure
      const resumeData = {
        basic_info: {
          ...formData.basic_info,
          education: formData.professional_info.education
        },
        professional_info: {
          ...formData.professional_info,
          linkedin_url: '',
          portfolio_url: '',
          resume_url: ''
        }
      };

      // Save to onboarding_drafts
      const { error: draftError } = await supabase
        .from('onboarding_drafts')
        .upsert({
          id: session.user.id,
          parsed_data: resumeData,
          created_at: new Date().toISOString()
        });

      if (draftError) {
        throw new Error(`Failed to save draft: ${draftError.message}`);
      }

      toast.success('Information saved successfully!');
      router.push('/onboarding/review');
    } catch (error) {
      console.error('Error saving manual entry:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save information');
    } finally {
      setIsLoading(false);
    }
  };

  const renderEducationSection = () => (
    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Education</h2>
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-white/10 text-white border border-white/20 hover:bg-white/20"
          onClick={() => addItem('education')}
        >
          <Plus className="h-4 w-4" />
          Add Education
        </Button>
      </div>
      {formData.professional_info.education.map((edu: Education) => (
        <Card key={edu.id} className="bg-[#23232a] border border-white/10">
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-start">
              <div className="grid grid-cols-2 gap-4 flex-1">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Institution</label>
                  <Input
                    value={edu.institution}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem('education', edu.id, 'institution', e.target.value)}
                    className="bg-[#18181b] border border-white/10 text-white"
                    placeholder="University/College name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Degree</label>
                  <Input
                    value={edu.degree}
                    onChange={(e) => updateItem('education', edu.id, 'degree', e.target.value)}
                    className="bg-[#18181b] border border-white/10 text-white"
                    placeholder="e.g., Bachelor's"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Field of Study</label>
                  <Input
                    value={edu.field_of_study}
                    onChange={(e) => updateItem('education', edu.id, 'field_of_study', e.target.value)}
                    className="bg-[#18181b] border border-white/10 text-white"
                    placeholder="e.g., Computer Science"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                    <Input
                      type="date"
                      value={edu.start_date}
                      onChange={(e) => updateItem('education', edu.id, 'start_date', e.target.value)}
                      className="bg-[#18181b] border border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                    <Input
                      type="date"
                      value={edu.end_date}
                      onChange={(e) => updateItem('education', edu.id, 'end_date', e.target.value)}
                      className="bg-[#18181b] border border-white/10 text-white"
                    />
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                onClick={() => removeItem('education', edu.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <Textarea
                value={edu.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateItem('education', edu.id, 'description', e.target.value)}
                className="bg-[#18181b] border border-white/10 text-white"
                placeholder="Additional details about your education"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );

  const renderExperienceSection = () => (
    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Experience</h2>
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-white/10 text-white border border-white/20 hover:bg-white/20"
          onClick={() => addItem('experience')}
        >
          <Plus className="h-4 w-4" />
          Add Experience
        </Button>
      </div>
      {formData.professional_info.experience.map((exp: Experience) => (
        <Card key={exp.id} className="bg-[#23232a] border border-white/10">
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-start">
              <div className="grid grid-cols-2 gap-4 flex-1">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Company</label>
                  <Input
                    value={exp.company}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem('experience', exp.id, 'company', e.target.value)}
                    className="bg-[#18181b] border border-white/10 text-white"
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Position</label>
                  <Input
                    value={exp.position}
                    onChange={(e) => updateItem('experience', exp.id, 'position', e.target.value)}
                    className="bg-[#18181b] border border-white/10 text-white"
                    placeholder="Your role"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                    <Input
                      type="date"
                      value={exp.start_date}
                      onChange={(e) => updateItem('experience', exp.id, 'start_date', e.target.value)}
                      className="bg-[#18181b] border border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                    <Input
                      type="date"
                      value={exp.end_date}
                      onChange={(e) => updateItem('experience', exp.id, 'end_date', e.target.value)}
                      className="bg-[#18181b] border border-white/10 text-white"
                    />
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                onClick={() => removeItem('experience', exp.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <Textarea
                value={exp.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateItem('experience', exp.id, 'description', e.target.value)}
                className="bg-[#18181b] border border-white/10 text-white"
                placeholder="Describe your responsibilities and achievements"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );

  const renderProjectsSection = () => (
    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Projects</h2>
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-white/10 text-white border border-white/20 hover:bg-white/20"
          onClick={() => addItem('projects')}
        >
          <Plus className="h-4 w-4" />
          Add Project
        </Button>
      </div>
      {formData.professional_info.projects.map((project: Project) => (
        <Card key={project.id} className="bg-[#23232a] border border-white/10">
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-start">
              <div className="grid grid-cols-2 gap-4 flex-1">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Project Name</label>
                  <Input
                    value={project.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem('projects', project.id, 'name', e.target.value)}
                    className="bg-[#18181b] border border-white/10 text-white"
                    placeholder="Project name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Project URL</label>
                  <Input
                    value={project.url}
                    onChange={(e) => updateItem('projects', project.id, 'url', e.target.value)}
                    className="bg-[#18181b] border border-white/10 text-white"
                    placeholder="https://..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                    <Input
                      type="date"
                      value={project.start_date}
                      onChange={(e) => updateItem('projects', project.id, 'start_date', e.target.value)}
                      className="bg-[#18181b] border border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                    <Input
                      type="date"
                      value={project.end_date}
                      onChange={(e) => updateItem('projects', project.id, 'end_date', e.target.value)}
                      className="bg-[#18181b] border border-white/10 text-white"
                    />
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                onClick={() => removeItem('projects', project.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <Textarea
                value={project.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateItem('projects', project.id, 'description', e.target.value)}
                className="bg-[#18181b] border border-white/10 text-white"
                placeholder="Describe your project and your role"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );

  const renderCertificationsSection = () => (
    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Certifications</h2>
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-white/10 text-white border border-white/20 hover:bg-white/20"
          onClick={() => addItem('certifications')}
        >
          <Plus className="h-4 w-4" />
          Add Certification
        </Button>
      </div>
      {formData.professional_info.certifications.map((cert: Certification) => (
        <Card key={cert.id} className="bg-[#23232a] border border-white/10">
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-start">
              <div className="grid grid-cols-2 gap-4 flex-1">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Certification Name</label>
                  <Input
                    value={cert.name}
                    onChange={(e) => updateItem('certifications', cert.id, 'name', e.target.value)}
                    className="bg-[#18181b] border border-white/10 text-white"
                    placeholder="Certification name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Issuing Organization</label>
                  <Input
                    value={cert.issuer}
                    onChange={(e) => updateItem('certifications', cert.id, 'issuer', e.target.value)}
                    className="bg-[#18181b] border border-white/10 text-white"
                    placeholder="Organization name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Date Earned</label>
                  <Input
                    type="date"
                    value={cert.date}
                    onChange={(e) => updateItem('certifications', cert.id, 'date', e.target.value)}
                    className="bg-[#18181b] border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Certificate URL</label>
                  <Input
                    value={cert.url}
                    onChange={(e) => updateItem('certifications', cert.id, 'url', e.target.value)}
                    className="bg-[#18181b] border border-white/10 text-white"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                onClick={() => removeItem('certifications', cert.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );

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
                Back to Options
              </Button>
              <div className="flex items-center gap-2">
                <Image src="/logo.svg" alt="Brand Logo" width={32} height={32} />
                <h1 className="text-2xl font-semibold">Enter Your Information</h1>
              </div>
            </div>

            <div className="space-y-8">
              {/* Basic Information */}
              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-white">Basic Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                    <Input
                      type="text"
                      value={formData.basic_info.name}
                      onChange={(e) => handleInputChange('basic_info', 'name', e.target.value)}
                      className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                    <Input
                      type="email"
                      value={formData.basic_info.email}
                      onChange={(e) => handleInputChange('basic_info', 'email', e.target.value)}
                      className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                    <Input
                      type="tel"
                      value={formData.basic_info.phone}
                      onChange={(e) => handleInputChange('basic_info', 'phone', e.target.value)}
                      className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Country</label>
                    <Input
                      type="text"
                      value={formData.basic_info.country}
                      onChange={(e) => handleInputChange('basic_info', 'country', e.target.value)}
                      className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                      placeholder="Your country"
                    />
                  </div>
                </div>
              </section>

              {/* Professional Information */}
              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-white">Professional Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Current Designation</label>
                    <Input
                      type="text"
                      value={formData.professional_info.current_designation}
                      onChange={(e) => handleInputChange('professional_info', 'current_designation', e.target.value)}
                      className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Senior Software Engineer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Technical Skills</label>
                    <Input
                      type="text"
                      value={formData.professional_info.skills.technical_skills.join(', ')}
                      onChange={(e) => handleSkillsChange('technical_skills', e.target.value)}
                      className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., JavaScript, Python, React"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Soft Skills</label>
                    <Input
                      type="text"
                      value={formData.professional_info.skills.soft_skills.join(', ')}
                      onChange={(e) => handleSkillsChange('soft_skills', e.target.value)}
                      className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Communication, Leadership, Problem Solving"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Languages</label>
                    <Input
                      type="text"
                      value={formData.professional_info.skills.languages.join(', ')}
                      onChange={(e) => handleSkillsChange('languages', e.target.value)}
                      className="bg-[#23232a] border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., English, Spanish, French"
                    />
                  </div>
                </div>
              </section>

              {renderEducationSection()}
              {renderExperienceSection()}
              {renderProjectsSection()}
              {renderCertificationsSection()}

              <div className="flex justify-end pt-4">
                <Button
                  className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Continue to Review
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </MotionCard>
      </div>
    </div>
  );
} 