# MENTIX Hub - Team Responsibilities & User Stories

## Team Structure

The MENTIX Hub development team consists of **6 members**, organized into cross-functional roles covering both backend and frontend development.

| Role | Team Member | Focus Area |
|---|---|---|
| **Frontend Lead** | Member A | React architecture, component design, state management, UI/UX |
| **Backend Lead** | Member B | Express architecture, database design, API design, security |
| **Full-Stack Developer** | Member C | User-facing features (auth, projects, social) — both frontend and backend |
| **Full-Stack Developer** | Member D | Mentorship, collaboration, reporting — both frontend and backend |
| **Admin Console Developer** | Member E | Admin panel frontend + admin API endpoints |
| **QA & DevOps** | Member F | Testing, CI/CD, deployment, performance, documentation |

---

## User Stories by Sprint

### Sprint 0: Foundation (Setup)

| User Story | Story Points | Assigned To | Notes |
|---|---|---|---|
| US-000: Set up monorepo structure with Git branching strategy | 2 | Member F | GitHub repo, branch protection, .gitignore |
| US-001: Configure Express server with middleware stack | 3 | Member B | Helmet, CORS, rate-limiter, error handler, logger |
| US-002: Set up MySQL database with 3-tier connection pools | 5 | Member B | user/dev/root pools, connection config |
| US-003: Scaffold React app with Vite + Tailwind + Router | 3 | Member A | Project structure, eslint, routing skeleton |
| US-004: Set up CI/CD pipeline (lint, test, build) | 3 | Member F | GitHub Actions workflow |
| US-005: Design and implement database schema (migrations) | 5 | Member B | All tables: users, projects, hearts, comments, favorites, mentorships, collaborations, reports, audit_logs, backups, settings, notifications |

---

### Sprint 1: Core User Features

| User Story | Story Points | Assigned To | Backend | Frontend |
|---|---|---|---|---|
| US-101: User registration with email + password | 5 | Member C | Registration endpoint, password hashing, JWT generation | SignUp page with form validation |
| US-102: Email verification via OTP | 5 | Member C | OTP generation, email sending via Nodemailer | OTP verification page |
| US-103: User login with JWT (access + refresh tokens) | 3 | Member C | Login endpoint, token generation | Login page |
| US-104: Forgot and reset password flow | 5 | Member C | Password reset endpoints, OTP for reset | ForgotPassword, ResetPassword pages |
| US-105: Create and edit projects | 8 | Member D | Project CRUD endpoints | UploadProject page, edit form |
| US-106: Upload project files (ZIP) and thumbnails | 5 | Member D | Multer configuration, file storage | File upload UI component |
| US-107: Browse projects with search, tags, pagination | 5 | Member D | Search/filter/pagination endpoints | Project discovery page, ProjectCard component |
| US-108: Delete own projects | 2 | Member D | DELETE endpoint with ownership check | Delete button with confirmation modal |

**Sprint 1 Team Allocation:**

| Member | Stories | Role |
|---|---|---|
| Member A | US-105, US-106, US-107, US-108 (frontend) | Lead component design |
| Member B | All backend endpoints review + database indexing | Backend oversight |
| Member C | US-101, US-102, US-103, US-104 (full stack) | Authentication owner |
| Member D | US-105, US-106, US-107, US-108 (full stack) | Project management owner |
| Member E | Backend API testing, integration tests | Testing support |
| Member F | CI/CD refinement, test infrastructure | DevOps |

---

### Sprint 2: Social Features

| User Story | Story Points | Assigned To | Backend | Frontend |
|---|---|---|---|---|
| US-201: Heart (like/unlike) a project | 3 | Member C | Heart toggle endpoint | Heart button with optimistic UI |
| US-202: Comment on projects | 5 | Member C | Comment CRUD endpoints | Comment section component |
| US-203: Favorite/save projects | 3 | Member C | Favorite add/remove endpoints | Favorite button, saved list |
| US-204: User profile page | 5 | Member D | User profile GET/PUT endpoints | Profile page with edit mode |
| US-205: View other users' public profiles | 3 | Member D | Public profile endpoint | Public profile view component |

