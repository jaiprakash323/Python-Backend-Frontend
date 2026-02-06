const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        message: 'No authorization header provided' 
      });
    }

    // Extract token from "Bearer <token>" format
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user info to request object
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };
    
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token has expired' 
      });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token' 
      });
    }
    
    return res.status(500).json({ 
      success: false,
      message: 'Failed to authenticate token' 
    });
  }
};

module.exports = verifyToken;
