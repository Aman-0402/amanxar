import { useState } from 'react'
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Crown, Briefcase, MessageSquare,
  User, LogOut, Menu, X, Home, ChevronRight, GraduationCap, Library, ClipboardList,
} from 'lucide-react'
import { useAuth } from '@context/AuthContext'
import { assetUrl } from '@utils/assetUrl'

const NAV_LINKS = [
  { href: '/student',           label: 'Dashboard',    icon: Home,          end: true },
  { href: '/student/courses',   label: 'Courses',      icon: GraduationCap           },
  { href: '/student/learning',     label: 'My Learning',  icon: Library                 },
  { href: '/student/assessments',  label: 'Assessments',  icon: ClipboardList           },
  { href: '/student/services',     label: 'Services',     icon: Briefcase               },
  { href: '/student/request',   label: 'Request',      icon: MessageSquare           },
  { href: '/student/profile',   label: 'My Profile',   icon: User                   },
]

const SIDEBAR_W = 'w-64'

function Sidebar({ onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : (user?.username?.[0] || 'S').toUpperCase()

  const handleNavClick = () => {
    if (window.innerWidth < 768) onClose?.()
  }

  return (
    <aside className={`flex flex-col h-full ${SIDEBAR_W} bg-bg-surface border-r border-bg-border`}>

      {/* Logo */}
      <div className="p-5 border-b border-bg-border flex items-center justify-between shrink-0">
        <Link to="/student" onClick={handleNavClick} className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl overflow-hidden shadow-glow-primary shrink-0">
            <img src={assetUrl('/assets/images/Extra/logo.png')} alt="Logo" className="h-full w-full object-cover" />
          </div>
          <span className="font-display font-bold text-sm text-text-primary leading-tight">
            Think With<span className="gradient-text"> Aman</span>
          </span>
        </Link>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="md:hidden h-7 w-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
          aria-label="Close menu"
        >
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {NAV_LINKS.map(({ href, label, icon: Icon, end }) => {
          const isActive = end
            ? location.pathname === href
            : location.pathname.startsWith(href)
          return (
            <Link
              key={href}
              to={href}
              onClick={handleNavClick}
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                isActive
                  ? 'bg-brand-primary/15 text-brand-primary'
                  : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary',
              ].join(' ')}
            >
              <Icon size={17} className="shrink-0" />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight size={14} className="opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* Profile footer */}
      <div className="border-t border-bg-border p-3 shrink-0 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-bg-elevated">
          <div className="h-8 w-8 rounded-full bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center text-xs font-bold text-brand-primary shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-text-primary truncate">{user?.full_name || user?.username || 'Student'}</p>
            <p className="text-[11px] text-text-muted truncate">{user?.email || 'student'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
        >
          <LogOut size={16} className="shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex">

      {/* ── Desktop sidebar (fixed) ──────────────────────────────────────────── */}
      <div className={`hidden md:flex flex-col fixed left-0 top-0 h-screen ${SIDEBAR_W} z-40`}>
        <Sidebar />
      </div>

      {/* ── Mobile overlay + drawer ──────────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="fixed left-0 top-0 h-screen z-50 md:hidden flex flex-col"
            >
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content area ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col md:ml-64 min-w-0">

        {/* Mobile topbar */}
        <header className="md:hidden sticky top-0 z-30 h-14 flex items-center gap-3 px-4 bg-bg-surface/90 backdrop-blur-md border-b border-bg-border">
          <button
            onClick={() => setSidebarOpen(true)}
            className="h-9 w-9 flex items-center justify-center rounded-lg border border-bg-border text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <Link to="/student" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg overflow-hidden">
              <img src={assetUrl('/assets/images/Extra/logo.png')} alt="Logo" className="h-full w-full object-cover" />
            </div>
            <span className="font-display font-bold text-sm text-text-primary">
              Think With<span className="gradient-text"> Aman</span>
            </span>
          </Link>
        </header>

        {/* Page */}
        <main className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full px-4 sm:px-6 lg:px-8 py-8"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
