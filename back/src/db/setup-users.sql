-- ============================================================
-- MENTIX-Hub Complete Setup (Run as MySQL root)
-- mysql -u root -p < src/db/setup-users.sql
-- ============================================================

-- 1. CREATE USERS
CREATE USER IF NOT EXISTS 'mentix_root'@'localhost' IDENTIFIED BY 'mentix_root_pass_2024';
CREATE USER IF NOT EXISTS 'mentix_root'@'%'         IDENTIFIED BY 'mentix_root_pass_2024';
CREATE USER IF NOT EXISTS 'mentix_dev'@'localhost'  IDENTIFIED BY 'mentix_dev_pass_2024';
CREATE USER IF NOT EXISTS 'mentix_dev'@'%'          IDENTIFIED BY 'mentix_dev_pass_2024';
CREATE USER IF NOT EXISTS 'mentix_user'@'localhost' IDENTIFIED BY 'mentix_user_pass_2024';
CREATE USER IF NOT EXISTS 'mentix_user'@'%'         IDENTIFIED BY 'mentix_user_pass_2024';

-- 2. GRANT PRIVILEGES (Limited to mentix_hub database only)

-- mentix_root: Full control ONLY on mentix_hub
GRANT ALL PRIVILEGES ON mentix_hub.* TO 'mentix_root'@'localhost' WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON mentix_hub.* TO 'mentix_root'@'%'         WITH GRANT OPTION;

-- mentix_dev: Backup operations on mentix_hub only
GRANT SELECT, INSERT, UPDATE, DELETE ON mentix_hub.* TO 'mentix_dev'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON mentix_hub.* TO 'mentix_dev'@'%';
GRANT LOCK TABLES ON mentix_hub.* TO 'mentix_dev'@'localhost';
GRANT LOCK TABLES ON mentix_hub.* TO 'mentix_dev'@'%';
GRANT SHOW VIEW ON mentix_hub.* TO 'mentix_dev'@'localhost';
GRANT SHOW VIEW ON mentix_hub.* TO 'mentix_dev'@'%';
GRANT TRIGGER ON mentix_hub.* TO 'mentix_dev'@'localhost';
GRANT TRIGGER ON mentix_hub.* TO 'mentix_dev'@'%';

-- mentix_user: Regular CRUD on mentix_hub only
GRANT SELECT, INSERT, UPDATE, DELETE ON mentix_hub.* TO 'mentix_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON mentix_hub.* TO 'mentix_user'@'%';

-- 3. ENABLE SERVER AUDIT (creates mysql.general_log table)
SET GLOBAL general_log = ON;
SET GLOBAL log_output = 'TABLE';

-- 4. CREATE FILTERED VIEW (table now exists)
CREATE OR REPLACE VIEW mentix_hub.audit_log_filtered AS
SELECT 
  event_time,
  user_host,
  thread_id,
  server_id,
  command_type,
  CAST(argument AS CHAR(10000) CHARACTER SET utf8mb4) AS query_text  -- BLOB → readable text
FROM mysql.general_log
WHERE 
  -- Filter by database name (if available in argument)
  CAST(argument AS CHAR(10000) CHARACTER SET utf8mb4) LIKE '%mentix_hub%'
  OR user_host LIKE 'mentix_%'
ORDER BY event_time DESC;

-- 5. GRANT ACCESS TO VIEW
-- mentix_root can see the filtered audit log
GRANT SELECT ON mentix_hub.audit_log_filtered TO 'mentix_root'@'localhost';
GRANT SELECT ON mentix_hub.audit_log_filtered TO 'mentix_root'@'%';

-- mentix_dev can also see the filtered audit log (useful for debugging)
GRANT SELECT ON mentix_hub.audit_log_filtered TO 'mentix_dev'@'localhost';
GRANT SELECT ON mentix_hub.audit_log_filtered TO 'mentix_dev'@'%';

-- 6. REVOKE GLOBAL PRIVILEGES (ensure no accidental global access)
-- Explicitly revoke any global privileges that might have been granted
REVOKE ALL PRIVILEGES ON *.* FROM 'mentix_root'@'localhost';
REVOKE ALL PRIVILEGES ON *.* FROM 'mentix_root'@'%';
REVOKE ALL PRIVILEGES ON *.* FROM 'mentix_dev'@'localhost';
REVOKE ALL PRIVILEGES ON *.* FROM 'mentix_dev'@'%';
REVOKE ALL PRIVILEGES ON *.* FROM 'mentix_user'@'localhost';
REVOKE ALL PRIVILEGES ON *.* FROM 'mentix_user'@'%';

-- Then re-grant the specific database privileges (already done above)
-- This ensures no accidental *.* privileges remain

-- 7. VERIFY SETUP
FLUSH PRIVILEGES;

-- Verification queries
SELECT ' Server audit logging ENABLED' AS status;
SELECT ' Filtered view created: mentix_hub.audit_log_filtered' AS status;
SELECT ' Users created: mentix_root, mentix_dev, mentix_user' AS status;

-- Check privileges for each user
SELECT '=== mentix_root@localhost privileges ===' AS '';
SHOW GRANTS FOR 'mentix_root'@'localhost';

SELECT '=== mentix_root@% privileges ===' AS '';
SHOW GRANTS FOR 'mentix_root'@'%';

SELECT '=== mentix_dev@localhost privileges ===' AS '';
SHOW GRANTS FOR 'mentix_dev'@'localhost';

SELECT '=== mentix_user@localhost privileges ===' AS '';
SHOW GRANTS FOR 'mentix_user'@'localhost';