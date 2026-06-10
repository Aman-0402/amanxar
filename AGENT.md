# AGENT.md — AI Agent Guidelines

Instructions for Claude Code and other AI agents working on this portfolio project.

---

## 🎯 Project Overview

**Aman Raj Portfolio & Knowledge Hub** — Full-stack portfolio + admin CMS with:
- Interactive landing pages (home, about, services, projects, gallery, etc.)
- Knowledge Hub (26+ curated tools directory)
- Blog & eBooks library
- Admin dashboard (CRUD for content)
- Modern UI with Framer Motion animations + Neo-brutalism design

**Stack**: React 18 (Vite) + Express.js/Django (backend) + PostgreSQL + Tailwind CSS

---

## 📋 Before You Start

1. **Read CLAUDE.md** — Contains project conventions, tech stack, API endpoints, key files
2. **Check branch** — Always work on `main` or feature branches
3. **Verify env** — Backend/DB must be running if testing API calls
4. **Dev server** — Start with `cd client && npm run dev`
5. **Install fonts** — Google Fonts auto-loaded (Space Grotesk, Poppins, DM Sans)

---

## 🔧 Common Tasks

### Adding a Page
1. Create component in `client/src/pages/PageName.jsx`
2. Add route in main router
3. Import animations from `@animations/variants`
4. Use `PageLayout` wrapper for consistent styling

**Example**:
```jsx
import PageLayout from '@components/layout/PageLayout'
import { fadeUp, staggerContainer } from '@animations/variants'

export default function NewPage() {
  return (
    <PageLayout>
      <section className="section-container section-padding">
        {/* Content */}
      </section>
    </PageLayout>
  )
}
```

### Adding a Component
1. Create in `client/src/components/category/ComponentName.jsx`
2. Use Framer Motion for animations (`motion.div`, `variants`)
3. Prefer Tailwind utilities over inline CSS
4. Export as default

### API Integration
1. Add hook in `client/src/hooks/use-feature.ts`
2. Use `TanStack Query` (useQuery, useMutation)
3. Include `credentials: 'include'` for auth
4. Handle errors with `showError()` from `@utils/toast`

**Example**:
```jsx
import { useMutation } from '@tanstack/react-query'
import { showSuccess, showError } from '@utils/toast'

const { mutate } = useMutation({
  mutationFn: (data) => projectsAPI.create(data),
  onSuccess: () => showSuccess('Created!'),
  onError: (err) => showError(err.message),
})
```

### Updating Styles
- Modify `client/tailwind.config.js` for design tokens
- Add utilities to `client/src/styles/globals.css`
- Use `.section-container` and `.section-padding` for layout
- Neo-brutalism: `.border-3`, `.offset-shadow`, `.text-brutalism`

### Creating Forms
1. Use `react-hook-form` + Zod validators
2. Import toast utilities for feedback
3. Include file upload support if needed
4. Use `.text-label` for form labels

---

## 🎨 Design Guidelines

### Neo-Brutalism
- **Borders**: Hard edges (3-4px), no curves
- **Shadows**: Offset (3px 3px), no blur
- **Text**: Bold, tight letter-spacing
- **Colors**: High contrast, no opacity blending

**Utilities**:
```css
.border-3 .border-4        /* Hard borders */
.offset-shadow             /* 3px offset, no blur */
.text-brutalism            /* Bold + tight spacing */
.border-top-bottom         /* Horizontal emphasis */
.text-display-hero         /* Giant hero heading */
```

### Typography
- **Headers (h1-h3)**: Space Grotesk, bold
- **Body text**: Poppins, 1rem
- **Labels**: DM Sans, small caps
- **Code**: JetBrains Mono

**Font Classes**:
```
.text-display-4xl    /* 5.5rem, hero headings */
.text-display-lg     /* 3rem, section headings */
.text-heading-lg     /* 1.75rem, subsections */
.text-body-lg        /* 1.125rem, lead paragraphs */
.text-body-md        /* 1rem, normal body */
.text-label          /* small caps, uppercase */
```

### Colors
- **Primary**: `#6366F1` (Indigo)
- **Secondary**: `#22D3EE` (Cyan)
- **Text Primary**: `var(--text-primary)` (CSS var)
- **Text Secondary**: `var(--text-secondary)`
- Use Tailwind color tokens: `text-brand-primary`, `bg-bg-surface`

---

## 📦 Important Files

