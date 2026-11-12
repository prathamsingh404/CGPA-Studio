// JWT Token Generation & Cookie Management Utility
import jwt from 'jsonwebtoken';

/**
 * Generates a signed JWT and attaches it to the response as an HttpOnly cookie.
 * @param {string} userId - The MongoDB User ObjectId
 * @param {object} res - Express response object
 * @returns {string} The signed JWT string
 */
export function generateTokenAndSetCookie(userId, res) {
  const secret = process.env.JWT_SECRET || 'fallback_secret_cgpa_studio_token_change_in_prod';

  const token = jwt.sign({ id: userId }, secret, {
    expiresIn: '7d'
  });

  const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  };

  res.cookie('token', token, cookieOptions);
  return token;
}

/**
 * Clears the authentication cookie during logout.
 * @param {object} res - Express response object
 */
export function clearAuthCookie(res) {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
}

