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

// Create API proxy for backend requests
app.use('/api', async (req, res) => {
  const url = `${BACKEND_URL}${req.url}`;
  const method = req.method;
  
  console.log(`Proxying ${method} request to: ${url}`);
  
  try {
    const headers = {};
    
    // Copy only specific headers that we need
    if (req.headers['content-type']) {
      headers['Content-Type'] = req.headers['content-type'];
    } else {
      headers['Content-Type'] = 'application/json';
    }
    
    if (req.headers['x-auth-token']) {
      headers['x-auth-token'] = req.headers['x-auth-token'];
    }
    
    // Get the request body if it exists
    const fetchOptions = {
      method: method,
      headers: headers
    };
    
    if (['POST', 'PUT', 'PATCH'].includes(method) && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }
    
    const response = await fetch(url, fetchOptions);
    
    // Forward response headers
    Object.entries(response.headers.raw()).forEach(([key, value]) => {
      res.set(key, value);
    });
    
    if (response.status === 204) {
      return res.status(204).end();
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return res.status(response.status).json(data);
    } else {
      const text = await response.text();
      return res.status(response.status).send(text);
    }
  } catch (error) {
    console.error(`Proxy error: ${error.message}`);
    res.status(500).json({ message: 'Error connecting to backend server', error: error.message });
  }
});

// Serve static files from the dist directory
app.use(express.static(join(__dirname, 'dist')));

// Handle SPA routing - send all requests to index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
}); 