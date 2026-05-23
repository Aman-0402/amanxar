/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // ─── Color System ────────────────────────────────────────────
      colors: {
        bg: {
          base:     'var(--bg-base)',
          surface:  'var(--bg-surface)',
          elevated: 'var(--bg-elevated)',
          border:   'var(--bg-border)',
        },
        brand: {
          primary:   '#6366F1',
          secondary: '#22D3EE',
          dark:      '#4F46E5',
        },
        text: {
          primary:   'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted:     'var(--text-muted)',
          accent:    'var(--text-accent)',
        },
      },

      // ─── Typography ──────────────────────────────────────────────
      fontFamily: {
        display: ['"Space Grotesk"', '"Plus Jakarta Sans"', 'sans-serif'],
        body:    ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        accent:  ['"DM Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },

      fontSize: {
        'display-4xl': ['5.5rem',   { lineHeight: '1', letterSpacing: '-0.03em', fontWeight: '800' }],
        'display-3xl': ['4.5rem',   { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-2xl': ['3.75rem',  { lineHeight: '1.1',  letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-xl':  ['3rem',     { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '700' }],
        'display-lg':  ['2.25rem',  { lineHeight: '1.2',  letterSpacing: '-0.01em', fontWeight: '600' }],
        'display-md':  ['1.875rem', { lineHeight: '1.25', fontWeight: '600' }],
        'display-sm':  ['1.5rem',   { lineHeight: '1.3', fontWeight: '600' }],
        'display-xs':  ['1.25rem',  { lineHeight: '1.35', fontWeight: '600' }],

        'heading-xl':  ['2rem',     { lineHeight: '1.3', fontWeight: '700', letterSpacing: '-0.01em' }],
        'heading-lg':  ['1.75rem',  { lineHeight: '1.35', fontWeight: '600', letterSpacing: '-0.005em' }],
        'heading-md':  ['1.5rem',   { lineHeight: '1.4', fontWeight: '600' }],
        'heading-sm':  ['1.25rem',  { lineHeight: '1.45', fontWeight: '600' }],

        'body-xl':     ['1.125rem', { lineHeight: '1.6', letterSpacing: '0.3px' }],
        'body-lg':     ['1rem',     { lineHeight: '1.6', letterSpacing: '0.2px' }],
        'body-md':     ['0.95rem',  { lineHeight: '1.65' }],
        'body-sm':     ['0.875rem', { lineHeight: '1.5' }],
        'body-xs':     ['0.8125rem', { lineHeight: '1.5' }],
      },

      fontWeight: {
        thin:     '100',
        extralight: '200',
        light:    '300',
        normal:   '400',
        medium:   '500',
        semibold: '600',
        bold:     '700',
        extrabold: '800',
        black:    '900',
      },

      // ─── Spacing ──────────────────────────────────────────────────
      spacing: {
        'section':  '6rem',
        'section-sm': '4rem',
      },

      // ─── Max Width ────────────────────────────────────────────────
      maxWidth: {
        'content': '1280px',
        'prose-lg': '72ch',
      },

      // ─── Background Images ────────────────────────────────────────
      backgroundImage: {
        'gradient-brand':    'linear-gradient(135deg, #6366F1, #22D3EE)',
        'gradient-brand-v':  'linear-gradient(180deg, #6366F1, #22D3EE)',
        'gradient-dark':     'linear-gradient(135deg, #0A0A0F 0%, #1A1A25 100%)',
        'gradient-glow':     'radial-gradient(ellipse at top, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
        'gradient-glow-cyan':'radial-gradient(ellipse at bottom right, rgba(34, 211, 238, 0.1) 0%, transparent 60%)',
        'noise':             "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
      },

      // ─── Box Shadow ───────────────────────────────────────────────
      boxShadow: {
        'glow-primary': '0 0 30px rgba(99, 102, 241, 0.3)',
        'glow-cyan':    '0 0 30px rgba(34, 211, 238, 0.25)',
        'glow-lg':      '0 0 60px rgba(99, 102, 241, 0.2)',
        'card':         '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover':   '0 8px 48px rgba(0, 0, 0, 0.5)',
        'navbar':       '0 1px 0 rgba(255, 255, 255, 0.05)',
        'brutalism':    '4px 4px 0px rgba(0, 0, 0, 0.3)',
        'brutalism-lg': '6px 6px 0px rgba(0, 0, 0, 0.4)',
        'brutalism-inset': 'inset 2px 2px 0px rgba(0, 0, 0, 0.2)',
      },

      // ─── Animation ────────────────────────────────────────────────
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          from: { opacity: '0', transform: 'translateY(-12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' },
          '50%':       { boxShadow: '0 0 40px rgba(99, 102, 241, 0.6)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-8px)' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
      },

      animation: {
        'fade-in':    'fade-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'slide-down': 'slide-down 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'float':      'float 4s ease-in-out infinite',
        'spin-slow':  'spin-slow 12s linear infinite',
      },

      // ─── Backdrop Blur ────────────────────────────────────────────
      backdropBlur: {
        xs: '2px',
      },

      // ─── Border Width ─────────────────────────────────────────────
      borderWidth: {
        '3': '3px',
        '4': '4px',
      },

      // ─── Border Radius ────────────────────────────────────────────
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        'none': '0px',
        'sm': '2px',
        'md': '4px',
        'lg': '6px',
      },

      // ─── Transition ───────────────────────────────────────────────
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
