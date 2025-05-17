'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'
import { useAuth } from '@/context/AuthContext'

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
  if (isAuthenticated) {
    return (
      <MainLayout>
        <div className="bg-white py-12 md:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Welcome to your Dashboard</h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                {user?.email}
              </p>
              <button
                onClick={signOut}
                className="mt-6 rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
              >
                Sign out
              </button>
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
