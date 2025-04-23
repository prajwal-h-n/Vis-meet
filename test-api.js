import fetch from 'node-fetch';

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
    
    // Try to parse response as JSON
    try {
      const data = await response.json();
      console.log('Response data:', data);
    } catch (e) {
      const text = await response.text();
      console.log('Response text:', text);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Test login endpoint
const testLogin = async () => {
  await testEndpoint('/auth/login', 'POST', {
    email: 'test@example.com',
    password: 'password123'
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

// Test health endpoint
const testHealth = async () => {
  await testEndpoint('/health', 'GET');
};

// Run tests
const runTests = async () => {
  console.log('🔍 Testing backend API directly...');
  
  console.log('\n🔹 Testing health endpoint:');
  await testEndpoint('/', 'GET');
  
  console.log('\n🔹 Testing login endpoint:');
  await testLogin();
  
  console.log('\n🔹 Testing register endpoint:');
  await testRegister();
};

runTests()
  .then(() => console.log('\n✅ Test completed'))
  .catch(err => console.error('❌ Test error:', err)); 