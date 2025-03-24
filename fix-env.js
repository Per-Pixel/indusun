// This script provides instructions to fix your .env.local file
console.log('ENVIRONMENT VARIABLE FIX INSTRUCTIONS');
console.log('====================================');
console.log('The issue with your authentication is likely due to quotes in your .env.local file.');
console.log('\nHere\'s how your .env.local file should look (without any quotes around values):');
console.log(`
DB_USER=postgres
DB_HOST=localhost
DB_NAME=indusun
DB_PASSWORD=3421
DB_PORT=5432

JWT_SECRET=caf055922dd03b525fc099749d351d380da8dfabb534d5f7e359807e80e71d2ac6d7bed9d244c233e8d84feb19e4a138da7478deaee965d86b873b9605e048e9

# Email transporter
EMAIL_USER=
EMAIL_PASS=
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# Social login
GOOGLE_CLIENT_ID=34629616806-vup8ern3tbma17mio3lkc77f5k5vu0pl.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

FACEBOOK_CLIENT_ID=1754384781777408
FACEBOOK_CLIENT_SECRET=be23d47ba83defca81b4648d968724a4

NEXT_PUBLIC_APP_URL=http://localhost:3000
`);

console.log('\nIMPORTANT STEPS:');
console.log('1. Open your .env.local file');
console.log('2. Remove ALL quotes from values (both single and double quotes)');
console.log('3. Make sure there are NO spaces around the equals sign');
console.log('4. Save the file');
console.log('5. Restart your Next.js server (stop with Ctrl+C and run npm run dev again)');
console.log('\nAfter making these changes, try the authentication again.');
