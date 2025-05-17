import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req: request, res: response })
  
  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession()
  
  // Check if user is authenticated for protected routes
  const { data: { session } } = await supabase.auth.getSession()
  
  // Define protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/portfolio', '/resume', '/cover-letter', '/mock-interview']
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )
  
  // If accessing a protected route without being logged in, redirect to login
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }
  
  // If already logged in and trying to access login/signup, redirect to dashboard
  if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // Check if user needs to complete onboarding
  // Only check for protected routes and not for the onboarding page itself
  if (session && isProtectedRoute && !request.nextUrl.pathname.startsWith('/onboarding')) {
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
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
    } catch (error) {
      console.error('Error checking profile completion:', error)
      // Continue with the request even if there's an error checking profile
    }
  }
  
  return response
}

// Only run middleware on specific routes
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)'],
}
