const express = require('express');
const {
  requireAuth,
  requireRole,
} = require('../../middlewares/auth.middleware');
const c = require('./reports.controller');

const router = express.Router();

// user
router.post('/', requireAuth, c.createReport);
router.get('/me', requireAuth, c.listMyReports);

// admin
router.get('/', requireAuth, requireRole(['ADMIN']), c.adminListReports);
router.patch('/:id', requireAuth, requireRole(['ADMIN']), c.adminUpdateReport);

module.exports = router;
