# Backup Schedule — Full Flow

## 1. Database Schema (`backup_schedule` table)

```sql
backup_schedule
├── id                    INT PRIMARY KEY AUTO_INCREMENT
├── frequency             ENUM('daily','weekly','monthly','one_time')  DEFAULT 'daily'
├── custom_date           DATE NULL             -- set for one-time only
├── run_once              BOOLEAN DEFAULT TRUE  -- disable schedule after one-time fires
├── selected_tables       JSON NULL             -- table names array
├── row_limits            JSON NULL             -- { tableName: limitNum }
├── backup_format         ENUM('sql','csv') DEFAULT 'sql'
├── time_of_day           TIME NOT NULL DEFAULT '00:00:00'
├── retention_days        INT NOT NULL DEFAULT 30
├── last_run              DATETIME NULL
├── next_run              DATETIME NULL
├── enabled               BOOLEAN DEFAULT TRUE
├── updated_by            INT NULL → users(id) ON DELETE SET NULL
└── updated_at            DATETIME DEFAULT NOW() ON UPDATE NOW()
```

There is exactly **one row** in this table, inserted by seed:
```sql
INSERT INTO backup_schedule (frequency, time_of_day, retention_days)
VALUES ('daily', '00:00:00', 30);
```

Related tables: `backup_history` (backup run records), `backup_logs` (per-backup logs, CASCADE delete).

---

## 2. Frontend → Backend Flow

### A. Page Load

**File:** `front/src/pages/admin/BackupPage.jsx:46-100`

```
useEffect([]) on mount
  └─ load()
      ├─ setScheduleLoadError(false)
      └─ Promise.all([
          ├─ settingsService.getTables()          → GET /api/admin/tables
          ├─ backupService.getBackupHistory()      → GET /api/backups/history
          ├─ backupService.getBackupSchedule()     → GET /api/backups/schedule
          └─ backupService.getRecoverableBackups() → GET /api/backups/recoverable
      ])
```

**API Calls:**
| Call | File | Route |
|------|------|-------|
| `getTables()` | `front/src/api/adminApi.js:24` | `GET /admin/tables` |
| `getBackupHistory()` | `front/src/api/backupApi.js:4` | `GET /backups/history` |
| `getSchedule()` | `front/src/api/backupApi.js:8` | `GET /backups/schedule` |
| `getRecoverableBackups()` | `front/src/api/backupApi.js:10` | `GET /backups/recoverable` |

**Backend handler** — `back/src/controllers/backupController.js:311-313` (`getSchedule`):
```
getSchedule(req, res)
  └─ backupRepo.getSchedule()
      └─ SELECT * FROM backup_schedule LIMIT 1
  └─ success(res, result.rows[0] || null)
```

**Frontend after data loads:**
- `scheduleRes.data` exists → populate:
  - Auto schedule: `frequency`, `time_of_day`, `retention_days`, `enabled`, `backup_format`
  - If `custom_date` exists → populate one-time backup form fields
  - If `custom_date` is null → set `demoDate` to tomorrow (default)
- `scheduleRes.data` is null/undefined → all schedule form stays at defaults

---

### B. Save Auto Schedule

**Frontend:** `BackupPage.jsx:170-177`
```
handleSaveSchedule()
  └─ backupService.saveBackupSchedule(schedule)
      └─ backupApi.updateSchedule(data)
          └─ PUT /backups/schedule  (body: { frequency, time_of_day, retention_days, enabled })
```

**Backend:** `backupController.js:316-388` (`updateSchedule`)
```
updateSchedule(req, res)
  ├─ Read body: { frequency, time_of_day, retention_days, enabled, custom_date, run_once, selected_tables, row_limits, backup_format }
  ├─ backupRepo.getSchedule() → get existing row
  ├─ Build updates object (only provided fields)
  ├─ If frequency is 'daily'|'weekly'|'monthly' → set custom_date = null
  ├─ backupRepo.updateSchedule(id, updates)
  │   └─ UPDATE backup_schedule SET ... WHERE id = ?
  ├─ stopScheduler()
  └─ startScheduler()
```

---

### C. Save One-Time Schedule

**Frontend:** `BackupPage.jsx:179-201`
```
handleSaveDemoSchedule()
  ├─ Build payload: { custom_date, time_of_day, retention_days, enabled: true, run_once }
  ├─ If tables selected → add selected_tables[], row_limits{}, backup_format
  └─ backupService.saveBackupSchedule(payload)
      └─ PUT /backups/schedule
```

**Backend:** Same `updateSchedule()` as above — it stores `custom_date`, `run_once`, `selected_tables`, `row_limits` in the single schedule row.

---

### D. Instant Backup (not schedule, but related)

**Frontend:** `BackupPage.jsx:112-139`
```
runBackup()
  └─ backupService.runBackup(payload)
      └─ POST /backups/trigger  (body: { backup_format, selected_tables[], row_limits{} })
```

