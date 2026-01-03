const express = require('express');
const { otpLimiter } = require('../../middlewares/rateLimit.middleware');
const { requestOtp, verifyOtp, refresh  } = require('./auth.controller');

const router = express.Router();

router.post('/request-otp', otpLimiter, requestOtp);
router.post('/verify-otp', otpLimiter, verifyOtp);
router.post('/refresh', refresh);

module.exports = router;
