# Think With Aman — Portfolio & Student Learning Portal

A full-stack website combining a personal portfolio with a student learning portal. Built with **React** (client) and **Django** (backend).

**Live Site:** [https://aman-0402.github.io/aman.ai](https://aman-0402.github.io/aman.ai)

---

## 📁 Project Structure

```
amanxar/
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── auth/LoginPage.jsx           # Login + Student registration
│   │   │   ├── student/                     # Student portal pages
│   │   │   │   ├── StudentLayout.jsx        # Sidebar layout (fixed desktop, drawer mobile)
│   │   │   │   ├── StudentHomePage.jsx
│   │   │   │   ├── StudentCoursesPage.jsx   # Free/premium courses + Add to Learning
│   │   │   │   ├── StudentMyLearningPage.jsx # Claimed courses library
│   │   │   │   ├── StudentAssessmentsPage.jsx # Exam list (status badges, score bars, filters)
│   │   │   │   ├── StudentExamPage.jsx      # Exam flow: intro → exam (timer) → results + review
│   │   │   │   ├── StudentServicesPage.jsx  # Service booking + thread UI
│   │   │   │   ├── StudentRequestPage.jsx
│   │   │   │   └── StudentProfilePage.jsx
│   │   │   └── dashboard/                   # Admin CMS pages
│   │   ├── components/
│   │   │   ├── layout/                      # Public Navbar, Footer, RootLayout
│   │   │   ├── dashboard/                   # Admin Sidebar, DashboardLayout
│   │   │   └── auth/ProtectedRoute.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx              # JWT auth, login/register/logout
│   │   │   └── ThemeContext.jsx             # Stub (fixed dark theme)
│   │   ├── services/api.js                  # All axios API clients
│   │   ├── styles/globals.css               # CSS variables, theme tokens
│   │   └── animations/variants.js           # Framer Motion presets
│   ├── tailwind.config.js                   # Design tokens, brand colors
│   └── package.json
│
├── backend/                   # Django REST API
│   └── portfolio/
│       ├── models.py          # UserProfile, StudentLearning, ServiceBooking, BookingReply, SupportTicket, SupportTicketReply, Assessment, Question, AnswerOption, StudentAttempt, StudentAnswer, AssessmentEnrollment
│       ├── serializers.py     # DRF serializers + custom JWT serializer
│       ├── views.py           # All API views
│       └── urls.py            # API routes
│
├── AGENT.md                   # AI agent guidelines
└── CLAUDE.md                  # Dev instructions for Claude Code
```

---

## 🛠 Tech Stack

### Frontend
- **React 18** + Vite
- **Framer Motion** — animations + page transitions
- **Tailwind CSS v3** — utility-first styling, custom design tokens
- **React Router v6** — routing with role-based `ProtectedRoute`
- **Axios** — HTTP client with JWT interceptor

### Backend
- **Django** + Django REST Framework
- **JWT auth** via `rest_framework_simplejwt` — custom serializer adds `role`, `full_name`, `email` to token
- **MariaDB** (via Django ORM)

### Libraries
- **Lucide React** — icons
- **SweetAlert2** — modal confirmations
- **React Toastify** — toast notifications
- **jwtDecode** — JWT decoding on client

---

## 🗂 Route Map

### Public
```
/              → HomePage
/about         → AboutPage
/projects      → ProjectsPage
/projects/:slug → ProjectDetailPage
/gallery       → GalleryPage
/ebooks        → Redirects to /login (auth required to browse courses)
/knowledge-hub → KnowledgeHubPage
/services      → ServicesPage
/resources     → ResourcesPage
/contact       → ContactPage
/login         → LoginPage (Sign In + Register tabs)
```

### Student Portal (role: student)
```
/student                    → Dashboard home (stats: courses, learning, exams done, sessions, tickets)
/student/courses            → Courses (free/premium filter, Add to Learning)
/student/learning           → My Learning (claimed courses library)
/student/assessments        → Exam list (filter by free/premium/status, score bars)
/student/assessments/:id    → Exam flow: intro → timed exam → results + per-question review
/student/services           → Services (browse + booking request + thread)
/student/request            → Support & Requests (New Request form + My Tickets chat thread)
/student/profile            → Edit personal info
```

### Admin Dashboard (role: admin | employee → displayed as "Moderator")
```
/dashboard                       → Overview (6 stat cards: students/courses/assessments/projects/open-tickets/unread-messages; recent tickets, messages, bookings; quick-action shortcuts)
/dashboard/users                 → All users (admins pinned top, search + date-range filter + sort, self-delete blocked; employee role shown as "Moderator")
/dashboard/ebooks                → Courses CRUD (free/premium toggle)
/dashboard/assessments           → Assessments list + create/edit modal
/dashboard/assessments/:id/edit  → Question builder (3 tabs: Questions | Analytics | Students enrollment)
/dashboard/projects              → Projects CRUD
/dashboard/messages              → Messages (split-pane; Contact: search + mark-all-read + mailto reply + relative timestamps; Support: ticket thread + search + filter pills + close/reopen; unread badges)
/dashboard/services              → Services (card grid CRUD + Lucide icon picker) + Bookings (split-pane: list with search/filter/stats, BookingThread with chat + close/reopen + relative timestamps)
/dashboard/gallery               → Gallery management
/dashboard/knowledge-hub         → Knowledge Hub CMS
/dashboard/settings              → Profile update (name/email/phone) + password change + social media links CRUD (replaces old Navbar & Footer admin page)
— Site Content (collapsible sidebar group) —
/dashboard/about                 → About content management
/dashboard/skills                → Skills management
/dashboard/tech-stack            → Tech stack management
/dashboard/timeline              → Timeline events
```

---

## 🎨 Design System

### Theme
**Single fixed theme — Navy / Dark Blue / Black.** No light/dark toggle.

```
--bg-base:      #060C18   deep navy-black
--bg-surface:   #0C1628   dark navy
--bg-elevated:  #122040   medium navy
--bg-border:    #1E3058   border
--text-primary: #EEF4FF   near-white
```

### Brand Colors
```
brand.primary:   #3B82F6   blue-500    buttons, links, active states
brand.secondary: #0EA5E9   sky-500     gradients, secondary accents
brand.dark:      #2563EB   blue-600    hover states
brand.amber:     #F59E0B   amber-400   premium / important CTAs
```

### Typography
- **Display/Headers**: Space Grotesk (bold)
- **Body**: Poppins
- **Accent labels**: DM Sans
- **Code**: JetBrains Mono

### Gradient Text
`.gradient-text` — `#3B82F6 → #0EA5E9` (blue to sky)

---

## 🔐 Authentication

**JWT-based** (token in `localStorage`):

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/login/` | POST | — | Login — returns JWT with `role`, `full_name`, `email` |
| `/api/auth/register/` | POST | — | Student self-registration (role forced to `student`) |
| `/api/auth/refresh/` | POST | — | Refresh access token |
| `/api/users/` | GET | admin | List all registered users |
| `/api/users/me/` | GET/PATCH | any | View/update own profile (name/email/phone) |
| `/api/users/me/change-password/` | POST | any | Change password `{ current_password, new_password }` |
| `/api/users/<id>/` | GET/DELETE | admin | User detail / delete |
| `/api/public/stats/` | GET | — | Public stats `{ students, courses, projects }` for hero counters |
| `/api/support/` | GET/POST | any | Support tickets (admin: all; student: own) |
| `/api/support/<id>/` | GET | auth | Ticket detail with replies |
| `/api/support/<id>/reply/` | POST | auth | Add reply — `is_admin` set from role |
| `/api/support/<id>/read/` | POST | auth | Mark replies read (perspective-aware) |
| `/api/support/<id>/status/` | PATCH | admin | Set status `open\|replied\|closed` |
| `/api/learning/` | GET/POST | student | List / claim a free course |
| `/api/learning/<id>/` | DELETE | student | Remove from My Learning |
| `/api/bookings/` | GET/POST | any | List / create service bookings |
| `/api/bookings/<id>/reply/` | POST | any | Add message to booking thread |
| `/api/bookings/<id>/status/` | PATCH | admin | Update booking status |
| `/api/bookings/<id>/read/` | POST | student | Mark thread replies as read |
| `/api/assessments/` | GET/POST | any/admin | List active exams (+ `user_attempt`) / create |
| `/api/assessments/<id>/` | GET/PUT/PATCH/DELETE | any/admin | Detail / update / delete |
| `/api/assessments/<id>/questions/` | GET/POST | admin | List / add question |
| `/api/assessments/<id>/start/` | POST | student | Start (or resume) an attempt |
| `/api/assessments/<id>/leaderboard/` | GET | any | Top 10 completers by score |
| `/api/questions/<id>/` | GET/PUT/PATCH/DELETE | admin | Question detail / update / delete |
| `/api/questions/<id>/options/` | GET/POST | admin | List / add answer option |
| `/api/options/<id>/` | GET/PUT/PATCH/DELETE | admin | Option detail / update / delete |
| `/api/attempts/<id>/submit/` | POST | student | Submit answers + auto-grade |
| `/api/attempts/<id>/result/` | GET | student | Full result with per-question review |
| `/api/assessments/<id>/all-attempts/` | GET | admin | All student attempts — started_at, submitted_at, score, pass/fail |
| `/api/assessments/<id>/enrollments/` | GET | admin | List enrolled students |
| `/api/assessments/<id>/enroll/` | POST | admin | Enroll student `{ user_id }` |
| `/api/assessments/<id>/enrollments/<user_pk>/` | DELETE | admin | Unenroll student |

**Test accounts:**
| Role | Username | Password |
|------|----------|----------|
| admin | `admin` | `Admin@123` |
| student | `student1` | `Student@123` |

Run `python manage.py create_test_users` to create them.

**Role routing:**
- `admin` / `employee` → `/dashboard`
- `student` → `/student`

`ProtectedRoute` accepts `allowedRoles` prop. Wrong role redirects to correct home. Superusers/staff without a `UserProfile` are treated as `admin`.

> **UI label:** `employee` role is always displayed as **"Moderator"** — backend value is never changed. Public navbar links are hardcoded (no DB); social links managed in `/dashboard/settings`.

---

## 🚀 Quick Start

```bash
# Install and run frontend
cd client
npm install
npm run dev          # → http://localhost:3002

# Type check
npm run check

# Build for production
npm run build        # → dist/

# Backend (Django)
cd backend
python manage.py migrate
python manage.py create_test_users
python manage.py create_test_assessment   # seeds Python Fundamentals Quiz (10 questions)
python manage.py runserver   # → http://localhost:8000
```

### Environment Variables
```env
# backend/.env
DATABASE_URL=mysql://user:password@localhost:3306/db

# client/.env
VITE_API_URL=http://localhost:8000
```

---

## 📖 Documentation

- **[CLAUDE.md](./CLAUDE.md)** — dev instructions for Claude Code
- **[AGENT.md](./AGENT.md)** — guidelines for AI agents

---

## 📞 Contact

- **Email**: think.like.ai.aman@gmail.com
- **WhatsApp**: +91 98521 04967

---

**Made by Aman Raj** | **Think With Aman**
