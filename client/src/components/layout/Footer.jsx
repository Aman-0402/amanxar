import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Github, Linkedin, Twitter, Youtube, Mail, ArrowUpRight } from 'lucide-react'
import { fadeUp, staggerContainer } from '@animations/variants'
import { assetUrl } from '@utils/assetUrl'
import { viewport } from '@animations/transitions'
import { footerSectionsAPI, footerCTAAPI, socialLinksAPI } from '@services/api'

const ICON_MAP = {
  Github,
  Linkedin,
  Twitter,
  Youtube,
  Mail,
}

export default function Footer() {
  const [footerSections, setFooterSections] = useState([])
  const [footerCTA, setFooterCTA] = useState(null)
  const [socialLinks, setSocialLinks] = useState([])
  const year = new Date().getFullYear()

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const [sectionsRes, ctaRes, socialsRes] = await Promise.all([
          footerSectionsAPI.getAll(),
          footerCTAAPI.getAll(),
          socialLinksAPI.getAll(),
        ])
        setFooterSections(sectionsRes.data.sort((a, b) => a.order - b.order))
        setFooterCTA(ctaRes.data[0] || null)
        setSocialLinks(socialsRes.data.sort((a, b) => a.order - b.order))
      } catch (err) {
        console.error('Failed to fetch footer data:', err)
      }
    }
    fetchFooterData()
  }, [])

  return (
    <footer className="relative overflow-hidden border-t border-bg-border bg-bg-surface">

      {/* ── Ambient glow background ─────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-brand-primary/5 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-brand-secondary/5 blur-3xl" />
      </div>

      {/* ── CTA Band ────────────────────────────────────────────────────────── */}
      {footerCTA && (
        <div className="relative border-b border-bg-border">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            className="section-container flex flex-col items-center gap-4 py-10 text-center sm:flex-row sm:justify-between sm:text-left"
          >
            <motion.div variants={fadeUp} className="space-y-1">
              <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-text-muted sm:justify-start">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
                {footerCTA.badge_text}
              </p>
              <h2 className="font-display text-xl font-bold text-text-primary sm:text-2xl">
                {footerCTA.heading}
              </h2>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Link
                to={footerCTA.button_url}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-glow-primary transition-all duration-200 hover:bg-brand-dark hover:shadow-glow-lg"
              >
                {footerCTA.button_text}
                <ArrowUpRight size={14} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      )}

      {/* ── Main Footer Grid ─────────────────────────────────────────────────── */}
      <div className="relative section-container py-12">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]"
        >

          {/* Brand column — full width on mobile */}
          <motion.div variants={fadeUp} className="col-span-2 lg:col-span-1 space-y-5">

            {/* Logo with 3D tilt */}
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <motion.div
                className="h-10 w-10 rounded-xl overflow-hidden shadow-glow-primary"
                whileHover={{ rotateY: 25, rotateX: -10, scale: 1.08 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{ transformPerspective: 600 }}
              >
                <img
                  src={assetUrl('/assets/images/Extra/logo.jpg')}
                  alt="Aman Raj Logo"
                  className="h-full w-full object-cover"
                />
              </motion.div>
              <span className="font-display font-bold text-xl text-text-primary">
                Aman<span className="gradient-text">.ai</span>
              </span>
            </Link>

            <p className="text-sm text-text-secondary leading-relaxed max-w-xs">
              Full-Stack MERN Developer, AI/ML Engineer &amp; Technical Trainer.
              Building intelligent products and sharing knowledge with developers worldwide.
            </p>

            {/* Social icons with 3D hover */}
            <div className="flex items-center gap-2">
              {socialLinks.map(({ id, icon_name, url, platform }) => {
                const Icon = ICON_MAP[icon_name]
                return Icon ? (
                  <motion.a
                    key={id}
                    href={url}
                    target={url.startsWith('mailto') ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    aria-label={platform}
                    whileHover={{ rotateY: 20, rotateX: -10, scale: 1.15, y: -3 }}
                    whileTap={{ scale: 0.92 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                    style={{ transformPerspective: 500 }}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-bg-border bg-bg-elevated text-text-muted hover:text-brand-primary hover:border-brand-primary/40 hover:bg-brand-primary/8 transition-colors duration-200"
                  >
                    <Icon size={15} />
                  </motion.a>
                ) : null
              })}
            </div>

            {/* Available badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-bg-border bg-bg-elevated px-3 py-1.5 text-xs text-text-secondary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              Available for freelance projects
            </div>
          </motion.div>

          {/* Link columns */}
          {footerSections.map((section) => (
            <motion.div key={section.id} variants={fadeUp}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-text-muted">
                {section.title}
              </h3>
              <ul className="space-y-3" role="list">
                {section.links?.map((link) => (
                  <li key={link.id}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target={link.href.startsWith('mailto') ? undefined : '_blank'}
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-1 text-sm text-text-secondary hover:text-brand-primary transition-colors duration-200"
                      >
                        {link.label}
                        <ArrowUpRight
                          size={11}
                          className="opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200"
                        />
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-sm text-text-secondary hover:text-brand-primary transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ── Bottom Bar ───────────────────────────────────────────────────────── */}
      <div className="relative border-t border-bg-border">
        <div className="section-container flex flex-col items-center gap-2 py-5 text-center sm:flex-row sm:justify-between sm:text-left">

          <p className="text-xs text-text-muted">
            © {year}{' '}
            <Link
              to="/login"
              className="hover:text-brand-primary transition-colors duration-200"
            >
              Aman Raj
            </Link>
            . All rights reserved.
          </p>

          <p className="text-xs text-text-muted">
            Built with React, Vite &amp; TailwindCSS
          </p>

          <div className="flex items-center gap-4">
            <a
              href="https://aman-0402.github.io/My-Portfolio/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-text-muted hover:text-brand-primary transition-colors"
            >
              Portfolio
            </a>
            <Link
              to="/contact"
              className="text-xs text-text-muted hover:text-brand-primary transition-colors"
            >
              Hire Me
            </Link>
          </div>

        </div>
      </div>
    </footer>
  )
}
