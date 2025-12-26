const { z } = require('zod');
const { db } = require('../../config/db');
const { getPagination } = require('../../utils/pagination');

function err(statusCode, publicMessage) {
  const e = new Error(publicMessage);
  e.statusCode = statusCode;
  e.publicMessage = publicMessage;
  return e;
}

const EntityType = z.enum(['LISTING', 'USER', 'OFFER']);
const Reason = z.enum(['SCAM', 'SPAM', 'ABUSE', 'WRONG_INFO', 'OTHER']);
const Status = z.enum(['OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED']);

const CreateReportSchema = z
  .object({
    entity_type: EntityType,
    entity_id: z.number().int().positive(),
    reason: Reason,
    description: z.string().max(2000).optional().nullable(),
  })
  .strict();

const AdminUpdateSchema = z
  .object({
    status: Status.optional(),
    admin_note: z.string().max(2000).optional().nullable(),
  })
  .strict();

async function ensureEntityExists(entity_type, entity_id) {
  if (entity_type === 'LISTING') {
    const [rows] = await db.query(
      'SELECT id FROM listings WHERE id = :id LIMIT 1',
      { id: entity_id }
    );
    return !!rows.length;
  }
  if (entity_type === 'USER') {
    const [rows] = await db.query(
      'SELECT id FROM users WHERE id = :id LIMIT 1',
      { id: entity_id }
    );
    return !!rows.length;
  }
  if (entity_type === 'OFFER') {
    const [rows] = await db.query(
      'SELECT id FROM offers WHERE id = :id LIMIT 1',
      { id: entity_id }
    );
    return !!rows.length;
  }
  return false;
}

async function createReport(user, body) {
  if (!user?.id) throw err(401, 'Unauthorized');

  const parsed = CreateReportSchema.safeParse(body);
  if (!parsed.success) throw err(400, 'Invalid body');

  const { entity_type, entity_id, reason, description } = parsed.data;

  const exists = await ensureEntityExists(entity_type, entity_id);
  if (!exists) throw err(404, 'Target not found');

  // prevent spam duplicates (same reporter + same target + still OPEN/IN_REVIEW)
  const [dup] = await db.query(
    `SELECT id FROM reports
     WHERE reporter_id = :reporter_id
       AND entity_type = :entity_type
       AND entity_id = :entity_id
       AND status IN ('OPEN','IN_REVIEW')
     LIMIT 1`,
    { reporter_id: user.id, entity_type, entity_id }
  );
  if (dup.length) throw err(400, 'You already reported this (pending review)');

  const [ins] = await db.query(
    `INSERT INTO reports (reporter_id, entity_type, entity_id, reason, description)
     VALUES (:reporter_id, :entity_type, :entity_id, :reason, :description)`,
    {
      reporter_id: user.id,
      entity_type,
      entity_id,
      reason,
      description: description || null,
    }
  );

  const [rows] = await db.query(
    'SELECT * FROM reports WHERE id = :id LIMIT 1',
    { id: ins.insertId }
  );
  return rows[0];
}

async function listMyReports(user, qs) {
  if (!user?.id) throw err(401, 'Unauthorized');

  const { page, pageSize, offset } = getPagination(qs);

  const [countRows] = await db.query(
    'SELECT COUNT(*) AS total FROM reports WHERE reporter_id = :reporter_id',
    { reporter_id: user.id }
  );
  const total = Number(countRows[0]?.total || 0);

  const [rows] = await db.query(
    `SELECT id, entity_type, entity_id, reason, description, status, admin_note, created_at, updated_at, reviewed_at
     FROM reports
     WHERE reporter_id = :reporter_id
     ORDER BY created_at DESC
     LIMIT :limit OFFSET :offset`,
    { reporter_id: user.id, limit: pageSize, offset }
  );

  return { items: rows, page, page_size: pageSize, total };
}

async function adminListReports(qs) {
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

async function adminUpdateReport(adminUser, reportId, body) {
  if (!adminUser?.id) throw err(401, 'Unauthorized');

  const parsed = AdminUpdateSchema.safeParse(body);
  if (!parsed.success) throw err(400, 'Invalid body');

  const patch = parsed.data;

  const [rows] = await db.query(
    'SELECT * FROM reports WHERE id = :id LIMIT 1',
    { id: reportId }
  );
  if (!rows.length) throw err(404, 'Not found');

  const fields = [];
  const params = { id: reportId };

  if (patch.status !== undefined) {
    fields.push('status = :status');
    params.status = patch.status;
    fields.push('reviewed_by = :reviewed_by');
    params.reviewed_by = adminUser.id;
    fields.push('reviewed_at = NOW()');
  }

  if (patch.admin_note !== undefined) {
    fields.push('admin_note = :admin_note');
    params.admin_note = patch.admin_note || null;
  }

  if (!fields.length) return;

  await db.query(
    `UPDATE reports SET ${fields.join(', ')} WHERE id = :id`,
    params
  );
}

module.exports = {
  createReport,
  listMyReports,
  adminListReports,
  adminUpdateReport,
};
