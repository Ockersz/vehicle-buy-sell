const crypto = require('crypto');

function hashOtp(otp) {
  return crypto.createHash('sha256').update(String(otp)).digest('hex');
}

function randomOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

module.exports = { hashOtp, randomOtp };
