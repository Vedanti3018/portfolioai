'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import MainLayout from '@/components/layout/MainLayout'
import { updateProfile } from '@/utils/profileUtils'

export default function OnboardingPage() {
  const { user, refreshProfile } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [activeTab, setActiveTab] = useState<'resume' | 'linkedin'>('resume')
  const [file, setFile] = useState<File | null>(null)
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Check file type
    const fileType = selectedFile.type
    if (
      fileType !== 'application/pdf' && 
      fileType !== 'application/msword' && 
      fileType !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      setError('Please upload a PDF or Word document')
      return
    }

    // Check file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size should not exceed 5MB')
      return
    }

    setFile(selectedFile)
    setError('')
  }

  const handleResumeUpload = async () => {
    if (!file || !user) return

    setIsUploading(true)
    setError('')

    try {
      // Create FormData to send the file
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', user.id)

      // Send to your API endpoint that will handle the Python script integration
      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to upload resume')
      }

      // Update user profile with resume uploaded flag
      await updateProfile(user.id, { 
        updated_at: new Date().toISOString()
      })
      
      // Refresh the user profile data
      await refreshProfile()
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error uploading resume:', error)
      setError(error instanceof Error ? error.message : 'Failed to upload resume')
    } finally {
      setIsUploading(false)
    }
  }

  const handleLinkedinSubmit = async () => {
    if (!linkedinUrl || !user) return

    setIsSubmitting(true)
    setError('')

    // Basic LinkedIn URL validation
    const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+\/?$/
    if (!linkedinRegex.test(linkedinUrl)) {
      setError('Please enter a valid LinkedIn profile URL (e.g., https://www.linkedin.com/in/username)')
      setIsSubmitting(false)
      return
    }

    try {
      // Send to your API endpoint that will handle the Python script integration for LinkedIn scraping
      const response = await fetch('/api/parse-linkedin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          linkedinUrl,
          userId: user.id
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to process LinkedIn profile')
      }

      // Update user profile with LinkedIn URL
      await updateProfile(user.id, { 
        linkedin_url: linkedinUrl,
        updated_at: new Date().toISOString()
      })
      
      // Refresh the user profile data
      await refreshProfile()
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error processing LinkedIn URL:', error)
      setError(error instanceof Error ? error.message : 'Failed to process LinkedIn profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <MainLayout>
      <div className="relative isolate min-h-screen bg-white">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
              Let's set up your profile
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Upload your resume or connect your LinkedIn profile to get started.
            </p>
          </div>

          <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200">
              <button
                className={`flex-1 py-4 px-6 text-center font-medium ${
                  activeTab === 'resume'
                    ? 'text-black border-b-2 border-black'
                    : 'text-gray-500 hover:text-black'
                }`}
                onClick={() => setActiveTab('resume')}
              >
                Upload Resume/CV
              </button>
              <button
                className={`flex-1 py-4 px-6 text-center font-medium ${
                  activeTab === 'linkedin'
                    ? 'text-black border-b-2 border-black'
                    : 'text-gray-500 hover:text-black'
                }`}
                onClick={() => setActiveTab('linkedin')}
              >
                LinkedIn Profile
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {activeTab === 'resume' ? (
                <div className="space-y-6">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-12 cursor-pointer hover:border-gray-400 transition-colors"
                    onClick={() => fileInputRef.current?.click()}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mt-4 text-sm text-gray-600">
                      {file ? file.name : 'Click to upload or drag and drop'}
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                      PDF or Word document (max 5MB)
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileChange}
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 text-center">{error}</p>
                  )}

                  <button
                    type="button"
                    className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
                      file && !isUploading
                        ? 'bg-black hover:bg-gray-800'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                    disabled={!file || isUploading}
                    onClick={handleResumeUpload}
                  >
                    {isUploading ? 'Uploading...' : 'Upload Resume'}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label htmlFor="linkedin-url" className="block text-sm font-medium text-gray-700">
                      LinkedIn Profile URL
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="linkedin-url"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                        placeholder="https://www.linkedin.com/in/yourprofile"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Enter your LinkedIn profile URL to import your professional information.
                    </p>
                  </div>

                  {error && (
                    <p className="text-sm text-red-600">{error}</p>
                  )}

                  <button
                    type="button"
                    className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
                      linkedinUrl && !isSubmitting
                        ? 'bg-black hover:bg-gray-800'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                    disabled={!linkedinUrl || isSubmitting}
                    onClick={handleLinkedinSubmit}
                  >
                    {isSubmitting ? 'Processing...' : 'Connect LinkedIn'}
                  </button>
                </div>
              )}
            </div>

            <div className="px-8 pb-8 text-center">
              <p className="text-sm text-gray-500">
                We'll use this information to create your personalized portfolio and resume.
                <br />
                Your data is secure and will only be used to enhance your experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
