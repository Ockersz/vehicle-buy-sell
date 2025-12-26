const { z } = require('zod');
const { db } = require('../../config/db');
const { getPagination } = require('../../utils/pagination');

function err(statusCode, publicMessage) {
  const e = new Error(publicMessage);
  e.statusCode = statusCode;
  e.publicMessage = publicMessage;
  return e;
}

const UserStatusSchema = z
  .object({
    status: z.enum(['ACTIVE', 'SUSPENDED', 'BANNED']),
    suspended_until: z.string().datetime().optional().nullable(),
    note: z.string().max(2000).optional().nullable(),
  })
  .strict();

const RemoveListingSchema = z
  .object({
    note: z.string().max(2000).optional().nullable(),
  })
  .strict();

const FlagSchema = z
  .object({
    enabled: z.boolean(),
    note: z.string().max(2000).optional().nullable(),
  })
  .strict();

const ReportUpdateSchema = z
  .object({
    status: z.enum(['OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED']).optional(),
    admin_note: z.string().max(2000).optional().nullable(),

    // optional auto-actions (on RESOLVED usually)
    action: z
      .enum(['NONE', 'REMOVE_LISTING', 'SUSPEND_USER', 'BAN_USER'])
      .optional()
      .default('NONE'),
    suspended_until: z.string().datetime().optional().nullable(),
  })
  .strict();

async function logAdminAction(adminId, action, targetType, targetId, note) {
  await db.query(
    `INSERT INTO admin_actions (admin_id, action, target_type, target_id, note)
     VALUES (:admin_id, :action, :target_type, :target_id, :note)`,
    {
      admin_id: adminId,
      action,
      target_type: targetType,
      target_id: targetId,
      note: note || null,
    }
  );
}

