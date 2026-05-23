import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Sparkles, Briefcase, Code2, Users, Zap, Mail } from 'lucide-react'
import PageLayout from '@components/layout/PageLayout'
import { fadeUp, staggerContainer } from '@animations/variants'
import { viewport } from '@animations/transitions'
import { projectsAPI, servicesAPI } from '@services/api'
import ProjectPreviewCard from '@components/home/ProjectPreviewCard'
import ServicePeekCard from '@components/home/ServicePeekCard'

// ─── Particle Network Canvas ──────────────────────────────────────────────────
// Runs entirely on native Canvas 2D API — zero React re-renders during animation.
function ParticleCanvas({ mouseRef }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let W = 0, H = 0, rafId

    const resize = () => {
      W = canvas.width  = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // Particle pool
    const N = 75
    const CONNECT_D2 = 130 * 130   // squared to avoid sqrt in hot loop
    const MOUSE_R    = 160
    const FORCE      = 0.011

    const pts = Array.from({ length: N }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.38,
      vy: (Math.random() - 0.5) * 0.38,
      r:  Math.random() * 1.5 + 0.5,
    }))

    const loop = () => {
      ctx.clearRect(0, 0, W, H)
      const { x: mx, y: my } = mouseRef.current

      // Update particles
      for (const p of pts) {
        const ddx = p.x - mx
        const ddy = p.y - my
        const d2  = ddx * ddx + ddy * ddy
        if (d2 < MOUSE_R * MOUSE_R && d2 > 0) {
          const d = Math.sqrt(d2)
          const f = (1 - d / MOUSE_R) * FORCE
          p.vx += (ddx / d) * f
          p.vy += (ddy / d) * f
        }
        p.vx *= 0.99; p.vy *= 0.99
        p.x  += p.vx; p.y  += p.vy
        if (p.x < 0) { p.x = 0; p.vx =  Math.abs(p.vx) }
        if (p.x > W) { p.x = W; p.vx = -Math.abs(p.vx) }
        if (p.y < 0) { p.y = 0; p.vy =  Math.abs(p.vy) }
        if (p.y > H) { p.y = H; p.vy = -Math.abs(p.vy) }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(99,102,241,0.55)'
        ctx.fill()
      }

      // Connections — single batched stroke call for GPU efficiency
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(99,102,241,0.18)'
      ctx.lineWidth   = 0.7
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = pts[i].x - pts[j].x
          const dy = pts[i].y - pts[j].y
          if (dx * dx + dy * dy < CONNECT_D2) {
            ctx.moveTo(pts[i].x, pts[i].y)
            ctx.lineTo(pts[j].x, pts[j].y)
          }
        }
      }
      ctx.stroke()

      rafId = requestAnimationFrame(loop)
    }
    loop()

    return () => { cancelAnimationFrame(rafId); ro.disconnect() }
  }, [mouseRef])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}

