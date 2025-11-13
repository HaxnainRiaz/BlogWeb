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
  'https://blog-web-theta-one.vercel.app', // Your frontend URL
  process.env.CORS_ORIGIN,
  process.env.FRONTEND_ORIGIN
].filter(Boolean);

console.log('Allowed Origins:', allowedOrigins);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(null, true); // Allow for now, but log blocked requests
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 200
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

app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

app.get('/', (req, res) => res.send('API Running'));

const PORT = Number(process.env.PORT) || 4025;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
