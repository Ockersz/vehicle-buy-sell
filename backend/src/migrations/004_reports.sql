CREATE TABLE IF NOT EXISTS reports (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

  reporter_id BIGINT UNSIGNED NOT NULL,

  entity_type VARCHAR(20) NOT NULL,     -- 'LISTING' | 'USER' | 'OFFER'
  entity_id BIGINT UNSIGNED NOT NULL,

  reason VARCHAR(60) NOT NULL,          -- e.g. 'SCAM' | 'SPAM' | 'ABUSE' | 'WRONG_INFO' | 'OTHER'
  description TEXT NULL,

  status VARCHAR(20) NOT NULL DEFAULT 'OPEN',  -- 'OPEN'|'IN_REVIEW'|'RESOLVED'|'REJECTED'
  admin_note TEXT NULL,

  reviewed_by BIGINT UNSIGNED NULL,
  reviewed_at DATETIME NULL,

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  KEY idx_reports_reporter (reporter_id, created_at),
  KEY idx_reports_entity (entity_type, entity_id, created_at),
  KEY idx_reports_status (status, created_at),

  CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reports_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);
