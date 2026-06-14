# AGENT.md — AI Agent Guidelines

Instructions for Claude Code and other AI agents working on this project.

---

## 🎯 Project Overview

**Think With Aman — Portfolio & Student Learning Portal** — Full-stack website with:
- Public portfolio (home, about, services, projects, gallery, knowledge hub, contact)
- **Student portal** — courses (free/premium), my learning library, service booking, support, profile
- Admin/employee dashboard — full CMS for all content + booking management
- JWT-based auth with role routing (admin → `/dashboard`, student → `/student`)
- Navy/dark blue/black professional theme — single fixed theme, no toggle

**Stack**: React 18 (Vite) + Django (backend) + MariaDB + Tailwind CSS

---

## 📋 Before You Start

1. **Read CLAUDE.md** — project conventions, tech stack, API endpoints, key files
2. **Check branch** — work on `main` or feature branches
3. **Verify env** — backend/DB must be running if testing API calls
4. **Dev server** — `cd client && npm run dev` (port 3002)
5. **Fonts** — Google Fonts auto-loaded (Space Grotesk, Poppins, DM Sans)

---

## 🗂 Route Structure

| Path prefix | Access | Layout |
|-------------|--------|--------|
| `/` | Public | `RootLayout` + `Navbar` + `Footer` |
| `/login` | Public | Standalone page |
| `/student/*` | `role === student` | `StudentLayout` (fixed sidebar + mobile drawer) |
| `/dashboard/*` | `role === admin \| employee` | `DashboardLayout` (fixed sidebar + topbar) |

### Student portal routes
```
/student                 → StudentHomePage          (stats: courses, learning, exams, sessions, tickets)
/student/courses         → StudentCoursesPage       (free + premium, filter, "Add to Learning")
/student/learning        → StudentMyLearningPage    (claimed courses library)
/student/assessments     → StudentAssessmentsPage   (exam cards, filter by free/premium/status)
/student/assessments/:id → StudentExamPage          (intro → timed exam → results + review)
/student/services        → StudentServicesPage      (browse services + booking threads)
/student/request         → StudentRequestPage       (two tabs: New Request form | My Tickets chat thread)
/student/profile         → StudentProfilePage
```

### Admin dashboard routes
```
/dashboard                      → DashboardOverviewPage         (stats: projects, students, ebooks)
/dashboard/users                → DashboardUsersPage            (students list + delete)
/dashboard/ebooks               → DashboardEbooksPage           (courses CRUD, free/premium toggle)
/dashboard/assessments          → DashboardAssessmentsPage      (exam list + create/edit modal)
/dashboard/assessments/:id/edit → DashboardAssessmentEditorPage (3 tabs: Questions | Analytics | Students)
/dashboard/projects             → DashboardProjectsPage
/dashboard/messages             → DashboardMessagesPage         (two tabs: Contact submissions | Support Tickets with filter + thread)
/dashboard/services             → DashboardServicesPage         (services CRUD + booking threads)
/dashboard/gallery              → DashboardGalleryPage
/dashboard/knowledge-hub        → DashboardKnowledgeHubPage
/dashboard/settings             → DashboardSettingsPage         (profile update: name/email/phone + password change + social media links CRUD)
— Site Content (collapsible sidebar group) —
/dashboard/about                → DashboardAboutPage
/dashboard/skills               → DashboardSkillsPage
/dashboard/tech-stack           → DashboardTechStackPage
/dashboard/timeline             → DashboardTimelinePage
```

---

## 🔐 Auth & Roles

