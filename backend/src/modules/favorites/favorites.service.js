const { db } = require('../../config/db');
const { getPagination } = require('../../utils/pagination');

function err(statusCode, publicMessage) {
  const e = new Error(publicMessage);
  e.statusCode = statusCode;
  e.publicMessage = publicMessage;
  return e;
}

async function addFavorite(user, listingId) {
  if (!user?.id) throw err(401, 'Unauthorized');

  // ensure listing exists (and not removed)
  const [rows] = await db.query(
    'SELECT id, status FROM listings WHERE id = :id LIMIT 1',
    { id: listingId }
  );
  if (!rows.length) throw err(404, 'Listing not found');
  if (rows[0].status === 'REMOVED') throw err(400, 'Listing removed');

  // idempotent insert
  await db.query(
    'INSERT IGNORE INTO favorites (user_id, listing_id) VALUES (:user_id, :listing_id)',
    { user_id: user.id, listing_id: listingId }
  );
}

async function removeFavorite(user, listingId) {
  if (!user?.id) throw err(401, 'Unauthorized');

  await db.query(
    'DELETE FROM favorites WHERE user_id = :user_id AND listing_id = :listing_id',
    { user_id: user.id, listing_id: listingId }
  );
}

async function listMyFavorites(user, qs) {
  if (!user?.id) throw err(401, 'Unauthorized');

  const { pageSize, offset } = getPagination(qs);

  // Return favorite listings with thumbnail + location names
  const [rows] = await db.query(
    `SELECT
      l.id, l.seller_id, l.status, l.vehicle_type, l.make, l.model, l.model_variant,
      l.year, l.condition_type, l.price_lkr, l.mileage_km, l.fuel_type, l.transmission,
      l.district_id, d.name AS district_name, l.city_id, c.name AS city_name,
      l.price_label, l.market_estimate_lkr, l.is_featured, l.is_highlighted, l.boost_until,
      l.created_at, l.renewed_at, l.expires_at
     FROM favorites f
     JOIN listings l ON l.id = f.listing_id
     JOIN districts d ON d.id = l.district_id
     JOIN cities c ON c.id = l.city_id
     WHERE f.user_id = :user_id
       AND l.status != 'REMOVED'
     ORDER BY f.created_at DESC
     LIMIT :limit OFFSET :offset`,
    { user_id: user.id, limit: pageSize, offset }
  );

  const ids = rows.map((r) => r.id);
  if (!ids.length) return [];

  // attach thumbnails
  const [thumbs] = await db.query(
    `SELECT li.listing_id, li.url
     FROM listing_images li
     JOIN (
       SELECT listing_id, MIN(sort_order) AS min_sort
       FROM listing_images
       WHERE listing_id IN (${ids.map(() => '?').join(',')})
       GROUP BY listing_id
     ) x ON x.listing_id = li.listing_id AND x.min_sort = li.sort_order`,
    ids
  );

  const thumbMap = new Map(thumbs.map((t) => [t.listing_id, t.url]));
  return rows.map((r) => ({ ...r, thumbnail_url: thumbMap.get(r.id) || null }));
}

module.exports = { addFavorite, removeFavorite, listMyFavorites };
