'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import MainLayout from '@/components/layout/MainLayout'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleEmailSignup = async () => {
    // Basic validation
    if (password !== confirmPassword) {
      setMessage('Passwords do not match')
      return
    }
    
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    })
    setLoading(false)
    
    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Check your email for the confirmation link!')
    }
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })
    if (error) setMessage(error.message)
  }

  return (
    <MainLayout>
      <div className="relative isolate overflow-hidden min-h-screen bg-white text-black">
        <div className="mx-auto max-w-md px-6 py-24 sm:py-32">
          <div className="bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden">
            <div className="px-6 py-12">
              <div className="text-center">
                <h2 className="text-3xl font-semibold tracking-tight text-black">Create your account</h2>
                <p className="mt-2 text-sm text-black">
                  Or{' '}
                  <Link href="/login" className="underline hover:text-black">
                    sign in to your existing account
                  </Link>
                </p>
              </div>

              <button
                onClick={handleGoogleLogin}
                className="mt-6 w-full inline-flex items-center justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-black hover:bg-gray-100"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M21.35 11.1H12v2.8h5.4c-.24 1.3-1.47 3.8-5.4 3.8-3.24 0-5.9-2.67-5.9-5.95s2.66-5.95 5.9-5.95c1.84 0 3.07.78 3.77 1.45l2.58-2.5C16.44 3.2 14.35 2 12 2 6.48 2 2 6.48 2 12s4.48 10 10 10c5.7 0 9.6-3.97 9.6-9.55 0-.64-.07-1.13-.25-1.35z"
                    fill="currentColor"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-black">Or continue with</span>
                </div>
              </div>

              <div className="mt-10 space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-black">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black text-black"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-black">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black text-black"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-black">
                    Confirm Password
                  </label>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black text-black"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium bg-black text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                  onClick={handleEmailSignup}
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : 'Sign up'}
                </button>

                {message && <p className="mt-2 text-sm text-center text-red-600">{message}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
