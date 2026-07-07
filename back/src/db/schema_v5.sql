-- ============================================================================
-- MENTIX-Hub Database Schema — Version 5
-- Apply AFTER schema_v4.sql.
--
-- WHAT THIS ADDS:
--   1. backup_schedule — backup_format column (sql / csv) to let users
--      choose the output format when selecting specific tables/rows.
--      CSV exports create one file per table; SQL exports combine into
--      a single file.
-- ============================================================================

USE mentix_hub;

ALTER TABLE backup_schedule
  ADD COLUMN backup_format ENUM('sql', 'csv') NOT NULL DEFAULT 'sql' AFTER row_limits;

SELECT 'schema_v5 applied' AS status;