**JWT-based auth** (token stored in `localStorage`):

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/login/` | POST | — | Returns `{ access }` JWT with role + profile claims |
| `/api/auth/register/` | POST | — | Creates student account (role hardcoded to `student`) |
| `/api/auth/refresh/` | POST | — | Refresh access token |
| `/api/users/` | GET | admin/employee | List all users with profiles |
| `/api/users/me/` | GET/PATCH | any | Current user profile (read + update name/email/phone) |
| `/api/users/me/change-password/` | POST | any | Change password `{ current_password, new_password }` |
| `/api/users/<id>/` | GET/DELETE | admin | User detail / delete |
| `/api/public/stats/` | GET | — | Public stats `{ students, courses, projects }` — used in hero counters |
| `/api/support/` | GET/POST | any | Support tickets (admin sees all; student sees own) |
| `/api/support/<id>/` | GET | auth | Ticket detail with all replies |
| `/api/support/<id>/reply/` | POST | auth | Add reply `{ message }` — sets `is_admin` from role, updates status |
| `/api/support/<id>/read/` | POST | auth | Mark replies as read (admin marks student replies; student marks admin replies) |
| `/api/support/<id>/status/` | PATCH | admin | Set ticket status `{ status: 'open'\|'replied'\|'closed' }` |
| `/api/learning/` | GET/POST | student | List / claim a course (`ebook` id in POST body) |
| `/api/learning/<id>/` | DELETE | student | Remove course from My Learning |
| `/api/bookings/` | GET/POST | any | List / create service bookings |
| `/api/bookings/<id>/` | GET/PATCH | any | Booking detail |
| `/api/bookings/<id>/reply/` | POST | any | Add message to booking thread |
| `/api/bookings/<id>/status/` | PATCH | admin | Set booking status (pending/replied/closed) |
| `/api/bookings/<id>/read/` | POST | student | Mark admin replies as read |
| `/api/assessments/` | GET/POST | any/admin | List active exams (with `user_attempt`) / create |
| `/api/assessments/<id>/` | GET/PUT/PATCH/DELETE | any/admin | Detail (admin gets questions) / update / delete |
| `/api/assessments/<id>/questions/` | GET/POST | admin | List / add question |
| `/api/assessments/<id>/start/` | POST | student | Start or resume attempt (idempotent) |
| `/api/assessments/<id>/leaderboard/` | GET | any | Top 10 completers by score |
| `/api/questions/<id>/` | GET/PATCH/DELETE | admin | Question update / delete |
| `/api/questions/<id>/options/` | GET/POST | admin | List / add answer option |
| `/api/options/<id>/` | GET/PATCH/DELETE | admin | Option update / delete |
| `/api/attempts/<id>/submit/` | POST | student | Submit `{ answers: [{question_id, selected_option_ids}] }` → auto-grades |
| `/api/attempts/<id>/result/` | GET | student | Full result: score + per-question correct/selected/explanation |
| `/api/assessments/<id>/all-attempts/` | GET | admin | All student attempts with user info, started_at, submitted_at, score, pass/fail |
| `/api/assessments/<id>/enrollments/` | GET | admin | List enrolled students |
| `/api/assessments/<id>/enroll/` | POST | admin | Enroll student `{ user_id }` |
| `/api/assessments/<id>/enrollments/<user_pk>/` | DELETE | admin | Unenroll student |

**JWT payload** (decoded via `jwtDecode`):
```json
{ "user_id": 1, "username": "student1", "email": "...", "full_name": "...", "role": "student" }
```

**Roles** (from JWT `payload.role`):
- `admin` — full dashboard access; superusers/staff without a profile also get `admin`
- `employee` — dashboard access (same as admin for now)
- `student` — student portal only

**Redirect logic** (in `LoginPage.jsx` + `ProtectedRoute.jsx`):
- After login: decode JWT → `role === 'student'` → `/student`, else → `/dashboard`
- `ProtectedRoute` accepts `allowedRoles` prop; wrong role → redirects to their home

**Student registration** — role hardcoded to `'student'` in request payload.

**Test accounts** (created via `python manage.py create_test_users`):
| Role | Username | Password |
|------|----------|----------|
| admin | `admin` | `Admin@123` |
| student | `student1` | `Student@123` |

---

## 🎨 Theme

**Single fixed theme — Navy/Dark Blue/Black.** No light/dark toggle.

```css
--bg-base:     #060C18   /* deep navy-black */
--bg-surface:  #0C1628   /* dark navy surface */
--bg-elevated: #122040   /* medium navy */
--bg-border:   #1E3058   /* navy border */

