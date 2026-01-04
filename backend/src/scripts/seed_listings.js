/* scripts/seed_listings.js */
require('dotenv').config();
const crypto = require('crypto');
const mysql = require('mysql2/promise');
const {
  S3Client,
  PutObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} = require('@aws-sdk/client-s3');

const CFG = {
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'admin@123',
    database: process.env.MYSQL_DATABASE || 'vehicle_buy_sell',
  },
  s3: {
    provider: process.env.S3_PROVIDER || 'minio',
    region: process.env.S3_REGION || 'auto',
    endpoint: process.env.S3_ENDPOINT || 'http://192.168.1.20:9000', // required if minio
    forcePathStyle:
      String(process.env.S3_FORCE_PATH_STYLE || 'true') === 'true',
    accessKeyId: process.env.S3_ACCESS_KEY_ID || 'minioadmin',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'minioadmin123',
    bucket: process.env.S3_BUCKET || 'vehicle-images',
    publicBaseUrl: (
      process.env.S3_PUBLIC_BASE_URL ||
      'http://192.168.1.20:9000/vehicle-images'
    ).replace(/\/$/, ''),
  },
  listingsCount: 50,
};

function must(v, name) {
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}
function slugish(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}
function moneyLkr(baseMin, baseMax) {
  const n = randInt(baseMin, baseMax);
  // round to nearest 50,000
  return Math.round(n / 50000) * 50000;
}

// Tiny 1x1 PNG (valid). We’ll upload many copies with different keys.
const ONE_BY_ONE_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=',
  'base64'
);

function buildS3Client() {
  const base = {
    region: must(CFG.s3.region, 'S3_REGION'),
    credentials: {
      accessKeyId: must(CFG.s3.accessKeyId, 'S3_ACCESS_KEY_ID'),
      secretAccessKey: must(CFG.s3.secretAccessKey, 'S3_SECRET_ACCESS_KEY'),
    },
  };

  if (CFG.s3.provider === 'minio') {
    return new S3Client({
      ...base,
      endpoint: must(CFG.s3.endpoint, 'S3_ENDPOINT'),
      forcePathStyle: CFG.s3.forcePathStyle,
    });
  }
  return new S3Client(base);
}

async function ensureBucket(s3) {
  const Bucket = must(CFG.s3.bucket, 'S3_BUCKET');
  try {
    await s3.send(new HeadBucketCommand({ Bucket }));
  } catch (e) {
    // try create (works in MinIO). If it already exists, ignore.
    try {
      await s3.send(new CreateBucketCommand({ Bucket }));
      console.log(`✅ Created bucket: ${Bucket}`);
    } catch (e2) {
      console.log(`ℹ️ Bucket check/create: ${Bucket} (may already exist)`);
    }
  }
}

function minioPublicUrlForKey(key) {
  return `${must(CFG.s3.publicBaseUrl, 'S3_PUBLIC_BASE_URL')}/${key}`;
}

async function uploadImage(s3, key) {
  const Bucket = CFG.s3.bucket;
  await s3.send(
    new PutObjectCommand({
      Bucket,
      Key: key,
      Body: ONE_BY_ONE_PNG,
      ContentType: 'image/png',
      // If your MinIO policy allows anonymous download, this is enough.
      // If you rely on object ACLs (often disabled), don’t set ACL here.
    })
  );
  return minioPublicUrlForKey(key);
}

