const express = require('express');
const { otpLimiter } = require('../../middlewares/rateLimit.middleware');
const { requestOtp, verifyOtp } = require('./auth.controller');

const router = express.Router();

router.post('/request-otp', otpLimiter, requestOtp);
router.post('/verify-otp', otpLimiter, verifyOtp);

module.exports = router;
