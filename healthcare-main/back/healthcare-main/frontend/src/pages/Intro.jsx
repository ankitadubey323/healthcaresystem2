import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

export default function Intro() {
  const navigate = useNavigate()
  const { t, themeName, toggleTheme } = useTheme()
  const [phase, setPhase] = useState('logo')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('tagline'), 1800)
    const t2 = setTimeout(() => setPhase('buttons'), 3000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const isLight = themeName === 'light'

  return (
    <div style={{
      minHeight: '100vh',
      background: t.pageBg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '20px',
    }}>
      {/* Decorative blobs */}
      <div style={{
        position: 'absolute', top: '-15%', left: '-10%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: isLight
          ? 'radial-gradient(circle, rgba(102,126,234,0.12) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(129,140,248,0.10) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-15%', right: '-10%',
        width: '600px', height: '600px', borderRadius: '50%',
        background: isLight
          ? 'radial-gradient(circle, rgba(118,75,162,0.10) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(167,139,250,0.09) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '40%', right: '8%',
        width: '200px', height: '200px', borderRadius: '50%',
        background: isLight
          ? 'radial-gradient(circle, rgba(79,172,254,0.09) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(96,165,250,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'absolute', top: '24px', right: '24px',
          width: '44px', height: '44px', borderRadius: '50%',
          background: t.surface,
          border: `1px solid ${t.border}`,
          boxShadow: t.shadow,
          cursor: 'pointer',
          fontSize: '20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s ease',
        }}
      >
        {isLight ? '🌙' : '☀️'}
      </button>

      {/* ── PHASE: LOGO ── */}
      <AnimatePresence>
        {phase === 'logo' && (
          <motion.div
            key="logo-only"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ fontSize: '100px', lineHeight: 1 }}
          >
            🩺
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PHASE: TAGLINE + BUTTONS ── */}
      {(phase === 'tagline' || phase === 'buttons') && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{ textAlign: 'center', maxWidth: '560px', width: '100%' }}
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ fontSize: '80px', marginBottom: '12px', lineHeight: 1 }}
          >
            🩺
          </motion.div>

          {/* Brand name */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            style={{
              fontSize: 'clamp(36px, 8vw, 60px)',
              fontWeight: '900',
              background: t.primaryGrad,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '12px',
              letterSpacing: '-1.5px',
              lineHeight: 1.1,
            }}
          >
            Health AI
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{
              color: t.textSub,
              fontSize: 'clamp(15px, 3vw, 19px)',
              marginBottom: '48px',
              lineHeight: 1.6,
              fontWeight: '400',
            }}
          >
            Your Personal AI Health Companion —<br />
            track, learn, and live healthier every day.
          </motion.p>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '48px' }}
          >
            {[
              { icon: '🏥', label: 'Find Hospitals' },
              { icon: '💧', label: 'Track Hydration' },
              { icon: '🧘', label: 'Wellness Plans' },
              { icon: '📁', label: 'Medical Docs' },
            ].map(f => (
              <div key={f.label} style={{
                padding: '8px 16px',
                borderRadius: '40px',
                background: t.surface,
                border: `1px solid ${t.border}`,
                boxShadow: t.shadow,
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '13px', color: t.textSub, fontWeight: '600',
              }}>
                <span>{f.icon}</span> {f.label}
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          {phase === 'buttons' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 12px 32px rgba(102,126,234,0.45)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/register')}
                style={{
                  padding: '15px 44px',
                  borderRadius: '50px',
                  background: t.primaryGrad,
                  border: 'none',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(102,126,234,0.4)',
                  letterSpacing: '0.3px',
                }}
              >
                Get Started →
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/register?mode=login')}
                style={{
                  padding: '15px 44px',
                  borderRadius: '50px',
                  background: t.surface,
                  border: `2px solid ${t.borderStrong}`,
                  color: t.primary,
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: t.shadow,
                }}
              >
                Login
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Bottom tagline */}
      {phase === 'buttons' && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{
            position: 'absolute', bottom: '28px',
            color: t.textLight, fontSize: '12px', fontWeight: '500',
          }}
        >
          Trusted by thousands • Secure & Private • AI-Powered
        </motion.p>
      )}
    </div>
  )
}
