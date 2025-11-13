import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const signup = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Add timeout to database query
    const existingUser = await User.findOne({ $or: [{ username }, { email }] })
      .maxTimeMS(5000)
      .lean();
    
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    console.error('Signup error:', err.message);
    
    if (err.message && err.message.includes('buffering timed out')) {
      return res.status(503).json({ error: 'Database timeout. Please try again.' });
    }
    
    res.status(500).json({ error: err.message || 'Signup failed' });
  }
};

export const login = async (req, res) => {
  // Accept either email or username in the same field `email`
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Add timeout and use lean() for read-only queries
    const user = await User.findOne({ $or: [{ email }, { username: email }] })
      .maxTimeMS(5000)
      .select('+password'); // Include password field
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
      domain: isProd ? undefined : 'localhost'
    });
    res.json({ message: 'Login successful' });
  } catch (err) {
    console.error('Login error:', err.message);
    
    if (err.message && err.message.includes('buffering timed out')) {
      return res.status(503).json({ error: 'Database timeout. Please try again.' });
    }
    
    res.status(500).json({ error: err.message || 'Login failed' });
  }
};

export const me = async (req, res) => {
  // req.user is set by auth middleware
  if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });
  res.json({ user: req.user });
};

export const logout = async (_req, res) => {
  res.clearCookie('token', { path: '/' });
  res.json({ message: 'Logged out' });
};


