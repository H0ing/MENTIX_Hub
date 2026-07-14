-- ============================================================================
-- MENTIX-Hub Complete Database Schema
-- Combined from: schema.sql (v1) + schema_v2.sql + schema_v3.sql
-- No ALTER statements — all tables are in their final state.
-- Engine: InnoDB | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- ============================================================================

CREATE DATABASE IF NOT EXISTS mentix_hub
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mentix_hub;

-- ============================================================================
-- TABLE 1: users
-- v1 base + v2 (drop website, add year/major) + v3 (re-add github/twitter/linkedin)
-- ============================================================================
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NULL,
  bio TEXT NULL,
  year TINYINT UNSIGNED NULL,
  major VARCHAR(100) NULL,
  avatar_url VARCHAR(500) NULL,
  github VARCHAR(255) NULL,
  twitter VARCHAR(255) NULL,
  linkedin VARCHAR(255) NULL,
  role ENUM('student','mentor','moderator','dev_admin','super_admin') NOT NULL DEFAULT 'student',
  status ENUM('pending','active','suspended','banned') NOT NULL DEFAULT 'pending',
  token_version INT NOT NULL DEFAULT 1,
  last_login DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_username (username),
  INDEX idx_role (role),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 2: refresh_tokens
-- (unchanged from v1)
-- ============================================================================
CREATE TABLE refresh_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token VARCHAR(500) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_token (token),
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at),
  CONSTRAINT fk_refresh_tokens_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 3: projects
-- v1 base + v3 (add category) + CHECK constraint on allowed categories
-- ============================================================================
CREATE TABLE projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  category VARCHAR(100) NULL,
  author_id INT NOT NULL,
  tags JSON NULL,
  external_links JSON NULL,
  thumbnail VARCHAR(500) NULL,
  file_name VARCHAR(255) NULL,
  file_path VARCHAR(500) NULL,
  file_original_name VARCHAR(255) NULL,
  file_size BIGINT NULL,
  view_count INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_author_id (author_id),
  FULLTEXT INDEX ft_title_description (title, description),
  CONSTRAINT fk_projects_author
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_project_category
    CHECK (category IS NULL OR category IN (
      'Web Development', 'AI & Machine Learning', 'Mobile Development',
      'DevOps', 'UI/UX Design', 'Data Science', 'IoT', 'Other'
    ))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 4: hearts
