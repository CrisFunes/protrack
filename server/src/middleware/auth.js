const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  try {
    console.log('Auth Headers:', req.headers);
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Invalid authorization format' });
    }

    const token = parts[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Asegurarse de que el userId esté disponible en req.user
    req.user = {
      userId: decoded.userId,
      id: decoded.userId // Mantener compatibilidad con código existente
    };

    console.log('Auth successful for user:', req.user.userId);

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = authMiddleware;