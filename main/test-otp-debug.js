// Debug script for OTP functionality
const fetch = require('node-fetch');

async function setupAndTestOTP() {
  try {
    console.log('🚀 Step 1: Setting up authentication data...');
    
    // Setup authentication data first
    const setupResponse = await fetch('http://localhost:3000/api/setup-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const setupData = await setupResponse.json();
    
    if (setupResponse.ok) {
      console.log('✅ Setup successful!');
      console.log('Users created:', setupData.users?.length || 0);
    } else {
      console.log('❌ Setup failed:', setupData);
      return;
    }
    
    console.log('\n🔍 Step 2: Testing OTP sending...');
    
    // Test OTP sending
    const otpResponse = await fetch('http://localhost:3000/api/auth/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        phone: '+91 98765 12345' // Hritik's phone number
      })
    });
    
    const otpData = await otpResponse.json();
    
    console.log('OTP Response Status:', otpResponse.status);
    console.log('OTP Response:', JSON.stringify(otpData, null, 2));
    
    if (otpResponse.ok) {
      console.log('✅ OTP sent successfully!');
      
      if (otpData.otp) {
        console.log('\n🔍 Step 3: Testing OTP verification...');
        
        // Test OTP verification
        const verifyResponse = await fetch('http://localhost:3000/api/auth/verify-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            phone: '+91 98765 12345',
            otp: otpData.otp
          })
        });
        
        const verifyData = await verifyResponse.json();
        
        console.log('Verify Response Status:', verifyResponse.status);
        console.log('Verify Response:', JSON.stringify(verifyData, null, 2));
        
        if (verifyResponse.ok) {
          console.log('✅ OTP verification successful!');
        } else {
          console.log('❌ OTP verification failed!');
        }
      }
    } else {
      console.log('❌ OTP sending failed!');
      console.log('Error details:', otpData);
    }
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

setupAndTestOTP();