--text-primary:   #EEF4FF   /* near-white */
--text-secondary: #8BAAC8   /* muted blue-gray */
--text-muted:     #445E7A
--text-accent:    #60A5FA   /* blue-400 */
```

**Brand colors** (Tailwind):
```
brand.primary:   #3B82F6   (blue-500 — buttons, links, active states)
brand.secondary: #0EA5E9   (sky-500 — gradients, secondary accents)
brand.dark:      #2563EB   (blue-600 — hover states)
brand.amber:     #F59E0B   (amber-400 — IMPORTANT elements, premium, CTAs that must stand out)
```

**Gradient text** (`.gradient-text`): `#3B82F6 → #0EA5E9`

**`ThemeContext`** is a stub — always returns `{ theme: 'light', isDark: false }`. No toggle exists anywhere.

---

## 🧩 Adding Pages

### Public page
```jsx
import PageLayout from '@components/layout/PageLayout'
export default function NewPage() {
  return (
    <PageLayout title="Page Title" description="SEO desc">
      <section className="section-container section-padding">
        {/* content */}
      </section>
    </PageLayout>
  )
}
```
Then add route in `client/src/App.jsx` under the `/` `RootLayout` children.

### Student portal page
- Create in `client/src/pages/student/`
- Add route in `App.jsx` under `/student` children
- Add nav link in `client/src/pages/student/StudentLayout.jsx` `NAV_LINKS` array
- No `PageLayout` needed — `StudentLayout` wraps all student pages

### Admin dashboard page
- Create in `client/src/pages/dashboard/`
- Add route in `App.jsx` under `/dashboard` children
- Add nav item in `client/src/components/dashboard/Sidebar.jsx` `NAV_ITEMS` array

---

## 🔧 Common Tasks

### API integration
```jsx
import { ebooksAPI, learningAPI } from '@services/api'

useEffect(() => {
  ebooksAPI.getAll()
    .then(({ data }) => setItems(data))
    .catch(() => {})
}, [])
```

### Claiming a free course (My Learning)
```jsx
// POST /api/learning/ with { ebook: id }
// Uses get_or_create — safe to call multiple times
await learningAPI.claim({ ebook: book.id })
```

### Service booking thread
```jsx
// Create booking
await bookingsAPI.create({ service: serviceId, message })
// Reply
await bookingsAPI.reply(bookingId, { message })
// Mark admin replies read
await bookingsAPI.markRead(bookingId)
```

### Support ticket thread
```jsx
// Student creates ticket
await supportAPI.create({ category: 'general', subject: '...', message: '...' })
// Admin or student replies
await supportAPI.reply(ticketId, { message })
// Mark replies as read (perspective-aware — each side marks the other's replies)
await supportAPI.markRead(ticketId)
// Admin closes / reopens
await supportAPI.setStatus(ticketId, { status: 'closed' })
await supportAPI.setStatus(ticketId, { status: 'open' })
// Fetch ticket detail with replies
const { data } = await supportAPI.getById(ticketId)
```

### Form validation (manual, no react-hook-form installed)
```js
const validate = (form) => {
  const errors = {}
  if (!form.field.trim()) errors.field = 'Field is required'
  return errors
}
// setErrors on submit + onBlur per field
```

### Assessment exam flow
```js
// Start attempt (idempotent — returns existing if already started)
const { data: attempt } = await assessmentsAPI.startAttempt(assessmentId)

// Submit answers
await assessmentsAPI.submitAttempt(attempt.id, {
  answers: [{ question_id: 1, selected_option_ids: [3] }]
})

// Get result with per-question review
const { data: result } = await assessmentsAPI.getResult(attempt.id)
// result.score, result.total, result.percentage, result.passed, result.questions[]
```

### Toast notifications
```jsx
import { showSuccess, showError } from '@utils/toast'
showSuccess('Saved!')
showError(err.message)
```

