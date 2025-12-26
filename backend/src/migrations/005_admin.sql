-- Add basic user moderation fields
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',   -- ACTIVE|SUSPENDED|BANNED
  ADD COLUMN IF NOT EXISTS suspended_until DATETIME NULL;

-- Admin audit log (who did what)
CREATE TABLE IF NOT EXISTS admin_actions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  admin_id BIGINT UNSIGNED NOT NULL,
  action VARCHAR(40) NOT NULL,          -- 'BAN_USER','SUSPEND_USER','REMOVE_LISTING','FEATURE_LISTING',...
  target_type VARCHAR(20) NOT NULL,     -- 'USER'|'LISTING'|'REPORT'
  target_id BIGINT UNSIGNED NOT NULL,
  note TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_admin_actions_admin (admin_id, created_at),
  KEY idx_admin_actions_target (target_type, target_id, created_at),
  CONSTRAINT fk_admin_actions_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);
