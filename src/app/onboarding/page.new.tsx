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
  
  // Step tracking
  const [currentStep, setCurrentStep] = useState<'input' | 'review' | 'complete'>('input')
  
  // File upload states
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [resumeUploaded, setResumeUploaded] = useState(false)
  
  // LinkedIn states
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [isSubmittingLinkedin, setIsSubmittingLinkedin] = useState(false)
  const [linkedinConnected, setLinkedinConnected] = useState(false)
  
  // Error handling
  const [error, setError] = useState('')
  
  // Extracted profile data
  const [profileData, setProfileData] = useState<{
    name: string;
    skills: string[];
    experience: any[];
    education: any[];
    projects: any[];
    githubUrl: string;
    linkedinUrl: string;
  }>({ 
    name: '', 
    skills: [], 
    experience: [], 
    education: [], 
    projects: [],
    githubUrl: '',
    linkedinUrl: ''
  })
  
  // Final submission state
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

      // Get the parsed data
      const data = await response.json()
      
      // Update profile data with the parsed information
      setProfileData(prevData => ({
        ...prevData,
        name: data.fullName || '',
        skills: data.skills || [],
        experience: data.experience || [],
        education: data.education || [],
        projects: [],
        githubUrl: ''
      }))
      
      // Mark resume as uploaded
      setResumeUploaded(true)
      
      // Move to review step if LinkedIn is also connected
      if (linkedinConnected) {
        setCurrentStep('review')
      }
    } catch (error) {
      console.error('Error uploading resume:', error)
      setError(error instanceof Error ? error.message : 'Failed to upload resume')
    } finally {
      setIsUploading(false)
    }
  }

  const handleLinkedinSubmit = async () => {
    if (!linkedinUrl || !user) return

    setIsSubmittingLinkedin(true)
    setError('')

    // Basic LinkedIn URL validation
    const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+\/?$/
    if (!linkedinRegex.test(linkedinUrl)) {
      setError('Please enter a valid LinkedIn profile URL (e.g., https://www.linkedin.com/in/username)')
      setIsSubmittingLinkedin(false)
      return
    }

    try {
      // Send to your API endpoint that will handle the LinkedIn profile parsing
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

      // Get the parsed data
      const data = await response.json()
      
      // Update profile data with the LinkedIn information
      setProfileData(prevData => ({
        ...prevData,
        name: data.fullName || prevData.name,
        skills: [...new Set([...prevData.skills, ...(data.skills || [])])],
        experience: data.experience || prevData.experience,
        education: data.education || prevData.education,
        linkedinUrl: linkedinUrl
      }))
      
      // Mark LinkedIn as connected
      setLinkedinConnected(true)
      
      // Move to review step if resume is also uploaded
      if (resumeUploaded) {
        setCurrentStep('review')
      }
    } catch (error) {
      console.error('Error processing LinkedIn URL:', error)
      setError(error instanceof Error ? error.message : 'Failed to process LinkedIn profile')
    } finally {
      setIsSubmittingLinkedin(false)
    }
  }
  
  // Handle final profile submission
  const handleProfileSubmit = async () => {
    if (!user) return
    
    setIsSubmitting(true)
    setError('')
    
    try {
      // Update user profile with all the collected information
      await updateProfile(user.id, { 
        full_name: profileData.name,
        linkedin_url: profileData.linkedinUrl,
        github_url: profileData.githubUrl,
        updated_at: new Date().toISOString()
      })
      
      // Create or update resume in database if needed
      if (resumeUploaded || linkedinConnected) {
        // This would be handled by the API endpoints
      }
      
      // Refresh the user profile data
      await refreshProfile()
      
      // Mark as complete
      setCurrentStep('complete')
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (error) {
      console.error('Error saving profile:', error)
      setError(error instanceof Error ? error.message : 'Failed to save profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <MainLayout>
      <div className="relative isolate overflow-hidden min-h-screen bg-white text-black">
        <div className="mx-auto max-w-3xl px-6 py-24 sm:py-32">
          <div className="bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden">
            {/* Header */}
            <div className="px-8 pt-8 pb-4">
              <div className="text-center">
                <h2 className="text-3xl font-semibold tracking-tight text-black">Complete your profile</h2>
                <p className="mt-2 text-sm text-gray-500">
                  Upload your resume or connect your LinkedIn profile to get started
                </p>
              </div>
              
              {/* Progress indicator */}
              <div className="mt-8 relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-between text-sm font-medium">
                  <span className={`px-2 bg-white rounded-full ${currentStep === 'input' ? 'text-primary-600 ring-2 ring-primary-600' : 'text-gray-500'}`}>
                    1. Input
                  </span>
                  <span className={`px-2 bg-white rounded-full ${currentStep === 'review' ? 'text-primary-600 ring-2 ring-primary-600' : 'text-gray-500'}`}>
                    2. Review
                  </span>
                  <span className={`px-2 bg-white rounded-full ${currentStep === 'complete' ? 'text-primary-600 ring-2 ring-primary-600' : 'text-gray-500'}`}>
                    3. Complete
                  </span>
                </div>
              </div>
            </div>

            {/* Input Step */}
            {currentStep === 'input' && (
              <div className="px-8 pt-6 pb-8 space-y-10">
                {/* Resume Upload Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Upload CV/Resume</h3>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 ${resumeUploaded ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {resumeUploaded ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="mt-2 text-sm font-medium text-green-600">Resume uploaded successfully</p>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mt-4 text-sm text-gray-600">
                          {file ? file.name : 'Click to upload or drag and drop'}
                        </p>
                        <p className="mt-2 text-xs text-gray-500">
                          PDF or Word document (max 5MB)
                        </p>
                      </>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileChange}
                    />
                  </div>

                  <button
                    type="button"
                    className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
                      file && !isUploading && !resumeUploaded
                        ? 'bg-black hover:bg-gray-800'
                        : resumeUploaded
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                    disabled={(!file && !resumeUploaded) || isUploading}
                    onClick={handleResumeUpload}
                  >
                    {isUploading ? 'Uploading...' : resumeUploaded ? 'Resume Uploaded ✓' : 'Upload Resume'}
                  </button>
                </div>

                {/* LinkedIn Section */}
                <div className="space-y-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">LinkedIn Profile</h3>
                  <div>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="linkedin-url"
                        className={`block w-full rounded-md shadow-sm focus:border-black focus:ring-black sm:text-sm ${linkedinConnected ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
                        placeholder="https://www.linkedin.com/in/yourprofile"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        disabled={linkedinConnected}
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Enter your LinkedIn profile URL to import your professional information.
                    </p>
                  </div>

                  <button
                    type="button"
                    className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
                      linkedinUrl && !isSubmittingLinkedin && !linkedinConnected
                        ? 'bg-black hover:bg-gray-800'
                        : linkedinConnected
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                    disabled={(!linkedinUrl && !linkedinConnected) || isSubmittingLinkedin}
                    onClick={handleLinkedinSubmit}
                  >
                    {isSubmittingLinkedin ? 'Processing...' : linkedinConnected ? 'LinkedIn Connected ✓' : 'Connect LinkedIn'}
                  </button>
                </div>

                {/* Continue Button */}
                {(resumeUploaded || linkedinConnected) && (
                  <div className="pt-6">
                    <button
                      type="button"
                      className="w-full py-3 px-4 rounded-lg text-white font-medium bg-primary-600 hover:bg-primary-500"
                      onClick={() => setCurrentStep('review')}
                    >
                      Continue to Review
                    </button>
                  </div>
                )}

                {error && (
                  <p className="text-sm text-red-600 text-center">{error}</p>
                )}
              </div>
            )}

            {/* Review Step */}
            {currentStep === 'review' && (
              <div className="px-8 pt-6 pb-8 space-y-8">
                <h3 className="text-xl font-medium text-gray-900 text-center">Review Your Information</h3>
                
                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    />
                  </div>
                  
                  {/* Skills */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Skills</label>
                    <textarea
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                      rows={3}
                      value={profileData.skills.join(', ')}
                      onChange={(e) => setProfileData({...profileData, skills: e.target.value.split(',').map(skill => skill.trim())})}
                    />
                  </div>
                  
                  {/* Experience */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Experience</label>
                    <div className="mt-1 border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
                      {profileData.experience.length > 0 ? (
                        profileData.experience.map((exp, index) => (
                          <div key={index} className="mb-3 pb-3 border-b border-gray-200 last:border-b-0 last:mb-0 last:pb-0">
                            <p className="font-medium">{exp.title} at {exp.company}</p>
                            <p className="text-sm text-gray-600">
                              {exp.startDate} - {exp.endDate || 'Present'}
                            </p>
                            <p className="text-sm mt-1">{exp.description}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No experience data available</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Education */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Education</label>
                    <div className="mt-1 border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
                      {profileData.education.length > 0 ? (
                        profileData.education.map((edu, index) => (
                          <div key={index} className="mb-3 pb-3 border-b border-gray-200 last:border-b-0 last:mb-0 last:pb-0">
                            <p className="font-medium">{edu.degree}</p>
                            <p className="text-sm">{edu.institution}</p>
                            <p className="text-sm text-gray-600">
                              {edu.startDate} - {edu.endDate || 'Present'}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No education data available</p>
                      )}
                    </div>
                  </div>
                  
                  {/* GitHub Link */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">GitHub Profile URL (Optional)</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                      placeholder="https://github.com/yourusername"
                      value={profileData.githubUrl}
                      onChange={(e) => setProfileData({...profileData, githubUrl: e.target.value})}
                    />
                  </div>
                  
                  {/* LinkedIn URL (readonly if already connected) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">LinkedIn Profile URL</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm bg-gray-50"
                      value={profileData.linkedinUrl}
                      readOnly={linkedinConnected}
                      onChange={(e) => setProfileData({...profileData, linkedinUrl: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    className="flex-1 py-3 px-4 rounded-lg text-gray-700 font-medium border border-gray-300 hover:bg-gray-50"
                    onClick={() => setCurrentStep('input')}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="flex-1 py-3 px-4 rounded-lg text-white font-medium bg-primary-600 hover:bg-primary-500"
                    onClick={handleProfileSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
                
                {error && (
                  <p className="text-sm text-red-600 text-center">{error}</p>
                )}
              </div>
            )}

            {/* Complete Step */}
            {currentStep === 'complete' && (
              <div className="px-8 pt-6 pb-8 text-center">
                <div className="rounded-full bg-green-100 p-3 mx-auto w-16 h-16 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="mt-4 text-xl font-medium text-gray-900">Profile Complete!</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Your profile has been successfully created. You'll be redirected to your dashboard in a moment.
                </p>
              </div>
            )}

            {/* Footer */}
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
