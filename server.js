import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import compression from 'compression';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
// For actual server port
const PORT = parseInt(process.env.PORT || '8080');
// For mock backend port: always use main port + 1
const MOCK_PORT = parseInt(process.env.MOCK_PORT || (PORT + 1).toString());

// Log environment variables
console.log('[SERVER] Environment:', {
  port: PORT,
  mockPort: MOCK_PORT,
  useMockBackend: process.env.USE_MOCK_BACKEND,
  render: process.env.RENDER,
  nodeEnv: process.env.NODE_ENV
});

// Configure backend URL based on environment
let BACKEND_URL;
if (process.env.USE_MOCK_BACKEND === 'true') {
  // Always use localhost with the mock port
  BACKEND_URL = `http://localhost:${MOCK_PORT}`;
  console.log(`[SERVER] Using local mock backend at ${BACKEND_URL}`);
} else {
  BACKEND_URL = 'https://vis-meet-backend.onrender.com';
  console.log(`[SERVER] Using remote backend at ${BACKEND_URL}`);
}

// Parse JSON request bodies
app.use(express.json());

// Compress all responses
app.use(compression());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Frontend server is running',
    timestamp: new Date().toISOString(),
    backendUrl: BACKEND_URL
  });
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
    
    // Special handling for HEAD requests - don't try to parse the response
    if (method === 'HEAD') {
      console.log(`[PROXY] Handling HEAD request to: ${url}`);
      const response = await fetch(url, fetchOptions);
      console.log(`[PROXY] HEAD response status: ${response.status}`);
      res.status(response.status).end();
      return;
    }
    
    // Make the fetch request for non-HEAD methods
    console.log(`[PROXY] Sending request to backend...`);
    const response = await fetch(url, fetchOptions);
    console.log(`[PROXY] Received response with status: ${response.status}`);

    // Set the status code
    res.status(response.status);
    
    // For empty responses or responses that can't be JSON-parsed, return a basic object
    if (response.headers.get('content-length') === '0' || 
        !response.headers.get('content-type')?.includes('json')) {
      console.log(`[PROXY] Non-JSON or empty response, returning simple status`);
      return res.json({
        status: response.status,
        message: response.status === 200 ? 'OK' : `Backend returned status ${response.status}`
      });
    }
    
    // Try to parse as JSON for normal responses
    try {
      const data = await response.json();
      console.log(`[PROXY] Response data:`, JSON.stringify(data));
      return res.json(data);
    } catch (parseError) {
      console.log(`[PROXY] Error parsing response as JSON: ${parseError.message}`);
      // Return a simple status-based response
      return res.json({
        status: response.status,
        message: `Backend returned status ${response.status} with invalid JSON`
      });
    }
  } catch (error) {
    console.error(`[PROXY] Network error:`, error);
    console.error(`[PROXY] Error stack:`, error.stack);
    return res.status(502).json({ 
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

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (err) => {
  console.error('[SERVER] Uncaught Exception:', err);
  // Don't exit the process as it would shut down the server
});

process.on('unhandledRejection', (err) => {
  console.error('[SERVER] Unhandled Promise Rejection:', err);
  // Don't exit the process as it would shut down the server
});

// Start the server with error handling
const server = app.listen(PORT, () => {
  console.log(`[SERVER] Frontend server running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[SERVER] Port ${PORT} is already in use. Cannot start server.`);
    process.exit(1);
  } else {
    console.error('[SERVER] Server error:', err);
  }
}); 