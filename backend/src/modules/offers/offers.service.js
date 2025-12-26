const { db } = require('../../config/db');
const { getPagination } = require('../../utils/pagination');

function err(statusCode, publicMessage) {
  const e = new Error(publicMessage);
  e.statusCode = statusCode;
  e.publicMessage = publicMessage;
  return e;
}

async function createInAppNotification(userId, { type, title, body, data }) {
  // respect preferences (default row might not exist yet)
  const [prefsRows] = await db.query(
    'SELECT in_app_enabled FROM notification_preferences WHERE user_id = :user_id LIMIT 1',
    { user_id: userId }
  );

  // If no prefs row => treat as enabled
  const inAppEnabled = prefsRows.length ? !!prefsRows[0].in_app_enabled : true;
  if (!inAppEnabled) return;

  await db.query(
    `INSERT INTO notifications (user_id, type, title, body, data_json)
     VALUES (:user_id, :type, :title, :body, :data_json)`,
    {
      user_id: userId,
      type,
      title,
      body: body || null,
      data_json: data ? JSON.stringify(data) : null,
    }
  );
}

function isAdmin(user) {
  return user && user.role === 'ADMIN';
}

async function createOffer(user, listingId, amountLkr, message) {
  if (!user?.id) throw err(401, 'Unauthorized');

  const [lRows] = await db.query(
    'SELECT id, seller_id, status FROM listings WHERE id = :id LIMIT 1',
    { id: listingId }
  );
  if (!lRows.length) throw err(404, 'Listing not found');

  const listing = lRows[0];
  if (listing.status === 'REMOVED') throw err(400, 'Listing removed');
  if (listing.seller_id === user.id)
    throw err(400, 'You cannot offer on your own listing');

  const [ins] = await db.query(
    `INSERT INTO offers (listing_id, buyer_id, seller_id, amount_lkr, message, status)
     VALUES (:listing_id, :buyer_id, :seller_id, :amount_lkr, :message, 'PENDING')`,
    {
      listing_id: listingId,
      buyer_id: user.id,
      seller_id: listing.seller_id,
      amount_lkr: amountLkr,
      message,
    }
  );

  // Notify seller: OFFER_RECEIVED
  await createInAppNotification(listing.seller_id, {
    type: 'OFFER_RECEIVED',
    title: 'New offer received',
    body: `You received an offer of LKR ${Number(
      amountLkr
    ).toLocaleString()} on your listing.`,
    data: { offer_id: ins.insertId, listing_id: listingId, buyer_id: user.id },
  });

  const [rows] = await db.query('SELECT * FROM offers WHERE id = :id LIMIT 1', {
    id: ins.insertId,
  });
  return rows[0];
}

async function listSellerInbox(user, qs) {
  if (!user?.id) throw err(401, 'Unauthorized');

  const { pageSize, offset } = getPagination(qs);
  const params = { seller_id: user.id, limit: pageSize, offset };

  let where = 'o.seller_id = :seller_id';
  if (qs.status) {
    where += ' AND o.status = :status';
    params.status = String(qs.status);
  }

  const [rows] = await db.query(
    `SELECT
      o.*,
      l.vehicle_type, l.make, l.model, l.year, l.price_lkr,
      d.name AS district_name, c.name AS city_name
     FROM offers o
     JOIN listings l ON l.id = o.listing_id
     JOIN districts d ON d.id = l.district_id
     JOIN cities c ON c.id = l.city_id
     WHERE ${where}
     ORDER BY o.created_at DESC
     LIMIT :limit OFFSET :offset`,
    params
  );

  return rows;
}

async function listBuyerOffers(user, qs) {
  if (!user?.id) throw err(401, 'Unauthorized');

  const { pageSize, offset } = getPagination(qs);
  const params = { buyer_id: user.id, limit: pageSize, offset };

  let where = 'o.buyer_id = :buyer_id';
  if (qs.status) {
    where += ' AND o.status = :status';
    params.status = String(qs.status);
  }

  const [rows] = await db.query(
    `SELECT
      o.*,
      l.vehicle_type, l.make, l.model, l.year, l.price_lkr,
      d.name AS district_name, c.name AS city_name
     FROM offers o
     JOIN listings l ON l.id = o.listing_id
     JOIN districts d ON d.id = l.district_id
     JOIN cities c ON c.id = l.city_id
     WHERE ${where}
     ORDER BY o.created_at DESC
     LIMIT :limit OFFSET :offset`,
    params
  );

  return rows;
}

async function updateOffer(
  user,
  offerId,
  { action, counter_amount_lkr, message }
) {
  if (!user?.id) throw err(401, 'Unauthorized');

  const [rows] = await db.query('SELECT * FROM offers WHERE id = :id LIMIT 1', {
    id: offerId,
  });
  if (!rows.length) throw err(404, 'Offer not found');

  const offer = rows[0];

  // only seller (or admin) can accept/counter/decline
  if (!isAdmin(user) && offer.seller_id !== user.id)
    throw err(403, 'Forbidden');

  if (!['PENDING', 'COUNTERED'].includes(offer.status)) {
    throw err(400, 'Offer cannot be updated in current status');
  }

  if (action === 'ACCEPT') {
    await db.query(
      "UPDATE offers SET status = 'ACCEPTED', updated_at = NOW() WHERE id = :id",
      { id: offerId }
    );

    await createInAppNotification(offer.buyer_id, {
      type: 'OFFER_ACCEPTED',
      title: 'Offer accepted',
      body: 'Your offer was accepted by the seller.',
      data: { offer_id: offerId, listing_id: offer.listing_id },
    });

    return;
  }

  if (action === 'DECLINE') {
    await db.query(
      "UPDATE offers SET status = 'DECLINED', updated_at = NOW() WHERE id = :id",
      { id: offerId }
    );

    await createInAppNotification(offer.buyer_id, {
      type: 'OFFER_DECLINED',
      title: 'Offer declined',
      body: 'Your offer was declined by the seller.',
      data: { offer_id: offerId, listing_id: offer.listing_id },
    });

    return;
  }

  // COUNTER
  const counter = Number(counter_amount_lkr);
  if (!Number.isFinite(counter) || counter <= 0) {
    throw err(400, 'counter_amount_lkr required for COUNTER');
  }

  await db.query(
    "UPDATE offers SET status = 'COUNTERED', amount_lkr = :amount_lkr, message = :message, updated_at = NOW() WHERE id = :id",
    { amount_lkr: counter, message, id: offerId }
  );

  await createInAppNotification(offer.buyer_id, {
    type: 'OFFER_COUNTERED',
    title: 'Counter offer received',
    body: `Seller countered with LKR ${counter.toLocaleString()}.`,
    data: { offer_id: offerId, listing_id: offer.listing_id },
  });
}

module.exports = {
  createOffer,
  listSellerInbox,
  listBuyerOffers,
  updateOffer,
};