-- (unchanged from v1)
-- ============================================================================
CREATE TABLE hearts (
  user_id INT NOT NULL,
  project_id INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, project_id),
  INDEX idx_project_id (project_id),
  CONSTRAINT fk_hearts_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_hearts_project
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 5: favorites
-- (unchanged from v1)
-- ============================================================================
CREATE TABLE favorites (
  user_id INT NOT NULL,
  project_id INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, project_id),
  INDEX idx_project_id (project_id),
  CONSTRAINT fk_favorites_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_favorites_project
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 6: comments
-- (unchanged from v1)
-- ============================================================================
CREATE TABLE comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT NOT NULL,
  user_id INT NULL,
  parent_id INT NULL,
  content TEXT NOT NULL,
  is_edited BOOLEAN NOT NULL DEFAULT FALSE,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_project_id (project_id),
  INDEX idx_parent_id (parent_id),
  INDEX idx_user_id (user_id),
  CONSTRAINT fk_comments_project
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_comments_parent
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 7: mentorship_requests
-- v1 base + v3 (add project_title, previous_efforts, project_stage, guidance_type)
-- ============================================================================
CREATE TABLE mentorship_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  mentor_id INT NOT NULL,
  project_context TEXT NULL,
  project_title VARCHAR(255) NULL,
  help_needed TEXT NULL,
  previous_efforts TEXT NULL,
  project_stage VARCHAR(100) NULL,
  guidance_type VARCHAR(100) NULL,
  status ENUM('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
  mentor_response JSON NULL,
  responded_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_student_id (student_id),
  INDEX idx_mentor_id (mentor_id),
  INDEX idx_status (status),
  CONSTRAINT fk_mentorship_student
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_mentorship_mentor
    FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 8: collaboration_requests
-- v1 base + v3 (add intro, own_project_name, own_project_desc, skills,
--               other_skill, preferred_connect)
-- ============================================================================
CREATE TABLE collaboration_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  intro TEXT NULL,
  project_interest TEXT NULL,
  own_project_name VARCHAR(255) NULL,
  own_project_desc TEXT NULL,
  benefit TEXT NULL,
  why_needed TEXT NULL,
  skills VARCHAR(500) NULL,
  other_skill VARCHAR(255) NULL,
  preferred_connect VARCHAR(100) NULL,
  status ENUM('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
  response_message JSON NULL,
  responded_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sender_id (sender_id),
  INDEX idx_receiver_id (receiver_id),
  INDEX idx_status (status),
  CONSTRAINT fk_collaboration_sender
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_collaboration_receiver
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 9: reports
-- v1 base + v2 (add resolved_by)
-- ============================================================================
CREATE TABLE reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT NOT NULL,
  reported_by INT NOT NULL,
  reason VARCHAR(255) NOT NULL,
  description TEXT NULL,
  status ENUM('pending','under_review','resolved','dismissed') NOT NULL DEFAULT 'pending',
  priority ENUM('low','medium','high','critical') NOT NULL DEFAULT 'low',
  assigned_to INT NULL,
  resolved_by INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  INDEX idx_assigned_to (assigned_to),
  CONSTRAINT fk_reports_project
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_reports_reported_by
    FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reports_assigned_to
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_reports_resolved_by
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 10: report_responses
-- (unchanged from v1)
-- ============================================================================
CREATE TABLE report_responses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  report_id INT NOT NULL,
  responded_by INT NOT NULL,
  response_type ENUM('warning','project_removed','user_banned','dismissed','other') NOT NULL,
  message TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_report_id (report_id),
  CONSTRAINT fk_report_responses_report
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  CONSTRAINT fk_report_responses_responder
    FOREIGN KEY (responded_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 11: promotion_queue
-- (unchanged from v1)
-- ============================================================================
CREATE TABLE promotion_queue (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  requirements_met JSON NULL,
  reviewed_by INT NULL,
  reviewed_at DATETIME NULL,
  rejection_reason TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  CONSTRAINT fk_promotion_queue_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_promotion_queue_reviewer
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 12: mentor_requirements
-- (unchanged from v1)
-- ============================================================================
CREATE TABLE mentor_requirements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  requirement_name VARCHAR(100) NOT NULL,
  requirement_key VARCHAR(50) UNIQUE NOT NULL,
  threshold_value INT NOT NULL,
  description TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 13: uploads
-- (added in v2)
-- ============================================================================
CREATE TABLE uploads (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NULL,
  file_size BIGINT NULL,
  file_path VARCHAR(500) NOT NULL,
  upload_type ENUM('avatar','project_file','project_thumbnail','other') NOT NULL DEFAULT 'other',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_uploads_user_id (user_id),
  INDEX idx_uploads_type (upload_type),
  CONSTRAINT fk_uploads_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 14: admin_sent_forms
-- (added in v2)
-- ============================================================================
CREATE TABLE admin_sent_forms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  subject VARCHAR(255) NOT NULL,
  recipient_id INT NOT NULL,
  sent_by INT NOT NULL,
  form_type ENUM('report_resolution','promotion_approved','promotion_rejected','account_action','other') NOT NULL,
  body TEXT NOT NULL,
  related_entity_type VARCHAR(50) NULL,
  related_entity_id INT NULL,
  sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_forms_recipient (recipient_id),
  INDEX idx_forms_sent_by (sent_by),
  INDEX idx_forms_type (form_type),
  CONSTRAINT fk_forms_recipient FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_forms_sender FOREIGN KEY (sent_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- TABLE 16: report_history
-- v1 base + v2 (add handled_by_username)
-- ============================================================================
CREATE TABLE report_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  report_id INT NOT NULL,
  project_id INT NULL,
  project_title VARCHAR(255) NULL,
  reported_by_username VARCHAR(50) NULL,
  reason VARCHAR(255) NULL,
  final_status ENUM('resolved','dismissed') NULL,
  handled_by INT NULL,
  handled_by_username VARCHAR(100) NULL,
  response_time_minutes INT NULL,
  resolution_message TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME NULL,
  INDEX idx_report_id (report_id),
  INDEX idx_final_status (final_status),
  CONSTRAINT fk_report_history_report
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  CONSTRAINT fk_report_history_handler
    FOREIGN KEY (handled_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 17: audit_logs
-- (unchanged from v1)
-- ============================================================================
CREATE TABLE audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  admin_id INT NULL,
  admin_role VARCHAR(50) NULL,
  action_type VARCHAR(100) NOT NULL,
  target_type VARCHAR(50) NULL,
  target_id INT NULL,
  method VARCHAR(10) NULL,
  ip_address VARCHAR(45) NULL,
  details JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_admin_id (admin_id),
  INDEX idx_action_type (action_type),
  INDEX idx_target (target_type, target_id),
  INDEX idx_created_at (created_at),
  CONSTRAINT fk_audit_logs_admin
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 18: backup_history
-- (unchanged from v1)
-- ============================================================================
CREATE TABLE backup_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  backup_type ENUM('manual','scheduled') NOT NULL DEFAULT 'manual',
  size_bytes BIGINT NULL,
  status ENUM('success','failed','in_progress') NOT NULL DEFAULT 'in_progress',
  file_path VARCHAR(500) NULL,
  initiated_by INT NULL,
  duration_seconds INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  CONSTRAINT fk_backup_history_initiator
    FOREIGN KEY (initiated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 19: backup_schedule
-- v1 base (already includes 'one_time' ENUM, custom_date, and run_once)
-- ============================================================================
CREATE TABLE backup_schedule (
  id INT PRIMARY KEY AUTO_INCREMENT,
  frequency ENUM('daily','weekly','monthly','one_time') NOT NULL DEFAULT 'daily',
  custom_date DATE NULL,
  run_once BOOLEAN NOT NULL DEFAULT TRUE,
  selected_tables JSON NULL,
  row_limits JSON NULL,
  backup_format ENUM('sql', 'csv') NOT NULL DEFAULT 'sql',
  time_of_day TIME NOT NULL DEFAULT '00:00:00',
  retention_days INT NOT NULL DEFAULT 30,
  last_run DATETIME NULL,
  next_run DATETIME NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_by INT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_backup_schedule_updater
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 20: backup_logs
-- (unchanged from v1)
-- ============================================================================
CREATE TABLE backup_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  backup_id INT NOT NULL,
  level ENUM('info','warning','error') NOT NULL DEFAULT 'info',
  message TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_backup_id (backup_id),
  CONSTRAINT fk_backup_logs_backup
    FOREIGN KEY (backup_id) REFERENCES backup_history(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 21: email_verifications
-- (unchanged from v1)
-- ============================================================================
CREATE TABLE email_verifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  type ENUM('email_verify','password_reset') NOT NULL,
  expires_at DATETIME NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_type (user_id, type),
  INDEX idx_expires_at (expires_at),
  CONSTRAINT fk_email_verifications_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Default seed data
-- ============================================================================

-- Mentor requirement thresholds
INSERT INTO mentor_requirements (requirement_name, requirement_key, threshold_value, description) VALUES
  ('Minimum Projects Published', 'min_projects', 3, 'Student must have published at least this many projects'),
  ('Minimum Hearts Received', 'min_hearts', 10, 'Student must have received at least this many hearts across all projects'),
  ('Minimum Account Age (Days)', 'min_account_age_days', 30, 'Student account must be at least this many days old'),
  ('Minimum Comments Made', 'min_comments', 5, 'Student must have made at least this many comments on other projects');

-- Default backup schedule: daily at midnight, retain 30 days
INSERT INTO backup_schedule (frequency, time_of_day, retention_days) VALUES
  ('daily', '00:00:00', 30);

-- ============================================================================
SELECT 'MENTIX-Hub complete schema applied successfully.' AS status;
SELECT CONCAT('Tables created: 21') AS summary;
