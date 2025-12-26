const express = require('express');
const { requireAuth } = require('../../middlewares/auth.middleware');
const c = require('./uploads.controller');

const router = express.Router();

router.post('/presign', requireAuth, c.presignOne);
router.post('/presign-multi', requireAuth, c.presignMulti);
router.delete('/', requireAuth, c.deleteObject);

module.exports = router;
