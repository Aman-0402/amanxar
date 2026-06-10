# Aman Raj - Portfolio & Knowledge Hub

A full-stack portfolio website featuring an interactive Knowledge Hub, project showcase, blog, resources, and services. Built with **React** (client) and **Express** (backend).

**Live Site:** [https://aman-0402.github.io/aman.ai](https://aman-0402.github.io/aman.ai)

---

## 📁 Project Structure

```
aman.ai/
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable UI components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API client layer
│   │   ├── styles/           # Global CSS + Tailwind config
│   │   └── assets/           # Images, icons, fonts
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                   # Express.js server (Django in progress)
│   ├── routes/               # API endpoints
│   ├── models/               # Database schemas
│   ├── middleware/           # Auth, error handling
│   └── package.json
│
└── CLAUDE.md                  # Dev instructions for Claude Code
```

---

## 🛠 Tech Stack

### Frontend
- **React 18** + TypeScript
- **Vite** (build tool)
- **Framer Motion** (animations)
- **Tailwind CSS v3** (styling)
- **TanStack Query v5** (server state)
- **Wouter** (routing)
- **react-hook-form** + **Zod** (forms)

### Backend
- **Express.js** (Node.js runtime)
- **Passport.js** (auth)
- **PostgreSQL** (database)
- **Drizzle ORM** (database layer)

### Libraries
- **Lucide React** (icons)
- **SweetAlert2** (modal confirmations)
- **React Toastify** (toast notifications)
- **Nodemailer** (email)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 22+
- PostgreSQL (for backend)
- npm or yarn

### Setup

```bash
# Install client dependencies
cd client
npm install

# Start dev server
npm run dev
```

Dev server runs on `http://localhost:3002`

### Environment Variables

Create `.env` in root (if using backend):
```
DATABASE_URL=postgresql://user:password@localhost:5432/aman_ai
VITE_API_URL=http://localhost:5000
```

---

## 📋 Development

### Running the App

```bash
# Frontend dev server (hot reload)
cd client && npm run dev

# Build for production
npm run build

# Type checking
npm run check

# Backend (if Django/Express running)
cd backend && npm run dev
```

### Adding Features

1. **Pages**: Create component in `client/src/pages/`
2. **Components**: Create reusable UI in `client/src/components/`
3. **API Calls**: Use hooks in `client/src/hooks/` (wraps `@services/api`)
4. **Styles**: Tailwind utilities preferred; custom CSS in `client/src/styles/`
5. **Forms**: Use `react-hook-form` + `Zod` validators

### Key Conventions

- **Imports**: Use `@/` alias for `client/src/`
- **Routing**: Wouter `<Link href="/path">`
- **State**: TanStack Query for server state; React hooks for local
- **CSS**: Tailwind utilities + Neo-brutalism design system
- **Commits**: Conventional Commits format

---

## 🎨 Design System

### Colors
- **Primary**: `#6366F1` (Indigo)
- **Secondary**: `#22D3EE` (Cyan)
- **Dark mode** + **Light mode** with CSS variables

### Typography
- **Display**: Space Grotesk (bold, modern headers)
- **Body**: Poppins (friendly, readable text)
- **Accent**: DM Sans (technical, emphasis)
- **Mono**: JetBrains Mono (code)

### Neo-Brutalism
Hard edges, offset shadows, high contrast. Utilities:
- `.border-3`, `.border-4` (hard borders)
- `.offset-shadow` (3px offset, no blur)
- `.text-brutalism` (bold, tight spacing)

---

## 📦 Deployment

### Client (GitHub Pages)
```bash
cd client
npm run build
# Outputs to dist/
```

### Environment
- **Dev**: `npm run dev`
- **Staging**: Manual build + test
- **Production**: Deploy from `main` branch

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes following conventions above
3. Commit with Conventional Commits: `git commit -m "feat: add X"`
4. Push and create PR

---

## 📖 Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Dev instructions for Claude Code
- **[AGENT.md](./AGENT.md)** - Guidelines for AI agents
- **[client/README.md](./client/README.md)** - Frontend details
- **[Modules & Features](./docs/modules.md)** (if exists)

---

## 📞 Contact

- **Email**: think.like.ai.aman@gmail.com
- **WhatsApp**: +91 98521 04967
- **Portfolio**: https://aman-0402.github.io/aman.ai

---

**Made with ❤️ by Aman Raj**
