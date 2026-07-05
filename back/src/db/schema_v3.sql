-- ============================================================================
-- MENTIX-Hub Database Schema — Version 3
-- Apply AFTER schema.sql (v1) AND schema_v2.sql (v2).
--
-- WHAT THIS ADDS:
--   1. users              — social link columns (website, github, twitter,
--                           linkedin) that were dropped in v2 but are still
--                           needed by the frontend Profile edit form and
--                           the backend user repository.
--   2. mentorship_requests — form fields from RequestMentorship.jsx
--                           (project_title, previous_efforts, project_stage,
--                           guidance_type).
--   3. collaboration_requests — form fields from RequestCollaboration.jsx
--                              (intro, own_project_name, own_project_desc,
--                               skills, other_skill, preferred_connect).
--
-- HOW TO RUN (safe, ignores already-applied changes):
--   mysql -u root -p -P 8889 --force < src/db/schema_v3.sql
--
-- The --force flag makes MySQL continue past ALTER errors
-- (e.g. column already exists). Safe to run multiple times.
-- ============================================================================

USE mentix_hub;

-- ============================================================================
-- 1. users — add back social link columns
--    These were removed in v2 but are still required by:
--      • Frontend Profile.jsx EditProfileModal (edits github, twitter)
--      • Backend userController.updateProfile() (updates all four)
--      • Backend userController.getUserById()  (SELECTs all four)
-- ============================================================================

ALTER TABLE users ADD COLUMN github   VARCHAR(255) NULL AFTER website;
ALTER TABLE users ADD COLUMN twitter  VARCHAR(255) NULL AFTER github;
ALTER TABLE users ADD COLUMN linkedin VARCHAR(255) NULL AFTER twitter;

-- ============================================================================
-- 2. mentorship_requests — add columns for frontend form fields
--    RequestMentorship.jsx collects these additional fields that don't have
--    a matching column in the current table:
--      • project_title    — the student's project name
--      • previous_efforts — what the student has tried so far
--      • project_stage    — current stage of the project
--      • guidance_type    — type of guidance requested
-- ============================================================================
ALTER TABLE mentorship_requests ADD COLUMN project_title     VARCHAR(255) NULL AFTER project_context;
ALTER TABLE mentorship_requests ADD COLUMN previous_efforts  TEXT         NULL AFTER help_needed;
ALTER TABLE mentorship_requests ADD COLUMN project_stage     VARCHAR(100) NULL AFTER previous_efforts;
ALTER TABLE mentorship_requests ADD COLUMN guidance_type     VARCHAR(100) NULL AFTER project_stage;

-- ============================================================================
-- 3a. projects — add category column for frontend filtering
--     UploadProject.jsx collects a category field that was never persisted.
--     Dashboard.jsx needs it for proper category filtering.
-- ============================================================================
ALTER TABLE projects ADD COLUMN category VARCHAR(100) NULL AFTER description;

-- ============================================================================
-- 3b. collaboration_requests — add columns for frontend form fields
--    RequestCollaboration.jsx collects these additional fields that don't
--    have a matching column in the current table:
--      • intro              — introduction / opening message
--      • own_project_name   — name of the requester's own project
--      • own_project_desc   — description of the requester's project
--      • skills             — skills the requester offers
--      • other_skill        — additional skill
--      • preferred_connect  — preferred way to connect
-- ============================================================================
ALTER TABLE collaboration_requests ADD COLUMN intro               TEXT         NULL AFTER receiver_id;
ALTER TABLE collaboration_requests ADD COLUMN own_project_name    VARCHAR(255) NULL AFTER project_interest;
ALTER TABLE collaboration_requests ADD COLUMN own_project_desc    TEXT         NULL AFTER own_project_name;
ALTER TABLE collaboration_requests ADD COLUMN skills              VARCHAR(500) NULL AFTER why_needed;
ALTER TABLE collaboration_requests ADD COLUMN other_skill         VARCHAR(255) NULL AFTER skills;
ALTER TABLE collaboration_requests ADD COLUMN preferred_connect   VARCHAR(100) NULL AFTER other_skill;

-- ============================================================================
SELECT 'schema_v3 applied' AS status;
