"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import jsPDF from 'jspdf';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp, Download, Save, ArrowLeft, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EditOptimizedResumePage({ params }: { params: { optimizationId: string } }) {
  const { optimizationId } = params;
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [optimization, setOptimization] = useState<any>(null);
  const [resume, setResume] = useState<any>(null); // structured_resume
  const [error, setError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState({
    personal: true,
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
    const fetchOptimization = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('resume_optimizations')
        .select('*')
        .eq('id', optimizationId)
        .single();
      if (error) {
        setError('Failed to fetch optimization');
      } else {
        setOptimization(data);
        setResume(data.structured_resume);
      }
      setLoading(false);
    };
    fetchOptimization();
  }, [optimizationId, supabase]);

  // Handlers for editing resume fields
  const handlePersonalChange = (field: string, value: string) => {
    if (!resume) return;
    setResume({
      ...resume,
      personal_info: {
        ...resume.personal_info,
        [field]: value
      }
    });
  };

  const handleExperienceChange = (index: number, field: string, value: string) => {
    if (!resume) return;
    const newExperience = [...(resume.experience || [])];
    newExperience[index] = {
      ...newExperience[index],
      [field]: value
    };
    setResume({
      ...resume,
      experience: newExperience
    });
  };
  const addExperience = () => {
    if (!resume) return;
    setResume({
      ...resume,
      experience: [
        ...(resume.experience || []),
        { company: '', designation: '', start_date: '', end_date: '', description: '' }
      ]
    });
  };
  const removeExperience = (index: number) => {
    if (!resume) return;
    const newExperience = [...(resume.experience || [])];
    newExperience.splice(index, 1);
    setResume({
      ...resume,
      experience: newExperience
    });
  };

  const handleEducationChange = (index: number, field: string, value: string) => {
    if (!resume) return;
    const newEducation = [...(resume.education || [])];
    newEducation[index] = {
      ...newEducation[index],
      [field]: value
    };
    setResume({
      ...resume,
      education: newEducation
    });
  };
  const addEducation = () => {
    if (!resume) return;
    setResume({
      ...resume,
      education: [
        ...(resume.education || []),
        { degree: '', institution: '', field_of_study: '', start_year: '', end_year: '' }
      ]
    });
  };
  const removeEducation = (index: number) => {
    if (!resume) return;
    const newEducation = [...(resume.education || [])];
    newEducation.splice(index, 1);
    setResume({
      ...resume,
      education: newEducation
    });
  };

  const handleSkillsChange = (type: string, value: string) => {
    if (!resume) return;
    setResume({
      ...resume,
      skills: {
        ...resume.skills,
        [type]: value.split(',').map((s: string) => s.trim()).filter(Boolean)
      }
    });
  };

  const handleProjectChange = (index: number, field: string, value: string) => {
    if (!resume) return;
    const newProjects = [...(resume.projects || [])];
    newProjects[index] = {
      ...newProjects[index],
      [field]: value
    };
    setResume({
      ...resume,
      projects: newProjects
    });
  };
  const addProject = () => {
    if (!resume) return;
    setResume({
      ...resume,
      projects: [
        ...(resume.projects || []),
        { title: '', description: '', technologies: [], }
      ]
    });
  };
  const removeProject = (index: number) => {
    if (!resume) return;
    const newProjects = [...(resume.projects || [])];
    newProjects.splice(index, 1);
    setResume({
      ...resume,
      projects: newProjects
    });
  };

  const handleCertificationChange = (index: number, field: string, value: string) => {
    if (!resume) return;
    const newCerts = [...(resume.certifications || [])];
    newCerts[index] = {
      ...newCerts[index],
      [field]: value
    };
    setResume({
      ...resume,
      certifications: newCerts
    });
  };
  const addCertification = () => {
    if (!resume) return;
    setResume({
      ...resume,
      certifications: [
        ...(resume.certifications || []),
        { name: '', issuer: '', year: '' }
      ]
    });
  };
  const removeCertification = (index: number) => {
    if (!resume) return;
    const newCerts = [...(resume.certifications || [])];
    newCerts.splice(index, 1);
    setResume({
      ...resume,
      certifications: newCerts
    });
  };

  const handleAwardChange = (index: number, field: string, value: string) => {
    if (!resume) return;
    const newAwards = [...(resume.awards || [])];
    newAwards[index] = {
      ...newAwards[index],
      [field]: value
    };
    setResume({
      ...resume,
      awards: newAwards
    });
  };
  const addAward = () => {
    if (!resume) return;
    setResume({
      ...resume,
      awards: [
        ...(resume.awards || []),
        { award: '', description: '', date: '' }
      ]
    });
  };
  const removeAward = (index: number) => {
    if (!resume) return;
    const newAwards = [...(resume.awards || [])];
    newAwards.splice(index, 1);
    setResume({
      ...resume,
      awards: newAwards
    });
  };

  const handleSave = async () => {
    if (!resume) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('resume_optimizations')
        .update({ structured_resume: resume })
        .eq('id', optimizationId);
      if (error) throw error;
    } catch (error) {
      setError('Error saving resume');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    // You can call your PDF generation API here
  };

  if (loading) return <div>Loading...</div>;
  if (error || !resume) return <div>Error: {error || 'No data found'}</div>;

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
                      <Input value={resume.personal_info?.name || ''} onChange={e => handlePersonalChange('name', e.target.value)} className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-200">Email</Label>
                      <Input value={resume.personal_info?.email || ''} onChange={e => handlePersonalChange('email', e.target.value)} className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-200">Phone</Label>
                      <Input value={resume.personal_info?.phone || ''} onChange={e => handlePersonalChange('phone', e.target.value)} className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-200">Location</Label>
                      <Input value={resume.personal_info?.location || ''} onChange={e => handlePersonalChange('location', e.target.value)} className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-200">Summary</Label>
                    <Textarea value={resume.personal_info?.summary || ''} onChange={e => handlePersonalChange('summary', e.target.value)} className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 min-h-[100px]" />
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
                <CardContent className="space-y-4">
                  {(resume.experience || []).map((exp: any, idx: number) => (
                    <div key={idx} className="space-y-2 p-4 bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-white">Experience {idx + 1}</h3>
                        <Button variant="ghost" size="sm" onClick={() => removeExperience(idx)} className="text-red-400 hover:text-red-300">Remove</Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-200">Company</Label>
                          <Input value={exp.company} onChange={e => handleExperienceChange(idx, 'company', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-200">Designation</Label>
                          <Input value={exp.designation} onChange={e => handleExperienceChange(idx, 'designation', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-200">Start Date</Label>
                          <Input value={exp.start_date} onChange={e => handleExperienceChange(idx, 'start_date', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-200">End Date</Label>
                          <Input value={exp.end_date} onChange={e => handleExperienceChange(idx, 'end_date', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-200">Description</Label>
                        <Textarea value={exp.description} onChange={e => handleExperienceChange(idx, 'description', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 min-h-[100px]" />
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" onClick={addExperience} className="text-gray-400 hover:text-white"><Plus className="w-4 h-4" /> Add Experience</Button>
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
                <CardContent className="space-y-4">
                  {(resume.education || []).map((edu: any, idx: number) => (
                    <div key={idx} className="space-y-2 p-4 bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-white">Education {idx + 1}</h3>
                        <Button variant="ghost" size="sm" onClick={() => removeEducation(idx)} className="text-red-400 hover:text-red-300">Remove</Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-200">Degree</Label>
                          <Input value={edu.degree} onChange={e => handleEducationChange(idx, 'degree', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-200">Institution</Label>
                          <Input value={edu.institution} onChange={e => handleEducationChange(idx, 'institution', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-200">Field of Study</Label>
                          <Input value={edu.field_of_study} onChange={e => handleEducationChange(idx, 'field_of_study', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-200">Start Year</Label>
                          <Input value={edu.start_year} onChange={e => handleEducationChange(idx, 'start_year', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-200">End Year</Label>
                        <Input value={edu.end_year} onChange={e => handleEducationChange(idx, 'end_year', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" />
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" onClick={addEducation} className="text-gray-400 hover:text-white"><Plus className="w-4 h-4" /> Add Education</Button>
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
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-200">Technical Skills (comma-separated)</Label>
                    <Textarea value={(resume.skills?.technical_skills || []).join(', ')} onChange={e => handleSkillsChange('technical_skills', e.target.value)} className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 min-h-[60px]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-200">Soft Skills (comma-separated)</Label>
                    <Textarea value={(resume.skills?.soft_skills || []).join(', ')} onChange={e => handleSkillsChange('soft_skills', e.target.value)} className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 min-h-[60px]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-200">Languages (comma-separated)</Label>
                    <Textarea value={(resume.skills?.languages || []).join(', ')} onChange={e => handleSkillsChange('languages', e.target.value)} className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 min-h-[60px]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-200">Keyword Gaps (comma-separated)</Label>
                    <Textarea value={(resume.skills?.keyword_gaps || []).join(', ')} onChange={e => handleSkillsChange('keyword_gaps', e.target.value)} className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 min-h-[60px]" />
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
                  {(resume.projects || []).map((project: any, idx: number) => (
                    <div key={idx} className="space-y-2 p-4 bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-white">Project {idx + 1}</h3>
                        <Button variant="ghost" size="sm" onClick={() => removeProject(idx)} className="text-red-400 hover:text-red-300">Remove</Button>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-200">Title</Label>
                        <Input value={project.title} onChange={e => handleProjectChange(idx, 'title', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-200">Description</Label>
                        <Textarea value={project.description} onChange={e => handleProjectChange(idx, 'description', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 min-h-[60px]" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-200">Technologies (comma-separated)</Label>
                        <Textarea value={(project.technologies || []).join(', ')} onChange={e => handleProjectChange(idx, 'technologies', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 min-h-[40px]" />
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
                  {(resume.certifications || []).map((cert: any, idx: number) => (
                    <div key={idx} className="space-y-2 p-4 bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-white">Certification {idx + 1}</h3>
                        <Button variant="ghost" size="sm" onClick={() => removeCertification(idx)} className="text-red-400 hover:text-red-300">Remove</Button>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-200">Name</Label>
                        <Input value={cert.name} onChange={e => handleCertificationChange(idx, 'name', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-200">Issuer</Label>
                        <Input value={cert.issuer} onChange={e => handleCertificationChange(idx, 'issuer', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-200">Year</Label>
                        <Input value={cert.year} onChange={e => handleCertificationChange(idx, 'year', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" />
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
                  {(resume.awards || []).map((award: any, idx: number) => (
                    <div key={idx} className="space-y-2 p-4 bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-white">Award {idx + 1}</h3>
                        <Button variant="ghost" size="sm" onClick={() => removeAward(idx)} className="text-red-400 hover:text-red-300">Remove</Button>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-200">Award Name</Label>
                        <Input value={award.award} onChange={e => handleAwardChange(idx, 'award', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-200">Description</Label>
                        <Textarea value={award.description} onChange={e => handleAwardChange(idx, 'description', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 min-h-[60px]" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-200">Date</Label>
                        <Input value={award.date} onChange={e => handleAwardChange(idx, 'date', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" />
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
                    onClick={() => router.push('/dashboard/optimizer/result?optimizationId=' + optimizationId)}
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
                <div className="flex justify-center items-start w-full" style={{ minHeight: 0 }}>
                  <div className="bg-white text-black rounded-lg shadow-lg p-8 max-w-2xl mx-auto text-[13px] leading-snug" style={{ minHeight: 400, maxHeight: 600, overflowY: 'auto' }}>
                    {/* Header */}
                    <div className="text-center mb-2">
                      <h1 className="text-xl font-extrabold">{resume?.personal_info?.name || "Your Name"}</h1>
                      <div className="text-sm">{resume?.personal_info?.title}</div>
                      <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-700 mt-2">
                        <span>{resume?.personal_info?.email}</span>
                        <span>•</span>
                        <span>{resume?.personal_info?.location}</span>
                      </div>
                    </div>
                    <hr className="my-3 border-gray-300" />
                    {/* SUMMARY */}
                    <div className="uppercase font-bold text-gray-900 tracking-wider text-xs mt-4 mb-1 border-b border-gray-300 pb-1">Summary</div>
                    <div className="mb-2 text-gray-800 text-xs">{resume?.personal_info?.summary}</div>
                    {/* EXPERIENCE */}
                    <div className="uppercase font-bold text-gray-900 tracking-wider text-xs mt-4 mb-1 border-b border-gray-300 pb-1">Experience</div>
                    {(resume.experience || []).length === 0 && <div className="text-xs text-gray-400">No experience added.</div>}
                    {(resume.experience || []).map((exp: any, idx: number) => (
                      <div key={idx} className="mb-2">
                        <div className="font-semibold text-xs">{exp.designation} <span className="text-gray-700">@ {exp.company}</span></div>
                        <div className="text-[11px] text-gray-500">{exp.start_date} - {exp.end_date}</div>
                        <div className="text-xs text-gray-800 whitespace-pre-line">{exp.description}</div>
                      </div>
                    ))}
                    {/* EDUCATION */}
                    <div className="uppercase font-bold text-gray-900 tracking-wider text-xs mt-4 mb-1 border-b border-gray-300 pb-1">Education</div>
                    {(resume.education || []).length === 0 && <div className="text-xs text-gray-400">No education added.</div>}
                    {(resume.education || []).map((edu: any, idx: number) => (
                      <div key={idx} className="mb-2">
                        <div className="font-semibold text-xs">{edu.degree} in {edu.field_of_study}</div>
                        <div className="text-[11px] text-gray-500">{edu.institution} ({edu.start_year} - {edu.end_year})</div>
                      </div>
                    ))}
                    {/* SKILLS */}
                    <div className="uppercase font-bold text-gray-900 tracking-wider text-xs mt-4 mb-1 border-b border-gray-300 pb-1">Skills</div>
                    <div className="mb-2 text-gray-800 text-xs">
                      <span className="font-semibold">Technical:</span> {(resume.skills?.technical_skills || []).join(', ')}<br />
                      <span className="font-semibold">Soft:</span> {(resume.skills?.soft_skills || []).join(', ')}<br />
                      <span className="font-semibold">Languages:</span> {(resume.skills?.languages || []).join(', ')}<br />
                      <span className="font-semibold">Keyword Gaps:</span> {(resume.skills?.keyword_gaps || []).join(', ')}
                    </div>
                    {/* PROJECTS */}
                    <div className="uppercase font-bold text-gray-900 tracking-wider text-xs mt-4 mb-1 border-b border-gray-300 pb-1">Projects</div>
                    {(resume.projects || []).length === 0 && <div className="text-xs text-gray-400">No projects added.</div>}
                    {(resume.projects || []).map((project: any, idx: number) => (
                      <div key={idx} className="mb-2">
                        <div className="font-semibold text-xs">{project.title}</div>
                        <div className="text-[11px] text-gray-500">{(project.technologies || []).join(', ')}</div>
                        <div className="text-xs text-gray-800 whitespace-pre-line">{project.description}</div>
                      </div>
                    ))}
                    {/* CERTIFICATIONS */}
                    <div className="uppercase font-bold text-gray-900 tracking-wider text-xs mt-4 mb-1 border-b border-gray-300 pb-1">Certifications</div>
                    {(resume.certifications || []).length === 0 && <div className="text-xs text-gray-400">No certifications added.</div>}
                    {(resume.certifications || []).map((cert: any, idx: number) => (
                      <div key={idx} className="mb-2">
                        <div className="font-semibold text-xs">{cert.name}</div>
                        <div className="text-[11px] text-gray-500">{cert.issuer} ({cert.year})</div>
                      </div>
                    ))}
                    {/* AWARDS */}
                    <div className="uppercase font-bold text-gray-900 tracking-wider text-xs mt-4 mb-1 border-b border-gray-300 pb-1">Awards</div>
                    {(resume.awards || []).length === 0 && <div className="text-xs text-gray-400">No awards added.</div>}
                    {(resume.awards || []).map((award: any, idx: number) => (
                      <div key={idx} className="mb-2">
                        <div className="font-semibold text-xs">{award.award}</div>
                        <div className="text-[11px] text-gray-500">{award.date}</div>
                        <div className="text-xs text-gray-800 whitespace-pre-line">{award.description}</div>
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