// ─── Custom Cursor ────────────────────────────────────────────────────────────
// Ring lags (spring stiffness 100), dot snaps instantly (stiffness 800).
function CustomCursor() {
  const mx = useMotionValue(-200)
  const my = useMotionValue(-200)

  const ringX = useSpring(mx, { stiffness: 100, damping: 15 })
  const ringY = useSpring(my, { stiffness: 100, damping: 15 })
  const dotX  = useSpring(mx, { stiffness: 800, damping: 40 })
  const dotY  = useSpring(my, { stiffness: 800, damping: 40 })

  useEffect(() => {
    const move = (e) => { mx.set(e.clientX); my.set(e.clientY) }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [mx, my])

  return (
    <>
      {/* Outer trailing ring */}
      <motion.div
        className="fixed top-0 left-0 z-[9999] pointer-events-none"
        style={{ x: ringX, y: ringY, marginLeft: -20, marginTop: -20 }}
      >
        <div className="w-10 h-10 rounded-full border border-brand-primary/50" />
      </motion.div>

      {/* Inner snap dot */}
      <motion.div
        className="fixed top-0 left-0 z-[9999] pointer-events-none"
        style={{ x: dotX, y: dotY, marginLeft: -3, marginTop: -3 }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shadow-glow-primary" />
      </motion.div>
    </>
  )
}

// ─── Static data ──────────────────────────────────────────────────────────────
const ROLES = ['Full-Stack Developer', 'AI/ML Engineer', 'Technical Trainer']

const TECH = [
  { label: 'React',      color: '#61DAFB' },
  { label: 'Python',     color: '#3776AB' },
  { label: 'FastAPI',    color: '#009688' },
  { label: 'TensorFlow', color: '#FF6F00' },
  { label: 'TypeScript', color: '#3178C6' },
  { label: 'Docker',     color: '#2496ED' },
  { label: 'Next.js',    color: '#94A3B8' },
  { label: 'PostgreSQL', color: '#336791' },
]

// ─── HomePage ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const sectionRef = useRef(null)
  const mouseRef   = useRef({ x: -999, y: -999 })

  // Featured content state
  const [featuredProjects, setFeaturedProjects] = useState([])
  const [topServices, setTopServices] = useState([])

  // Normalized mouse position (-0.5 → 0.5) for tilt + orbs
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // 3D tilt — spring-smoothed
  const tiltXBase = useTransform(mouseY, [-0.5, 0.5], [7, -7])
  const tiltYBase = useTransform(mouseX, [-0.5, 0.5], [-7, 7])
  const tiltX = useSpring(tiltXBase, { stiffness: 180, damping: 28 })
  const tiltY = useSpring(tiltYBase, { stiffness: 180, damping: 28 })

  // Parallax orbs — different lag factors for depth illusion
  const orb1XBase = useTransform(mouseX, [-0.5, 0.5], [-55, 55])
  const orb1YBase = useTransform(mouseY, [-0.5, 0.5], [-38, 38])
  const orb2XBase = useTransform(mouseX, [-0.5, 0.5], [38, -38])
  const orb2YBase = useTransform(mouseY, [-0.5, 0.5], [28, -28])
  const orb1X = useSpring(orb1XBase, { stiffness: 28, damping: 18 })
  const orb1Y = useSpring(orb1YBase, { stiffness: 28, damping: 18 })
  const orb2X = useSpring(orb2XBase, { stiffness: 20, damping: 16 })
  const orb2Y = useSpring(orb2YBase, { stiffness: 20, damping: 16 })

  // Hide native cursor + feed mouse to canvas and tilt systems
  useEffect(() => {
    document.body.style.cursor = 'none'

    const onMove = (e) => {
      const rect = sectionRef.current?.getBoundingClientRect()
      if (!rect) return
      // Absolute coords for canvas repel
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      // Normalized coords for tilt / orbs
      mouseX.set((e.clientX - rect.left) / rect.width  - 0.5)
      mouseY.set((e.clientY - rect.top)  / rect.height - 0.5)
    }
    const onLeave = () => {
      mouseRef.current = { x: -999, y: -999 }
      mouseX.set(0); mouseY.set(0)
    }

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)
    return () => {
      document.body.style.cursor = ''
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [mouseX, mouseY])

  // Fetch featured projects
  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      try {
        const { data } = await projectsAPI.getAll()
        const featured = data.filter((p) => p.featured).slice(0, 2)
        setFeaturedProjects(featured)
      } catch (err) {
        console.error('Failed to fetch featured projects:', err)
      }
    }
    fetchFeaturedProjects()
  }, [])

  // Fetch top services
  useEffect(() => {
    const fetchTopServices = async () => {
      try {
        const { data } = await servicesAPI.getAll()
        const sorted = data.sort((a, b) => (a.order || 0) - (b.order || 0)).slice(0, 3)
        setTopServices(sorted)
      } catch (err) {
        console.error('Failed to fetch top services:', err)
      }
    }
    fetchTopServices()
  }, [])

  return (
    <PageLayout path="/" withTopPadding={false}>
      <CustomCursor />

      <section
        ref={sectionRef}
        className="relative flex min-h-screen items-center justify-center overflow-hidden"
        style={{ background: 'var(--bg-base)' }}
      >
        {/* ── Layer 1 : dot grid ──────────────────────────────────────────────── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.09) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* ── Layer 2 : particle network ──────────────────────────────────────── */}
        <ParticleCanvas mouseRef={mouseRef} />

        {/* ── Layer 3 : radial glow overlays ─────────────────────────────────── */}
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-glow-cyan pointer-events-none" />

        {/* ── Layer 4 : parallax orbs ─────────────────────────────────────────── */}
        <motion.div
          className="absolute w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.13) 0%, transparent 70%)',
            x: orb1X, y: orb1Y,
            top: '-5%', left: '10%',
          }}
        />
        <motion.div
          className="absolute w-[550px] h-[550px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(34,211,238,0.10) 0%, transparent 70%)',
            x: orb2X, y: orb2Y,
            bottom: '5%', right: '5%',
          }}
        />

        {/* ── Layer 5 : 3-D tilt content ──────────────────────────────────────── */}
        <motion.div
          style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 1200 }}
          className="relative z-10 w-full"
        >
          <div className="section-container text-center">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-7 max-w-2xl mx-auto"
            >

              {/* Heading */}
              <motion.h1
                variants={fadeUp}
                className="text-display-hero"
              >
                Hi, I'm{' '}
                <span className="gradient-text relative inline-block">
                  Aman Raj
                  {/* Animated underline */}
                  <motion.span
                    className="absolute -bottom-2 left-0 h-1.5 w-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #6366f1, #22d3ee)' }}
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.9, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  />
                </span>
              </motion.h1>

              {/* Role row */}
              <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-x-4 gap-y-1">
                {ROLES.map((role, i) => (
                  <span key={role} className="flex items-center gap-2 text-body-xl font-medium text-text-secondary">
                    {i > 0 && <span className="text-brand-primary/40 select-none">·</span>}
                    {role}
                  </span>
                ))}
              </motion.div>

              {/* Tech stack pills */}
              <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-2">
                {TECH.map((t, i) => (
                  <motion.span
                    key={t.label}
                    className="glass px-3 py-1 rounded-full text-xs font-medium text-text-secondary inline-flex items-center gap-1.5"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.1 + i * 0.06, duration: 0.3 }}
                    whileHover={{ scale: 1.12, y: -3, transition: { duration: 0.18 } }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: t.color }} />
                    {t.label}
                  </motion.span>
                ))}
              </motion.div>

              {/* CTA buttons */}
              <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4 pt-2">
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/projects"
                    className="flex items-center gap-2 rounded-lg border-3 border-brand-primary bg-brand-primary px-7 py-3.5 text-sm font-semibold text-white hover:bg-brand-dark transition-all offset-shadow"
                  >
                    View Projects <ArrowRight size={14} />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/contact"
                    className="flex items-center gap-2 rounded-lg border-3 border-text-primary px-7 py-3.5 text-sm font-medium text-text-primary hover:text-brand-primary transition-all offset-shadow"
                  >
                    <Sparkles size={14} /> Let's Connect
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* ── Scroll hint ──────────────────────────────────────────────────────── */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.4, duration: 0.6 }}
        >
          <motion.div
            className="w-px h-8 origin-top rounded-full"
            style={{ background: 'linear-gradient(to bottom, #6366f1, transparent)' }}
            animate={{ scaleY: [0, 1, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.4 }}
          />
        </motion.div>
      </section>

      {/* ── Stats Row ────────────────────────────────────────────────────────────── */}
      <section className="section-container section-padding">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="grid gap-8 sm:grid-cols-3"
        >
          <motion.div variants={fadeUp} className="text-center">
            <div className="flex justify-center mb-3">
              <Briefcase size={32} className="text-brand-primary" />
            </div>
            <p className="text-3xl font-bold text-text-primary mb-1">5+</p>
            <p className="text-sm text-text-secondary">Years Building</p>
          </motion.div>

          <motion.div variants={fadeUp} className="text-center">
            <div className="flex justify-center mb-3">
              <Code2 size={32} className="text-brand-primary" />
            </div>
            <p className="text-3xl font-bold text-text-primary mb-1">30+</p>
            <p className="text-sm text-text-secondary">Projects Shipped</p>
          </motion.div>

          <motion.div variants={fadeUp} className="text-center">
            <div className="flex justify-center mb-3">
              <Users size={32} className="text-brand-primary" />
            </div>
            <p className="text-3xl font-bold text-text-primary mb-1">20+</p>
            <p className="text-sm text-text-secondary">Happy Clients</p>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Featured Work ─────────────────────────────────────────────────────────── */}
      {featuredProjects.length > 0 && (
        <section className="section-container section-padding">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            className="mb-12"
          >
            <h2 className="font-display text-display-lg font-bold text-text-primary mb-3">
              Featured Work
            </h2>
            <p className="text-body-lg text-text-secondary font-normal">Showcase of recent projects and achievements</p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            className="grid gap-6 lg:grid-cols-2 mb-8"
          >
            {featuredProjects.map((project) => (
              <ProjectPreviewCard key={project.id} project={project} />
            ))}
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            className="text-center"
          >
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 rounded-lg border-3 border-brand-primary bg-brand-primary px-8 py-3 text-sm font-semibold text-white hover:bg-brand-dark transition-all offset-shadow hover:translate-y-1"
            >
              View All Projects <ArrowRight size={14} />
            </Link>
          </motion.div>
        </section>
      )}

      {/* ── Services Peek ─────────────────────────────────────────────────────────── */}
      {topServices.length > 0 && (
        <section className="section-container section-padding bg-bg-surface border-y border-text-primary/10">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            className="mb-12"
          >
            <h2 className="font-display text-display-lg font-bold text-text-primary mb-3">
              What I Offer
            </h2>
            <p className="text-body-lg text-text-secondary font-normal">Services designed to bring your ideas to life</p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            className="grid gap-6 sm:grid-cols-3 mb-8"
          >
            {topServices.map((service) => (
              <ServicePeekCard key={service.id} service={service} />
            ))}
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            className="text-center"
          >
            <Link
              to="/services"
              className="inline-flex items-center gap-2 rounded-lg border-3 border-brand-primary bg-brand-primary px-8 py-3 text-sm font-semibold text-white hover:bg-brand-dark transition-all offset-shadow hover:translate-y-1"
            >
              Explore Services <ArrowRight size={14} />
            </Link>
          </motion.div>
        </section>
      )}

      {/* ── CTA Band ──────────────────────────────────────────────────────────────── */}
      <section className="section-container section-padding border-t-3 border-text-primary">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="text-center space-y-6 max-w-2xl mx-auto"
        >
          <h2 className="font-display text-display-lg font-bold text-text-primary">
            Ready to work together?
          </h2>
          <p className="text-body-lg text-text-secondary font-normal">
            Have a project in mind or want to discuss ideas? Let's talk and create something amazing.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-lg border-3 border-brand-primary bg-brand-primary px-8 py-3 text-sm font-semibold text-white hover:bg-brand-dark transition-all offset-shadow hover:translate-y-1"
            >
              Start a Project <Zap size={14} />
            </Link>
            <a
              href="mailto:think.like.ai.aman@gmail.com"
              className="inline-flex items-center gap-2 rounded-lg border-3 border-text-primary px-8 py-3 text-sm font-semibold text-text-primary hover:text-brand-primary transition-all offset-shadow hover:translate-y-1"
            >
              Get in Touch <Mail size={14} />
            </a>
          </div>
        </motion.div>
      </section>
    </PageLayout>
  )
}
