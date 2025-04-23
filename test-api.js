import fetch from 'node-fetch';

// Try different backend URL structures
const BACKEND_URL_OPTIONS = [
  'https://vis-meet-backend.onrender.com', // no /api prefix
  'https://vis-meet-backend.onrender.com/api' // with /api prefix
];

// Function to test API endpoints with different URL structures
async function testAllURLs(endpoint, method, body = null) {
  console.log(`\n🔍 Testing ${method} ${endpoint} with different URL structures:`);
  
  for (const baseURL of BACKEND_URL_OPTIONS) {
    const url = `${baseURL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    await testEndpoint(url, method, body);
  }
}

// Function to test a specific endpoint
async function testEndpoint(url, method, body = null) {
  console.log(`\nTesting ${method} ${url}`);
  
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
      console.log('❌ Endpoint not found (404)');
      return;
    }
    
    // Clone response before reading body to avoid 'body used already' error
    const clonedResponse = response.clone();
    
    // Try to parse response as JSON
    try {
      const data = await response.json();
      console.log('✅ Response data:', data);
    } catch (e) {
      console.log('Response is not JSON:', e.message);
      try {
        const text = await clonedResponse.text();
        console.log('Response text:', text.substring(0, 500) || '(empty response)');
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
  const credentials = {
    email: 'user122@gmail.com',
    password: '12345'
  };
  
  // Test different path variations
  await testAllURLs('auth/login', 'POST', credentials);
  await testAllURLs('api/auth/login', 'POST', credentials);
};

// Test register endpoint
const testRegister = async () => {
  const userData = {
    name: 'Test User',
    email: 'test2@example.com',
    password: 'password123'
  };
  
  await testAllURLs('auth/register', 'POST', userData);
  await testAllURLs('api/auth/register', 'POST', userData);
};

// Test root endpoints
const testRoot = async () => {
  await testAllURLs('', 'GET');
  await testAllURLs('health', 'GET');
};

// Run tests
const runTests = async () => {
  console.log('🔍 TESTING BACKEND API DISCOVERY\n');
  
  console.log('\n🔹 Testing root endpoints:');
  await testRoot();
  
  console.log('\n🔹 Testing login endpoint:');
  await testLogin();
  
  console.log('\n🔹 Testing register endpoint:');
  await testRegister();
};

runTests()
  .then(() => console.log('\n✅ Test completed'))
  .catch(err => console.error('❌ Test error:', err)); 