// app/api/onboarding/parse-cv/route.ts

import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    console.log('Starting resume parsing process...');
    
    // 🛡️ Auth check
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      console.error('No session found in API route');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('Session found in API route, user ID:', session.user.id);

    // 📥 Get uploaded file
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileUrl = formData.get('file_url') as string;
    const resumeId = formData.get('resume_id') as string;

    if (!file) {
      console.error('No file provided in request');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    console.log('File received:', file.name);

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
    console.log('Uploading file to Supabase storage:', fileName);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading file to Supabase:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }
    console.log('File uploaded successfully to Supabase storage');

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(fileName);
    console.log('File public URL:', publicUrl);

    // Create or update onboarding draft
    console.log('Creating/updating onboarding draft...');
    const { data: draftData, error: draftError } = await supabase
      .from('onboarding_drafts')
      .upsert({
        id: session.user.id,
        resume_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (draftError) {
      console.error('Error creating/updating draft:', draftError);
      return NextResponse.json(
        { error: 'Failed to save resume URL' },
        { status: 500 }
      );
    }
    console.log('Onboarding draft created/updated successfully');

    // Call Hugging Face API for resume parsing
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.HF_API_URL;
    console.log('Calling Hugging Face API to parse resume...');
    const response = await fetch(`${apiUrl}/extract-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        file_path: publicUrl,
        file_url: publicUrl 
      })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Hugging Face API error:', errorData);
      return NextResponse.json(
        { error: errorData.error || 'Failed to process resume with Hugging Face API' },
        { status: 500 }
      );
    }
    const extractedInfo = await response.json();
    console.log('Resume parsed successfully by Hugging Face API');

    // 💾 Update onboarding_drafts with extracted info
    console.log('Updating onboarding draft with parsed data...');
    const { error: updateError } = await supabase
      .from('onboarding_drafts')
      .update({
        parsed_data: extractedInfo,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.user.id);

    if (updateError) {
      console.error('Error updating draft with parsed data:', updateError);
      return NextResponse.json(
        { error: 'Failed to update resume data' },
        { status: 500 }
      );
    }
    console.log('Onboarding draft updated with parsed data successfully');

    console.log('Sending success response to client...');
    return NextResponse.json({ success: true, structured: extractedInfo });

  } catch (error) {
    console.error('❌ Error in parse-cv API route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process resume' },
      { status: 500 }
    );
  }
}
