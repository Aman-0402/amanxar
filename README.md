# Think With Aman — Portfolio & Student Learning Portal

A full-stack website combining a personal portfolio with a student learning portal. Built with **React** (client) and **Django/Express** (backend).

**Live Site:** [https://aman-0402.github.io/aman.ai](https://aman-0402.github.io/aman.ai)

---

## 📁 Project Structure

```
amanxar/
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── auth/LoginPage.jsx      # Login + Student registration
│   │   │   ├── student/               # Student portal pages
│   │   │   └── dashboard/             # Admin CMS pages
│   │   ├── components/
│   │   │   ├── layout/               # Public Navbar, Footer, RootLayout
│   │   │   ├── dashboard/            # Admin Sidebar, DashboardLayout
│   │   │   └── auth/ProtectedRoute.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx        # JWT auth, login/register/logout
│   │   │   └── ThemeContext.jsx       # Stub (fixed dark theme)
│   │   ├── services/api.js            # All axios API clients
│   │   ├── styles/globals.css         # CSS variables, theme tokens
│   │   └── animations/variants.js    # Framer Motion presets
│   ├── tailwind.config.js             # Design tokens, brand colors
│   └── package.json
│
├── backend/                   # Django/Express API
└── CLAUDE.md                  # Dev instructions for Claude Code
```

---

## 🛠 Tech Stack

### Frontend
- **React 18** + Vite
- **Framer Motion** — animations
- **Tailwind CSS v3** — utility-first styling, custom design tokens
- **TanStack Query v5** — server state (where used)
- **React Router v6** — routing
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
/knowledge-hub → KnowledgeHubPage
/services      → ServicesPage
/resources     → ResourcesPage
/contact       → ContactPage
/login         → LoginPage (Sign In + Register tabs)
```

### Student Portal (role: student)
```
/student           → Dashboard home
/student/ebooks    → Free + premium ebook browser
/student/premium   → Premium content page
/student/services  → Book a service/session
/student/request   → Support & content request form
/student/profile   → Edit personal info
```

### Admin Dashboard (role: admin | employee)
```
/dashboard              → Overview (project + student + ebook stats)
/dashboard/users        → All registered users (students)
/dashboard/ebooks       → Ebooks CRUD
/dashboard/projects     → Projects CRUD
/dashboard/about        → About content management
/dashboard/skills       → Skills management
/dashboard/tech-stack   → Tech stack management
/dashboard/timeline     → Timeline events
/dashboard/messages     → Contact messages
/dashboard/knowledge-hub → Knowledge Hub CMS
/dashboard/gallery      → Gallery management
/dashboard/services     → Services management
/dashboard/navbar-footer → Navbar + footer link management
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
| `/api/users/me/` | GET/PATCH | any | View/update own profile |
| `/api/users/<id>/` | GET/DELETE | admin | User detail / delete |
| `/api/support/` | GET/POST | any | Support tickets |

**Test accounts:**
| Role | Username | Password |
|------|----------|----------|
| admin | `admin` | `Admin@123` |
| student | `student1` | `Student@123` |

**Role routing:**
- `admin` / `employee` → `/dashboard`
- `student` → `/student`

`ProtectedRoute` accepts `allowedRoles` prop. Wrong role redirects to correct home.

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
```

### Environment Variables
```env
DATABASE_URL=postgresql://user:password@localhost:5432/db
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
