const express = require('express');
const { getDistricts, getCities } = require('./locations.controller');

const router = express.Router();

router.get('/districts', getDistricts);
router.get('/cities', getCities);

module.exports = router;
