const { db } = require('../../config/db');

async function listDistricts() {
  const [rows] = await db.query(
    'SELECT id, name FROM districts ORDER BY name ASC'
  );
  return rows;
}

async function listCitiesByDistrict(districtId) {
  const [rows] = await db.query(
    'SELECT id, district_id, name FROM cities WHERE district_id = :district_id ORDER BY name ASC',
    { district_id: districtId }
  );
  return rows;
}

async function searchLocations(q) {
  if (!q || q.length < 2) {
    return { districts: [], cities: [] };
  }

  const like = `%${q}%`;

  const [districts] = await db.query(
    'SELECT id, name FROM districts WHERE name LIKE :q ORDER BY name ASC LIMIT 20',
    { q: like }
  );

  const [cities] = await db.query(
    `SELECT c.id, c.name, c.district_id, d.name AS district_name
     FROM cities c
     JOIN districts d ON d.id = c.district_id
     WHERE c.name LIKE :q
     ORDER BY c.name ASC
     LIMIT 50`,
    { q: like }
  );

  return { districts, cities };
}

module.exports = { listDistricts, listCitiesByDistrict, searchLocations };
