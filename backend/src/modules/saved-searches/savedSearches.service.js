const { z } = require('zod');
const { db } = require('../../config/db');

function err(statusCode, publicMessage) {
  const e = new Error(publicMessage);
  e.statusCode = statusCode;
  e.publicMessage = publicMessage;
  return e;
}

const CreateSchema = z.object({
  name: z.string().min(1).max(120),
  // store the exact query params you'd send to GET /listings (as JSON)
  query: z.record(z.any()),
  is_alert_enabled: z.boolean().optional().default(false),
  alert_frequency: z.enum(['INSTANT', 'DAILY', 'WEEKLY']).optional().nullable(),
});

const UpdateSchema = z
  .object({
    name: z.string().min(1).max(120).optional(),
    query: z.record(z.any()).optional(),
    is_alert_enabled: z.boolean().optional(),
    alert_frequency: z
      .enum(['INSTANT', 'DAILY', 'WEEKLY'])
      .optional()
      .nullable(),
  })
  .strict();

async function listSavedSearches(user) {
  if (!user?.id) throw err(401, 'Unauthorized');
  const [rows] = await db.query(
    `SELECT id, user_id, name, query_json, is_alert_enabled, alert_frequency, created_at, updated_at
     FROM saved_searches
     WHERE user_id = :user_id
     ORDER BY created_at DESC`,
    { user_id: user.id }
  );

  return rows.map((r) => ({
    ...r,
    query:
      typeof r.query_json === 'string'
        ? JSON.parse(r.query_json)
        : r.query_json,
  }));
}

async function createSavedSearch(user, body) {
  if (!user?.id) throw err(401, 'Unauthorized');

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) throw err(400, 'Invalid body');

  const { name, query, is_alert_enabled, alert_frequency } = parsed.data;

  const [ins] = await db.query(
    `INSERT INTO saved_searches (user_id, name, query_json, is_alert_enabled, alert_frequency)
     VALUES (:user_id, :name, :query_json, :is_alert_enabled, :alert_frequency)`,
    {
      user_id: user.id,
      name,
      query_json: JSON.stringify(query),
      is_alert_enabled: is_alert_enabled ? 1 : 0,
      alert_frequency: alert_frequency || null,
    }
  );

  const [rows] = await db.query(
    'SELECT * FROM saved_searches WHERE id = :id LIMIT 1',
    { id: ins.insertId }
  );
  const r = rows[0];
  return {
    ...r,
    query:
      typeof r.query_json === 'string'
        ? JSON.parse(r.query_json)
        : r.query_json,
  };
}

async function updateSavedSearch(user, id, body) {
  if (!user?.id) throw err(401, 'Unauthorized');

  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) throw err(400, 'Invalid body');
  const patch = parsed.data;

  const [owned] = await db.query(
    'SELECT id FROM saved_searches WHERE id = :id AND user_id = :user_id LIMIT 1',
    { id, user_id: user.id }
  );
  if (!owned.length) throw err(404, 'Not found');

  const fields = [];
  const params = { id, user_id: user.id };

  if (patch.name !== undefined) {
    fields.push('name = :name');
    params.name = patch.name;
  }
  if (patch.query !== undefined) {
    fields.push('query_json = :query_json');
    params.query_json = JSON.stringify(patch.query);
  }
  if (patch.is_alert_enabled !== undefined) {
    fields.push('is_alert_enabled = :is_alert_enabled');
    params.is_alert_enabled = patch.is_alert_enabled ? 1 : 0;
  }
  if (patch.alert_frequency !== undefined) {
    fields.push('alert_frequency = :alert_frequency');
    params.alert_frequency = patch.alert_frequency || null;
  }

  if (!fields.length) return;

  await db.query(
    `UPDATE saved_searches SET ${fields.join(
      ', '
    )} WHERE id = :id AND user_id = :user_id`,
    params
  );
}

async function deleteSavedSearch(user, id) {
  if (!user?.id) throw err(401, 'Unauthorized');

  const [res] = await db.query(
    'DELETE FROM saved_searches WHERE id = :id AND user_id = :user_id',
    { id, user_id: user.id }
  );
  if (!res.affectedRows) throw err(404, 'Not found');
}

module.exports = {
  listSavedSearches,
  createSavedSearch,
  updateSavedSearch,
  deleteSavedSearch,
};
