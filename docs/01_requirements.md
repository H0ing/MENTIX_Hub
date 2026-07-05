# MENTIX Hub - Requirements Specification

## Project Overview

MENTIX Hub is a full-stack platform connecting students, mentors, and developers for project collaboration, mentorship, and skill development. It serves as a portfolio/community hub where users can showcase projects, interact socially, request mentorship, and collaborate on development work.

---

## Functional Requirements

### FR-01: User Registration & Authentication
| ID | Requirement | Priority |
|---|---|---|
| FR-01.1 | Users shall register using email and password | High |
| FR-01.2 | Email verification via OTP must be sent upon registration | High |
| FR-01.3 | Users shall log in with email and password | High |
| FR-01.4 | JWT access tokens and refresh tokens shall be used for session management | High |
| FR-01.5 | Users shall reset forgotten passwords via email OTP | Medium |
| FR-01.6 | Users shall log out, invalidating their refresh tokens | Medium |
| FR-01.7 | Users shall resend OTP if the previous one expires | Low |

### FR-02: Project Management
| ID | Requirement | Priority |
|---|---|---|
| FR-02.1 | Users shall create projects with title, description, tags, and external links | High |
| FR-02.2 | Users shall upload project files (ZIP) and thumbnail images | High |
| FR-02.3 | Users shall edit their own project details | High |
| FR-02.4 | Users shall delete their own projects | High |
| FR-02.5 | Projects shall support tags for categorization and search | Medium |

### FR-03: Project Discovery & Browsing
| ID | Requirement | Priority |
|---|---|---|
| FR-03.1 | All users shall browse published projects | High |
| FR-03.2 | Users shall search projects by title and tags | High |
| FR-03.3 | Users shall filter projects by tags | Medium |
| FR-03.4 | Users shall sort projects by date, popularity, or relevance | Medium |
| FR-03.5 | Browsing shall support pagination | Medium |

### FR-04: Social Interactions
| ID | Requirement | Priority |
|---|---|---|
| FR-04.1 | Users shall "heart" (like) projects | High |
| FR-04.2 | Users shall comment on projects | High |
| FR-04.3 | Users shall favorite/save projects to their personal collection | Medium |
| FR-04.4 | Users shall remove hearts and favorites | Low |

### FR-05: Mentorship System
| ID | Requirement | Priority |
|---|---|---|
| FR-05.1 | Users shall send mentorship requests to mentors | High |
| FR-05.2 | Mentors shall accept or reject mentorship requests | High |
| FR-05.3 | Mentors shall provide structured feedback on accepted requests | Medium |
| FR-05.4 | Users shall view incoming and outgoing mentorship requests | Medium |
| FR-05.5 | Users shall request promotion from student to mentor | Medium |

### FR-06: Collaboration System
| ID | Requirement | Priority |
|---|---|---|
| FR-06.1 | Users shall send collaboration requests to other users | High |
| FR-06.2 | Recipients shall accept or reject collaboration requests | High |
| FR-06.3 | Both parties shall view collaboration request details | Medium |
| FR-06.4 | Users shall cancel their own outgoing collaboration requests | Low |

### FR-07: Reporting & Moderation
| ID | Requirement | Priority |
|---|---|---|
| FR-07.1 | Users shall report projects for policy violations | High |
| FR-07.2 | Moderators shall review and resolve reports | High |
| FR-07.3 | Moderators shall send resolution notices to reporters | Medium |
| FR-07.4 | System shall track all moderation actions in audit logs | High |

### FR-08: Admin Console
| ID | Requirement | Priority |
|---|---|---|
| FR-08.1 | Admins shall manage all users (create, suspend, ban, delete, change roles) | High |
| FR-08.2 | Admins shall view and manage the mentor promotion queue | High |
| FR-08.3 | Admins shall configure system settings (mentor qualification thresholds) | Medium |
| FR-08.4 | Admins shall run manual database backups | Medium |
| FR-08.5 | Admins shall schedule automated backups | Medium |
| FR-08.6 | Admins shall view backup history and prune old backups | Medium |
| FR-08.7 | Admins shall monitor database health (connections, disk usage, uptime) | Medium |
| FR-08.8 | Admins shall view per-table disk usage | Low |
| FR-08.9 | Admins shall run read-only SQL queries on the database | Low |
| FR-08.10 | Admins shall view audit logs with filtering by date, actor, action type | High |
| FR-08.11 | Admins shall manage MySQL database-level users and table privileges | Low |

### FR-09: Notifications & Inbox
| ID | Requirement | Priority |
|---|---|---|
| FR-09.1 | Users shall receive notifications for mentorship requests | Medium |
| FR-09.2 | Users shall receive notifications for collaboration requests | Medium |
| FR-09.3 | Users shall receive notifications for report resolutions | Medium |
| FR-09.4 | Users shall view all notifications in an inbox | Medium |

