-- 001_init.sql
-- MySQL 8+ recommended

SET NAMES utf8mb4;
SET time_zone = '+05:30';

-- =========================
-- USERS
-- =========================
CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NULL,
  full_name VARCHAR(120) NULL,
  role ENUM('BUYER','SELLER','DEALER','ADMIN') NOT NULL DEFAULT 'BUYER',
  is_phone_verified TINYINT(1) NOT NULL DEFAULT 0,
  is_banned TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_phone (phone),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- OTP requests / verification attempts (rate-limit + auditing)
CREATE TABLE otp_requests (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  phone VARCHAR(20) NOT NULL,
  otp_hash CHAR(64) NOT NULL,
  purpose ENUM('LOGIN') NOT NULL DEFAULT 'LOGIN',
  expires_at DATETIME NOT NULL,
  consumed_at DATETIME NULL,
  request_ip VARCHAR(45) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_otp_phone_created (phone, created_at),
  KEY idx_otp_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- LOCATIONS
-- =========================
CREATE TABLE districts (
  id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(80) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_districts_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE cities (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  district_id SMALLINT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cities_district_name (district_id, name),
  KEY idx_cities_district (district_id),
  CONSTRAINT fk_cities_district
    FOREIGN KEY (district_id) REFERENCES districts(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- DEALER PROFILE
-- =========================
CREATE TABLE dealer_profiles (
  user_id BIGINT UNSIGNED NOT NULL,
  business_name VARCHAR(140) NOT NULL,
  business_address VARCHAR(255) NULL,
  district_id SMALLINT UNSIGNED NULL,
  city_id INT UNSIGNED NULL,
  website VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  KEY idx_dealer_location (district_id, city_id),
  CONSTRAINT fk_dealer_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_dealer_district
    FOREIGN KEY (district_id) REFERENCES districts(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_dealer_city
    FOREIGN KEY (city_id) REFERENCES cities(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- LISTINGS
-- =========================
CREATE TABLE listings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  seller_id BIGINT UNSIGNED NOT NULL,

  status ENUM('DRAFT','ACTIVE','PAUSED','SOLD','EXPIRED','REMOVED') NOT NULL DEFAULT 'DRAFT',

  vehicle_type ENUM(
    'CAR','VAN','SUV','BIKE','THREE_WHEEL','BUS','LORRY','HEAVY','TRACTOR','BOAT','OTHER'
  ) NOT NULL,

  make VARCHAR(80) NOT NULL,
  model VARCHAR(120) NOT NULL,
  model_variant VARCHAR(120) NULL,
  year SMALLINT UNSIGNED NOT NULL,

  condition_type ENUM('NEW','USED','RECONDITIONED') NOT NULL,

  price_lkr INT UNSIGNED NOT NULL,
  mileage_km INT UNSIGNED NULL,

  fuel_type ENUM('PETROL','DIESEL','HYBRID','ELECTRIC','CNG','OTHER') NULL,
  transmission ENUM('MANUAL','AUTO','TIPTRONIC','CVT','OTHER') NULL,

  district_id SMALLINT UNSIGNED NOT NULL,
  city_id INT UNSIGNED NOT NULL,

  title VARCHAR(160) NULL,
  description TEXT NULL,

  -- Differentiators / computed
  market_estimate_lkr INT UNSIGNED NULL,
  price_label ENUM('BELOW','FAIR','ABOVE') NULL,

  -- Premium flags (Phase 1 ready)
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  is_highlighted TINYINT(1) NOT NULL DEFAULT 0,
  boost_until DATETIME NULL,

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  renewed_at DATETIME NULL,
  expires_at DATETIME NOT NULL,

  PRIMARY KEY (id),
  KEY idx_listings_status_created (status, created_at),
  KEY idx_listings_vehicle (vehicle_type, make, model, year),
  KEY idx_listings_location (district_id, city_id),
  KEY idx_listings_price (price_lkr),
  KEY idx_listings_expires (expires_at),
  FULLTEXT KEY ft_listings_text (make, model, model_variant, title, description),

  CONSTRAINT fk_listings_seller
    FOREIGN KEY (seller_id) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_listings_district
    FOREIGN KEY (district_id) REFERENCES districts(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_listings_city
    FOREIGN KEY (city_id) REFERENCES cities(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE listing_images (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  listing_id BIGINT UNSIGNED NOT NULL,
  url VARCHAR(800) NOT NULL,
  sort_order TINYINT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_listing_image_order (listing_id, sort_order),
  KEY idx_listing_images_listing (listing_id),
  CONSTRAINT fk_listing_images_listing
    FOREIGN KEY (listing_id) REFERENCES listings(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- FAVORITES
-- =========================
CREATE TABLE favorites (
  user_id BIGINT UNSIGNED NOT NULL,
  listing_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, listing_id),
  KEY idx_favorites_listing (listing_id),
  CONSTRAINT fk_favorites_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_favorites_listing
    FOREIGN KEY (listing_id) REFERENCES listings(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- OFFERS
-- =========================
CREATE TABLE offers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  listing_id BIGINT UNSIGNED NOT NULL,
  buyer_id BIGINT UNSIGNED NOT NULL,
  seller_id BIGINT UNSIGNED NOT NULL,
  amount_lkr INT UNSIGNED NOT NULL,
  message VARCHAR(500) NULL,
  status ENUM('PENDING','COUNTERED','ACCEPTED','DECLINED','EXPIRED') NOT NULL DEFAULT 'PENDING',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_offers_listing (listing_id, created_at),
  KEY idx_offers_seller_status (seller_id, status),
  KEY idx_offers_buyer (buyer_id, created_at),
  CONSTRAINT fk_offers_listing
    FOREIGN KEY (listing_id) REFERENCES listings(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_offers_buyer
    FOREIGN KEY (buyer_id) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_offers_seller
    FOREIGN KEY (seller_id) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- SAVED SEARCHES + NOTIFICATIONS
-- =========================
CREATE TABLE `saved_searches` (
  id bigint unsigned NOT NULL AUTO_INCREMENT,
  user_id bigint unsigned NOT NULL,
  name varchar(120) NOT NULL,
  query_json json NOT NULL,
  is_alert_enabled tinyint(1) NOT NULL DEFAULT '0',
  alert_frequency varchar(20) DEFAULT NULL,
  last_alert_sent_at datetime DEFAULT NULL,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_saved_searches_user (user_id),
  CONSTRAINT fk_saved_searches_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
)  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE notifications (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  type ENUM('NEW_MATCH','PRICE_DROP','OFFER_UPDATE','SYSTEM') NOT NULL,
  payload_json JSON NOT NULL,
  read_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notifications_user_read (user_id, read_at, created_at),
  CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) 

CREATE TABLE `notification_preferences` (
  `user_id` bigint unsigned NOT NULL,
  `in_app_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `email_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `sms_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `push_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_notification_prefs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- REPORTS + ADMIN AUDIT
-- =========================
CREATE TABLE `reports` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `reporter_id` bigint unsigned NOT NULL,
  `entity_type` varchar(20) NOT NULL,
  `entity_id` bigint unsigned NOT NULL,
  `reason` varchar(60) NOT NULL,
  `description` text,
  `status` varchar(20) NOT NULL DEFAULT 'OPEN',
  `admin_note` text,
  `reviewed_by` bigint unsigned DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reports_reporter` (`reporter_id`,`created_at`),
  KEY `idx_reports_entity` (`entity_type`,`entity_id`,`created_at`),
  KEY `idx_reports_status` (`status`,`created_at`),
  KEY `fk_reports_reviewed_by` (`reviewed_by`),
  CONSTRAINT `fk_reports_reporter` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reports_reviewed_by` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
 )ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE admin_audit_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  admin_id BIGINT UNSIGNED NOT NULL,
  action VARCHAR(80) NOT NULL,
  target_type VARCHAR(40) NOT NULL,
  target_id BIGINT UNSIGNED NULL,
  meta_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_audit_admin (admin_id, created_at),
  CONSTRAINT fk_audit_admin
    FOREIGN KEY (admin_id) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `admin_actions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `admin_id` bigint unsigned NOT NULL,
  `action` varchar(40) NOT NULL,
  `target_type` varchar(20) NOT NULL,
  `target_id` bigint unsigned NOT NULL,
  `note` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_admin_actions_admin` (`admin_id`,`created_at`),
  KEY `idx_admin_actions_target` (`target_type`,`target_id`,`created_at`),
  CONSTRAINT `fk_admin_actions_admin` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;