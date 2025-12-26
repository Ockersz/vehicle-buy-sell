const { db } = require('../../config/db');
const { config } = require('../../config/env');
const { hashOtp, randomOtp } = require('../../utils/otp');
const { signAccessToken, signRefreshToken } = require('../../utils/jwt');

async function requestOtp(phone, requestIp) {
  // cooldown check
  const [rows] = await db.query(
    'SELECT created_at FROM otp_requests WHERE phone = :phone ORDER BY id DESC LIMIT 1',
    { phone }
  );
  if (rows.length) {
    const last = new Date(rows[0].created_at).getTime();
    const now = Date.now();
    const diffSec = Math.floor((now - last) / 1000);
    if (diffSec < config.otp.cooldownSeconds) {
      return { cooldown_seconds: config.otp.cooldownSeconds - diffSec };
    }
  }

  const otp = config.otp.devFixed || randomOtp();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + config.otp.ttlSeconds * 1000);

  await db.query(
    `INSERT INTO otp_requests (phone, otp_hash, purpose, expires_at, request_ip)
     VALUES (:phone, :otp_hash, 'LOGIN', :expires_at, :request_ip)`,
    { phone, otp_hash: otpHash, expires_at: expiresAt, request_ip: requestIp }
  );

  // MVP: we don't actually send SMS here.
  // In production you integrate SMS provider and DO NOT return OTP.
  const response = { cooldown_seconds: config.otp.cooldownSeconds };
  if (config.nodeEnv !== 'production') response.dev_otp = otp;
  return response;
}

async function verifyOtp(phone, otp) {
  const otpHash = hashOtp(otp);

  const [rows] = await db.query(
    `SELECT id, otp_hash, expires_at, consumed_at
     FROM otp_requests
     WHERE phone = :phone
     ORDER BY id DESC
     LIMIT 1`,
    { phone }
  );

  if (!rows.length) return _err(400, 'OTP not found');
  const row = rows[0];

  if (row.consumed_at) return _err(400, 'OTP already used');
  if (new Date(row.expires_at).getTime() < Date.now())
    return _err(400, 'OTP expired');
  if (row.otp_hash !== otpHash) return _err(400, 'Invalid OTP');

  await db.query('UPDATE otp_requests SET consumed_at = NOW() WHERE id = :id', {
    id: row.id,
  });

  // find or create user
  let user;
  const [uRows] = await db.query(
    'SELECT * FROM users WHERE phone = :phone LIMIT 1',
    { phone }
  );

  if (uRows.length) {
    user = uRows[0];
    if (!user.is_phone_verified) {
      await db.query('UPDATE users SET is_phone_verified = 1 WHERE id = :id', {
        id: user.id,
      });
      user.is_phone_verified = 1;
    }
    if (user.is_banned) return _err(403, 'Account banned');
  } else {
    const [ins] = await db.query(
      "INSERT INTO users (phone, role, is_phone_verified) VALUES (:phone, 'BUYER', 1)",
      { phone }
    );
    const [fresh] = await db.query('SELECT * FROM users WHERE id = :id', {
      id: ins.insertId,
    });
    user = fresh[0];
  }

  const access_token = signAccessToken(user);
  const refresh_token = signRefreshToken(user);

  return {
    access_token,
    refresh_token,
    user: {
      id: user.id,
      phone: user.phone,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      is_phone_verified: !!user.is_phone_verified,
      created_at: user.created_at,
    },
  };
}

function _err(statusCode, publicMessage) {
  const e = new Error(publicMessage);
  e.statusCode = statusCode;
  e.publicMessage = publicMessage;
  return e;
}

module.exports = { requestOtp, verifyOtp };
