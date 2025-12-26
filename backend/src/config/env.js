require('dotenv').config();
const { z } = require('zod');

const EnvSchema = z.object({
  PORT: z.string().default('4000'),
  NODE_ENV: z.string().default('development'),

  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_ACCESS_TTL_SECONDS: z.coerce.number().default(900),
  JWT_REFRESH_TTL_SECONDS: z.coerce.number().default(2592000),

  MYSQL_HOST: z.string(),
  MYSQL_PORT: z.coerce.number().default(3306),
  MYSQL_USER: z.string(),
  MYSQL_PASSWORD: z.string().optional().default(''),
  MYSQL_DATABASE: z.string(),

  S3_PROVIDER: z.enum(['minio', 'aws']).default('minio'),
  S3_REGION: z.string().default('auto'),
  S3_ENDPOINT: z.string().optional(),
  S3_FORCE_PATH_STYLE: z.coerce.boolean().default(true),

  S3_ACCESS_KEY_ID: z.string(),
  S3_SECRET_ACCESS_KEY: z.string(),
  S3_BUCKET: z.string(),
  S3_PUBLIC_BASE_URL: z.string(),

  OTP_TTL_SECONDS: z.coerce.number().default(300),
  OTP_COOLDOWN_SECONDS: z.coerce.number().default(30),
  OTP_DEV_FIXED: z.string().optional(),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  throw new Error('Invalid env: ' + parsed.error.message);
}

const d = parsed.data;

const config = {
  port: Number(d.PORT),
  nodeEnv: d.NODE_ENV,

  jwt: {
    accessSecret: d.JWT_ACCESS_SECRET,
    refreshSecret: d.JWT_REFRESH_SECRET,
    accessTtlSeconds: d.JWT_ACCESS_TTL_SECONDS,
    refreshTtlSeconds: d.JWT_REFRESH_TTL_SECONDS,
  },

  mysql: {
    host: d.MYSQL_HOST,
    port: d.MYSQL_PORT,
    user: d.MYSQL_USER,
    password: d.MYSQL_PASSWORD,
    database: d.MYSQL_DATABASE,
  },

  s3: {
    provider: d.S3_PROVIDER,
    region: d.S3_REGION,
    endpoint: d.S3_ENDPOINT,
    forcePathStyle: d.S3_FORCE_PATH_STYLE,
    accessKeyId: d.S3_ACCESS_KEY_ID,
    secretAccessKey: d.S3_SECRET_ACCESS_KEY,
    bucket: d.S3_BUCKET,
    publicBaseUrl: d.S3_PUBLIC_BASE_URL.replace(/\/$/, ''),
  },

  otp: {
    ttlSeconds: d.OTP_TTL_SECONDS,
    cooldownSeconds: d.OTP_COOLDOWN_SECONDS,
    devFixed: d.OTP_DEV_FIXED,
  },
};

module.exports = { config };
