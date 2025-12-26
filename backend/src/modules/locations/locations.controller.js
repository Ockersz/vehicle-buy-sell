const locationsService = require('./locations.service');

async function getDistricts(req, res, next) {
  try {
    const items = await locationsService.listDistricts();
    res.json({ ok: true, items });
  } catch (err) {
    next(err);
  }
}

async function getCities(req, res, next) {
  try {
    const districtId = req.query.district_id
      ? Number(req.query.district_id)
      : null;
    const items = await locationsService.listCities(districtId);
    res.json({ ok: true, items });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDistricts, getCities };
