import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { resumeId, resumeFile, jobDescription } = await req.json();
  if (!jobDescription || (!resumeId && !resumeFile)) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  let resumeText = '';
  let resumeSource = '';

  if (resumeId) {
    // Fetch resume from Supabase (assume table 'resumes' with 'text' or 'file_url')
    const { data: resume, error } = await supabase
      .from('resumes')
      .select('text, file_url')
      .eq('id', resumeId)
      .single();
    if (error || !resume) {
      console.error('[CoverLetterAPI] Failed to fetch resume:', error);
      return NextResponse.json({ error: 'Failed to fetch resume' }, { status: 404 });
    }
    if (resume.text) {
      resumeText = resume.text;
      resumeSource = 'db:text';
    } else if (resume.file_url) {
      // TODO: Extract text from file_url (call microservice or use Node library)
      // For now, just set a placeholder
      resumeText = '[Resume text extracted from file_url]';
      resumeSource = 'db:file_url';
    } else {
      return NextResponse.json({ error: 'Resume has no text or file_url' }, { status: 400 });
    }
  } else if (resumeFile) {
    // TODO: Extract text from uploaded file (assume file URL for now)
    // You may want to call a Python microservice or use a Node library
    resumeText = '[Resume text extracted from uploaded file]';
    resumeSource = 'upload:file';
  }

  if (!resumeText) {
    return NextResponse.json({ error: 'Could not extract resume text' }, { status: 400 });
  }

  // TODO: Call GROQ API with resumeText and jobDescription
  // let coverLetter = '';

  // TODO: Save generated cover letter to Supabase
  // const { data, error } = await supabase.from('cover_letters').insert(...)

  // TODO: Return generated cover letter and metadata
  return NextResponse.json({
    message: 'Resume text extracted',
    resumeText,
    resumeSource,
    // coverLetter,
    // metadata: {...}
  });
} 