**Sprint 2 Team Allocation:**

| Member | Stories | Role |
|---|---|---|
| Member A | US-201, US-202, US-203 (frontend) | Social feature UI |
| Member B | API review, N+1 query prevention, indexing | Backend oversight |
| Member C | US-201, US-202, US-203 (full stack) | Social features owner |
| Member D | US-204, US-205 (full stack) | Profile owner |
| Member E | Social feature integration tests | Testing |
| Member F | Performance testing, load testing | QA |

---

### Sprint 3: Mentorship & Collaboration

| User Story | Story Points | Assigned To | Backend | Frontend |
|---|---|---|---|---|
| US-301: Send mentorship request | 5 | Member D | Mentorship request endpoint | RequestMentorship page |
| US-302: Accept/reject mentorship with feedback | 5 | Member D | Respond endpoint with feedback | RespondMentorship page |
| US-303: View mentorship requests (incoming/outgoing) | 3 | Member D | List endpoints with filters | Inbox with mentorship tab |
| US-304: Send collaboration request | 5 | Member C | Collaboration request endpoint | RequestCollaboration page |
| US-305: Accept/reject collaboration request | 5 | Member C | Collaboration respond endpoint | AcceptCollaboration page |
| US-306: Cancel outgoing collaboration request | 2 | Member C | Cancel endpoint | Cancel button |
| US-307: Request promotion from student to mentor | 3 | Member D | Promotion request endpoint | Promotion request form |
| US-308: Notification system and inbox | 5 | Member C | Notification CRUD endpoints | Inbox page with notification list |

**Sprint 3 Team Allocation:**

| Member | Stories | Role |
|---|---|---|
| Member A | US-301, US-302, US-303, US-308 (frontend) | Mentorship UI + Inbox |
| Member B | API security review, transaction management | Backend oversight |
| Member C | US-304, US-305, US-306, US-308 (full stack) | Collaboration + Notifications owner |
| Member D | US-301, US-302, US-303, US-307 (full stack) | Mentorship + Promotion owner |
| Member E | Integration tests for all workflows | Testing |
| Member F | Notification delivery reliability testing | QA |

---

### Sprint 4: Reporting & Moderation

| User Story | Story Points | Assigned To | Backend | Frontend |
|---|---|---|---|---|
| US-401: Report a project | 3 | Member D | Report submission endpoint | ReportProject page |
| US-402: View report details | 2 | Member D | Report detail endpoint | ReportDetail component |
| US-403: Moderator reviews report queue | 5 | Member E | Admin report list endpoint | Moderation page (Reports tab) |
| US-404: Moderator resolves/dismisses reports | 5 | Member E | Report resolution endpoints | Resolution form |
| US-405: Moderator reviews mentor promotion queue | 3 | Member E | Admin promotion list endpoint | Moderation page (Promotions tab) |
| US-406: Approve/reject mentor promotions | 3 | Member E | Promotion approve/reject endpoints | Approve/reject actions |
| US-407: Audit logging for all moderation actions | 3 | Member B | Audit log middleware + repository | — |

**Sprint 4 Team Allocation:**

| Member | Stories | Role |
|---|---|---|
| Member A | US-403, US-404, US-405, US-406 (frontend) | Moderation panel UI |
| Member B | US-407 + security review | Audit logging owner |
| Member D | US-401, US-402 (full stack) | Reporting feature owner |
| Member E | US-403, US-404, US-405, US-406 (full stack) | Moderation system owner |
| Member F | Report audit trail verification | QA |

---

### Sprint 5: Admin Console

