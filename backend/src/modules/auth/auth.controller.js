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

async function refresh(req, res, next) {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      return res.status(401).json({ ok: false, code: 'NO_REFRESH', message: 'Unauthorized' });
    }

    const result = await authService.refresh(refreshToken, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    if (result.refreshToken) {
      res.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/auth/refresh',
        maxAge: 1000 * 60 * 60 * 24 * 30,
      });
    }

    return res.json({ ok: true, accessToken: result.accessToken });
  } catch (err) {
    return next(err);
  }
}

module.exports = { requestOtp, verifyOtp, refresh };
