import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { supabaseAdmin } from '@/lib/supabaseAdminClient';

const execAsync = promisify(exec);

console.log('Loaded env:', {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '[set]' : '[not set]'
});

export async function POST(req: Request) {
  console.log('🚀 Starting resume generation process...');
  
  try {
    const { fileUrl, jobTitle, jobDescription, userId, prompt, userInfo } = await req.json();
    console.log('📥 API Input:', { fileUrl, jobTitle, jobDescription, userId, prompt, userInfo });

    // Validate required fields
    if (!userId) {
      console.error('❌ Missing required field: userId');
      return NextResponse.json(
        { error: 'Missing required field: userId' },
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


    // Determine which flow we're in
    const isFileFlow = !!fileUrl;
    const isPromptFlow = !!prompt;

    if (!isFileFlow && !isPromptFlow) {
      return NextResponse.json(
        { error: "Either fileUrl or prompt must be provided" },
        { status: 400 }
      );
    }

    // Validate required fields based on flow
    if (isFileFlow) {
      if (!jobTitle || !jobDescription) {
        return NextResponse.json(
          { error: "jobTitle and jobDescription are required for file-based generation" },
          { status: 400 }
        );
      }
    } else {
      if (!userInfo?.name || !userInfo?.email) {
        return NextResponse.json(
          { error: "userInfo.name and userInfo.email are required for prompt-based generation" },
          { status: 400 }
        );
      }
    }

    // Construct command based on flow
    const command = isFileFlow
      ? `python3 scripts/generate_resume_from_file.py --file "${fileUrl}" --job_title "${jobTitle}" --job_description "${jobDescription}"`
      : `python3 scripts/generate_resume_from_file.py --prompt "${prompt}" --user_name "${userInfo.name}" --user_email "${userInfo.email}"`;

    console.log('Executing command:', command);

    // Run the Python script with appropriate arguments
    const scriptPath = path.join(process.cwd(), 'scripts', 'generate_resume_from_file.py');
    console.log('🐍 Running Python script:', scriptPath);
    let stdout, stderr;
    try {
      console.log('Running command:', command);
      ({ stdout, stderr } = await execAsync(command));
      console.log('📝 Generation script output:', stdout);
      if (stderr) {
        console.warn('⚠️ Script warnings:', stderr);
      }
    } catch (err) {
      console.error('❌ Error running generation script:', err);
      return NextResponse.json(
        { error: 'Error running generation script', details: String(err) },
        { status: 500 }
      );
    }

    // Parse the JSON output from the script
    let resumeData;
    try {
      resumeData = JSON.parse(stdout);
      console.log('✅ Successfully parsed resumeData:', resumeData);
    } catch (err) {
      console.error('❌ Error parsing generation output:', err, 'Raw output:', stdout);
      return NextResponse.json(
        { error: 'Error parsing generation output', details: String(err), raw: stdout },
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
          source_type: isFileFlow ? 'file' : 'prompt',
          file_url: fileUrl || null,
          original_filename: fileUrl ? path.basename(fileUrl) : null,
          title: isFileFlow
            ? `Resume for ${userId}${jobTitle ? ' - ' + jobTitle : ''}`
            : `Resume for ${userInfo.name}${jobTitle ? ' - ' + jobTitle : ''}`
        })
        .select('*')
        .single());
      
        console.log('Resume insert result:', { resume, dbError });
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

    return NextResponse.json({ resumeId: resume.id });
  } catch (error) {
    console.error('❌ Unhandled error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
} 