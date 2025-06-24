// Test script to setup authentication data
const fetch = require('node-fetch');

async function setupAuth() {
  try {
    console.log('🚀 Setting up authentication data...');
    
    const response = await fetch('http://localhost:3000/api/setup-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Setup successful!');
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Setup failed!');
      console.log('Error:', JSON.stringify(data, null, 2));
    }
    
    // Verify setup by getting users
    console.log('\n🔍 Verifying setup...');
    const verifyResponse = await fetch('http://localhost:3000/api/setup-auth');
    const verifyData = await verifyResponse.json();
    
    console.log('Users in database:', JSON.stringify(verifyData, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setupAuth();
