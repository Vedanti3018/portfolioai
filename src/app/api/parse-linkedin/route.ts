import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

// Function to fetch LinkedIn profile data using OAuth token
async function fetchLinkedInProfile(accessToken: string): Promise<any> {
  try {
    // Fetch basic profile information
    const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'cache-control': 'no-cache',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });
    
    if (!profileResponse.ok) {
      throw new Error(`LinkedIn API error: ${profileResponse.status}`)
    }
    
    const profileData = await profileResponse.json();
    
    // Fetch email address
    const emailResponse = await fetch('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'cache-control': 'no-cache',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });
    
    if (!emailResponse.ok) {
      throw new Error(`LinkedIn email API error: ${emailResponse.status}`)
    }
    
    const emailData = await emailResponse.json();
    const email = emailData.elements?.[0]?.['handle~']?.emailAddress || '';
    
    // Fetch positions/experience
    const positionsResponse = await fetch(
      'https://api.linkedin.com/v2/positions?q=members&projection=(elements*(title,company,timePeriod,description))', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'cache-control': 'no-cache',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      }
    );
    
    let experience = [];
    if (positionsResponse.ok) {
      const positionsData = await positionsResponse.json();
      experience = positionsData.elements?.map((position: any) => ({
        title: position.title || '',
        company: position.company?.name || '',
        startDate: position.timePeriod?.startDate ? `${position.timePeriod.startDate.year}-${String(position.timePeriod.startDate.month).padStart(2, '0')}` : '',
        endDate: position.timePeriod?.endDate ? `${position.timePeriod.endDate.year}-${String(position.timePeriod.endDate.month).padStart(2, '0')}` : null,
        description: position.description || ''
      })) || [];
    }
    
    // Format the data
    return {
      fullName: `${profileData.localizedFirstName} ${profileData.localizedLastName}`,
      headline: profileData.headline || '',
      location: profileData.location?.country?.code || '',
      email: email,
      about: profileData.summary || '',
      experience: experience,
      // Note: Education and skills require additional API calls that may need additional permissions
      education: [],
      skills: []
    };
  } catch (error) {
    console.error('Error fetching LinkedIn profile:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse the request body
    const body = await request.json()
    const { linkedinUrl, userId } = body

    if (!linkedinUrl || !userId) {
      return NextResponse.json(
        { error: 'LinkedIn URL and userId are required' },
        { status: 400 }
      )
    }

    // Verify that the authenticated user matches the requested userId
    if (session.user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the LinkedIn access token from the user's provider token
    const { data: { user } } = await supabase.auth.getUser()
    const providerToken = user?.app_metadata?.provider_token
    
    if (!providerToken) {
      // If no provider token, use a mock profile for development
      console.log('No LinkedIn provider token found, using mock data')
      
      // Mock data for development
      const mockData = {
        fullName: 'Jane Smith',
        headline: 'Senior Software Engineer | React | Node.js | AI Enthusiast',
        location: 'San Francisco, CA',
        email: user?.email || '',
        about: 'Passionate software engineer with 5+ years of experience building web applications.',
        experience: [
          {
            title: 'Senior Software Engineer',
            company: 'Tech Innovations Inc.',
            startDate: '2021-06',
            endDate: null, // Current position
            description: 'Leading frontend development team, implementing React-based solutions.'
          },
          {
            title: 'Software Engineer',
            company: 'Digital Solutions LLC',
            startDate: '2018-03',
            endDate: '2021-05',
            description: 'Developed and maintained web applications using React and Node.js.'
          }
        ],
        education: [
          {
            institution: 'University of California, Berkeley',
            degree: 'Master of Science in Computer Science',
            startDate: '2016-09',
            endDate: '2018-05'
          },
          {
            institution: 'University of Washington',
            degree: 'Bachelor of Science in Computer Science',
            startDate: '2012-09',
            endDate: '2016-05'
          }
        ],
        skills: [
          'JavaScript', 'TypeScript', 'React', 'Node.js', 'GraphQL', 
          'AWS', 'Docker', 'CI/CD', 'Agile Methodologies'
        ]
      }
      
      var profileData = mockData
    } else {
      // Use the LinkedIn API to get profile data
      profileData = await fetchLinkedInProfile(providerToken)
    }
    
    // Store the profile data in Supabase
    // First, check if a resume already exists
    const { data: existingResumes } = await supabase
      .from('resumes')
      .select('id')
      .eq('user_id', userId)
      .eq('is_primary', true)
      .limit(1)
    
    const resumeContent = {
      personal_info: {
        full_name: profileData.fullName,
        headline: profileData.headline,
        location: profileData.location,
        about: profileData.about,
        email: profileData.email
      },
      skills: profileData.skills,
      experience: profileData.experience,
      education: profileData.education
    }
    
    if (existingResumes && existingResumes.length > 0) {
      // Update existing resume
      await supabase
        .from('resumes')
        .update({
          content: resumeContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingResumes[0].id)
    } else {
      // Create new resume
      await supabase
        .from('resumes')
        .insert({
          user_id: userId,
          title: 'My LinkedIn Resume',
          content: resumeContent,
          is_primary: true
        })
    }
    
    // Update the user profile
    await supabase
      .from('profiles')
      .update({
        full_name: profileData.fullName,
        linkedin_url: linkedinUrl,
        email: profileData.email || user?.email,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
    
    return NextResponse.json({ 
      success: true,
      message: 'LinkedIn profile processed successfully' 
    })
  } catch (error) {
    console.error('Error processing LinkedIn profile:', error)
    return NextResponse.json(
      { error: 'Failed to process LinkedIn profile' },
      { status: 500 }
    )
  }
}
