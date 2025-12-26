# Vehicle Marketplace Backend (Express + MySQL + S3-compatible uploads)

## Setup

1. Install deps:
   npm install

2. Create .env:
   cp .env.example .env
   Update MySQL + S3 settings.

3. Run migrations using your preferred method (MySQL client):

   - migrations/001_init.sql
   - migrations/002_defaults.sql
   - migrations/003_seed_locations_sri_lanka.sql

4. Start:
   npm run dev

## Health

GET http://localhost:4000/health

## Main routes (wired)

- POST /auth/request-otp
- POST /auth/verify-otp
- GET /locations/districts
- GET /locations/cities?district_id=#
- POST /uploads/presign (auth required)

## Notes

- Uploads are S3-compatible. Use MinIO now (S3_PROVIDER=minio), switch to AWS later (S3_PROVIDER=aws) without refactoring.
- OTP is simulated for MVP (OTP_DEV_FIXED).
