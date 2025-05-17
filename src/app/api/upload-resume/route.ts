import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { PDFDocument } from 'pdf-lib';
import mammoth from 'mammoth';

// Utility to detect file type by magic number
function detectFileType(buffer: Buffer): 'pdf' | 'docx' | 'unknown' {
  if (buffer.slice(0, 4).toString('hex') === '25504446') return 'pdf'; // %PDF
  if (buffer.slice(0, 2).toString('hex') === '504b') return 'docx'; // PK (zip for docx)
  return 'unknown';
}

// Real parser for PDF/DOCX resumes
async function parseResume(fileBuffer: Buffer): Promise<any> {
  const type = detectFileType(fileBuffer);
  let text = '';
  if (type === 'pdf') {
    // Use pdfjs-dist for PDF text extraction
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.js');
    const loadingTask = pdfjsLib.getDocument({ data: fileBuffer });
    const pdf = await loadingTask.promise;
    let textContent = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      textContent += content.items.map((item: any) => item.str).join(' ') + '\n';
    }
    text = textContent;
  } else if (type === 'docx') {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    text = result.value;
  } else {
    throw new Error('Unsupported file type. Please upload PDF or DOCX.');
  }
  // Basic parsing: extract name/email by regex, rest as raw content
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.[A-Za-z]{2,}/);
  const nameLine = text.split('\n').find(line => line.trim().split(' ').length >= 2 && !line.includes('@')) || '';
  return {
    name: nameLine.trim(),
    email: emailMatch ? emailMatch[0] : '',
    experience: text,
    education: '', // Could add more parsing here
    raw: text
  };
}

export async function POST(req: NextRequest) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const formData = await req.formData();
  const file = formData.get('file') as File;
  const userId = formData.get('user_id') as string;
  if (!file || !userId) {
    return NextResponse.json({ error: 'Missing file or user_id' }, { status: 400 });
  }
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const parsed = await parseResume(buffer);

  // Save to Supabase resumes table
  const { data, error } = await supabase.from('resumes').insert([
    {
      user_id: userId,
      title: 'Uploaded Resume',
      content: parsed,
      is_primary: true,
    },
  ]);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, parsed, data });
}
