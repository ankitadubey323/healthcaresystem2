import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

export default function DoctorLogin() {
  const navigate = useNavigate()
  const { t, themeName, toggleTheme } = useTheme()
  const isLight = themeName === 'light'

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/doctor/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Login failed')

      localStorage.setItem('doctorToken', data.token)
      localStorage.setItem('doctorInfo', JSON.stringify(data.doctor))

      navigate('/doctor/dashboard')
    } catch (err) {
      setError(err.message || 'Login error occurred')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: `1px solid ${t.border}`,
    background: t.surface,
    color: t.text,
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  }

  const labelStyle = {
    fontSize: '11px',
    fontWeight: '600',
    color: t.textMuted,
    marginBottom: '6px',
    display: 'block',
    letterSpacing: '0.2px',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: t.pageBg,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px 16px',
    }}>
      {/* Theme toggle */}
      <button onClick={toggleTheme} style={{
        position: 'fixed', top: '16px', right: '16px', zIndex: 100,
        width: '36px', height: '36px', borderRadius: '50%',
        background: t.surface, border: `1px solid ${t.border}`,
        boxShadow: t.shadow, cursor: 'pointer',
        fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: t.text,
      }}>
        {isLight ? '☀' : '☾'}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: '420px',
          background: t.surface,
          borderRadius: '16px',
          padding: '36px 24px',
          boxShadow: t.shadow,
          border: `1px solid ${t.border}`,
        }}
      >
        {/* Back button */}
        <button
          onClick={() => navigate('/register')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '12px', color: t.textMuted, fontWeight: '600',
            marginBottom: '20px', padding: 0, fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}
        >
          ← Back
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '32px', fontWeight: '800', color: t.primary, marginBottom: '8px' }}>
            DR+
          </div>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: '#10B98115',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', margin: '0 auto 12px',
          }}>
            👨‍⚕️
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: t.text, marginBottom: '6px' }}>
            Doctor Sign In
          </h2>
          <p style={{ fontSize: '12px', color: t.textMuted, lineHeight: 1.5 }}>
            Sign in to your account
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: t.errorBg,
            border: `1px solid ${t.errorBorder}`,
            borderRadius: '10px', padding: '11px 14px',
            color: t.error, fontSize: '12px', marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            <div>
              <label style={labelStyle}>Email Address</label>
              <input
                style={inputStyle}
                name="email"
                type="email"
                placeholder="doctor@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  style={{ ...inputStyle, paddingRight: '48px' }}
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '11px', fontWeight: '600', color: t.textMuted,
                    fontFamily: 'inherit',
                  }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.01 } : {}}
              whileTap={!loading ? { scale: 0.99 } : {}}
              style={{
                padding: '13px',
                borderRadius: '10px', border: 'none',
                background: loading ? t.surfaceAlt : '#10B981',
                color: loading ? t.textMuted : '#fff',
                fontWeight: '700', fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '4px', fontFamily: 'inherit',
                transition: 'all 0.2s ease',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </motion.button>

            <p style={{ textAlign: 'center', fontSize: '12px', color: t.textMuted }}>
              Registered nahi hai?{' '}
              <span
                onClick={() => navigate('/doctor/register')}
                style={{ color: t.primary, fontWeight: '600', cursor: 'pointer' }}
              >
                Register as Doctor
              </span>
            </p>

          </div>
        </form>
      </motion.div>
    </div>
  )
}
