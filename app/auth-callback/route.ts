import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  // If no code is present, redirect to login
  if (!code) {
    return NextResponse.redirect(new URL('/login', requestUrl.origin));
  }

  // Create the Supabase client using cookies. This must be done here
  // for the client to correctly handle the auth code exchange.
  const supabase = createRouteHandlerClient({ cookies });

  // Exchange the code for a session
  const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

  // Handle session errors
  if (sessionError || !session) {
    console.error('Session error:', sessionError);
    return NextResponse.redirect(new URL('/login', requestUrl.origin));
  }

  const userId = session.user.id;
  const email = session.user.email;
  const fullName = session.user.user_metadata?.full_name || email;

  try {
    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', userId)
      .single();

    // If profile doesn't exist or there's an error fetching, insert it
    if (profileError || !profile) {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email,
          full_name: fullName,
          onboarding_completed: false,
        });

      if (insertError) {
        console.error('Error creating profile:', insertError);
        // Redirect to an error page or login on insertion failure
        return NextResponse.redirect(new URL('/login', requestUrl.origin)); // Or '/error'
      }

      // New users go to onboarding
      return NextResponse.redirect(new URL('/onboarding', requestUrl.origin));
    }

    // Existing users redirect based on onboarding status
    return NextResponse.redirect(
      new URL(profile.onboarding_completed ? '/dashboard' : '/onboarding', requestUrl.origin)
    );

  } catch (error) {
    console.error('Auth callback error during profile handling:', error);
    // Redirect to login on unexpected errors after session is obtained
    return NextResponse.redirect(new URL('/login', requestUrl.origin));
  }
}