| User Story | Story Points | Assigned To | Backend | Frontend |
|---|---|---|---|---|
| US-501: Admin dashboard with system statistics | 5 | Member E | Dashboard stats endpoint | Dashboard page with stat cards |
| US-502: User management (list, create, edit, suspend, ban, delete) | 8 | Member E | Admin user CRUD endpoints | Users page with table + modals |
| US-503: Role assignment with hierarchical enforcement | 5 | Member B | Role change endpoint with validation | Role selector in user editor |
| US-504: System settings configuration (mentor thresholds) | 3 | Member E | Settings CRUD endpoints | Settings page with toggle/input controls |
| US-505: Manual database backup | 5 | Member B | Backup execution endpoint | Backup page (Run Backup) |
| US-506: Scheduled automated backups with cron | 5 | Member B | Backup scheduler (node-cron) | Backup page (Schedule) |
| US-507: Backup history and retention/pruning | 3 | Member B | Backup history + prune endpoints | Backup history table |
| US-508: Database health monitoring | 3 | Member E | Health check endpoint | Database page (health cards) |
| US-509: Per-table disk usage view | 2 | Member E | Table stats endpoint | Database page (table list) |
| US-510: Read-only SQL query runner | 3 | Member B | SQL query endpoint (dev pool) | Database page (SQL runner) |
| US-511: Audit log viewer with filters | 5 | Member E | Audit log list endpoint with filters | Audit Logs page |
| US-512: Sent forms viewer | 3 | Member E | Sent forms endpoint + detail | Sent Forms page |

**Sprint 5 Team Allocation:**

| Member | Stories | Role |
|---|---|---|
| Member A | US-501, US-502, US-504, US-507, US-508, US-509, US-511, US-512 (frontend) | Admin console UI lead |
| Member B | US-503, US-505, US-506, US-510 + DB security | Backend/admin API owner |
| Member E | US-501, US-502, US-504, US-508, US-509, US-511, US-512 (full stack) | Admin console owner |
| Member F | Admin console E2E testing, backup restoration tests | QA |

---

### Sprint 6: Polish & Hardening

| User Story | Story Points | Assigned To | Notes |
|---|---|---|---|
| US-601: Rate limiting fine-tuning and security audit | 5 | Member B | Helmet config, CORS, JWT expiration |
| US-602: Performance optimization and database indexing | 5 | Member B | Query profiling, missing indexes |
| US-603: Responsive design polish (mobile/tablet) | 5 | Member A | CSS adjustments, breakpoint testing |
| US-604: Error boundary implementation (frontend) | 3 | Member A | React error boundaries, fallback UI |
| US-605: Comprehensive test coverage (backend) | 5 | Member F | Jest tests for all controllers |
| US-606: Bug fixes from QA pass | 8 | All | Priority-based bug resolution |
| US-607: Documentation completion | 3 | Member F | API docs, setup guide, README |

---

## Role Responsibility Matrix

| Area | Member A | Member B | Member C | Member D | Member E | Member F |
|---|---|---|---|---|---|---|
| **Authentication** | UI | API + Security | Full stack | — | — | Tests |
| **Projects** | UI | DB Review | — | Full stack | — | Tests |
| **Social (Hearts/Comments/Favorites)** | UI | DB Review | Full stack | — | — | Tests |
| **Profiles** | UI | DB Review | — | Full stack | — | Tests |
| **Mentorship** | UI | DB Review | — | Full stack | — | Tests |
| **Collaboration** | UI | DB Review | Full stack | — | — | Tests |
| **Notifications** | UI | DB Review | Full stack | — | — | Tests |
| **Reporting** | UI | DB Review | — | Full stack | — | Tests |
| **Moderation** | UI | Security | — | — | Full stack | Tests |
| **Admin Console** | UI | API + DB Security | — | — | Full stack | E2E Tests |
| **Backup System** | UI | Full stack | — | — | — | Restore Tests |
| **Audit Logs** | UI | Middleware | — | — | Full stack | Tests |
| **DevOps** | — | — | — | — | — | CI/CD, Deploy |
| **Documentation** | Component Docs | API Docs | Feature Docs | Feature Docs | Admin Docs | Overall Docs |

---

## Communication & Collaboration

| Practice | Frequency | Participants |
|---|---|---|
| **Daily Standup** | Daily (15 min) | All 6 members |
| **Sprint Planning** | Every 2 weeks (2 hours) | All 6 members |
| **Sprint Review** | End of sprint (1 hour) | All + Stakeholders |
| **Retrospective** | End of sprint (1 hour) | All 6 members |
| **Backend-Frontend Sync** | As needed | Member B + Member A |
| **Code Review** | Per PR | 2 reviewers minimum |
