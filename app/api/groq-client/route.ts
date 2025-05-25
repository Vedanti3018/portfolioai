import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const { resumeUrl } = await request.json();

    if (!resumeUrl) {
      return NextResponse.json(
        { error: 'No resume URL provided' },
        { status: 400 }
      );
    }

    // 🐍 Use Python script for both PDF extraction and Groq processing
    const { stdout, stderr } = await execAsync(`python3 scripts/groq_client.py "${resumeUrl}"`);
    
    if (stderr) {
      console.error('Python script error:', stderr);
      throw new Error('Failed to process resume');
    }

    const result = JSON.parse(stdout);
    if (!result.success) {
      throw new Error(result.error || 'Failed to process resume');
    }

    return NextResponse.json(result.data);

  } catch (error) {
    console.error('❌ Error in Groq client:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process resume' },
      { status: 500 }
    );
  }
}
