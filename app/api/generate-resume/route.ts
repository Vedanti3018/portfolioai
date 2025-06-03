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

    if (!userId) {
      console.error('❌ Missing required field: userId');
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      );
    }

    // Determine the flow type and validate required fields
    const isFileFlow = !!fileUrl;
    const isPromptFlow = !!prompt;

    if (isFileFlow) {
      // File-based enhancement flow
      if (!jobTitle || !jobDescription) {
        console.error('❌ Missing required fields for file enhancement: jobTitle or jobDescription');
        return NextResponse.json(
          { error: 'Missing required fields: jobTitle and jobDescription' },
          { status: 400 }
        );
      }
    } else if (isPromptFlow) {
      // Prompt-based generation flow
      if (!userInfo?.name || !userInfo?.email) {
        console.error('❌ Missing required fields for prompt generation: userInfo.name or userInfo.email');
        return NextResponse.json(
          { error: 'Missing required fields: userInfo.name and userInfo.email' },
          { status: 400 }
        );
      }
    } else {
      console.error('❌ Missing required field: either fileUrl or prompt');
      return NextResponse.json(
        { error: 'Missing required field: either fileUrl or prompt' },
        { status: 400 }
      );
    }

    // Run the Python script with appropriate arguments
    const scriptPath = path.join(process.cwd(), 'scripts', 'generate_resume_from_file.py');
    console.log('🐍 Running Python script:', scriptPath);
    let stdout, stderr;
    try {
      let args;
      if (isFileFlow) {
        // File flow: use file URL and job details
        args = `--file "${fileUrl}" --job_title "${jobTitle}" --job_description "${jobDescription}"`;
      } else {
        // Prompt flow: use prompt and user info
        args = `--prompt "${prompt}" --user_name "${userInfo.name}" --user_email "${userInfo.email}"`;
      }
      
      console.log('Running command:', `python ${scriptPath} ${args}`);
      ({ stdout, stderr } = await execAsync(`python ${scriptPath} ${args}`));
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
          target_title: isFileFlow ? jobTitle : null,
          target_description: isFileFlow ? jobDescription : null,
          source_type: isFileFlow ? 'file' : 'prompt',
          file_url: fileUrl || null,
          original_filename: fileUrl ? path.basename(fileUrl) : null,
          title: isFileFlow
            ? `Resume for ${userId}${jobTitle ? ' - ' + jobTitle : ''}`
            : `Resume for ${userInfo.name}${prompt ? ' - ' + prompt.split(' ').slice(0, 5).join(' ') : ''}`
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

    return NextResponse.json({ resumeId: resume.id });
  } catch (error) {
    console.error('❌ Unhandled error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
} 