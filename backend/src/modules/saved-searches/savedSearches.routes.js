const express = require('express');
const { requireAuth } = require('../../middlewares/auth.middleware');
const c = require('./savedSearches.controller');

const router = express.Router();

router.get('/', requireAuth, c.listSavedSearches);
router.post('/', requireAuth, c.createSavedSearch);
router.patch('/:id', requireAuth, c.updateSavedSearch);
router.delete('/:id', requireAuth, c.deleteSavedSearch);

module.exports = router;
