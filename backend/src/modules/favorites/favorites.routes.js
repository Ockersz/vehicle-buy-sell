const express = require('express');
const { requireAuth } = require('../../middlewares/auth.middleware');
const c = require('./favorites.controller');

const router = express.Router();

router.get('/', requireAuth, c.listMyFavorites);
router.post('/:listingId', requireAuth, c.addFavorite);
router.delete('/:listingId', requireAuth, c.removeFavorite);

module.exports = router;
