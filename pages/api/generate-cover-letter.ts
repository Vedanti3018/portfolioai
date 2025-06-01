import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { supabaseAdmin } from '../../lib/supabaseAdminClient';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('[CoverLetterAPI] Handler started');
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let resumeTextToUse = '';
  let resumeSource = '';
  let jobDescription = '';
  let resumeFilePath = '';
  let resumeId = null;
  let uploadedFileUrl = '';

  try {
    // Parse form data
    const form = new IncomingForm({ multiples: false, keepExtensions: true });
    const { fields, files } = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });
    console.log('[CoverLetterAPI] Form parsed:', { fields, files });
    jobDescription = Array.isArray(fields.jobDescription) ? fields.jobDescription[0] : fields.jobDescription;
    const userId = Array.isArray(fields.userId) ? fields.userId[0] : fields.userId;
    const fullName = Array.isArray(fields.fullName) ? fields.fullName[0] : fields.fullName;
    const email = Array.isArray(fields.email) ? fields.email[0] : fields.email;
    const address = Array.isArray(fields.address) ? fields.address[0] : fields.address;
    const phone = Array.isArray(fields.phone) ? fields.phone[0] : fields.phone;
    const date = Array.isArray(fields.date) ? fields.date[0] : fields.date;
    const hiringManager = Array.isArray(fields.hiringManager) ? fields.hiringManager[0] : fields.hiringManager;
    const hiringTitle = Array.isArray(fields.hiringTitle) ? fields.hiringTitle[0] : fields.hiringTitle;
    const company = Array.isArray(fields.company) ? fields.company[0] : fields.company;
    const companyAddress = Array.isArray(fields.companyAddress) ? fields.companyAddress[0] : fields.companyAddress;
    console.log('[CoverLetterAPI] Extracted userId:', userId);
    if (!userId) {
      console.error('[CoverLetterAPI] No userId provided in form data');
      return res.status(400).json({ error: 'User ID is required' });
    }
    const fileObj = Array.isArray(files.resumeFile) ? files.resumeFile[0] : files.resumeFile;
    resumeFilePath = fileObj.filepath || fileObj.path;
    resumeSource = 'upload:file';
    const fileName = path.basename(resumeFilePath);
    console.log('[CoverLetterAPI] File path:', resumeFilePath);
    // Upload to Supabase Storage
    const fileBuffer = fs.readFileSync(resumeFilePath);
    const { data: storageData, error: storageError } = await supabaseAdmin.storage
      .from('resumes')
      .upload(`uploads/${Date.now()}-${fileName}`, fileBuffer, { upsert: true });
    if (storageError) {
      console.error('[CoverLetterAPI] Storage upload error:', storageError);
      return res.status(500).json({ error: 'Failed to upload file to storage', details: storageError });
    }
    uploadedFileUrl = storageData?.path || '';
    console.log('[CoverLetterAPI] Uploaded file to storage:', uploadedFileUrl);
    // --- Call Python script to generate cover letter ---
    const pythonPath = path.join(process.cwd(), 'venv', 'bin', 'python');
    const pythonArgs = [
      pythonPath,
      'scripts/generate_cover_letter.py',
      '--resume_file', resumeFilePath,
      '--job_description', jobDescription,
      '--full_name', fullName || '',
      '--email', email || '',
      '--address', address || '',
      '--phone', phone || '',
      '--date', date || '',
      '--hiring_manager', hiringManager || '',
      '--hiring_title', hiringTitle || '',
      '--company', company || '',
      '--company_address', companyAddress || ''
    ];
    console.log('[CoverLetterAPI] Spawning Python:', pythonArgs.join(' '));
    const pythonProcess = spawn(pythonPath, pythonArgs.slice(1));
    let stdout = '';
    let stderr = '';
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    const exitCode = await new Promise((resolve) => {
      pythonProcess.on('close', resolve);
    });
    // Clean up temp file
    try { fs.unlinkSync(resumeFilePath); } catch {}
    if (exitCode !== 0) {
      console.error('[CoverLetterAPI] Python script error:', stderr);
      if (stderr.includes('Unsupported file type') || stderr.includes('missing dependencies')) {
        return res.status(400).json({ error: 'The uploaded file is not a valid or supported PDF/DOCX. Please upload a valid file.' });
      }
      return res.status(500).json({ error: 'Failed to generate cover letter', details: stderr });
    }
    let coverLetter = '';
    try {
      const parsed = JSON.parse(stdout);
      coverLetter = parsed.cover_letter;
      console.log('[CoverLetterAPI] Cover letter generated');
    } catch (e) {
      console.error('[CoverLetterAPI] Failed to parse Python output:', stdout);
      return res.status(500).json({ error: 'Failed to parse cover letter output', details: stdout });
    }
    // --- Save generated cover letter to Supabase ---
    try {
      // Try to extract job_title and company from jobDescription (very basic regex, can be improved)
      let jobTitle = null;
      let company = null;
      const jobTitleMatch = jobDescription.match(/(?:Job Title|Position):?\s*([\w\s\-]+)/i);
      if (jobTitleMatch) jobTitle = jobTitleMatch[1].trim();
      const companyMatch = jobDescription.match(/(?:Company|Organization):?\s*([\w\s\-]+)/i);
      if (companyMatch) company = companyMatch[1].trim();
      const insertData = {
        user_id: userId, // This is required by the schema
        title: `Cover Letter for ${jobTitle || 'Job'}`,
        content: coverLetter,
        job_title: jobTitle,
        company: company,
        tone: null,
        job_description: jobDescription,
        resume_id: resumeId || null,
        source_type: 'upload',
        status: 'generated'
      };
      console.log('[CoverLetterAPI] Inserting into cover_letters:', insertData);
      const { data: saved, error: saveError } = await supabaseAdmin
        .from('cover_letters')
        .insert([insertData])
        .select()
        .single();
      if (saveError) {
        console.error('[CoverLetterAPI] Failed to save cover letter:', saveError);
        return res.status(500).json({ error: 'Failed to save cover letter', details: saveError });
      }
      console.log('[CoverLetterAPI] Cover letter saved:', saved);
      return res.status(200).json({
        coverLetter,
        coverLetterId: saved.id,
        createdAt: saved.created_at,
        title: saved.title,
        job_title: saved.job_title,
        company: saved.company,
        tone: saved.tone,
        job_description: saved.job_description,
        resume_id: saved.resume_id,
        source_type: saved.source_type,
        status: saved.status,
        resume_file_url: saved.resume_file_url,
        message: 'Cover letter generated and saved successfully'
      });
    } catch (err) {
      console.error('[CoverLetterAPI] Unexpected error during save:', err);
      return res.status(500).json({ error: 'Unexpected error during save', details: String(err) });
    }
  } catch (err) {
    console.error('[CoverLetterAPI] Unexpected error:', err);
    return res.status(500).json({ error: 'Unexpected error', details: String(err) });
  }
} 