import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req: request, res: response })
  
  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession()
  
  // Optional: Check if user is authenticated for protected routes
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
  
  return response
}

// Only run middleware on specific routes
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)'],
}
