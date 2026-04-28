import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { Moon, Sun } from 'lucide-react'
import '../styles/globals.css'

export default function Intro() {
  const navigate = useNavigate()
  const { t, themeName, toggleTheme } = useTheme()
  const [phase, setPhase] = useState('logo')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('tagline'), 1500)
    const t2 = setTimeout(() => setPhase('buttons'), 2600)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const isLight = themeName === 'light'

  return (
    <div style={{
      minHeight: '100vh',
      background: isLight ? '#FFFFFF' : '#0F1419',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '20px',
    }}>
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'absolute', top: '16px', right: '16px',
          width: '40px', height: '40px', borderRadius: '50%',
          background: isLight ? '#F5F5F5' : '#1A1F2E',
          border: `1px solid ${isLight ? '#E5E5E5' : '#2A3141'}`,
          boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s ease',
        }}
        onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
      >
        {isLight ? <Moon size={18} strokeWidth={1.8} /> : <Sun size={18} strokeWidth={1.8} />}
      </button>

      {/* ── PHASE: LOGO ── */}
      <AnimatePresence>
        {phase === 'logo' && (
          <motion.div
            key="logo-only"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div style={{
              width: '60px', height: '60px',
              background: isLight ? '#1F2937' : '#FFFFFF',
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '28px', fontWeight: '800',
              color: isLight ? '#FFFFFF' : '#1F2937',
              letterSpacing: '-1px',
            }}>
              DR+
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PHASE: TAGLINE + BUTTONS ── */}
      {(phase === 'tagline' || phase === 'buttons') && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ textAlign: 'center', maxWidth: '560px', width: '100%' }}
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5, ease: 'easeOut' }}
            style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}
          >
            <div style={{
              width: '72px', height: '72px',
              background: isLight ? '#1F2937' : '#FFFFFF',
              borderRadius: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '36px', fontWeight: '800',
              color: isLight ? '#FFFFFF' : '#1F2937',
              letterSpacing: '-1.5px',
            }}>
              DR+
            </div>
          </motion.div>

          {/* Brand name */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{
              fontSize: '42px',
              fontWeight: '700',
              color: isLight ? '#1F2937' : '#FFFFFF',
              marginBottom: '10px',
              letterSpacing: '-0.8px',
              lineHeight: 1.1,
            }}
          >
            Dr Plus
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{
              color: isLight ? '#6B7280' : '#B5BCC8',
              fontSize: '16px',
              marginBottom: '40px',
              lineHeight: 1.5,
              fontWeight: '400',
            }}
          >
            Your health, simplified.<br />
            Smart care at your fingertips.
          </motion.p>

          {/* Feature pills - Minimal version */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '48px' }}
          >
            {[
              { label: 'Hospitals' },
              { label: 'Health' },
              { label: 'Wellness' },
              { label: 'Docs' },
            ].map(f => (
              <div key={f.label} style={{
                padding: '7px 14px',
                borderRadius: '20px',
                background: isLight ? '#F3F4F6' : '#1A1F2E',
                border: `1px solid ${isLight ? '#E5E7EB' : '#2A3141'}`,
                fontSize: '12px', color: isLight ? '#6B7280' : '#B5BCC8', fontWeight: '500',
              }}>
                {f.label}
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          {phase === 'buttons' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
              style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/register')}
                style={{
                  padding: '14px 40px',
                  borderRadius: '8px',
                  background: isLight ? '#1F2937' : '#FFFFFF',
                  border: 'none',
                  color: isLight ? '#FFFFFF' : '#1F2937',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.2)',
                  transition: 'all 0.2s ease',
                }}
              >
                Get Started
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/register?mode=login')}
                style={{
                  padding: '14px 40px',
                  borderRadius: '8px',
                  background: 'transparent',
                  border: `1.5px solid ${isLight ? '#E5E7EB' : '#2A3141'}`,
                  color: isLight ? '#1F2937' : '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Sign In
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
            position: 'absolute', bottom: '24px',
            color: isLight ? '#9CA3AF' : '#6B7280', fontSize: '11px', fontWeight: '400',
            letterSpacing: '0.3px',
          }}
        >
          Secure • Private • Fast
        </motion.p>
      )}
    </div>
  )
}
