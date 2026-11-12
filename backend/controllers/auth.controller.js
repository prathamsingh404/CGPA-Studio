// Authentication Controller
import User from '../models/user.model.js';
import { generateTokenAndSetCookie, clearAuthCookie } from '../utils/generateToken.js';

/**
 * Register a new student account
 * POST /api/auth/register
 */
export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, and password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Create user (password is automatically hashed via pre-save hook)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password
    });

    // Generate JWT and set HttpOnly cookie
    const token = generateTokenAndSetCookie(user._id, res);

    res.status(201).json({
      success: true,
      message: 'Student account registered successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      },
      token: token // Also included in JSON for API test runners like Postman
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Log in an existing student
 * POST /api/auth/login
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    // Find user by lowercase email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password using bcryptjs compare
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT and set HttpOnly cookie
    const token = generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      },
      token: token
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Log out student and clear authentication cookie
 * POST /api/auth/logout
 */
export async function logout(req, res) {
  clearAuthCookie(res);
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
}

/**
 * Get current authenticated student details
 * GET /api/auth/me
 */
export async function getMe(req, res) {
  res.status(200).json({
    success: true,
    data: req.user
  });
}

