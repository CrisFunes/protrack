const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Invalid authorization format' });
    }

    const token = parts[1];

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Agregar la información del usuario decodificada a req
    // Asegurarnos de que usamos userId que es lo que guardamos en el token
    req.user = {
      id: decoded.userId // Esto coincide con lo que guardamos en authController.js
    };

    // Log para debugging
    console.log('Auth successful for user:', req.user.id);

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