const { z } = require('zod');
const { db } = require('../../config/db');
const { getPagination } = require('../../utils/pagination');

function err(statusCode, publicMessage) {
  const e = new Error(publicMessage);
  e.statusCode = statusCode;
  e.publicMessage = publicMessage;
  return e;
}

const PrefsPatchSchema = z
  .object({
    in_app_enabled: z.boolean().optional(),
    email_enabled: z.boolean().optional(),
    sms_enabled: z.boolean().optional(),
    push_enabled: z.boolean().optional(),
  })
  .strict();

const TestNotificationSchema = z.object({
  type: z.string().max(40).optional().default('SYSTEM'),
  title: z.string().min(1).max(160).optional().default('Test notification'),
  body: z.string().max(2000).optional().nullable(),
  data: z.record(z.any()).optional().nullable(),
});

async function ensurePrefs(userId) {
  await db.query(
    'INSERT IGNORE INTO notification_preferences (user_id) VALUES (:user_id)',
    { user_id: userId }
  );
}

async function getPreferences(user) {
  if (!user?.id) throw err(401, 'Unauthorized');
  await ensurePrefs(user.id);

  const [rows] = await db.query(
    'SELECT * FROM notification_preferences WHERE user_id = :user_id LIMIT 1',
    { user_id: user.id }
  );
  return rows[0];
}

async function updatePreferences(user, body) {
  if (!user?.id) throw err(401, 'Unauthorized');
  await ensurePrefs(user.id);

  const parsed = PrefsPatchSchema.safeParse(body);
  if (!parsed.success) throw err(400, 'Invalid body');

  const patch = parsed.data;
  const fields = [];
  const params = { user_id: user.id };

  for (const k of [
    'in_app_enabled',
    'email_enabled',
    'sms_enabled',
    'push_enabled',
  ]) {
    if (patch[k] !== undefined) {
      fields.push(`${k} = :${k}`);
      params[k] = patch[k] ? 1 : 0;
    }
  }

  if (fields.length) {
    await db.query(
      `UPDATE notification_preferences SET ${fields.join(
        ', '
      )} WHERE user_id = :user_id`,
      params
    );
  }

  return await getPreferences(user);
}

async function listMyNotifications(user, qs) {
  if (!user?.id) throw err(401, 'Unauthorized');

  const { page, pageSize, offset } = getPagination(qs);
  const unreadOnly = String(qs.unread_only || '0') === '1';

  const where = ['user_id = :user_id'];
  const params = { user_id: user.id, limit: pageSize, offset };
  if (unreadOnly) where.push('is_read = 0');

  const whereSql = `WHERE ${where.join(' AND ')}`;

  const [countRows] = await db.query(
    `SELECT COUNT(*) AS total FROM notifications ${whereSql}`,
    { user_id: user.id }
  );
  const total = Number(countRows[0]?.total || 0);

  const [rows] = await db.query(
    `SELECT id, type, title, body, data_json, is_read, created_at
     FROM notifications
     ${whereSql}
     ORDER BY created_at DESC
     LIMIT :limit OFFSET :offset`,
    params
  );

  const items = rows.map((r) => ({
    ...r,
    data: r.data_json
      ? typeof r.data_json === 'string'
        ? JSON.parse(r.data_json)
        : r.data_json
      : null,
  }));

  return { items, page, page_size: pageSize, total };
}

async function markRead(user, { ids, mark_all }) {
  if (!user?.id) throw err(401, 'Unauthorized');

  if (mark_all) {
    await db.query(
      'UPDATE notifications SET is_read = 1 WHERE user_id = :user_id',
      { user_id: user.id }
    );
    return;
  }

  if (!Array.isArray(ids) || ids.length === 0)
    throw err(400, 'ids required (or mark_all=true)');
  const clean = ids.map(Number).filter((n) => Number.isFinite(n));
  if (!clean.length) throw err(400, 'Invalid ids');

  await db.query(
    `UPDATE notifications
     SET is_read = 1
     WHERE user_id = :user_id AND id IN (${clean.map(() => '?').join(',')})`,
    [user.id, ...clean]
  );
}

async function createTestNotification(user, body) {
  if (!user?.id) throw err(401, 'Unauthorized');

  const parsed = TestNotificationSchema.safeParse(body || {});
  if (!parsed.success) throw err(400, 'Invalid body');

  const { type, title, body: text, data } = parsed.data;

  const [ins] = await db.query(
    `INSERT INTO notifications (user_id, type, title, body, data_json)
     VALUES (:user_id, :type, :title, :body, :data_json)`,
    {
      user_id: user.id,
      type,
      title,
      body: text || null,
      data_json: data ? JSON.stringify(data) : null,
    }
  );

  const [rows] = await db.query(
    'SELECT * FROM notifications WHERE id = :id LIMIT 1',
    { id: ins.insertId }
  );
  return rows[0];
}

module.exports = {
  getPreferences,
  updatePreferences,
  listMyNotifications,
  markRead,
  createTestNotification,
};