### FR-10: User Profiles
| ID | Requirement | Priority |
|---|---|---|
| FR-10.1 | Users shall view their own profile with project history | Medium |
| FR-10.2 | Users shall edit their profile information | Medium |
| FR-10.3 | Users shall view their saved favorites and liked projects | Low |
| FR-10.4 | Users shall view other users' public profiles | Low |

---

## Non-Functional Requirements

### NFR-01: Security
| ID | Requirement | Priority |
|---|---|---|
| NFR-01.1 | All API endpoints shall require authentication except registration and login | High |
| NFR-01.2 | Passwords shall be hashed using bcrypt | High |
| NFR-01.3 | JWT tokens shall have configurable expiration times | High |
| NFR-01.4 | Role-based access control shall be enforced at every protected endpoint | High |
| NFR-01.5 | Rate limiting shall be applied to auth endpoints to prevent brute force attacks | High |
| NFR-01.6 | SQL injection prevention shall be handled via parameterized queries | High |
| NFR-01.7 | CORS shall be configured to restrict cross-origin requests | Medium |
| NFR-01.8 | HTTP security headers shall be set via Helmet | Medium |

### NFR-02: Performance
| ID | Requirement | Priority |
|---|---|---|
| NFR-02.1 | API response time shall be under 500ms for 95% of requests | High |
| NFR-02.2 | The system shall support at least 100 concurrent users | Medium |
| NFR-02.3 | Database queries shall use proper indexing for common query patterns | Medium |
| NFR-02.4 | Pagination shall limit result sets to prevent memory exhaustion | Medium |

### NFR-03: Reliability & Availability
| ID | Requirement | Priority |
|---|---|---|
| NFR-03.1 | The system shall have 99.5% uptime during business hours | Medium |
| NFR-03.2 | Database backups shall be restorable to a consistent state | High |
| NFR-03.3 | Scheduled backups shall not block user-facing operations | Medium |
| NFR-03.4 | Automatic error handling shall prevent server crashes from unhandled exceptions | High |

### NFR-04: Maintainability
| ID | Requirement | Priority |
|---|---|---|
| NFR-04.1 | Backend shall follow a layered architecture (Routes -> Controllers -> Repositories) | High |
| NFR-04.2 | Frontend shall use a service layer pattern to abstract data sources | High |
| NFR-04.3 | Code shall be modular with clear separation of concerns | High |
| NFR-04.4 | Comprehensive audit logging shall track all administrative actions | Medium |
| NFR-04.5 | API documentation shall be maintained alongside code | Medium |

### NFR-05: Usability
| ID | Requirement | Priority |
|---|---|---|
| NFR-05.1 | The UI shall be responsive and work on mobile and desktop devices | High |
| NFR-05.2 | Forms shall provide clear validation error messages | Medium |
| NFR-05.3 | Loading states shall be displayed during data fetching | Medium |
| NFR-05.4 | Navigation shall be intuitive with a consistent layout | Medium |

### NFR-06: Scalability
| ID | Requirement | Priority |
|---|---|---|
| NFR-06.1 | The database connection pool shall support connection scaling | Medium |
| NFR-06.2 | File uploads shall be stored on the filesystem with configurable paths | Low |
| NFR-06.3 | The 3-tier database pool architecture shall isolate operational and admin workloads | High |

### NFR-07: Data Integrity
| ID | Requirement | Priority |
|---|---|---|
| NFR-07.1 | Database transactions shall be used for operations spanning multiple tables | High |
| NFR-07.2 | Foreign key constraints shall enforce referential integrity | High |
| NFR-07.3 | Cascade deletes shall maintain data consistency | Medium |

---

## Main Features by Application Area

### User-Facing Application
1. **Authentication & Account Management** — Registration, login, email verification, password reset
2. **Project Portfolio** — Create, upload, browse, search, and manage coding projects
3. **Social Engagement** — Hearts, comments, favorites on projects
4. **Mentorship** — Request mentorship, provide feedback, manage mentor status
5. **Collaboration** — Request collaboration, accept/reject, manage team formation
6. **Profile Management** — Personal profile with project history and social activity
7. **Reporting** — Report inappropriate content to moderators
8. **Notifications** — Inbox for mentorship, collaboration, and report updates

### Admin Console
1. **Dashboard** — Overview of system statistics and activity
2. **Moderation** — Review reports, manage mentor promotions, revoke mentor status
3. **User Management** — Full CRUD on all users, role assignment, suspension/ban
4. **Backup System** — Manual and scheduled database backups with retention policies
5. **Database Operations** — Health monitoring, table stats, SQL runner, user management
6. **Audit Logs** — Track all admin actions with filtering and search
7. **Settings** — Configure system-wide mentor qualification thresholds
8. **Sent Forms** — View communications sent to users (reports, promotions, suspensions)
