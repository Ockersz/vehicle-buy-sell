const express = require('express');
const { requireAuth } = require('../../middlewares/auth.middleware');
const c = require('./listings.controller');

const router = express.Router();

const offersController = require('../offers/offers.controller');

// public
router.get('/', c.searchListings);
router.get('/:id', c.getListingById);

// authed (seller/dealer/admin)
router.post('/', requireAuth, c.createListing);
router.patch('/:id', requireAuth, c.updateListing);
router.delete('/:id', requireAuth, c.deleteListing);

router.post('/:id/pause', requireAuth, c.pauseListing);
router.post('/:id/unpause', requireAuth, c.unpauseListing);
router.post('/:id/renew', requireAuth, c.renewListing);

router.post('/:id/offers', requireAuth, offersController.createOfferOnListing);

module.exports = router;
