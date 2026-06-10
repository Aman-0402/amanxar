import { useState, useEffect, useCallback } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, LogIn } from 'lucide-react'
import { assetUrl } from '@utils/assetUrl'
import { navbarAPI } from '@services/api'
import MobileMenu from './MobileMenu'
import { navbarSlide } from '@animations/variants'

// ─── Active link styles ───────────────────────────────────────────────────────
const linkBase    = 'relative text-sm font-medium transition-colors duration-200 py-1 group'
const linkDefault = 'text-text-secondary hover:text-text-primary'
const linkActive  = 'text-text-primary'

export default function Navbar() {
  const [scrolled,       setScrolled]       = useState(false)
  const [mobileOpen,     setMobileOpen]     = useState(false)
  const [navLinks, setNavLinks] = useState([])
  const location = useLocation()

  useEffect(() => {
    const fetchNavLinks = async () => {
      try {
        const { data } = await navbarAPI.getAll()
        setNavLinks(data.sort((a, b) => a.order - b.order))
      } catch (err) {
        console.error('Failed to fetch navbar links:', err)
      }
    }
    fetchNavLinks()
  }, [])

  // ── Scroll detection ────────────────────────────────────────────────────────
  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // ── Close mobile menu on route change ───────────────────────────────────────
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  // ── Lock body scroll when mobile menu is open ───────────────────────────────
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <motion.header
        variants={navbarSlide}
        initial="hidden"
        animate="visible"
        className={[
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-bg-base/80 backdrop-blur-md border-b-3 border-text-primary/20 shadow-navbar'
            : 'bg-transparent',
        ].join(' ')}
      >
        <nav className="section-container flex h-16 items-center justify-between">

          {/* ── Logo ─────────────────────────────────────────────────────── */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
            aria-label="Aman Raj — Home"
          >
            {/* Logo image */}
            <div className="relative h-8 w-8 rounded-lg overflow-hidden shadow-glow-primary group-hover:shadow-glow-lg transition-shadow duration-300">
              <img
                src={assetUrl('/assets/images/Extra/logo.jpg')}
                alt="Aman Raj Logo"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="font-display font-bold text-base text-text-primary">
              Think With<span className="gradient-text"> Aman</span>
            </span>
          </Link>

          {/* ── Desktop Nav Links ─────────────────────────────────────────── */}
          <ul className="hidden lg:flex items-center gap-1" role="list">
            {navLinks.filter(l => !l.href?.includes('/ebooks')).map((link) => (
              <li key={link.href}>
                <NavLink
                  to={link.href}
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? linkActive : linkDefault} px-3 py-2 rounded-lg hover:bg-bg-elevated`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      {/* Animated underline indicator */}
                      <motion.span
                        className="absolute bottom-0 left-3 right-3 h-px bg-gradient-brand rounded-full"
                        initial={false}
                        animate={{ scaleX: isActive ? 1 : 0, opacity: isActive ? 1 : 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        style={{ transformOrigin: 'left' }}
                      />
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* ── Right Actions ─────────────────────────────────────────────── */}
          <div className="flex items-center gap-2">

            {/* Sign In */}
            <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }} className="hidden sm:block">
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-primary text-white text-sm font-medium hover:bg-brand-dark transition-colors duration-200 shadow-glow-primary hover:shadow-glow-lg"
              >
                <LogIn size={15} />
                <span>Sign In</span>
              </Link>
            </motion.div>

            {/* Mobile hamburger */}
            <motion.button
              onClick={() => setMobileOpen((prev) => !prev)}
              whileTap={{ scale: 0.92 }}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-bg-border bg-bg-surface text-text-secondary"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span
                    key="x"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X size={18} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu size={18} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </nav>
      </motion.header>

      {/* ── Mobile Menu ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <MobileMenu
            links={navLinks.filter(l => !l.href?.includes('/ebooks'))}
            onClose={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
