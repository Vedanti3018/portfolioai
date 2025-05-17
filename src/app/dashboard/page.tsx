'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'
import { useAuth } from '@/context/AuthContext'

import { useState, ChangeEvent, FormEvent } from 'react';

export default function Dashboard() {
  const { user, loading, signOut, isAuthenticated } = useAuth()
  const router = useRouter()

  // Protect the dashboard route
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [loading, isAuthenticated, router])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </MainLayout>
    )
  }

  // If authenticated, show the dashboard
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [parsedResume, setParsedResume] = useState<any>(null);
  const [parsedLinkedin, setParsedLinkedin] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [editResume, setEditResume] = useState<any>({});
  const [editLinkedin, setEditLinkedin] = useState<any>({});
  const [loadingResume, setLoadingResume] = useState(false);
  const [loadingLinkedin, setLoadingLinkedin] = useState(false);
  const [error, setError] = useState('');

  // Handle resume file upload
  const handleResumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setResumeFile(e.target.files[0]);
    }
  };

  // Handle resume upload submit
  const handleResumeUpload = async (e: FormEvent) => {
    e.preventDefault();
    setLoadingResume(true);
    setError('');
    if (!resumeFile || !user?.id) return;
    try {
      const formData = new FormData();
      formData.append('file', resumeFile);
      formData.append('user_id', user.id);
      const res = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to parse resume');
      setParsedResume(result.parsed);
      setEditResume(result.parsed);
    } catch (err: any) {
      setError(err.message || 'Failed to upload or parse resume');
    } finally {
      setLoadingResume(false);
    }
  };

  // Handle LinkedIn URL submit
  const handleLinkedinSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoadingLinkedin(true);
    setError('');
    if (!linkedinUrl || !user?.id) return;
    try {
      const res = await fetch('/api/linkedin-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: linkedinUrl, user_id: user.id }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to parse LinkedIn');
      setParsedLinkedin(result.parsed);
      setEditLinkedin(result.parsed);
    } catch (err: any) {
      setError(err.message || 'Failed to import or parse LinkedIn profile');
    } finally {
      setLoadingLinkedin(false);
    }
  };


  // Handle edit/save for resume info
  const handleResumeEditChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditResume({ ...editResume, [e.target.name]: e.target.value });
  };
  const handleResumeSave = () => {
    setParsedResume(editResume);
    setEditMode(false);
    // TODO: Save to Supabase
  };

  // Handle edit/save for LinkedIn info
  const handleLinkedinEditChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditLinkedin({ ...editLinkedin, [e.target.name]: e.target.value });
  };
  const handleLinkedinSave = () => {
    setParsedLinkedin(editLinkedin);
    setEditMode(false);
    // TODO: Save to Supabase
  };

  if (isAuthenticated) {
    return (
      <MainLayout>
        <div className="bg-white py-12 md:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Welcome to your Dashboard</h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">{user?.email}</p>
              <button
                onClick={signOut}
                className="mt-6 rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
              >
                Sign out
              </button>
            </div>

            {/* Resume Upload Section */}
            <div className="mt-12 mb-8 max-w-xl mx-auto bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Upload Resume</h2>
              <form onSubmit={handleResumeUpload} className="flex flex-col gap-4">
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeChange} />
                <button
                  type="submit"
                  className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-500"
                  disabled={loadingResume}
                >
                  {loadingResume ? 'Uploading...' : 'Upload and Parse'}
                </button>
              </form>
              {parsedResume && (
                <div className="mt-4">
                  <h3 className="font-medium">Parsed Resume Info</h3>
                  {editMode ? (
                    <div className="flex flex-col gap-2 mt-2">
                      <input type="text" name="name" value={editResume.name || ''} onChange={handleResumeEditChange} placeholder="Name" className="border rounded px-2 py-1" />
                      <input type="email" name="email" value={editResume.email || ''} onChange={handleResumeEditChange} placeholder="Email" className="border rounded px-2 py-1" />
                      <textarea name="experience" value={editResume.experience || ''} onChange={handleResumeEditChange} placeholder="Experience" className="border rounded px-2 py-1" />
                      <textarea name="education" value={editResume.education || ''} onChange={handleResumeEditChange} placeholder="Education" className="border rounded px-2 py-1" />
                      <button onClick={handleResumeSave} className="bg-green-600 text-white px-3 py-1 rounded mt-2">Save</button>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <div><b>Name:</b> {parsedResume.name}</div>
                      <div><b>Email:</b> {parsedResume.email}</div>
                      <div><b>Experience:</b> {parsedResume.experience}</div>
                      <div><b>Education:</b> {parsedResume.education}</div>
                      <button onClick={() => { setEditMode(true); setEditResume(parsedResume); }} className="bg-blue-600 text-white px-3 py-1 rounded mt-2">Edit</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* LinkedIn Section */}
            <div className="mb-8 max-w-xl mx-auto bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Import from LinkedIn</h2>
              <form onSubmit={handleLinkedinSubmit} className="flex flex-col gap-4">
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={e => setLinkedinUrl(e.target.value)}
                  placeholder="Enter your LinkedIn profile URL"
                  className="border rounded px-2 py-1"
                  required
                />
                <button
                  type="submit"
                  className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-500"
                  disabled={loadingLinkedin}
                >
                  {loadingLinkedin ? 'Importing...' : 'Import and Parse'}
                </button>
              </form>
              {parsedLinkedin && (
                <div className="mt-4">
                  <h3 className="font-medium">Parsed LinkedIn Info</h3>
                  {editMode ? (
                    <div className="flex flex-col gap-2 mt-2">
                      <input type="text" name="name" value={editLinkedin.name || ''} onChange={handleLinkedinEditChange} placeholder="Name" className="border rounded px-2 py-1" />
                      <input type="email" name="email" value={editLinkedin.email || ''} onChange={handleLinkedinEditChange} placeholder="Email" className="border rounded px-2 py-1" />
                      <textarea name="experience" value={editLinkedin.experience || ''} onChange={handleLinkedinEditChange} placeholder="Experience" className="border rounded px-2 py-1" />
                      <textarea name="education" value={editLinkedin.education || ''} onChange={handleLinkedinEditChange} placeholder="Education" className="border rounded px-2 py-1" />
                      <button onClick={handleLinkedinSave} className="bg-green-600 text-white px-3 py-1 rounded mt-2">Save</button>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <div><b>Name:</b> {parsedLinkedin.name}</div>
                      <div><b>Email:</b> {parsedLinkedin.email}</div>
                      <div><b>Experience:</b> {parsedLinkedin.experience}</div>
                      <div><b>Education:</b> {parsedLinkedin.education}</div>
                      <button onClick={() => { setEditMode(true); setEditLinkedin(parsedLinkedin); }} className="bg-blue-600 text-white px-3 py-1 rounded mt-2">Edit</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <DashboardCard
                title="Portfolio Builder"
                description="Create a professional portfolio website in minutes."
                href="/portfolio-builder"
              />
              <DashboardCard
                title="Resume Generator"
                description="Generate an ATS-optimized resume."
                href="/resume-generator"
              />
              <DashboardCard
                title="Cover Letter Writer"
                description="Create personalized cover letters for any job."
                href="/cover-letter"
              />
              <DashboardCard
                title="Mock Interview"
                description="Practice interviews with AI feedback."
                href="/mock-interview"
              />
              <DashboardCard
                title="Job Alerts"
                description="Get personalized job recommendations."
                href="/job-alerts"
              />
              <DashboardCard
                title="Career Coaching"
                description="Get AI-driven career advice."
                href="/career-coaching"
              />
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  // This should not be reached because of the redirect, but just in case
  return null
}

function DashboardCard({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <div className="bg-white shadow overflow-hidden rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <div className="mt-2 text-sm text-gray-500">
          <p>{description}</p>
        </div>
        <div className="mt-4">
          <Link
            href={href}
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            Get started <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
