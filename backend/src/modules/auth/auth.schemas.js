const { z } = require('zod');

const RequestOtpSchema = z.object({
  phone: z.string().min(7).max(20),
});

const VerifyOtpSchema = z.object({
  phone: z.string().min(7).max(20),
  otp: z.string().min(4).max(10),
});

module.exports = { RequestOtpSchema, VerifyOtpSchema };