async function listUsers(qs) {
  const { page, pageSize, offset } = getPagination(qs);

  const where = [];
  const params = { limit: pageSize, offset };

  if (qs.q && String(qs.q).trim()) {
    where.push('(u.phone LIKE :q)');
    params.q = `%${String(qs.q).trim()}%`;
  }
  if (qs.status) {
    where.push('u.status = :status');
    params.status = String(qs.status);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const [countRows] = await db.query(
    `SELECT COUNT(*) AS total FROM users u ${whereSql}`,
    params
  );
  const total = Number(countRows[0]?.total || 0);

  const [rows] = await db.query(
    `SELECT u.id, u.phone, u.role, u.status, u.suspended_until, u.created_at
     FROM users u
     ${whereSql}
     ORDER BY u.created_at DESC
     LIMIT :limit OFFSET :offset`,
    params
  );

  return { items: rows, page, page_size: pageSize, total };
}

async function updateUserStatus(adminUser, userId, body) {
  if (!adminUser?.id) throw err(401, 'Unauthorized');
  if (adminUser.id === userId)
    throw err(400, 'You cannot change your own status');

  const parsed = UserStatusSchema.safeParse(body);
  if (!parsed.success) throw err(400, 'Invalid body');

  const { status, suspended_until, note } = parsed.data;

  const [exists] = await db.query(
    'SELECT id FROM users WHERE id = :id LIMIT 1',
    { id: userId }
  );
  if (!exists.length) throw err(404, 'User not found');

  let susUntil = null;
  if (status === 'SUSPENDED') {
    if (!suspended_until)
      throw err(400, 'suspended_until required when status=SUSPENDED');
    susUntil = suspended_until;
  }

  await db.query(
    `UPDATE users
     SET status = :status, suspended_until = :suspended_until
     WHERE id = :id`,
    { status, suspended_until: susUntil, id: userId }
  );

  await logAdminAction(adminUser.id, `${status}_USER`, 'USER', userId, note);
}

async function removeListing(adminUser, listingId, body) {
  if (!adminUser?.id) throw err(401, 'Unauthorized');

  const parsed = RemoveListingSchema.safeParse(body || {});
  if (!parsed.success) throw err(400, 'Invalid body');

  const [exists] = await db.query(
    'SELECT id FROM listings WHERE id = :id LIMIT 1',
    { id: listingId }
  );
  if (!exists.length) throw err(404, 'Listing not found');

  await db.query("UPDATE listings SET status = 'REMOVED' WHERE id = :id", {
    id: listingId,
  });
  await logAdminAction(
    adminUser.id,
    'REMOVE_LISTING',
    'LISTING',
    listingId,
    parsed.data.note
  );
}

async function setFeatured(adminUser, listingId, body) {
  if (!adminUser?.id) throw err(401, 'Unauthorized');

  const parsed = FlagSchema.safeParse(body);
  if (!parsed.success) throw err(400, 'Invalid body');

  const [exists] = await db.query(
    'SELECT id FROM listings WHERE id = :id LIMIT 1',
    { id: listingId }
  );
  if (!exists.length) throw err(404, 'Listing not found');

  await db.query('UPDATE listings SET is_featured = :v WHERE id = :id', {
    v: parsed.data.enabled ? 1 : 0,
    id: listingId,
  });

  await logAdminAction(
    adminUser.id,
    parsed.data.enabled ? 'FEATURE_LISTING' : 'UNFEATURE_LISTING',
    'LISTING',
    listingId,
    parsed.data.note
  );
}

async function setHighlighted(adminUser, listingId, body) {
  if (!adminUser?.id) throw err(401, 'Unauthorized');

  const parsed = FlagSchema.safeParse(body);
  if (!parsed.success) throw err(400, 'Invalid body');

  const [exists] = await db.query(
    'SELECT id FROM listings WHERE id = :id LIMIT 1',
    { id: listingId }
  );
  if (!exists.length) throw err(404, 'Listing not found');

  await db.query('UPDATE listings SET is_highlighted = :v WHERE id = :id', {
    v: parsed.data.enabled ? 1 : 0,
    id: listingId,
  });

  await logAdminAction(
    adminUser.id,
    parsed.data.enabled ? 'HIGHLIGHT_LISTING' : 'UNHIGHLIGHT_LISTING',
    'LISTING',
    listingId,
    parsed.data.note
  );
}

async function listReports(qs) {
  const { page, pageSize, offset } = getPagination(qs);

  const where = [];
  const params = { limit: pageSize, offset };

  if (qs.status) {
    where.push('r.status = :status');
    params.status = String(qs.status);
  }
  if (qs.entity_type) {
    where.push('r.entity_type = :entity_type');
    params.entity_type = String(qs.entity_type);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const [countRows] = await db.query(
    `SELECT COUNT(*) AS total FROM reports r ${whereSql}`,
    params
  );
  const total = Number(countRows[0]?.total || 0);

  const [rows] = await db.query(
    `SELECT
      r.*,
      u.phone AS reporter_phone
     FROM reports r
     JOIN users u ON u.id = r.reporter_id
     ${whereSql}
     ORDER BY r.created_at DESC
     LIMIT :limit OFFSET :offset`,
    params
  );

  return { items: rows, page, page_size: pageSize, total };
}

async function updateReport(adminUser, reportId, body) {
  if (!adminUser?.id) throw err(401, 'Unauthorized');

  const parsed = ReportUpdateSchema.safeParse(body || {});
  if (!parsed.success) throw err(400, 'Invalid body');
  const { status, admin_note, action, suspended_until } = parsed.data;

  const [rows] = await db.query(
    'SELECT * FROM reports WHERE id = :id LIMIT 1',
    { id: reportId }
  );
  if (!rows.length) throw err(404, 'Report not found');
  const report = rows[0];

  // Update report fields
  const fields = [];
  const params = { id: reportId };

  if (status !== undefined) {
    fields.push('status = :status');
    params.status = status;
    fields.push('reviewed_by = :reviewed_by');
    params.reviewed_by = adminUser.id;
    fields.push('reviewed_at = NOW()');
  }
  if (admin_note !== undefined) {
    fields.push('admin_note = :admin_note');
    params.admin_note = admin_note || null;
  }

  if (fields.length) {
    await db.query(
      `UPDATE reports SET ${fields.join(', ')} WHERE id = :id`,
      params
    );
  }

  // Optional moderation action
  if (!action || action === 'NONE') return;

  if (action === 'REMOVE_LISTING') {
    if (report.entity_type !== 'LISTING')
      throw err(400, 'REMOVE_LISTING only valid for LISTING reports');
    await db.query("UPDATE listings SET status = 'REMOVED' WHERE id = :id", {
      id: report.entity_id,
    });
    await logAdminAction(
      adminUser.id,
      'REMOVE_LISTING',
      'LISTING',
      report.entity_id,
      admin_note || null
    );
    return;
  }

  if (action === 'BAN_USER') {
    if (report.entity_type !== 'USER')
      throw err(400, 'BAN_USER only valid for USER reports');
    await db.query(
      "UPDATE users SET status = 'BANNED', suspended_until = NULL WHERE id = :id",
      { id: report.entity_id }
    );
    await logAdminAction(
      adminUser.id,
      'BANNED_USER',
      'USER',
      report.entity_id,
      admin_note || null
    );
    return;
  }

  if (action === 'SUSPEND_USER') {
    if (report.entity_type !== 'USER')
      throw err(400, 'SUSPEND_USER only valid for USER reports');
    if (!suspended_until)
      throw err(400, 'suspended_until required for SUSPEND_USER');
    await db.query(
      "UPDATE users SET status = 'SUSPENDED', suspended_until = :su WHERE id = :id",
      { su: suspended_until, id: report.entity_id }
    );
    await logAdminAction(
      adminUser.id,
      'SUSPENDED_USER',
      'USER',
      report.entity_id,
      admin_note || null
    );
    return;
  }
}

module.exports = {
  listUsers,
  updateUserStatus,
  removeListing,
  setFeatured,
  setHighlighted,
  listReports,
  updateReport,
};
