// utils/jwt.js
const jwt = require('jsonwebtoken');
const { config } = require('../config/env');

function signAccessToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, phone: user.phone },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessTtlSeconds }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, phone: user.phone },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshTtlSeconds }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, config.jwt.accessSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwt.refreshSecret);
}

function verifyAccessTokenSafe(token) {
  try {
    const payload = jwt.verify(token, config.jwt.accessSecret);
    return { ok: true, payload };
  } catch (e) {
    if (e?.name === 'TokenExpiredError') return { ok: false, code: 'TOKEN_EXPIRED' };
    return { ok: false, code: 'TOKEN_INVALID' };
  }
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  verifyAccessTokenSafe,
};
