-- ============================================================================
-- MENTIX-Hub Database Schema — Version 2
-- Apply AFTER schema.sql (v1).
--
-- HOW TO RUN (safe, ignores already-applied changes):
--   mysql -u root -p -P 8889 --force < src/db/schema_v2.sql
--
-- The --force flag makes MySQL continue past ALTER errors (e.g. column already
-- exists, or column already dropped). Safe to run multiple times.
-- ============================================================================

USE mentix_hub;

-- ============================================================================
-- users: remove social link columns
-- (errors here are fine if columns were already removed)
-- ============================================================================
ALTER TABLE users DROP COLUMN website;
ALTER TABLE users DROP COLUMN github;
ALTER TABLE users DROP COLUMN twitter;
ALTER TABLE users DROP COLUMN linkedin;

-- ============================================================================
-- users: add academic year and major
-- (errors here are fine if columns already exist)
-- ============================================================================
ALTER TABLE users ADD COLUMN year  TINYINT UNSIGNED NULL AFTER bio;
ALTER TABLE users ADD COLUMN major VARCHAR(100)      NULL AFTER year;

-- ============================================================================
-- reports: add resolved_by column + FK
-- ============================================================================
ALTER TABLE reports ADD COLUMN resolved_by INT NULL AFTER assigned_to;
ALTER TABLE reports ADD CONSTRAINT fk_reports_resolved_by
  FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================================================
-- report_history: add handler name snapshot
-- ============================================================================
ALTER TABLE report_history ADD COLUMN handled_by_username VARCHAR(100) NULL AFTER handled_by;

-- ============================================================================
-- New table: uploads
-- ============================================================================
CREATE TABLE IF NOT EXISTS uploads (
  id            INT          PRIMARY KEY AUTO_INCREMENT,
  user_id       INT          NOT NULL,
  filename      VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type     VARCHAR(100) NULL,
  file_size     BIGINT       NULL,
  file_path     VARCHAR(500) NOT NULL,
  upload_type   ENUM('avatar','project_file','project_thumbnail','other') NOT NULL DEFAULT 'other',
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_uploads_user_id (user_id),
  INDEX idx_uploads_type    (upload_type),
  CONSTRAINT fk_uploads_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- New table: admin_sent_forms
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_sent_forms (
  id                  INT          PRIMARY KEY AUTO_INCREMENT,
  subject             VARCHAR(255) NOT NULL,
  recipient_id        INT          NOT NULL,
  sent_by             INT          NOT NULL,
  form_type           ENUM('report_resolution','promotion_approved','promotion_rejected','account_action','other') NOT NULL,
  body                TEXT         NOT NULL,
  related_entity_type VARCHAR(50)  NULL,
  related_entity_id   INT          NULL,
  sent_at             DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_forms_recipient (recipient_id),
  INDEX idx_forms_sent_by   (sent_by),
  INDEX idx_forms_type      (form_type),
  CONSTRAINT fk_forms_recipient FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_forms_sender    FOREIGN KEY (sent_by)      REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- New table: admin_form_replies
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_form_replies (
  id         INT      PRIMARY KEY AUTO_INCREMENT,
  form_id    INT      NOT NULL,
  replied_by INT      NOT NULL,
  body       TEXT     NOT NULL,
  sent_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_replies_form_id (form_id),
  INDEX idx_replies_sender  (replied_by),
  CONSTRAINT fk_replies_form FOREIGN KEY (form_id)    REFERENCES admin_sent_forms(id) ON DELETE CASCADE,
  CONSTRAINT fk_replies_user FOREIGN KEY (replied_by) REFERENCES users(id)            ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
SELECT 'schema_v2 applied' AS status;