| File | Purpose |
|------|---------|
| `client/src/App.jsx` | Router setup, ToastContainer |
| `client/src/pages/HomePage.jsx` | Landing page (hero, featured work, CTA) |
| `client/tailwind.config.js` | Design tokens, font families, sizes |
| `client/src/styles/globals.css` | Global CSS, utilities, typography |
| `client/src/animations/variants.js` | Framer Motion animation presets |
| `client/src/hooks/use-*.ts` | API + state management hooks |
| `client/src/utils/toast.js` | Toast notifications & SweetAlert2 |
| `client/src/services/api.ts` | API client setup + endpoints |
| `.env` | Environment variables (DATABASE_URL, etc.) |

---

## 🔐 Auth & API

**Session-based auth** via Passport.js:
- Login endpoint: `POST /api/auth/login`
- Logout endpoint: `POST /api/auth/logout`
- Current user: `GET /api/user`
- All requests: include `credentials: 'include'`

**Roles**: `admin`, `employee` (trainer), `student`

**Protected routes**: Use `<ProtectedRoute>` wrapper (checks `req.user?.role`)

---

## 🧪 Testing & Validation

### Type Checking
```bash
npm run check  # Runs tsc --noEmit
```

### Dev Server
```bash
npm run dev    # Vite + hot reload (port 3002)
```

### Building
```bash
npm run build  # Production build → dist/
```

### Testing Pages
- Visually inspect in browser
- Check Neo-brutalism styling (borders, shadows visible)
- Test animations (smooth, no jank)
- Verify responsive (mobile, tablet, desktop)
- Check console for errors

---

## 📝 Commit Guidelines

Use **Conventional Commits**:
```
feat: add X               # New feature
fix: bug in X             # Bug fix
refactor: improve X       # Code cleanup
style: format X           # Styling only
docs: update X            # Documentation
chore: update deps        # Dependencies, config
```

**Example**:
```
feat: add sweetalert2 and toast notifications

Replace all alert() calls with toast.showSuccess() and 
showError() for better UX. Added ToastContainer to App.jsx.
```

---

## ⚠️ Do's and Don'ts

### ✅ DO:
- Use Tailwind utilities (not inline styles)
- Include `credentials: 'include'` on all API calls
- Use Framer Motion for animations
- Show toast notifications on success/error
- Keep components under 300 lines (split if larger)
- Use font classes for typography (not raw `fontSize`)

### ❌ DON'T:
- Don't create styled-components or CSS-in-JS
- Don't use inline `style={{}}` for colors/layout
- Don't forget error handling in forms
- Don't hardcode colors (use CSS variables)
- Don't create multi-level nested folders
- Don't use `alert()` (use toast utilities instead)

---

## 🚀 Deployment

### Frontend
```bash
cd client && npm run build  # Creates dist/
# Deploy dist/ to GitHub Pages or hosting
```

### Backend
- Django migrations: `python manage.py migrate`
- Drizzle schema: `npm run db:push`
- Server: `npm run dev` (tsx watch)

### CI/CD
- Runs on push to main
- Validates TypeScript
- Builds frontend
- Deploys to GitHub Pages

---

## 🤔 Questions & Debugging

### "How do I add a new API endpoint?"
1. Define route in `server/routes.ts`
2. Add handler in `server/storage.ts` (DB layer)
3. Create hook in `client/src/hooks/use-feature.ts`
4. Call from component with error handling

### "Where should I put this component?"
- **Page wrapper**: `client/src/pages/`
- **Reusable UI**: `client/src/components/`
- **Feature-specific**: `client/src/components/feature-name/`
- **Layout**: `client/src/components/layout/`

### "How do I style this?"
1. Tailwind utilities (preferred)
2. CSS custom properties (colors, fonts)
3. Component CSS in `globals.css` if reusable
4. Never inline `style={{}}` for layout

### "Why is my animation jank?"
- Reduce motion on older devices
- Use `will-change: transform` sparingly
- Prefer `transform` over `top/left`
- Profile with DevTools Performance tab

---

## 📚 Resources

- **Tailwind**: https://tailwindcss.com/docs
- **Framer Motion**: https://www.framer.com/motion/
- **React Query**: https://tanstack.com/query/latest
- **Zod**: https://zod.dev
- **Wouter**: https://github.com/molefrog/wouter
- **SweetAlert2**: https://sweetalert2.github.io/

---

## 👤 Project Owner

**Aman Raj** — think.like.ai.aman@gmail.com

---

**Last Updated**: June 2026  
**Status**: Active development
