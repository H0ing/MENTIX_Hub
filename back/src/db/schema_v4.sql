-- ============================================================================
-- MENTIX-Hub Database Schema — Version 4
-- Apply AFTER schema.sql (v1), schema_v2.sql (v2), AND schema_v3.sql (v3).
--
-- WHAT THIS ADDS:
--   1. backup_schedule — selected_tables and row_limits JSON columns for
--      table/row selection in one-time (and recurring) scheduled backups.
--
-- HOW TO RUN (safe, ignores already-applied changes):
--   mysql -u root -p -P 8889 --force < src/db/schema_v4.sql
-- ============================================================================

USE mentix_hub;

-- ============================================================================
-- 1. backup_schedule — add table/row selection columns
-- ============================================================================
ALTER TABLE backup_schedule
  ADD COLUMN selected_tables JSON NULL AFTER run_once,
  ADD COLUMN row_limits JSON NULL AFTER selected_tables;

-- ============================================================================
SELECT 'schema_v4 applied' AS status;
