const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function testImportScript() {
  console.log('Testing broker import script directly...');
  
  // Get the project root directory
  const projectRoot = path.resolve(__dirname, '../');
  const scriptPath = path.join(projectRoot, 'scripts', 'import_brokers.py');
  const excelPath = path.join(projectRoot, 'scripts', 'data', 'ALL BROKERS NAME.xlsx');
  
  console.log('Project root:', projectRoot);
  console.log('Script path:', scriptPath);
  console.log('Excel path:', excelPath);
  
  // Check if files exist
  console.log('Script exists:', fs.existsSync(scriptPath));
  console.log('Excel exists:', fs.existsSync(excelPath));
  
  if (!fs.existsSync(scriptPath)) {
    console.error('Import script not found!');
    return;
  }
  
  if (!fs.existsSync(excelPath)) {
    console.error('Excel file not found!');
    return;
  }
  
  // Execute the Python import script
  console.log('\nExecuting import script...');
  
  const python = spawn('python', [scriptPath], {
    cwd: projectRoot,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let stdout = '';
  let stderr = '';

  python.stdout.on('data', (data) => {
    const output = data.toString();
    stdout += output;
    console.log('STDOUT:', output);
  });

  python.stderr.on('data', (data) => {
    const error = data.toString();
    stderr += error;
    console.error('STDERR:', error);
  });

  python.on('close', (code) => {
    console.log(`\nProcess exited with code: ${code}`);
    
    if (code === 0) {
      console.log('✅ Import successful!');
      
      // Parse statistics
      const stats = parseImportStats(stdout);
      console.log('Import statistics:', stats);
    } else {
      console.log('❌ Import failed!');
      console.log('Error output:', stderr || stdout);
    }
  });

  python.on('error', (error) => {
    console.error('Failed to start Python process:', error.message);
  });
}

function parseImportStats(output) {
  const stats = {
    imported: 0,
    skipped: 0,
    withCodes: 0,
    withoutCodes: 0
  };

  try {
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

// Run the test
testImportScript().catch(console.error);
