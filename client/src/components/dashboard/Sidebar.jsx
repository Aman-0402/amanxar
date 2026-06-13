import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Home, FileText, MessageSquare, Settings, LogOut, User, Users,
  BookOpen, Compass, Image, Briefcase, Menu, X, ClipboardList,
  ChevronDown, ChevronRight, Layers,
} from 'lucide-react'
import { useAuth } from '@context/AuthContext'
import { assetUrl } from '@utils/assetUrl'

const MAIN_ITEMS = [
  { label: 'Overview',      href: '/dashboard',               icon: Home          },
  { label: 'Users',         href: '/dashboard/users',         icon: Users         },
  { label: 'Messages',      href: '/dashboard/messages',      icon: MessageSquare },
  { label: 'Courses',       href: '/dashboard/ebooks',        icon: BookOpen      },
  { label: 'Assessments',   href: '/dashboard/assessments',   icon: ClipboardList },
  { label: 'Projects',      href: '/dashboard/projects',      icon: FileText      },
  { label: 'Services',      href: '/dashboard/services',      icon: Briefcase     },
  { label: 'Gallery',       href: '/dashboard/gallery',       icon: Image         },
  { label: 'Knowledge Hub', href: '/dashboard/knowledge-hub', icon: Compass       },
]

const CONTENT_ITEMS = [
  { label: 'About',         href: '/dashboard/about',         icon: User          },
  { label: 'Skills',        href: '/dashboard/skills',        icon: Layers        },
  { label: 'Tech Stack',    href: '/dashboard/tech-stack',    icon: Layers        },
  { label: 'Timeline',      href: '/dashboard/timeline',      icon: Layers        },
  { label: 'Navbar & Footer',href: '/dashboard/navbar-footer',icon: Menu          },
]

function NavLink({ href, icon: Icon, label, onClick, isActive }) {
  return (
    <Link
      to={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
        isActive
          ? 'bg-brand-primary/15 text-brand-primary'
          : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
      }`}
    >
      <Icon size={17} />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )
}

export default function DashboardSidebar({ onClose }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [contentOpen, setContentOpen] = useState(
    CONTENT_ITEMS.some(i => location.pathname.startsWith(i.href))
  )

  const handleLogout = () => { logout(); navigate('/', { replace: true }) }
  const handleNavClick = () => onClose?.()

  const isActive = (href) =>
    href === '/dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname.startsWith(href)

  return (
    <aside className="h-screen w-64 bg-bg-surface border-r border-bg-border flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-bg-border flex items-center justify-between shrink-0">
        <Link to="/" onClick={handleNavClick} className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl overflow-hidden shadow-glow-primary shrink-0">
            <img src={assetUrl('/assets/images/Extra/logo.png')} alt="Logo" className="h-full w-full object-cover" />
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
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {MAIN_ITEMS.map(({ label, href, icon }) => (
          <NavLink
            key={href}
            href={href}
            icon={icon}
            label={label}
            onClick={handleNavClick}
            isActive={isActive(href)}
          />
        ))}

        {/* Collapsible Content section */}
        <div className="pt-1">
          <button
            onClick={() => setContentOpen(o => !o)}
            className="w-full flex items-center justify-between px-4 py-2 text-[11px] font-semibold text-text-muted uppercase tracking-widest hover:text-text-primary transition-colors"
          >
            <span>Site Content</span>
            {contentOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </button>
          {contentOpen && (
            <div className="space-y-1 mt-1">
              {CONTENT_ITEMS.map(({ label, href, icon }) => (
                <NavLink
                  key={href}
                  href={href}
                  icon={icon}
                  label={label}
                  onClick={handleNavClick}
                  isActive={isActive(href)}
                />
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Bottom: Settings + Logout */}
      <div className="border-t border-bg-border p-4 space-y-1">
        <NavLink
          href="/dashboard/settings"
          icon={Settings}
          label="Settings"
          onClick={handleNavClick}
          isActive={isActive('/dashboard/settings')}
        />
        <button
          onClick={() => { handleNavClick(); handleLogout() }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-text-secondary hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
        >
          <LogOut size={17} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}
