import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import DashboardSidebar from './Sidebar'
import { useAuth } from '@context/AuthContext'

const PATH_LABELS = {
  '/dashboard':              'Overview',
  '/dashboard/users':        'Users',
  '/dashboard/projects':     'Projects',
  '/dashboard/ebooks':       'Courses',
  '/dashboard/about':        'About',
  '/dashboard/skills':       'Skills',
  '/dashboard/tech-stack':   'Tech Stack',
  '/dashboard/timeline':     'Timeline',
  '/dashboard/messages':     'Messages',
  '/dashboard/knowledge-hub':'Knowledge Hub',
  '/dashboard/gallery':      'Gallery',
  '/dashboard/services':     'Services',
  '/dashboard/navbar-footer':'Navbar & Footer',
  '/dashboard/settings':     'Settings',
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()
  const location = useLocation()

  const pageTitle = PATH_LABELS[location.pathname] || 'Admin'

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : (user?.username?.[0] || 'A').toUpperCase()

  return (
    <div className="flex min-h-screen bg-bg-base text-text-primary">

      {/* ── Desktop sidebar (always visible) ─────────────────────────────── */}
      <div className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 z-40">
        <DashboardSidebar />
      </div>

      {/* ── Mobile drawer + backdrop ──────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              key="drawer"
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="fixed left-0 top-0 h-screen z-50 md:hidden"
            >
              <DashboardSidebar onClose={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main area ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col md:ml-64 min-w-0">

        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 sm:px-6 bg-bg-surface/90 backdrop-blur-md border-b border-bg-border">
          {/* Left: mobile hamburger + breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-lg border border-bg-border text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-widest font-medium hidden sm:block">Admin Dashboard</p>
              <h2 className="font-display font-bold text-text-primary text-base leading-tight">{pageTitle}</h2>
            </div>
          </div>

          {/* Right: user badge */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold text-text-primary leading-tight">{user?.full_name || user?.username || 'Admin'}</p>
              <p className="text-[11px] text-text-muted capitalize">{user?.role || 'admin'}</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-brand-primary/20 border border-brand-primary/40 flex items-center justify-center text-xs font-bold text-brand-primary shrink-0">
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 overflow-auto"
        >
          <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </motion.main>
      </div>
    </div>
  )
}
