import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, FileText, MessageSquare, Settings, LogOut, User } from 'lucide-react'
import { useAuth } from '@context/AuthContext'
import { assetUrl } from '@utils/assetUrl'

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', icon: Home },
  { label: 'Projects', href: '/dashboard/projects', icon: FileText },
  { label: 'About', href: '/dashboard/about', icon: User },
  { label: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardSidebar({ onClose }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  // Close sidebar only on mobile (screen < 768px)
  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      onClose && onClose()
    }
  }

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      exit={{ x: -280 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 h-screen w-64 bg-bg-surface border-r border-bg-border flex flex-col z-50 md:static md:z-auto"
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-bg-border">
        <Link
          to="/dashboard"
          onClick={handleNavClick}
          className="flex items-center gap-3 group"
        >
          <div className="h-10 w-10 rounded-lg overflow-hidden shadow-glow-primary">
            <img
              src={assetUrl('/assets/images/Extra/logo.jpg')}
              alt="Logo"
              className="h-full w-full object-cover"
            />
          </div>
          <span className="font-display font-bold text-lg text-text-primary">
            Aman<span className="gradient-text">.ai</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = location.pathname === href || (href === '/dashboard' && location.pathname === '/dashboard')
          return (
            <Link
              key={href}
              to={href}
              onClick={handleNavClick}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-brand-primary/15 text-brand-primary'
                  : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
              }`}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout Button */}
      <div className="border-t border-bg-border p-4">
        <button
          onClick={() => {
            handleNavClick()
            handleLogout()
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-text-secondary hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </motion.aside>
  )
}
