import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  // 1) Prefer HTTP-only cookie when present
  let token = req.cookies?.token;

  // 2) Fallback to Authorization: Bearer <token> header (for cases where cookie isn't sent)
  if (!token) {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.userId,
      username: decoded.username,
      email: decoded.email,
    };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

export default authMiddleware;


