const express = require('express');
const {
  requireAuth,
  requireRole,
} = require('../../middlewares/auth.middleware');
const c = require('./admin.controller');

const router = express.Router();

router.use(requireAuth, requireRole(['ADMIN']));

/** Users */
router.get('/users', c.listUsers);
router.patch('/users/:id/status', c.updateUserStatus);

/** Listings moderation */
router.patch('/listings/:id/remove', c.removeListing);
router.patch('/listings/:id/feature', c.setFeatured);
router.patch('/listings/:id/highlight', c.setHighlighted);

// Reports moderation
router.get('/reports', c.listReports);
router.patch('/reports/:id', c.updateReport);

module.exports = router;
