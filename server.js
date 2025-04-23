import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import compression from 'compression';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;
const BACKEND_URL = 'https://vis-meet-backend.onrender.com';

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
  // Try with the URL pattern that omits the /api prefix
  // Example: /api/auth/login -> /auth/login
  const urlPath = req.url; // e.g., /auth/login
  const url = `${BACKEND_URL}${urlPath}`; 
  
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

    // If 404, try the fallback URL with /api prefix
    if (response.status === 404) {
      console.log(`[PROXY] 404 received, trying with /api prefix...`);
      const fallbackUrl = `${BACKEND_URL}/api${urlPath}`;
      console.log(`[PROXY] Fallback URL: ${fallbackUrl}`);
      
      const fallbackResponse = await fetch(fallbackUrl, fetchOptions);
      console.log(`[PROXY] Fallback response status: ${fallbackResponse.status}`);
      
      // Use the fallback response if it's not 404
      if (fallbackResponse.status !== 404) {
        res.status(fallbackResponse.status);
        try {
          const data = await fallbackResponse.json();
          console.log(`[PROXY] Fallback response data:`, JSON.stringify(data));
          return res.json(data);
        } catch (parseError) {
          console.log(`[PROXY] Fallback response is not JSON: ${parseError.message}`);
          return res.json({ 
            message: `Backend server returned status ${fallbackResponse.status}`,
            status: fallbackResponse.status
          });
        }
      }
    }
    
    // Set the status code
    res.status(response.status);
    
    // Handle the original response
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