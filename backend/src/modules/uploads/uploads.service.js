const crypto = require('crypto');
const { z } = require('zod');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3 } = require('../../config/r2');
const { config } = require('../../config/env');

const PresignSchema = z.object({
  count: z.number().int().min(1).max(10),
  folder: z.string().optional().default('listings'),
  contentType: z.string().optional().default('image/jpeg'),
});

async function presignMany(user, body) {
  const parsed = PresignSchema.safeParse(body);
  if (!parsed.success) throw _err(400, 'Invalid body');

  const { count, folder, contentType } = parsed.data;

  const items = [];
  for (let i = 0; i < count; i++) {
    const id = crypto.randomUUID();
    const ext =
      contentType === 'image/png'
        ? 'png'
        : contentType === 'image/webp'
        ? 'webp'
        : 'jpg';

    const key = `${folder}/${user.id}/${Date.now()}_${id}.${ext}`;

    const cmd = new PutObjectCommand({
      Bucket: config.s3.bucket,
      Key: key,
      ContentType: contentType,
    });

    const upload_url = await getSignedUrl(s3, cmd, { expiresIn: 60 });
    const public_url = `${config.s3.publicBaseUrl}/${key}`;

    items.push({ upload_url, public_url, key });
  }

  return items;
}

function _err(statusCode, publicMessage) {
  const e = new Error(publicMessage);
  e.statusCode = statusCode;
  e.publicMessage = publicMessage;
  return e;
}

module.exports = { presignMany };
