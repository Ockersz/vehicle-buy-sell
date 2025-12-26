const { db } = require('../../config/db');

async function listDistricts() {
  const [rows] = await db.query(
    'SELECT id, name FROM districts ORDER BY name ASC'
  );
  return rows;
}

async function listCities(districtId) {
  if (districtId) {
    const [rows] = await db.query(
      'SELECT id, district_id, name FROM cities WHERE district_id = :districtId ORDER BY name ASC',
      { districtId }
    );
    return rows;
  }
  const [rows] = await db.query(
    'SELECT id, district_id, name FROM cities ORDER BY name ASC LIMIT 500'
  );
  return rows;
}

module.exports = { listDistricts, listCities };
