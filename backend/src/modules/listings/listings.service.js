module.exports = {};
const { db } = require('../../config/db');
const { getPagination } = require('../../utils/pagination');

function err(statusCode, publicMessage) {
  const e = new Error(publicMessage);
  e.statusCode = statusCode;
  e.publicMessage = publicMessage;
  return e;
}

function isAdmin(user) {
  return user && user.role === 'ADMIN';
}

async function getListingOwner(id) {
  const [rows] = await db.query(
    'SELECT id, seller_id, status FROM listings WHERE id = :id LIMIT 1',
    { id }
  );
  return rows[0] || null;
}

async function createListing(user, data) {
  if (!user?.id) throw err(401, 'Unauthorized');

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [ins] = await conn.query(
      `INSERT INTO listings (
        seller_id, status, vehicle_type, make, model, model_variant, year,
        condition_type, price_lkr, mileage_km, fuel_type, transmission,
        district_id, city_id, title, description,
        expires_at
      ) VALUES (
        :seller_id, 'ACTIVE', :vehicle_type, :make, :model, :model_variant, :year,
        :condition_type, :price_lkr, :mileage_km, :fuel_type, :transmission,
        :district_id, :city_id, :title, :description,
        :expires_at
      )`,
      {
        seller_id: user.id,
        ...data,
        expires_at: expiresAt,
      }
    );

    const listingId = ins.insertId;

    // normalize image sort_order (0..9 unique)
    const images = [...data.images]
      .sort((a, b) => a.sort_order - b.sort_order)
      .slice(0, 10)
      .map((img, idx) => ({ url: img.url, sort_order: idx }));

    for (const img of images) {
      await conn.query(
        'INSERT INTO listing_images (listing_id, url, sort_order) VALUES (:listing_id, :url, :sort_order)',
        { listing_id: listingId, url: img.url, sort_order: img.sort_order }
      );
    }

    await conn.commit();

    return await getListingById(listingId);
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

async function getListingById(id) {
  const [rows] = await db.query(
    `SELECT
      l.*,
      d.name AS district_name,
      c.name AS city_name,
      u.id AS seller_id,
      u.full_name AS seller_display_name,
      u.phone,
      u.role,
      u.created_at AS seller_member_since
    FROM listings l
    JOIN districts d ON d.id = l.district_id
    JOIN cities c ON c.id = l.city_id
    JOIN users u ON u.id = l.seller_id
    WHERE l.id = :id
    LIMIT 1`,
    { id }
  );

  if (!rows.length) return null;

  const listing = rows[0];

  const [imgs] = await db.query(
    'SELECT id, url, sort_order FROM listing_images WHERE listing_id = :id ORDER BY sort_order ASC',
    { id }
  );

  listing.images = imgs;
  return listing;
}

async function updateListing(user, id, patch) {
  if (!user?.id) throw err(401, 'Unauthorized');

  const owner = await getListingOwner(id);
  if (!owner) throw err(404, 'Not found');
  if (!isAdmin(user) && owner.seller_id !== user.id)
    throw err(403, 'Forbidden');

  // allow update only if not REMOVED
  if (owner.status === 'REMOVED') throw err(400, 'Listing removed');

  const keys = Object.keys(patch);
  if (!keys.length) return;

  // dynamic SET
  const setParts = keys.map((k) => `${k} = :${k}`);
  const sql = `UPDATE listings SET ${setParts.join(', ')} WHERE id = :id`;
  await db.query(sql, { ...patch, id });
}

async function deleteListing(user, id) {
  if (!user?.id) throw err(401, 'Unauthorized');

  const owner = await getListingOwner(id);
  if (!owner) throw err(404, 'Not found');
  if (!isAdmin(user) && owner.seller_id !== user.id)
    throw err(403, 'Forbidden');

  // soft delete to REMOVED (keeps history)
  await db.query("UPDATE listings SET status = 'REMOVED' WHERE id = :id", {
    id,
  });
}

async function setListingStatus(user, id, status) {
  if (!user?.id) throw err(401, 'Unauthorized');

  const owner = await getListingOwner(id);
  if (!owner) throw err(404, 'Not found');
  if (!isAdmin(user) && owner.seller_id !== user.id)
    throw err(403, 'Forbidden');

  if (owner.status === 'REMOVED') throw err(400, 'Listing removed');

  // basic rules
  if (status === 'PAUSED' && owner.status !== 'ACTIVE')
    throw err(400, 'Only ACTIVE can be paused');
  if (status === 'ACTIVE' && !['PAUSED', 'EXPIRED'].includes(owner.status)) {
    throw err(400, 'Only PAUSED/EXPIRED can be activated');
  }

  await db.query('UPDATE listings SET status = :status WHERE id = :id', {
    status,
    id,
  });
}

async function renewListing(user, id) {
  if (!user?.id) throw err(401, 'Unauthorized');

  const owner = await getListingOwner(id);
  if (!owner) throw err(404, 'Not found');
  if (!isAdmin(user) && owner.seller_id !== user.id)
    throw err(403, 'Forbidden');
  if (owner.status === 'REMOVED') throw err(400, 'Listing removed');

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // if expired -> active, else keep status as-is but bump dates
  const newStatus = owner.status === 'EXPIRED' ? 'ACTIVE' : owner.status;

  await db.query(
    'UPDATE listings SET renewed_at = NOW(), expires_at = :expires_at, status = :status WHERE id = :id',
    { expires_at: expiresAt, status: newStatus, id }
  );
}

async function searchListings(qs) {
  const { page, pageSize, offset } = getPagination(qs);

  const where = ["l.status IN ('ACTIVE','PAUSED')"]; // keep it simple for MVP
  const params = {};

  // search text
  if (qs.q && String(qs.q).trim()) {
    where.push(
      'MATCH(l.make, l.model, l.model_variant, l.title, l.description) AGAINST (:q IN BOOLEAN MODE)'
    );
    params.q = String(qs.q).trim();
  }

  // filters
  const addEq = (field, key) => {
    if (qs[key] !== undefined && qs[key] !== '') {
      where.push(`${field} = :${key}`);
      params[key] = qs[key];
    }
  };

  addEq('l.vehicle_type', 'vehicle_type');
  addEq('l.make', 'make');
  addEq('l.model', 'model');

  if (qs.district_id) {
    where.push('l.district_id = :district_id');
    params.district_id = Number(qs.district_id);
  }
  if (qs.city_id) {
    where.push('l.city_id = :city_id');
    params.city_id = Number(qs.city_id);
  }

  if (qs.min_price) {
    where.push('l.price_lkr >= :min_price');
    params.min_price = Number(qs.min_price);
  }
  if (qs.max_price) {
    where.push('l.price_lkr <= :max_price');
    params.max_price = Number(qs.max_price);
  }

  if (qs.min_year) {
    where.push('l.year >= :min_year');
    params.min_year = Number(qs.min_year);
  }
  if (qs.max_year) {
    where.push('l.year <= :max_year');
    params.max_year = Number(qs.max_year);
  }

  if (qs.min_mileage) {
    where.push('l.mileage_km >= :min_mileage');
    params.min_mileage = Number(qs.min_mileage);
  }
  if (qs.max_mileage) {
    where.push('l.mileage_km <= :max_mileage');
    params.max_mileage = Number(qs.max_mileage);
  }

  // sort
  let orderBy = 'l.created_at DESC';
  if (qs.sort === 'PRICE_ASC') orderBy = 'l.price_lkr ASC';
  if (qs.sort === 'PRICE_DESC') orderBy = 'l.price_lkr DESC';

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const [countRows] = await db.query(
    `SELECT COUNT(*) AS total FROM listings l ${whereSql}`,
    params
  );
  const total = Number(countRows[0]?.total || 0);

  const [rows] = await db.query(
    `SELECT
      l.id, l.seller_id, l.status, l.vehicle_type, l.make, l.model, l.model_variant,
      l.year, l.condition_type, l.price_lkr, l.mileage_km, l.fuel_type, l.transmission,
      l.district_id, d.name AS district_name, l.city_id, c.name AS city_name,
      l.price_label, l.market_estimate_lkr, l.is_featured, l.is_highlighted, l.boost_until,
      l.created_at, l.renewed_at, l.expires_at
     FROM listings l
     JOIN districts d ON d.id = l.district_id
     JOIN cities c ON c.id = l.city_id
     ${whereSql}
     ORDER BY ${orderBy}
     LIMIT :limit OFFSET :offset`,
    { ...params, limit: pageSize, offset }
  );

  // attach 1 thumbnail each (first image)
  const ids = rows.map((r) => r.id);
  if (!ids.length) return { items: [], page, page_size: pageSize, total };

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
  const items = rows.map((r) => ({
    ...r,
    thumbnail_url: thumbMap.get(r.id) || null,
  }));

  return { items, page, page_size: pageSize, total };
}

module.exports = {
  createListing,
  getListingById,
  updateListing,
  deleteListing,
  setListingStatus,
  renewListing,
  searchListings,
};
