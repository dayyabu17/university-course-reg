const User = require('../models/User');

// Middleware to check if user is an admin
const isAdmin = async (req, res, next) => {
  try {
    const { userId } = req.body;

    // If you're using JWT authentication, you would typically get userId from req.user
    // For example: const userId = req.user.id;
    
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Find the user and check their role
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin privileges required.'
      });
    }

    // User is an admin, proceed to next middleware/controller
    req.user = user;
    next();

  } catch (error) {
    console.error('Admin authentication error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Authentication error',
      error: error.message
    });
  }
};

// Middleware to protect routes - verify JWT token
const protect = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided. Please log in.'
      });
    }

    // Verify JWT token
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token'
    });
  }
};

module.exports = {
  isAdmin,
  protect
};
