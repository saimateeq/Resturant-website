import jwt from 'jsonwebtoken';

export function signAccessToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
  });
}

export function signRefreshToken(user) {
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function refreshCookieOptions(rememberMe) {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    // Frontend and backend are deployed on different domains (e.g. Vercel +
    // Render), which makes every API call a cross-site request. Browsers
    // only send SameSite=Lax cookies on top-level navigation, never on
    // fetch/XHR, so the refresh cookie would silently stop being sent —
    // SameSite=None (which requires Secure) is required in production.
    // Lax is kept for local dev, where Vite's proxy makes requests same-origin.
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/api/v1/auth',
    maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
  };
}
