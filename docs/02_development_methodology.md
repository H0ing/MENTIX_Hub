# MENTIX Hub - Development Methodology

## Selected Methodology: SCRUM

MENTIX Hub is developed using **SCRUM**, an agile framework chosen for its iterative delivery, adaptability to changing requirements, and emphasis on continuous stakeholder feedback. Given the platform's dual nature (user-facing application + admin console), SCRUM allows the team to deliver incremental value across both domains in parallel.

---

## Why SCRUM Over Alternatives

| Criteria | SCRUM | Waterfall | Kanban |
|---|---|---|---|
| Requirement certainty | Medium — features evolve with feedback | High — requires fixed requirements | Medium |
| Delivery cadence | Fixed 2-week sprints | Single final delivery | Continuous flow |
| Stakeholder involvement | High (sprint reviews) | Low (only at milestones) | Medium |
| Risk management | Early risk detection via demos | Late risk discovery | Moderate |
| Team size suitability | 5-9 members ideal | Any size | Any size |

SCRUM was selected because the project has clearly defined core features (MVP) but benefits from iterative refinement based on user feedback — particularly in the mentorship, collaboration, and moderation workflows.

---

## Sprint Cadence

| Parameter | Value |
|---|---|
| Sprint duration | 2 weeks (10 working days) |
| Ceremonies | Sprint Planning (2h), Daily Standup (15min), Sprint Review (1h), Retrospective (1h) |
| Artifacts | Product Backlog, Sprint Backlog, Increment, Burndown Chart |

---

## Sprint Structure

### Sprint 0: Foundation (Week 1-2)
- Project setup (repo, CI/CD, environment config)
- Database schema design and migration scripts
- Authentication system (JWT, registration, login)
- Basic Express server with middleware stack
- React project scaffolding with routing

### Sprint 1: Core User Features (Week 3-4)
- User registration with OTP verification
- Project CRUD operations
- File upload for project files and thumbnails
- Project browsing with search and pagination

### Sprint 2: Social Features (Week 5-6)
- Hearts (likes) system for projects
- Comments on projects
- Favorites/saved projects
- User profiles

### Sprint 3: Mentorship & Collaboration (Week 7-8)
- Mentorship request/response workflow
- Collaboration request/response workflow
- Notification system and inbox
- Promotion request (student to mentor)

### Sprint 4: Reporting & Moderation (Week 9-10)
- Content reporting system
- Report resolution workflow
- Admin moderation panel (reports queue)
- Audit logging infrastructure

### Sprint 5: Admin Console (Week 11-12)
- Admin dashboard with stats
- User management (CRUD, roles, suspension)
- System settings configuration
- Backup system (manual + scheduled)
- Database health monitoring

### Sprint 6: Polish & Hardening (Week 13-14)
- Rate limiting and security hardening
- Performance optimization and indexing
- Error handling and edge case coverage
- Responsive design polish
- Testing and bug fixes

---

## Key SCRUM Roles

| Role | Team Member | Responsibilities |
|---|---|---|
| **Product Owner** | Project Lead | Manages product backlog, prioritizes features, aligns with stakeholder expectations |
| **SCRUM Master** | Senior Developer | Facilitates ceremonies, removes blockers, coaches agile practices |
| **Development Team** | All Developers | Self-organizing team that designs, builds, tests, and delivers increments |

---

## Definition of Done

A user story is considered **Done** when:

- [ ] All acceptance criteria are implemented
- [ ] Code is reviewed by at least one other team member
- [ ] Unit tests pass (80%+ coverage for new code)
- [ ] API endpoints tested via integration tests
- [ ] UI is responsive on mobile and desktop viewports
- [ ] No new security vulnerabilities introduced
- [ ] Audit logging is in place for admin actions (if applicable)
- [ ] Feature is deployed to staging environment and verified
- [ ] Documentation is updated (API docs, setup guide if changed)

---

## Estimation Technique

The team uses **Planning Poker** with the Fibonacci sequence:

| Estimate | Meaning |
|---|---|
| 1 | Trivial (e.g., CSS tweak, typo fix) |
| 2 | Small (e.g., single endpoint, simple component) |
| 3 | Medium (e.g., full CRUD for one entity) |
| 5 | Large (e.g., mentorship workflow across frontend + backend) |
| 8 | Very Large (e.g., admin console panels) |
| 13 | Too Large — must be split into smaller stories |

---

## Tools Used

| Category | Tool |
|---|---|
| Project Management | Jira / Trello |
| Version Control | Git + GitHub |
| CI/CD | GitHub Actions |
| Communication | Slack / Discord |
| Documentation | Markdown + PlantUML |
| Testing | Jest (backend), Vitest (frontend) |
| Code Quality | ESLint |
