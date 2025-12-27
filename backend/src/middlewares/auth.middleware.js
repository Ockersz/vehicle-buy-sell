const { verifyAccessTokenSafe } = require("../utils/jwt");
const { db } = require("../config/db");

async function enforceUserStatus(userId) {
  const [rows] = await db.query(
    "SELECT id, role, phone, status, suspended_until FROM users WHERE id = :id LIMIT 1",
    { id: userId }
  );

  if (!rows.length) return { ok: false, code: 401, message: "Unauthorized" };

  const u = rows[0];

  if (u.status === "BANNED")
    return { ok: false, code: 403, message: "Account banned" };

  if (u.status === "SUSPENDED") {
    if (u.suspended_until) {
      const until = new Date(u.suspended_until);
      if (!Number.isNaN(until.getTime()) && until.getTime() <= Date.now()) {
        await db.query(
          "UPDATE users SET status = 'ACTIVE', suspended_until = NULL WHERE id = :id",
          { id: userId }
        );
        u.status = "ACTIVE";
        u.suspended_until = null;
      }
    }

    if (u.status === "SUSPENDED") {
      return { ok: false, code: 403, message: "Account suspended" };
    }
  }

  return { ok: true, user: u };
}

async function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : null;
    if (!token)
      return res
        .status(401)
        .json({ ok: false, code: "NO_TOKEN", message: "Unauthorized" });

    const v = verifyAccessTokenSafe(token);
    if (!v.ok) {
      // KEY: frontend will refresh only when TOKEN_EXPIRED
      return res
        .status(401)
        .json({ ok: false, code: v.code, message: "Unauthorized" });
    }

    const payload = v.payload; // { id, role, phone }
    if (!payload?.id)
      return res
        .status(401)
        .json({ ok: false, code: "TOKEN_INVALID", message: "Unauthorized" });

    const statusCheck = await enforceUserStatus(payload.id);
    if (!statusCheck.ok) {
      return res
        .status(statusCheck.code)
        .json({ ok: false, message: statusCheck.message });
    }

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
    return res
      .status(401)
      .json({ ok: false, code: "UNAUTHORIZED", message: "Unauthorized" });
  }
}

function requireRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.user)
      return res.status(401).json({ ok: false, message: "Unauthorized" });

    const role = String(req.user.role || "").toUpperCase();
    const ok = allowed.map((r) => String(r).toUpperCase()).includes(role);

    if (!ok) return res.status(403).json({ ok: false, message: "Forbidden" });
    next();
  };
}

module.exports = { requireAuth, requireRole, enforceUserStatus };
