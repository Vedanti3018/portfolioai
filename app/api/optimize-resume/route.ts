import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  console.log('Starting resume optimization request');
  
  try {
    const formData = await req.formData();
    const resumeFile = formData.get('resume') as File;
    const jobDescription = formData.get('jobDescription') as string;
    const userId = formData.get('userId') as string;

    if (!resumeFile || !jobDescription || !userId) {
      console.error('Missing required fields:', { 
        hasResume: !!resumeFile, 
        hasJobDescription: !!jobDescription, 
        hasUserId: !!userId 
      });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check for existing optimization
    const { data: existingOptimization } = await supabase
      .from('resume_optimizations')
      .select('*')
      .eq('user_id', userId)
      .eq('job_description', jobDescription)
      .single();

    if (existingOptimization) {
      console.log('Found existing optimization, returning cached result');
      return NextResponse.json(existingOptimization);
    }

    // Upload resume to Supabase Storage
    const resumeBuffer = await resumeFile.arrayBuffer();
    const resumePath = `resumes/${userId}/${uuidv4()}.pdf`;
    
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('resumes')
      .upload(resumePath, resumeBuffer, {
        contentType: resumeFile.type,
        upsert: true
      });

    if (uploadError) {
      console.error('Failed to upload resume:', uploadError);
      throw uploadError;
    }

    // Get the public URL of the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(resumePath);

    // LOG: Arguments to be passed to Python script
    console.log('Calling optimize_resume.py with arguments:', {
      url: publicUrl,
      jobDescription
    });

    // Call Python script for extraction and optimization in one step
    const optimizeProcess = spawn('python3', [
      'scripts/optimize_resume.py',
      '--url', publicUrl,
      '--job_description', jobDescription
    ]);

    let optimizationResult = '';
    let optimizeError = '';

    for await (const chunk of optimizeProcess.stdout) {
      optimizationResult += chunk;
    }

    for await (const chunk of optimizeProcess.stderr) {
      optimizeError += chunk;
    }

    const optimizeExitCode = await new Promise((resolve) => {
      optimizeProcess.on('close', resolve);
    });

    // LOG: Output from Python script
    console.log('optimize_resume.py stdout:', optimizationResult);
    console.log('optimize_resume.py stderr:', optimizeError);
    console.log('optimize_resume.py exit code:', optimizeExitCode);

    if (optimizeExitCode !== 0) {
      console.error('Resume optimization failed:', optimizeError);
      throw new Error(`Resume optimization failed: ${optimizeError}`);
    }

    // Parse the optimization result
    let optimization;
    try {
      // Defensive: extract first JSON object from output
      const match = optimizationResult.match(/{[\s\S]*}/);
      if (!match) {
        console.error('No JSON object found in optimization result:', optimizationResult);
        throw new Error('Invalid optimization result format');
      }
      optimization = JSON.parse(match[0]);
    } catch (e) {
      console.error('Failed to parse optimization result:', e, optimizationResult);
      throw new Error('Invalid optimization result format');
    }

    // Save optimization result to database
    const { data: savedOptimization, error: saveError } = await supabase
      .from('resume_optimizations')
      .insert({
        user_id: userId,
        job_description: jobDescription,
        score: optimization.score,
        keyword_gaps: optimization.keyword_gaps,
        suggestions: optimization.suggestions,
        status: 'completed',
        resume_text: optimization.resume_text || '',
        structured_resume: optimization.structured_resume || null
      })
      .select()
      .single();

    if (saveError) {
      console.error('Failed to save optimization:', saveError);
      throw saveError;
    }

    console.log('Successfully completed resume optimization');
    // Only return selected fields for the results page
    return NextResponse.json({
      score: savedOptimization.score,
      keyword_gaps: savedOptimization.keyword_gaps,
      suggestions: savedOptimization.suggestions,
      // Note: For the edit/optimize page, fetch the full record by ID
      optimizationId: savedOptimization.id
    });

  } catch (error) {
    console.error('Resume optimization error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
} 