async function main() {
  // env sanity
  must(CFG.mysql.host, 'MYSQL_HOST');
  must(CFG.mysql.user, 'MYSQL_USER');
  must(CFG.mysql.database, 'MYSQL_DATABASE');

  const s3 = buildS3Client();
  await ensureBucket(s3);

  const db = await mysql.createPool({
    host: CFG.mysql.host,
    port: CFG.mysql.port,
    user: CFG.mysql.user,
    password: CFG.mysql.password,
    database: CFG.mysql.database,
    namedPlaceholders: true,
    connectionLimit: 10,
  });

  // Load districts/cities
  const [districts] = await db.query(
    `SELECT id, name FROM districts ORDER BY id ASC`
  );
  const [cities] = await db.query(
    `SELECT id, district_id, name FROM cities ORDER BY id ASC`
  );
  if (!districts.length || !cities.length) {
    throw new Error(
      'districts/cities tables look empty. Seed locations first.'
    );
  }

  // Pick sellers/dealers that are profile-complete
  // ADJUST HERE if your role/status field names differ
  const [sellers] = await db.query(
    `SELECT id, role
     FROM users
     WHERE role IN ('SELLER','DEALER')
       AND (profile_completed = 1 OR profile_completed = true)
       AND (status IS NULL OR status = 'ACTIVE')
     LIMIT 50`
  );

  if (!sellers.length) {
    throw new Error(
      'No SELLER/DEALER users with profile_completed=1 found. Create at least 1 seller/dealer and complete profile.'
    );
  }

  const makesModels = [
    {
      make: 'Toyota',
      models: ['Prius', 'Aqua', 'Axio', 'Allion', 'Vitz', 'Hilux'],
    },
    { make: 'Honda', models: ['Fit', 'Vezel', 'Civic', 'Grace', 'CR-V'] },
    { make: 'Nissan', models: ['Leaf', 'X-Trail', 'March', 'Sunny'] },
    { make: 'Suzuki', models: ['Wagon R', 'Swift', 'Alto'] },
    { make: 'Mitsubishi', models: ['Lancer', 'Outlander', 'Pajero'] },
    { make: 'Bajaj', models: ['Pulsar 150', 'Discover 125'] },
    { make: 'Yamaha', models: ['FZ', 'MT-15'] },
  ];

  const vehicleTypes = ['CAR', 'VAN', 'SUV', 'BIKE', 'LORRY'];
  const conditions = ['NEW', 'USED', 'RECONDITIONED'];
  const fuels = ['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC'];
  const transmissions = ['AUTO', 'MANUAL'];

  console.log(`Seeding ${CFG.listingsCount} listings...`);

  for (let i = 0; i < CFG.listingsCount; i++) {
    const seller = pick(sellers);
    const vt = pick(vehicleTypes);

    const mm = pick(makesModels);
    const make = mm.make;
    const model = pick(mm.models);

    const year = randInt(2006, 2025);
    const price = moneyLkr(1500000, 25000000);
    const mileage =
      vt === 'BIKE' ? randInt(5000, 80000) : randInt(20000, 250000);

    // choose city and its district
    const city = pick(cities);
    const districtId = city.district_id;
    const cityId = city.id;

    const title = `${make} ${model} ${year}`;
    const description = `Auto-seeded listing #${
      i + 1
    }. Well maintained. Documents clear.`;

    // Upload 2–6 images to MinIO
    const imgCount = randInt(2, 6);
    const imageUrls = [];

    for (let j = 0; j < imgCount; j++) {
      const rand = crypto.randomBytes(10).toString('hex');
      const key = `seed/listings/${new Date().getUTCFullYear()}/seller${
        seller.id
      }/${slugish(title)}-${rand}-${j}.png`;
      const url = await uploadImage(s3, key);
      imageUrls.push({ url, sort_order: j, key });
    }

    // Insert listing
    // ADJUST HERE: table/column names if your schema differs
    const [ins] = await db.query(
      `INSERT INTO listings
        (seller_id, vehicle_type, make, model, model_variant, year,
         condition_type, price_lkr, mileage_km, fuel_type, transmission,
         district_id, city_id, title, description, status, created_at, updated_at)
       VALUES
        (:seller_id, :vehicle_type, :make, :model, :model_variant, :year,
         :condition_type, :price_lkr, :mileage_km, :fuel_type, :transmission,
         :district_id, :city_id, :title, :description, 'ACTIVE', NOW(), NOW())`,
      {
        seller_id: seller.id,
        vehicle_type: vt,
        make,
        model,
        model_variant: null,
        year,
        condition_type: pick(conditions),
        price_lkr: price,
        mileage_km: mileage,
        fuel_type: pick(fuels),
        transmission: pick(transmissions),
        district_id: districtId,
        city_id: cityId,
        title,
        description,
      }
    );

    const listingId = ins.insertId;

    // Insert images
    // ADJUST HERE: if your table is named differently (e.g. listing_photos)
    for (const img of imageUrls) {
      await db.query(
        `INSERT INTO listing_images (listing_id, url, sort_order, created_at)
         VALUES (:listing_id, :url, :sort_order, NOW())`,
        {
          listing_id: listingId,
          url: img.url,
          sort_order: img.sort_order,
        }
      );
    }

    console.log(`✅ #${i + 1} listing_id=${listingId} images=${imgCount}`);
  }

  await db.end();
  console.log('🎉 Done.');
}

main().catch((e) => {
  console.error('❌ Seed failed:', e);
  process.exit(1);
});
