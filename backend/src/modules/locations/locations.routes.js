const express = require('express');
const c = require('./locations.controller');

const router = express.Router();

router.get('/districts', c.listDistricts);
router.get('/districts/:districtId/cities', c.listCitiesByDistrict);
router.get('/search', c.searchLocations);

module.exports = router;
