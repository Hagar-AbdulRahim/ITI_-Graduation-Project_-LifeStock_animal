# Admin Dashboard — Implementation Prompt

 build the admin dashboard and role-based user system.

---

```
# Project: LifeStock Animal Health Platform — Admin Dashboard + Role-Based Access

## Context
I have an existing full-stack livestock health app:
- **Backend:** Node.js + Express + MongoDB (port 5000), JWT auth (access + httpOnly refresh cookie)
- **Frontend:** React 19 + Vite + Redux Toolkit + Tailwind CSS + React Router 6
- **Language/UI:** Arabic RTL, Cairo font, green theme (#2d5a1b, #3d6b47, cream backgrounds)
- **Repo path:** ITI_-Graduation-Project_-LifeStock_animal

Current state:
- Controllers & Mongoose models exist for: auth, users, farms, animals, vaccinations, health-cases, onboarding, notifications
- `backend/routes/` folder is MISSING — recreate all route files wired in server.js first
- NO role system exists — all users are farmers with ownership-based access only
- Frontend has farm dashboard at `/farms/:farmId/*` but NO admin or doctor portals

## Goal
Implement a complete **Admin Dashboard** and refactor the **User module** to support 3 roles:
1. **user** (farmer) — manages own farms/animals (existing behavior)
2. **doctor** (veterinarian) — manages health cases, consultations, outbreak alerts
3. **admin** — full access to everything on the platform

---

## PHASE 1 — Backend: User module & RBAC

### 1.1 Extend User model (`backend/models/user.js`)
Add:
```js
role: {
  type: String,
  enum: ["user", "doctor", "admin"],
  default: "user",
},
// Optional for doctors:
specialization: { type: String, default: null },
license_number: { type: String, default: null },
assigned_governorates: [{ type: String }], // empty = all governorates
```

### 1.2 Auth middleware (`backend/middelwares/Auth.middleware.js`)
Add:
- `authorize(...roles)` — checks `req.user.role` after `protect`
- Export: `{ protect, authorize }`

### 1.3 Update Auth controller
- Include `role` in login/register/verify-email/Google responses (never expose password fields)
- On register: always assign `role: "user"` (never allow self-registration as admin/doctor)
- Admin creates doctor/admin accounts via admin API only

### 1.4 New Admin API — mount at `/api/admin` (admin role only)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/dashboard/stats` | Platform KPIs: total users, farms, animals, sick animals, active outbreaks, pending consultations |
| GET | `/users` | Paginated user list (filter by role, governorate, is_active, search by name/email) |
| GET | `/users/:id` | User detail with farms count, animals count |
| POST | `/users` | Create user (doctor/admin) with role assignment |
| PUT | `/users/:id` | Update user (name, phone, role, is_active, governorate, doctor fields) |
| DELETE | `/users/:id` | Soft-delete (set is_active=false) |
| GET | `/farms` | All farms (paginated, filter by governorate, user) |
| GET | `/farms/:id` | Farm detail + animals summary |
| DELETE | `/farms/:id` | Admin delete farm |
| GET | `/animals` | All animals (paginated, filter species/health_status/governorate via farm) |
| GET | `/health-cases` | All health cases (filter severity, status, governorate, date range) |
| PUT | `/health-cases/:id` | Admin override/update case |
| GET | `/consultations` | All general AI consultations |
| GET | `/outbreaks` | List outbreak reports |
| POST | `/outbreaks` | Create/update outbreak report |
| PUT | `/outbreaks/:id/resolve` | Resolve outbreak |
| GET | `/notifications` | All notifications (broadcast view) |
| POST | `/notifications/broadcast` | Send notification to all users or by governorate |
| GET | `/analytics/users-growth` | Users registered over time (chart data) |
| GET | `/analytics/health-trends` | Sick/critical animals by governorate |
| GET | `/analytics/vaccinations` | Overdue/upcoming vaccinations platform-wide |

### 1.5 New Doctor API — mount at `/api/doctor` (doctor + admin roles)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/dashboard/stats` | Open cases, consultations today, outbreaks in assigned governorates |
| GET | `/health-cases` | Cases filtered by doctor's assigned_governorates |
| PUT | `/health-cases/:id/review` | Doctor adds vet notes, severity, recommended treatment |
| GET | `/consultations` | Pending general consultations |
| PUT | `/consultations/:id/respond` | Doctor response to consultation |
| GET | `/outbreaks` | Outbreak alerts in assigned areas |

### 1.6 Protect existing farmer routes
- Keep `/api/farms`, `/api/animals`, etc. scoped to `req.user._id` for role `user`
- Allow `admin` to bypass ownership checks on read operations
- Allow `doctor` read-only access to animals/health data in their governorates

### 1.7 Recreate missing route files
Wire all existing controllers in `backend/routes/`:
- Auth.routes.js, User.routes.js, Farm.routes.js, Animal.routes.js
- Vaccination.routes.js, Healthcase.routes.js, onboarding.routes.js, notification.routes.js
- NEW: Admin.routes.js, Doctor.routes.js

### 1.8 Seed script (optional)
Create one default admin: `admin@livestock.ai` / secure password via env `ADMIN_SEED_PASSWORD`

---

## PHASE 2 — Frontend: Role-based routing

### 2.1 Extend Redux auth state
In `authSlice.js`, store `user.role` from login/profile responses.

### 2.2 Route guards
Create:
- `RoleRoute.jsx` — accepts `allowedRoles={["admin"]}` prop
- Update `ProtectedRoute.jsx` to redirect by role after login:
  - `admin` → `/admin/dashboard`
  - `doctor` → `/doctor/dashboard`
  - `user` → `/farms` (existing)

### 2.3 Admin layout & routes (NEW)
Create `AdminLayout.jsx` with sidebar navigation (RTL, same design system as MainLayout).

Routes under `/admin/*`:

| Route | Page | Features |
|-------|------|----------|
| `/admin/dashboard` | AdminDashboardPage | KPI cards, charts (users growth, health trends, species distribution) |
| `/admin/users` | AdminUsersPage | Table with search/filter, create/edit user modal, role badge, activate/deactivate |
| `/admin/users/:id` | AdminUserDetailPage | Profile, farms, activity |
| `/admin/farms` | AdminFarmsPage | All farms table, view/delete |
| `/admin/animals` | AdminAnimalsPage | All animals, health status badges |
| `/admin/health-cases` | AdminHealthCasesPage | All cases, severity filters, resolve action |
| `/admin/consultations` | AdminConsultationsPage | General AI consultations |
| `/admin/outbreaks` | AdminOutbreaksPage | Outbreak CRUD + map/trends (wire existing OutbreakDetectionPage UI) |
| `/admin/notifications` | AdminNotificationsPage | Broadcast + history |
| `/admin/settings` | AdminSettingsPage | System config placeholder |

### 2.4 Doctor layout & routes (NEW)
Routes under `/doctor/*`:

| Route | Page |
|-------|------|
| `/doctor/dashboard` | DoctorDashboardPage |
| `/doctor/cases` | DoctorHealthCasesPage |
| `/doctor/consultations` | DoctorConsultationsPage |
| `/doctor/outbreaks` | DoctorOutbreaksPage |

### 2.5 Services
Create:
- `src/services/adminService.js` → all `/api/admin/*` calls
- `src/services/doctorService.js` → all `/api/doctor/*` calls

### 2.6 UI components (reuse existing patterns)
- Reuse: `Button`, `Input`, `Loader`, Recharts charts from dashboard features
- New: `DataTable.jsx` (sortable, paginated), `RoleBadge.jsx`, `StatCard.jsx`, `UserFormModal.jsx`
- Admin sidebar links in Arabic

### 2.7 Login redirect logic
After successful login, redirect based on `user.role`:
```js
if (role === 'admin') navigate('/admin/dashboard');
else if (role === 'doctor') navigate('/doctor/dashboard');
else navigate('/farms');
```

---

## PHASE 3 — Design requirements

- **Language:** Arabic RTL throughout admin/doctor panels
- **Theme:** Match existing green agricultural design (Sidebar fixed right, Topbar with user avatar)
- **Responsive:** Desktop-first admin tables; mobile collapsible sidebar
- **Charts:** Recharts — line (user growth), bar (health by governorate), pie (animals by species)
- **Tables:** Pagination server-side, search debounced, export CSV optional
- **Toasts:** react-hot-toast for success/error (existing pattern)
- **Loading:** Use existing Loader component

---

## PHASE 4 — Security rules (non-negotiable)

1. Never allow role escalation via public register endpoint
2. All `/api/admin/*` routes require `authorize("admin")`
3. All `/api/doctor/*` routes require `authorize("doctor", "admin")`
4. Admin can access doctor routes; doctor cannot access admin routes
5. Return 403 with Arabic message for unauthorized role access
6. Log admin actions (user role changes, deletions) — optional audit log collection

---

## Existing files to reference (do NOT rewrite from scratch)

**Backend models:** `backend/models/*.js`  
**Backend controllers:** `backend/controllers/*.js`  
**Auth:** `backend/middelwares/Auth.middleware.js`, `backend/config/Jwt.js`  
**Frontend layout:** `frontend/src/layout/MainLayout.jsx`, `Sidebar.jsx`, `Topbar.jsx`  
**Frontend auth:** `frontend/src/redux/authSlice.js`, `frontend/src/services/api.js`  
**Charts:** `frontend/src/features/dashboard/components/*`  
**Outbreak UI:** `frontend/src/pages/OutbreakDetection/OutbreakDetectionPage.jsx` (integrate into admin)

---

## Implementation order

1. Recreate missing backend routes (server must start)
2. Add role field + migration/default for existing users
3. Add authorize middleware
4. Build Admin controller + routes
5. Build Doctor controller + routes
6. Frontend: authSlice role + RoleRoute + login redirect
7. Frontend: AdminLayout + admin pages + adminService
8. Frontend: DoctorLayout + doctor pages + doctorService
9. Wire OutbreakDetectionPage into admin/doctor routes
10. Test all 3 roles end-to-end

---

## Acceptance criteria

- [ ] Server starts without missing module errors
- [ ] Register creates users with role `user` only
- [ ] Admin can create/edit/deactivate users and assign roles
- [ ] Admin dashboard shows real platform stats from MongoDB
- [ ] Admin can view all farms, animals, health cases
- [ ] Doctor sees health cases filtered by governorate
- [ ] Farmer (`user`) cannot access `/admin/*` or `/api/admin/*` (403)
- [ ] Login redirects each role to correct dashboard
- [ ] All admin UI is Arabic RTL matching existing design
- [ ] Existing farmer features still work unchanged

Start with Phase 1 (backend routes + RBAC), confirm server runs, then proceed to admin frontend.
```
