const express = require('express');
const { requireAuth } = require('../../middlewares/auth.middleware');
const c = require('./offers.controller');

const router = express.Router();

// seller inbox
router.get('/seller', requireAuth, c.sellerInbox);

// buyer sent offers
router.get('/me', requireAuth, c.myOffers);

// accept/counter/decline
router.patch('/:id', requireAuth, c.updateOffer);

module.exports = router;
