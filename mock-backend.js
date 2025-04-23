import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
// Always use a different port than the main server to avoid conflicts
// Use the main PORT with +1 (e.g. if PORT is 10000, mock will use 10001)
const MAIN_PORT = parseInt(process.env.PORT || '8080');
const MOCK_PORT = parseInt(process.env.MOCK_PORT || (MAIN_PORT + 1).toString());

// Log environment info
console.log(`[MOCK-BACKEND] Environment:`, {
  mainPort: MAIN_PORT,
  mockPort: MOCK_PORT,
  nodeEnv: process.env.NODE_ENV
});

// Mock user database
const users = [
  {
    id: '1',
    name: 'Test User',
    email: 'user122@gmail.com',
    password: '12345' // In a real app, this would be hashed
  }
];

// Middleware
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`[MOCK-BACKEND] ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-auth-token, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'x-auth-token');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[MOCK-BACKEND] Error:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// Generate a token (simplified for mock)
const generateToken = (userId) => {
  return crypto.randomBytes(64).toString('hex');
};

// Handle HEAD requests for auth endpoints - these are used to check availability
app.head('/api/auth/login', (req, res) => {
  console.log('[MOCK-BACKEND] Received health check request for login endpoint');
  res.status(200).end();
});

app.head('/api/auth/register', (req, res) => {
  console.log('[MOCK-BACKEND] Received health check request for register endpoint');
  res.status(200).end();
});

app.head('/api/auth/user', (req, res) => {
  console.log('[MOCK-BACKEND] Received health check request for user endpoint');
  res.status(200).end();
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`[MOCK-BACKEND] Login attempt:`, { email, password });
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const token = generateToken(user.id);
    
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email
    };
    
    console.log(`[MOCK-BACKEND] Login successful for ${email}`);
    res.json({ user: userData, token });
  } catch (error) {
    console.error('[MOCK-BACKEND] Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log(`[MOCK-BACKEND] Register attempt:`, { name, email });
    
    if (users.some(u => u.email === email)) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    const newUser = {
      id: (users.length + 1).toString(),
      name,
      email,
      password
    };
    
    users.push(newUser);
    
    const token = generateToken(newUser.id);
    
    const userData = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email
    };
    
    console.log(`[MOCK-BACKEND] Registration successful for ${email}`);
    res.json({ user: userData, token });
  } catch (error) {
    console.error('[MOCK-BACKEND] Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.get('/api/auth/user', (req, res) => {
  try {
    const token = req.header('x-auth-token');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    // In a real app, we would verify the token
    // For this mock, we'll just return the first user
    const user = users[0];
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email
    };
    
    res.json(userData);
  } catch (error) {
    console.error('[MOCK-BACKEND] User fetch error:', error);
    res.status(500).json({ message: 'Server error getting user data' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Mock backend is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('Mock Visual-Meet API is running');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[MOCK-BACKEND] Unhandled Promise Rejection:', err);
  // Don't exit the process as it would shut down the backend
});

// Start server with error handling
const server = app.listen(MOCK_PORT, () => {
  console.log(`[MOCK-BACKEND] Server running on port ${MOCK_PORT}`);
  console.log(`[MOCK-BACKEND] Test user: user122@gmail.com / 12345`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[MOCK-BACKEND] Port ${MOCK_PORT} is already in use. Trying next port.`);
    const nextPort = MOCK_PORT + 1;
    app.listen(nextPort, () => {
      console.log(`[MOCK-BACKEND] Server running on alternative port ${nextPort}`);
      console.log(`[MOCK-BACKEND] Test user: user122@gmail.com / 12345`);
    });
  } else {
    console.error('[MOCK-BACKEND] Server error:', err);
  }
});