const jwt = require('jsonwebtoken');

const authMiddleware = {
  authenticateToken(req, res, next) {
    console.log('Full headers:', req.headers);
    const authHeader = req.headers['authorization'];
    console.log('Auth header:', authHeader);
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length);
    
    const token = authHeader && authHeader.split(' ')[1];
    console.log('Extracted token:', token?.substring(0, 20) + '...');

    if (!token) {
      console.log('No token found in request');
      return res.status(401).json({ 
        error: 'No token provided',
        details: 'Authorization header is missing or malformed'
      });
    }

    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token verification successful:', {
        userId: verified.id,
        role: verified.role,
        exp: new Date(verified.exp * 1000).toISOString()
      });
      req.user = verified;
      next();
    } catch (error) {
      console.error('Token verification failed:', {
        name: error.name,
        message: error.message,
        expiredAt: error.expiredAt
      });
      res.status(403).json({ 
        error: 'Invalid token',
        details: error.message,
        code: error.name
      });
    }
  }
};

module.exports = authMiddleware;