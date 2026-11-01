const jwt = require('jsonwebtoken');

const COOKIE_NAME = 'foodly_token';
const MAX_AGE = 7 * 24 * 60 * 60; // 7 days, in seconds

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: MAX_AGE }
  );
}

function getTokenFromReq(req) {
  if (req.cookies && req.cookies[COOKIE_NAME]) return req.cookies[COOKIE_NAME];
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

// Returns the decoded { id, role } payload, or null if missing/invalid.
function verifyAuth(req) {
  const token = getTokenFromReq(req);
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  const parts = [
    `${COOKIE_NAME}=${token}`,
    'HttpOnly',
    'Path=/',
    `Max-Age=${MAX_AGE}`,
    'SameSite=Lax',
  ];
  if (isProd) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function clearAuthCookie(res) {
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`
  );
}

// Throws a 401/403-flavored error the route handlers can catch and translate.
function requireAuth(req) {
  const payload = verifyAuth(req);
  if (!payload) {
    const err = new Error('Not authenticated');
    err.statusCode = 401;
    throw err;
  }
  return payload;
}

function requireAdmin(req) {
  const payload = requireAuth(req);
  if (payload.role !== 'admin') {
    const err = new Error('Admin access required');
    err.statusCode = 403;
    throw err;
  }
  return payload;
}

module.exports = {
  signToken,
  verifyAuth,
  requireAuth,
  requireAdmin,
  setAuthCookie,
  clearAuthCookie,
};
