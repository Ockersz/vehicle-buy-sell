const { S3Client } = require('@aws-sdk/client-s3');
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

module.exports = { s3 };
