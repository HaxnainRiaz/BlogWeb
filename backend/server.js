import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import './config/db.js';  // This will load the DB connection

dotenv.config();
const app = express();

// Allow multiple origins for CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5000',
  'https://blog-web-theta-one.vercel.app', // Your frontend URL
  'https://blog-web-842m.vercel.app', // Backend URL (for testing)
];

// Add environment variable origins if they exist
if (process.env.CORS_ORIGIN) {
  allowedOrigins.push(process.env.CORS_ORIGIN);
}
if (process.env.FRONTEND_ORIGIN) {
  allowedOrigins.push(process.env.FRONTEND_ORIGIN);
}

console.log('Allowed Origins:', allowedOrigins);

const corsOptions = {
  origin: function(origin, callback) {
    console.log(`Incoming request origin: ${origin}`);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('No origin detected - allowing request');
      return callback(null, true);
    }
    
    // Check if origin is in whitelist
    if (allowedOrigins.includes(origin)) {
      console.log(`Origin ${origin} is allowed`);
      callback(null, true);
    } else {
      console.log(`Origin ${origin} is NOT in whitelist. Allowed: ${allowedOrigins.join(', ')}`);
      // Still allow it but log for debugging
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 200,
  maxAge: 86400
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests

// Add security headers to prevent extension issues
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Request timeout middleware - set a reasonable timeout for database operations
app.use((req, res, next) => {
  // Set socket timeout to 30 seconds (enough for database operations)
  req.setTimeout(30000);
  res.setTimeout(30000);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

app.get('/', (req, res) => res.send('API Running'));
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle MongoDB timeout errors
  if (err.message && err.message.includes('buffering timed out')) {
    return res.status(503).json({
      error: 'Database connection timeout. Please try again.',
      status: 503
    });
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    status: err.status || 500
  });
});

const PORT = Number(process.env.PORT) || 4025;
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`MONGO_URI: ${process.env.MONGO_URI ? 'Set' : 'NOT SET'}`);
});

// Handle server errors
server.on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

