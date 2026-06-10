import { useState } from 'react'
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Crown, Briefcase, MessageSquare,
  User, LogOut, Menu, X, ChevronDown,
} from 'lucide-react'
import { useAuth } from '@context/AuthContext'
import { assetUrl } from '@utils/assetUrl'

const NAV_LINKS = [
  { href: '/student/ebooks',   label: 'Ebooks',        icon: BookOpen },
  { href: '/student/premium',  label: 'Premium',        icon: Crown },
  { href: '/student/services', label: 'Book Services',  icon: Briefcase },
  { href: '/student/request',  label: 'Request',        icon: MessageSquare },
]

const linkBase    = 'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200'
const linkDefault = 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
const linkActive  = 'text-brand-primary bg-brand-primary/10'

export default function StudentLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : (user?.username?.[0] || 'S').toUpperCase()

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col">

      {/* ── Top Navbar ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-bg-border bg-bg-surface/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/student" className="flex items-center gap-2 shrink-0">
            <div className="h-8 w-8 rounded-lg overflow-hidden shadow-glow-primary">
              <img src={assetUrl('/assets/images/Extra/logo.jpg')} alt="Logo" className="h-full w-full object-cover" />
            </div>
            <span className="font-display font-bold text-base text-text-primary hidden sm:block">
              Think With<span className="gradient-text"> Aman</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <NavLink
                key={href}
                to={href}
                className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkDefault}`}
              >
                <Icon size={15} />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right — profile + logout */}
          <div className="flex items-center gap-2">

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(v => !v)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-bg-elevated transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center text-xs font-bold text-brand-primary">
                  {initials}
                </div>
                <span className="hidden sm:block text-sm font-medium text-text-primary max-w-[100px] truncate">
                  {user?.full_name || user?.username || 'Student'}
                </span>
                <ChevronDown size={14} className={`text-text-muted transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-bg-border bg-bg-surface shadow-card-hover z-20 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-bg-border">
                        <p className="text-sm font-semibold text-text-primary truncate">{user?.full_name || user?.username}</p>
                        <p className="text-xs text-text-muted truncate">{user?.email || 'Student'}</p>
                      </div>
                      <div className="p-2">
                        <Link
                          to="/student/profile"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors w-full"
                        >
                          <User size={14} /> My Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors w-full"
                        >
                          <LogOut size={14} /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-lg border border-bg-border text-text-secondary"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-bg-border bg-bg-surface"
            >
              <nav className="px-4 py-3 flex flex-col gap-1">
                {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                  <NavLink
                    key={href}
                    to={href}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkDefault}`}
                  >
                    <Icon size={15} />
                    {label}
                  </NavLink>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Page content ─────────────────────────────────────────────────────────── */}
      <main className="flex-1">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  )
}
