# MENTIX Hub - Frontend Project Structure

## 📁 Directory Structure

```
src/
├── assets/                    # Static assets (images, icons, fonts)
│   ├── hero.png
│   ├── react.svg
│   └── vite.svg
│
├── components/                # React components
│   ├── admin/                 # Admin-specific components
│   │   ├── StatCard.jsx
│   │   ├── UserTable.jsx
│   │   ├── ReportCard.jsx
│   │   └── ...
│   │
│   ├── client/                # Client-specific components
│   │   ├── ProjectCard.jsx
│   │   ├── MentorCard.jsx
│   │   └── ...
│   │
│   └── shared/                # Shared UI components
│       ├── Button.jsx
│       ├── Modal.jsx
│       ├── Table.jsx
│       ├── Input.jsx
│       ├── Pagination.jsx
│       ├── Loading.jsx
│       └── FormControls.jsx
│
├── pages/                     # Page components
│   ├── admin/                 # Admin pages
│   │   ├── Dashboard.jsx
│   │   ├── Users.jsx
│   │   ├── Projects.jsx
│   │   ├── Reports.jsx
│   │   ├── MentorRequests.jsx
│   │   ├── Settings.jsx
│   │   ├── AuditLogs.jsx
│   │   └── Login.jsx
│   │
│   └── client/                # Client pages
│       ├── Home.jsx
│       ├── Projects.jsx
│       ├── Mentors.jsx
│       ├── Profile.jsx
│       ├── Login.jsx
│       └── Register.jsx
│
├── layouts/                   # Layout wrappers
│   ├── admin/
│   │   └── AdminLayout.jsx    # Sidebar + Header + Footer for admin
│   │
│   └── client/
│       └── ClientLayout.jsx   # Header + Footer for client
│
├── routes/                    # Route definitions
│   ├── index.jsx             # Main router combining admin + client
│   ├── AdminRoutes.jsx       # /admin/* routes
│   └── ClientRoutes.jsx      # /* routes
│
├── services/                  # Business logic layer
│   ├── authService.js        # Authentication operations
│   ├── userService.js        # User CRUD operations
│   ├── projectService.js     # Project operations
│   ├── reportService.js      # Report operations
│   ├── mentorService.js      # Mentor operations
│   └── auditService.js       # Audit log operations
│
├── data/                      # Mock data (development only)
│   └── mock/
│       ├── users.js
│       ├── projects.js
│       ├── reports.js
│       ├── mentorRequests.js
│       └── auditLogs.js
│
├── contexts/                  # React Context providers
│   ├── AuthContext.jsx       # User authentication state
│   └── ThemeContext.jsx      # Theme/UI preferences
│
├── hooks/                     # Custom React hooks
│   ├── useAuth.js
│   ├── usePagination.js
│   └── useDebounce.js
│
├── utils/                     # Utility functions
│   ├── formatters.js         # Date, currency, text formatters
│   ├── validators.js         # Form validation helpers
│   └── constants.js          # App-wide constants
│
├── App.jsx                    # Root component
├── main.jsx                   # React entry point
└── index.css                  # Global styles (Tailwind)
```

---

## 🎯 Architecture Principles

### 1. **Separation of Concerns**
- **Client** and **Admin** are logically separated
- Shared components live in `components/shared`

### 2. **Service Layer Pattern**
```
Page → Service → Data Source (Mock/API)
```

**Flow:**
1. Page calls `userService.getAllUsers()`
2. Service fetches from mock data OR API
3. Page receives data and renders

**Benefits:**
- Pages never touch mock data directly
- Easy to swap mock → real API
- Centralized business logic

### 3. **Route Structure**

**Client Routes:**
- `/` - Home
- `/projects` - Browse projects
- `/mentors` - Find mentors
- `/profile` - User profile
- `/login` - Client login
- `/register` - Client registration

**Admin Routes:**
- `/admin` - Redirect to dashboard
- `/admin/dashboard` - Overview stats
- `/admin/users` - User management
- `/admin/projects` - Project moderation
- `/admin/reports` - Handle reports
- `/admin/mentor-requests` - Approve/reject mentors
- `/admin/settings` - System configuration
- `/admin/audit-logs` - Activity logs

---

## 🚀 Migration Plan

### Phase 1: Core Infrastructure ✅
- [x] Create folder structure
- [ ] Set up React Router
- [ ] Create AuthContext
- [ ] Build shared components (Button, Modal, Table, etc.)

### Phase 2: Mock Data Layer
- [ ] Create mock data files in `data/mock/`
- [ ] Build service layer functions
- [ ] Test service → mock data flow

### Phase 3: Admin System
- [ ] Convert HTML to AdminLayout
- [ ] Build admin components (StatCard, UserTable, etc.)
- [ ] Create admin pages
- [ ] Wire up admin routes
- [ ] Connect pages → services → mock data

### Phase 4: Client System (Your Friend)
- [ ] Create ClientLayout
- [ ] Build client components
- [ ] Create client pages
- [ ] Wire up client routes
- [ ] Connect to services

### Phase 5: API Integration (Future)
- [ ] Update services to call Express API
- [ ] Replace mock data with API calls
- [ ] Add error handling
- [ ] Add loading states

---

## 📋 Next Steps

**Immediate Actions:**
1. Share admin HTML file → convert to React components
2. Define mock data schemas
3. Build shared UI components
4. Set up React Router structure
5. Create layouts

**Ready to proceed?** Drop the admin HTML and we'll start Phase 2-3 together.
