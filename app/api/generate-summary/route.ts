import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: Request) {
  try {
    const portfolioData = await request.json();
    console.log('Received portfolioData:', JSON.stringify(portfolioData));

    // Determine the path to the Python script and virtual environment
    const scriptPath = path.join(process.cwd(), 'scripts', 'generate_summary.py');
    const venvPythonPath = path.join(process.cwd(), '.venv', 'bin', 'python3');
    console.log('Python script path:', scriptPath);
    console.log('Virtual environment Python path:', venvPythonPath);

    // Spawn the Python process using the virtual environment's Python
    const pythonProcess = spawn(venvPythonPath, [scriptPath]);
    console.log('Spawned Python process from virtual environment');

    let scriptOutput = '';
    let scriptError = '';

    // Capture stdout from the Python script
    pythonProcess.stdout.on('data', (data) => {
      scriptOutput += data.toString();
      console.log('Python stdout:', data.toString());
    });

    // Capture stderr from the Python script
    pythonProcess.stderr.on('data', (data) => {
      scriptError += data.toString();
      console.error('Python stderr:', data.toString());
    });

    // Write portfolio data to Python script's stdin
    pythonProcess.stdin.write(JSON.stringify(portfolioData));
    pythonProcess.stdin.end(); // Signal end of input
    console.log('Sent data to python stdin');

    // Handle process exit
    const exitCode = await new Promise((resolve) => {
      pythonProcess.on('close', resolve);
      // Consider handling 'error' event for spawn failures if necessary
    });
    console.log('Python process exited with code:', exitCode);

    if (exitCode !== 0) {
      console.error('Python script exited with code', exitCode);
      console.error('Script Output:', scriptOutput);
      console.error('Script Error:', scriptError);
      return NextResponse.json({ error: `Python script failed with exit code ${exitCode}`, details: scriptError || scriptOutput }, { status: 500 });
    }

    // Parse the JSON output from the Python script
    try {
        const result = JSON.parse(scriptOutput);
        console.log('Parsed result from python:', result);
        // Check if the expected 'summary' key exists
        if (typeof result.summary === 'string') {
            return NextResponse.json({ summary: result.summary });
        } else {
             console.error('Python script did not return a valid summary in JSON output:', scriptOutput);
             return NextResponse.json({ error: 'Invalid output from summary generation script' }, { status: 500 });
        }
    } catch (parseError) {
         console.error('Failed to parse JSON output from Python script:', parseError);
         console.error('Raw script output:', scriptOutput);
         return NextResponse.json({ error: 'Failed to parse script output', details: scriptOutput }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in generate-summary API route:', error);
    return NextResponse.json({ error: 'Internal server error during summary generation' }, { status: 500 });
  }
} 