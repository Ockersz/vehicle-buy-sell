const express = require('express');
const { requireAuth } = require('../../middlewares/auth.middleware');
const { presign } = require('./uploads.controller');

const router = express.Router();

router.post('/presign', requireAuth, presign);

module.exports = router;
