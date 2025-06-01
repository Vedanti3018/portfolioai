import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { spawn } from 'child_process';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const { optimizationId } = await req.json();
    if (!optimizationId) {
      return NextResponse.json({ error: 'Missing optimizationId' }, { status: 400 });
    }

    // Fetch optimization record
    const { data: optimization, error: fetchError } = await supabase
      .from('resume_optimizations')
      .select('*')
      .eq('id', optimizationId)
      .single();
    if (fetchError || !optimization) {
      return NextResponse.json({ error: 'Optimization not found' }, { status: 404 });
    }

    // Prepare prompt for LLM
    const prompt = `
You are a professional resume writer and ATS optimization specialist.

TASK:
Given the following structured resume info, suggestions, and keyword gaps, generate a new, complete resume as a JSON object.
- If any section (projects, certifications, skills, awards, etc.) is missing or empty, INVENT plausible, relevant, and impressive content based on the job description and best practices for the target role.
- Do NOT leave any section empty. Every section must have at least one entry.
- Incorporate all suggestions and fill all keyword gaps.
- Use active, concise language.
- Output ONLY the new resume as structured JSON, no extra text or markdown.

STRUCTURED RESUME INFO:
${JSON.stringify(optimization.structured_resume, null, 2)}

SUGGESTIONS:
${JSON.stringify(optimization.suggestions, null, 2)}

KEYWORD GAPS:
${JSON.stringify(optimization.keyword_gaps, null, 2)}
`;

    // Call Python script to generate new resume
    const regenProcess = spawn('python3', [
      'scripts/regenerate_resume.py',
      '--prompt', prompt
    ]);
    let regenResult = '';
    let regenError = '';
    for await (const chunk of regenProcess.stdout) {
      regenResult += chunk;
    }
    for await (const chunk of regenProcess.stderr) {
      regenError += chunk;
    }
    const regenExitCode = await new Promise((resolve) => {
      regenProcess.on('close', resolve);
    });
    if (regenExitCode !== 0) {
      return NextResponse.json({ error: `Resume regeneration failed: ${regenError}` }, { status: 500 });
    }
    let regeneratedResume;
    try {
      regeneratedResume = JSON.parse(regenResult);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid regenerated resume format' }, { status: 500 });
    }

    // Store regenerated resume
    const { data: saved, error: saveError } = await supabase
      .from('regenerated_resumes')
      .insert({
        user_id: optimization.user_id,
        optimization_id: optimizationId,
        regenerated_resume: regeneratedResume,
        status: 'completed',
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    if (saveError) {
      return NextResponse.json({ error: 'Failed to save regenerated resume' }, { status: 500 });
    }
    return NextResponse.json(saved);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 