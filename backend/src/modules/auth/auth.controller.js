const { RequestOtpSchema, VerifyOtpSchema } = require('./auth.schemas');
const authService = require('./auth.service');

async function requestOtp(req, res, next) {
  try {
    const parsed = RequestOtpSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ ok: false, message: 'Invalid body' });

    const result = await authService.requestOtp(parsed.data.phone, req.ip);
    return res.json({ ok: true, ...result });
  } catch (err) {
    return next(err);
  }
}

async function verifyOtp(req, res, next) {
  try {
    const parsed = VerifyOtpSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ ok: false, message: 'Invalid body' });

    const result = await authService.verifyOtp(
      parsed.data.phone,
      parsed.data.otp
    );
    return res.json({ ok: true, ...result });
  } catch (err) {
    return next(err);
  }
}

module.exports = { requestOtp, verifyOtp };
