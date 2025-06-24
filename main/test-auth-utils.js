// Simple test to verify auth-utils module can be imported
const path = require('path');

try {
  // Test if the file exists
  const authUtilsPath = path.join(__dirname, 'src', 'lib', 'auth-utils.ts');
  const fs = require('fs');
  
  if (fs.existsSync(authUtilsPath)) {
    console.log('✅ auth-utils.ts file exists at:', authUtilsPath);
    
    // Read the file content
    const content = fs.readFileSync(authUtilsPath, 'utf8');
    
    // Check for required exports
    const hasHasTooManyAttempts = content.includes('export function hasTooManyAttempts');
    const hasRecordFailedAttempt = content.includes('export function recordFailedAttempt');
    const hasClearFailedAttempts = content.includes('export function clearFailedAttempts');
    
    console.log('✅ hasTooManyAttempts export:', hasHasTooManyAttempts);
    console.log('✅ recordFailedAttempt export:', hasRecordFailedAttempt);
    console.log('✅ clearFailedAttempts export:', hasClearFailedAttempts);
    
    if (hasHasTooManyAttempts && hasRecordFailedAttempt && hasClearFailedAttempts) {
      console.log('✅ All required exports are present');
    } else {
      console.log('❌ Some required exports are missing');
    }
  } else {
    console.log('❌ auth-utils.ts file does not exist at:', authUtilsPath);
  }
  
  // Test tsconfig.json
  const tsconfigPath = path.join(__dirname, 'tsconfig.json');
  if (fs.existsSync(tsconfigPath)) {
    console.log('✅ tsconfig.json exists');
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    
    if (tsconfig.compilerOptions && tsconfig.compilerOptions.paths && tsconfig.compilerOptions.paths['@/*']) {
      console.log('✅ Path mapping for @/* is configured:', tsconfig.compilerOptions.paths['@/*']);
    } else {
      console.log('❌ Path mapping for @/* is not configured');
    }
  } else {
    console.log('❌ tsconfig.json does not exist');
  }
  
} catch (error) {
  console.error('❌ Error during test:', error.message);
}
