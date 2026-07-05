# MENTIX Hub - UML Diagrams

## Overview

This document describes the four UML diagrams created for the MENTIX Hub platform. The diagrams are authored in **PlantUML** format and can be rendered using any PlantUML-compatible tool.

---

## 1. Use Case Diagram

**File:** `docs/diagrams/usecase_diagram.puml`

### Purpose
The Use Case Diagram provides a high-level view of the system's functionality from the perspective of its actors. It shows the major features of the platform and which user roles can perform them.

### Actors

| Actor | Description |
|---|---|
| **Student** | A registered user who browses projects, interacts socially, and requests mentorship/collaboration |
| **Mentor** | A student who has been promoted; can accept mentorship requests |
| **Moderator** | An admin-level user who reviews reports and mentor promotion requests |
| **Admin** | A privileged user with access to the full admin console (user management, backups, settings, audit logs) |
| **Super Admin** | Top-level administrator with unrestricted access to all system features |

### Actor Hierarchy

```
Super Admin
  └── Admin
        └── Moderator
Mentor (extends Student)
```

### Key Use Cases

| UC ID | Use Case | Primary Actor | Description |
|---|---|---|---|
| UC1-UC4 | Account Management | Student | Registration, login, OTP verification, password reset |
| UC5-UC10 | Project Management | Student | CRUD operations, file upload, browsing and searching |
| UC11-UC13 | Social Features | Student | Hearts, comments, favorites |
| UC14-UC16 | Mentorship | Student/Mentor | Request, respond, promotion |
| UC17-UC18 | Collaboration | Student/Mentor | Request and respond |
| UC19 | Reporting | Student | Report inappropriate content |
| UC20-UC22 | Moderation | Moderator | Review and resolve reports, handle promotions |
| UC23-UC28 | Administration | Admin/Super Admin | User management, settings, backups, database ops, audit logs |

---

## 2. Activity Diagram

**File:** `docs/diagrams/activity_collaboration.puml`

### Purpose
The Activity Diagram models the workflow for the **Collaboration Request** feature, illustrating the sequence of actions from initiation to completion.

### Flow Description

1. **Initiation:** The user browses projects and views a project detail page
2. **Action:** The user clicks "Request Collaboration" and fills in a message
3. **Validation:** The system validates the request
4. **Decision 1 — Authentication:** If the user is not authenticated, they are redirected to login
5. **Decision 2 — Recipient Validity:** If the recipient is valid, the request is saved and the recipient receives a notification
6. **Completion:** The user is shown a success page

### Alternate Flows
- **Unauthenticated user:** Redirected to login before proceeding
- **Invalid recipient:** Error message returned, flow terminates

---

## 3. Class Diagram

**File:** `docs/diagrams/class_diagram.puml`

### Purpose
The Class Diagram models the static structure of the MENTIX Hub domain, showing the system's core entities, their attributes, methods, and relationships.

### Key Entities

| Entity | Description | Key Attributes |
|---|---|---|
| **User** | Central actor representing all platform users | id, email, username, role, is_verified, is_banned |
| **Project** | A coding project uploaded by a user | id, title, description, tags, heart_count, file_url |
| **Heart** | A "like" given to a project by a user | user_id, project_id (composite) |
| **Comment** | A textual comment on a project | user_id, project_id, content |
| **Favorite** | A saved/bookmarked project | user_id, project_id (composite) |
| **Mentorship** | A mentorship request between student and mentor | student_id, mentor_id, status, feedback |
| **Collaboration** | A collaboration request between two users | requester_id, recipient_id, status |
| **Report** | A content report submitted by a user | reporter_id, project_id, status, resolution |
| **AuditLog** | An administrative action record | actor_id, action_type, details, ip_address |
| **Backup** | A database backup record | filename, tables_included, status, type |
| **SystemSetting** | A configurable system parameter | key, value |
| **Notification** | A user notification | user_id, type, title, is_read |

### Key Relationships

- **User 1 → N Project**: A user can own multiple projects
- **User 1 → N Heart/Comment/Favorite**: A user can perform many social actions
- **Project 1 → N Heart/Comment/Favorite**: A project can receive many social interactions
- **User 1 → N Mentorship** (as mentor or student): A user can be involved in multiple mentorship relationships
- **User 1 → N Collaboration** (as requester or recipient): A user can have multiple collaboration requests
- **User 1 → N Notification**: A user receives multiple notifications
- **Project 1 → N Report**: A project can be reported multiple times

---

## 4. Sequence Diagram

**File:** `docs/diagrams/sequence_mentorship.puml`

### Purpose
The Sequence Diagram illustrates the **Mentorship Request** workflow, showing the interaction between actors and system components over time. It covers both the student requesting mentorship and the mentor responding.

### Flow: Student Requests Mentorship

| Step | Component | Action |
|---|---|---|
| 1 | Student → Frontend | Clicks "Request Mentorship" |
| 2 | Frontend → API | `POST /api/mentorships` with request data |
| 3 | API → Auth Middleware | Verifies JWT bearer token |
| 4 | API → Mentorship Controller | `createRequest()` method invoked |
| 5 | Controller → Repository | `save()` mentorship data |
| 6 | Repository → Database | `INSERT INTO mentorships` |
| 7 | Repository → Controller | Returns created record |
| 8 | Controller → Notification Service | `sendNotification()` to mentor |
| 9 | Notification Service → Database | `INSERT INTO notifications` |
| 10 | API → Frontend | Returns `201 Created` with status "pending" |

### Flow: Mentor Responds

| Step | Component | Action |
|---|---|---|
| 1 | Mentor → Frontend | Opens mentorship requests list |
| 2 | Frontend → API | `GET /api/mentorships` |
| 3 | API → Auth Middleware | Verifies JWT |
| 4 | API → Controller | `listRequests()` |
| 5 | Controller → Repository | `findByMentor()` |
| 6 | Repository → Database | `SELECT ... WHERE mentor_id = ?` |
| 7 | Chain returns | Requests displayed to mentor |
| 8 | Mentor → Frontend | Accepts request with feedback |
| 9 | Frontend → API | `PUT /api/mentorships/:id` |
| 10 | Controller → Repository | `updateStatus(id, "accepted", feedback)` |
| 11 | Repository → Database | `UPDATE mentorships SET status = 'accepted'` |
| 12 | Controller → Notification Service | Notifies student of acceptance |
| 13 | API → Frontend | Returns `200 OK` |

### Components Involved

| Component | Role |
|---|---|
| **Frontend (React)** | User interface and API communication |
| **API Gateway (Express)** | Route handling and request dispatching |
| **Auth Middleware** | JWT verification and user context injection |
| **Controller** | Business logic and orchestration |
| **Repository** | Database access layer (parameterized queries) |
| **Notification Service** | Asynchronous notification creation |
| **MySQL Database** | Persistent data storage |

---

## Rendering the Diagrams

These diagrams use **PlantUML** syntax. To render them:

1. Use the [PlantUML online server](https://www.plantuml.com/plantuml/uml/)
2. Install the PlantUML VS Code extension for local rendering
3. Use `puml` CLI: `puml generate docs/diagrams/*.puml -o docs/diagrams/output/`
