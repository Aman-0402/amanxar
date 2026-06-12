import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, FileText, MessageSquare, Settings, LogOut, User, Users, BookOpen, Compass, Image, Briefcase, Menu, X, LayoutDashboard } from 'lucide-react'
import { useAuth } from '@context/AuthContext'
import { assetUrl } from '@utils/assetUrl'

const NAV_ITEMS = [
  { label: 'Overview',      href: '/dashboard',              icon: Home        },
  { label: 'Users',         href: '/dashboard/users',        icon: Users       },
  { label: 'Projects',      href: '/dashboard/projects',     icon: FileText    },
  { label: 'Courses',       href: '/dashboard/ebooks',       icon: BookOpen    },
  { label: 'About',         href: '/dashboard/about',        icon: User        },
  { label: 'Skills',        href: '/dashboard/skills',       icon: FileText    },
  { label: 'Tech Stack',    href: '/dashboard/tech-stack',   icon: FileText    },
  { label: 'Timeline',      href: '/dashboard/timeline',     icon: FileText    },
  { label: 'Messages',      href: '/dashboard/messages',     icon: MessageSquare },
  { label: 'Knowledge Hub', href: '/dashboard/knowledge-hub',icon: Compass     },
  { label: 'Gallery',       href: '/dashboard/gallery',      icon: Image       },
  { label: 'Services',      href: '/dashboard/services',     icon: Briefcase   },
  { label: 'Navbar & Footer',href: '/dashboard/navbar-footer',icon: Menu       },
  { label: 'Settings',      href: '/dashboard/settings',     icon: Settings    },
]

export default function DashboardSidebar({ onClose }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  const handleNavClick = () => onClose?.()

  return (
    <aside className="h-screen w-64 bg-bg-surface border-r border-bg-border flex flex-col">
      {/* Logo Section */}
      <div className="p-5 border-b border-bg-border flex items-center justify-between shrink-0">
        <Link to="/" onClick={handleNavClick} className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl overflow-hidden shadow-glow-primary shrink-0">
            <img src={assetUrl('/assets/images/Extra/logo.jpg')} alt="Logo" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0">
            <span className="font-display font-bold text-sm text-text-primary leading-tight block">
              Think With<span className="gradient-text"> Aman</span>
            </span>
            <span className="text-[10px] text-text-muted uppercase tracking-widest">Admin Panel</span>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors shrink-0"
          >
            <X size={15} />
          </button>
        )}
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
    </aside>
  )
}
