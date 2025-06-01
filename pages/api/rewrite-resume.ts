import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabaseAdminClient';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { resumeText, suggestions, keywordGaps, optimizationId } = req.body;
    if (!resumeText || !optimizationId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // Call Python script to rewrite resume
    const pythonPath = path.join(process.cwd(), 'venv', 'bin', 'python');
    const scriptPath = 'scripts/rewrite_resume.py';
    const pythonArgs = [
      pythonPath,
      scriptPath,
      '--resume_text', resumeText,
      '--suggestions', suggestions,
      '--keyword_gaps', Array.isArray(keywordGaps) ? keywordGaps.join(',') : keywordGaps
    ];
    console.log('[RewriteAPI] Spawning Python:', pythonArgs.join(' '));
    const pythonProcess = spawn(pythonPath, pythonArgs.slice(1));
    let stdout = '';
    let stderr = '';
    pythonProcess.stdout.on('data', (data) => { stdout += data.toString(); });
    pythonProcess.stderr.on('data', (data) => { stderr += data.toString(); });
    const exitCode = await new Promise((resolve) => { pythonProcess.on('close', resolve); });
    if (exitCode !== 0) {
      console.error('[RewriteAPI] Python script error:', stderr);
      return res.status(500).json({ error: 'Failed to rewrite resume', details: stderr });
    }
    let rewrittenResume = stdout.trim();
    // Save rewritten resume to Supabase Storage
    const fileName = `rewritten-resume-${optimizationId}.txt`;
    const fileBuffer = Buffer.from(rewrittenResume, 'utf-8');
    const { data: storageData, error: storageError } = await supabaseAdmin.storage
      .from('resumes')
      .upload(`rewritten/${fileName}`, fileBuffer, { upsert: true });
    if (storageError) {
      console.error('[RewriteAPI] Storage upload error:', storageError);
      return res.status(500).json({ error: 'Failed to upload rewritten resume', details: storageError });
    }
    // Update DB with file path
    const { error: dbError } = await supabaseAdmin
      .from('resume_optimizations')
      .update({ rewritten_resume_file: storageData?.path })
      .eq('id', optimizationId);
    if (dbError) {
      console.error('[RewriteAPI] DB update error:', dbError);
      return res.status(500).json({ error: 'Failed to update optimization record', details: dbError });
    }
    return res.status(200).json({ rewrittenResume, filePath: storageData?.path });
  } catch (err) {
    console.error('[RewriteAPI] Unexpected error:', err);
    return res.status(500).json({ error: 'Unexpected error', details: String(err) });
  }
} 