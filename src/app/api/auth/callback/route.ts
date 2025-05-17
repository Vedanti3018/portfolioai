import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Database } from '@/types/supabase'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })
    await supabase.auth.exchangeCodeForSession(code)
    
    // Check if user needs to complete onboarding
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      try {
        // Check if the user has a resume or LinkedIn profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('linkedin_url')
          .eq('id', session.user.id)
          .single()
        
        const { data: resumes } = await supabase
          .from('resumes')
          .select('id')
          .eq('user_id', session.user.id)
          .limit(1)
        
        // If user has neither a LinkedIn URL nor a resume, redirect to onboarding
        if ((!profile?.linkedin_url && (!resumes || resumes.length === 0))) {
          return NextResponse.redirect(requestUrl.origin + '/onboarding')
        }
      } catch (error) {
        console.error('Error checking profile completion:', error)
        // Continue with the default redirect even if there's an error checking profile
      }
    }
  }

  // Default URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin + '/dashboard')
}
