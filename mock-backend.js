import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
// Use a different port if MOCK_PORT is specified, otherwise fallback to PORT or 5001
const PORT = process.env.MOCK_PORT || process.env.PORT || 5001;

// Log environment info
console.log(`[MOCK-BACKEND] Environment:`, {
  mockPort: process.env.MOCK_PORT,
  port: process.env.PORT,
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
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-auth-token, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'x-auth-token');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Generate a token (simplified for mock)
const generateToken = (userId) => {
  return crypto.randomBytes(64).toString('hex');
};

// Auth routes
app.post('/api/auth/login', (req, res) => {
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
});

app.post('/api/auth/register', (req, res) => {
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
});

app.get('/api/auth/user', (req, res) => {
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
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Mock backend is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('Mock Visual-Meet API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`[MOCK-BACKEND] Server running on port ${PORT}`);
  console.log(`[MOCK-BACKEND] Test user: user122@gmail.com / 12345`);
}); 