**Backend:** `backupController.js:26-145` (`triggerBackup`)
```
triggerBackup(req, res)
  ├─ Determine format (sql/csv) and table selection
  ├─ If CSV + tables → runManualCSVExport()
  │   └─ Per table: SELECT * FROM table LIMIT N → write CSV file → INSERT backup_history
  ├─ If SQL:
  │   ├─ INSERT backup_history (status='in_progress')
  │   ├─ FLUSH TABLES WITH READ LOCK
  │   ├─ mysqldump ... > file.sql  (with optional table/row-limit)
  │   ├─ UNLOCK TABLES
  │   ├─ On success: UPDATE backup_history SET status='success', size_bytes, duration_seconds
  │   └─ On fail: UPDATE backup_history SET status='failed', delete file
  └─ Return backup record with logs
```

---

## 3. Scheduler Engine

**File:** `back/src/jobs/backupScheduler.js`

### startScheduler() — called on:
1. Server startup (from `back/src/index.js` or app entry)
2. After every `updateSchedule()` save

```
startScheduler()
  ├─ Read schedule from DB
  ├─ Validate frequency (fix invalid → 'daily')
  │
  ├─ [ONE-TIME] If custom_date exists:
  │   ├─ Calculate delayMs = custom_date+time_of_day - now
  │   ├─ If delayMs > 60s → setTimeout(runScheduledBackup, delayMs)
  │   ├─ If delayMs ≤ 60s but > 0 → setTimeout with 60s buffer
  │   └─ If delayMs ≤ 0 (past) → clear custom_date
  │
  └─ [RECURRING] If frequency in ['daily','weekly','monthly'] AND enabled:
      ├─ Convert to cron expression
      │   daily   → `${minutes} ${hours} * * *`
      │   weekly  → `${minutes} ${hours} * * 0`    (Sunday)
      │   monthly → `${minutes} ${hours} 1 * *`
      └─ cron.schedule(cronExpr, runScheduledBackup)
```

### stopScheduler()
```
stopScheduler()
  ├─ task?.stop()     → stops cron
  ├─ clearTimeout(oneTimeTimer) → cancels one-time
  └─ null out both
```

### runScheduledBackup() — the actual backup execution
```
runScheduledBackup()
  ├─ Get DB connection
  ├─ FLUSH TABLES WITH READ LOCK
  ├─ Read schedule (selected_tables, row_limits, backup_format)
  ├─ If CSV + table selection → runCSVExport()
  │   └─ Per table: SELECT * ... → write .csv → INSERT backup_history record
  ├─ Else → runSQLExport()
  │   ├─ INSERT backup_history (status='in_progress')
  │   ├─ mysqldump with optional table/row-limit where clauses
  │   └─ UPDATE backup_history (size_bytes, status, duration_seconds)
  ├─ UNLOCK TABLES
  └─ pruneOldBackups()
      ├─ SELECT backup_history WHERE created_at < NOW() - retention_days
      └─ Per old row: delete file, DELETE FROM backup_history (cascades to backup_logs)
```

### One-time timer callback (after runScheduledBackup completes):
```
setTimeout callback
  ├─ result = runScheduledBackup()
  ├─ updateLastRun(schedule.id, now, null)
  └─ updateSchedule(schedule.id, {
       custom_date: null,
       selected_tables: null,
       row_limits: null,
       run_once: false,
       ...(run_once ? { enabled: false } : {})
     })
```

This clears the one-time fields and optionally disables the schedule.

---

## 4. File Structure

```
front/
├── src/
│   ├── pages/admin/BackupPage.jsx      ← UI component (407 lines)
│   ├── services/backupService.js       ← Service layer (33 lines)
│   ├── api/backupApi.js                ← API endpoints (10 lines)
│   └── services/settingsService.js     ← getTables() used by backup

back/
├── src/
│   ├── controllers/backupController.js ← Route handlers (399 lines)
│   ├── routes/backupRoutes.js          ← Route definitions (40 lines)
│   ├── jobs/backupScheduler.js         ← Cron + one-time scheduler (406 lines)
│   └── repositories/backupRepository.js ← DB queries (127 lines)
```

---

## 5. Key Observations

- **Single schedule row:** The system uses exactly one row in `backup_schedule` for BOTH the recurring auto-backup AND the one-time backup.
- **One-time vs recurring:** Stored as `custom_date` (one-time) vs `frequency` (recurring). If `custom_date` is set, the scheduler uses setTimeout. If frequency is `daily`/`weekly`/`monthly` + `enabled`, it uses cron. Both can coexist (one-time setTimeout fires once, cron keeps recurring).
- **Dev mode bypass:** In development, ALL backup routes skip `authenticate` and `authorize` middleware (`backupRoutes.js:20-28`).
- **Scheduler restart:** Every time `updateSchedule` is called, the scheduler is **stopped and restarted** (`backupController.js:384-385`) — meaning the one-time timer and cron job are rebuilt from the updated DB row.
- **Polling removed:** The original code had a polling interval in `useEffect` (every 10s) to detect when a one-time backup completed. This was removed in the current version — the one-time flow relies solely on the backend scheduler.
- **Potential bug — no re-fetch after save:** Neither `handleSaveSchedule()` nor `handleSaveDemoSchedule()` re-fetches the schedule from the backend after saving. The auto-schedule form keeps its local state; the one-time form does not update the badge (`demoScheduled` stays unchanged) unless the page is reloaded.
