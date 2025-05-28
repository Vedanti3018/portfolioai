import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: Request): Promise<Response> {
  try {
    const data = await request.json();
    const { resumeData, jobTitle, industry } = data;

    // Get the path to the Python script
    const scriptPath = path.join(process.cwd(), 'scripts', 'optimize_resume.py');

    // Create a temporary file to store the resume data
    const tempDataPath = path.join(process.cwd(), 'temp', 'resume_data.json');
    require('fs').writeFileSync(tempDataPath, JSON.stringify(resumeData));

    // Spawn Python process
    const pythonProcess = spawn('python3', [
      scriptPath,
      '--data', tempDataPath,
      '--job-title', jobTitle,
      '--industry', industry
    ]);

    let output = '';
    let error = '';

    // Collect output
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    // Collect errors
    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    // Handle process completion
    return await new Promise<Response>((resolve) => {
      pythonProcess.on('close', (code) => {
        // Clean up temporary file
        try {
          require('fs').unlinkSync(tempDataPath);
        } catch (err) {
          console.error('Error cleaning up temp file:', err);
        }

        if (code !== 0) {
          console.error('Python process error:', error);
          resolve(NextResponse.json(
            { error: 'Failed to optimize resume' },
            { status: 500 }
          ));
          return;
        }

        try {
          const result = JSON.parse(output);
          resolve(NextResponse.json(result));
        } catch (err) {
          console.error('Error parsing Python output:', err);
          resolve(NextResponse.json(
            { error: 'Invalid optimization result' },
            { status: 500 }
          ));
        }
      });
    });
  } catch (error) {
    console.error('Error in optimize-resume route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 