### Protected API calls
All API calls auto-attach `Authorization: Bearer <token>` via axios interceptor in `api.js`. No manual headers needed.

---

## 📦 Important Files

### Frontend
| File | Purpose |
|------|---------|
| `client/src/App.jsx` | All routes (public, student, admin) |
| `client/src/context/AuthContext.jsx` | JWT auth, login/logout/register, user state |
| `client/src/context/ThemeContext.jsx` | Stub — always light, no toggle |
| `client/src/components/auth/ProtectedRoute.jsx` | Role-based route guard |
| `client/src/pages/auth/LoginPage.jsx` | Login + Student registration (tabs) |
| `client/src/pages/student/StudentLayout.jsx` | Student sidebar layout (fixed desktop, drawer mobile) |
| `client/src/pages/student/StudentCoursesPage.jsx` | Courses with filter + Add to Learning + success popup |
| `client/src/pages/student/StudentMyLearningPage.jsx` | Claimed courses library |
| `client/src/pages/student/StudentAssessmentsPage.jsx` | Exam list with status badges, score bars, free/premium filter |
| `client/src/pages/student/StudentExamPage.jsx` | Exam state machine: intro → timed exam → result + review |
| `client/src/pages/dashboard/DashboardAssessmentsPage.jsx` | Admin exam list + create/edit modal |
| `client/src/pages/dashboard/DashboardAssessmentEditorPage.jsx` | 3 tabs: Questions (builder — MCQ single/multi, T/F, options, explanations), Analytics (enrolled count, pass/fail summary, per-student attempt table with start time/score), Students (enrollment management — enroll/unenroll per user) |
| `client/src/pages/student/StudentServicesPage.jsx` | Service cards + booking thread UI |
| `client/src/components/dashboard/DashboardLayout.jsx` | Admin layout with topbar (user badge + page title) |
| `client/src/components/dashboard/Sidebar.jsx` | Admin sidebar nav |
| `client/src/components/layout/Navbar.jsx` | Public navbar |
| `client/src/services/api.js` | All API clients (authAPI, usersAPI, ebooksAPI, learningAPI, bookingsAPI, assessmentsAPI, publicAPI…) |
| `client/src/pages/dashboard/DashboardSettingsPage.jsx` | Profile update (name/email/phone) + password change with show/hide toggles + social media links CRUD |
| `client/src/styles/globals.css` | CSS variables, theme tokens, component classes |
| `client/tailwind.config.js` | Design tokens, brand colors, shadows |
| `client/src/animations/variants.js` | Framer Motion animation presets |
| `client/src/utils/toast.js` | Toast notifications & SweetAlert2 |

### Backend
| File | Purpose |
|------|---------|
| `backend/portfolio/models.py` | All DB models: `UserProfile`, `StudentLearning`, `ServiceBooking`, `BookingReply`, `SupportTicket`, `SupportTicketReply`, `Assessment`, `Question`, `AnswerOption`, `StudentAttempt`, `StudentAnswer`, `AssessmentEnrollment` |
| `backend/portfolio/serializers.py` | DRF serializers + `CustomTokenObtainPairSerializer` (adds role/full_name/email) |
| `backend/portfolio/views.py` | All views: auth, users, learning, bookings, support |
| `backend/portfolio/urls.py` | All API routes |
| `backend/portfolio/management/commands/create_test_users.py` | Creates admin + student test accounts |
| `backend/portfolio/management/commands/create_test_assessment.py` | Seeds "Python Fundamentals Quiz" — 10 questions, 15 min, 60% pass, free |

---

## 🗃 Key Backend Models

### UserProfile
- OneToOne on Django `User`
- Fields: `full_name`, `phone`, `role` (admin/employee/student)
- Superusers/staff without a profile default to role `admin` in JWT

### StudentLearning
- ForeignKey User + EBook, `unique_together` — prevents duplicate claims
- `get_or_create` used on POST — idempotent claiming

