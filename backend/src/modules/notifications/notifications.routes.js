const express = require('express');
const { requireAuth } = require('../../middlewares/auth.middleware');
const c = require('./notifications.controller');

const router = express.Router();

router.get('/me', requireAuth, c.listMyNotifications);
router.post('/mark-read', requireAuth, c.markRead);
router.get('/preferences', requireAuth, c.getPreferences);
router.patch('/preferences', requireAuth, c.updatePreferences);

// dev-only helper
router.post('/test', requireAuth, c.createTestNotification);

module.exports = router;
