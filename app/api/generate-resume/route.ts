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
    const { fileUrl, jobTitle, jobDescription, userId } = await req.json();
    console.log('📥 API Input:', { fileUrl, jobTitle, jobDescription, userId });

    if (!fileUrl || !jobTitle || !jobDescription || !userId) {
      console.error('❌ Missing required fields:', { fileUrl, jobTitle, jobDescription, userId });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create a temporary file path
    const tempDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    const tempFilePath = path.join(tempDir, `${Date.now()}-${path.basename(fileUrl)}`);
    console.log('📁 Created temp file path:', tempFilePath);

    // Download the file
    try {
      console.log('⬇️ Downloading file from:', fileUrl);
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(tempFilePath, Buffer.from(buffer));
      console.log('✅ File downloaded successfully to:', tempFilePath);
    } catch (err) {
      console.error('❌ Error downloading file:', err);
      return NextResponse.json(
        { error: 'Error downloading file', details: String(err) },
        { status: 500 }
      );
    }

    // Run the Python script
    const scriptPath = path.join(process.cwd(), 'scripts', 'generate_resume_from_file.py');
    console.log('🐍 Running Python script:', scriptPath);
    let stdout, stderr;
    try {
      ({ stdout, stderr } = await execAsync(
        `python ${scriptPath} --file "${tempFilePath}" --job_title "${jobTitle}" --job_description "${jobDescription}"`
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

    // Clean up the temporary file
    try {
      fs.unlinkSync(tempFilePath);
      console.log('🧹 Cleaned up temp file:', tempFilePath);
    } catch (err) {
      console.error('⚠️ Error cleaning up temp file:', err);
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
          source_type: 'file',
          file_url: fileUrl,
          original_filename: path.basename(fileUrl)
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