import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import compression from 'compression';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
// For actual server port
const PORT = process.env.PORT || 8080;
// For mock backend port if running locally
const MOCK_PORT = process.env.MOCK_PORT || 5001;

// Log environment variables
console.log('[SERVER] Environment:', {
  port: process.env.PORT,
  useMockBackend: process.env.USE_MOCK_BACKEND,
  nodeEnv: process.env.NODE_ENV
});

// Configure backend URL based on environment
let BACKEND_URL;
if (process.env.USE_MOCK_BACKEND === 'true') {
  // If we're running in Render with a single process, the mock backend will be on the same port
  if (process.env.RENDER) {
    BACKEND_URL = `http://localhost:${PORT}`;
  } else {
    // Otherwise use the mock port for local development
    BACKEND_URL = `http://localhost:${MOCK_PORT}`;
  }
} else {
  BACKEND_URL = 'https://vis-meet-backend.onrender.com';
}

console.log(`[SERVER] Using backend URL: ${BACKEND_URL}`);

// Parse JSON request bodies
app.use(express.json());

// Compress all responses
app.use(compression());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Create API proxy for backend requests
app.use('/api', async (req, res) => {
  // Try with the URL pattern that includes /api prefix in the path
  const urlPath = req.url; // e.g., /auth/login
  const url = `${BACKEND_URL}/api${urlPath}`; 
  
  const method = req.method;
  
  console.log(`[PROXY] ${method} request to: ${url}`);
  if (req.body) {
    console.log(`[PROXY] Request body:`, JSON.stringify(req.body));
  }
  
  try {
    // Create a clean headers object
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    // Copy auth header if present
    if (req.headers['x-auth-token']) {
      headers['x-auth-token'] = req.headers['x-auth-token'];
    }
    
    console.log(`[PROXY] Request headers:`, JSON.stringify(headers));
    
    // Set up fetch options
    const fetchOptions = {
      method: method,
      headers: headers
    };
    
    // Add body for relevant methods
    if (['POST', 'PUT', 'PATCH'].includes(method) && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }
    
    // Make the fetch request
    console.log(`[PROXY] Sending request to backend...`);
    const response = await fetch(url, fetchOptions);
    console.log(`[PROXY] Received response with status: ${response.status}`);

    // Set the status code
    res.status(response.status);
    
    // Handle the response
    try {
      const data = await response.json();
      console.log(`[PROXY] Response data:`, JSON.stringify(data));
      return res.json(data);
    } catch (parseError) {
      // If the response is not JSON, it's likely text or empty
      console.log(`[PROXY] Response is not JSON: ${parseError.message}`);
      
      // For 404 and other error codes, send a structured error
      return res.json({ 
        message: `Backend server returned status ${response.status}. The API endpoint might not exist.`,
        status: response.status
      });
    }
  } catch (error) {
    console.error(`[PROXY] Error:`, error);
    console.error(`[PROXY] Error stack:`, error.stack);
    return res.status(500).json({ 
      message: 'Error connecting to backend server', 
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
});

// Serve static files from the dist directory
app.use(express.static(join(__dirname, 'dist')));

// Handle SPA routing - send all requests to index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Express error handler
app.use((err, req, res, next) => {
  console.error(`[ERROR] Unhandled error:`, err);
  res.status(500).json({ 
    message: 'Server error',
    error: err.message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
  });
});

app.listen(PORT, () => {
  console.log(`[SERVER] Frontend server running on port ${PORT}`);
}); 