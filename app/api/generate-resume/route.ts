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

    // Validate based on generation type
    if (fileUrl) {
      // File-based enhancement flow
      if (!jobTitle || !jobDescription) {
        console.error('❌ Missing required fields for file enhancement: jobTitle or jobDescription');
        return NextResponse.json(
          { error: 'Missing required fields: jobTitle and jobDescription' },
          { status: 400 }
        );
      }
    } else if (prompt) {
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

    let extractedText: string;
    let cleanup = false;
    let filePath: string | null = null;

    if (fileUrl) {
      // Create a temporary file path
      const tempDir = path.join(process.cwd(), 'tmp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }
      filePath = path.join(tempDir, `${Date.now()}-${path.basename(fileUrl)}`);
      console.log('📁 Created temp file path:', filePath);

      // Download the file
      try {
        console.log('⬇️ Downloading file from:', fileUrl);
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const buffer = await response.arrayBuffer();
        fs.writeFileSync(filePath, Buffer.from(buffer));
        console.log('✅ File downloaded successfully to:', filePath);
      } catch (err) {
        console.error('❌ Error downloading file:', err);
        return NextResponse.json(
          { error: 'Error downloading file', details: String(err) },
          { status: 500 }
        );
      }

      // Extract text from file
      try {
        const scriptPath = path.join(process.cwd(), 'scripts', 'extract_text.py');
        console.log('🐍 Running text extraction script:', scriptPath);
        const { stdout, stderr } = await execAsync(`python ${scriptPath} --file "${filePath}"`);
        if (stderr) {
          console.warn('⚠️ Script warnings:', stderr);
        }
        extractedText = stdout.trim();
        console.log('✅ Text extraction completed successfully');
      } catch (err) {
        console.error('❌ Error extracting text:', err);
        return NextResponse.json(
          { error: 'Error extracting text', details: String(err) },
          { status: 500 }
        );
      }
    } else {
      // Use prompt as the input text
      extractedText = prompt;
      console.log('📝 Using prompt as input text');
    }

    // Instead of running Python script, call HuggingFace API
    const huggingfaceApiUrl = process.env.HUGGINGFACE_API_URL || 'https://ved3018-portfolioai.hf.space';
    console.log('🌐 Calling HuggingFace API:', huggingfaceApiUrl);
    
    try {
      const response = await fetch(`${huggingfaceApiUrl}/generate-resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: extractedText,
          userInfo: userInfo,
          userId: userId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const resumeData = await response.json();
      console.log('✅ Successfully received resume data from HuggingFace');
    } catch (err) {
      console.error('❌ Error calling HuggingFace API:', err);
      return NextResponse.json(
        { error: 'Error calling HuggingFace API', details: String(err) },
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
          target_title: jobTitle || null,
          target_description: jobDescription || null,
          source_type: fileUrl ? 'file' : 'prompt',
          file_url: fileUrl || null,
          original_filename: fileUrl ? path.basename(fileUrl) : null,
          title: fileUrl
            ? `Resume for ${userId}${jobTitle ? ' - ' + jobTitle : ''}`
            : userInfo?.name
              ? `Resume for ${userInfo.name}${prompt ? ' - ' + prompt : ''}`
              : 'AI Generated Resume'
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