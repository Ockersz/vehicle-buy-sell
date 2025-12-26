const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { config } = require('./env');

/**
 * S3 client that works with:
 * - MinIO (open source S3) via custom endpoint + path-style
 * - AWS S3 later by switching env (S3_PROVIDER=aws)
 */
function createS3Client() {
  const base = {
    region: config.s3.region,
    credentials: {
      accessKeyId: config.s3.accessKeyId,
      secretAccessKey: config.s3.secretAccessKey,
    },
  };

  if (config.s3.provider === 'minio') {
    if (!config.s3.endpoint)
      throw new Error('S3_ENDPOINT is required for minio provider');
    return new S3Client({
      ...base,
      endpoint: config.s3.endpoint,
      forcePathStyle: !!config.s3.forcePathStyle,
    });
  }

  // aws
  return new S3Client(base);
}

const s3 = createS3Client();

async function presignPut({
  bucket,
  key,
  contentType,
  expiresInSeconds = 300,
}) {
  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3, cmd, { expiresIn: expiresInSeconds });
}

async function deleteObject({ bucket, key }) {
  const cmd = new DeleteObjectCommand({ Bucket: bucket, Key: key });
  await s3.send(cmd);
}

const s3Bucket = config.s3.bucket;
const s3PublicBaseUrl = config.s3.publicBaseUrl; // already trimmed in env.js

module.exports = { s3, presignPut, deleteObject, s3Bucket, s3PublicBaseUrl };
