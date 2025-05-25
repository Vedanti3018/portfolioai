import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const pathname = req.nextUrl.pathname;

  // Always allow access to signup and login pages
  if (pathname === '/signup' || pathname === '/login' || pathname === '/auth-callback') {
    return res;
  }

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If not authenticated and trying to access protected route, redirect to login
  if (!session && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // If authenticated, check profile status
  if (session) {
    try {
      // First check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('hasOnboarded')
        .eq('id', session.user.id)
        .single();

      // If profile doesn't exist, create it and redirect to onboarding
      if (!profile && !profileError) {
        console.log('Creating new profile for user:', session.user.id);
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email,
            hasOnboarded: false
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating profile:', insertError);
          return NextResponse.redirect(new URL('/error', req.url));
        }

        console.log('Successfully created profile:', newProfile);
        
        // Redirect to onboarding after creating profile
        return NextResponse.redirect(new URL('/onboarding', req.url));
      }

      // Check for onboarding draft
      const { data: draft } = await supabase
        .from('onboarding_drafts')
        .select('id')
        .eq('id', session.user.id)
        .single();

      // Handle onboarding flow
      if (pathname === '/onboarding/review' && !draft) {
        return NextResponse.redirect(new URL('/onboarding', req.url));
      }

      if (pathname === '/onboarding' && profile?.hasOnboarded) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }

      if (pathname === '/dashboard' && !profile?.hasOnboarded) {
        return NextResponse.redirect(new URL('/onboarding', req.url));
      }

      // If user is on home page and is authenticated, redirect to appropriate page
      if (pathname === '/') {
        if (profile?.hasOnboarded) {
          return NextResponse.redirect(new URL('/dashboard', req.url));
        } else {
          return NextResponse.redirect(new URL('/onboarding', req.url));
        }
      }
    } catch (error) {
      console.error('Middleware error:', error);
      return NextResponse.redirect(new URL('/error', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/',
    '/dashboard',
    '/onboarding',
    '/onboarding/review',
    '/login',
    '/signup',
    '/auth-callback'
  ],
};
