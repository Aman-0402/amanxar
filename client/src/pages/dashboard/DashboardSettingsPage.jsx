import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Lock, Save, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { usersAPI } from '@services/api'
import { useAuth } from '@context/AuthContext'
import { fadeUp, staggerContainer } from '@animations/variants'

export default function DashboardSettingsPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState({ full_name: '', email: '', phone: '' })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileMsg, setProfileMsg] = useState(null)

  const [pw, setPw] = useState({ current_password: '', new_password: '', confirm: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMsg, setPwMsg] = useState(null)
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false })

  useEffect(() => {
    usersAPI.getProfile().then(({ data }) => {
      setProfile({ full_name: data.full_name || '', email: data.email || '', phone: data.phone || '' })
    }).catch(() => {})
  }, [])

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
