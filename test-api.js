import fetch from 'node-fetch';

// Updated URL to match the correct backend API URL structure
const BACKEND_URL = 'https://vis-meet-backend.onrender.com/api';

// Function to test API endpoints
async function testEndpoint(endpoint, method, body = null) {
  const url = `${BACKEND_URL}${endpoint}`;
  console.log(`Testing ${method} ${url}`);
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  const options = {
    method,
    headers
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    console.log('Request options:', options);
    const response = await fetch(url, options);
    console.log(`Response status: ${response.status}`);
    
    // Handle response based on status
    if (response.status === 404) {
      console.log('Endpoint not found (404)');
      return;
    }
    
    // Clone response before reading body to avoid 'body used already' error
    const clonedResponse = response.clone();
    
    // Try to parse response as JSON
    try {
      const data = await response.json();
      console.log('Response data:', data);
    } catch (e) {
      console.log('Response is not JSON:', e.message);
      try {
        const text = await clonedResponse.text();
        console.log('Response text:', text || '(empty response)');
      } catch (textError) {
        console.log('Could not read response text:', textError.message);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Test login endpoint with correct user credentials
const testLogin = async () => {
  await testEndpoint('/auth/login', 'POST', {
    email: 'user122@gmail.com',
    password: '12345'
  });
};

// Test register endpoint
const testRegister = async () => {
  await testEndpoint('/auth/register', 'POST', {
    name: 'Test User',
    email: 'test2@example.com',
    password: 'password123'
  });
};

// Test root endpoint
const testRoot = async () => {
  await testEndpoint('', 'GET');
};

// Run tests
const runTests = async () => {
  console.log('🔍 Testing backend API directly...');
  
  console.log('\n🔹 Testing root endpoint:');
  await testRoot();
  
  console.log('\n🔹 Testing login endpoint:');
  await testLogin();
  
  console.log('\n🔹 Testing register endpoint:');
  await testRegister();
};

runTests()
  .then(() => console.log('\n✅ Test completed'))
  .catch(err => console.error('❌ Test error:', err)); 