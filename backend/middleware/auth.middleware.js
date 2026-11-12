// JWT Authentication Middleware
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export async function protect(req, res, next) {
  try {
    let token = null;

    // Check HttpOnly cookie first
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // Also support Authorization header Bearer token (useful for Postman/API clients)
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to access this resource.'
      });
    }

    // Verify token
    const secret = process.env.JWT_SECRET || 'fallback_secret_cgpa_studio_token_change_in_prod';
    const decoded = jwt.verify(token, secret);

    // Find user in database
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session has expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token. Please log in again.'
    });
  }
}

