const { verifyAccessToken } = require('../utils/jwt');

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token)
    return res.status(401).json({ ok: false, message: 'Unauthorized' });

  try {
    const payload = verifyAccessToken(token);
    req.user = payload; // { id, role, phone }
    return next();
  } catch {
    return res.status(401).json({ ok: false, message: 'Unauthorized' });
  }
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user)
      return res.status(401).json({ ok: false, message: 'Unauthorized' });
    if (!roles.includes(req.user.role))
      return res.status(403).json({ ok: false, message: 'Forbidden' });
    next();
  };
}

module.exports = { requireAuth, requireRole };
