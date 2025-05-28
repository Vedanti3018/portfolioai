import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { supabaseAdmin } from '@/lib/supabaseAdminClient';

const execAsync = promisify(exec);

export async function POST(req: Request) {
  console.log('🚀 Starting resume generation from prompt...');
  try {
    const { prompt, jobTitle, jobDescription, userId } = await req.json();
    console.log('📥 API Input:', { prompt, jobTitle, jobDescription, userId });

    if (!prompt || !jobTitle || !jobDescription || !userId) {
      console.error('❌ Missing required fields:', { prompt, jobTitle, jobDescription, userId });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch user name and email from profiles table
    let userName = '', userEmail = '';
    try {
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('name, email')
        .eq('id', userId)
        .single();
      if (profileError) {
        console.error('❌ Error fetching user profile:', profileError);
      } else {
        userName = profile?.name || '';
        userEmail = profile?.email || '';
      }
    } catch (err) {
      console.error('❌ Exception fetching user profile:', err);
    }

    // Always construct the prompt to use the real name and email
    let finalPrompt = `Generate a sample resume for the following user:\nName: ${userName}\nEmail: ${userEmail}\n\nUse the following as context for job role, company, and skills:\n${prompt}`;

    // Run the Python script with --prompt
    const scriptPath = path.join(process.cwd(), 'scripts', 'generate_resume_from_file.py');
    console.log('🐍 Running Python script:', scriptPath);
    let stdout, stderr;
    try {
      ({ stdout, stderr } = await execAsync(
        `python ${scriptPath} --prompt "${finalPrompt.replace(/"/g, '\\"')}" --job_title "${jobTitle}" --job_description "${jobDescription}"`
      ));
      console.log('📝 Extraction script output:', stdout);
      if (stderr) {
        console.warn('⚠️ Script warnings:', stderr);
      }
    } catch (err) {
      console.error('❌ Error running extraction script:', err);
      return NextResponse.json(
        { error: 'Error running extraction script', details: String(err) },
        { status: 500 }
      );
    }

    // Parse the JSON output from the script
    let resumeData;
    try {
      resumeData = JSON.parse(stdout);
      console.log('✅ Successfully parsed resumeData:', resumeData);
    } catch (err) {
      console.error('❌ Error parsing extraction output:', err, 'Raw output:', stdout);
      return NextResponse.json(
        { error: 'Error parsing extraction output', details: String(err), raw: stdout },
        { status: 500 }
      );
    }

    // Save to Supabase
    let resume, dbError;
    try {
      console.log('💾 Saving resume to database...');
      ({ data: resume, error: dbError } = await supabaseAdmin
        .from('resumes')
        .insert({
          user_id: userId,
          content: resumeData,
          target_title: jobTitle,
          target_description: jobDescription,
          ai_prompt: prompt,
          source_type: 'prompt',
        })
        .select()
        .single());
      if (dbError) {
        console.error('❌ Database error:', dbError);
        return NextResponse.json(
          { error: 'Error saving resume', details: dbError },
          { status: 500 }
        );
      }
      console.log('✅ Resume saved successfully:', resume);
    } catch (err) {
      console.error('❌ Error inserting into database:', err);
      return NextResponse.json(
        { error: 'Error inserting into database', details: String(err) },
        { status: 500 }
      );
    }

    return NextResponse.json({ resume });
  } catch (error) {
    console.error('❌ Unhandled error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
} 