### ServiceBooking
- ForeignKey User + Service
- Status: `pending` → `replied` (admin reply) → `pending` (student reply) → `closed`

### BookingReply
- ForeignKey ServiceBooking + sender User
- `is_admin`, `read_by_student` — drives unread count badge

### SupportTicket
- ForeignKey User
- Fields: `category` (slug: general/content/technical/premium/feedback/other), `subject`, `message`
- `status`: `open` (new/student replied) → `replied` (admin replied) → `closed` (admin only)
- `ordering = ['-created_at']`

### SupportTicketReply
- ForeignKey SupportTicket + sender User
- `is_admin`, `read_by_student`, `read_by_admin` — drives perspective-aware `unread_count` in serializer
- `ordering = ['created_at']` (oldest first for chat display)
- Admin closes ticket → student reply input locked

### Assessment
- Fields: `title`, `description`, `category`, `tags` (JSON), `is_free`, `time_limit` (nullable, minutes), `pass_mark` (int %, default 60), `is_active`, `order`
- `related_name='questions'` (Question FK), `related_name='attempts'` (StudentAttempt FK)

### Question
- ForeignKey Assessment (`related_name='questions'`)
- `type`: `mcq_single` | `mcq_multi` | `true_false`
- Fields: `text`, `explanation`, `order`
- `related_name='options'` (AnswerOption FK)

### AnswerOption
- ForeignKey Question (`related_name='options'`)
- Fields: `text`, `is_correct`, `order`
- Grading: `set(selected_option_ids) == set(correct_option_ids)` — works for all types

### StudentAttempt
- ForeignKey User + Assessment, `unique_together` — one attempt per student per exam
- Fields: `started_at`, `submitted_at`, `score`, `total`, `status` (in_progress/completed)
- Properties: `percentage` (0–100), `passed` (percentage >= assessment.pass_mark)

### StudentAnswer
- ForeignKey StudentAttempt + Question, `unique_together`
- `selected_options` — JSON list of AnswerOption PKs

### AssessmentEnrollment
- ForeignKey User + Assessment, `unique_together` — admin grants premium exam access per student
- `related_name='enrollments'` on Assessment
- `is_enrolled` in `AssessmentListSerializer`: returns `True` if `assessment.is_free`, else checks `AssessmentEnrollment` for current user
- `start_attempt` returns 403 `not_enrolled` for premium exams when student not enrolled and not admin/staff

---

## ⚠️ Do's and Don'ts

### ✅ DO:
- Use Tailwind utilities (not inline styles)
- Use `brand.amber` for important/premium elements that need to stand out
- Use Framer Motion for animations and page transitions
- Show toast notifications on success/error
- Keep components under 300 lines
- Use font classes for typography (not raw `fontSize`)
- Validate forms on both `onBlur` and `onSubmit`
- Hardcode `role: 'student'` when registering from the public sign-up form
- Handle superuser/staff fallback in any backend view that checks `profile.role`

### ❌ DON'T:
- Don't add a light/dark theme toggle — theme is fixed
- Don't use `alert()` — use toast utilities
- Don't create styled-components or CSS-in-JS
- Don't use inline `style={{}}` for colors/layout
- Don't add Ebook link to the public navbar — `/ebooks` redirects to `/login` by design
- Don't redirect students to `/dashboard` — they go to `/student`
- Don't hardcode indigo `#6366F1` — that's the old brand color; use `#3B82F6`
- Don't assume a User has a `UserProfile` — always use `getattr(user, 'profile', None)`

---

## 📝 Commit Guidelines

Use **Conventional Commits**:
```
feat: add X
fix: bug in X
refactor: improve X
style: format X
docs: update X
chore: update deps
```

---

## 🚀 Deployment

```bash
cd client && npm run build   # → dist/
```
Deploy `dist/` to GitHub Pages. CI/CD runs on push to `main`.

---

## 👤 Project Owner

**Aman Raj** — think.like.ai.aman@gmail.com

**Last Updated**: June 2026
**Status**: Active development
