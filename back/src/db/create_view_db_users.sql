-- ============================================================================
-- View: db_user_grants
-- Shows MySQL users that have privileges on the mentix_hub database,
-- with their database-level and table-level grants.
-- Run this as MySQL root user (MAMP root).
-- ============================================================================

USE mentix_hub;

CREATE OR REPLACE VIEW db_user_grants AS
SELECT
    CONCAT(u.User, '@', u.Host) AS id,
    u.User AS username,
    u.Host AS host,
    CONCAT(
        '`mentix_hub`.*',
        ' : ',
        NULLIF(CONCAT_WS(', ',
            IF(d.Select_priv = 'Y', 'SELECT', NULL),
            IF(d.Insert_priv = 'Y', 'INSERT', NULL),
            IF(d.Update_priv = 'Y', 'UPDATE', NULL),
            IF(d.Delete_priv = 'Y', 'DELETE', NULL),
            IF(d.Create_priv = 'Y', 'CREATE', NULL),
            IF(d.Drop_priv = 'Y', 'DROP', NULL),
            IF(d.Alter_priv = 'Y', 'ALTER', NULL),
            IF(d.Index_priv = 'Y', 'INDEX', NULL),
            IF(d.Lock_tables_priv = 'Y', 'LOCK TABLES', NULL),
            IF(d.Grant_priv = 'Y', 'GRANT OPTION', NULL)
        ), '')
    ) AS db_grants
FROM mysql.user u
INNER JOIN mysql.db d ON u.User = d.User AND u.Host = d.Host AND d.Db = 'mentix_hub'
WHERE u.User NOT IN ('root', 'mysql.sys', 'mysql.session', 'mysql.infoschema')

UNION

SELECT
    CONCAT(u.User, '@', u.Host) AS id,
    u.User AS username,
    u.Host AS host,
    CONCAT(
        '`mentix_hub`.`', t.Table_name, '`',
        ' : ',
        t.Table_priv
    ) AS db_grants
FROM mysql.user u
INNER JOIN mysql.tables_priv t ON u.User = t.User AND u.Host = t.Host AND t.Db = 'mentix_hub'
WHERE u.User NOT IN ('root', 'mysql.sys', 'mysql.session', 'mysql.infoschema')

ORDER BY username, host, db_grants;
