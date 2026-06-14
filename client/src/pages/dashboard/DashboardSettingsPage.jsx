import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Lock, Save, Eye, EyeOff, CheckCircle, Share2, Plus, Trash2, Edit2, X } from 'lucide-react'
import { usersAPI, socialLinksAPI } from '@services/api'
import { useAuth } from '@context/AuthContext'
import { fadeUp, staggerContainer } from '@animations/variants'

const PLATFORM_OPTIONS = [
  { value: 'GitHub',    icon: 'Github'   },
  { value: 'LinkedIn',  icon: 'Linkedin' },
  { value: 'Twitter',   icon: 'Twitter'  },
  { value: 'YouTube',   icon: 'Youtube'  },
  { value: 'Email',     icon: 'Mail'     },
  { value: 'Instagram', icon: 'Instagram'},
  { value: 'Facebook',  icon: 'Facebook' },
]

const EMPTY_LINK = { platform: 'GitHub', icon_name: 'Github', url: '', order: 0 }

export default function DashboardSettingsPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState({ full_name: '', email: '', phone: '' })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileMsg, setProfileMsg] = useState(null)

  // Social links state
  const [socialLinks, setSocialLinks] = useState([])
  const [socialLoading, setSocialLoading] = useState(false)
  const [editingLink, setEditingLink] = useState(null) // null | 'new' | { id, ...fields }
  const [linkForm, setLinkForm] = useState(EMPTY_LINK)
  const [socialMsg, setSocialMsg] = useState(null)

  const [pw, setPw] = useState({ current_password: '', new_password: '', confirm: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMsg, setPwMsg] = useState(null)
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false })

  useEffect(() => {
    usersAPI.getProfile().then(({ data }) => {
      setProfile({ full_name: data.full_name || '', email: data.email || '', phone: data.phone || '' })
    }).catch(() => {})

    socialLinksAPI.getAll().then(({ data }) => {
      setSocialLinks([...data].sort((a, b) => a.order - b.order))
    }).catch(() => {})
  }, [])

  const openNewLink = () => {
    setLinkForm(EMPTY_LINK)
    setEditingLink('new')
    setSocialMsg(null)
  }

  const openEditLink = (link) => {
    setLinkForm({ platform: link.platform, icon_name: link.icon_name, url: link.url, order: link.order })
    setEditingLink(link)
    setSocialMsg(null)
  }

  const cancelEditLink = () => {
    setEditingLink(null)
    setSocialMsg(null)
  }

  const handlePlatformChange = (platform) => {
    const opt = PLATFORM_OPTIONS.find(o => o.value === platform)
    setLinkForm(f => ({ ...f, platform, icon_name: opt?.icon || platform }))
  }

  const handleSaveLink = async (e) => {
    e.preventDefault()
    setSocialLoading(true)
    setSocialMsg(null)
    try {
      if (editingLink === 'new') {
        const { data } = await socialLinksAPI.create(linkForm)
        setSocialLinks(prev => [...prev, data].sort((a, b) => a.order - b.order))
      } else {
        const { data } = await socialLinksAPI.update(editingLink.id, linkForm)
        setSocialLinks(prev => prev.map(l => l.id === editingLink.id ? data : l).sort((a, b) => a.order - b.order))
      }
      setEditingLink(null)
      setSocialMsg({ type: 'success', text: 'Social link saved.' })
    } catch {
      setSocialMsg({ type: 'error', text: 'Failed to save link.' })
    } finally {
      setSocialLoading(false)
    }
  }

  const handleDeleteLink = async (id) => {
    if (!window.confirm('Delete this social link?')) return
    try {
      await socialLinksAPI.delete(id)
      setSocialLinks(prev => prev.filter(l => l.id !== id))
    } catch {
      setSocialMsg({ type: 'error', text: 'Failed to delete link.' })
    }
  }

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileMsg(null)
    try {
      await usersAPI.updateProfile({ full_name: profile.full_name, email: profile.email, phone: profile.phone })
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' })
    } catch {
      setProfileMsg({ type: 'error', text: 'Failed to update profile.' })
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPwMsg(null)
    if (pw.new_password !== pw.confirm) {
      setPwMsg({ type: 'error', text: 'New passwords do not match.' })
      return
    }
    setPwLoading(true)
    try {
      await usersAPI.changePassword({ current_password: pw.current_password, new_password: pw.new_password })
      setPwMsg({ type: 'success', text: 'Password changed. Logging out in 2 seconds…' })
      setPw({ current_password: '', new_password: '', confirm: '' })
      setTimeout(() => { logout(); navigate('/login', { replace: true }) }, 2000)
    } catch (err) {
      setPwMsg({ type: 'error', text: err?.response?.data?.detail || 'Failed to change password.' })
    } finally {
      setPwLoading(false)
    }
  }

  const inputClass = 'w-full rounded-xl border border-bg-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all'

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-8 max-w-xl">

      <motion.div variants={fadeUp}>
        <h1 className="font-display text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary text-sm mt-1">Manage your profile and account security.</p>
      </motion.div>

      {/* Profile */}
      <motion.div variants={fadeUp} className="rounded-2xl border border-bg-border bg-bg-surface p-6 space-y-5">
        <div className="flex items-center gap-2 text-text-primary font-semibold">
          <User size={16} className="text-brand-primary" /> Profile Information
        </div>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-text-muted font-medium uppercase tracking-wide">Full Name</label>
            <input
              className={inputClass}
              value={profile.full_name}
              onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
              placeholder="Your full name"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-text-muted font-medium uppercase tracking-wide">Email</label>
            <input
              type="email"
              className={inputClass}
              value={profile.email}
              onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
              placeholder="your@email.com"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-text-muted font-medium uppercase tracking-wide">Phone</label>
            <input
              className={inputClass}
              value={profile.phone}
              onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
              placeholder="+91 00000 00000"
            />
          </div>
          {profileMsg && (
            <p className={`text-sm flex items-center gap-1.5 ${profileMsg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {profileMsg.type === 'success' && <CheckCircle size={14} />}
              {profileMsg.text}
            </p>
          )}
          <button
            type="submit"
            disabled={profileLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-primary/90 disabled:opacity-60 transition-all"
          >
            <Save size={14} /> {profileLoading ? 'Saving…' : 'Save Profile'}
          </button>
        </form>
      </motion.div>

      {/* Social Media Links */}
      <motion.div variants={fadeUp} className="rounded-2xl border border-bg-border bg-bg-surface p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-text-primary font-semibold">
            <Share2 size={16} className="text-brand-primary" /> Social Media Links
          </div>
          <button
            onClick={openNewLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-primary/10 text-brand-primary text-xs font-semibold hover:bg-brand-primary/20 transition-all"
          >
            <Plus size={13} /> Add Link
          </button>
        </div>

        {/* Existing links list */}
        <div className="space-y-2">
          {socialLinks.length === 0 && !editingLink && (
            <p className="text-sm text-text-muted">No social links yet. Add one above.</p>
          )}
          {socialLinks.map((link) => (
            <div key={link.id} className="flex items-center justify-between gap-3 rounded-xl border border-bg-border bg-bg-elevated px-4 py-2.5">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-semibold text-brand-primary w-20 shrink-0">{link.platform}</span>
                <span className="text-sm text-text-secondary truncate">{link.url}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => openEditLink(link)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-brand-primary hover:bg-brand-primary/10 transition-all"
                  title="Edit"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => handleDeleteLink(link.id)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-all"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add / Edit form */}
        {editingLink && (
          <form onSubmit={handleSaveLink} className="space-y-3 border-t border-bg-border pt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-text-primary">
                {editingLink === 'new' ? 'New Social Link' : 'Edit Social Link'}
              </span>
              <button type="button" onClick={cancelEditLink} className="text-text-muted hover:text-text-primary">
                <X size={15} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-text-muted font-medium uppercase tracking-wide">Platform</label>
                <select
                  className={inputClass}
                  value={linkForm.platform}
                  onChange={e => handlePlatformChange(e.target.value)}
                >
                  {PLATFORM_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.value}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-text-muted font-medium uppercase tracking-wide">Order</label>
                <input
                  type="number"
                  className={inputClass}
                  value={linkForm.order}
                  onChange={e => setLinkForm(f => ({ ...f, order: Number(e.target.value) }))}
                  min={0}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-text-muted font-medium uppercase tracking-wide">URL</label>
              <input
                type="url"
                className={inputClass}
                value={linkForm.url}
                onChange={e => setLinkForm(f => ({ ...f, url: e.target.value }))}
                placeholder="https://github.com/username"
                required
              />
            </div>
            <button
              type="submit"
              disabled={socialLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-primary/90 disabled:opacity-60 transition-all"
            >
              <Save size={14} /> {socialLoading ? 'Saving…' : 'Save Link'}
            </button>
          </form>
        )}

        {socialMsg && (
          <p className={`text-sm flex items-center gap-1.5 ${socialMsg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            {socialMsg.type === 'success' && <CheckCircle size={14} />}
            {socialMsg.text}
          </p>
        )}
      </motion.div>

      {/* Password */}
      <motion.div variants={fadeUp} className="rounded-2xl border border-bg-border bg-bg-surface p-6 space-y-5">
        <div className="flex items-center gap-2 text-text-primary font-semibold">
          <Lock size={16} className="text-brand-primary" /> Change Password
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {[
            { key: 'current_password', label: 'Current Password',  show: 'current' },
            { key: 'new_password',     label: 'New Password',       show: 'new'     },
            { key: 'confirm',          label: 'Confirm New Password',show: 'confirm' },
          ].map(({ key, label, show }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-xs text-text-muted font-medium uppercase tracking-wide">{label}</label>
              <div className="relative">
                <input
                  type={showPw[show] ? 'text' : 'password'}
                  className={inputClass + ' pr-10'}
                  value={pw[key]}
                  onChange={e => setPw(p => ({ ...p, [key]: e.target.value }))}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => ({ ...s, [show]: !s[show] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPw[show] ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          ))}
          {pwMsg && (
            <p className={`text-sm flex items-center gap-1.5 ${pwMsg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {pwMsg.type === 'success' && <CheckCircle size={14} />}
              {pwMsg.text}
            </p>
          )}
          <button
            type="submit"
            disabled={pwLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-primary/90 disabled:opacity-60 transition-all"
          >
            <Lock size={14} /> {pwLoading ? 'Changing…' : 'Change Password'}
          </button>
        </form>
      </motion.div>

    </motion.div>
  )
}
