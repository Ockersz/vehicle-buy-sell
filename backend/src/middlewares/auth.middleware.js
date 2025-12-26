const { verifyAccessToken } = require('../utils/jwt');
const { db } = require('../config/db');

async function enforceUserStatus(userId) {
  const [rows] = await db.query(
    'SELECT id, role, phone, status, suspended_until FROM users WHERE id = :id LIMIT 1',
    { id: userId }
  );

  if (!rows.length) return { ok: false, code: 401, message: 'Unauthorized' };

  const u = rows[0];

  if (u.status === 'BANNED') {
    return { ok: false, code: 403, message: 'Account banned' };
  }

  if (u.status === 'SUSPENDED') {
    // Auto-un-suspend if time passed
    if (u.suspended_until) {
      const until = new Date(u.suspended_until);
      if (!Number.isNaN(until.getTime()) && until.getTime() <= Date.now()) {
        await db.query(
          "UPDATE users SET status = 'ACTIVE', suspended_until = NULL WHERE id = :id",
          { id: userId }
        );
        u.status = 'ACTIVE';
        u.suspended_until = null;
      }
    }

    if (u.status === 'SUSPENDED') {
      return { ok: false, code: 403, message: 'Account suspended' };
    }
  }

  return { ok: true, user: u };
}

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token)
    return res.status(401).json({ ok: false, message: 'Unauthorized' });

  (async () => {
    try {
      const payload = verifyAccessToken(token); // { id, role, phone }
      if (!payload?.id)
        return res.status(401).json({ ok: false, message: 'Unauthorized' });

      const statusCheck = await enforceUserStatus(payload.id);
      if (!statusCheck.ok) {
        return res
          .status(statusCheck.code)
          .json({ ok: false, message: statusCheck.message });
      }

      // overwrite with DB truth (role/phone/status)
      const u = statusCheck.user;
      req.user = {
        id: u.id,
        role: u.role,
        phone: u.phone,
        status: u.status,
        suspended_until: u.suspended_until,
      };

      return next();
    } catch {
      return res.status(401).json({ ok: false, message: 'Unauthorized' });
    }
  })();
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
