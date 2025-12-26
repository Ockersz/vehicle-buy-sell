const crypto = require('crypto');
const { z } = require('zod');
const {
  presignPut,
  deleteObject,
  s3Bucket,
  s3PublicBaseUrl,
} = require('../../config/r2');

function err(statusCode, publicMessage) {
  const e = new Error(publicMessage);
  e.statusCode = statusCode;
  e.publicMessage = publicMessage;
  return e;
}

const PresignSchema = z
  .object({
    file_name: z.string().min(1).max(200),
    content_type: z.string().min(1).max(120),
  })
  .strict();

const PresignMultiSchema = z
  .object({
    files: z.array(PresignSchema).min(1).max(10),
  })
  .strict();

const DeleteSchema = z
  .object({
    key: z.string().min(1).max(500),
  })
  .strict();

function safeExtFromName(name) {
  const m = String(name)
    .toLowerCase()
    .match(/\.([a-z0-9]{1,8})$/);
  return m ? m[1] : 'bin';
}

function randomKey(userId, fileName) {
  const ext = safeExtFromName(fileName);
  const rand = crypto.randomBytes(16).toString('hex');
  const yyyy = new Date().getUTCFullYear();
  return `uploads/${yyyy}/u${userId}/${rand}.${ext}`;
}

function publicUrlForKey(key) {
  return `${s3PublicBaseUrl}/${key}`;
}

async function presignOne(user, body) {
  if (!user?.id) throw err(401, 'Unauthorized');

  const parsed = PresignSchema.safeParse(body);
  if (!parsed.success) throw err(400, 'Invalid body');

  const { file_name, content_type } = parsed.data;

  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(content_type))
    throw err(400, 'Only jpeg/png/webp allowed');

  const key = randomKey(user.id, file_name);

  const upload_url = await presignPut({
    bucket: s3Bucket,
    key,
    contentType: content_type,
    expiresInSeconds: 60 * 5,
  });

  return { upload_url, key, public_url: publicUrlForKey(key) };
}

async function presignMulti(user, body) {
  if (!user?.id) throw err(401, 'Unauthorized');

  const parsed = PresignMultiSchema.safeParse(body);
  if (!parsed.success) throw err(400, 'Invalid body');

  const uploads = [];
  for (const f of parsed.data.files) {
    uploads.push(await presignOne(user, f));
  }

  return { uploads };
}

async function deleteObjectByKey(user, body) {
  if (!user?.id) throw err(401, 'Unauthorized');

  const parsed = DeleteSchema.safeParse(body);
  if (!parsed.success) throw err(400, 'Invalid body');

  const { key } = parsed.data;

  // MVP safety: user can only delete their own keys
  if (!key.includes(`/u${user.id}/`)) throw err(403, 'Forbidden');

  await deleteObject({ bucket: s3Bucket, key });
}

module.exports = { presignOne, presignMulti, deleteObject: deleteObjectByKey };
