-- ============================================================================
-- MENTIX-Hub Database Schema
-- Version: 1.0.0
-- Engine: InnoDB
-- ============================================================================

CREATE DATABASE IF NOT EXISTS mentix_hub
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mentix_hub;

-- ============================================================================
-- TABLE 1: users
-- Core user accounts with role hierarchy and status workflow
-- ============================================================================
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NULL,
  bio TEXT NULL,
  avatar_url VARCHAR(500) NULL,
  website VARCHAR(255) NULL,
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
-- Active JWT refresh tokens for authentication rotation
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
-- User projects with file storage, tags, and external links
-- ============================================================================
CREATE TABLE projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
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
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 4: hearts
-- Public likes on projects (composite PK prevents duplicates)
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
-- Private bookmarks on projects (composite PK prevents duplicates)
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
-- Nested comments with soft delete and edit tracking (max depth 3)
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
-- Student-to-mentor mentorship requests with structured responses
-- ============================================================================
CREATE TABLE mentorship_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  mentor_id INT NOT NULL,
  project_context TEXT NULL,
  help_needed TEXT NULL,
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
-- Project collaboration requests with structured responses
-- ============================================================================
CREATE TABLE collaboration_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  project_interest TEXT NULL,
  benefit TEXT NULL,
  why_needed TEXT NULL,
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
-- Project and content reports with priority and assignment tracking
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
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 10: report_responses
-- Moderator actions taken on reports
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
-- Student-to-mentor promotion requests with requirements snapshot
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
-- Configurable thresholds for student-to-mentor promotion eligibility
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

-- Default mentor requirement values
INSERT INTO mentor_requirements (requirement_name, requirement_key, threshold_value, description) VALUES
  ('Minimum Projects Published', 'min_projects', 3, 'Student must have published at least this many projects'),
  ('Minimum Hearts Received', 'min_hearts', 10, 'Student must have received at least this many hearts across all projects'),
  ('Minimum Account Age (Days)', 'min_account_age_days', 30, 'Student account must be at least this many days old'),
  ('Minimum Comments Made', 'min_comments', 5, 'Student must have made at least this many comments on other projects');

-- ============================================================================
-- TABLE 13: report_history
-- Archive of resolved and dismissed reports for auditing
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
-- TABLE 14: audit_logs
-- Immutable record of all administrative actions for security auditing
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
-- TABLE 15: backup_history
-- Records of all database backup operations
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
-- TABLE 16: backup_schedule
-- Configuration for automated database backups
-- ============================================================================
CREATE TABLE backup_schedule (
  id INT PRIMARY KEY AUTO_INCREMENT,
  frequency ENUM('daily','weekly','monthly','one_time') NOT NULL DEFAULT 'daily',
  custom_date DATE NULL,
  run_once BOOLEAN NOT NULL DEFAULT TRUE,
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

-- Default backup schedule: daily at midnight, retain 30 days
INSERT INTO backup_schedule (frequency, time_of_day, retention_days) VALUES
  ('daily', '00:00:00', 30);

-- ============================================================================
-- TABLE 17: backup_logs
-- Detailed operation logs for each backup execution
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
-- TABLE 18: email_verifications
-- OTP codes for email verification and password reset flows
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