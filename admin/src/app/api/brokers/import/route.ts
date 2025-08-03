import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function POST(req: NextRequest) {
  try {
    // Get the project root directory (admin is a subdirectory of the main project)
    const projectRoot = path.resolve(process.cwd(), '../');
    const scriptPath = path.join(projectRoot, 'scripts', 'import_brokers.py');
    
    // Check if the import script exists
    if (!fs.existsSync(scriptPath)) {
      return NextResponse.json({
        success: false,
        error: 'Import script not found',
        details: `Script path: ${scriptPath}`
      }, { status: 500 });
    }

    // Check if the Excel file exists
    const excelPath = path.join(projectRoot, 'scripts', 'data', 'ALL BROKERS NAME.xlsx');
    if (!fs.existsSync(excelPath)) {
      return NextResponse.json({
        success: false,
        error: 'Excel file not found',
        details: `Excel file path: ${excelPath}`
      }, { status: 400 });
    }

    // Execute the Python import script
    const result = await executeImportScript(scriptPath, projectRoot);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Broker import completed successfully',
        details: result.output,
        stats: result.stats
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Import script failed',
        details: result.error
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in broker import API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function executeImportScript(scriptPath: string, workingDir: string): Promise<{
  success: boolean;
  output?: string;
  error?: string;
  stats?: {
    imported: number;
    skipped: number;
    withCodes: number;
    withoutCodes: number;
  };
}> {
  return new Promise((resolve) => {
    const python = spawn('python', [scriptPath], {
      cwd: workingDir,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    python.on('close', (code) => {
      if (code === 0) {
        // Parse the output to extract statistics
        const stats = parseImportStats(stdout);
        
        resolve({
          success: true,
          output: stdout,
          stats
        });
      } else {
        resolve({
          success: false,
          error: stderr || stdout || `Process exited with code ${code}`
        });
      }
    });

    python.on('error', (error) => {
      resolve({
        success: false,
        error: `Failed to start Python process: ${error.message}`
      });
    });
  });
}

function parseImportStats(output: string): {
  imported: number;
  skipped: number;
  withCodes: number;
  withoutCodes: number;
} {
  const stats = {
    imported: 0,
    skipped: 0,
    withCodes: 0,
    withoutCodes: 0
  };

  try {
    // Extract statistics from the log output
    const lines = output.split('\n');
    
    for (const line of lines) {
      // Look for patterns like "Import completed: 94 imported, 0 skipped"
      const importMatch = line.match(/Import completed: (\d+) imported, (\d+) skipped/);
      if (importMatch) {
        stats.imported = parseInt(importMatch[1]);
        stats.skipped = parseInt(importMatch[2]);
      }
      
      // Look for patterns like "Brokers with codes: 74"
      const withCodesMatch = line.match(/Brokers with codes: (\d+)/);
      if (withCodesMatch) {
        stats.withCodes = parseInt(withCodesMatch[1]);
      }
      
      // Look for patterns like "Brokers without codes: 20"
      const withoutCodesMatch = line.match(/Brokers without codes: (\d+)/);
      if (withoutCodesMatch) {
        stats.withoutCodes = parseInt(withoutCodesMatch[1]);
      }
    }
  } catch (error) {
    console.error('Error parsing import stats:', error);
  }

  return stats;
}

export async function GET(req: NextRequest) {
  try {
    // Get the project root directory
    const projectRoot = path.resolve(process.cwd(), '../');
    const excelPath = path.join(projectRoot, 'scripts', 'data', 'ALL BROKERS NAME.xlsx');
    const scriptPath = path.join(projectRoot, 'scripts', 'import_brokers.py');
    
    // Check file availability
    const excelExists = fs.existsSync(excelPath);
    const scriptExists = fs.existsSync(scriptPath);
    
    return NextResponse.json({
      available: excelExists && scriptExists,
      excelFile: {
        exists: excelExists,
        path: excelPath
      },
      script: {
        exists: scriptExists,
        path: scriptPath
      }
    });
    
  } catch (error) {
    console.error('Error checking import availability:', error);
    return NextResponse.json({
      available: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
