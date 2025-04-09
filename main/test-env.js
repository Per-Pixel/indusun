// Simple script to test environment variables
console.log('Testing environment variables:');

// Check raw environment variables (with quotes if present)
console.log('\nRaw environment variable check:');
console.log('GOOGLE_CLIENT_ID raw:', process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET raw:', process.env.GOOGLE_CLIENT_SECRET);
console.log('FACEBOOK_CLIENT_ID raw:', process.env.FACEBOOK_CLIENT_ID);
console.log('FACEBOOK_CLIENT_SECRET raw:', process.env.FACEBOOK_CLIENT_SECRET);
console.log('JWT_SECRET raw:', process.env.JWT_SECRET ? 'Set (not showing for security)' : 'Not set');
console.log('NEXT_PUBLIC_APP_URL raw:', process.env.NEXT_PUBLIC_APP_URL);

// Check if variables are set
console.log('\nEnvironment variable presence check:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✓ Set' : '✗ Missing');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✓ Set' : '✗ Missing');
console.log('FACEBOOK_CLIENT_ID:', process.env.FACEBOOK_CLIENT_ID ? '✓ Set' : '✗ Missing');
console.log('FACEBOOK_CLIENT_SECRET:', process.env.FACEBOOK_CLIENT_SECRET ? '✓ Set' : '✗ Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✓ Set' : '✗ Missing');
console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL ? '✓ Set' : '✗ Missing');

// Check if variables are properly formatted
console.log('\nFormat check:');
if (process.env.GOOGLE_CLIENT_ID) {
  console.log('GOOGLE_CLIENT_ID format check:', 
    process.env.GOOGLE_CLIENT_ID.includes('.apps.googleusercontent.com') ? '✓ Valid format' : '✗ Invalid format');
  // Check if it contains quotes
  console.log('GOOGLE_CLIENT_ID quotes check:', 
    process.env.GOOGLE_CLIENT_ID.includes('"') ? '✗ Contains quotes (remove them)' : '✓ No quotes');
}

if (process.env.NEXT_PUBLIC_APP_URL) {
  console.log('NEXT_PUBLIC_APP_URL format check:', 
    process.env.NEXT_PUBLIC_APP_URL.startsWith('http') ? '✓ Valid format' : '✗ Invalid format');
  // Check if it contains quotes
  console.log('NEXT_PUBLIC_APP_URL quotes check:', 
    process.env.NEXT_PUBLIC_APP_URL.includes('"') ? '✗ Contains quotes (remove them)' : '✓ No quotes');
}

// Print callback URLs for verification
console.log('\nCallback URLs (should match exactly what you configured in Google/Facebook):');
console.log('Google callback:', `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`);
console.log('Facebook callback:', `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/facebook/callback`);
