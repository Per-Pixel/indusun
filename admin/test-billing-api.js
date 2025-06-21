const http = require('http');

// Test the billing API endpoint
const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/billing',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('Response data:');
      console.log(JSON.stringify(jsonData, null, 2));
      
      // Check trends data specifically
      if (jsonData.trends) {
        console.log('\nTrends data:');
        console.log(JSON.stringify(jsonData.trends, null, 2));
      }
    } catch (error) {
      console.error('Error parsing JSON:', error);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.end();
