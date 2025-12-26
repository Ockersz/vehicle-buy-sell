const service = require('./locations.service');

async function listDistricts(req, res, next) {
  try {
    const items = await service.listDistricts();
    res.json({ ok: true, items });
  } catch (e) {
    next(e);
  }
}

async function listCitiesByDistrict(req, res, next) {
  try {
    const districtId = Number(req.params.districtId);
    if (!Number.isFinite(districtId))
      return res.status(400).json({ ok: false, message: 'Invalid districtId' });

    const items = await service.listCitiesByDistrict(districtId);
    res.json({ ok: true, items });
  } catch (e) {
    next(e);
  }
}

async function searchLocations(req, res, next) {
  try {
    const q = String(req.query.q || '').trim();
    const result = await service.searchLocations(q);
    res.json({ ok: true, ...result });
  } catch (e) {
    next(e);
  }
}

module.exports = { listDistricts, listCitiesByDistrict, searchLocations };
