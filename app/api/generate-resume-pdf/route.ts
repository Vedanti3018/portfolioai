import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export async function POST(request: NextRequest) {
  try {
    const { templateId, resumeData } = await request.json();
    const supabase = createClientComponentClient();

    // Get the user's session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Create a temporary file for the resume data
    const tempDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const tempFile = path.join(tempDir, `resume-${Date.now()}.json`);
    fs.writeFileSync(tempFile, JSON.stringify(resumeData));

    // Get the path to the Python script
    const scriptPath = path.join(process.cwd(), 'scripts', 'generate_resume_pdf.py');
    const venvPythonPath = path.join(process.cwd(), '.venv', 'bin', 'python3');

    // Spawn the Python process
    const pythonProcess = spawn(venvPythonPath, [
      scriptPath,
      '--template', templateId,
      '--data', tempFile,
      '--output', path.join(tempDir, 'output.pdf')
    ]);

    let output = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    return new Promise((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        // Clean up the temporary file
        fs.unlinkSync(tempFile);

        if (code !== 0) {
          console.error('Error generating PDF:', error);
          reject(new NextResponse('Failed to generate PDF', { status: 500 }));
          return;
        }

        // Read the generated PDF
        const pdfPath = path.join(tempDir, 'output.pdf');
        const pdfBuffer = fs.readFileSync(pdfPath);

        // Clean up the PDF file
        fs.unlinkSync(pdfPath);

        resolve(new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${resumeData.title.toLowerCase().replace(/\s+/g, '-')}.pdf"`,
          },
        }));
      });
    });
  } catch (error) {
    console.error('Error in PDF generation:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 